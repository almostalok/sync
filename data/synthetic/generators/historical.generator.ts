import { Discipline } from '@sitesync/types';
import { SyntheticHistoricalOutcome } from '../types';
import { PRNG } from '../noise/prng';

export class HistoricalGenerator {
  constructor(private prng: PRNG) {}

  public generate(projectId: string, count: number = 50): SyntheticHistoricalOutcome[] {
    const outcomes: SyntheticHistoricalOutcome[] = [];

    const delayCauses = [
      'Heavy unseasonal monsoon rainfall leading to pit water ingress',
      'Delayed delivery of long-lead 6.6kV switchgear panels from vendor',
      'Fit-up misalignment on 24-inch header requiring re-machining',
      'Permit to Work (PTW) clearance delay during hot flare operations',
      'Shortage of certified 6G GTAW pipe welders during peak mobilization',
      'Soil consolidation variance requiring localized PCC deepening',
    ];

    const contractors = [
      'Larsen & Toubro Heavy Infrastructure',
      'Bridge & Roof Co. (India) Ltd.',
      'Punj Lloyd Infrastructure',
      'Technip Energies Consortium',
      'BHEL Power Sector Eastern Region',
    ];

    const lessons = [
      'Pre-fabricate 80% spools at offsite shop to minimize site weld cycle time.',
      'Deploy continuous well-point dewatering ahead of monsoon foundation excavation.',
      'Conduct vendor 3D laser scan validation before heavy package positioning.',
      'Standardize junction box cable gland entries to avoid termination rework.',
    ];

    const disciplines = [
      Discipline.CIVIL,
      Discipline.PIPING,
      Discipline.MECHANICAL,
      Discipline.ELECTRICAL,
      Discipline.INSTRUMENTATION,
    ];

    for (let i = 1; i <= count; i++) {
      const discipline = this.prng.pick(disciplines);
      const plannedDur = this.prng.nextInt(10, 45);
      const delayDays = this.prng.chance(0.6) ? this.prng.nextInt(2, 14) : 0;
      const actualDur = plannedDur + delayDays;

      outcomes.push({
        id: `hist-${projectId}-${String(i).padStart(3, '0')}`,
        activityType: discipline === Discipline.CIVIL ? 'EXCAVATION' : (discipline === Discipline.PIPING ? 'WELDING' : 'POSITIONING'),
        discipline,
        plannedDuration: plannedDur,
        actualDuration: actualDur,
        delayDays,
        delayCause: delayDays > 0 ? this.prng.pick(delayCauses) : 'None - completed on schedule',
        contractor: this.prng.pick(contractors),
        productivity: `${(0.85 + this.prng.next() * 0.3).toFixed(2)}x standard rate`,
        lessonsLearned: this.prng.pick(lessons),
      });
    }

    return outcomes;
  }
}
