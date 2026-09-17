# SiteSync — Reproducibility & Independent Verification Guide

**Version:** 1.0.0  
**Target:** Evaluation Committee, Hackathon Judges, Enterprise Auditors  
**Dataset:** `synthetic-compressor-v1` (Seed: 42)

---

## 1. Quick Verification (30 Seconds)

To verify the entire repository, test suites, deterministic golden demo, and benchmarks in a single automated pass:

```bash
# 1. Install dependencies
npm install

# 2. Run the master release verification orchestrator
npm run final:verify
```

Expected output:
```text
================================================================================
          SITESYNC — FINAL RELEASE VERIFICATION ORCHESTRATOR v1.0.0
================================================================================
[✓] GATE 1: Environment & Dependencies Validated
[✓] GATE 2: Repository Architecture Integrity (Zero circular dependencies)
[✓] GATE 3: TypeScript Type Checking (Zero compile errors)
[✓] GATE 4: Unit & Integration Test Suites Passed (15 suites)
[✓] GATE 5: Security & Secret Scan (Zero plaintext keys)
[✓] GATE 6: Hybrid Matching Engine Empirical Benchmark Passed
    - Top-1 Accuracy: 90.0% (Threshold: ≥ 85.0%)
    - F1 Score:       94.5% (Threshold: ≥ 90.0%)
    - False Auto-Link: 0.0% (Threshold: = 0.0%)
    - Mean Latency:    2.1ms (Threshold: < 50ms)
[✓] GATE 7: Deterministic Golden Demo Verification (13/13 Steps Verified)
[✓] GATE 8: Production Build Check Passed

FINAL STATUS: READY FOR SUBMISSION
```

---

## 2. System Prerequisites

| Component | Minimum Requirement | Verified Environment |
| :--- | :--- | :--- |
| **OS** | Windows 10/11, macOS 13+, Ubuntu 22.04 LTS | Windows 11 Enterprise / x64 |
| **Node.js** | `>= 18.18.0` | `v22.14.0` |
| **Package Manager** | `npm >= 9.0` or `pnpm >= 8.0` | `npm 10.9.2` / `pnpm 9.15.4` |
| **Browser** | Chromium-based (Chrome, Edge) or Firefox | Google Chrome 128+ |

---

## 3. Step-by-Step Reproduction Workflow

### Step 3.1: Clone & Configure
```bash
git clone https://github.com/almostalok/sync.git
cd sync
npm install
cp .env.example .env
```

### Step 3.2: Deterministic State Reset
Ensure the database and demo runtime are seeded to the pristine golden state (`DEMO_SEED=42`):
```bash
npm run demo:reset
```
*Verification Check:* Confirms activity `MECH-L5-042` ("Compressor Foundation Grouting") is set to `NOT_STARTED` with 0% progress and baseline planned finish `2026-09-16`.

### Step 3.3: Execute Individual Test Suites
```bash
# Run Vitest test suites
npm test
```
*Expected Result:* 15 test suites pass, verifying:
* Domain model invariants
* Hybrid matching engine with multi-factor scoring
* Schedule synchronization and critical path calculations
* Historical distribution calculations (P25, Median, P75)
* Grounded Copilot prompt guards and citation verification
* Supervisor Voice negation detection and Hinglish handling

### Step 3.4: Run Empirical Hybrid Matcher Benchmark
```bash
npx tsx scripts/run-benchmark.ts
```
*Expected Result:*
```text
================================================================================
              SITESYNC MATCHING ENGINE BENCHMARK REPORT
================================================================================
1. Exact String Matching Baseline:
   Top-1 Accuracy: 10.0% | Top-3 Recall: 10.0% | F1 Score: 0.0%
2. Token Jaccard / Fuzzy Baseline:
   Top-1 Accuracy: 50.0% | Top-3 Recall: 70.0% | F1 Score: 61.5%
3. Cosine Embedding Baseline:
   Top-1 Accuracy: 40.0% | Top-3 Recall: 60.0% | F1 Score: 57.1%
4. SiteSync 7-Feature Hybrid Matcher:
   Top-1 Accuracy:    90.0%
   Top-3 Recall:      93.3%
   Precision:         89.7%
   Recall:           100.0%
   F1 Score:          94.5%
   False Auto-Link:    0.0% (Zero unverified auto-links above 0.90)
   Avg Latency:        2.10 ms
================================================================================
```

### Step 3.5: Run Deterministic Demo Verifier
```bash
npm run demo:verify
```
*Expected Result:* 13 of 13 verification checks pass within < 50ms, confirming that every state transition in the 6-step demo flow operates deterministically without network flakiness.

---

## 4. Running the Interactive UI

Start the local development server:
```bash
npm run dev
```
Access the application at `http://localhost:3000`:

| Route | View Purpose | Evaluator Action |
| :--- | :--- | :--- |
| `/demo` | **Interactive Demo Studio** | Step through the 6-stage presentation state machine, observe real-time audit logs and live trace inspector |
| `/` | **Command Center** | Inspect real-time project KPIs, critical path activity alerts, and variance cards |
| `/gantt` | **Gantt Schedule View** | View interactive WBS hierarchy, critical path highlights, and inspect activity detail drawers |
| `/review` | **Review Queue Workstation** | Inspect AI-proposed links, confidence breakdowns, and perform 1-click approvals |
| `/history` | **Historical Intelligence** | Query similar past activities, view parametric duration distributions and P25/P50/P75 percentiles |
| `/copilot` | **Grounded AI Copilot** | Test queries with strict citation grounding, observe zero-hallucination guardrails |

---

## 5. Clean Environment Build Verification

To verify that the application compiles cleanly for production deployment:
```bash
npm run build
```
*Expected Result:* Clean Next.js production build output without syntax errors, missing exports, or unresolved imports.
