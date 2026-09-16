# SiteSync API Specification

## Base URL
`/api/v1`

---

## 1. Copilot Endpoints

### `POST /api/v1/projects/:id/copilot`
Submits a natural language project intelligence question.

**Request Body:**
```json
{
  "question": "Why is compressor foundation work delayed?",
  "conversationId": "optional-conv-id"
}
```

**Response Body (200 OK):**
```json
{
  "success": true,
  "projectId": "PROJ-OIL-2026-01",
  "data": {
    "answer": "Foundation CIV-EXC-042 is 4 days behind plan...",
    "confidence": 0.95,
    "groundingStatus": "GROUNDED",
    "citations": [
      {
        "sourceType": "FIELD_REPORT",
        "sourceId": "DPR-2026-09-16.pdf",
        "title": "Field DPR: DPR-2026-09-16.pdf",
        "locator": { "page": 1, "line": 12 },
        "excerpt": "Excavation completed up to 80% baseline level...",
        "relevanceScore": 0.94
      }
    ],
    "calculations": [
      {
        "name": "Maximum Activity Delay",
        "value": 4,
        "unit": "days",
        "formula": "max(activity.varianceDays)"
      }
    ],
    "warnings": [],
    "intent": "DELAY_ANALYSIS",
    "suggestedActions": [
      "Open Review Queue to verify latest DPR field evidence",
      "Inspect Critical Path in Gantt View"
    ],
    "latencyMs": 28,
    "dataVersion": 182
  }
}
```

### `GET /api/v1/projects/:id/copilot/suggested-questions`
Returns dynamically generated suggested questions based on real live schedule state.

### `GET /api/v1/projects/:id/copilot/conversations`
Lists project-scoped conversations.

### `POST /api/v1/projects/:id/copilot/conversations`
Creates a new conversation thread.

### `GET /api/v1/projects/:id/copilot/conversations/:conversationId`
Retrieves full conversation with message history.

### `DELETE /api/v1/projects/:id/copilot/conversations/:conversationId`
Deletes conversation thread.
