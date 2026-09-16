# SiteSync — Predictive Intelligence & Operational Explainability
**Problem Statement SIH26122**

## 1. Zero-Lookahead Data Integrity Principle
SiteSync guarantees that feature extraction as of date $T$ strictly excludes:
- Future progress updates dated $> T$
- Future DPR field reports submitted $> T$
- Post-$T$ project closure or historical records
- Future actual finish dates

This ensures all backtested metrics reflect real-world field conditions without hindsight bias.

---

## 2. Quantified Driver Attribution
Every forecast produced by SiteSync exposes structured, quantified drivers:
```json
{
  "feature": "scheduleVarianceDays",
  "value": "+4 days",
  "direction": "NEGATIVE",
  "importance": 0.35,
  "explanation": "Execution is currently 4 days behind the scheduled timeline."
}
```

Drivers translate complex regression weights into operational language that site engineers and planners can immediately action.

---

## 3. Data Reliability Grading
| Grade | Observation Threshold | Description |
|---|---|---|
| **SUFFICIENT** | $\ge 5$ verified updates | Deep progress history with stable velocity estimates. |
| **LIMITED** | $2 - 4$ verified updates | Moderate observation depth; wider prediction intervals applied. |
| **LOW_DATA** | $< 2$ updates | Heuristic / historical baseline weighting applied with maximum uncertainty bounds. |

Stale activities (no updates for $\ge 7$ days) automatically trigger a freshness penalty in both confidence and uncertainty width.
