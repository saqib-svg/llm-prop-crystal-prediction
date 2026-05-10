from typing import Any, Dict, Optional, Union
from pydantic import BaseModel, Field

class PropertyPrediction(BaseModel):
    value: Union[float, str]
    unit: Optional[str] = None
    confidence: Optional[float] = None

class PredictionResponse(BaseModel):
    properties: Dict[str, PropertyPrediction]
    metadata: Dict[str, Any] = Field(default_factory=dict)
