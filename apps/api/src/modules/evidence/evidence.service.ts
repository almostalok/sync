import { CreateEvidenceParams, EvidenceRecord } from './evidence.types';
import { EvidenceChainDTO } from '@sitesync/types';
import { PrismaService } from '../../infrastructure/database/prisma.service';

export class EvidenceService {
  private static inMemoryEvidence: Map<string, EvidenceRecord> = new Map();

  /**
   * Records structured source evidence linking extracted events to primary source documents.
   */
  public async createEvidence(params: CreateEvidenceParams): Promise<EvidenceRecord> {
    const id = params.id || `evi-${params.eventId}-${Math.random().toString(36).substring(2, 6)}`;
    const record: EvidenceRecord = {
      id,
      projectId: params.projectId,
      fieldReportId: params.fieldReportId,
      eventId: params.eventId,
      sourceType: params.sourceType,
      sourceLocator: params.sourceLocator || null,
      quotedText: params.quotedText,
      pageNumber: params.pageNumber || null,
      sheetName: params.sheetName || null,
      cellRange: params.cellRange || null,
      timestamp: params.timestamp || null,
      characterStart: params.characterStart || null,
      characterEnd: params.characterEnd || null,
      metadata: params.metadata || null,
      createdAt: new Date().toISOString(),
    };

    EvidenceService.inMemoryEvidence.set(record.eventId, record);

    if (PrismaService.isAvailable()) {
      try {
        const prisma = PrismaService.getInstance();
        await prisma.evidence.upsert({
          where: { eventId: params.eventId },
          update: {
            sourceType: String(params.sourceType),
            sourceLocator: params.sourceLocator,
            sourceText: params.quotedText,
            page: params.pageNumber,
            sheetName: params.sheetName,
            cellRange: params.cellRange,
            timestamp: params.timestamp,
            metadata: (params.metadata as any) || undefined,
          },
          create: {
            id: record.id,
            eventId: record.eventId,
            fieldReportId: record.fieldReportId,
            projectId: record.projectId,
            sourceType: String(params.sourceType),
            sourceLocator: params.sourceLocator,
            sourceText: params.quotedText,
            page: params.pageNumber,
            sheetName: params.sheetName,
            cellRange: params.cellRange,
            timestamp: params.timestamp,
            metadata: (params.metadata as any) || undefined,
          },
        });
      } catch {
        // Fallback to memory store
      }
    }

    return record;
  }

  /**
   * Retrieves evidence by event ID.
   */
  public async getEvidenceByEventId(eventId: string): Promise<EvidenceRecord | null> {
    const mem = EvidenceService.inMemoryEvidence.get(eventId);
    if (mem) return mem;

    if (PrismaService.isAvailable()) {
      try {
        const prisma = PrismaService.getInstance();
        const dbEvidence = await prisma.evidence.findUnique({ where: { eventId } });
        if (dbEvidence) {
          return {
            id: dbEvidence.id,
            projectId: dbEvidence.projectId || 'PROJ-OIL-2026-01',
            fieldReportId: dbEvidence.fieldReportId,
            eventId: dbEvidence.eventId,
            sourceType: dbEvidence.sourceType,
            sourceLocator: dbEvidence.sourceLocator,
            quotedText: dbEvidence.sourceText,
            pageNumber: dbEvidence.page,
            sheetName: dbEvidence.sheetName,
            cellRange: dbEvidence.cellRange,
            timestamp: dbEvidence.timestamp,
            metadata: dbEvidence.metadata as Record<string, unknown> | null,
            createdAt: dbEvidence.createdAt.toISOString(),
          };
        }
      } catch {
        // Fallback
      }
    }

    return null;
  }

  /**
   * Reconstructs the complete backward evidence chain for an activity progress update.
   */
  public async getEvidenceChain(params: {
    progressUpdateId?: string;
    matchId: string;
    eventId: string;
    fieldReportId: string;
  }): Promise<EvidenceChainDTO> {
    const evidence = await this.getEvidenceByEventId(params.eventId);

    return {
      progressUpdateId: params.progressUpdateId,
      matchId: params.matchId,
      eventId: params.eventId,
      fieldReportId: params.fieldReportId,
      sourceType: evidence?.sourceType || 'TEXT',
      sourceLocator: evidence?.sourceLocator || undefined,
      pageNumber: evidence?.pageNumber || undefined,
      sheetName: evidence?.sheetName || undefined,
      cellRange: evidence?.cellRange || undefined,
      quotedText: evidence?.quotedText || '',
      timestamp: evidence?.createdAt,
    };
  }
}
