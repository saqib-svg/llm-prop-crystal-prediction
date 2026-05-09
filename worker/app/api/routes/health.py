from __future__ import annotations

from fastapi import APIRouter, Request

from worker.app.api.schemas import HealthResponse
from worker.app.registry import ModelRegistry

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
def health(request: Request) -> HealthResponse:
    registry: ModelRegistry = request.app.state.registry
    return HealthResponse(status="ok", models=registry.status())


@router.get("/models/status")
def model_status(request: Request) -> dict:
    registry: ModelRegistry = request.app.state.registry
    return {"models": registry.status()}
