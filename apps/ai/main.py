from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.models.event import ExtractionRequest, ExtractionResponse, ExtractedEvent
from app.models.match import MatchRequest, MatchResponse
import re

app = FastAPI(
    title="SiteSync AI Engine",
    description="Intelligent Data Capture, Event Extraction & Vector Matching Service",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "sitesync-ai", "version": "1.0.0"}

@app.post("/extract/events", response_model=ExtractionResponse)
def extract_events(request: ExtractionRequest):
    lines = [l.strip() for l in request.text.split("\n") if len(l.strip()) > 5]
    events = []
    
    for line in lines:
        if line.startswith("="):
            continue
        
        clean_text = re.sub(r"^(\d+[\.\)]|\*|\-|\>)\s*", "", line)
        progress = None
        pct_match = re.search(r"(\d{1,3})\s*%", clean_text)
        if pct_match:
            val = int(pct_match.group(1))
            if 0 <= val <= 100:
                progress = val / 100.0
                
        status = "IN_PROGRESS"
        if progress == 1.0 or "completed" in clean_text.lower():
            status = "COMPLETED"
            progress = 1.0
        elif "started" in clean_text.lower():
            status = "STARTED"
            progress = progress or 0.15
            
        events.append(ExtractedEvent(
            description=clean_text,
            event_date=request.report_date,
            discipline=request.discipline or "CIVIL",
            location="Compressor Area",
            progress=progress,
            status=status,
            source_text=line
        ))
        
    return ExtractionResponse(report_id=request.report_id, events=events)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
