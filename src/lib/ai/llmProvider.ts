import { normalizeFieldText } from './normalizer';
import { ExtractedEvent, FieldReport } from '@/types/domain';

export interface LLMExtractionRequest {
  rawText: string;
  reportDate: string;
  fileName: string;
  disciplineHint?: string;
}

export interface LLMExtractionResponse {
  events: {
    description: string;
    progress?: number;
    status: string;
    location?: string;
    discipline?: string;
    entities: string[];
    confidence: number;
    rawExcerpt: string;
  }[];
  modelUsed: string;
  isFallback: boolean;
}

export interface LLMProvider {
  name: string;
  extractEvents(request: LLMExtractionRequest): Promise<LLMExtractionResponse>;
  generateExplanation(signals: Record<string, number>, activityName: string): Promise<string>;
}

// 1. Deterministic Heuristic Fallback Provider (Default - No API Keys Required)
export class DeterministicFallbackProvider implements LLMProvider {
  name = 'Deterministic Heuristic / NLP Extractor';

  async extractEvents(request: LLMExtractionRequest): Promise<LLMExtractionResponse> {
    const rawSegments = request.rawText
      .split(/(?<=[.!?\n;])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 5);

    const events: LLMExtractionResponse['events'] = [];

    for (const segment of rawSegments) {
      const norm = normalizeFieldText(segment);
      if (!norm.detectedDiscipline && norm.extractedProgress === undefined && norm.extractedStatus === 'UNKNOWN') {
        if (!/foundation|excavation|concrete|pipe|weld|cable|valve|pump|skid|panel|tray|earthwork/i.test(segment)) {
          continue;
        }
      }

      events.push({
        description: norm.normalized.slice(0, 60).replace(/\b\w/g, l => l.toUpperCase()),
        progress: norm.extractedProgress,
        status: norm.extractedStatus,
        location: norm.detectedLocation,
        discipline: norm.detectedDiscipline,
        entities: norm.tokens.slice(0, 5),
        confidence: 0.92,
        rawExcerpt: segment,
      });
    }

    if (events.length === 0 && request.rawText.trim().length > 0) {
      const norm = normalizeFieldText(request.rawText);
      events.push({
        description: norm.normalized.slice(0, 60).replace(/\b\w/g, l => l.toUpperCase()),
        progress: norm.extractedProgress,
        status: norm.extractedStatus,
        location: norm.detectedLocation,
        discipline: norm.detectedDiscipline,
        entities: norm.tokens.slice(0, 5),
        confidence: 0.85,
        rawExcerpt: request.rawText.trim(),
      });
    }

    return {
      events,
      modelUsed: 'heuristic-nlp-engine-v1',
      isFallback: true,
    };
  }

  async generateExplanation(signals: Record<string, number>, activityName: string): Promise<string> {
    const reasons: string[] = [];
    if (signals.semanticScore > 0.8) reasons.push('High semantic similarity');
    if (signals.disciplineScore === 1.0) reasons.push('Matching discipline');
    if (signals.locationScore > 0.8) reasons.push('Spatial location compatibility');
    if (signals.temporalScore > 0.8) reasons.push('Temporal schedule window overlap');
    if (signals.dependencyScore > 0.8) reasons.push('Compatible predecessor states');

    return `Matched ${activityName} based on: ${reasons.join(' + ')}.`;
  }
}

// Factory to resolve active LLM provider based on environment
export function getActiveLLMProvider(): LLMProvider {
  const providerType = process.env.LLM_PROVIDER || 'fallback';
  // External providers (OpenAI, Anthropic, Gemini, Ollama) can plug in here seamlessly.
  // By default, fallback provider guarantees 100% offline availability for hackathons and air-gapped systems.
  return new DeterministicFallbackProvider();
}
