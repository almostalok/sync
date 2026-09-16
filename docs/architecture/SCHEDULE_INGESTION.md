# SiteSync — Schedule Ingestion Pipeline

## 1. Overview
The **Schedule Ingestion Pipeline** enables SiteSync to ingest raw project schedules exported from tools like Primavera P6, Microsoft Project, or custom ERP systems via CSV, JSON, and spreadsheet formats.

---

## 2. Ingestion Flow

```text
Upload Raw File (CSV / JSON / XLSX)
        ↓
Compute SHA-256 Checksum (Idempotency check)
        ↓
Parse into Raw Schedule Rows
        ↓
Validate Schedule Integrity
  ├── Required fields (activityCode, name, dates)
  ├── Duplicate code detection
  ├── Date sequence validation (start <= finish)
  └── Circular dependency & self-dependency detection (DFS)
        ↓
Preview Mode (Counts, warnings, sample rows, validation status)
        ↓
Atomic Batch Persistence (Prisma Transaction)
  ├── Upsert Root WBS
  ├── Batch Upsert Activities
  ├── Upsert Dependencies (FS, SS, FF, SF)
  └── Create ScheduleVersion Record (v1 Baseline or revision)
```

---

## 3. Supported CSV Schema

| Header (Aliases) | Required | Description | Example |
|---|---|---|---|
| `Activity ID` (`activityCode`, `actCode`) | **Yes** | Unique project activity code | `CIV-EXC-0042` |
| `Name` (`activityName`, `taskName`) | **Yes** | Human readable activity title | `Compressor Foundation Excavation` |
| `WBS Code` (`wbs`, `wbsPath`) | Optional | WBS path identifier | `1.1.1.1` |
| `Discipline` (`dept`, `trade`) | Optional | Discipline enum | `CIVIL`, `PIPING`, `MECHANICAL`, etc. |
| `Location` (`area`) | Optional | Physical project sector | `Compressor Area` |
| `Planned Start` (`startDate`, `start`) | **Yes** | ISO or YYYY-MM-DD date | `2026-03-01` |
| `Planned Finish` (`finishDate`, `end`) | **Yes** | ISO or YYYY-MM-DD date | `2026-03-10` |
| `Duration` (`durationDays`) | Optional | Duration in days | `10` |
| `Progress` (`actualProgress`) | Optional | Completion float (0.0 to 1.0) | `0.75` |
| `Predecessors` (`preds`) | Optional | Colon/Comma separated dependencies | `CIV-EXC-0001:FS:0, CIV-EXC-0002:SS:2` |

---

## 4. API Endpoints

* `POST /api/v1/projects/:projectId/schedules/preview` — Returns pre-import validation status and structural breakdown.
* `POST /api/v1/projects/:projectId/schedules/import` — Executes transactional persistence and generates a new `ScheduleVersion`.
* `GET /api/v1/projects/:projectId/schedules/versions` — Lists historical versions and identifies baseline.
