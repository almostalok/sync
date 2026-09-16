'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Activity, 
  ActivityMatch, 
  ActivityStatus,
  AuditLog, 
  BenchmarkMetrics, 
  DisciplineType, 
  ExtractedEvent, 
  FieldReport, 
  ProgressUpdate, 
  ReviewDecision 
} from '@/types/domain';
import { createInitialState, ProjectState } from '@/lib/store/projectStore';
import { extractEventsFromReport } from '@/lib/ai/extractor';
import { matchEventToActivities } from '@/lib/ai/hybridMatcher';
import { calculateScheduleMetrics } from '@/lib/schedule/graphEngine';
import { runBenchmarkEvaluation } from '@/lib/evaluation/benchmarkEngine';
import { generateSyntheticProject } from '@/lib/data/syntheticGenerator';

interface ProjectContextType {
  state: ProjectState;
  setActiveView: (view: ProjectState['activeView']) => void;
  selectActivity: (id: string | null) => void;
  selectReport: (id: string | null) => void;
  selectEvent: (id: string | null) => void;
  acceptMatch: (eventId: string, matchId: string, reviewerName?: string) => void;
  rejectMatch: (eventId: string, matchId: string, reason?: string) => void;
  selectAlternativeCandidate: (eventId: string, matchId: string, newActivityId: string) => void;
  markUnmatched: (eventId: string, matchId: string) => void;
  uploadReport: (
    fileName: string, 
    sourceType: FieldReport['sourceType'], 
    rawText: string, 
    reportDate?: string, 
    discipline?: DisciplineType, 
    uploadedBy?: string
  ) => void;
  runBenchmark: () => void;
  resetDemoScenario: () => void;
  updateActivityProgress: (activityId: string, newProgress: number) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ProjectState>(() => createInitialState());

  const setActiveView = (view: ProjectState['activeView']) => {
    setState(prev => ({ ...prev, activeView: view }));
  };

  const selectActivity = (id: string | null) => {
    setState(prev => ({ ...prev, selectedActivityId: id }));
  };

  const selectReport = (id: string | null) => {
    setState(prev => ({ ...prev, selectedReportId: id }));
  };

  const selectEvent = (id: string | null) => {
    setState(prev => ({ ...prev, selectedEventId: id }));
  };

  // 1. Accept Match (Planner Verification)
  const acceptMatch = (eventId: string, matchId: string, reviewerName = 'Project Planner (P. Borah)') => {
    setState(prev => {
      const match = prev.matches.get(eventId);
      if (!match) return prev;

      const event = prev.events.find(e => e.id === eventId);
      const activity = prev.activities.find(a => a.id === match.activityId);
      if (!activity) return prev;

      // Update match decision
      const updatedMatch: ActivityMatch = {
        ...match,
        decision: 'ACCEPTED',
        decisionReason: `Verified and accepted by ${reviewerName} with source evidence preserved.`,
        updatedAt: new Date().toISOString(),
      };

      const newMatches = new Map(prev.matches);
      newMatches.set(eventId, updatedMatch);

      // Update event match reference
      const updatedEvents = prev.events.map(ev => {
        if (ev.id === eventId) {
          return { ...ev, match: updatedMatch };
        }
        return ev;
      });

      // Update Activity actual progress & status
      const prevProgress = activity.actualProgress;
      const newProgress = event?.progress !== undefined ? event.progress : Math.min(100, activity.actualProgress + 20);
      const newStatus: ActivityStatus = newProgress >= 100 ? 'COMPLETED' : newProgress > 0 ? 'IN_PROGRESS' : activity.status;

      const updatedActivities = prev.activities.map(a => {
        if (a.id === activity.id) {
          const varDays = a.plannedProgress > newProgress ? Math.max(1, Math.round((a.plannedProgress - newProgress) / 10)) : 0;
          return {
            ...a,
            actualProgress: newProgress,
            status: newStatus,
            varianceDays: varDays,
            lastUpdateDate: event?.eventDate || new Date().toISOString().split('T')[0],
            isStale: false,
          };
        }
        return a;
      });

      // Progress Update Record
      const progressUpdate: ProgressUpdate = {
        id: `PROG-${Date.now()}`,
        activityId: activity.id,
        activityCode: activity.activityCode,
        eventId: eventId,
        progress: newProgress,
        status: newStatus,
        effectiveDate: event?.eventDate || new Date().toISOString().split('T')[0],
        sourceReport: event?.reportFileName || 'DPR',
        verifiedBy: reviewerName,
        verifiedAt: new Date().toISOString(),
        previousProgress: prevProgress,
        notes: `Progress updated from ${prevProgress}% to ${newProgress}% based on field verification.`,
      };

      // Review Decision Record
      const reviewDec: ReviewDecision = {
        id: `REV-${Date.now()}`,
        matchId: match.id,
        eventId: eventId,
        activityId: activity.id,
        reviewerId: 'USR-PLANNER-01',
        reviewerName: reviewerName,
        decision: 'ACCEPTED',
        reason: 'Planner verified against field evidence.',
        timestamp: new Date().toISOString(),
      };

      // Audit Log
      const audit: AuditLog = {
        id: `AUDIT-${Date.now()}`,
        projectId: prev.project.id,
        userId: 'USR-PLANNER-01',
        userName: reviewerName,
        entityType: 'PROGRESS',
        entityId: activity.id,
        action: 'ACCEPTED',
        beforeState: { actualProgress: prevProgress, status: activity.status },
        afterState: { actualProgress: newProgress, status: newStatus },
        explanation: `Verified match for ${activity.activityCode} (${activity.name}) from ${event?.reportFileName || 'DPR'}. Actual progress set to ${newProgress}%.`,
        timestamp: new Date().toISOString(),
      };

      // Recalculate schedule metrics & risks
      const { metrics, risks, staleActivities } = calculateScheduleMetrics(
        updatedActivities,
        prev.dependencies
      );

      return {
        ...prev,
        activities: updatedActivities,
        events: updatedEvents,
        matches: newMatches,
        progressUpdates: [progressUpdate, ...prev.progressUpdates],
        reviewDecisions: [reviewDec, ...prev.reviewDecisions],
        auditLogs: [audit, ...prev.auditLogs],
        risks,
        staleActivities,
        scheduleMetrics: metrics,
      };
    });
  };

