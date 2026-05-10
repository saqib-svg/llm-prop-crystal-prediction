from worker.app.services.bandgap.predictor import BandGapService

PREDICTOR_REGISTRY = {
    "band_gap": BandGapService(),
}
