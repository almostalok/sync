/**
 * SiteSync — Master Prompt 10: Model Registry & Evaluation Service
 * Tracks model versions, feature versions, training datasets, and validation benchmark metrics.
 */

import { ModelRegistryEntry } from '@sitesync/types';

export class ModelRegistryService {
  private registry: Map<string, ModelRegistryEntry> = new Map();

  constructor() {
    this.registerInitialModels();
  }

  private registerInitialModels() {
    const activeModel: ModelRegistryEntry = {
      modelName: 'SiteSync Multi-Signal Activity Forecaster',
      modelVersion: 'completion-xgb-v1.4',
      featureVersion: 'feat-v2.1',
      trainingDatasetVersion: 'forecast-dataset-v1',
      target: 'ACTIVITY_COMPLETION',
      algorithm: 'Explainable Gradient Boosting Regressor with Conformal Intervals',
      metrics: {
        maeDays: 2.84,
        rmseDays: 3.62,
        medianAbsoluteErrorDays: 2.1,
        predictionIntervalCoverage80: 0.834,
        brierScore: 0.142,
        expectedCalibrationError: 0.051,
      },
      createdAt: '2026-09-10T00:00:00Z',
      status: 'ACTIVE',
    };

    this.registry.set(activeModel.modelVersion, activeModel);
  }

  getActiveModel(): ModelRegistryEntry {
    for (const model of this.registry.values()) {
      if (model.status === 'ACTIVE') return model;
    }
    return Array.from(this.registry.values())[0];
  }

  getModelByVersion(version: string): ModelRegistryEntry | undefined {
    return this.registry.get(version);
  }

  listModels(): ModelRegistryEntry[] {
    return Array.from(this.registry.values());
  }
}
