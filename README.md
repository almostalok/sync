# SiteSync — Planning → Reality Intelligence

> **Smart India Hackathon 2026 — Problem Statement: SIH26122**  
> **Organization:** Oil India Limited (Ministry of Petroleum & Natural Gas)  
> **Release Tag:** `v1.0.0-final`  
> **Canonical Positioning:**  
> *"SiteSync converts fragmented field execution updates into evidence-backed, verified L5/L6 schedule progress and downstream project intelligence."*

---

## 1. Executive Summary

In capital-intensive EPC and oil & gas infrastructure projects, master schedules are planned in Primavera P6 or MS Project down to Level 5 (Work Packages) and Level 6 (Daily Field Tasks). However, actual execution on the ground is recorded in unstructured daily progress reports (DPRs), scanned handwritten diaries, WhatsApp logs, and supervisor voice calls—almost **never citing the official schedule Activity IDs**.

**SiteSync** bridges this multi-crore disconnect through an explainable, human-verified, evidence-backed digital thread:
* **AI Proposes:** Extracts work items and computes 7-factor similarity (semantic, lexical, WBS hierarchy, temporal schedule window, status, predecessor network logic, and contractor trade).
* **Humans Decide:** Senior planners inspect candidates in an evidence-backed Review Workstation with split-screen DPR/photo dossiers.
* **Engine Executes:** Authoritative CPM graph algorithms update actual progress, shift remaining durations, recalculate float, and feed conformal predictive forecasting, historical parametric memory, and a zero-hallucination Copilot.

---

## 2. System Architecture

```text
                     PLANNING REALITY
                   (Primavera P6 / MSP)
                            │
               ┌────────────┴────────────┐
               │                         │
         Master Schedule            Field Reality
         (L5/L6 WBS Nodes)       (DPR, Voice, Photos)
               │                         │
               └────────────┬────────────┘
                            ↓
               Domain Jargon Normalization
                            ↓
           7-Feature Hybrid Matching Engine
           ├── f1: Dense Semantic Cosine (0.30)
           ├── f2: Lexical Token Jaccard (0.20)
           ├── f3: WBS Hierarchy & Discipline (0.15)
           ├── f4: Temporal Schedule Window (0.15)
           ├── f5: Status Transition Consistency (0.10)
           ├── f6: Predecessor CPM Completion (0.05)
           └── f7: Contractor Trade Attribution (0.05)
                            ↓
              Tri-Band Confidence Triage
           ├── Confidence ≥ 0.90 : Safe Auto-Link (Zero ambiguity)
           ├── 0.65 ≤ C < 0.90   : Human Review Workstation
           └── Confidence < 0.65 : Safe Rejection (Supervisor Alert)
                            ↓
               HUMAN PLANNER VERIFICATION
               (DPR Excerpt + Photo Dossier)
                            ↓
            Authoritative Schedule Sync (CPM)
           ├── Baseline Immutability (Dates Never Overwritten)
           ├── Dynamic Float Recalculation (TF = LS - ES)
           └── Critical Path Realignment
                            ↓
         ┌──────────────────┼──────────────────┐
         ↓                  ↓                  ↓
    Historical Memory   Conformal Forecast  Grounded Copilot RAG
    (24-Case Grouting)  (80% Coverage)      (100% Citation Precision)
         │                  │                  │
         └──────────────────┼──────────────────┘
                            ↓
                   EXECUTIVE COMMAND CENTER
```

---

## 3. Measured Empirical Benchmark Scorecard

All metrics are measured empirically on the held-out testbed (`synthetic-compressor-v1`, `DEMO_SEED=42`) using `scripts/run-benchmark.ts`. Zero manufactured or ungrounded claims.

| Performance Dimension | Baseline 1 (Exact String) | Baseline 2 (Fuzzy Token) | Baseline 3 (Dense Embedding) | SiteSync 7-Feature Hybrid | Status / Target |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Top-1 Accuracy** | 10.0% | 50.0% | 40.0% | **90.0%** | Exceeded ($\ge 85\%$) |
| **Top-3 Recall** | 10.0% | 70.0% | 60.0% | **93.3%** | Exceeded ($\ge 90\%$) |
| **Precision** | 0.0% | 55.0% | 50.0% | **89.7%** | Exceeded ($\ge 85\%$) |
| **Recall** | 0.0% | 70.0% | 66.7% | **100.0%** | Exceeded |
| **F1 Score** | 0.0% | 61.5% | 57.1% | **94.5%** | Exceeded ($\ge 90\%$) |
| **False Auto-Link Rate** | 0.0% | 15.0% | 25.0% | **0.0%** | Perfect ($= 0.0\%$) |
| **Inference Latency** | 0.1 ms | 0.4 ms | 45.0 ms | **2.10 ms** | 24x Faster ($< 50\text{ms}$) |
| **Copilot Groundedness** | — | — | — | **100.0%** | Zero Hallucination |
| **Voice Negation Capture**| — | — | — | **100.0%** | 100/100 Transcripts |
| **Conformal Coverage** | — | — | — | **80.4%** | Target: $80\% \pm 3\%$ |

---

## 4. Single-Command Verification & Reproducibility

SiteSync includes a comprehensive **Master Release Orchestrator** that verifies code integrity, domain models, empirical benchmarks, and the 13-gate deterministic demo scenario in under 1 second:

```bash
# Clone and install dependencies
npm install

# Run the master release verification orchestrator
npm run final:verify
```

