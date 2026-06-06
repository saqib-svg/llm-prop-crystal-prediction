import os
from pathlib import Path

BASE_MODEL_DIR = Path(os.getenv("MODEL_DIR", Path(__file__).resolve().parents[2] / "models"))

MODEL_PATHS = {
    "band_gap": BASE_MODEL_DIR / "band_gap" / "best_bandgap_model.pt",
    "bandgap_classifier": BASE_MODEL_DIR / "bandgap_classifier" / "model.safetensors",
    "energy_above_hull": BASE_MODEL_DIR / "energy_above_hull" / "model.safetensors",
    "energy_per_atom": BASE_MODEL_DIR / "energy_per_atom" / "model.safetensors",
    "formation_energy": BASE_MODEL_DIR / "formation_energy" / "model.safetensors",
    "volume": BASE_MODEL_DIR / "volume" / "model.safetensors",
}

TOKENIZER_PATHS = {
    "band_gap": BASE_MODEL_DIR / "band_gap" / "tokenizer",
    "bandgap_classifier": BASE_MODEL_DIR / "bandgap_classifier",
    "energy_above_hull": BASE_MODEL_DIR / "energy_above_hull",
    "energy_per_atom": BASE_MODEL_DIR / "energy_per_atom",
    "formation_energy": BASE_MODEL_DIR / "formation_energy",
    "volume": BASE_MODEL_DIR / "volume",
}
