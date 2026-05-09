from __future__ import annotations

from typing import Any

import torch

from worker.app.core.config import ModelConfig
from worker.app.services.bandgap.model_loader import ModelBundle, load_model_bundle
from worker.app.services.bandgap.utils import finite_prediction
from worker.app.shared.inference.base import BaseModelService, PredictionResult
from worker.app.shared.preprocessing.text import normalize_text
from worker.app.shared.validation.text import validate_non_empty_text


class BandGapService(BaseModelService):
    name = "bandgap"

    def __init__(self, config: ModelConfig, device: str | None = None) -> None:
        self.config = config
        self.requested_device = device
        self.bundle: ModelBundle | None = None

    @property
    def device(self) -> torch.device | str:
        return self.bundle.device if self.bundle else "unloaded"

    def load(self) -> None:
        if self.bundle is None:
            self.bundle = load_model_bundle(self.config, self.requested_device)

    def status(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "ready": self.bundle is not None,
            "device": str(self.device),
            "batch_size": self.config.batch_size,
            "max_length": self.config.max_length,
            "model_path": str(self.config.model_path),
        }

    def predict(self, model_input: str) -> PredictionResult:
        if self.bundle is None:
            self.load()

        if self.bundle is None:
            raise RuntimeError("Bandgap model is not loaded.")

        cleaned_text = validate_non_empty_text(normalize_text(model_input))
        encoding = self.bundle.tokenizer(
            cleaned_text,
            return_tensors="pt",
            truncation=True,
            padding="max_length",
            max_length=self.bundle.max_length,
        )
        model_inputs = {key: value.to(self.bundle.device) for key, value in encoding.items()}

        with torch.no_grad():
            prediction_tensor = self.bundle.model(**model_inputs)

        prediction = finite_prediction(float(prediction_tensor.item()))
        return PredictionResult(
            model=self.name,
            value=prediction,
            unit="eV",
            metadata={"input_length": len(cleaned_text), "device": str(self.bundle.device)},
        )
