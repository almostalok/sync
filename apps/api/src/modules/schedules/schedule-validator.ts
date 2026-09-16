import { RawScheduleRow, ScheduleValidationError, ScheduleValidationWarning } from './schedule.types';
import { Discipline } from '@sitesync/types';

export class ScheduleValidatorService {
  private static VALID_DISCIPLINES = new Set([
    'CIVIL',
    'PIPING',
    'MECHANICAL',
    'ELECTRICAL',
    'INSTRUMENTATION',
    'HSE',
    'GENERAL',
  ]);

  public static validateRows(rows: RawScheduleRow[]): {
    errors: ScheduleValidationError[];
    warnings: ScheduleValidationWarning[];
    isValid: boolean;
  } {
    const errors: ScheduleValidationError[] = [];
    const warnings: ScheduleValidationWarning[] = [];

    const activityCodeSet = new Set<string>();
    const allActivityCodes = new Set<string>(rows.map((r) => r.activityCode?.trim()).filter(Boolean));
    const dependencyEdges: Array<{ from: string; to: string; row: number }> = [];

    rows.forEach((row, index) => {
      const rowNum = index + 2; // 1-indexed plus header

      // 1. Activity Code Check
      if (!row.activityCode || row.activityCode.trim() === '') {
        errors.push({
          code: 'MISSING_ACTIVITY_CODE',
          row: rowNum,
          field: 'activityCode',
          message: `Row ${rowNum}: Activity Code is required`,
        });
      } else {
        const cleanCode = row.activityCode.trim();
        if (activityCodeSet.has(cleanCode)) {
          errors.push({
            code: 'DUPLICATE_ACTIVITY_CODE',
            row: rowNum,
            activityCode: cleanCode,
            field: 'activityCode',
            value: cleanCode,
            message: `Row ${rowNum}: Duplicate Activity Code '${cleanCode}' detected`,
          });
        }
        activityCodeSet.add(cleanCode);
      }

      // 2. Activity Name Check
      if (!row.activityName || row.activityName.trim() === '') {
        errors.push({
          code: 'MISSING_ACTIVITY_NAME',
          row: rowNum,
          activityCode: row.activityCode,
          field: 'activityName',
          message: `Row ${rowNum}: Activity Name is required`,
        });
      }

      // 3. Dates Check
      if (!row.plannedStart || row.plannedStart.trim() === '') {
        errors.push({
          code: 'MISSING_PLANNED_START',
          row: rowNum,
          activityCode: row.activityCode,
          field: 'plannedStart',
          message: `Row ${rowNum}: Planned Start date is required`,
        });
      }

      if (!row.plannedFinish || row.plannedFinish.trim() === '') {
        errors.push({
          code: 'MISSING_PLANNED_FINISH',
          row: rowNum,
          activityCode: row.activityCode,
          field: 'plannedFinish',
          message: `Row ${rowNum}: Planned Finish date is required`,
        });
      }

      if (row.plannedStart && row.plannedFinish) {
        const start = new Date(row.plannedStart).getTime();
        const finish = new Date(row.plannedFinish).getTime();

        if (isNaN(start)) {
          errors.push({
            code: 'INVALID_START_DATE',
            row: rowNum,
            activityCode: row.activityCode,
            field: 'plannedStart',
            value: row.plannedStart,
            message: `Row ${rowNum}: Invalid Planned Start date format: '${row.plannedStart}'`,
          });
        }
        if (isNaN(finish)) {
          errors.push({
            code: 'INVALID_FINISH_DATE',
            row: rowNum,
            activityCode: row.activityCode,
            field: 'plannedFinish',
            value: row.plannedFinish,
            message: `Row ${rowNum}: Invalid Planned Finish date format: '${row.plannedFinish}'`,
          });
        }
        if (!isNaN(start) && !isNaN(finish) && start > finish) {
          errors.push({
            code: 'INVALID_DATE_SEQUENCE',
            row: rowNum,
            activityCode: row.activityCode,
            message: `Row ${rowNum}: Planned Start (${row.plannedStart}) cannot be after Planned Finish (${row.plannedFinish})`,
          });
        }
      }

      // 4. Discipline Check
      if (row.discipline) {
        const normalizedDisc = row.discipline.toUpperCase().trim();
        if (!this.VALID_DISCIPLINES.has(normalizedDisc)) {
          warnings.push({
            code: 'UNKNOWN_DISCIPLINE',
            row: rowNum,
            activityCode: row.activityCode,
            message: `Row ${rowNum}: Discipline '${row.discipline}' is unknown; defaulting to GENERAL`,
          });
        }
      }

      // 5. Predecessor References
      if (row.predecessors && row.predecessors.trim() !== '') {
        const predTokens = row.predecessors.split(/[,;]+/).map((p) => p.trim());
        for (const token of predTokens) {
          const predCode = token.split(':')[0].trim();
          if (predCode === row.activityCode) {
            errors.push({
              code: 'SELF_DEPENDENCY',
              row: rowNum,
              activityCode: row.activityCode,
              message: `Row ${rowNum}: Activity '${row.activityCode}' cannot depend on itself`,
            });
          } else if (!allActivityCodes.has(predCode)) {
            warnings.push({
              code: 'UNKNOWN_PREDECESSOR',
              row: rowNum,
              activityCode: row.activityCode,
              message: `Row ${rowNum}: Predecessor '${predCode}' is not defined in this schedule`,
            });
          } else {
            dependencyEdges.push({ from: predCode, to: row.activityCode, row: rowNum });
          }
        }
      }
    });

    // 6. Circular Dependency Detection
    const cycleErrors = this.detectCycles(dependencyEdges);
    errors.push(...cycleErrors);

    return {
      errors,
      warnings,
      isValid: errors.length === 0,
    };
  }

  private static detectCycles(
    edges: Array<{ from: string; to: string; row: number }>
  ): ScheduleValidationError[] {
    const errors: ScheduleValidationError[] = [];
    const adj = new Map<string, string[]>();

    for (const edge of edges) {
      if (!adj.has(edge.from)) adj.set(edge.from, []);
      adj.get(edge.from)!.push(edge.to);
    }

    const visited = new Set<string>();
    const recStack = new Set<string>();

    const dfs = (node: string, path: string[]) => {
      visited.add(node);
      recStack.add(node);

      const neighbors = adj.get(node) || [];
      for (const next of neighbors) {
        if (!visited.has(next)) {
          dfs(next, [...path, next]);
        } else if (recStack.has(next)) {
          errors.push({
            code: 'CIRCULAR_DEPENDENCY',
            activityCode: node,
            message: `Circular dependency detected: ${[...path, next].join(' -> ')}`,
          });
        }
      }

      recStack.delete(node);
    };

    for (const [node] of adj) {
      if (!visited.has(node)) {
        dfs(node, [node]);
      }
    }

    return errors;
  }
}
