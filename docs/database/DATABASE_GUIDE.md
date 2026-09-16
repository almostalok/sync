# SiteSync — Database Architecture & Persistence Guide

## 1. Relational Model & Entities
SiteSync's relational database contains 15 core entities:
1. `User` (RBAC: ADMIN, PLANNER, PROJECT_MANAGER, SUPERVISOR, VIEWER)
2. `Project` (Overall schedule baseline and metadata)
3. `ProjectMember` (Project-specific roles and authorization)
4. `WBSNode` (L1 through L6 hierarchical Work Breakdown Structure)
5. `Activity` (L5/L6 execution units, planned vs actual progress, vector embeddings)
6. `Dependency` (FS, SS, FF, SF precedence constraints with lag days)
7. `FieldReport` (Ingested PDF, XLSX, CSV, TXT, Voice memo documents)
8. `ExtractedEvent` (Normalized execution events with exact character offsets)
9. `ActivityMatch` (7-Signal hybrid scores, rank, calibrated confidence, decision)
10. `Evidence` (Verbatim source excerpts and page/cell coordinates)
11. `ProgressUpdate` (Verified schedule updates with audit verifier)
12. `ReviewDecision` (Human planner actions: ACCEPT, REJECT, REASSIGN, UNMATCHED)
13. `HistoricalOutcome` (Past completed project durations, delay root causes, lessons learned)
14. `AuditLog` (Immutable audit trail of all schedule-changing mutations)
15. `ProcessingJob` (Asynchronous BullMQ ingestion jobs)

## 2. Deterministic Seed
Run the deterministic seed:
```bash
npx tsx prisma/seed.ts
```
This populates:
- 4 Baseline Users (Admin, Planner, Project Manager, Supervisor)
- 1 Demo Project: Compressor Station Expansion (Oil India Limited)
- L1–L6 WBS Hierarchy
- 15 Core Activities
- 15 Finish-to-Start (FS) Dependencies
