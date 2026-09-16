import { ActorType, AuditEventType, Discipline, MatchDecision, MatchStatus, ReviewAction, UserRole } from '@sitesync/types';
import {
  ReviewQueueFilters,
  ReviewSortOption,
  ReviewItemModel,
  ReviewActionRequest,
  ReviewActionResult,
} from './review.types';
import { ReviewPriorityService } from './review-priority.service';
import { ReviewPolicyService } from './review-policy.service';
import { EvidenceService } from '../evidence/evidence.service';
import { ProgressService } from '../progress/progress.service';
import { ScheduleSyncService } from '../schedule-sync/schedule-sync.service';
import { DependencyImpactService } from '../schedule-sync/dependency-impact.service';
import { AuditService } from '../audit/audit.service';
import { EventBusService } from '../events/event-bus.service';

export class ReviewService {
  private priorityService = new ReviewPriorityService();
  private policyService = new ReviewPolicyService();
  private evidenceService = new EvidenceService();
  private progressService = new ProgressService();
  private scheduleSyncService = new ScheduleSyncService();
  private impactService = new DependencyImpactService();
  private auditService = new AuditService();
  private eventBus = EventBusService.getInstance();

  private static inMemoryQueue: Map<string, ReviewItemModel> = new Map();
  private static idempotencyCache: Map<string, ReviewActionResult> = new Map();

  /**
   * Registers a review item into the queue (e.g. from AI inference).
   */
  public static registerReviewItem(item: ReviewItemModel): void {
    ReviewService.inMemoryQueue.set(item.id, item);
  }

  /**
   * Clears the in-memory queue and idempotency cache.
   */
  public static clear(): void {
    ReviewService.inMemoryQueue.clear();
    ReviewService.idempotencyCache.clear();
  }

  /**
   * Retrieves the project review queue with filtering, priority calculation, and sorting.
   */
  public async getReviewQueue(
    filters: ReviewQueueFilters,
    sortOption: ReviewSortOption = 'PRIORITY_DESC'
  ): Promise<{ items: ReviewItemModel[]; total: number }> {
    let items = Array.from(ReviewService.inMemoryQueue.values()).filter(
      (item) => item.projectId === filters.projectId
    );

    // Filter by status
    if (filters.status) {
      items = items.filter((i) => i.status === filters.status);
    } else {
      // Default: show pending reviews
      items = items.filter((i) => i.status === MatchStatus.REVIEW_REQUIRED || i.status === 'REVIEW_REQUIRED');
    }

    // Filter by discipline
    if (filters.discipline) {
      items = items.filter((i) => i.recommendedMatch.discipline === filters.discipline || i.event.discipline === filters.discipline);
    }

    // Filter by confidence
    if (filters.minConfidence !== undefined) {
      items = items.filter((i) => i.recommendedMatch.confidence >= filters.minConfidence!);
    }
    if (filters.maxConfidence !== undefined) {
      items = items.filter((i) => i.recommendedMatch.confidence <= filters.maxConfidence!);
    }

    // Filter by search keyword
    if (filters.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        (i) =>
          i.event.description.toLowerCase().includes(q) ||
          i.recommendedMatch.activityCode.toLowerCase().includes(q) ||
          i.recommendedMatch.activityName.toLowerCase().includes(q)
      );
    }

    // Sort items
    items.sort((a, b) => {
      switch (sortOption) {
        case 'PRIORITY_DESC':
          return b.reviewPriority.score - a.reviewPriority.score;
        case 'CONFIDENCE_ASC':
          return a.recommendedMatch.confidence - b.recommendedMatch.confidence;
        case 'AMBIGUITY_DESC':
          return b.reviewPriority.components.ambiguity - a.reviewPriority.components.ambiguity;
        case 'DATE_DESC':
          return new Date(b.event.eventDate).getTime() - new Date(a.event.eventDate).getTime();
        case 'DATE_ASC':
          return new Date(a.event.eventDate).getTime() - new Date(b.event.eventDate).getTime();
        case 'DOWNSTREAM_IMPACT_DESC':
          return (b.downstreamImpact?.downstreamCount || 0) - (a.downstreamImpact?.downstreamCount || 0);
        default:
          return b.reviewPriority.score - a.reviewPriority.score;
      }
    });

