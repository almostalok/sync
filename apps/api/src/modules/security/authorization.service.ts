/**
 * SiteSync Centralized Authorization & RBAC Service (Master Prompt 12)
 *
 * Defines enterprise roles, discrete permission gates, and centralized authorization policies.
 */

export enum Role {
  ADMIN = 'ADMIN',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  PLANNER = 'PLANNER',
  SUPERVISOR = 'SUPERVISOR',
  VIEWER = 'VIEWER',
}

export enum Permission {
  PROJECT_VIEW = 'PROJECT_VIEW',
  PROJECT_EDIT = 'PROJECT_EDIT',
  PROJECT_CLOSE = 'PROJECT_CLOSE',
  PROJECT_ARCHIVE = 'PROJECT_ARCHIVE',

  SCHEDULE_VIEW = 'SCHEDULE_VIEW',
  SCHEDULE_IMPORT = 'SCHEDULE_IMPORT',

  REPORT_CREATE = 'REPORT_CREATE',
  REPORT_VIEW = 'REPORT_VIEW',

  MATCH_VIEW = 'MATCH_VIEW',
  MATCH_REVIEW = 'MATCH_REVIEW',

  PROGRESS_VIEW = 'PROGRESS_VIEW',
  PROGRESS_VERIFY = 'PROGRESS_VERIFY',
  PROGRESS_CORRECT = 'PROGRESS_CORRECT',

  RISK_VIEW = 'RISK_VIEW',
  FORECAST_VIEW = 'FORECAST_VIEW',
  HISTORY_VIEW = 'HISTORY_VIEW',

  COPILOT_QUERY = 'COPILOT_QUERY',
  VOICE_REPORT_CREATE = 'VOICE_REPORT_CREATE',
  AUDIT_VIEW = 'AUDIT_VIEW',
}

export class AuthorizationService {
  private static rolePermissions: Record<Role, Set<Permission>> = {
    [Role.ADMIN]: new Set(Object.values(Permission)),
    [Role.PROJECT_MANAGER]: new Set([
      Permission.PROJECT_VIEW,
      Permission.PROJECT_EDIT,
      Permission.PROJECT_CLOSE,
      Permission.SCHEDULE_VIEW,
      Permission.SCHEDULE_IMPORT,
      Permission.REPORT_CREATE,
      Permission.REPORT_VIEW,
      Permission.MATCH_VIEW,
      Permission.MATCH_REVIEW,
      Permission.PROGRESS_VIEW,
      Permission.PROGRESS_VERIFY,
      Permission.PROGRESS_CORRECT,
      Permission.RISK_VIEW,
      Permission.FORECAST_VIEW,
      Permission.HISTORY_VIEW,
      Permission.COPILOT_QUERY,
      Permission.VOICE_REPORT_CREATE,
      Permission.AUDIT_VIEW,
    ]),
    [Role.PLANNER]: new Set([
      Permission.PROJECT_VIEW,
      Permission.SCHEDULE_VIEW,
      Permission.SCHEDULE_IMPORT,
      Permission.REPORT_CREATE,
      Permission.REPORT_VIEW,
      Permission.MATCH_VIEW,
      Permission.MATCH_REVIEW,
      Permission.PROGRESS_VIEW,
      Permission.PROGRESS_VERIFY,
      Permission.RISK_VIEW,
      Permission.FORECAST_VIEW,
      Permission.HISTORY_VIEW,
      Permission.COPILOT_QUERY,
      Permission.VOICE_REPORT_CREATE,
      Permission.AUDIT_VIEW,
    ]),
    [Role.SUPERVISOR]: new Set([
      Permission.PROJECT_VIEW,
      Permission.SCHEDULE_VIEW,
      Permission.REPORT_CREATE,
      Permission.REPORT_VIEW,
      Permission.MATCH_VIEW,
      Permission.PROGRESS_VIEW,
      Permission.COPILOT_QUERY,
      Permission.VOICE_REPORT_CREATE,
    ]),
    [Role.VIEWER]: new Set([
      Permission.PROJECT_VIEW,
      Permission.SCHEDULE_VIEW,
      Permission.REPORT_VIEW,
      Permission.MATCH_VIEW,
      Permission.PROGRESS_VIEW,
      Permission.RISK_VIEW,
      Permission.FORECAST_VIEW,
      Permission.HISTORY_VIEW,
      Permission.COPILOT_QUERY,
    ]),
  };

  /**
   * Evaluates if a given role possesses a requested permission.
   */
  public hasPermission(role: Role | string, permission: Permission): boolean {
    const validRole = role as Role;
    const permissions = AuthorizationService.rolePermissions[validRole];
    if (!permissions) return false;
    return permissions.has(permission);
  }

  /**
   * Asserts permission or throws a standardized AuthorizationError.
   */
  public assertPermission(role: Role | string, permission: Permission, context?: string): void {
    if (!this.hasPermission(role, permission)) {
      throw new Error(
        `Authorization Denied: Role '${role}' lacks permission '${permission}'${context ? ` for ${context}` : ''}.`
      );
    }
  }
}
