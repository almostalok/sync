import { ProgressHistoryEntryDTO } from '@sitesync/types';
import { PrismaService } from '../../infrastructure/database/prisma.service';

export class ProgressHistoryService {
  private static inMemoryHistory: Map<string, ProgressHistoryEntryDTO[]> = new Map();

  /**
   * Appends an immutable progress update entry to the activity history.
   */
  public static recordEntry(activityId: string, entry: ProgressHistoryEntryDTO): void {
    const list = ProgressHistoryService.inMemoryHistory.get(activityId) || [];
    list.push(entry);
    ProgressHistoryService.inMemoryHistory.set(activityId, list);
  }

  /**
   * Retrieves chronological progress updates for an activity.
   */
  public async getHistory(projectId: string, activityId: string): Promise<ProgressHistoryEntryDTO[]> {
    const mem = ProgressHistoryService.inMemoryHistory.get(activityId);
    if (mem && mem.length > 0) {
      return [...mem].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    if (PrismaService.isAvailable()) {
      try {
        const prisma = PrismaService.getInstance();
        const updates = await prisma.progressUpdate.findMany({
          where: { activityId },
          orderBy: { effectiveDate: 'asc' },
        });

        return updates.map((u) => ({
          id: u.id,
          date: u.effectiveDate.toISOString(),
          previousProgress: u.previousProgress,
          newProgress: u.progress,
          status: u.status,
          sourceReport: u.sourceReport,
          verified: u.verified,
          verifiedBy: u.verifiedBy,
          verifiedAt: u.verifiedAt.toISOString(),
          notes: u.notes || undefined,
        }));
      } catch {
        return [];
      }
    }

    return [];
  }

  public static clear(): void {
    ProgressHistoryService.inMemoryHistory.clear();
  }
}
