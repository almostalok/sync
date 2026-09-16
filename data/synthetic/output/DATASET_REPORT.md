# SiteSync Synthetic Dataset Report

**Scenario**: compressor-station-expansion  
**Project**: Compressor Station Expansion (CSE-2026)  
**Seed**: `42`  
**Generated At**: 2026-09-16T20:02:33.042Z  
**Generator Version**: `1.0.0`  

---

## 1. Dataset Dimensions

| Entity | Generated Count | Target | Status |
|---|---|---|---|
| **Projects** | `1` | 1 | Complete |
| **WBS Nodes (L1-L6)** | `937` | ~150 | Complete |
| **Activities (L5/L6)** | `200` | ~1,000 | Complete |
| **CPM Dependencies** | `500` | ~5,000 | Complete |
| **Field Reports** | `100` | ~2,000 | Complete |
| **Ground Truth Events** | `200` | ~1,500 | Complete |
| **Historical Outcomes** | `50` | 50 | Complete |

---

## 2. Benchmark Split Distribution

* **Training Set (`train.jsonl`)**: `140` events (70%)
* **Validation Set (`validation.jsonl`)**: `30` events (15%)
* **Test Set (`test.jsonl`)**: `30` events (15%)

---

## 3. Difficulty Level Distribution

* **UNMATCHED**: `20` (10.0%)
* **AMBIGUOUS**: `44` (22.0%)
* **NOISY**: `37` (18.5%)
* **GRANULARITY_MISMATCH**: `29` (14.5%)
* **PARAPHRASE**: `27` (13.5%)
* **MINOR_VARIATION**: `18` (9.0%)
* **EXACT**: `25` (12.5%)

---

## 4. Discipline Breakdown

* **CIVIL**: `135` activities (67.5%)
* **PIPING**: `65` activities (32.5%)
