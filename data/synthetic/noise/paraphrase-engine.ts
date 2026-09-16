import { PRNG } from './prng';
import { DOMAIN_SYNONYMS } from '../dictionaries/synonyms';

export class ParaphraseEngine {
  constructor(private prng: PRNG) {}

  /**
   * Generates natural language variations for activity descriptions and progress phrasing.
   */
  public paraphrase(
    action: string,
    objectName: string,
    location: string,
    progressPct: number,
    equipmentTag?: string
  ): string {
    const progressPhrases = this.getProgressPhrases(progressPct);
    const progressText = this.prng.pick(progressPhrases);
    const locationText = this.getLocationPhrases(location);
    const eqText = equipmentTag ? ` (${equipmentTag})` : '';

    const templates = [
      `${action} for ${objectName}${eqText} ${locationText} is ${progressText}.`,
      `${objectName}${eqText} ${action.toLowerCase()} work progressing, currently ${progressText} at ${location}.`,
      `Executed ${action.toLowerCase()} on ${objectName}${eqText}. Progress reached ${progressText}.`,
      `${location}: ${objectName}${eqText} ${action.toLowerCase()} reached ${progressText} completion today.`,
      `Continuing ${action.toLowerCase()} of ${objectName}${eqText}; overall status is ${progressText}.`,
      `${action} - ${objectName}${eqText} [${location}] ~ ${progressText}.`,
    ];

    let sentence = this.prng.pick(templates);

    // Apply domain synonym replacements
    for (const [key, synonyms] of Object.entries(DOMAIN_SYNONYMS)) {
      const regex = new RegExp(`\\b${key}\\b`, 'gi');
      if (regex.test(sentence) && this.prng.chance(0.4)) {
        const replacement = this.prng.pick(synonyms);
        sentence = sentence.replace(regex, replacement);
      }
    }

    return sentence;
  }

  private getProgressPhrases(pct: number): string[] {
    const formatted = Math.round(pct * 100);
    if (formatted === 100) {
      return ['100% complete', 'completed in full', '100% done', 'finished', 'fully completed'];
    }
    if (formatted === 0) {
      return ['not started', '0%', 'just mobilized', 'pending commencement'];
    }

    return [
      `${formatted}%`,
      `${formatted}% complete`,
      `approx ${formatted}%`,
      `around ${formatted} percent`,
      `${formatted}% achieved`,
      `approx. ${formatted}% done`,
      `progressed to ${formatted}%`,
    ];
  }

  private getLocationPhrases(loc: string): string {
    const variants = [`at ${loc}`, `in the ${loc}`, `at ${loc} sector`, `within ${loc}`];
    return this.prng.pick(variants);
  }
}