  // 2. Reject Match
  const rejectMatch = (eventId: string, matchId: string, reason = 'Planner determined event does not match proposed activity.') => {
    setState(prev => {
      const match = prev.matches.get(eventId);
      if (!match) return prev;

      const updatedMatch: ActivityMatch = {
        ...match,
        decision: 'REJECTED',
        decisionReason: reason,
        updatedAt: new Date().toISOString(),
      };

      const newMatches = new Map(prev.matches);
      newMatches.set(eventId, updatedMatch);

      const updatedEvents = prev.events.map(ev => {
        if (ev.id === eventId) return { ...ev, match: updatedMatch };
        return ev;
      });

      const audit: AuditLog = {
        id: `AUDIT-${Date.now()}`,
        projectId: prev.project.id,
        userId: 'USR-PLANNER-01',
        userName: 'Project Planner (P. Borah)',
        entityType: 'MATCH',
        entityId: matchId,
        action: 'REJECTED',
        explanation: `Rejected AI match for event ${eventId}. Reason: ${reason}`,
        timestamp: new Date().toISOString(),
      };

      return {
        ...prev,
        events: updatedEvents,
        matches: newMatches,
        auditLogs: [audit, ...prev.auditLogs],
      };
    });
  };

  // 3. Select Alternative Candidate
  const selectAlternativeCandidate = (eventId: string, matchId: string, newActivityId: string) => {
    setState(prev => {
      const match = prev.matches.get(eventId);
      const targetAct = prev.activities.find(a => a.id === newActivityId);
      if (!match || !targetAct) return prev;

      const updatedMatch: ActivityMatch = {
        ...match,
        activityId: targetAct.id,
        activityCode: targetAct.activityCode,
        activityName: targetAct.name,
        decision: 'ACCEPTED',
        decisionReason: `Planner re-assigned to alternative candidate ${targetAct.activityCode} (${targetAct.name}).`,
        updatedAt: new Date().toISOString(),
      };

      const newMatches = new Map(prev.matches);
      newMatches.set(eventId, updatedMatch);

      const event = prev.events.find(e => e.id === eventId);
      const updatedEvents = prev.events.map(ev => {
        if (ev.id === eventId) return { ...ev, match: updatedMatch };
        return ev;
      });

      const newProgress = event?.progress !== undefined ? event.progress : Math.min(100, targetAct.actualProgress + 20);
      const newStatus: ActivityStatus = newProgress >= 100 ? 'COMPLETED' : newProgress > 0 ? 'IN_PROGRESS' : targetAct.status;

      const updatedActivities = prev.activities.map(a => {
        if (a.id === targetAct.id) {
          return {
            ...a,
            actualProgress: newProgress,
            status: newStatus,
            lastUpdateDate: event?.eventDate || new Date().toISOString().split('T')[0],
          };
        }
        return a;
      });

      const audit: AuditLog = {
        id: `AUDIT-${Date.now()}`,
        projectId: prev.project.id,
        userId: 'USR-PLANNER-01',
        userName: 'Project Planner (P. Borah)',
        entityType: 'MATCH',
        entityId: matchId,
        action: 'ACCEPTED',
        explanation: `Re-assigned match from ${match.activityCode} to ${targetAct.activityCode} and updated progress.`,
        timestamp: new Date().toISOString(),
      };

      const { metrics, risks, staleActivities } = calculateScheduleMetrics(
        updatedActivities,
        prev.dependencies
      );

      return {
        ...prev,
        activities: updatedActivities,
        events: updatedEvents,
        matches: newMatches,
        auditLogs: [audit, ...prev.auditLogs],
        risks,
        staleActivities,
        scheduleMetrics: metrics,
      };
    });
  };

