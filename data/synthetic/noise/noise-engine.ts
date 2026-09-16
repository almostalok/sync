import { PRNG } from './prng';
import { TypoEngine } from './typo-engine';
import { AbbreviationEngine } from './abbreviation-engine';
import { ParaphraseEngine } from './paraphrase-engine';
import { DifficultyLevel } from '../types';

export class NoiseEngine {
  private typoEngine: TypoEngine;
  private abbrEngine: AbbreviationEngine;
  private paraphraseEngine: ParaphraseEngine;

  constructor(private prng: PRNG) {
    this.typoEngine = new TypoEngine(prng);
    this.abbrEngine = new AbbreviationEngine(prng);
    this.paraphraseEngine = new ParaphraseEngine(prng);
  }

  /**
   * Generates a field report update string tailored to the target difficulty level.
   */
  public generateEventText(params: {
    action: string;
    objectName: string;
    location: string;
    progress: number;
    equipmentTag?: string;
    activityCode?: string;
    subScope?: string;
    difficultyLevel: DifficultyLevel;
  }): { rawText: string; normalizedText: string } {
    const { action, objectName, location, progress, equipmentTag, activityCode, subScope, difficultyLevel } = params;
    const pct = Math.round(progress * 100);

    // Baseline normalized sentence
    const baseObj = subScope ? `${subScope} of ${objectName}` : objectName;
    const eq = equipmentTag ? ` (${equipmentTag})` : '';
    const normalizedText = `${action} for ${baseObj}${eq} at ${location} is ${pct}% complete.`;

    let rawText = '';

    switch (difficultyLevel) {
      case DifficultyLevel.EXACT: {
        // Level 1: Clean, standard structured DPR format with exact activity reference
        const codePrefix = activityCode ? `[${activityCode}] ` : '';
        rawText = `${codePrefix}${action} for ${objectName}${eq} at ${location} - ${pct}% complete.`;
        break;
      }

      case DifficultyLevel.MINOR_VARIATION: {
        // Level 2: Minor wording / casing variations
        rawText = `${action.toLowerCase()} of ${objectName}${eq} in ${location} is approx ${pct}% done.`;
        if (this.prng.chance(0.3)) {
          rawText = rawText.toUpperCase();
        }
        break;
      }

      case DifficultyLevel.PARAPHRASE: {
        // Level 3: Rephrased natural language sentence
        rawText = this.paraphraseEngine.paraphrase(action, objectName, location, progress, equipmentTag);
        break;
      }

      case DifficultyLevel.NOISY: {
        // Level 4: Heavy typos, abbreviations, erratic spacing, site shorthand
        const paraphrased = this.paraphraseEngine.paraphrase(action, objectName, location, progress, equipmentTag);
        const abbreviated = this.abbrEngine.applyAbbreviations(paraphrased, 0.75);
        const withTypos = this.typoEngine.applyTypos(abbreviated, 0.25);
        rawText = withTypos;
        break;
      }

      case DifficultyLevel.AMBIGUOUS: {
        // Level 5: Intentionally ambiguous - omits specific equipment tag or sub-location (e.g. "Compressor foundation concrete poured")
        rawText = `${action} for foundation ${location} executed today, progress approx ${pct}%.`;
        if (this.prng.chance(0.4)) {
          rawText = this.abbrEngine.applyAbbreviations(rawText, 0.5);
        }
        break;
      }

      case DifficultyLevel.GRANULARITY_MISMATCH: {
        // Level 6: Granularity mismatch - references specific sub-scope (North section, Tier 2, Bay 4)
        const scope = subScope || this.prng.pick(['North Section', 'South Bay', 'Block A', 'Tier 2 Corridor', 'East Grid']);
        rawText = `${scope}: ${action} for ${objectName}${eq} progressed to ${pct}% completion.`;
        if (this.prng.chance(0.3)) {
          rawText = this.abbrEngine.applyAbbreviations(rawText, 0.4);
        }
        break;
      }

      case DifficultyLevel.UNMATCHED: {
        // Level 7: Out-of-scope / ad-hoc site updates not in formal schedule
        const unmatchedActions = [
          'Temporary rainwater dewatering pump maintenance',
          'Access road grading & aggregate spreading',
          'Emergency housekeeping and scrap metal removal',
          'Temporary fencing reinforcement near boundary gate',
          'Toolbox safety meeting & fire extinguisher inspection',
          'Unscheduled diesel generator radiator maintenance',
        ];
        rawText = `${this.prng.pick(unmatchedActions)} at ${location} completed.`;
        break;
      }
    }

    return { rawText, normalizedText };
  }
}
