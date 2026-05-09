from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/conductivity", tags=["conductivity"])


@router.post("/predict")
def predict_conductivity() -> None:
    raise HTTPException(status_code=501, detail="Conductivity model is not registered yet.")
