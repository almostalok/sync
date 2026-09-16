import { DelayCause, SampleQuality } from '@sitesync/types';

/**
 * Centralized Configuration for Historical Intelligence & Institutional Memory
 * SiteSync — Planning → Reality Intelligence (SIH26122)
 */

export const HISTORICAL_CONFIG = {
  // Sample size quality thresholds
  SAMPLE_THRESHOLDS: {
    STRONGER_HISTORICAL_BASE_MIN: 20, // >= 20 samples
    LIMITED_MIN: 5,                   // 5 - 19 samples
    LOW_SAMPLE_MAX: 4,                // < 5 samples
  },

  // Controlled Delay Taxonomy Display Labels & Descriptions
  DELAY_TAXONOMY: {
    [DelayCause.MATERIAL]: {
      label: 'Material & Equipment Procurement Delays',
      description: 'Vendor supply chain delays, damaged delivery, or spec non-conformance.',
    },
    [DelayCause.LABOR]: {
      label: 'Labor Availability & Skill Shortage',
      description: 'Shortage of certified welders, fitters, or trade labor.',
    },
    [DelayCause.DESIGN]: {
      label: 'Engineering & Design Revisions',
      description: 'Isometric drawings modification, clash resolution, or IFC drawing delays.',
    },
    [DelayCause.EQUIPMENT]: {
      label: 'Site Equipment & Heavy Machinery Breakdown',
      description: 'Crane unavailability, excavator hydraulic failure, or rig breakdown.',
    },
    [DelayCause.WEATHER]: {
      label: 'Monsoon & Adverse Weather Conditions',
      description: 'Heavy rainfall, site waterlogging, or excessive wind speed preventing erection.',
    },
    [DelayCause.CONTRACTOR]: {
      label: 'Contractor Manpower & Subcontractor Mobilization',
      description: 'Welder absenteeism, certified rigger shortage, or subcontractor disputes.',
    },
    [DelayCause.APPROVAL]: {
      label: 'Regulatory & Client Inspection Approvals',
      description: 'Hydrotest clearance, safety permit-to-work delay, or third-party NDT sign-off.',
    },
    [DelayCause.SITE_ACCESS]: {
      label: 'Right of Way (RoW) & Site Handover',
      description: 'Land clearance delay, physical obstruction, or security clearance hold.',
    },
    [DelayCause.SAFETY]: {
      label: 'HSE Incident & Safety Stand-down',
      description: 'Near-miss investigation, gas leak alarm drill, or mandatory safety briefing.',
    },
    [DelayCause.QUALITY_REWORK]: {
      label: 'Quality Inspection & Weld Rework',
      description: 'Radiography testing (RT) failure, concrete honeycombing repair, or re-alignment.',
    },
    [DelayCause.LOGISTICS]: {
      label: 'Transport & Site Logistics Clearance',
      description: 'Heavy-lift road transit delays, highway permit clearance, or terminal congestion.',
    },
    [DelayCause.PLANNING]: {
      label: 'Schedule Float & Interface Sequencing',
      description: 'Predecessor clash, workfront unavailability due to overlapping packages.',
    },
    [DelayCause.OTHER]: {
      label: 'Other Documented Site Factors',
      description: 'Documented local conditions or non-standard constraints.',
    },
    [DelayCause.UNKNOWN]: {
      label: 'Undocumented Delay Cause',
      description: 'Variance occurred without verified causal explanation recorded in DPRs.',
    },
  } as Record<DelayCause, { label: string; description: string }>,

  // Similarity ranking component weights
  SIMILARITY_WEIGHTS: {
    ACTIVITY_TYPE_EXACT: 0.40,
    DISCIPLINE_MATCH: 0.20,
    PROJECT_TYPE_MATCH: 0.15,
    QUANTITY_COMPATIBILITY: 0.15,
    LOCATION_SIMILARITY: 0.10,
  },

  // Warning text templates for small samples
  SAMPLE_WARNINGS: {
    [SampleQuality.LOW_SAMPLE]: 'Low sample size (< 5 completed historical tasks). Treat this benchmark as an indicative reference rather than a statistical certainty.',
    [SampleQuality.LIMITED]: 'Limited sample size (5–19 tasks). Moderate historical confidence based on past Oil India project outcomes.',
    [SampleQuality.STRONGER_HISTORICAL_BASE]: 'Strong statistical baseline (20+ verified tasks) across multiple historical capital facilities.',
    [SampleQuality.INSUFFICIENT_HISTORY]: 'Insufficient verified historical records to compute statistically valid duration or productivity distributions.',
  } as Record<SampleQuality, string>,
};
