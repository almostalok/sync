import {
  Discipline,
  RiskDTO,
  RiskFactorDTO,
  RiskOverviewDTO,
  RiskSeverity,
  RiskStatus,
  RiskType,
} from '@sitesync/types';
import { DASHBOARD_CONFIG } from '../dashboard/dashboard-metrics.config';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { generateSyntheticProject } from '@/lib/data/syntheticGenerator';

export class RiskService {
  /**
   * Deterministically evaluates risk signals across all project activities.
   */
  public async evaluateProjectRisks(projectId: string): Promise<RiskOverviewDTO> {
    const risks: RiskDTO[] = [];

    if (PrismaService.isAvailable()) {
      try {
        const prisma = PrismaService.getInstance();
        const activities = await prisma.activity.findMany({
          where: { projectId },
        });

        const dependencies = await prisma.dependency.findMany({
          where: { projectId },
        });

        const succMap = new Map<string, number>();
        const predMap = new Map<string, Array<{ id: string; code: string; varianceDays: number; status?: string }>>();
        const actMap = new Map<string, any>(activities.map((a: any) => [a.id, a]));

        for (const dep of dependencies) {
          succMap.set(dep.predecessorId, (succMap.get(dep.predecessorId) || 0) + 1);
          const pAct = actMap.get(dep.predecessorId);
          if (pAct) {
            const list = predMap.get(dep.successorId) || [];
            list.push({
              id: pAct.id,
              code: pAct.activityCode,
              varianceDays: pAct.varianceDays,
              status: pAct.status,
            });
            predMap.set(dep.successorId, list);
          }
        }

        for (const act of activities) {
          const actRisks = this.evaluateActivityRisks({
            projectId,
            activityId: act.id,
            activityCode: act.activityCode,
            activityName: act.name,
            discipline: act.discipline as unknown as Discipline,
            plannedStart: act.plannedStart,
            plannedEnd: act.plannedFinish,
            actualStart: act.actualStart,
            actualEnd: act.actualFinish,
            plannedDuration: act.plannedDuration,
            actualDuration: act.actualDuration,
            plannedProgress: act.plannedProgress,
            actualProgress: act.actualProgress,
            status: act.status,
            varianceDays: act.varianceDays,
            isCritical: act.criticalPath,
            lastUpdateDate: act.lastUpdateDate,
            successorCount: succMap.get(act.id) || 0,
            predecessors: predMap.get(act.id) || [],
            matches: [],
          });

          risks.push(...actRisks);
        }
      } catch (err) {
        console.warn('RiskService Prisma evaluation fallback:', err);
      }
    }

    if (risks.length === 0) {
      // Deterministic evaluation on synthetic data
      const data = generateSyntheticProject();
      const depMap = new Map<string, string[]>();

      for (const d of data.dependencies) {
        const succList = depMap.get(d.predecessorId) || [];
        succList.push(d.successorId);
        depMap.set(d.predecessorId, succList);
      }

      for (const act of data.activities) {
        const successors = depMap.get(act.id) || [];
        const actRisks = this.evaluateActivityRisks({
          projectId,
          activityId: act.id,
          activityCode: act.activityCode,
          activityName: act.name,
          discipline: act.discipline as unknown as Discipline,
          plannedStart: act.plannedStart,
          plannedEnd: act.plannedFinish,
          actualStart: act.actualStart,
          actualEnd: act.actualFinish,
          plannedDuration: act.plannedDuration,
          actualDuration: act.actualDuration,
          plannedProgress: act.plannedProgress > 1 ? act.plannedProgress / 100 : act.plannedProgress,
          actualProgress: act.actualProgress > 1 ? act.actualProgress / 100 : act.actualProgress,
          status: act.status,
          varianceDays: act.varianceDays || 0,
          isCritical: act.criticalPath || false,
          lastUpdateDate: act.lastUpdateDate,
          successorCount: successors.length,
          predecessors: [],
          matches: [],
        });

        risks.push(...actRisks);
      }
    }

    // Rank risks by score descending
    risks.sort((a, b) => b.score - a.score);

    const summary = {
      critical: risks.filter((r) => r.severity === RiskSeverity.CRITICAL).length,
      high: risks.filter((r) => r.severity === RiskSeverity.HIGH).length,
      medium: risks.filter((r) => r.severity === RiskSeverity.MEDIUM).length,
      low: risks.filter((r) => r.severity === RiskSeverity.LOW).length,
      total: risks.length,
    };

    return {
      projectId,
      summary,
      risks,
    };
  }

