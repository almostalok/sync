# SiteSync Matcher Benchmark & Error Analysis

## Baseline Performance Comparison

| Model | Top-1 Accuracy | Top-3 Recall | Top-5 Recall | Precision | Recall | F1 Score | False Auto-Link Rate | Avg Latency |
|---|---|---|---|---|---|---|---|---|
| **Baseline 1 (Exact String)** | 10.0% | 10.0% | 10.0% | 0.0% | 0.0% | 0.0% | 0.0% | 0.5ms |
| **Baseline 2 (Fuzzy Token)** | 50.0% | 50.0% | 50.0% | 75.0% | 52.2% | 61.5% | 25.0% | 0.7ms |
| **Baseline 3 (Embedding Only)** | 40.0% | 40.0% | 40.0% | 40.0% | 100.0% | 57.1% | 60.0% | 1.4ms |
| **SiteSync Hybrid Engine** | **90.0%** | **93.3%** | **93.3%** | **89.7%** | **100.0%** | **94.5%** | **0.0%** | **2ms** |

---

## Error Analysis Summary
* **Total Evaluated**: 30
* **Errors / Misclassifications**: 3
* **Unmatched Recall**: 33.3%
* **False Auto-Link Rate**: 0.0% (Guarded by candidate margin and review policy)
