import { Discipline } from '@sitesync/types';
import { SyntheticWBSNode } from '../types';
import { PROJECT_LOCATIONS } from '../dictionaries/locations';

export class WBSGenerator {
  public generate(projectId: string): SyntheticWBSNode[] {
    const nodes: SyntheticWBSNode[] = [];

    // L1 Root
    const l1: SyntheticWBSNode = {
      id: `${projectId}-wbs-l1`,
      code: '1.0',
      name: 'Compressor Station Expansion',
      level: 1,
      discipline: Discipline.GENERAL,
      parentId: null,
      path: '1.0',
    };
    nodes.push(l1);

    // L2 Disciplines
    const l2Definitions: Array<{ code: string; name: string; discipline: Discipline }> = [
      { code: '1.1', name: 'Civil & Structural Works', discipline: Discipline.CIVIL },
      { code: '1.2', name: 'Piping & Mechanical Works', discipline: Discipline.PIPING },
      { code: '1.3', name: 'Equipment Installation', discipline: Discipline.MECHANICAL },
      { code: '1.4', name: 'Electrical Systems', discipline: Discipline.ELECTRICAL },
      { code: '1.5', name: 'Instrumentation & Control', discipline: Discipline.INSTRUMENTATION },
      { code: '1.6', name: 'HSE & Commissioning', discipline: Discipline.HSE },
    ];

    for (const l2Def of l2Definitions) {
      const l2Node: SyntheticWBSNode = {
        id: `${projectId}-wbs-${l2Def.code.replace('.', '_')}`,
        code: l2Def.code,
        name: l2Def.name,
        level: 2,
        discipline: l2Def.discipline,
        parentId: l1.id,
        path: `${l1.path} > ${l2Def.code}`,
      };
      nodes.push(l2Node);

      // L3: Grouped by major Project Areas
      const relevantAreas = PROJECT_LOCATIONS.slice(0, 5);
      relevantAreas.forEach((area, areaIdx) => {
        const l3Code = `${l2Def.code}.${areaIdx + 1}`;
        const l3Node: SyntheticWBSNode = {
          id: `${projectId}-wbs-${l3Code.replace(/\./g, '_')}`,
          code: l3Code,
          name: `${l2Def.name} - ${area.name}`,
          level: 3,
          discipline: l2Def.discipline,
          parentId: l2Node.id,
          path: `${l2Node.path} > ${l3Code}`,
        };
        nodes.push(l3Node);

        // L4: Sub-facilities / Equipment units
        area.subLocations.slice(0, 3).forEach((subLoc, subIdx) => {
          const l4Code = `${l3Code}.${subIdx + 1}`;
          const l4Node: SyntheticWBSNode = {
            id: `${projectId}-wbs-${l4Code.replace(/\./g, '_')}`,
            code: l4Code,
            name: `${subLoc}`,
            level: 4,
            discipline: l2Def.discipline,
            parentId: l3Node.id,
            path: `${l3Node.path} > ${l4Code}`,
          };
          nodes.push(l4Node);

          // L5: Work Packages
          const workPackages = ['Sub-surface & Preparation', 'Main Assembly & Fixing', 'Testing & Finishing'];
          workPackages.forEach((wp, wpIdx) => {
            const l5Code = `${l4Code}.${wpIdx + 1}`;
            const l5Node: SyntheticWBSNode = {
              id: `${projectId}-wbs-${l5Code.replace(/\./g, '_')}`,
              code: l5Code,
              name: `${wp}`,
              level: 5,
              discipline: l2Def.discipline,
              parentId: l4Node.id,
              path: `${l4Node.path} > ${l5Code}`,
            };
            nodes.push(l5Node);

            // L6: Granular Work Units
            const workUnits = ['Zone A / North Section', 'Zone B / South Section'];
            workUnits.forEach((wu, wuIdx) => {
              const l6Code = `${l5Code}.${wuIdx + 1}`;
              const l6Node: SyntheticWBSNode = {
                id: `${projectId}-wbs-${l6Code.replace(/\./g, '_')}`,
                code: l6Code,
                name: `${wu}`,
                level: 6,
                discipline: l2Def.discipline,
                parentId: l5Node.id,
                path: `${l5Node.path} > ${l6Code}`,
              };
              nodes.push(l6Node);
            });
          });
        });
      });
    }

    return nodes;
  }
}
