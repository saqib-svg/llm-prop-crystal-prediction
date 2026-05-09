from __future__ import annotations

from typing import Annotated, Any, Literal

from pydantic import BaseModel, Field, field_validator

from worker.app.core.config import get_settings


MAX_TEXT_LENGTH = get_settings().max_text_length


class PredictRequest(BaseModel):
    model: Literal["bandgap", "density", "conductivity", "stability"] = "bandgap"
    input: Annotated[str, Field(min_length=1, max_length=MAX_TEXT_LENGTH)]

    @field_validator("input")
    @classmethod
    def normalize_input(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("input is required")
        return normalized


class PredictResponse(BaseModel):
    model: str
    prediction: str = "Predicted Material"
    band_gap: float | None = None
    value: float
    unit: str
    metadata: dict[str, Any] = Field(default_factory=dict)


class HealthResponse(BaseModel):
    status: str
    models: dict[str, dict[str, Any]]