  // 4. Mark Unmatched
  const markUnmatched = (eventId: string, matchId: string) => {
    setState(prev => {
      const match = prev.matches.get(eventId);
      if (!match) return prev;

      const updatedMatch: ActivityMatch = {
        ...match,
        decision: 'UNMATCHED',
        decisionReason: 'Explicitly marked as UNMATCHED by planner (Safety rule: unassigned field scope).',
        updatedAt: new Date().toISOString(),
      };

      const newMatches = new Map(prev.matches);
      newMatches.set(eventId, updatedMatch);

      const updatedEvents = prev.events.map(ev => {
        if (ev.id === eventId) return { ...ev, match: updatedMatch };
        return ev;
      });

      const audit: AuditLog = {
        id: `AUDIT-${Date.now()}`,
        projectId: prev.project.id,
        userId: 'USR-PLANNER-01',
        userName: 'Project Planner (P. Borah)',
        entityType: 'MATCH',
        entityId: matchId,
        action: 'UNMATCHED',
        explanation: `Event ${eventId} marked as UNMATCHED to prevent schedule corruption.`,
        timestamp: new Date().toISOString(),
      };

      return {
        ...prev,
        events: updatedEvents,
        matches: newMatches,
        auditLogs: [audit, ...prev.auditLogs],
      };
    });
  };

  // 5. Upload & Ingest Field Report
  const uploadReport = (
    fileName: string,
    sourceType: FieldReport['sourceType'],
    rawText: string,
    reportDate = '2026-09-16',
    discipline: DisciplineType = 'GENERAL',
    uploadedBy = 'Site Supervisor'
  ) => {
    setState(prev => {
      const reportId = `REP-${Date.now().toString().slice(-6)}`;
      const newReport: FieldReport = {
        id: reportId,
        projectId: prev.project.id,
        sourceType,
        fileName,
        storageKey: `reports/oil/${fileName}`,
        reportDate,
        discipline,
        uploadedBy,
        uploadedAt: new Date().toISOString(),
        processingStatus: 'PROCESSED',
        rawText,
        pageCount: 1,
        extractedEventCount: 0,
        matchedEventCount: 0,
      };

      // Extract events
      const extracted = extractEventsFromReport({
        id: reportId,
        fileName,
        rawText,
        reportDate,
      });

      newReport.extractedEventCount = extracted.length;
      newReport.matchedEventCount = extracted.length;

      const newMatches = new Map(prev.matches);
      const newlyMatchedEvents: ExtractedEvent[] = [];

      extracted.forEach(ev => {
        const match = matchEventToActivities(ev, prev.activities, 5);
        ev.match = match;
        newMatches.set(ev.id, match);
        newlyMatchedEvents.push(ev);
      });

      const audit: AuditLog = {
        id: `AUDIT-${Date.now()}`,
        projectId: prev.project.id,
        userId: 'INGESTION_PIPELINE',
        userName: uploadedBy,
        entityType: 'REPORT',
        entityId: reportId,
        action: 'INGESTED',
        explanation: `Ingested ${sourceType} report ${fileName}. Extracted ${extracted.length} execution events.`,
        timestamp: new Date().toISOString(),
      };

      return {
        ...prev,
        fieldReports: [newReport, ...prev.fieldReports],
        events: [...newlyMatchedEvents, ...prev.events],
        matches: newMatches,
        auditLogs: [audit, ...prev.auditLogs],
        selectedReportId: reportId,
        selectedEventId: newlyMatchedEvents[0]?.id || prev.selectedEventId,
      };
    });
  };

  // 6. Run Benchmark Evaluation Suite
  const runBenchmark = () => {
    const synthetic = generateSyntheticProject();
    const metrics = runBenchmarkEvaluation(synthetic.benchmarkTestSet, state.activities);
    setState(prev => ({
      ...prev,
      benchmarkMetrics: metrics,
    }));
  };

  // 7. Reset to SIH Demo Scenario
  const resetDemoScenario = () => {
    setState(createInitialState());
  };

  // 8. Manual activity update
  const updateActivityProgress = (activityId: string, newProgress: number) => {
    setState(prev => {
      const updatedActivities: Activity[] = prev.activities.map(a => {
        if (a.id === activityId) {
          const newStatus: ActivityStatus = newProgress >= 100 ? 'COMPLETED' : newProgress > 0 ? 'IN_PROGRESS' : 'NOT_STARTED';
          const varDays = a.plannedProgress > newProgress ? Math.max(0, Math.round((a.plannedProgress - newProgress) / 10)) : 0;
          return {
            ...a,
            actualProgress: newProgress,
            status: newStatus,
            varianceDays: varDays,
            lastUpdateDate: new Date().toISOString().split('T')[0],
          };
        }
        return a;
      });

      const { metrics, risks, staleActivities } = calculateScheduleMetrics(
        updatedActivities,
        prev.dependencies
      );

      return {
        ...prev,
        activities: updatedActivities,
        risks,
        staleActivities,
        scheduleMetrics: metrics,
      };
    });
  };

  return (
    <ProjectContext.Provider
      value={{
        state,
        setActiveView,
        selectActivity,
        selectReport,
        selectEvent,
        acceptMatch,
        rejectMatch,
        selectAlternativeCandidate,
        markUnmatched,
        uploadReport,
        runBenchmark,
        resetDemoScenario,
        updateActivityProgress,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
