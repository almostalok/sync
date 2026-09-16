import { Discipline, ActivityStatus } from '@sitesync/types';
import { SyntheticActivity, SyntheticWBSNode } from '../types';
import { PRNG } from '../noise/prng';
import { DISCIPLINE_ACTIVITY_TEMPLATES } from '../dictionaries/activities';
import { PROJECT_LOCATIONS } from '../dictionaries/locations';
import { EQUIPMENT_TAGS } from '../dictionaries/equipment';

export class ActivityGenerator {
  constructor(private prng: PRNG) {}

  public generate(
    projectId: string,
    wbsNodes: SyntheticWBSNode[],
    targetCount: number = 1000,
    projectStartDateStr: string = '2026-03-01T08:00:00.000Z'
  ): SyntheticActivity[] {
    const activities: SyntheticActivity[] = [];
    const baseDate = new Date(projectStartDateStr);

    // Filter L5 and L6 nodes for direct activity assignment
    const terminalNodes = wbsNodes.filter((n) => n.level >= 5);
    const codesSet = new Set<string>();

    const disciplineCounters: Record<string, number> = {
      CIV: 1,
      PIP: 1,
      MECH: 1,
      ELEC: 1,
      INST: 1,
      HSE: 1,
      GEN: 1,
    };

    const disciplinePrefixMap: Record<Discipline, string> = {
      [Discipline.CIVIL]: 'CIV',
      [Discipline.PIPING]: 'PIP',
      [Discipline.MECHANICAL]: 'MECH',
      [Discipline.ELECTRICAL]: 'ELEC',
      [Discipline.INSTRUMENTATION]: 'INST',
      [Discipline.HSE]: 'HSE',
      [Discipline.GENERAL]: 'GEN',
    };

    let activityIndex = 0;

    // Distribute activities across terminal WBS nodes systematically
    while (activities.length < targetCount) {
      for (const wbsNode of terminalNodes) {
        if (activities.length >= targetCount) break;

        const discipline = wbsNode.discipline;
        const templates = DISCIPLINE_ACTIVITY_TEMPLATES[discipline] || DISCIPLINE_ACTIVITY_TEMPLATES[Discipline.CIVIL];
        const template = templates[activityIndex % templates.length];

        const prefix = disciplinePrefixMap[discipline];
        const seqNum = disciplineCounters[prefix]++;
        const activityCode = `${prefix}-${template.activityType.slice(0, 4)}-${String(seqNum).padStart(4, '0')}`;

        if (codesSet.has(activityCode)) continue;
        codesSet.add(activityCode);

        // Pick matching location and equipment
        const locationObj = this.prng.pick(PROJECT_LOCATIONS);
        const subLoc = this.prng.pick(locationObj.subLocations);
        const objectName = this.prng.pick(template.objects);
        const matchingEquipment = EQUIPMENT_TAGS.filter((e) => e.discipline === discipline);
        const equipment = matchingEquipment.length > 0 && this.prng.chance(0.6)
          ? this.prng.pick(matchingEquipment)
          : undefined;

        const eqSuffix = equipment ? ` [${equipment.tag}]` : '';
        const name = `${template.action} - ${objectName}${eqSuffix}`;
        const description = `${template.action} for ${objectName}${equipment ? ` on unit ${equipment.name} (${equipment.tag})` : ''} located at ${locationObj.name} (${subLoc}).`;

        // Calculate schedule timeline
        const duration = this.prng.nextInt(template.durationRange[0], template.durationRange[1]);
        const offsetDays = Math.floor((activityIndex / targetCount) * 180) + this.prng.nextInt(-3, 3);
        const actualOffset = Math.max(0, offsetDays);

        const plannedStart = new Date(baseDate);
        plannedStart.setDate(plannedStart.getDate() + actualOffset);

        const plannedFinish = new Date(plannedStart);
        plannedFinish.setDate(plannedFinish.getDate() + duration);

        // Derive progress based on timeline simulation (as of project baseline date + 100 days)
        const simCurrentDay = 100;
        let actualProgress = 0.0;
        let plannedProgress = 0.0;
        let status = ActivityStatus.NOT_STARTED;
        let actualStart: string | null = null;
        let actualFinish: string | null = null;
        let actualDuration: number | null = null;

        if (actualOffset + duration <= simCurrentDay) {
          // Completed
          plannedProgress = 1.0;
          actualProgress = 1.0;
          status = ActivityStatus.COMPLETED;
          actualStart = plannedStart.toISOString();
          const finish = new Date(plannedStart);
          actualDuration = duration + (this.prng.chance(0.2) ? this.prng.nextInt(1, 3) : 0);
          finish.setDate(finish.getDate() + actualDuration);
          actualFinish = finish.toISOString();
        } else if (actualOffset < simCurrentDay) {
          // In Progress
          const elapsed = simCurrentDay - actualOffset;
          plannedProgress = Math.min(1.0, Math.round((elapsed / duration) * 100) / 100);
          // Realistic actual progress with minor variance
          const variance = this.prng.chance(0.3) ? -0.15 : (this.prng.chance(0.2) ? 0.05 : 0.0);
          actualProgress = Math.max(0.05, Math.min(0.95, Math.round((plannedProgress + variance) * 100) / 100));
          status = variance < -0.1 ? ActivityStatus.DELAYED : ActivityStatus.IN_PROGRESS;
          actualStart = plannedStart.toISOString();
        } else {
          // Not started
          plannedProgress = 0.0;
          actualProgress = 0.0;
          status = ActivityStatus.NOT_STARTED;
        }

        const isCritical = this.prng.chance(0.25);
        const aliases = [
          `${template.activityType} ${objectName}`,
          `${objectName} ${template.action.toLowerCase()}`,
          equipment ? `${equipment.tag} ${template.activityType}` : `${locationObj.code} ${template.activityType}`,
        ];

        activities.push({
          id: `${projectId}-act-${activityCode.toLowerCase()}`,
          wbsNodeId: wbsNode.id,
          activityCode,
          name,
          description,
          discipline,
          activityType: template.activityType,
          location: `${locationObj.name} - ${subLoc}`,
          equipmentTag: equipment?.tag,
          wbsPath: wbsNode.path,
          plannedStart: plannedStart.toISOString(),
          plannedFinish: plannedFinish.toISOString(),
          plannedDuration: duration,
          actualStart,
          actualFinish,
          actualDuration,
          plannedProgress,
          actualProgress,
          status,
          criticalPath: isCritical,
          aliases,
        });

        activityIndex++;
      }
    }

    return activities;
  }
}
