from worker.app.services.bandgap.predictor import BandGapService
from worker.app.services.text_regression.predictor import TextRegressionService
from worker.app.core.model_paths import MODEL_PATHS, TOKENIZER_PATHS

PREDICTOR_REGISTRY = {
    "band_gap": BandGapService(),
    "bandgap_classifier": TextRegressionService(
        name="bandgap_classifier",
        model_file=MODEL_PATHS["bandgap_classifier"],
        tokenizer_dir=TOKENIZER_PATHS["bandgap_classifier"],
        version="bandgap-classifier-v1",
        unit="",
        value_formatter=lambda value: "Is direct" if value >= 0.5 else "Is indirect",
    ),
    "energy_above_hull": TextRegressionService(
        name="energy_above_hull",
        model_file=MODEL_PATHS["energy_above_hull"],
        tokenizer_dir=TOKENIZER_PATHS["energy_above_hull"],
        version="energy-above-hull-v1",
        unit="eV",
    ),
    "energy_per_atom": TextRegressionService(
        name="energy_per_atom",
        model_file=MODEL_PATHS["energy_per_atom"],
        tokenizer_dir=TOKENIZER_PATHS["energy_per_atom"],
        version="energy-per-atom-v1",
        unit="eV/atom",
    ),
    "formation_energy": TextRegressionService(
        name="formation_energy",
        model_file=MODEL_PATHS["formation_energy"],
        tokenizer_dir=TOKENIZER_PATHS["formation_energy"],
        version="formation-energy-v1",
        unit="eV/atom",
    ),
    "volume": TextRegressionService(
        name="volume",
        model_file=MODEL_PATHS["volume"],
        tokenizer_dir=TOKENIZER_PATHS["volume"],
        version="volume-v1",
        unit="Å³",
    ),
}
