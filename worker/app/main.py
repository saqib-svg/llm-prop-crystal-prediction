from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from worker.app.api.router import router
from worker.app.core.config import get_settings
from worker.app.core.logger import configure_logging, get_logger
from worker.app.registry import ModelRegistry

configure_logging()
logger = get_logger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting model worker version=%s", settings.api_version)
    registry = ModelRegistry(settings)
    registry.load_all()
    logger.info("Model status %s", registry.status())
    app.state.registry = registry
    try:
        yield
    finally:
        logger.info("Shutting down model worker")


app = FastAPI(
    title=settings.app_name,
    version=settings.api_version,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
