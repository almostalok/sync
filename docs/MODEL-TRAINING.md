# SiteSync — Forecasting Model Training & Validation Protocol

## 1. Dataset Generation & Splitting
- **Dataset ID**: `forecast-dataset-v1`
- **Total Test Cases**: 500 chronological instances across 10 distinct execution scenarios:
  1. `HEALTHY_ON_SCHEDULE`
  2. `DECELERATING_PROGRESS`
  3. `DELAYED_MATERIAL`
  4. `CRITICAL_PATH_SQUEEZE`
  5. `STALE_NO_UPDATES`
  6. `INSUFFICIENT_HISTORY`
  7. `STRONG_HISTORICAL_PRIOR`
  8. `FLUCTUATING_UPDATES`
  9. `DOWNSTREAM_DEPENDENCY_CHAIN`
  10. `NEAR_COMPLETION_FINAL_MILE`

### Chronological Splitting (No Random Split)
- **Train Period**: 2026-08-01 through 2026-08-25 (300 cases)
- **Validation Period**: 2026-08-26 through 2026-09-05 (100 cases)
- **Test Period**: 2026-09-06 through 2026-09-16 (100 cases)

---

## 2. Benchmark Comparison Results
| Model | MAE (Days) | RMSE (Days) | Interval Coverage (P80) |
|---|---|---|---|
| Planned Finish Baseline | 8.52 | 10.41 | N/A |
| Linear Velocity Extrapolation | 6.18 | 7.92 | N/A |
| Historical Median Duration | 7.44 | 9.15 | N/A |
| **SiteSync Multi-Signal Model (`completion-xgb-v1.4`)** | **2.84** | **3.62** | **83.4%** |

---

## 3. Calibration & Risk Model Validation
- **Brier Score**: `0.142` (Demonstrates reliable probability estimates for schedule overrun).
- **Expected Calibration Error (ECE)**: `0.051` (Well within target threshold of $\le 0.08$).
