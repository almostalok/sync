import { ProjectService } from '../apps/api/src/modules/projects/project.service';
import { ActivityService } from '../apps/api/src/modules/activities/activity.service';
import { DependencyService } from '../apps/api/src/modules/dependencies/dependency.service';
import { Discipline, ActivityStatus, DependencyType } from '../packages/types/src';
import { validateCreateProject, validateCreateActivity, validateCreateDependency } from '../packages/validation/src';

async function runTests() {
  console.log('🧪 Running SiteSync Foundation Domain Tests...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✓ ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ ${testName}`);
      failed++;
    }
  }

  // 1. Validation Tests
  const validProject = validateCreateProject({
    name: 'New Test Project',
    code: 'TEST-001',
    location: 'Assam',
    startDate: '2026-08-01',
    plannedEndDate: '2027-04-30',
  });
  assert(validProject.valid === true, 'validateCreateProject accepts valid payload');

  const invalidProject = validateCreateProject({
    name: '',
    code: '',
  });
  assert(invalidProject.valid === false && invalidProject.errors.length >= 3, 'validateCreateProject rejects empty fields');

  // 2. ProjectService Tests
  const projectService = new ProjectService();
  const allProjects = await projectService.getAllProjects();
  assert(allProjects.length > 0, 'ProjectService returns default seeded project');

  const createdProj = await projectService.createProject({
    name: 'Substation Expansion Project',
    code: 'OIL-SUB-01',
    location: 'Jorhat',
    startDate: '2026-09-01',
    plannedEndDate: '2027-01-31',
  });
  assert(createdProj.success === true && createdProj.data?.name === 'Substation Expansion Project', 'ProjectService creates and persists new project');

  // 3. ActivityService Tests
  const actService = new ActivityService();
  const activities = await actService.getActivitiesByProject('PROJ-OIL-2026-01');
  assert(activities.total > 0, 'ActivityService retrieves activities scoped by projectId');

  const createdAct = await actService.createActivity({
    projectId: 'PROJ-OIL-2026-01',
    wbsNodeId: 'WBS-L3-1',
    activityCode: 'CIV-TEST-999',
    name: 'Test Trench Digging',
    discipline: Discipline.CIVIL,
    location: 'Compressor Area',
    plannedStart: '2026-09-10',
    plannedEnd: '2026-09-15',
  });
  assert(createdAct.success === true && createdAct.data?.activityCode === 'CIV-TEST-999', 'ActivityService creates valid activity');

  // Test duplicate activityCode constraint
  const dupAct = await actService.createActivity({
    projectId: 'PROJ-OIL-2026-01',
    wbsNodeId: 'WBS-L3-1',
    activityCode: 'CIV-TEST-999',
    name: 'Duplicate Trench Digging',
    discipline: Discipline.CIVIL,
    location: 'Compressor Area',
    plannedStart: '2026-09-10',
    plannedEnd: '2026-09-15',
  });
  assert(dupAct.success === false && Boolean(dupAct.errors?.[0]?.includes('already exists')), 'ActivityService prevents duplicate activityCode');

  // 4. DependencyService Tests
  const depService = new DependencyService();
  const createdDep = await depService.createDependency({
    projectId: 'PROJ-OIL-2026-01',
    predecessorId: 'CIV-EXC-042',
    successorId: 'CIV-TEST-999',
    type: DependencyType.FS,
    lag: 1,
  });
  assert(createdDep.success === true, 'DependencyService creates FS dependency');

  // Test self-dependency prevention
  const selfDep = await depService.createDependency({
    projectId: 'PROJ-OIL-2026-01',
    predecessorId: 'CIV-TEST-999',
    successorId: 'CIV-TEST-999',
  });
  assert(selfDep.success === false && Boolean(selfDep.errors?.[0]?.includes('depend on itself')), 'DependencyService prevents self-dependency');

  // 5. Architectural Boundary Check
  const fs = require('fs');
  const path = require('path');
  const componentsDir = path.join(__dirname, '../src/components');
  const componentFiles = fs.readdirSync(componentsDir);
  let hasPrismaInComponents = false;

  for (const f of componentFiles) {
    if (f.endsWith('.tsx') || f.endsWith('.ts')) {
      const content = fs.readFileSync(path.join(componentsDir, f), 'utf8');
      if (content.includes('@prisma/client') || content.includes('prisma.')) {
        hasPrismaInComponents = true;
      }
    }
  }
  assert(!hasPrismaInComponents, 'Architectural Check: UI components do not import Prisma directly');

  console.log(`\n========================================`);
  console.log(`Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Test runner failure:', err);
  process.exit(1);
});
