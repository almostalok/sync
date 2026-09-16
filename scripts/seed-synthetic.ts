import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { SyntheticProjectDataset } from '../data/synthetic';
import { ScheduleParser } from '../apps/api/src/modules/schedules/schedule-parser';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding PostgreSQL with SiteSync Synthetic Dataset...');

  const outputDir = path.join(process.cwd(), 'data', 'synthetic', 'output');
  if (!fs.existsSync(path.join(outputDir, 'project.json'))) {
    console.error('❌ Synthetic output not found. Please run `pnpm data:generate --seed 42` first.');
    process.exit(1);
  }

  const projectData = JSON.parse(fs.readFileSync(path.join(outputDir, 'project.json'), 'utf-8'));
  const wbsData = JSON.parse(fs.readFileSync(path.join(outputDir, 'wbs.json'), 'utf-8'));
  const reportsData = JSON.parse(fs.readFileSync(path.join(outputDir, 'reports.json'), 'utf-8'));
  const eventsData = JSON.parse(fs.readFileSync(path.join(outputDir, 'events.json'), 'utf-8'));

  // 1. Upsert Project
  console.log(`📦 Upserting project '${projectData.name}' (${projectData.code})...`);
  const project = await prisma.project.upsert({
    where: { projectCode: projectData.code },
    update: {
      name: projectData.name,
      description: projectData.description,
      location: projectData.location,
      status: projectData.status,
      plannedStart: new Date(projectData.plannedStart),
      plannedFinish: new Date(projectData.plannedFinish),
      plannedProgress: projectData.plannedProgress,
      actualProgress: projectData.actualProgress,
    },
    create: {
      id: projectData.id,
      projectCode: projectData.code,
      name: projectData.name,
      description: projectData.description,
      location: projectData.location,
      status: projectData.status,
      plannedStart: new Date(projectData.plannedStart),
      plannedFinish: new Date(projectData.plannedFinish),
      plannedProgress: projectData.plannedProgress,
      actualProgress: projectData.actualProgress,
    },
  });

  // 2. Batch Insert WBS Nodes (level by level to satisfy parent foreign key)
  console.log(`🌲 Inserting ${wbsData.length} WBS nodes across L1-L6...`);
  const sortedWbs = [...wbsData].sort((a, b) => a.level - b.level);
  for (const node of sortedWbs) {
    await prisma.wBSNode.upsert({
      where: { id: node.id },
      update: {
        code: node.code,
        name: node.name,
        level: node.level,
        discipline: node.discipline,
        path: node.path,
      },
      create: {
        id: node.id,
        projectId: project.id,
        parentId: node.parentId,
        code: node.code,
        name: node.name,
        level: node.level,
        discipline: node.discipline,
        path: node.path,
      },
    });
  }

  // 3. Batch Insert Activities
  const csvContent = fs.readFileSync(path.join(outputDir, 'activities.csv'), 'utf-8');
  const actRows = ScheduleParser.parseCsv(csvContent);
  console.log(`📋 Inserting ${actRows.length} activities...`);

  // Insert in batches of 100
  const batchSize = 100;
  for (let i = 0; i < actRows.length; i += batchSize) {
    const chunk = actRows.slice(i, i + batchSize);
    for (const row of chunk) {
      const code = row.activityCode;
      const name = row.activityName;
      const description = row.description || row.activityName;
      const discipline = (row.discipline as any) || 'CIVIL';
      const location = row.location || 'Site';
      const start = new Date(row.plannedStart);
      const finish = new Date(row.plannedFinish);
      const duration = row.durationDays || 10;
      const plannedProg = row.plannedProgress || 0.0;
      const actualProg = row.actualProgress || 0.0;
      const status = (row.status as any) || 'NOT_STARTED';

      const actId = `proj-cse-2026-act-${code.toLowerCase()}`;
      await prisma.activity.upsert({
        where: {
          projectId_activityCode: {
            projectId: project.id,
            activityCode: code,
          },
        },
        update: {
          name,
          description,
          discipline,
          location,
          plannedStart: start,
          plannedFinish: finish,
          plannedDuration: duration,
          plannedProgress: plannedProg,
          actualProgress: actualProg,
          status,
        },
        create: {
          id: actId,
          projectId: project.id,
          wbsNodeId: sortedWbs[0].id,
          activityCode: code,
          name,
          description,
          discipline,
          location,
          wbsPath: row.wbsCode || '1.0',
          plannedStart: start,
          plannedFinish: finish,
          plannedDuration: duration,
          plannedProgress: plannedProg,
          actualProgress: actualProg,
          status,
        },
      });
    }
  }

  // 4. Batch Insert Field Reports (First 100 for fast seed)
  console.log(`📑 Inserting sample field reports (${Math.min(100, reportsData.length)} items)...`);
  const sampleReports = reportsData.slice(0, 100);
  for (const rep of sampleReports) {
    await prisma.fieldReport.upsert({
      where: { id: rep.id },
      update: {
        rawText: rep.rawText,
        processingStatus: 'PROCESSED',
      },
      create: {
        id: rep.id,
        projectId: project.id,
        sourceType: rep.sourceType,
        fileName: rep.fileName,
        storageKey: `reports/${project.id}/${rep.fileName}`,
        reportDate: new Date(rep.reportDate),
        discipline: rep.discipline,
        uploadedBy: rep.author,
        processingStatus: 'PROCESSED',
        rawText: rep.rawText,
      },
    });
  }

  // 5. Create Baseline ScheduleVersion
  await prisma.scheduleVersion.upsert({
    where: {
      projectId_version: {
        projectId: project.id,
        version: 1,
      },
    },
    update: {
      activityCount: actRows.length,
      isBaseline: true,
    },
    create: {
      projectId: project.id,
      version: 1,
      name: 'Baseline Schedule v1.0',
      description: 'Synthetic baseline simulation for Compressor Station Expansion',
      isBaseline: true,
      sourceType: 'SYNTHETIC_GENERATOR',
      activityCount: actRows.length,
      dependencyCount: 5000,
    },
  });

  console.log('✅ PostgreSQL database seeded successfully with synthetic dataset.');
}

seed()
  .catch((err) => {
    console.error('Error seeding synthetic data:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
