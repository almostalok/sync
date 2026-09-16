import { SyntheticActivity, SyntheticDependency } from '../types';
import { ValidationIssue } from './schedule-validator';

export class DependencyValidator {
  public validate(activities: SyntheticActivity[], dependencies: SyntheticDependency[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const actIdSet = new Set<string>(activities.map((a) => a.id));
    const edgeSet = new Set<string>();
    const adjList = new Map<string, string[]>();

    for (const act of activities) {
      adjList.set(act.id, []);
    }

    for (const dep of dependencies) {
      // 1. Self dependency
      if (dep.predecessorId === dep.successorId) {
        issues.push({
          type: 'ERROR',
          entity: 'Dependency',
          id: dep.id,
          message: `Self-dependency detected: activity '${dep.predecessorId}' depends on itself`,
        });
        continue;
      }

      // 2. Existence
      if (!actIdSet.has(dep.predecessorId)) {
        issues.push({
          type: 'ERROR',
          entity: 'Dependency',
          id: dep.id,
          message: `Predecessor '${dep.predecessorId}' not found in activity roster`,
        });
      }
      if (!actIdSet.has(dep.successorId)) {
        issues.push({
          type: 'ERROR',
          entity: 'Dependency',
          id: dep.id,
          message: `Successor '${dep.successorId}' not found in activity roster`,
        });
      }

      // 3. Duplicate edge
      const edgeKey = `${dep.predecessorId}->${dep.successorId}`;
      if (edgeSet.has(edgeKey)) {
        issues.push({
          type: 'ERROR',
          entity: 'Dependency',
          id: dep.id,
          message: `Duplicate dependency edge '${edgeKey}'`,
        });
      }
      edgeSet.add(edgeKey);

      if (actIdSet.has(dep.predecessorId) && actIdSet.has(dep.successorId)) {
        adjList.get(dep.predecessorId)?.push(dep.successorId);
      }
    }

    // 4. Cycle Detection (DFS)
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const dfs = (nodeId: string, path: string[]): boolean => {
      visited.add(nodeId);
      recStack.add(nodeId);

      const neighbors = adjList.get(nodeId) || [];
      for (const next of neighbors) {
        if (!visited.has(next)) {
          if (dfs(next, [...path, next])) return true;
        } else if (recStack.has(next)) {
          issues.push({
            type: 'ERROR',
            entity: 'DependencyGraph',
            id: nodeId,
            message: `Circular dependency detected in graph: ${[...path, next].join(' -> ')}`,
          });
          return true;
        }
      }

      recStack.delete(nodeId);
      return false;
    };

    for (const act of activities) {
      if (!visited.has(act.id)) {
        dfs(act.id, [act.id]);
      }
    }

    return issues;
  }
}
