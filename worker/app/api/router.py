from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException, Request

from worker.app.api.routes import bandgap, conductivity, density, health, stability
from worker.app.api.schemas import PredictRequest, PredictResponse
from worker.app.core.exceptions import ModelNotFoundError
from worker.app.registry import ModelRegistry

logger = logging.getLogger(__name__)

router = APIRouter()
router.include_router(health.router)
router.include_router(bandgap.router)
router.include_router(density.router)
router.include_router(conductivity.router)
router.include_router(stability.router)


@router.post("/predict", response_model=PredictResponse)
def predict(request: Request, payload: PredictRequest) -> PredictResponse:
    registry: ModelRegistry = request.app.state.registry

    try:
        service = registry.get(payload.model)
        result = service.predict(payload.input)
    except ModelNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Unified prediction failed model=%s", payload.model)
        raise HTTPException(status_code=500, detail="Prediction failed.") from exc

    return PredictResponse(
        model=result.model,
        band_gap=result.value if result.model == "bandgap" else None,
        value=result.value,
        unit=result.unit,
        metadata=result.metadata,
    )
