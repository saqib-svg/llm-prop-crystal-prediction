from __future__ import annotations

from typing import Any

import torch

from worker.app.core.base_predictor import BasePredictor
from worker.app.core.model_paths import MODEL_PATHS, TOKENIZER_PATHS
from worker.app.services.bandgap.model_loader import ModelBundle, load_model_bundle
from worker.app.services.bandgap.utils import finite_prediction
from worker.app.shared.preprocessing.text import normalize_text
from worker.app.shared.schemas.prediction import PropertyPrediction
from worker.app.shared.validation.text import validate_non_empty_text


class BandGapService(BasePredictor):
    name = "band_gap"

    def __init__(self, device: str | None = None) -> None:
        self.requested_device = device
        self.bundle: ModelBundle | None = None

    @property
    def device(self) -> torch.device | str:
        return self.bundle.device if self.bundle else "unloaded"

    def load_model(self) -> None:
        if self.bundle is None:
            self.bundle = load_model_bundle(
                model_file=MODEL_PATHS["band_gap"],
                tokenizer_dir=TOKENIZER_PATHS["band_gap"],
                device=self.requested_device
            )

    def get_metadata(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "ready": self.bundle is not None,
            "device": str(self.device),
            "max_length": self.bundle.max_length if self.bundle else None,
            "model_path": str(MODEL_PATHS["band_gap"]),
        }

    def validate_input(self, input_data: str) -> str:
        return validate_non_empty_text(normalize_text(input_data))

    def predict(self, input_data: str) -> PropertyPrediction:
        if self.bundle is None:
            self.load_model()

        if self.bundle is None:
            raise RuntimeError("Bandgap model is not loaded.")

        cleaned_text = self.validate_input(input_data)
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
        return PropertyPrediction(
            value=prediction,
            unit="eV"
        )
