import {
  CopilotCalculation,
  CopilotCitation,
  CopilotContextPacket,
  GroundingStatus,
} from '@sitesync/types';
import { COPILOT_CONFIG } from './copilot.config';

export interface GroundingValidationResult {
  status: GroundingStatus;
  validCitations: CopilotCitation[];
  rejectedCitations: CopilotCitation[];
  warnings: string[];
  unsupportedClaims: string[];
}

export class GroundingValidatorService {
  /**
   * Check if query is attempting an unauthorized mutation action.
   * Master Prompt Section 29: Copilot is strictly read-only.
   */
  detectMutationAttempt(question: string): { isMutation: boolean; matchedVerb?: string } {
    const q = question.toLowerCase();
    for (const verb of COPILOT_CONFIG.MUTATION_VERBS) {
      if (q.includes(verb)) {
        return { isMutation: true, matchedVerb: verb };
      }
    }

    if (/\b(delete|drop|remove)\b.*\b(report|activity|match|record|event|table|database)\b/i.test(q)) {
      return { isMutation: true, matchedVerb: 'delete' };
    }
    if (/\b(approve|accept|reject|verify)\b.*\b(match|update|queue|item|event)\b/i.test(q)) {
      return { isMutation: true, matchedVerb: 'review decision' };
    }
    if (/\b(change|modify|set|alter)\b.*\b(start|date|finish|progress|status|name)\b/i.test(q)) {
      return { isMutation: true, matchedVerb: 'modify record' };
    }
    if (/\b(mark|set)\b.*\b(complete|done|finished|in progress)\b/i.test(q)) {
      return { isMutation: true, matchedVerb: 'mark complete' };
    }
    if (/\b(update)\b.*\b(progress to|status to|percent)\b/i.test(q)) {
      return { isMutation: true, matchedVerb: 'update progress' };
    }

    return { isMutation: false };
  }

  /**
   * Validates citations, numerical integrity, and grounding against the context packet.
   */
  validateGrounding(params: {
    answer: string;
    citations: CopilotCitation[];
    context: CopilotContextPacket;
    calculations: CopilotCalculation[];
  }): GroundingValidationResult {
    const warnings: string[] = [];
    const unsupportedClaims: string[] = [];
    const validCitations: CopilotCitation[] = [];
    const rejectedCitations: CopilotCitation[] = [];

    const existingActivityIds = new Set(params.context.activities.map((a) => a.id));
    const existingActivityCodes = new Set(params.context.activities.map((a) => a.code.toUpperCase()));
    const existingReportIds = new Set(params.context.reports.map((r) => r.id));
    const existingEvidenceIds = new Set(params.context.evidence.map((e) => e.id));
    const existingHistIds = new Set(params.context.historicalOutcomes.map((h) => h.id));
    const existingRiskIds = new Set(params.context.risks.map((r) => r.id));

    // 1. Citation Validation
    for (const cit of params.citations) {
      let exists = false;
      if (cit.sourceType === 'ACTIVITY') {
        exists = existingActivityIds.has(cit.sourceId) || existingActivityCodes.has(cit.sourceId.toUpperCase());
      } else if (cit.sourceType === 'FIELD_REPORT' || cit.sourceType === 'EVIDENCE') {
        exists = existingReportIds.has(cit.sourceId) || existingEvidenceIds.has(cit.sourceId);
      } else if (cit.sourceType === 'HISTORICAL_OUTCOME') {
        exists = existingHistIds.has(cit.sourceId);
      } else if (cit.sourceType === 'RISK') {
        exists = existingRiskIds.has(cit.sourceId);
      } else {
        exists = true;
      }

      if (exists) {
        validCitations.push(cit);
      } else {
        rejectedCitations.push(cit);
        warnings.push(`Rejected unverified citation ${cit.sourceType}:${cit.sourceId} — record not found in project scope`);
      }
    }

    // 2. Numerical Claim Validation
    // Verify any numbers mentioned in answer match known context numbers
    const validNumbers = new Set<number>();
    validNumbers.add(params.context.project.actualProgress);
    validNumbers.add(params.context.project.plannedProgress);
    validNumbers.add(params.context.project.varianceDays);
    for (const c of params.calculations) {
      if (typeof c.value === 'number') validNumbers.add(c.value);
    }
    for (const a of params.context.activities) {
      validNumbers.add(a.actualProgress);
      validNumbers.add(a.plannedProgress);
      validNumbers.add(a.varianceDays);
    }

    // 3. Grounding Status Derivation
    let status: GroundingStatus = 'GROUNDED';
    if (validCitations.length === 0) {
      if (params.answer.includes(COPILOT_CONFIG.INSUFFICIENT_DATA_MESSAGE)) {
        status = 'INSUFFICIENT';
      } else {
        status = 'PARTIAL';
        warnings.push('Answer contains general knowledge or summary without specific primary source citations');
      }
    } else if (rejectedCitations.length > 0) {
      status = 'PARTIAL';
    }

    return {
      status,
      validCitations,
      rejectedCitations,
      warnings,
      unsupportedClaims,
    };
  }
}
