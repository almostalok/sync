# SiteSync — Low-Level Design (LLD)

## 1. Domain Modules & Service Structure (`apps/api/src/modules/`)

1. **`activities`**: Activity CRUD, code uniqueness, WBS linkage, progress tracking.
2. **`dependencies`**: Predecessor-successor relationships, lag calculation, cycle detection.
3. **`schedules`**: CSV/JSON ingestion, SHA256 checksum, versioned snapshots.
4. **`events`**: Field report text extraction, normalization, tokenization.
5. **`matching`**: 7-signal hybrid scorer, confidence calibration, ambiguity detection.
6. **`review`**: Human review queue, accept/reject/reassign actions, idempotency keys.
7. **`progress`**: Progress updates, monotonicity enforcement, schedule variance calculation.
8. **`risk`**: Deterministic risk rules (`SCHEDULE_DELAY`, `PROGRESS_LAG`, `STALE_UPDATE`).
9. **`history`**: Institutional memory, benchmark percentiles (P25, Median, P75), delay taxonomy.
10. **`copilot`**: 18-intent classification, entity extraction, context budget assembly, grounding validation, prompt injection defense, project-scoped conversation persistence.

## 2. Copilot Module Service Boundaries

```text
apps/api/src/modules/copilot/
├── copilot.config.ts                   # Context budgets, weights, mutation verbs
├── intent-classifier.service.ts        # 18-intent classifier + entity extractor
├── deterministic-analytics.service.ts  # Schedule, progress, change, dependency analytics
├── retrieval-orchestrator.service.ts   # Hybrid structured + semantic + historical + evidence retrieval
├── context-assembler.service.ts        # Context budgeting & Level 1-5 hierarchy
├── grounding-validator.service.ts      # Citation ID existence, numerical check, mutation refusal
├── copilot-conversation.service.ts     # Project-isolated conversation memory
├── copilot.service.ts                  # Master 12-step pipeline orchestrator
└── index.ts                            # Module exports & singletons
```
