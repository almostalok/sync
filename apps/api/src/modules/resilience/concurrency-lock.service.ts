/**
 * SiteSync Optimistic Concurrency & Mutual Exclusion Service (Master Prompt 12 Section 48)
 *
 * Prevents race conditions where two planners review/accept/reject the same match
 * or update the same activity progress simultaneously.
 */

export interface ConcurrencyRecord {
  resourceId: string;
  version: number;
  lockedBy?: string;
  lockedAt?: number;
}

export class ConcurrencyLockService {
  private static resourceVersions: Map<string, number> = new Map();
  private static activeLocks: Map<string, { lockedBy: string; lockedAt: number; ttlMs: number }> = new Map();

  /**
   * Initializes or gets current version for an entity.
   */
  public static getVersion(resourceId: string): number {
    if (!ConcurrencyLockService.resourceVersions.has(resourceId)) {
      ConcurrencyLockService.resourceVersions.set(resourceId, 1);
    }
    return ConcurrencyLockService.resourceVersions.get(resourceId)!;
  }

  /**
   * Attempts an atomic mutation with optimistic version verification.
   * Throws 409 Conflict if version has been incremented by a concurrent actor.
   */
  public executeWithOptimisticLock<T>(
    resourceId: string,
    expectedVersion: number,
    mutation: (newVersion: number) => T
  ): { success: boolean; result: T; newVersion: number } {
    const currentVersion = ConcurrencyLockService.getVersion(resourceId);

    if (currentVersion !== expectedVersion) {
      throw new Error(
        `CONCURRENCY_CONFLICT: Resource '${resourceId}' was modified by another user (expected version ${expectedVersion}, but current is ${currentVersion}). Please refresh and try again.`
      );
    }

    const nextVersion = currentVersion + 1;
    const result = mutation(nextVersion);
    ConcurrencyLockService.resourceVersions.set(resourceId, nextVersion);

    return {
      success: true,
      result,
      newVersion: nextVersion,
    };
  }

  /**
   * Acquires a short-lived distributed mutex lock for a resource.
   */
  public acquireLock(resourceId: string, actorId: string, ttlMs: number = 3000): boolean {
    const now = Date.now();
    const existing = ConcurrencyLockService.activeLocks.get(resourceId);

    if (existing && now - existing.lockedAt < existing.ttlMs && existing.lockedBy !== actorId) {
      return false; // Already locked by another actor
    }

    ConcurrencyLockService.activeLocks.set(resourceId, {
      lockedBy: actorId,
      lockedAt: now,
      ttlMs,
    });
    return true;
  }

  /**
   * Releases an acquired lock.
   */
  public releaseLock(resourceId: string, actorId: string): void {
    const existing = ConcurrencyLockService.activeLocks.get(resourceId);
    if (existing && existing.lockedBy === actorId) {
      ConcurrencyLockService.activeLocks.delete(resourceId);
    }
  }

  public static clear(): void {
    ConcurrencyLockService.resourceVersions.clear();
    ConcurrencyLockService.activeLocks.clear();
  }
}
