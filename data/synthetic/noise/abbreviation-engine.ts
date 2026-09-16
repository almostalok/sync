import { PRNG } from './prng';
import { DOMAIN_ABBREVIATIONS } from '../dictionaries/abbreviations';

export class AbbreviationEngine {
  constructor(private prng: PRNG) {}

  /**
   * Replaces domain terminology with realistic site abbreviations.
   */
  public applyAbbreviations(text: string, probability: number = 0.5): string {
    let result = text;

    for (const [term, abbreviations] of Object.entries(DOMAIN_ABBREVIATIONS)) {
      const cleanTerm = term.replace(/_/g, ' ');
      const regex = new RegExp(`\\b${cleanTerm}\\b`, 'gi');

      if (regex.test(result) && this.prng.chance(probability)) {
        const abbr = this.prng.pick(abbreviations);
        // Match case format
        result = result.replace(regex, abbr);
      }
    }

    return result;
  }
}
