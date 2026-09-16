import { EvidenceType } from '@sitesync/types';

export interface CreateEvidenceParams {
  id?: string;
  projectId: string;
  fieldReportId: string;
  eventId: string;
  sourceType: EvidenceType | string;
  sourceLocator?: string;
  quotedText: string;
  pageNumber?: number;
  sheetName?: string;
  cellRange?: string;
  timestamp?: number;
  characterStart?: number;
  characterEnd?: number;
  metadata?: Record<string, unknown>;
}

export interface EvidenceRecord {
  id: string;
  projectId: string;
  fieldReportId: string;
  eventId: string;
  sourceType: string;
  sourceLocator?: string | null;
  quotedText: string;
  pageNumber?: number | null;
  sheetName?: string | null;
  cellRange?: string | null;
  timestamp?: number | null;
  characterStart?: number | null;
  characterEnd?: number | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}
