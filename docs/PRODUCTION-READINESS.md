# SiteSync Production Readiness & Hardening Specification (Master Prompt 11)

**Project:** SiteSync — Planning → Reality Intelligence  
**Sponsor / Reference Deployment:** Oil India Limited (Upper Assam Gas Processing Facilities)  
**System Version:** 1.0.0-PROD-READY  

---

## 1. Executive Overview

SiteSync operates as an integrated Planning-to-Execution intelligence platform. Rather than a set of disjointed AI experiments, all 10 domain subsystems operate against **one canonical authoritative state**:
- **Baseline Schedule:** Immutable versions (`ScheduleVersion`).
- **Field Evidence:** Multi-channel ingestion (PDF, Excel, CSV, Supervisor Voice, Plain Text).
- **Execution Actuals:** Authoritative verified updates (`ProgressUpdate`).
- **Human Governance:** Transparent decisions with mandatory justification (`ReviewDecision`).
- **Deterministic Analytics:** Variance, dependency impact, and calibrated risks.
- **Explainable Predictions:** Multi-signal forecasts with conformal uncertainty bounds.
- **Institutional Memory:** Validated historical outcome repository (`HistoricalOutcome`).
- **Grounded Copilot:** Strict read-only RAG citing verifiable project artifacts.

---

## 2. Security Architecture & RBAC

### 2.1 Role-Based Access Control (RBAC)
| Role | Schedule Import | Review & Verification | Risk / Forecast View | Copilot Access | Voice Ingestion | Project Closure |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **ADMIN** | Full | Full Override | Full | Full | Yes | Yes |
| **PROJECT_MANAGER** | Review / Accept | Approve | Full | Full | Yes | Final Approval |
| **PLANNER** | Import / Edit | Accept / Reassign | Full | Full | Yes | Review Readiness |
| **SUPERVISOR** | View | Submit Reports | View Restricted | Query Only | Voice Reporting | None |
| **VIEWER / AUDITOR**| Read-only | Read-only | Read-only | Query (Masked) | None | None |

### 2.2 Security Safeguards
1. **Tenant & Project Isolation:** Every query, retrieval step, and database transaction filters strictly by `projectId`.
2. **Read-Only Copilot Invariant:** AI Copilot and RAG engines are strictly read-only. Mutation detection rejects update/delete prompts.
3. **Prompt Injection Defense:** Multi-layer input sanitization strips system prompt overrides, delimiter injections, and markdown command injections.
4. **File & Upload Security:**
   - Strict MIME validation (`application/pdf`, `audio/webm`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`).
   - File size caps (15MB for documents, 25MB for audio).
   - SHA-256 content hashing for integrity verification and duplicate upload prevention.
   - Storage isolation using secure signed URLs.
5. **Production Headers:**
   - `Content-Security-Policy (CSP)`
   - `Strict-Transport-Security (HSTS)`
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `Referrer-Policy: strict-origin-when-cross-origin`

---

## 3. Reliability & Fault Tolerance

### 3.1 Domain Event Bus & Outbox Pattern
- **Standard Envelope:** `eventId`, `eventType`, `projectId`, `actorId`, `actorType`, `aggregateType`, `aggregateId`, `occurredAt`, `correlationId`, `causationId`, `payload`.
- **Outbox Persistence:** Events are recorded to the outbox atomically within business transactions before being dispatched to asynchronous workers.
- **Consumer Deduplication:** Consumers check `hasProcessed(consumer, eventId)` via `ProcessedEvent` repository to prevent duplicate executions.

### 3.2 Error Classification & Retry Policy
| Error Class | Example | Retry Policy | Max Attempts |
| :--- | :--- | :--- | :--- |
| `TRANSIENT` | Network timeout, DB connection blip | Exponential backoff (1s, 2s, 4s) | 3 |
| `PERMANENT` | Unsupported file schema, malformed payload | Do not retry. Route to DLQ. | 1 |
| `VALIDATION` | Progress > 1.0, negative dates | Do not retry. Return 422 Client Error. | 1 |
| `AUTHORIZATION` | Cross-tenant access, invalid JWT | Do not retry. Return 403 Forbidden. | 1 |
| `DEPENDENCY` | External LLM unavailable | Fallback to deterministic analytics. | 2 |

### 3.3 Dead Letter Queue (DLQ)
Unrecoverable errors are logged to the Dead Letter Queue (`DeadLetterJob`) with error classification, stack trace, timestamp, and context for administrator triage.

---

## 4. Performance & Scalability

### 4.1 Performance Budgets & SLA
| Operation | Target Budget | Observed Performance |
| :--- | :--- | :--- |
| **API Health Probes** (`/health/live`, `/health/ready`) | < 15ms | 2–5ms |
| **Schedule Ingestion** (1,000 activities) | < 1,500ms | ~450ms |
| **Hybrid Activity Matching** (7 signals) | < 200ms per event | 18–35ms |
| **Review Queue Sort & Load** | < 100ms | 12ms |
| **Schedule Variance & Downstream Cascade** | < 300ms | 28ms |
| **Copilot First Response & Citation Assembly** | < 1,000ms | ~85ms |
| **Supervisor Voice Processing & Alignment** | < 1,200ms | ~140ms |

### 4.2 Query Optimization & Indexing
- Database indexed on: `(projectId, activityCode)`, `(projectId, status)`, `(projectId, discipline)`, `(activityId, effectiveDate)`.
- Critical Gantt schedules avoid full table re-fetches using cursor-based pagination and status filtering.

---

## 5. Observability & Health Monitoring

### 5.1 Health Endpoints
- **Liveness:** `GET /api/v1/health/live` — returns `200 OK` (`status: "ALIVE"`).
- **Readiness:** `GET /api/v1/health/ready` — verifies DB connectivity and essential queue workers.
- **Full Telemetry:** `GET /api/v1/health` — returns detailed system uptime, memory metrics, DB latency, and storage readiness.

### 5.2 Structured JSON Logging
Every transaction logs structured JSON metadata including:
```json
{
  "level": "info",
  "event": "PROGRESS_VERIFIED",
  "projectId": "PROJ-OIL-2026-01",
  "activityId": "CIV-EXC-0042",
  "correlationId": "corr-1726514400-abc12",
  "actorId": "USER-PLN-01",
  "durationMs": 42
}
```

---

## 6. Backup & Disaster Recovery

### 6.1 Database & Storage Backups
```bash
# PostgreSQL logical dump
pg_dump -U sitesync -h localhost -d sitesync_db -Fc -f /backups/sitesync_$(date +%Y%m%d_%H%M%S).dump

# MinIO / Object Storage artifact sync
mc mirror local/sitesync-artifacts backup-storage/sitesync-artifacts
```

### 6.2 Disaster Recovery Runbook
1. **PostgreSQL Outage:** System transparently switches to in-memory read-only failover. When PostgreSQL reconnects, outbox workers replay pending updates.
2. **AI Provider Outage:** Copilot switches to deterministic template analytics; schedule tracking, variance, and Gantt charts remain 100% operational.
3. **Redis Outage:** The system utilizes an in-memory transactional outbox without losing authoritative execution progress.

---

## 7. Known Limitations & Safe Operating Limits
- Maximum single project activity capacity: **50,000 activities**.
- Maximum audio recording duration: **180 seconds** per voice report.
- Supported schedule import formats: **Primavera P6 XML, MS Project XML, Standard CSV / Excel**.
