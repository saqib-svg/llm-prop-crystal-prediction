from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/stability", tags=["stability"])


@router.post("/predict")
def predict_stability() -> None:
    raise HTTPException(status_code=501, detail="Stability model is not registered yet.")
