import { MatchStatus, ReviewAction, UserRole } from '@sitesync/types';

export class ReviewPolicyService {
  /**
   * Validates whether a review decision transition is permitted by the state machine.
   */
  public validateTransition(currentStatus: string, action: ReviewAction): { allowed: boolean; newStatus: MatchStatus; error?: string } {
    if (currentStatus === MatchStatus.ACCEPTED) {
      return {
        allowed: false,
        newStatus: MatchStatus.ACCEPTED,
        error: 'Match has already been ACCEPTED. Authoritative verified updates cannot be overwritten without a progress correction.',
      };
    }

    if (currentStatus === MatchStatus.SUPERSEDED) {
      return {
        allowed: false,
        newStatus: MatchStatus.SUPERSEDED,
        error: 'Match has been SUPERSEDED by a newer matcher version.',
      };
    }

    switch (action) {
      case ReviewAction.ACCEPT:
        return { allowed: true, newStatus: MatchStatus.ACCEPTED };
      case ReviewAction.REJECT:
        return { allowed: true, newStatus: MatchStatus.REJECTED };
      case ReviewAction.REASSIGN:
        return { allowed: true, newStatus: MatchStatus.REASSIGNED };
      case ReviewAction.MARK_UNMATCHED:
        return { allowed: true, newStatus: MatchStatus.UNMATCHED };
      default:
        return { allowed: false, newStatus: MatchStatus.REVIEW_REQUIRED, error: `Unknown review action: ${action}` };
    }
  }

  /**
   * Enforces server-side Role-Based Access Control (RBAC) for review operations.
   */
  public authorizeReviewer(role: UserRole | string): { authorized: boolean; error?: string } {
    const authorizedRoles = [UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.PLANNER, 'ADMIN', 'PROJECT_MANAGER', 'PLANNER'];

    if (!authorizedRoles.includes(role as any)) {
      return {
        authorized: false,
        error: `User with role '${role}' is not authorized to verify or approve schedule matching decisions. Required roles: PLANNER, PROJECT_MANAGER, ADMIN.`,
      };
    }

    return { authorized: true };
  }

  /**
   * Verifies that the match belongs strictly to the requested project (Project Isolation).
   */
  public verifyProjectScope(matchProjectId: string, requestedProjectId: string): { valid: boolean; error?: string } {
    if (matchProjectId !== requestedProjectId) {
      return {
        valid: false,
        error: `Access Denied: Resource belongs to project '${matchProjectId}', but requested under project '${requestedProjectId}'.`,
      };
    }
    return { valid: true };
  }
}
