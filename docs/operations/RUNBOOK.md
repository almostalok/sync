# SiteSync Operational Runbook (Master Prompt 12)

Standard operating procedures for managing, troubleshooting, and recovering SiteSync during operational incidents.

---

## 1. Incident Scenarios & Action Procedures

### 1.1 PostgreSQL Database Outage
**Symptoms:** `/api/v1/health/ready` returns `503 Service Unavailable` with `database: NOT_READY`.
1. Inspect database logs: `docker compose logs postgres --tail=100`.
2. Verify disk space and volume mounts: `df -h`.
3. If container crashed, restart: `docker compose restart postgres`.
4. The application operates in read-only in-memory fallback during temporary disconnection; once PostgreSQL reconnects, outbox event workers replay pending updates automatically.

---

### 1.2 Redis Outage
**Symptoms:** Worker job queuing pauses, WebSocket event distribution degraded.
1. Inspect Redis container: `docker compose logs redis --tail=50`.
2. Check Redis ping: `docker compose exec redis redis-cli ping`.
3. Restart Redis: `docker compose restart redis`.
4. Note: Authoritative progress updates and review decisions persist directly to PostgreSQL; Redis is used for caching and ephemeral messaging. No authoritative data is lost.

---

### 1.3 External AI / LLM Provider Outage
**Symptoms:** Copilot queries slow down, circuit breaker trips to `OPEN`.
1. Check circuit breaker status at `/api/v1/operations/metrics`.
2. When the circuit breaker is `OPEN`, the system fast-fails without hanging requests, providing grounded template responses and directing planners to the Review Queue workstation.
3. Core schedule variance calculations, Gantt visualization, and human review verification remain 100% operational without external LLM availability.

---

### 1.4 Dead Letter Queue (DLQ) Backlog Growth
**Symptoms:** `dlqCount > 0` in `/api/v1/operations/metrics`.
1. Retrieve failed jobs:
   ```bash
   curl -s http://localhost:3000/api/v1/operations/metrics | jq '.deadLetterQueue'
   ```
2. Classify errors:
   - `VALIDATION`: Reject bad input permanently and notify submitting contractor.
   - `TRANSIENT`: Trigger automatic replay once upstream network/database stabilizes.
3. Replay transient jobs using outbox service or CLI.

---

### 1.5 Security Incident (Potential Cross-Tenant Breach Attempt)
**Symptoms:** Multiple `IDOR Violation` or `Project Isolation Breach` logs detected.
1. Filter security logs by correlation ID and IP:
   ```bash
   grep "IDOR Violation" /var/log/sitesync/app.log
   ```
2. Revoke active session tokens for suspect user accounts.
3. Verify that affected project data remained unmutated using `AuditService` logs.