    return { items, total: items.length };
  }

  /**
   * Retrieves a single review item by ID.
   */
  public async getReviewById(projectId: string, reviewId: string): Promise<ReviewItemModel | null> {
    const item = ReviewService.inMemoryQueue.get(reviewId);
    if (item) {
      const scopeCheck = this.policyService.verifyProjectScope(item.projectId, projectId);
      if (!scopeCheck.valid) throw new Error(scopeCheck.error);
      return item;
    }

    return null;
  }

  /**
   * Accepts an AI match proposal.
   */
  public async acceptMatch(request: ReviewActionRequest): Promise<ReviewActionResult> {
    // 1. Idempotency Check
    if (request.requestId && ReviewService.idempotencyCache.has(request.requestId)) {
      return ReviewService.idempotencyCache.get(request.requestId)!;
    }

    // 2. RBAC & Project Scope
    const auth = this.policyService.authorizeReviewer(request.reviewerRole);
    if (!auth.authorized) throw new Error(auth.error);

    const item = await this.getReviewById(request.projectId, request.reviewId);
    if (!item) throw new Error(`Review item '${request.reviewId}' not found.`);

    // 3. State machine validation
    const transition = this.policyService.validateTransition(item.status, ReviewAction.ACCEPT);
    if (!transition.allowed) throw new Error(transition.error);

    const previousStatus = item.status;
    const decisionId = `dec-acc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    // 4. Update Match Status
    item.status = MatchStatus.ACCEPTED;
    item.decision = MatchDecision.ACCEPTED;

    // 5. Create Verified Progress Update
    const progressResult = await this.progressService.createVerifiedProgress({
      projectId: request.projectId,
      activityId: item.recommendedMatch.activityId,
      activityCode: item.recommendedMatch.activityCode,
      previousProgress: 0.0,
      newProgress: item.event.progress ?? 1.0,
      effectiveDate: item.event.eventDate,
      sourceReportId: item.event.sourceReportId,
      sourceEventId: item.event.id,
      reviewDecisionId: decisionId,
      evidenceId: item.evidence.id,
      verifiedBy: request.reviewerName,
      notes: request.comment || `Match accepted by planner (${request.reviewerName}).`,
    });

    // 6. Schedule Synchronization & Variance Engine
    await this.scheduleSyncService.syncActivitySchedule({
      projectId: request.projectId,
      activityId: item.recommendedMatch.activityId,
      actorId: request.reviewerId,
    });

    // 7. Immutable Audit Log
    const auditLog = await this.auditService.logEvent({
      projectId: request.projectId,
      actorId: request.reviewerId,
      actorName: request.reviewerName,
      actorType: ActorType.USER,
      action: AuditEventType.MATCH_ACCEPTED,
      entityType: 'ActivityMatch',
      entityId: item.matchId,
      beforeState: { status: previousStatus },
      afterState: { status: MatchStatus.ACCEPTED, activityId: item.recommendedMatch.activityId },
      reason: request.reason || 'Planner verified match',
      explanation: `Planner ${request.reviewerName} accepted AI match proposal for ${item.recommendedMatch.activityCode} (${item.recommendedMatch.activityName}).`,
    });

    // 8. WebSocket Event Broadcast
    this.eventBus.emit('match.accepted', request.projectId, {
      matchId: item.matchId,
      reviewId: item.id,
      activityId: item.recommendedMatch.activityId,
      progress: item.event.progress,
      reviewedBy: request.reviewerName,
    });

    const result: ReviewActionResult = {
      success: true,
      decisionId,
      matchId: item.matchId,
      previousStatus,
      newStatus: MatchStatus.ACCEPTED,
      selectedActivityId: item.recommendedMatch.activityId,
      progressUpdateId: progressResult.id,
      scheduleSynced: true,
      auditLogId: auditLog.id,
      message: `Match for ${item.recommendedMatch.activityCode} accepted and verified progress created successfully.`,
    };

    if (request.requestId) {
      ReviewService.idempotencyCache.set(request.requestId, result);
    }

    return result;
  }

  /**
   * Rejects an AI match proposal with mandatory reason.
   */
  public async rejectMatch(request: ReviewActionRequest): Promise<ReviewActionResult> {
    if (request.requestId && ReviewService.idempotencyCache.has(request.requestId)) {
      return ReviewService.idempotencyCache.get(request.requestId)!;
    }

    const auth = this.policyService.authorizeReviewer(request.reviewerRole);
    if (!auth.authorized) throw new Error(auth.error);

    if (!request.reason) {
      throw new Error('Rejecting an AI match requires an explicit reason.');
    }

    const item = await this.getReviewById(request.projectId, request.reviewId);
    if (!item) throw new Error(`Review item '${request.reviewId}' not found.`);

    const transition = this.policyService.validateTransition(item.status, ReviewAction.REJECT);
    if (!transition.allowed) throw new Error(transition.error);

    const previousStatus = item.status;
    const decisionId = `dec-rej-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    item.status = MatchStatus.REJECTED;
    item.decision = MatchDecision.REJECTED;

    const auditLog = await this.auditService.logEvent({
      projectId: request.projectId,
      actorId: request.reviewerId,
      actorName: request.reviewerName,
      actorType: ActorType.USER,
      action: AuditEventType.MATCH_REJECTED,
      entityType: 'ActivityMatch',
      entityId: item.matchId,
      beforeState: { status: previousStatus },
      afterState: { status: MatchStatus.REJECTED, reason: request.reason },
      reason: request.reason,
      explanation: `Planner ${request.reviewerName} rejected AI candidate ${item.recommendedMatch.activityCode}. Reason: ${request.reason}`,
    });

    this.eventBus.emit('match.rejected', request.projectId, {
      matchId: item.matchId,
      reviewId: item.id,
      reason: request.reason,
      reviewedBy: request.reviewerName,
    });

    const result: ReviewActionResult = {
      success: true,
      decisionId,
      matchId: item.matchId,
      previousStatus,
      newStatus: MatchStatus.REJECTED,
      scheduleSynced: false,
      auditLogId: auditLog.id,
      message: `Match rejected: ${request.reason}`,
    };

    if (request.requestId) {
      ReviewService.idempotencyCache.set(request.requestId, result);
    }

    return result;
  }

  /**
   * Reassigns an AI match to a planner-selected activity.
   */
  public async reassignMatch(request: ReviewActionRequest): Promise<ReviewActionResult> {
    if (request.requestId && ReviewService.idempotencyCache.has(request.requestId)) {
      return ReviewService.idempotencyCache.get(request.requestId)!;
    }

    const auth = this.policyService.authorizeReviewer(request.reviewerRole);
    if (!auth.authorized) throw new Error(auth.error);

    if (!request.selectedActivityId) {
      throw new Error('Reassigning a match requires a valid selectedActivityId.');
    }
    if (!request.reason) {
      throw new Error('Reassigning a match requires an explicit reason.');
    }

    const item = await this.getReviewById(request.projectId, request.reviewId);
    if (!item) throw new Error(`Review item '${request.reviewId}' not found.`);

    const transition = this.policyService.validateTransition(item.status, ReviewAction.REASSIGN);
    if (!transition.allowed) throw new Error(transition.error);

    const previousStatus = item.status;
    const aiProposedActivityId = item.recommendedMatch.activityId;
    const aiProposedCode = item.recommendedMatch.activityCode;
    const decisionId = `dec-reassign-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    item.status = MatchStatus.REASSIGNED;
    item.decision = MatchDecision.REASSIGNED;

    // Execute verified progress for the newly selected activity
    const progressResult = await this.progressService.createVerifiedProgress({
      projectId: request.projectId,
      activityId: request.selectedActivityId,
      activityCode: request.selectedActivityId,
      previousProgress: 0.0,
      newProgress: item.event.progress ?? 1.0,
      effectiveDate: item.event.eventDate,
      sourceReportId: item.event.sourceReportId,
      sourceEventId: item.event.id,
      reviewDecisionId: decisionId,
      evidenceId: item.evidence.id,
      verifiedBy: request.reviewerName,
      notes: `Reassigned from ${aiProposedCode} to ${request.selectedActivityId}. Reason: ${request.reason}`,
    });

    await this.scheduleSyncService.syncActivitySchedule({
      projectId: request.projectId,
      activityId: request.selectedActivityId,
      actorId: request.reviewerId,
    });

    const auditLog = await this.auditService.logEvent({
      projectId: request.projectId,
      actorId: request.reviewerId,
      actorName: request.reviewerName,
      actorType: ActorType.USER,
      action: AuditEventType.MATCH_REASSIGNED,
      entityType: 'ActivityMatch',
      entityId: item.matchId,
      beforeState: { status: previousStatus, aiSelectedActivityId: aiProposedActivityId },
      afterState: { status: MatchStatus.REASSIGNED, selectedActivityId: request.selectedActivityId },
      reason: request.reason,
      explanation: `Planner ${request.reviewerName} reassigned match from ${aiProposedCode} to ${request.selectedActivityId}. Reason: ${request.reason}`,
      metadata: {
        aiSelected: aiProposedActivityId,
        humanSelected: request.selectedActivityId,
        comment: request.comment,
      },
    });

    this.eventBus.emit('match.reassigned', request.projectId, {
      matchId: item.matchId,
      reviewId: item.id,
      aiProposed: aiProposedActivityId,
      humanSelected: request.selectedActivityId,
      reviewedBy: request.reviewerName,
    });

    const result: ReviewActionResult = {
      success: true,
      decisionId,
      matchId: item.matchId,
      previousStatus,
      newStatus: MatchStatus.REASSIGNED,
      selectedActivityId: request.selectedActivityId,
      progressUpdateId: progressResult.id,
      scheduleSynced: true,
      auditLogId: auditLog.id,
      message: `Match reassigned to ${request.selectedActivityId} and verified progress created.`,
    };

    if (request.requestId) {
      ReviewService.idempotencyCache.set(request.requestId, result);
    }

    return result;
  }

  /**
   * Marks a match proposal as UNMATCHED (e.g. out-of-scope site event).
   */
  public async markUnmatched(request: ReviewActionRequest): Promise<ReviewActionResult> {
    if (request.requestId && ReviewService.idempotencyCache.has(request.requestId)) {
      return ReviewService.idempotencyCache.get(request.requestId)!;
    }

    const auth = this.policyService.authorizeReviewer(request.reviewerRole);
    if (!auth.authorized) throw new Error(auth.error);

    const item = await this.getReviewById(request.projectId, request.reviewId);
    if (!item) throw new Error(`Review item '${request.reviewId}' not found.`);

    const previousStatus = item.status;
    const decisionId = `dec-unm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    item.status = MatchStatus.UNMATCHED;
    item.decision = MatchDecision.UNMATCHED;

    const auditLog = await this.auditService.logEvent({
      projectId: request.projectId,
      actorId: request.reviewerId,
      actorName: request.reviewerName,
      actorType: ActorType.USER,
      action: AuditEventType.MATCH_MARKED_UNMATCHED,
      entityType: 'ActivityMatch',
      entityId: item.matchId,
      beforeState: { status: previousStatus },
      afterState: { status: MatchStatus.UNMATCHED },
      reason: request.reason || 'Event does not correspond to any planned activity',
      explanation: `Planner ${request.reviewerName} marked event '${item.event.description}' as UNMATCHED.`,
    });

    const result: ReviewActionResult = {
      success: true,
      decisionId,
      matchId: item.matchId,
      previousStatus,
      newStatus: MatchStatus.UNMATCHED,
      scheduleSynced: false,
      auditLogId: auditLog.id,
      message: `Event marked as UNMATCHED.`,
    };

    if (request.requestId) {
      ReviewService.idempotencyCache.set(request.requestId, result);
    }

    return result;
  }

  /**
   * Returns review decision history for a given match ID.
   */
  public async getMatchHistory(projectId: string, matchId: string) {
    const logs = await this.auditService.getAuditLogs({
      projectId,
      entityType: 'ActivityMatch',
      entityId: matchId,
    });
    return logs;
  }
}
