# SiteSync Incident Response & Severity Management (Master Prompt 12)

Standard incident response framework for SiteSync infrastructure and operational technology components.

---

## 1. Incident Severity Classification

| Severity Level | Definition | Target Response | Target Resolution | Escalation |
| :--- | :--- | :--- | :--- | :--- |
| **SEV 1 — CRITICAL** | Full system outage, database corruption, or cross-tenant data breach. | < 15 minutes | < 2 hours | Engineering Lead & Security Officer |
| **SEV 2 — HIGH** | External AI provider down, voice ingestion halted, or review queue locked. | < 30 minutes | < 4 hours | Platform Lead & Senior Developer |
| **SEV 3 — MEDIUM** | Non-critical component degraded (e.g. historical aggregates slow, DLQ growth). | < 2 hours | < 1 business day | On-call Engineer |
| **SEV 4 — LOW** | Minor UI rendering discrepancy, telemetry gap, non-blocking bug. | < 1 business day | Next sprint cycle | Bug Triage Queue |

---

## 2. 6-Stage Incident Lifecycle

```text
1. DETECT
   ├── Automated health probe alerts (/api/v1/health/ready)
   ├── DLQ backlog threshold breached
   └── User or planner report
        ↓
2. TRIAGE
   ├── Determine severity (SEV 1–4)
   └── Identify affected projects and correlation IDs
        ↓
3. CONTAIN
   ├── Trip circuit breaker to fail-fast if upstream provider is degraded
   ├── Revoke compromised user sessions or isolate affected project
   └── Switch to read-only in-memory failover mode if DB is unresponsive
        ↓
4. RECOVER
   ├── Restore database from dump or restart container services
   ├── Replay queued outbox events
   └── Verify readiness probes return 200 OK
        ↓
5. VERIFY
   ├── Run 'pnpm data:integrity' to assert 0 orphaned records
   └── Run 'pnpm test:e2e-integration' to validate full 18-step pipeline
        ↓
6. DOCUMENT & POST-MORTEM
   └── Complete blameless post-mortem within 48 hours
```

---

## 3. Blameless Post-Mortem Template

```markdown
# Incident Post-Mortem: [INC-YYYYMMDD-X]
- **Date & Time:** YYYY-MM-DD HH:MM UTC
- **Duration:** XX minutes
- **Severity:** SEV 1 / 2 / 3
- **Impacted Services:** [Database / Copilot / Ingestion / Schedule Sync]
- **Root Cause:** [Technical explanation of initial trigger and failure cascade]
- **Resolution:** [Actions taken to contain and recover]
- **Preventative Measures:**
  1. [Action item with owner and deadline]
  2. [Monitoring / test addition]
```
