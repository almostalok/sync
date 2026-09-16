export interface MatchingWeightsConfig {
  semantic: number;
  discipline: number;
  location: number;
  wbs: number;
  temporal: number;
  dependency: number;
  entity: number;
}

export const MATCHING_WEIGHTS: MatchingWeightsConfig = {
  semantic: 0.40,
  discipline: 0.15,
  location: 0.10,
  wbs: 0.10,
  temporal: 0.10,
  dependency: 0.10,
  entity: 0.05,
};

export const CONFIDENCE_POLICY = {
  AUTO_LINK_THRESHOLD: 0.90,
  REVIEW_REQUIRED_THRESHOLD: 0.70,
  MAX_TOP_K_CANDIDATES: 5,
};

export const SYSTEM_DEFAULTS = {
  PROJECT_ID: 'PROJ-OIL-2026-01',
  PROJECT_CODE: 'OIL-CSE-2026',
  PROJECT_NAME: 'Compressor Station Expansion Project',
  CLIENT: 'Oil India Limited',
  LOCATION: 'Duliajan Gas Processing Terminal, Assam',
  SIMULATION_DATE: '2026-09-16',
};
