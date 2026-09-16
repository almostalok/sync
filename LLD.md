# SiteSync — Low-Level Design (LLD)

## 1. Domain Modules & Service Structure (`apps/api/src/modules/`)

1. **`activities`**: Activity CRUD, code uniqueness, WBS linkage, progress tracking.
2. **`dependencies`**: Predecessor-successor relationships, lag calculation, cycle detection.
3. **`schedules`**: CSV/JSON/P6 ingestion, SHA256 checksum, versioned snapshots (`ScheduleVersion`).
4. **`events`**: Canonical domain event catalog, standard envelope, outbox pattern, and consumer deduplication.
5. **`matching`**: 7-signal hybrid scorer, confidence calibration, ambiguity detection.
6. **`review`**: Human review queue workstation, accept/reject/reassign actions, idempotency keys.
7. **`progress`**: Authoritative verified progress updates, monotonicity enforcement.
8. **`schedule-sync`**: Centralized `ScheduleSynchronizationService` preserving baseline immutability, calculating variance, and driving cascade invalidations.
9. **`risk`**: Deterministic risk rules (`SCHEDULE_DELAY`, `PROGRESS_LAG`, `STALE_UPDATE`).
10. **`forecasting`**: Multi-signal XGBoost-style feature scoring, 4 deterministic baselines, conformal prediction bounds, read-only scenario simulation.
11. **`history`**: Institutional memory, benchmark percentiles (P25, Median, P75), delay taxonomy.
12. **`voice`**: Supervisor voice audio upload, SHA-256 storage, sentence alignment, Hinglish normalization, negation detection gate.
13. **`copilot`**: 18-intent classification, entity extraction, context budget assembly, grounding validation, prompt injection defense, project-isolated conversation persistence.
14. **`pipeline`**: Central `EndToEndPipelineService` orchestrating the full 18-step canonical project lifecycle.

## 2. Event & Integration Architecture

```text
apps/api/src/modules/events/
├── domain-events.ts          # Centralized event catalog, envelope interfaces, error classifications
└── event-bus.service.ts      # Pub/sub broker, transactional outbox, consumer deduplication, DLQ

apps/api/src/modules/schedule-sync/
├── schedule-sync.service.ts      # Authoritative actuals sync, baseline immutability, event emission
├── schedule-variance.service.ts  # Start/finish variance calculations
└── dependency-impact.service.ts  # Critical path & downstream slippage cascade

apps/api/src/modules/pipeline/
└── e2e-pipeline.service.ts   # 18-step full system lifecycle orchestrator
```
