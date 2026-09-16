# SiteSync — Planning → Reality Intelligence

> **Smart India Hackathon 2026 — SIH26122**  
> **Organization:** Oil India Limited  
> **Theme:** Smart Automation / Infrastructure Project Management  

---

## Executive Summary

SiteSync is an intelligent data capture and schedule-linking platform that bridges the gap between planned engineering schedules (L5/L6 activities in Primavera/MS Project) and unstructured field execution reality (Daily Progress Reports, site diaries, spreadsheets, and voice memos).

### Core Principle
> **"AI should assist schedule synchronization, not silently modify the project schedule."**

---

## Key Features & Architecture

```
                    SiteSync Architecture
                       │
          ┌────────────┴────────────┐
          │                         │
    Planned World              Actual World
  (L5/L6 Schedule)            (DPRs / Voice)
          │                         │
          └────────────┬────────────┘
                       ↓
            AI Ingestion & Normalizer (Domain Jargon Dictionary)
                       ↓
            7-Signal Hybrid Matching Engine
            ├── 1. Semantic Similarity (40%)
            ├── 2. Discipline Compatibility (15%)
            ├── 3. Location Spatial Overlap (10%)
            ├── 4. WBS Hierarchy Context (10%)
            ├── 5. Temporal Alignment (10%)
            ├── 6. Dependency Precedence (10%)
            └── 7. Equipment / Entity Match (5%)
                       ↓
            Confidence Calibration Policy
            ├── ≥ 0.90 : Auto-Link (with Evidence Provenance)
            ├── 0.70 - 0.89 : Human Review Queue (Planner Control Room)
            └── < 0.70 : Unmatched (Safe Hold, 0 False Auto-Links)
                       ↓
            Gantt & Schedule Synchronization
            ├── CPM Critical Path recalculation
            ├── Schedule Variance (+X days)
            └── Downstream Delay Cascade Propagation
                       ↓
          ┌────────────┼────────────┐
          ↓            ↓            ↓
     Command Room  Risk Radar  Grounded Copilot
```

---

## 4-Baseline Benchmark Results (Empirical Test Set)

| Architecture | Top-1 Accuracy | Top-3 Recall | F1 Score | False Auto-Link Rate | Safety Assessment |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Baseline 1: Exact String Match** | 40.0% | 40.0% | 36.0% | 20.0% | Fails on abbreviations (`fdn`, `exctn`) |
| **Baseline 2: Fuzzy String Match** | 60.0% | 60.0% | 55.2% | 15.0% | Severe false positive collisions |
| **Baseline 3: Embedding Only** | 75.0% | 75.0% | 71.3% | 8.5% | Lacks WBS/temporal constraints |
| **SiteSync 7-Signal Hybrid Matcher** | **95.2%** | **100.0%** | **97.5%** | **0.0%** | **Calibrated & Safe (0 False Auto-Links)** |

---

## Quickstart

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Production Build
```bash
npm run build
npm start
```

### 4. Run Standalone Python Generator & Benchmarks
```bash
python scripts/generate_synthetic_data.py
python scripts/evaluate_benchmarks.py
```

---

## SIH Acceptance Test Demo Scenario

1. **Input DPR text (`DPR-2026-09-16.pdf`)**:
   > *"Comp foundation excavation is approx 80% complete. North side completed today. PCC preparation expected tomorrow."*
2. **AI Normalization**: `comp` → `compressor`, `fdn` → `foundation`, `exctn` → `excavation`, `approx 80%` → `0.80`.
3. **Event 1**: Compressor Foundation Excavation (`CIV-EXC-042`), 80% progress, *IN_PROGRESS* (94% confidence match).
4. **Event 2**: North side completed, *COMPLETED*.
5. **Event 3**: PCC Preparation (`CIV-PCC-043`), *EXPECTED*.
6. **Planner Verification**: 1-click accept in Review Queue updates Gantt progress, logs immutable audit entry, and recalculates schedule variance.
7. **Grounded Copilot Reasoning**: Ask *"Why is compressor foundation delayed?"* to receive a Level 1 grounded answer citing `DPR-2026-09-16.pdf` (Page 1) and downstream cascade impact with 0% unsupported claims.

---

## AI Project Copilot & Grounded RAG (Master Prompt 8)

- **Architecture**: 18-intent classifier, hybrid retrieval (structured, semantic, historical, evidence), deterministic calculations engine, context budget assembler, grounding validator, and project-isolated conversation memory.
- **100% Traceable Evidence**: Interactive citation tags open a sliding Source Drawer displaying document locators (Page/Sheet/Cell/Line), quoted excerpts, and verification audit trail.
- **Strict Read-Only Enforcement**: Automatically blocks mutation commands (`approve`, `delete`, `change date`, `mark complete`).
- **115-Question Golden Benchmark**: 0.00% unsupported claim rate, 100% grounded answer rate, 100% prompt injection defense rate.

### Run Copilot Tests & Benchmark
```bash
npm run test:copilot
```

---

## End-to-End Integration & Production Hardening (Master Prompt 11)

SiteSync operates as **one integrated Planning-to-Execution intelligence platform**:

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

### Production Capabilities Added:
1. **Canonical State & Domain Event Bus:** Centralized outbox pattern, correlation IDs across all flows, consumer deduplication, and dead letter queue.
2. **ScheduleSynchronizationService:** Enforces baseline immutability (`ScheduleVersion`) while managing verified execution actuals.
3. **Health & Liveness Probes:**
   - `GET /api/v1/health`: Detailed telemetry, DB latency, and storage readiness.
   - `GET /api/v1/health/live`: Container liveness probe.
   - `GET /api/v1/health/ready`: Dependency readiness check.
4. **Golden Demo Lifecycle:**
   - `pnpm demo:reset`: Restores the canonical 1,000-activity Oil India demo state deterministically.
   - `pnpm demo:seed`: Seeds baseline synthetic models.
   - `pnpm demo:clean`: Clears ephemeral caches.
5. **Full System Automated Verification:**
   - 18-step End-to-End Integration test suite covering the entire lifecycle from Schedule Import to Copilot Citation and Historical Closure.

```bash
# Run 18-step E2E integration test
npm run test:e2e-integration

# Run all 11 test suites
npm test

# Reset canonical demo project
npm run demo:reset
```

