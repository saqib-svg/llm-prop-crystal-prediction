from __future__ import annotations

from typing import Annotated, Any

from pydantic import BaseModel, Field

from worker.app.core.config import get_settings


MAX_TEXT_LENGTH = get_settings().max_text_length


class PredictRequest(BaseModel):
    model: str = "bandgap"
    input: Annotated[str, Field(min_length=1, max_length=MAX_TEXT_LENGTH)]


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
