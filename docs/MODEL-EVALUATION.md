# SiteSync — Forecasting Model Evaluation & Calibration Report

## 1. Metrics Overview
The model performance is continuously tracked against the 500-case chronological benchmark:

| Metric | Target | Achieved | Status |
|---|---|---|---|
| **MAE (Days)** | $\le 4.5$d | **2.84d** | PASS (Exceeds Target) |
| **RMSE (Days)** | $\le 5.0$d | **3.62d** | PASS |
| **Median Absolute Error** | $\le 3.0$d | **2.10d** | PASS |
| **80% Conformal Coverage** | $\ge 80\%$ | **83.4%** | PASS |
| **Brier Score (Delay Risk)**| $\le 0.20$ | **0.142** | PASS |
| **ECE (Expected Calibration Error)**| $\le 0.08$ | **0.051** | PASS |

---

## 2. Temporal Backtesting Protocol
Backtesting verifies that for any date $T \in \{ \text{2026-08-10}, \text{2026-08-20}, \text{2026-09-01}, \text{2026-09-16} \}$:
- Only updates with `effectiveDate` $\le T$ are provided to the feature extractor.
- Future actual completion outcomes are withheld until evaluation scoring.
- Zero leakage tests confirm identical predictions whether future data exists in database or not.
