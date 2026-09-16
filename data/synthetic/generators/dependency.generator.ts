import { DependencyType, Discipline } from '@sitesync/types';
import { SyntheticActivity, SyntheticDependency } from '../types';
import { PRNG } from '../noise/prng';

export class DependencyGenerator {
  constructor(private prng: PRNG) {}

  public generate(
    projectId: string,
    activities: SyntheticActivity[],
    targetCount: number = 5000
  ): SyntheticDependency[] {
    const dependencies: SyntheticDependency[] = [];
    const edgeSet = new Set<string>();

    // Group activities by discipline and location
    const byDiscipline: Record<string, SyntheticActivity[]> = {};
    const byLocation: Record<string, SyntheticActivity[]> = {};

    for (const act of activities) {
      if (!byDiscipline[act.discipline]) byDiscipline[act.discipline] = [];
      byDiscipline[act.discipline].push(act);

      const locKey = act.location.split(' - ')[0] || act.location;
      if (!byLocation[locKey]) byLocation[locKey] = [];
      byLocation[locKey].push(act);
    }

    // 1. Generate Intra-discipline sequential chains within the same location (e.g. Excavation -> PCC -> Reinforcement)
    for (const [, locActivities] of Object.entries(byLocation)) {
      // Sort activities temporally by plannedStart
      locActivities.sort((a, b) => new Date(a.plannedStart).getTime() - new Date(b.plannedStart).getTime());

      for (let i = 0; i < locActivities.length - 1; i++) {
        const pred = locActivities[i];
        // Connect to 1-3 forward successors within chronological reach
        const maxForward = Math.min(locActivities.length - 1, i + 4);
        for (let j = i + 1; j <= maxForward; j++) {
          const succ = locActivities[j];
          this.addDependencyEdge(projectId, pred, succ, dependencies, edgeSet);
          if (dependencies.length >= targetCount) break;
        }
        if (dependencies.length >= targetCount) break;
      }
      if (dependencies.length >= targetCount) break;
    }

    // 2. Generate Inter-discipline CPM milestones (Civil -> Mech -> Piping -> Elec -> Inst)
    const civilActs = (byDiscipline[Discipline.CIVIL] || []).filter((a) => a.activityType === 'CONCRETE');
    const mechActs = (byDiscipline[Discipline.MECHANICAL] || []).filter((a) => a.activityType === 'POSITIONING');
    const pipActs = (byDiscipline[Discipline.PIPING] || []).filter((a) => a.activityType === 'FITUP' || a.activityType === 'WELDING');
    const elecActs = (byDiscipline[Discipline.ELECTRICAL] || []).filter((a) => a.activityType === 'TERMINATION');
    const instActs = (byDiscipline[Discipline.INSTRUMENTATION] || []).filter((a) => a.activityType === 'LOOP_CHECK');

    // Civil Concrete -> Mechanical Positioning
    for (const civ of civilActs) {
      const matchingMechs = mechActs.filter((m) => new Date(m.plannedStart) >= new Date(civ.plannedFinish));
      if (matchingMechs.length > 0) {
        const targetMech = this.prng.pick(matchingMechs);
        this.addDependencyEdge(projectId, civ, targetMech, dependencies, edgeSet);
      }
    }

    // Mechanical Positioning -> Piping Fitup/Welding
    for (const mech of mechActs) {
      const matchingPips = pipActs.filter((p) => new Date(p.plannedStart) >= new Date(mech.plannedFinish));
      if (matchingPips.length > 0) {
        const targetPip = this.prng.pick(matchingPips);
        this.addDependencyEdge(projectId, mech, targetPip, dependencies, edgeSet);
      }
    }

    // Piping Welding/Hydro -> Electrical & Instrumentation
    for (const pip of pipActs) {
      const matchingElecs = elecActs.filter((e) => new Date(e.plannedStart) >= new Date(pip.plannedFinish));
      if (matchingElecs.length > 0) {
        const targetElec = this.prng.pick(matchingElecs);
        this.addDependencyEdge(projectId, pip, targetElec, dependencies, edgeSet);
      }
      const matchingInsts = instActs.filter((i) => new Date(i.plannedStart) >= new Date(pip.plannedFinish));
      if (matchingInsts.length > 0) {
        const targetInst = this.prng.pick(matchingInsts);
        this.addDependencyEdge(projectId, pip, targetInst, dependencies, edgeSet);
      }
    }

    // 3. Dense forward DAG connections until target count reached
    const sortedActivities = [...activities].sort(
      (a, b) => new Date(a.plannedStart).getTime() - new Date(b.plannedStart).getTime()
    );

    let scanIdx = 0;
    while (dependencies.length < targetCount && scanIdx < sortedActivities.length - 1) {
      const pred = sortedActivities[scanIdx];
      // Pick a successor that strictly starts on or after pred start (strictly acyclic)
      const possibleSuccs = sortedActivities.slice(scanIdx + 1, Math.min(sortedActivities.length, scanIdx + 25));
      if (possibleSuccs.length > 0) {
        const succ = this.prng.pick(possibleSuccs);
        this.addDependencyEdge(projectId, pred, succ, dependencies, edgeSet);
      }
      scanIdx = (scanIdx + 1) % (sortedActivities.length - 1);
    }

    return dependencies;
  }

  private addDependencyEdge(
    projectId: string,
    pred: SyntheticActivity,
    succ: SyntheticActivity,
    dependencies: SyntheticDependency[],
    edgeSet: Set<string>
  ): boolean {
    if (pred.id === succ.id) return false;

    // Temporal precedence check to guarantee DAG acyclicity
    const predStart = new Date(pred.plannedStart).getTime();
    const succStart = new Date(succ.plannedStart).getTime();
    if (predStart > succStart) return false;

    const edgeKey = `${pred.id}->${succ.id}`;
    if (edgeSet.has(edgeKey)) return false;

    edgeSet.add(edgeKey);

    // Pick realistic dependency type: 85% FS, 10% SS, 4% FF, 1% SF
    const typeRoll = this.prng.next();
    let type = DependencyType.FS;
    let lag = 0;

    if (typeRoll > 0.96) {
      type = DependencyType.SF;
    } else if (typeRoll > 0.92) {
      type = DependencyType.FF;
      lag = this.prng.nextInt(0, 3);
    } else if (typeRoll > 0.82) {
      type = DependencyType.SS;
      lag = this.prng.nextInt(1, 5);
    } else {
      type = DependencyType.FS;
      lag = this.prng.chance(0.2) ? this.prng.nextInt(1, 3) : 0;
    }

    const id = `dep-${pred.activityCode.toLowerCase()}-${succ.activityCode.toLowerCase()}`;
    dependencies.push({
      id,
      predecessorId: pred.id,
      successorId: succ.id,
      type,
      lag,
    });

    return true;
  }
}
