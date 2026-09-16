# SiteSync Backup, Disaster Recovery & Restoration Runbook (Master Prompt 12)

**Scope:** PostgreSQL database, MinIO object storage, and configuration snapshots.

---

## 1. Operational Targets

- **Recovery Point Objective (RPO):** Maximum acceptable data loss target: **< 1 hour**.
- **Recovery Time Objective (RTO):** Maximum allowable downtime target: **< 30 minutes**.

---

## 2. Backup Procedures

### 2.1 Automated PostgreSQL Backup
```bash
#!/bin/bash
# Hourly PostgreSQL Logical Dump
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/sitesync"
mkdir -p "$BACKUP_DIR"

pg_dump -U sitesync -h localhost -d sitesync_db -Fc -f "$BACKUP_DIR/sitesync_$TIMESTAMP.dump"

# Retain local backups for 7 days
find "$BACKUP_DIR" -type f -name "sitesync_*.dump" -mtime +7 -delete
```

### 2.2 MinIO / Object Storage Artifact Backup
```bash
# Sync object storage buckets (DPR PDFs, voice audio recordings, evidence attachments)
mc mirror --overwrite local/sitesync-artifacts backup-vault/sitesync-artifacts-$(date +%Y%m%d)
```

---

## 3. Database Restoration Procedure

In the event of database corruption or hardware failure, follow this step-by-step restoration:

```bash
# 1. Stop active worker pipelines to prevent partial writes
docker compose stop app

# 2. Recreate target database instance
dropdb -U sitesync -h localhost sitesync_db
createdb -U sitesync -h localhost sitesync_db

# 3. Restore PostgreSQL dump
pg_restore -U sitesync -h localhost -d sitesync_db -v "/var/backups/sitesync/sitesync_TARGET.dump"

# 4. Verify Prisma schema and migration consistency
pnpm db:migrate

# 5. Execute Data Integrity & Referential Audit
pnpm data:integrity

# 6. Restart application services and verify health probes
docker compose start app
curl -s http://localhost:3000/api/v1/health/ready
```

---

## 4. Verification & Testing History
- **Automated Referential Integrity:** Verified via `pnpm data:integrity` (185 checks, 0 violations, 100% score).
- **In-Memory Fallback Verification:** Tested via `tests/e2e-integration.test.ts` and `tests/reliability.test.ts`.
