import { SyntheticActivity, SyntheticWBSNode } from '../types';

export interface ValidationIssue {
  type: 'ERROR' | 'WARNING';
  entity: string;
  id: string;
  message: string;
}

export class ScheduleValidator {
  public validate(wbsNodes: SyntheticWBSNode[], activities: SyntheticActivity[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const wbsIdSet = new Set<string>(wbsNodes.map((w) => w.id));
    const activityCodeSet = new Set<string>();

    // 1. WBS Validation
    for (const node of wbsNodes) {
      if (node.level > 1 && (!node.parentId || !wbsIdSet.has(node.parentId))) {
        issues.push({
          type: 'ERROR',
          entity: 'WBSNode',
          id: node.id,
          message: `Parent node '${node.parentId}' not found for level ${node.level} node '${node.code}'`,
        });
      }
      if (!node.name || node.name.trim().length === 0) {
        issues.push({
          type: 'ERROR',
          entity: 'WBSNode',
          id: node.id,
          message: `WBS node '${node.code}' has an empty name`,
        });
      }
    }

    // 2. Activity Validation
    for (const act of activities) {
      if (activityCodeSet.has(act.activityCode)) {
        issues.push({
          type: 'ERROR',
          entity: 'Activity',
          id: act.id,
          message: `Duplicate activity code '${act.activityCode}'`,
        });
      }
      activityCodeSet.add(act.activityCode);

      if (!wbsIdSet.has(act.wbsNodeId)) {
        issues.push({
          type: 'ERROR',
          entity: 'Activity',
          id: act.id,
          message: `Activity '${act.activityCode}' references non-existent WBS node '${act.wbsNodeId}'`,
        });
      }

      const start = new Date(act.plannedStart).getTime();
      const finish = new Date(act.plannedFinish).getTime();

      if (isNaN(start) || isNaN(finish) || start > finish) {
        issues.push({
          type: 'ERROR',
          entity: 'Activity',
          id: act.id,
          message: `Activity '${act.activityCode}' has invalid date bounds: start=${act.plannedStart}, finish=${act.plannedFinish}`,
        });
      }

      if (act.plannedProgress < 0.0 || act.plannedProgress > 1.0) {
        issues.push({
          type: 'ERROR',
          entity: 'Activity',
          id: act.id,
          message: `Activity '${act.activityCode}' planned progress out of bounds (0-1): ${act.plannedProgress}`,
        });
      }

      if (act.actualProgress < 0.0 || act.actualProgress > 1.0) {
        issues.push({
          type: 'ERROR',
          entity: 'Activity',
          id: act.id,
          message: `Activity '${act.activityCode}' actual progress out of bounds (0-1): ${act.actualProgress}`,
        });
      }
    }

    return issues;
  }
}
