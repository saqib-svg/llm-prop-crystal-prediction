from __future__ import annotations

import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable

import torch
import torch.nn as nn
from transformers import AutoConfig, AutoModel, RobertaConfig

try:
    from safetensors.torch import load_file as load_safetensors
except ImportError:  # pragma: no cover
    load_safetensors = None

from worker.app.core.base_predictor import BasePredictor
from worker.app.core.exceptions import PredictorInferenceError, PredictorLoadError, PredictorValidationError
from worker.app.services.bandgap.tokenizer import load_tokenizer
from worker.app.services.bandgap.utils import finite_prediction
from worker.app.shared.preprocessing.text import normalize_text
from worker.app.shared.schemas.prediction import PropertyPrediction
from worker.app.shared.validation.text import validate_non_empty_text

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class ModelBundle:
    model: nn.Module
    tokenizer: Any
    device: torch.device
    max_length: int


class RegressionModel(nn.Module):
    def __init__(self, config: Any) -> None:
        super().__init__()
        self.backbone = AutoModel.from_config(config)
        hidden = config.hidden_size
        self.dropout = nn.Dropout(0.1)
        self.regressor = nn.Sequential(
            nn.Linear(hidden, 256),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(256, 1),
        )

    @staticmethod
    def _mean_pool(last_hidden_state: torch.Tensor, attention_mask: torch.Tensor) -> torch.Tensor:
        mask = attention_mask.unsqueeze(-1).expand(last_hidden_state.size()).float()
        summed = torch.sum(last_hidden_state * mask, dim=1)
        counts = torch.clamp(mask.sum(dim=1), min=1e-9)
        return summed / counts

    def forward(
        self,
        input_ids: torch.Tensor,
        attention_mask: torch.Tensor | None = None,
        **kwargs: Any,
    ) -> torch.Tensor:
        out = self.backbone(input_ids=input_ids, attention_mask=attention_mask)
        pooled = self._mean_pool(out.last_hidden_state, attention_mask)
        pooled = self.dropout(pooled)
        pred = self.regressor(pooled)
        return pred.squeeze(-1)


def load_model_bundle(
    model_file: Path,
    tokenizer_dir: Path | None,
    max_length: int = 256,
    device: str | None = None,
) -> ModelBundle:
    if not model_file.exists():
        raise FileNotFoundError(f"Model weights not found: {model_file}")
    if tokenizer_dir is None:
        raise FileNotFoundError("Tokenizer directory is not configured.")

    resolved_device = torch.device(device or ("cuda" if torch.cuda.is_available() else "cpu"))
    tokenizer = load_tokenizer(tokenizer_dir)

    logger.info("Loading regression tokenizer path=%s", tokenizer_dir)
    logger.info("Loading regression weights path=%s", model_file)

    if model_file.suffix == ".safetensors":
        if load_safetensors is None:
            raise ImportError(
                "The safetensors package is required to load .safetensors model weights."
            )
        state_dict = load_safetensors(str(model_file), device="cpu")
    else:
        state_dict = torch.load(
            model_file,
            map_location="cpu",
            weights_only=False,
        )
    if not isinstance(state_dict, dict):
        raise RuntimeError("Unexpected checkpoint format: expected a state dict.")

    try:
        config = AutoConfig.from_pretrained(tokenizer_dir, local_files_only=True)
    except Exception:
        try:
            config = AutoConfig.from_pretrained("roberta-base", local_files_only=True)
        except Exception:
            config = RobertaConfig(
                vocab_size=getattr(tokenizer, "vocab_size", 50265),
                hidden_size=768,
                num_attention_heads=12,
                num_hidden_layers=6,
                max_position_embeddings=514,
            )

    model = RegressionModel(config)
    missing, unexpected = model.load_state_dict(state_dict, strict=False)
    if missing:
        logger.warning("Missing regression state dict keys=%s", missing)
    if unexpected:
        logger.warning("Unexpected regression state dict keys=%s", unexpected)

    model.to(resolved_device)
    model.eval()

    max_length_val = min(int(getattr(tokenizer, "model_max_length", max_length) or max_length), max_length)
    logger.info("Regression model ready device=%s max_length=%s", resolved_device, max_length_val)

    return ModelBundle(
        model=model,
        tokenizer=tokenizer,
        device=resolved_device,
        max_length=max_length_val,
    )


class TextRegressionService(BasePredictor):
    def __init__(
        self,
        name: str,
        model_file: Path,
        tokenizer_dir: Path | None,
        version: str,
        unit: str = "eV",
        max_length: int = 256,
        device: str | None = None,
        value_formatter: Callable[[float], str | float] | None = None,
    ) -> None:
        self.name = name
        self.version = version
        self.model_file = model_file
        self.tokenizer_dir = tokenizer_dir
        self.unit = unit
        self.max_length = max_length
        self.requested_device = device
        self.value_formatter = value_formatter
        self.bundle: ModelBundle | None = None

    @property
    def device(self) -> torch.device | str:
        return self.bundle.device if self.bundle else "unloaded"

    def load_model(self) -> None:
        if self.bundle is None:
            try:
                self.bundle = load_model_bundle(
                    model_file=self.model_file,
                    tokenizer_dir=self.tokenizer_dir,
                    max_length=self.max_length,
                    device=self.requested_device,
                )
            except Exception as exc:
                raise PredictorLoadError(f"Failed to load {self.name} predictor: {exc}") from exc

    def get_metadata(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "version": self.version,
            "ready": self.bundle is not None,
            "device": str(self.device),
            "max_length": self.bundle.max_length if self.bundle else None,
            "model_path": str(self.model_file),
        }

    def load(self) -> None:
        self.load_model()

    def status(self) -> dict[str, Any]:
        return self.get_metadata()

    def validate_input(self, input_data: str) -> str:
        try:
            return validate_non_empty_text(normalize_text(input_data))
        except ValueError as exc:
            raise PredictorValidationError(str(exc)) from exc

    def _format_value(self, raw_value: float) -> float | str:
        if self.value_formatter is not None:
            return self.value_formatter(raw_value)
        return finite_prediction(raw_value)

    def predict(self, input_data: str) -> PropertyPrediction:
        if self.bundle is None:
            self.load_model()

        if self.bundle is None:
            raise PredictorLoadError(f"Model {self.name} is not loaded.")

        cleaned_text = self.validate_input(input_data)
        try:
            encoding = self.bundle.tokenizer(
                cleaned_text,
                return_tensors="pt",
                truncation=True,
                padding="max_length",
                max_length=self.bundle.max_length,
            )
        except Exception as exc:
            raise PredictorInferenceError(f"Failed to tokenize input: {exc}") from exc

        model_inputs = {key: value.to(self.bundle.device) for key, value in encoding.items()}

        try:
            with torch.no_grad():
                prediction_tensor = self.bundle.model(**model_inputs)
        except Exception as exc:
            raise PredictorInferenceError(f"Inference failed for {self.name}: {exc}") from exc

        try:
            raw_prediction = float(prediction_tensor.item())
        except Exception as exc:
            raise PredictorInferenceError(f"Invalid output for {self.name}: {exc}") from exc

        value = self._format_value(raw_prediction)
        confidence = None
        if self.value_formatter is not None and isinstance(value, str):
            probability = 1 / (1 + torch.exp(-torch.tensor(raw_prediction))).item()
            confidence = float(probability)

        return PropertyPrediction(value=value, unit=self.unit if isinstance(value, float) else None, confidence=confidence)
