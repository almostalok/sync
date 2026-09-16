import { SyntheticDatasetConfig } from '../types';

export class ProjectGenerator {
  public generate(config: SyntheticDatasetConfig) {
    const plannedStart = new Date(config.startDate);
    const plannedFinish = new Date(plannedStart);
    plannedFinish.setDate(plannedFinish.getDate() + config.durationDays);

    return {
      id: `proj-${config.projectCode.toLowerCase()}`,
      code: config.projectCode,
      name: config.projectName,
      description: 'Comprehensive engineering, procurement, and construction of gas booster compressor trains and utility systems.',
      location: 'Duliajan, Assam (OIL Production Facility)',
      status: 'ACTIVE',
      plannedStart: plannedStart.toISOString(),
      plannedFinish: plannedFinish.toISOString(),
      plannedProgress: 0.62,
      actualProgress: 0.54,
    };
  }
}
