# SiteSync — Synthetic Data Engine Architecture

## 1. Overview
The **SiteSync Synthetic Data Engine** is a deterministic, configurable infrastructure simulation engine designed to generate realistic industrial project data for benchmarking, evaluation, and development.

It solves the cold-start problem in industrial AI by simulating complex Oil & Gas EPC schedules and realistic messy field reports.

---

## 2. Simulation Hierarchy

```text
Project (Compressor Station Expansion)
  ↓
WBS (L1 to L6 Hierarchy)
  ↓
L5/L6 Activities (~1,000 items with unique codes, durations, and dependencies)
  ↓
CPM Dependency Network (~5,000 edges, strictly acyclic DAG)
  ↓
Field Reports (~2,000 documents across 6 layout archetypes)
  ↓
Ground Truth Execution Events (~1,500 labeled records across 7 difficulty levels)
  ↓
Benchmark Splits (Train 70% / Validation 15% / Test 15%)
```

---

## 3. Difficulty Taxonomy

Every generated execution event is classified into one of 7 difficulty tiers:

| Tier | Level | Distribution | Characteristics | Matching Expectation |
|---|---|---|---|---|
| **1** | `EXACT` | 20% | Structured code prefix, standard action, clean location | High confidence auto-link (score > 0.90) |
| **2** | `MINOR_VARIATION` | 10% | Casing variation, minor punctuation | High confidence auto-link (score > 0.85) |
| **3** | `PARAPHRASE` | 10% | Semantic rephrasing, synonym substitutions | Semantic vector match (score > 0.78) |
| **4** | `NOISY` | 20% | Typos (keyboard adjacency, transposition), heavy site abbreviations (`COMP`, `FDN`, `EXC`, `REINF`) | Fuzzy/Hybrid matching |
| **5** | `AMBIGUOUS` | 15% | Missing equipment identifier (e.g. C-101 vs C-102); matches multiple candidate activities | Routes to Human Review Queue |
| **6** | `GRANULARITY_MISMATCH` | 15% | References sub-scopes (North Section, Tier 2, Bay 1) mapping to parent activities | Hierarchical parent-scope resolution |
| **7** | `UNMATCHED` | 10% | Out-of-scope site events (housekeeping, rain dewatering, temporary access roads) | Correctly classified as UNMATCHED (`groundTruthActivityId = null`) |

---

## 4. Benchmark Isolation & Zero Data Leakage

Benchmark records are generated in `data/benchmark/`:
* `train.jsonl` (70%): Used for fine-tuning embeddings and few-shot retrievers.
* `validation.jsonl` (15%): Used for hyperparameter tuning of matching weights.
* `test.jsonl` (15%): Sealed test set for objective benchmark scoring.

**Leakage Protection**: The `BenchmarkValidator` mathematically enforces that test event IDs and raw texts never appear in the training or validation splits.
