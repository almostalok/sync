import * as crypto from 'crypto';
import { ScheduleParser } from './schedule-parser';
import { ScheduleValidatorService } from './schedule-validator';
import { ScheduleImportPreview, ScheduleImportResult, RawScheduleRow } from './schedule.types';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { Discipline, ActivityStatus, DependencyType } from '@sitesync/types';

export class ScheduleService {
  private prisma: any;

  constructor(prismaClient?: any) {
    this.prisma = prismaClient || PrismaService.getInstance();
  }

  /**
   * Generates a structural import preview with validation checks before persistence.
   */
  public async previewSchedule(
    projectId: string,
    fileContent: string,
    format: 'CSV' | 'JSON' = 'CSV'
  ): Promise<ScheduleImportPreview> {
    const fileChecksum = crypto.createHash('sha256').update(fileContent).digest('hex');

    // Check if this file has already been imported
    const existingVersion = await this.prisma.scheduleVersion.findFirst({
      where: { projectId, fileHash: fileChecksum },
    });

    let rows: RawScheduleRow[] = [];
    if (format === 'CSV') {
      rows = ScheduleParser.parseCsv(fileContent);
    } else {
      const canonical = ScheduleParser.parseJson(fileContent);
      rows = canonical.activities.map((a) => ({
        activityCode: a.activityCode,
        activityName: a.name,
        description: a.description,
        discipline: a.discipline,
        location: a.location,
        plannedStart: a.plannedStart,
        plannedFinish: a.plannedFinish,
        durationDays: a.plannedDuration,
        plannedProgress: a.plannedProgress,
        actualProgress: a.actualProgress,
        status: a.status,
      }));
    }

    const validation = ScheduleValidatorService.validateRows(rows);

    const wbsSet = new Set(rows.map((r) => r.wbsCode).filter(Boolean));
    let depCount = 0;
    rows.forEach((r) => {
      if (r.predecessors) {
        depCount += r.predecessors.split(/[,;]+/).filter(Boolean).length;
      }
    });

    const sampleActivities = rows.slice(0, 5).map((r) => ({
      activityCode: r.activityCode,
      name: r.activityName,
      discipline: r.discipline || 'GENERAL',
      plannedStart: r.plannedStart,
      plannedFinish: r.plannedFinish,
    }));

    return {
      format,
      fileChecksum,
      isDuplicateFile: !!existingVersion,
      activityCount: rows.length,
      wbsCount: wbsSet.size,
      dependencyCount: depCount,
      warnings: validation.warnings,
      errors: validation.errors,
      isValid: validation.isValid,
      sampleActivities,
    };
  }

