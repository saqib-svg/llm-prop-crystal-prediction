from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/density", tags=["density"])


@router.post("/predict")
def predict_density() -> None:
    raise HTTPException(status_code=501, detail="Density model is not registered yet.")
