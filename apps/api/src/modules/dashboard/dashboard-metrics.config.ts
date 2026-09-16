/**
 * Centralized Dashboard & Operational Metric Configuration
 * SiteSync — Planning → Reality Intelligence (SIH26122)
 */

export const DASHBOARD_CONFIG = {
  // Stale threshold in hours: if an activity has not received a verified field update in > 48h
  STALE_AFTER_HOURS: 48,

  // Schedule delay variance threshold in days
  SCHEDULE_DELAY_DAYS_THRESHOLD: 2,
  CRITICAL_SCHEDULE_DELAY_DAYS_THRESHOLD: 5,

  // Progress lag threshold: actual progress vs planned progress delta (e.g. -0.15 = 15% lag)
  PROGRESS_LAG_THRESHOLD: 0.15,

  // Low confidence match threshold on critical activities
  LOW_CONFIDENCE_THRESHOLD: 0.70,

  // Overall progress calculation methodology
  PROGRESS_METHODOLOGY: 'DURATION_WEIGHTED', // weighted project progress = Σ(actualProgress * plannedDuration) / Σ(plannedDuration)

  // Project Health Status Deterministic Thresholds:
  // - CRITICAL: Critical path activity delayed > 5 days OR > 5 critical path activities at risk
  // - DELAYED: Schedule variance > 3 days OR overall progress lag > 10%
  // - AT_RISK: Schedule variance > 0 days OR > 3 open risks OR stale activities > 15%
  // - ON_TRACK: Schedule variance <= 0 days AND no critical delays
  STATUS_THRESHOLDS: {
    CRITICAL_VARIANCE_DAYS: 5,
    DELAYED_VARIANCE_DAYS: 2,
    AT_RISK_VARIANCE_DAYS: 0,
    CRITICAL_RISK_COUNT: 3,
    MAX_PROGRESS_LAG_PERCENT: 10,
  },
} as const;
