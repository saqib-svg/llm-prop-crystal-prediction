from typing import Any

from worker.app.shared.schemas.prediction import PredictionResponse


class PredictionOrchestrator:
    def __init__(self, registry: dict[str, Any]) -> None:
        self.registry = registry

    def load_all(self) -> None:
        """Eagerly load all models. Optional since models should lazy load on predict."""
        for predictor in self.registry.values():
            predictor.load_model()

    def predict(self, input_data: str, predictors: list[str] | None = None) -> PredictionResponse:
        """
        Run predictors and merge their results into a single PredictionResponse.
        If `predictors` is None, runs a default set (e.g. all or just 'band_gap').
        """
        if predictors is None:
            predictors = ["band_gap"]

        properties = {}
        metadata = {}

        for p_name in predictors:
            if p_name not in self.registry:
                raise ValueError(f"Unknown predictor: {p_name}")

            predictor = self.registry[p_name]
            result = predictor.predict(input_data)
            properties[p_name] = result

            # Merge metadata minimally
            p_metadata = predictor.get_metadata()
            metadata[p_name] = p_metadata

        return PredictionResponse(properties=properties, metadata=metadata)
