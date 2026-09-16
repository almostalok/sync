# SiteSync — High-Level Design (HLD)

## 1. System Vision
SiteSync (SIH26122) bridges the divide between engineering schedules (Primavera P6 / MS Project L5/L6 activities) and field execution reality (unstructured Daily Progress Reports, spreadsheets, supervisor voice logs) for Oil India Limited.

## 2. Core Architectural Pillars
1. **Planned vs Reality Separation**: Authoritative schedule baselines are strictly versioned (`ScheduleVersion`); field observations are ingested, normalized, and mapped through a 7-signal hybrid matcher.
2. **Canonical Project State & Domain Events**: One authoritative domain state. Progress mutations flow through `ScheduleSynchronizationService` which manages verified actuals, variance recalculation, outbox event persistence, and downstream invalidation.
3. **Human-in-the-Loop Verification**: Safety thresholds route medium-confidence matches (0.70–0.89) to the Review Queue; high-confidence matches (≥0.90) are auto-linked with provenance; low-confidence items (<0.70) are flagged as unmatched.
4. **Deterministic Project Intelligence & Explainable Forecasting**: Critical Path Method (CPM), schedule variance, dependency impacts, and conformal prediction intervals are calculated deterministically by backend engines.
5. **Institutional Memory**: Closed project activities meeting eligibility gates are indexed into organizational benchmarks for duration, productivity, and delay taxonomy.
6. **Grounded Project Copilot (RAG)**: An evidence-first, read-only conversational copilot answering questions strictly using verified records, DPR page/line locators, and backend calculations.

## 3. High-Level Architecture Diagram (Master Prompt 11 Section 99)
```text
                    SITESYNC
                        │
         ┌──────────────┴──────────────┐
         │                             │
   PLANNED WORLD                  ACTUAL WORLD
         │                             │
 Primavera/MSP                 DPR / Excel / PDF
         │                         Voice / Text
         └──────────────┬──────────────┘
                        ↓
                  INGESTION
                        ↓
                 NORMALIZATION
                        ↓
                   EXTRACTION
                        ↓
               HYBRID MATCHING
                        ↓
                CONFIDENCE ENGINE
                   /         \
             AUTO-LINK      REVIEW
                   \         /
                    ↓       ↓
                 VERIFIED STATE
                        ↓
             ┌──────────┼──────────┐
             ↓          ↓          ↓
          SCHEDULE     RISK      FORECAST
             │          │          │
             └──────────┼──────────┘
                        ↓
                PROJECT INTELLIGENCE
                   /            \
                  ↓              ↓
             COMMAND CENTER   COPILOT
                  │              │
                  └──────┬───────┘
                         ↓
                  HUMAN DECISION
```

> **Final Product Principle:** SiteSync supports project decisions; it does not autonomously make them.

## 4. Subsystem Communications & Invariants
- **Domain Event Envelope:** All events carry `correlationId`, `causationId`, `actorType`, `aggregateId`, and `occurredAt`.
- **Outbox Pattern:** Transactional state commits trigger outbox event registration to prevent lost event broadcasts.
- **Consumer Deduplication:** Every consumer stores `ProcessedEvent` (`eventId`, `consumer`, `processedAt`) to guarantee consumer idempotency.
- **Dead Letter Queue (DLQ):** Retries transient failures with exponential backoff; routes permanent and validation failures directly to DLQ.
