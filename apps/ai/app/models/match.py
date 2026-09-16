from pydantic import BaseModel, Field
from typing import Optional, List, Dict

class MatchCandidate(BaseModel):
    activity_id: str
    activity_code: str
    activity_name: str
    discipline: str
    location: str
    rank: int
    final_score: float
    scores: Dict[str, float]
    reasons: List[str]

class MatchRequest(BaseModel):
    event_id: str
    description: str
    normalized_description: str
    discipline: str
    location: str
    event_date: str
    candidates: List[Dict]

class MatchResponse(BaseModel):
    event_id: str
    decision: str
    confidence: float
    confidence_level: str
    candidate_margin: float
    candidates: List[MatchCandidate]
    explanation: str
