# SiteSync — Domain Model Specification

## Canonical Relationship Chain
```
FieldReport
    ↓
ExtractedEvent
    ↓
ActivityMatch
    ↓
Activity
    ↓
ProgressUpdate
```

## Core Entities
1. **Project**: Top-level capital project (e.g. Compressor Station Expansion).
2. **WBSNode**: WBS hierarchy levels L1 through L6.
3. **Activity**: Granular execution unit (L5/L6), containing codes (e.g. `CIV-EXC-042`), planned/actual dates, planned/actual progress, discipline, location, aliases, pgvector embedding.
4. **Dependency**: Finish-to-Start (FS), Start-to-Start (SS), Finish-to-Finish (FF), Start-to-Finish (SF) relationships with lag days.
5. **FieldReport**: Ingested document with checksum, report date, raw text, and page count.
6. **ExtractedEvent**: Normalized statement, progress %, status, discipline, location, character start/end offsets.
7. **ActivityMatch**: Multi-signal scores, confidence, candidate ranking, decision status.
8. **Evidence**: Character offsets, verbatim excerpt, report file reference.
9. **ProgressUpdate**: Verified progress mutation record with effective date and verifier.
10. **ReviewDecision**: Human planner action (`ACCEPTED`, `REJECTED`, `SELECTED_ALTERNATIVE`, `MARKED_UNMATCHED`).
11. **HistoricalOutcome**: Completed project lessons learned and duration benchmarks.
12. **AuditLog**: Immutable provenance of all schedule-affecting actions.
