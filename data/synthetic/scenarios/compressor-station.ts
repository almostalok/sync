import { SyntheticDatasetConfig } from '../types';

export const COMPRESSOR_STATION_SCENARIO: SyntheticDatasetConfig = {
  seed: 42,
  projectCode: 'CSE-2026',
  projectName: 'Compressor Station Expansion',
  startDate: '2026-03-01T08:00:00.000Z',
  durationDays: 240,
  activityCount: 1000,
  dependencyCount: 5000,
  reportCount: 2000,
  eventCount: 1500,
  difficultyDistribution: {
    exact: 0.20,
    paraphrase: 0.20,
    noisy: 0.20,
    ambiguous: 0.15,
    granularityMismatch: 0.15,
    unmatched: 0.10,
  },
};
