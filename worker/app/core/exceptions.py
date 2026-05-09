class ModelNotFoundError(ValueError):
    """Raised when a requested model is not registered."""


class ModelUnavailableError(RuntimeError):
    """Raised when a registered model cannot serve predictions."""


class PredictionError(RuntimeError):
    """Raised when inference fails after request validation."""
