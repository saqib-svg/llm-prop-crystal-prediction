from __future__ import annotations

import math
import re
import unicodedata

import torch

from model_loader import ModelBundle


class BandGapPredictor:
    def __init__(self, bundle: ModelBundle) -> None:
        self.model = bundle.model
        self.tokenizer = bundle.tokenizer
        self.device = bundle.device
        self.max_length = bundle.max_length

    @staticmethod
    def clean_text(text: str) -> str:
        normalized = unicodedata.normalize("NFKC", text)
        normalized = re.sub(r"\s+", " ", normalized).strip()
        return normalized

    def predict(self, text: str) -> float:
        cleaned_text = self.clean_text(text)
        if not cleaned_text:
            raise ValueError("Text input cannot be empty.")

        encoding = self.tokenizer(
            cleaned_text,
            return_tensors="pt",
            truncation=True,
            padding="max_length",
            max_length=self.max_length,
        )
        model_inputs = {key: value.to(self.device) for key, value in encoding.items()}

        with torch.no_grad():
            prediction_tensor = self.model(**model_inputs)

        prediction = float(prediction_tensor.item())
        if not math.isfinite(prediction):
            raise RuntimeError("Model returned a non-finite prediction.")

        return round(prediction, 4)
