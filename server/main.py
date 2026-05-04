from __future__ import annotations

import sys
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from model_loader import load_model_bundle
from predictor import BandGapPredictor

MODEL_PATH = BASE_DIR.joinpath("..", "models", "best_bandgap_model.pt").resolve()
TOKENIZER_DIR = BASE_DIR.joinpath("..", "models", "tokenizer").resolve()

bundle = load_model_bundle(model_path=MODEL_PATH, tokenizer_dir=TOKENIZER_DIR, device="cpu")
predictor = BandGapPredictor(bundle)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class InputData(BaseModel):
    input: str

@app.post("/predict")
def predict(data: InputData):
    try:
        band_gap = predictor.predict(data.input)
        return {
            "prediction": "Predicted Material",
            "band_gap": band_gap,
        }
    except Exception as e:
        print("Inference error:", e)
        return {
            "prediction": "error",
            "band_gap": 0.0,
        }