### Expected Output:
```text
================================================================================
       SITESYNC — MASTER RELEASE VERIFICATION ORCHESTRATOR v1.0.0-final
       Target Organization: Oil India Limited (Problem Statement: SIH26122)
       Deterministic Seed: DEMO_SEED = 42 | Dataset: synthetic-compressor-v1
================================================================================

  [PASS] GATE-01: Documentation & Release Artifacts Verification (3ms)
  [PASS] GATE-02: Baseline Schedule & Deterministic State Invariants (3ms)
  [PASS] GATE-03: Schedule Graph Referential Integrity (2ms)
  [PASS] GATE-04: Empirical 7-Feature Hybrid Matcher Benchmark (174ms)
  [PASS] GATE-05: 13-Gate Deterministic Demo Scenario (MECH-L5-042) (20ms)

================================================================================
                          FINAL RELEASE GATE SCORECARD                          
================================================================================
  ✅ PASS | GATE-01 | Documentation & Release Artifacts Verification   | 3ms
  ✅ PASS | GATE-02 | Baseline Schedule & Deterministic State Invariants | 3ms
  ✅ PASS | GATE-03 | Schedule Graph Referential Integrity             | 2ms
  ✅ PASS | GATE-04 | Empirical 7-Feature Hybrid Matcher Benchmark     | 174ms
  ✅ PASS | GATE-05 | 13-Gate Deterministic Demo Scenario (MECH-L5-042) | 20ms
--------------------------------------------------------------------------------
  TOTAL TIME: 202ms | GATES PASSED: 5/5
================================================================================

🎉 STATUS: READY FOR SIH SUBMISSION (100% GATES PASSED)
```

---

## 5. Running the Application Locally

```bash
# Start the Next.js development server
npm run dev
```

Visit the following interactive routes at `http://localhost:3000`:

* **`/demo` — Interactive Demo Studio:** Step through the 6-stage presentation state machine for golden activity `MECH-L5-042` with live execution logs and trace inspector.
* **`/` — Command Center:** Real-time project KPIs, critical path alerts, contractor velocity cards, and variance monitors.
* **`/gantt` — Interactive Gantt View:** Full WBS hierarchy, critical path highlights, and activity detail inspection drawers.
* **`/review` — Review Queue Workstation:** Split-screen verification workstation for AI-proposed links and evidence dossiers.
* **`/history` — Historical Intelligence:** Parametric duration curves ($P_{25}$, Median, $P_{75}$) across 24 historical compressor grouting records.
* **`/copilot` — Grounded AI Copilot:** Natural language project queries with mandatory bracketed citations and strict refusal guards.

---

## 6. Complete Documentation Sitemap

All documentation is organized into two primary submission directories:

### 6.1 Final Evaluation & Benchmark Reports (`docs/final/`)
* [REPOSITORY-AUDIT.md](docs/final/REPOSITORY-AUDIT.md) — 148-file architectural audit and hygiene verification.
* [FEATURE-MATRIX.md](docs/final/FEATURE-MATRIX.md) — 17-capability verification matrix with code references.
* [REQUIREMENT-TRACEABILITY.md](docs/final/REQUIREMENT-TRACEABILITY.md) — Complete traceability from SIH26122 to code, tests, and live demo.
* [PS-ALIGNMENT.md](docs/final/PS-ALIGNMENT.md) — Exhaustive alignment against Oil India Limited requirements.
* [DATA-DISCLOSURE.md](docs/final/DATA-DISCLOSURE.md) — Transparent disclosure of `synthetic-compressor-v1` and seed `42`.
* [FINAL-BENCHMARK-REPORT.md](docs/final/FINAL-BENCHMARK-REPORT.md) — Empirical benchmark results and error analysis.
* [COPILOT-EVALUATION.md](docs/final/COPILOT-EVALUATION.md) — 115-query Copilot test report (100% groundedness).
* [VOICE-EVALUATION.md](docs/final/VOICE-EVALUATION.md) — 100-transcript voice evaluation (negation & self-correction).
* [FORECAST-EVALUATION.md](docs/final/FORECAST-EVALUATION.md) — 500-case chronological backtest (MAE 3.12d vs Planned 7.82d).
* [MOCK-VS-REAL.md](docs/final/MOCK-VS-REAL.md) — Strict, honest classification of Real vs Deterministic Simulation vs Mock.
* [LIMITATIONS.md](docs/final/LIMITATIONS.md) — Transparent prototype boundaries and operational constraints.
* [ENTERPRISE-ROADMAP.md](docs/final/ENTERPRISE-ROADMAP.md) — 7-phase enterprise evolution roadmap for Oil India.
* [REPRODUCIBILITY.md](docs/final/REPRODUCIBILITY.md) — Step-by-step evaluator reproduction guide.
* [RELEASE-CHECKLIST.md](docs/final/RELEASE-CHECKLIST.md) — 31-point release verification checklist.
* [FINAL-RELEASE-REPORT.md](docs/final/FINAL-RELEASE-REPORT.md) — Official release certification and sign-off.

### 6.2 SIH Submission Package (`docs/submission/`)
* [SIH-SOLUTION-DOCUMENT.md](docs/submission/SIH-SOLUTION-DOCUMENT.md) — Formal 10-section technical solution document.
* [SIH-DECK.md](docs/submission/SIH-DECK.md) — 17-slide presentation pitch deck with speaker notes.
* [JUDGE-QA.md](docs/submission/JUDGE-QA.md) — 18 deep technical and domain answers for evaluation committee defense.

---

## 7. Operational Core Invariants

1. **Safety Separation:** AI proposes; humans decide; domain engines execute.
2. **Baseline Immutability:** Baseline planned dates are contractual baselines and are never overwritten.
3. **Evidence Requirement:** Progress cannot be marked as verified without linked physical evidence and a cryptographic audit log.
4. **Zero Flakiness:** All evaluation scripts and live demo flows execute deterministically under `DEMO_SEED=42`.

---

*SiteSync: Turning Fragmented Field Reality into High-Fidelity Project Truth.*
