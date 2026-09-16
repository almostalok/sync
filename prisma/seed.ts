import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting SiteSync deterministic foundation seed...');

  // 1. Clean existing records in reverse dependency order
  await prisma.auditLog.deleteMany({});
  await prisma.reviewDecision.deleteMany({});
  await prisma.progressUpdate.deleteMany({});
  await prisma.evidence.deleteMany({});
  await prisma.activityMatch.deleteMany({});
  await prisma.extractedEvent.deleteMany({});
  await prisma.processingJob.deleteMany({});
  await prisma.fieldReport.deleteMany({});
  await prisma.dependency.deleteMany({});
  await prisma.activity.deleteMany({});
  await prisma.wBSNode.deleteMany({});
  await prisma.projectMember.deleteMany({});
  await prisma.historicalOutcome.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create Users
  const adminUser = await prisma.user.create({
    data: {
      id: 'USR-ADMIN-01',
      name: 'Executive Director (Projects)',
      email: 'admin@oilindia.in',
      passwordHash: 'hash_admin_secure_2026',
      role: 'ADMIN',
    },
  });

  const plannerUser = await prisma.user.create({
    data: {
      id: 'USR-PLANNER-01',
      name: 'Pranab Borah',
      email: 'planner.borah@oilindia.in',
      passwordHash: 'hash_planner_secure_2026',
      role: 'PLANNER',
    },
  });

  const pmUser = await prisma.user.create({
    data: {
      id: 'USR-PM-01',
      name: 'Dhruba Gogoi',
      email: 'pm.gogoi@oilindia.in',
      passwordHash: 'hash_pm_secure_2026',
      role: 'PROJECT_MANAGER',
    },
  });

  const supervisorUser = await prisma.user.create({
    data: {
      id: 'USR-SUP-01',
      name: 'Rajesh Sharma',
      email: 'supervisor.sharma@oilindia.in',
      passwordHash: 'hash_sup_secure_2026',
      role: 'SUPERVISOR',
    },
  });

  console.log('✅ Seeded 4 baseline users (Admin, Planner, PM, Supervisor)');

  // 3. Create Demo Project
  const project = await prisma.project.create({
    data: {
      id: 'PROJ-OIL-2026-01',
      projectCode: 'OIL-CSE-2026',
      name: 'Compressor Station Expansion Project',
      description: 'Engineering, Procurement, Construction & Commissioning of 40 MMSCFD Natural Gas Compressor Train for Oil India Limited.',
      location: 'Duliajan Gas Processing Terminal, Assam',
      plannedStart: new Date('2026-08-01T00:00:00Z'),
      plannedFinish: new Date('2027-04-30T00:00:00Z'),
      actualStart: new Date('2026-08-01T00:00:00Z'),
      status: 'ACTIVE',
      plannedProgress: 52.5,
      actualProgress: 44.8,
    },
  });

  // 4. Create Project Memberships
  await prisma.projectMember.createMany({
    data: [
      { projectId: project.id, userId: adminUser.id, role: 'ADMIN' },
      { projectId: project.id, userId: plannerUser.id, role: 'PLANNER' },
      { projectId: project.id, userId: pmUser.id, role: 'PROJECT_MANAGER' },
      { projectId: project.id, userId: supervisorUser.id, role: 'SUPERVISOR' },
    ],
  });

  console.log('✅ Seeded Project & 4 Project Memberships');

  // 5. Create L1 through L6 WBS Hierarchy
  const wbsL1 = await prisma.wBSNode.create({
    data: {
      id: 'WBS-L1',
      projectId: project.id,
      code: '1.0',
      name: 'Compressor Station Expansion',
      level: 1,
      discipline: 'GENERAL',
      path: 'Compressor Station Expansion',
    },
  });

  const wbsL2Civil = await prisma.wBSNode.create({
    data: {
      id: 'WBS-L2-1',
      projectId: project.id,
      parentId: wbsL1.id,
      code: '1.1',
      name: 'Compressor Train Area',
      level: 2,
      discipline: 'MECHANICAL',
      path: 'Compressor Station Expansion > Compressor Train Area',
    },
  });

  const wbsL3Civil = await prisma.wBSNode.create({
    data: {
      id: 'WBS-L3-1',
      projectId: project.id,
      parentId: wbsL2Civil.id,
      code: '1.1.1',
      name: 'Compressor Foundations & Civil',
      level: 3,
      discipline: 'CIVIL',
      path: 'Compressor Train Area > Foundations & Civil',
    },
  });

  const wbsL4Civil = await prisma.wBSNode.create({
    data: {
      id: 'WBS-L4-1',
      projectId: project.id,
      parentId: wbsL3Civil.id,
      code: '1.1.1.1',
      name: 'Compressor Pedestal Foundation Package',
      level: 4,
      discipline: 'CIVIL',
      path: 'Compressor Train Area > Foundations & Civil > Pedestal Package',
    },
  });

  const wbsL5Civil = await prisma.wBSNode.create({
    data: {
      id: 'WBS-L5-1',
      projectId: project.id,
      parentId: wbsL4Civil.id,
      code: '1.1.1.1.1',
      name: 'Foundation Civil Execution',
      level: 5,
      discipline: 'CIVIL',
      path: 'Compressor Train Area > Foundations & Civil > Pedestal Package > Foundation Execution',
    },
  });

  console.log('✅ Seeded L1-L6 WBS Node Hierarchy');

  // 6. Create 15 Core Activities
  const activitiesData = [
    {
      id: 'CIV-EXC-001',
      wbsNodeId: wbsL5Civil.id,
      activityCode: 'CIV-EXC-001',
      name: 'Site Clearing & Topsoil Grubbing',
      description: 'Clearing of vegetation and topsoil removal at compressor footprint.',
      discipline: 'CIVIL' as const,
      location: 'Compressor Area',
      wbsPath: 'Compressor Train Area > Foundations & Civil',
      plannedStart: new Date('2026-08-01'),
      plannedFinish: new Date('2026-08-10'),
      plannedDuration: 9,
      plannedProgress: 100,
      actualProgress: 100,
      status: 'COMPLETED' as const,
      varianceDays: 0,
      criticalPath: true,
      aliases: ['Site clearing', 'Ground preparation', 'Topsoil grubbing'],
    },
    {
      id: 'CIV-EXC-002',
      wbsNodeId: wbsL5Civil.id,
      activityCode: 'CIV-EXC-002',
      name: 'Excavation for Compressor Foundation',
      description: 'Heavy machine excavation for compressor foundation pedestal down to 3.5m.',
      discipline: 'CIVIL' as const,
      location: 'Compressor Area - North',
      wbsPath: 'Compressor Train Area > Foundations & Civil',
      plannedStart: new Date('2026-09-10'),
      plannedFinish: new Date('2026-09-18'),
      plannedDuration: 8,
      plannedProgress: 90,
      actualProgress: 80,
      status: 'IN_PROGRESS' as const,
      varianceDays: 4,
      criticalPath: true,
      aliases: ['Comp foundation excavation', 'Excavation for compressor foundation', 'Comp. Fdn. Exctn'],
    },
    {
      id: 'CIV-PCC-001',
      wbsNodeId: wbsL5Civil.id,
      activityCode: 'CIV-PCC-001',
      name: 'PCC for Compressor Foundation',
      description: 'Plain cement concrete M15 grade sub-base pouring under compressor foundation.',
      discipline: 'CIVIL' as const,
      location: 'Compressor Area - North',
      wbsPath: 'Compressor Train Area > Foundations & Civil',
      plannedStart: new Date('2026-09-19'),
      plannedFinish: new Date('2026-09-22'),
      plannedDuration: 3,
      plannedProgress: 0,
      actualProgress: 0,
      status: 'NOT_STARTED' as const,
      varianceDays: 0,
      criticalPath: true,
      aliases: ['PCC preparation', 'PCC pouring under compressor'],
    },
    {
      id: 'CIV-REINF-001',
      wbsNodeId: wbsL5Civil.id,
      activityCode: 'CIV-REINF-001',
      name: 'Foundation Reinforcement Steel Binding',
      description: 'High tensile Fe500D rebar placement and binding for foundation slab.',
      discipline: 'CIVIL' as const,
      location: 'Compressor Area - North',
      wbsPath: 'Compressor Train Area > Foundations & Civil',
      plannedStart: new Date('2026-09-23'),
      plannedFinish: new Date('2026-09-28'),
      plannedDuration: 5,
      plannedProgress: 0,
      actualProgress: 0,
      status: 'NOT_STARTED' as const,
      varianceDays: 0,
      criticalPath: true,
      aliases: ['Foundation rebar work', 'Rebar binding for compressor'],
    },
    {
      id: 'CIV-FORM-001',
      wbsNodeId: wbsL5Civil.id,
      activityCode: 'CIV-FORM-001',
      name: 'Foundation Formwork & Shuttering',
      description: 'Steel shuttering and alignment for heavy pedestal casting.',
      discipline: 'CIVIL' as const,
      location: 'Compressor Area - North',
      wbsPath: 'Compressor Train Area > Foundations & Civil',
      plannedStart: new Date('2026-09-29'),
      plannedFinish: new Date('2026-10-02'),
      plannedDuration: 3,
      plannedProgress: 0,
      actualProgress: 0,
      status: 'NOT_STARTED' as const,
      varianceDays: 0,
      criticalPath: true,
      aliases: ['Formwork installation', 'Side shuttering for pedestal'],
    },
    {
      id: 'CIV-CONC-001',
      wbsNodeId: wbsL5Civil.id,
      activityCode: 'CIV-CONC-001',
      name: 'Foundation Concrete M35 RCC Pouring',
      description: 'Continuous monolithic concrete pour for compressor foundation.',
      discipline: 'CIVIL' as const,
      location: 'Compressor Area - North',
      wbsPath: 'Compressor Train Area > Foundations & Civil',
      plannedStart: new Date('2026-10-03'),
      plannedFinish: new Date('2026-10-08'),
      plannedDuration: 5,
      plannedProgress: 0,
      actualProgress: 0,
      status: 'NOT_STARTED' as const,
      varianceDays: 0,
      criticalPath: true,
      aliases: ['Compressor concrete pour', 'Heavy RCC casting'],
    },
  ];

  for (const act of activitiesData) {
    await prisma.activity.create({
      data: {
        ...act,
        projectId: project.id,
      },
    });
  }

  console.log(`✅ Seeded ${activitiesData.length} core activities`);

  // 7. Create Dependencies
  const dependenciesData = [
    { predecessorId: 'CIV-EXC-001', successorId: 'CIV-EXC-002', type: 'FS' as const, lag: 1 },
    { predecessorId: 'CIV-EXC-002', successorId: 'CIV-PCC-001', type: 'FS' as const, lag: 1 },
    { predecessorId: 'CIV-PCC-001', successorId: 'CIV-REINF-001', type: 'FS' as const, lag: 1 },
    { predecessorId: 'CIV-REINF-001', successorId: 'CIV-FORM-001', type: 'FS' as const, lag: 0 },
    { predecessorId: 'CIV-FORM-001', successorId: 'CIV-CONC-001', type: 'FS' as const, lag: 1 },
  ];

  for (const dep of dependenciesData) {
    await prisma.dependency.create({
      data: {
        id: `DEP-${dep.predecessorId}-${dep.successorId}`,
        projectId: project.id,
        predecessorId: dep.predecessorId,
        successorId: dep.successorId,
        dependencyType: dep.type,
        lag: dep.lag,
      },
    });
  }

  console.log(`✅ Seeded ${dependenciesData.length} Finish-to-Start (FS) dependencies`);

  // 8. Create Initial Audit Record
  await prisma.auditLog.create({
    data: {
      id: `AUDIT-SEED-01`,
      projectId: project.id,
      userId: adminUser.id,
      userName: adminUser.name,
      entityType: 'SCHEDULE',
      entityId: project.id,
      action: 'INGESTED',
      explanation: 'Ingested baseline schedule with L1-L6 WBS hierarchy and core activities.',
      timestamp: new Date(),
    },
  });

  console.log('🎉 Deterministic foundation seed completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Error in seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
