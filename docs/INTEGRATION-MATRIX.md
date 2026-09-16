# SiteSync Subsystem Integration Matrix (Master Prompt 11)

This matrix documents the end-to-end data contracts, interfaces, idempotency keys, and event cascades connecting all 10 domain subsystems of SiteSync.

---

## 1. Cross-Subsystem Contract Matrix

| Source Subsystem | Target Subsystem | Interface / Service Contract | Payload Schema | Idempotency Key | Domain Event Emitted |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Field Ingestion (PDF/XLSX)** | **Extraction** | `EventExtractorService.extractEventsFromReport` | `RawReportInput` | `SHA256(fileContent)` | `EXTRACTED_EVENT_CREATED` |
| **Voice Ingestion (Audio)** | **Extraction & Match** | `VoiceReportService.ingestVoiceReport` | `VoiceIngestionInput` | `SHA256(audioBuffer)` | `VOICE_REPORT_CREATED` |
| **Extraction** | **Hybrid Matching** | `matchEventToActivities` | `ExtractedEvent` | `eventId` | `ACTIVITY_MATCH_CREATED` |
| **Matching (<85% conf)** | **Review Workflow** | `ReviewService.registerReviewItem` | `ReviewItemModel` | `matchId` | `MATCH_REVIEW_REQUIRED` |
| **Review Workflow** | **Verified Progress** | `ProgressService.createVerifiedProgress` | `CreateProgressParams` | `requestId` | `PROGRESS_VERIFIED` |
| **Verified Progress** | **Schedule Sync** | `ScheduleSyncService.syncActivitySchedule` | `SyncScheduleOptions` | `activityId:effectiveDate` | `SCHEDULE_UPDATED` |
| **Schedule Sync** | **Risk Engine** | `RiskService.evaluateProjectRisks` | `projectId` | `correlationId` | `RISK_UPDATED` |
| **Schedule Sync** | **Forecasting Engine** | `ForecastingCoordinatorService.generateProjectForecasts` | `ForecastContext` | `correlationId` | `FORECAST_CREATED` |
| **Historical Outcomes** | **Forecasting Engine** | `ForecastingService.generateForecast` | `HistoricalRecord[]` | `modelRunId` | `FORECAST_CREATED` |
| **Supervisor Voice** | **Verified Progress** | Direct pipeline via `acceptMatch` | `ReviewActionRequest` | `voiceReportId` | `PROGRESS_VERIFIED` |
| **Supervisor Voice** | **Copilot RAG** | `CopilotService.query` | `CopilotQuery` | `queryId` | `COPILOT_QUERY_CREATED` |
| **Forecasting Engine** | **Copilot RAG** | `CopilotService.query` | `CopilotQuery` | `queryId` | `COPILOT_QUERY_CREATED` |
| **Project Closure** | **Institutional Memory**| `ProjectClosureService.initiateProjectClosure` | `projectId` | `projectId` | `HISTORICAL_OUTCOME_CREATED` |

---

## 2. Global State & Cascade Flow

```text
                                [ FIELD INGESTION / VOICE ]
                                             │
                                             ▼
                                     [ EXTRACTION ]
                                             │
                                             ▼
                                   [ HYBRID MATCHING ]
                                       /           \
                       Score >= 0.85  /             \  Score < 0.85
                                     /               \
                                    ▼                 ▼
                            [ AUTO-LINK ]     [ REVIEW QUEUE ]
                                    \                 /
                                     \  Accept Match /
                                      ▼             ▼
                               [ VERIFIED PROGRESS ]
                                  (Authoritative)
                                         │
                                         ▼
                            [ SCHEDULE SYNCHRONIZATION ]
                            - Update actualStart/Finish
                            - Compute start & finish variance
                            - Baseline version preserved
                                         │
                   ┌─────────────────────┼─────────────────────┐
                   ▼                     ▼                     ▼
          [ RISK ENGINE ]       [ FORECAST ENGINE ]    [ INSTITUTIONAL MEMORY ]
          - Delay risk          - Multi-signal forecast - Completed activities
          - Float consumption   - Conformal bounds     - Delay causes
          - Dependency cascade  - Milestone slips       - Productivity rates
                   │                     │                     │
                   └─────────────────────┼─────────────────────┘
                                         │
                                         ▼
                             [ GROUNDED COPILOT RAG ]
                             - Strict evidence citations
                             - Read-only safety gate
                             - Deterministic calculations
                                         │
                                         ▼
                            [ HUMAN DECISION SUPPORT ]
```

---

## 3. Invariants & Guardrails

1. **Baseline Immutability:** `ScheduleVersion` baseline planned dates are never overwritten by execution progress. Only actuals and variances are updated.
2. **Actual vs. Forecast Separation:** Authoritative progress updates (`ProgressUpdate`) represent past verified reality; forecasts (`Forecast`) represent probabilistic predictions and never overwrite actuals.
3. **Historical Eligibility Gate:** Only activities with status `COMPLETED` and verified progress of 100% can be extracted into institutional memory.
4. **Negation Protection:** Voice statements with detected negations (e.g. "could not finish", "held up", "pending") are blocked from auto-matching to prevent premature completion updates.
5. **Multi-Tenant Isolation:** All queries, caches, and RAG vector searches strictly filter by `projectId`.
