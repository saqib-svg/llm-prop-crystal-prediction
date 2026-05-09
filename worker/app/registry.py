from __future__ import annotations

from collections.abc import Callable

from worker.app.core.config import Settings
from worker.app.core.exceptions import ModelNotFoundError
from worker.app.services.bandgap import BandGapService
from worker.app.shared.inference.base import BaseModelService


ServiceFactory = Callable[[Settings], BaseModelService]


def _bandgap_factory(settings: Settings) -> BaseModelService:
    return BandGapService(settings.bandgap, settings.device)


MODEL_REGISTRY: dict[str, ServiceFactory] = {
    "bandgap": _bandgap_factory,
}


class ModelRegistry:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self._services: dict[str, BaseModelService] = {}

    def names(self) -> list[str]:
        return sorted(MODEL_REGISTRY)

    def get(self, name: str) -> BaseModelService:
        key = name.strip().lower()
        if key not in MODEL_REGISTRY:
            raise ModelNotFoundError(f"Unknown model: {name}")
        if key not in self._services:
            self._services[key] = MODEL_REGISTRY[key](self.settings)
        return self._services[key]

    def load_all(self) -> None:
        for name in MODEL_REGISTRY:
            self.get(name).load()

    def status(self) -> dict[str, dict]:
        statuses = {}
        for name in MODEL_REGISTRY:
            service = self._services.get(name)
            statuses[name] = service.status() if service else {"name": name, "ready": False}
        return statuses
