from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date

class ExtractedEntity(BaseModel):
    text: str
    type: str
    confidence: float = 0.9

class ExtractedEvent(BaseModel):
    description: str
    event_date: Optional[str] = None
    discipline: Optional[str] = None
    location: Optional[str] = None
    progress: Optional[float] = Field(None, ge=0.0, le=1.0)
    status: str = "IN_PROGRESS"
    entities: List[ExtractedEntity] = []
    source_text: str

class ExtractionRequest(BaseModel):
    report_id: str
    report_date: str
    discipline: Optional[str] = None
    text: str

class ExtractionResponse(BaseModel):
    report_id: str
    events: List[ExtractedEvent]
