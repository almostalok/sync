# SiteSync Event & Synchronization Architecture

## 1. Event Flow Lifecycle
```text
Daily Progress Report (DPR)
       │
       ▼
[Text Extraction & Normalization]
       │
       ▼
[Extracted Execution Events]
       │
       ▼
[7-Signal Hybrid Matcher]
       │
       ├─────────────────────────────────┐
       ▼                                 ▼
High Confidence (≥ 0.90)       Medium Confidence (0.70 - 0.89)
       │                                 │
 [AUTO_LINKED]                 [PENDING_REVIEW Queue]
       │                                 │
       └────────────────┬────────────────┘
                        ▼
            [Verified ProgressUpdate]
                        │
                        ▼
       [Critical Path Schedule Recalculation]
                        │
                        ▼
         [Deterministic Risk Detection]
                        │
                        ▼
        [Copilot Grounded RAG Indexing]
```

## 2. Event Sourcing & Auditability
Every progress update preserves its primary source locator (`reportFileName`, `sourcePage`, `line`), the planner authority who accepted the match, and the timestamp.
The Grounded Copilot utilizes these event chains to produce Level 1 verifiable citations.
