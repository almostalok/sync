# SiteSync Observability & Telemetry Architecture (Master Prompt 12)

SiteSync implements the Three Pillars of Observability: **Structured Logs**, **Application & AI Metrics**, and **Distributed Tracing via Correlation IDs**.

---

## 1. Correlation ID Propagation

Every incoming HTTP request, background worker job, domain event, and WebSocket message carries a traceable `correlationId`.

```text
[Client / Voice / DPR Upload]
        │ correlationId: corr-1726514400-abc12
        ▼
[EventExtractorService]
        │ correlationId: corr-1726514400-abc12
        ▼
[DomainEventBus (EXTRACTED_EVENT_CREATED)]
        │ correlationId: corr-1726514400-abc12
        ▼
[HybridMatchingWorker]
        │ correlationId: corr-1726514400-abc12
        ▼
[ReviewWorkstation]
        │ correlationId: corr-1726514400-abc12
        ▼
[ProgressVerification & ScheduleSync]
```

If the client supplies a valid `x-correlation-id` header, SiteSync preserves it; otherwise, the edge middleware generates a unique `corr-{timestamp}-{random}` identifier.

---

## 2. Structured JSON Logging

All logs are emitted as JSON lines with standardized context fields:
```json
{
  "timestamp": "2026-09-16T18:30:00.000Z",
  "level": "info",
  "service": "sitesync-api",
  "correlationId": "corr-1726514400-abc12",
  "projectId": "PROJ-OIL-2026-01",
  "actorId": "usr-planner-01",
  "event": "PROGRESS_VERIFIED",
  "activityId": "CIV-EXC-042",
  "durationMs": 18,
  "metadata": {
    "previousProgress": 0.0,
    "newProgress": 0.8,
    "varianceDays": 2
  }
}
```
**Log Redaction:** Tokens, session cookies, database connection strings, and full raw report bodies are never written to standard log output.

---

## 3. Telemetry & Metrics Tracking

### 3.1 Core System Metrics
- **API Throughput & Latency:** Request counts, errors, mean latency, and p95 latency.
- **Database Performance:** Query counts, average latency, and slow query counts (>100ms).
- **Worker & Queue Health:** Jobs processed, job failures, retry attempts, and Dead Letter Queue (DLQ) depth.

### 3.2 AI Quality & Cost Metrics
Tracking system uptime alone is insufficient for AI platforms. SiteSync tracks:
- **`autoLinkRate`:** Percentage of execution events auto-linked with $\ge 90\%$ confidence (Target: 70–85%).
- **`reviewRequiredRate`:** Percentage routed to human review (Target: 10–25%).
- **`unmatchedRate`:** Percentage flagged as unmatched / out-of-scope (Target: <10%).
- **`humanOverrideRate`:** Percentage of AI proposals rejected or reassigned by human planners (Target: <5%).
- **`groundingFailuresCount`:** Count of AI responses rejected due to missing evidence citations.
- **Token & Cost Telemetry:** Model token consumption and estimated inference cost in USD.

---

## 4. Data Freshness vs. System Outage Monitoring

SiteSync explicitly distinguishes between:
1. **`STALE_DATA`:** Normal field inactivity where subcontractors have not filed reports for several days, but background workers and database are healthy.
2. **`SYSTEM_FAILURE`:** Processing queue backlog (>10 jobs) or consecutive worker failures ($\ge 3$), requiring operational triage.

---

## 5. Operations Health Endpoint
An internal metrics endpoint is exposed at:
```http
GET /api/v1/operations/metrics?projectId=PROJ-OIL-2026-01
```
Returning real-time telemetry summaries, freshness assessments, and active DLQ jobs.
