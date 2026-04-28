from __future__ import annotations

import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import torch
import torch.nn as nn
from transformers import AutoTokenizer, AutoConfig, AutoModel

logger = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_MODEL_PATH = PROJECT_ROOT / "models" / "best_bandgap_model.pt"
DEFAULT_TOKENIZER_DIR = PROJECT_ROOT / "models" / "tokenizer"


@dataclass(frozen=True)
class ModelBundle:
    model: nn.Module
    tokenizer: Any
    device: torch.device
    max_length: int


class BandGapModel(nn.Module):
    """Exact replica of the trained model architecture:
    DistilRoBERTa → Mean Pooling → Dropout → Linear(768→256) → ReLU → Dropout → Linear(256→1)
    """

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
    model_path: str | Path = DEFAULT_MODEL_PATH,
    tokenizer_dir: str | Path = DEFAULT_TOKENIZER_DIR,
    device: str | None = None,
) -> ModelBundle:
    model_file = Path(model_path)
    tokenizer_path = Path(tokenizer_dir)

    if not model_file.exists():
        raise FileNotFoundError(f"Model weights not found: {model_file}")
    if not tokenizer_path.exists():
        raise FileNotFoundError(f"Tokenizer directory not found: {tokenizer_path}")

    resolved_device = torch.device(device or ("cuda" if torch.cuda.is_available() else "cpu"))

    logger.info("Loading tokenizer from %s", tokenizer_path)
    tokenizer = AutoTokenizer.from_pretrained(tokenizer_path, local_files_only=True, use_fast=True)

    logger.info("Loading model weights from %s", model_file)
    state_dict: dict[str, torch.Tensor] = torch.load(
        model_file, map_location="cpu", weights_only=False
    )
    if not isinstance(state_dict, dict):
        raise RuntimeError("Unexpected checkpoint format: expected a state dict.")

    # Infer config from tokenizer dir (distilroberta-base saved alongside weights)
    config = AutoConfig.from_pretrained(tokenizer_path, local_files_only=True)

    model = BandGapModel(config)
    missing, unexpected = model.load_state_dict(state_dict, strict=False)
    if missing:
        logger.warning("Missing keys when loading state dict: %s", missing)
    if unexpected:
        logger.warning("Unexpected keys when loading state dict: %s", unexpected)

    model.to(resolved_device)
    model.eval()

    max_length = min(int(getattr(tokenizer, "model_max_length", 256) or 256), 256)
    logger.info(
        "Model ready: hidden_size=%s device=%s max_length=%s",
        config.hidden_size,
        resolved_device,
        max_length,
    )

    return ModelBundle(
        model=model,
        tokenizer=tokenizer,
        device=resolved_device,
        max_length=max_length,
    )