  /**
   * Evaluates deterministic risk rules for an individual activity.
   */
  public evaluateActivityRisks(params: {
    projectId: string;
    activityId: string;
    activityCode: string;
    activityName: string;
    discipline: Discipline;
    plannedStart: string | Date;
    plannedEnd: string | Date;
    actualStart?: string | Date | null;
    actualEnd?: string | Date | null;
    plannedDuration: number;
    actualDuration?: number | null;
    plannedProgress: number; // 0..1
    actualProgress: number; // 0..1
    status: string;
    varianceDays: number;
    isCritical: boolean;
    lastUpdateDate?: string | Date | null;
    successorCount: number;
    predecessors?: Array<{ id: string; code: string; varianceDays: number; status?: string }>;
    matches?: Array<{ confidence: number; status: string; docName: string; page: number; text: string }>;
  }): RiskDTO[] {
    const risks: RiskDTO[] = [];
    const now = Date.now();
    const msPerHour = 1000 * 60 * 60;

    const aStart = params.actualStart ? new Date(params.actualStart).getTime() : null;

    // Rule 1: SCHEDULE_DELAY
    if (params.varianceDays > DASHBOARD_CONFIG.SCHEDULE_DELAY_DAYS_THRESHOLD) {
      const delayDays = params.varianceDays;
      let severity: RiskSeverity = RiskSeverity.MEDIUM;
      if (delayDays >= DASHBOARD_CONFIG.CRITICAL_SCHEDULE_DELAY_DAYS_THRESHOLD || (delayDays >= 3 && params.isCritical)) {
        severity = RiskSeverity.CRITICAL;
      } else if (delayDays >= 3 || params.isCritical) {
        severity = RiskSeverity.HIGH;
      }

      const factors: RiskFactorDTO[] = [
        {
          type: 'SCHEDULE_DELAY',
          label: 'Schedule Variance',
          value: `+${delayDays} days`,
          weight: 0.4,
          impactScore: Math.min(40, delayDays * 8),
        },
        {
          type: 'DOWNSTREAM_DEPENDENCIES',
          label: 'Downstream Successors',
          value: params.successorCount,
          weight: 0.3,
          impactScore: Math.min(30, params.successorCount * 6),
        },
        {
          type: 'CRITICAL_ACTIVITY',
          label: 'Critical Path Status',
          value: params.isCritical,
          weight: 0.3,
          impactScore: params.isCritical ? 30 : 5,
        },
      ];

      const score = Math.min(100, Math.round(factors.reduce((sum, f) => sum + f.impactScore, 0)));

      risks.push({
        id: `RISK-DELAY-${params.activityId}`,
        projectId: params.projectId,
        activityId: params.activityId,
        activityCode: params.activityCode,
        activityName: params.activityName,
        discipline: params.discipline,
        riskType: RiskType.SCHEDULE_DELAY,
        severity,
        status: RiskStatus.OPEN,
        score,
        confidence: 0.95,
        trigger: `Schedule variance is +${delayDays} days behind planned schedule.`,
        factors,
        explanation: {
          whatHappened: `Activity execution is delayed by ${delayDays} days relative to planned baseline.`,
          whyItMatters: params.isCritical
            ? `This activity lies on the Critical Path; delay directly impacts the overall project completion milestone.`
            : `This activity has ${params.successorCount} downstream dependencies that may suffer cascading start delays.`,
          evidence: `Verified schedule variance of +${delayDays} days (Planned: ${new Date(params.plannedStart).toLocaleDateString()}, Actual: ${aStart ? new Date(aStart).toLocaleDateString() : 'Not recorded'}).`,
          evidenceSourceLocator: 'ScheduleVarianceService',
          affectedDownstreamCount: params.successorCount,
          recommendedAction: params.isCritical
            ? 'Expedite labor/materials or adjust downstream float immediately.'
            : 'Review downstream predecessor schedule float.',
        },
        evidenceSources: [
          {
            documentName: 'Project Schedule Baseline',
            pageOrLocation: `Activity ${params.activityCode}`,
            excerpt: `Planned start was ${new Date(params.plannedStart).toISOString().slice(0, 10)}, current delay +${delayDays} days.`,
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Rule 2: PROGRESS_LAG
    const progressDelta = params.actualProgress - params.plannedProgress;
    if (progressDelta < -DASHBOARD_CONFIG.PROGRESS_LAG_THRESHOLD && params.status !== 'COMPLETED') {
      const lagPercent = Math.round(Math.abs(progressDelta) * 100);
      const severity = lagPercent >= 30 ? RiskSeverity.HIGH : RiskSeverity.MEDIUM;

      const factors: RiskFactorDTO[] = [
        {
          type: 'PROGRESS_LAG',
          label: 'Progress Deficit',
          value: `-${lagPercent}%`,
          weight: 0.5,
          impactScore: Math.min(50, lagPercent * 1.5),
        },
        {
          type: 'CRITICAL_ACTIVITY',
          label: 'Critical Path',
          value: params.isCritical,
          weight: 0.3,
          impactScore: params.isCritical ? 30 : 10,
        },
        {
          type: 'SUCCESSORS',
          label: 'Successors',
          value: params.successorCount,
          weight: 0.2,
          impactScore: Math.min(20, params.successorCount * 4),
        },
      ];

      const score = Math.min(100, Math.round(factors.reduce((sum, f) => sum + f.impactScore, 0)));

      risks.push({
        id: `RISK-LAG-${params.activityId}`,
        projectId: params.projectId,
        activityId: params.activityId,
        activityCode: params.activityCode,
        activityName: params.activityName,
        discipline: params.discipline,
        riskType: RiskType.PROGRESS_LAG,
        severity,
        status: RiskStatus.OPEN,
        score,
        confidence: 0.90,
        trigger: `Actual progress (${Math.round(params.actualProgress * 100)}%) lags planned progress (${Math.round(params.plannedProgress * 100)}%) by ${lagPercent}%.`,
        factors,
        explanation: {
          whatHappened: `Actual verified progress is lagging behind planned linear schedule velocity by ${lagPercent}%.`,
          whyItMatters: `At current burn rate, activity will overrun its planned duration by approximately ${Math.round(params.plannedDuration * (lagPercent / 100))} days.`,
          evidence: `Verified field progress: ${Math.round(params.actualProgress * 100)}% vs Planned: ${Math.round(params.plannedProgress * 100)}%.`,
          evidenceSourceLocator: 'ProgressService',
          affectedDownstreamCount: params.successorCount,
          recommendedAction: 'Verify site manpower and equipment productivity in upcoming DPR.',
        },
        evidenceSources: [
          {
            documentName: 'DPR Progress Tracker',
            pageOrLocation: `Progress Delta: -${lagPercent}%`,
            excerpt: `Target was ${Math.round(params.plannedProgress * 100)}%, verified actual is ${Math.round(params.actualProgress * 100)}%.`,
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Rule 3: STALE_UPDATE
    if (params.lastUpdateDate && params.status === 'IN_PROGRESS') {
      const lastUpdate = new Date(params.lastUpdateDate).getTime();
      const hoursSinceUpdate = Math.round((now - lastUpdate) / msPerHour);

      if (hoursSinceUpdate > DASHBOARD_CONFIG.STALE_AFTER_HOURS) {
        const severity = hoursSinceUpdate > 96 ? RiskSeverity.MEDIUM : RiskSeverity.LOW;

        const factors: RiskFactorDTO[] = [
          {
            type: 'STALE_UPDATE',
            label: 'Hours Since Verified Update',
            value: `${hoursSinceUpdate}h`,
            weight: 0.6,
            impactScore: Math.min(60, Math.round(hoursSinceUpdate / 2)),
          },
          {
            type: 'ACTIVITY_STATUS',
            label: 'Activity Status',
            value: params.status,
            weight: 0.4,
            impactScore: 20,
          },
        ];

        const score = Math.min(100, Math.round(factors.reduce((sum, f) => sum + f.impactScore, 0)));

        risks.push({
          id: `RISK-STALE-${params.activityId}`,
          projectId: params.projectId,
          activityId: params.activityId,
          activityCode: params.activityCode,
          activityName: params.activityName,
          discipline: params.discipline,
          riskType: RiskType.STALE_UPDATE,
          severity,
          status: RiskStatus.OPEN,
          score,
          confidence: 0.85,
          trigger: `No verified field progress recorded for ${hoursSinceUpdate} hours (threshold: ${DASHBOARD_CONFIG.STALE_AFTER_HOURS}h).`,
          factors,
          explanation: {
            whatHappened: `Activity is marked IN_PROGRESS but has received no verified DPR updates for ${hoursSinceUpdate} hours.`,
            whyItMatters: `Project managers lack real-time visibility on actual work execution for this activity.`,
            evidence: `Last verified update timestamp: ${new Date(params.lastUpdateDate).toLocaleString()}`,
            evidenceSourceLocator: 'FreshnessService',
            affectedDownstreamCount: params.successorCount,
            recommendedAction: 'Request supervisor field report update or verify if work is paused.',
          },
          evidenceSources: [
            {
              documentName: 'Audit Trail',
              pageOrLocation: 'Last Activity Verification',
              excerpt: `Last update was ${hoursSinceUpdate} hours ago on ${new Date(params.lastUpdateDate).toISOString().slice(0, 10)}.`,
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    // Rule 4: DEPENDENCY_BLOCK
    if (params.predecessors && params.predecessors.length > 0) {
      const delayedPredecessors = params.predecessors.filter((p) => p.varianceDays > 2);
      if (delayedPredecessors.length > 0 && params.status === 'NOT_STARTED') {
        const worstDelay = Math.max(...delayedPredecessors.map((p) => p.varianceDays));
        const severity = params.isCritical ? RiskSeverity.CRITICAL : RiskSeverity.HIGH;

        const factors: RiskFactorDTO[] = [
          {
            type: 'PREDECESSOR_DELAY',
            label: 'Predecessor Delay',
            value: `+${worstDelay} days`,
            weight: 0.5,
            impactScore: Math.min(50, worstDelay * 10),
          },
          {
            type: 'CRITICAL_ACTIVITY',
            label: 'Critical Path Status',
            value: params.isCritical,
            weight: 0.5,
            impactScore: params.isCritical ? 40 : 15,
          },
        ];

        const score = Math.min(100, Math.round(factors.reduce((sum, f) => sum + f.impactScore, 0)));

        risks.push({
          id: `RISK-DEP-${params.activityId}`,
          projectId: params.projectId,
          activityId: params.activityId,
          activityCode: params.activityCode,
          activityName: params.activityName,
          discipline: params.discipline,
          riskType: RiskType.DEPENDENCY_BLOCK,
          severity,
          status: RiskStatus.OPEN,
          score,
          confidence: 0.95,
          trigger: `Upstream predecessor ${delayedPredecessors[0].code} is delayed by +${worstDelay} days, blocking start.`,
          factors,
          explanation: {
            whatHappened: `Activity cannot start on planned date because upstream predecessor ${delayedPredecessors[0].code} has not completed.`,
            whyItMatters: `Downstream execution cannot begin until physical predecessor requirements are satisfied.`,
            evidence: `Predecessor ${delayedPredecessors[0].code} schedule variance: +${worstDelay} days.`,
            evidenceSourceLocator: 'DependencyImpactService',
            affectedDownstreamCount: params.successorCount,
            recommendedAction: `Inspect predecessor ${delayedPredecessors[0].code} completion status before mobilizing crews.`,
          },
          evidenceSources: [
            {
              documentName: 'Dependency Network',
              pageOrLocation: `Predecessor ${delayedPredecessors[0].code}`,
              excerpt: `Predecessor has variance of +${worstDelay} days.`,
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    // Rule 5: LOW_CONFIDENCE_MATCH
    if (params.matches && params.matches.length > 0) {
      const lowConf = params.matches.find(
        (m) => m.confidence < DASHBOARD_CONFIG.LOW_CONFIDENCE_THRESHOLD && m.status === 'REVIEW_REQUIRED'
      );
      if (lowConf && params.isCritical) {
        risks.push({
          id: `RISK-CONF-${params.activityId}`,
          projectId: params.projectId,
          activityId: params.activityId,
          activityCode: params.activityCode,
          activityName: params.activityName,
          discipline: params.discipline,
          riskType: RiskType.LOW_CONFIDENCE_MATCH,
          severity: RiskSeverity.MEDIUM,
          status: RiskStatus.OPEN,
          score: 65,
          confidence: 0.75,
          trigger: `Critical activity match confidence is ${(lowConf.confidence * 100).toFixed(1)}% (below ${DASHBOARD_CONFIG.LOW_CONFIDENCE_THRESHOLD * 100}% threshold).`,
          factors: [
            {
              type: 'LOW_CONFIDENCE',
              label: 'Match Confidence Deficit',
              value: `${(lowConf.confidence * 100).toFixed(1)}%`,
              weight: 0.6,
              impactScore: 40,
            },
            {
              type: 'CRITICAL_ACTIVITY',
              label: 'Critical Path',
              value: true,
              weight: 0.4,
              impactScore: 25,
            },
          ],
          explanation: {
            whatHappened: `An incoming DPR report was matched to this critical activity with low confidence (${(lowConf.confidence * 100).toFixed(1)}%).`,
            whyItMatters: `Applying unverified low-confidence match progress could corrupt the critical path schedule.`,
            evidence: `Report ${lowConf.docName} (Page ${lowConf.page}): "${lowConf.text}"`,
            evidenceSourceLocator: `${lowConf.docName}#P${lowConf.page}`,
            affectedDownstreamCount: params.successorCount,
            recommendedAction: 'Open Review Queue to manually verify or reassign this match proposal.',
          },
          evidenceSources: [
            {
              documentName: lowConf.docName,
              pageOrLocation: `Page ${lowConf.page}`,
              excerpt: lowConf.text || 'Field update text requiring verification',
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    return risks;
  }

  /**
   * Retrieves single risk detail by riskId.
   */
  public async getRiskById(projectId: string, riskId: string): Promise<RiskDTO | null> {
    const overview = await this.evaluateProjectRisks(projectId);
    return overview.risks.find((r) => r.id === riskId) || null;
  }
}
