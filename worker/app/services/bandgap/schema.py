from __future__ import annotations

from typing import Annotated, Any

from pydantic import BaseModel, Field

from worker.app.core.config import get_settings


MAX_TEXT_LENGTH = get_settings().max_text_length


class BandGapRequest(BaseModel):
    text: Annotated[str, Field(min_length=1, max_length=MAX_TEXT_LENGTH)]


class BandGapResponse(BaseModel):
    model: str = "bandgap"
    prediction: float
    unit: str = "eV"
    metadata: dict[str, Any] = Field(default_factory=dict)


class BatchBandGapRequest(BaseModel):
    texts: Annotated[list[str], Field(min_length=1, max_length=100)]


class BatchBandGapItem(BaseModel):
    index: int
    text: str
    prediction: float | None = None
    unit: str = "eV"
    error: str | None = None


class BatchBandGapResponse(BaseModel):
    model: str = "bandgap"
    results: list[BatchBandGapItem]
    total: int
    succeeded: int
    failed: int
