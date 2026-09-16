# SiteSync — High-Level Design (HLD)

## 1. System Vision
SiteSync (SIH26122) bridges the divide between engineering schedules (Primavera P6 / MS Project L5/L6 activities) and field execution reality (unstructured Daily Progress Reports, spreadsheets, voice logs) for Oil India Limited.

## 2. Core Architectural Pillars
1. **Planned vs Reality Separation**: Authoritative schedules are strictly versioned; field observations are ingested, normalized, and mapped through a 7-signal hybrid matcher.
2. **Human-in-the-Loop Verification**: Safety thresholds route medium-confidence matches (0.70–0.89) to the Review Queue; high-confidence matches (≥0.90) are auto-linked with provenance; low-confidence items (<0.70) are flagged as unmatched.
3. **Deterministic Project Intelligence**: Critical Path Method (CPM), schedule variance, progress lag, and risk signals are calculated deterministically by backend graph engines.
4. **Institutional Memory**: Closed project activities meeting eligibility gates are indexed into organizational benchmarks for duration, productivity, and delay taxonomy.
5. **Grounded Project Copilot (RAG)**: An evidence-first, read-only conversational copilot answering questions strictly using verified records, DPR page/line locators, and backend calculations.

## 3. High-Level Architecture Diagram
```text
┌──────────────────────────────┐       ┌──────────────────────────────┐
│       Planned Schedule       │       │    Field Execution Intake    │
│ (Primavera P6 / WBS / Gantt) │       │   (PDF DPRs / Voice / Logs)  │
└──────────────┬───────────────┘       └──────────────┬───────────────┘
               │                                      │
               ▼                                      ▼
    [Schedule Ingestion]                     [AI Event Extractor]
               │                                      │
               └──────────────────┬───────────────────┘
                                  ▼
                    [7-Signal Hybrid Matcher]
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
          [Auto-Link Engine]          [Review Queue Workstation]
                    │                           │
                    └─────────────┬─────────────┘
                                  ▼
                 [Verified Progress Synchronization]
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
 [Command Center]        [Risk Radar Engine]      [Grounded Copilot RAG]
 (S-Curve, Gantt)        (Deterministic CPM)      (Evidence & Citations)
```
