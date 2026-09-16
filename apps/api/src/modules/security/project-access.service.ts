/**
 * SiteSync Project Isolation & IDOR Protection Service (Master Prompt 12)
 *
 * Enforces strict multi-tenant boundary isolation.
 * Prevents cross-project data leakage, unauthorized resource access, and IDOR attacks.
 */

import { AuthorizationService, Permission, Role } from './authorization.service';

export interface UserProjectMembership {
  userId: string;
  projectId: string;
  role: Role;
}

export class ProjectAccessService {
  private authService = new AuthorizationService();

  // In-memory tenant/project membership registry
  private static memberships: Map<string, UserProjectMembership> = new Map([
    ['usr-admin-01:PROJ-OIL-2026-01', { userId: 'usr-admin-01', projectId: 'PROJ-OIL-2026-01', role: Role.ADMIN }],
    ['usr-pm-01:PROJ-OIL-2026-01', { userId: 'usr-pm-01', projectId: 'PROJ-OIL-2026-01', role: Role.PROJECT_MANAGER }],
    ['usr-planner-01:PROJ-OIL-2026-01', { userId: 'usr-planner-01', projectId: 'PROJ-OIL-2026-01', role: Role.PLANNER }],
    ['usr-sup-01:PROJ-OIL-2026-01', { userId: 'usr-sup-01', projectId: 'PROJ-OIL-2026-01', role: Role.SUPERVISOR }],
    ['usr-viewer-01:PROJ-OIL-2026-01', { userId: 'usr-viewer-01', projectId: 'PROJ-OIL-2026-01', role: Role.VIEWER }],
    // User from a completely different tenant/project
    ['usr-other-02:PROJ-OTHER-TENANT', { userId: 'usr-other-02', projectId: 'PROJ-OTHER-TENANT', role: Role.PLANNER }],
  ]);

  /**
   * Registers user membership in a project (used in tests and onboarding).
   */
  public static registerMembership(membership: UserProjectMembership): void {
    const key = `${membership.userId}:${membership.projectId}`;
    ProjectAccessService.memberships.set(key, membership);
  }

  /**
   * Validates if a user has access to a project with a specific permission.
   */
  public verifyProjectAccess(params: {
    userId: string;
    projectId: string;
    permission: Permission;
  }): { allowed: boolean; role?: Role; error?: string } {
    // Super-admin system accounts bypass project scoping
    if (params.userId === 'SYSTEM' || params.userId.startsWith('sys-admin')) {
      return { allowed: true, role: Role.ADMIN };
    }

    const key = `${params.userId}:${params.projectId}`;
    const membership = ProjectAccessService.memberships.get(key);

    if (!membership) {
      return {
        allowed: false,
        error: `Project Isolation Breach: User '${params.userId}' does not have authorized membership in project '${params.projectId}'.`,
      };
    }

    if (!this.authService.hasPermission(membership.role, params.permission)) {
      return {
        allowed: false,
        role: membership.role,
        error: `Access Denied: User role '${membership.role}' lacks permission '${params.permission}' in project '${params.projectId}'.`,
      };
    }

    return { allowed: true, role: membership.role };
  }

  /**
   * Enforces IDOR protection: Asserts that an accessed entity strictly belongs to the active project context.
   */
  public assertResourceOwnership(params: {
    resourceType: string;
    resourceId: string;
    resourceProjectId: string;
    requestedProjectId: string;
  }): void {
    if (params.resourceProjectId !== params.requestedProjectId) {
      throw new Error(
        `IDOR Violation: Resource '${params.resourceType}' with ID '${params.resourceId}' belongs to project '${params.resourceProjectId}', not requested project '${params.requestedProjectId}'. Access blocked.`
      );
    }
  }

  /**
   * Asserts project access or throws an authorization error.
   */
  public assertAccess(params: {
    userId: string;
    projectId: string;
    permission: Permission;
  }): Role {
    const check = this.verifyProjectAccess(params);
    if (!check.allowed) {
      throw new Error(check.error || 'Unauthorized project access');
    }
    return check.role!;
  }
}