  /**
   * Persists the parsed schedule in PostgreSQL with versioning and transaction safety.
   */
  public async importSchedule(
    projectId: string,
    fileContent: string,
    format: 'CSV' | 'JSON' = 'CSV',
    options?: { isBaseline?: boolean; versionName?: string; description?: string }
  ): Promise<ScheduleImportResult> {
    const preview = await this.previewSchedule(projectId, fileContent, format);
    if (!preview.isValid) {
      throw new Error(`Schedule validation failed with ${preview.errors.length} error(s)`);
    }

    let rows: RawScheduleRow[] = [];
    if (format === 'CSV') {
      rows = ScheduleParser.parseCsv(fileContent);
    } else {
      const canonical = ScheduleParser.parseJson(fileContent);
      rows = canonical.activities.map((a) => ({
        wbsCode: a.wbsCode,
        activityCode: a.activityCode,
        activityName: a.name,
        description: a.description,
        discipline: a.discipline,
        location: a.location,
        plannedStart: a.plannedStart,
        plannedFinish: a.plannedFinish,
        durationDays: a.plannedDuration,
        plannedProgress: a.plannedProgress,
        actualProgress: a.actualProgress,
        status: a.status,
      }));
    }

    // Determine new version number
    const latestVersion = await this.prisma.scheduleVersion.findFirst({
      where: { projectId },
      orderBy: { version: 'desc' },
    });
    const nextVersionNum = (latestVersion?.version || 0) + 1;
    const isBaseline = options?.isBaseline ?? (nextVersionNum === 1);

    const result = await this.prisma.$transaction(async (tx: any) => {
      // 1. Ensure root WBS exists
      let rootWbs = await tx.wBSNode.findFirst({
        where: { projectId, level: 1 },
      });
      if (!rootWbs) {
        rootWbs = await tx.wBSNode.create({
          data: {
            projectId,
            code: '1.0',
            name: 'Imported Schedule Root',
            level: 1,
            discipline: Discipline.GENERAL,
            path: '1.0',
          },
        });
      }

      // 2. Import Activities
      let importedActivities = 0;
      const activityMap = new Map<string, string>(); // code -> id

      for (const row of rows) {
        const discipline = this.normalizeDiscipline(row.discipline);
        const status = (row.status as ActivityStatus) || ActivityStatus.NOT_STARTED;

        const start = new Date(row.plannedStart);
        const finish = new Date(row.plannedFinish);
        const duration = row.durationDays || Math.max(1, Math.round((finish.getTime() - start.getTime()) / (1000 * 3600 * 24)));

        const act = await tx.activity.upsert({
          where: {
            projectId_activityCode: {
              projectId,
              activityCode: row.activityCode.trim(),
            },
          },
          update: {
            name: row.activityName,
            description: row.description || row.activityName,
            discipline,
            location: row.location || 'General Site',
            plannedStart: start,
            plannedFinish: finish,
            plannedDuration: duration,
            plannedProgress: row.plannedProgress || 0.0,
            actualProgress: row.actualProgress || 0.0,
            status,
          },
          create: {
            projectId,
            wbsNodeId: rootWbs.id,
            activityCode: row.activityCode.trim(),
            name: row.activityName,
            description: row.description || row.activityName,
            discipline,
            location: row.location || 'General Site',
            wbsPath: rootWbs.path,
            plannedStart: start,
            plannedFinish: finish,
            plannedDuration: duration,
            plannedProgress: row.plannedProgress || 0.0,
            actualProgress: row.actualProgress || 0.0,
            status,
          },
        });

        activityMap.set(act.activityCode, act.id);
        importedActivities++;
      }

      // 3. Import Dependencies
      let importedDependencies = 0;
      for (const row of rows) {
        if (!row.predecessors) continue;
        const succId = activityMap.get(row.activityCode.trim());
        if (!succId) continue;

        const predTokens = row.predecessors.split(/[,;]+/).map((p) => p.trim());
        for (const token of predTokens) {
          const parts = token.split(':');
          const predCode = parts[0].trim();
          const depTypeStr = parts[1]?.trim().toUpperCase() || row.dependencyType?.toUpperCase() || 'FS';
          const lag = parts[2] ? parseInt(parts[2], 10) : 0;

          const predId = activityMap.get(predCode);
          if (predId && predId !== succId) {
            const depType = (depTypeStr as DependencyType) || DependencyType.FS;
            await tx.dependency.upsert({
              where: {
                predecessorId_successorId: {
                  predecessorId: predId,
                  successorId: succId,
                },
              },
              update: {
                dependencyType: depType,
                lag,
              },
              create: {
                projectId,
                predecessorId: predId,
                successorId: succId,
                dependencyType: depType,
                lag,
              },
            });
            importedDependencies++;
          }
        }
      }

      // 4. Create ScheduleVersion record
      const scheduleVersion = await tx.scheduleVersion.create({
        data: {
          projectId,
          version: nextVersionNum,
          name: options?.versionName || `Schedule Revision v${nextVersionNum}`,
          description: options?.description || `Imported via ${format} ingestion`,
          isBaseline,
          fileHash: preview.fileChecksum,
          sourceType: format,
          activityCount: importedActivities,
          dependencyCount: importedDependencies,
        },
      });

      return {
        scheduleVersionId: scheduleVersion.id,
        version: scheduleVersion.version,
        isBaseline: scheduleVersion.isBaseline,
        importedActivitiesCount: importedActivities,
        importedWBSCount: 1,
        importedDependenciesCount: importedDependencies,
        message: `Schedule v${nextVersionNum} imported successfully with ${importedActivities} activities and ${importedDependencies} dependencies`,
      };
    });

    return result;
  }

  public async listVersions(projectId: string) {
    return this.prisma.scheduleVersion.findMany({
      where: { projectId },
      orderBy: { version: 'desc' },
    });
  }

  private normalizeDiscipline(disc?: string): Discipline {
    if (!disc) return Discipline.GENERAL;
    const upper = disc.toUpperCase().trim();
    switch (upper) {
      case 'CIVIL':
        return Discipline.CIVIL;
      case 'PIPING':
        return Discipline.PIPING;
      case 'MECHANICAL':
        return Discipline.MECHANICAL;
      case 'ELECTRICAL':
        return Discipline.ELECTRICAL;
      case 'INSTRUMENTATION':
        return Discipline.INSTRUMENTATION;
      case 'HSE':
        return Discipline.HSE;
      default:
        return Discipline.GENERAL;
    }
  }
}
