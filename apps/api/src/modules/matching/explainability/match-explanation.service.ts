import { MatchDecision } from '@sitesync/types';
import { MatchCandidate, ConfidenceLevel, ExtractedEventResult } from '../matching.types';

export class MatchExplanationService {
  /**
   * Generates a deterministic explanation based on actual computed scores and match signals.
   */
  public generateExplanation(params: {
    decision: MatchDecision;
    confidence: number;
    confidenceLevel: ConfidenceLevel;
    candidateMargin: number;
    isAmbiguous: boolean;
    granularityMismatch: boolean;
    topCandidate?: MatchCandidate;
    event: ExtractedEventResult;
  }): string {
    const { decision, confidence, confidenceLevel, candidateMargin, isAmbiguous, granularityMismatch, topCandidate, event } = params;

    if (decision === MatchDecision.UNMATCHED || !topCandidate) {
      return `Classified as UNMATCHED. No schedule activity scored above the minimum matching threshold (70%). Extracted event "${event.description}" appears to describe un-budgeted or ad-hoc site operations.`;
    }

    const s = topCandidate.scores;
    const lines: string[] = [];

    if (decision === MatchDecision.AUTO_LINKED) {
      lines.push(`Auto-linked to activity [${topCandidate.activityCode}] "${topCandidate.activityName}" with High Confidence (${(confidence * 100).toFixed(0)}%):`);
    } else {
      lines.push(`Routed to Review Queue for human confirmation (Confidence: ${confidenceLevel}, Score: ${(confidence * 100).toFixed(0)}%):`);
    }

    // Component Score Breakdowns
    lines.push(`• Semantic Similarity: ${(s.semantic * 100).toFixed(0)}%`);
    lines.push(`• Discipline Alignment: ${(s.discipline * 100).toFixed(0)}% (${topCandidate.discipline})`);
    lines.push(`• Location Overlap: ${(s.location * 100).toFixed(0)}% (${topCandidate.location})`);
    lines.push(`• Entity Overlap: ${(s.entity * 100).toFixed(0)}%`);
    lines.push(`• WBS Compatibility: ${(s.wbs * 100).toFixed(0)}% (${topCandidate.wbsPath})`);
    lines.push(`• Temporal Window Alignment: ${(s.temporal * 100).toFixed(0)}%`);

    // Flag notes
    if (isAmbiguous) {
      lines.push(`⚠️ Ambiguity Warning: Close candidate margin of only ${(candidateMargin * 100).toFixed(1)}% between top candidates.`);
    }
    if (granularityMismatch) {
      lines.push(`⚠️ Granularity Alert: Field update mentions localized section/sub-scope that maps to broader activity package.`);
    }

    return lines.join('\n');
  }
}
