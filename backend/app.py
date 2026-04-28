from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from backend.model_loader import load_model_bundle
from backend.predictor import BandGapPredictor

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
MODEL_PATH = os.getenv("MODEL_PATH", "models/best_bandgap_model.pt")
TOKENIZER_DIR = os.getenv("TOKENIZER_DIR", "models/tokenizer")
DEVICE = os.getenv("MODEL_DEVICE")
MAX_TEXT_LENGTH = int(os.getenv("MAX_TEXT_LENGTH", "5000"))
DEFAULT_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")

logging.basicConfig(
    level=LOG_LEVEL,
    format="%(asctime)s %(levelname)s %(name)s - %(message)s",
)
logger = logging.getLogger("bandgap-api")


def _parse_origins(raw_origins: str) -> list[str]:
    return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]


class PredictRequest(BaseModel):
    text: Annotated[str, Field(min_length=1, max_length=MAX_TEXT_LENGTH)]


class PredictResponse(BaseModel):
    prediction: float
    unit: str = "eV"


class BatchPredictRequest(BaseModel):
    texts: Annotated[list[str], Field(min_length=1, max_length=100)]


class BatchPredictItem(BaseModel):
    index: int
    text: str
    prediction: float | None = None
    unit: str = "eV"
    error: str | None = None


class BatchPredictResponse(BaseModel):
    results: list[BatchPredictItem]
    total: int
    succeeded: int
    failed: int


class HealthResponse(BaseModel):
    status: str
    model_ready: bool
    device: str


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting band gap API")
    bundle = load_model_bundle(model_path=MODEL_PATH, tokenizer_dir=TOKENIZER_DIR, device=DEVICE)
    app.state.predictor = BandGapPredictor(bundle)
    logger.info("Model and tokenizer loaded successfully")
    try:
        yield
    finally:
        logger.info("Shutting down band gap API")


app = FastAPI(
    title="Band Gap Prediction API",
    version="1.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_parse_origins(DEFAULT_ORIGINS),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
def health(request: Request) -> HealthResponse:
    predictor = getattr(request.app.state, "predictor", None)
    return HealthResponse(
        status="ok",
        model_ready=predictor is not None,
        device=str(getattr(predictor, "device", "unknown")),
    )


@app.post("/predict-bandgap", response_model=PredictResponse)
def predict_bandgap(request: Request, payload: PredictRequest) -> PredictResponse:
    predictor: BandGapPredictor | None = getattr(request.app.state, "predictor", None)
    if predictor is None:
        raise HTTPException(status_code=503, detail="Model is not ready yet.")

    try:
        prediction = predictor.predict(payload.text)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Prediction failed")
        raise HTTPException(status_code=500, detail="Prediction failed.") from exc

    return PredictResponse(prediction=prediction, unit="eV")


@app.post("/batch-predict", response_model=BatchPredictResponse)
def batch_predict(request: Request, payload: BatchPredictRequest) -> BatchPredictResponse:
    """Run inference on a batch of material descriptions (max 100 texts per request)."""
    predictor: BandGapPredictor | None = getattr(request.app.state, "predictor", None)
    if predictor is None:
        raise HTTPException(status_code=503, detail="Model is not ready yet.")

    results: list[BatchPredictItem] = []
    succeeded = 0
    failed = 0

    for i, text in enumerate(payload.texts):
        try:
            pred = predictor.predict(text)
            results.append(BatchPredictItem(index=i, text=text, prediction=pred, unit="eV"))
            succeeded += 1
        except Exception as exc:
            logger.warning("Batch item %d failed: %s", i, exc)
            results.append(BatchPredictItem(index=i, text=text, error=str(exc)))
            failed += 1

    return BatchPredictResponse(
        results=results,
        total=len(payload.texts),
        succeeded=succeeded,
        failed=failed,
    )
