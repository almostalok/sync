import { DOMAIN_ABBREVIATIONS, COMMON_ACRONYMS } from '../../../../../../data/synthetic/dictionaries/abbreviations';
import { DOMAIN_SYNONYMS } from '../../../../../../data/synthetic/dictionaries/synonyms';

export class TextNormalizerService {
  /**
   * Complete normalization pipeline converting noisy site updates into canonical semantic text.
   */
  public normalize(rawText: string, reportDateStr?: string): {
    normalizedText: string;
    extractedProgress?: number;
    extractedDate?: string;
  } {
    if (!rawText) {
      return { normalizedText: '' };
    }

    let text = rawText.toLowerCase();

    // 1. Normalize punctuation & spacing
    text = text.replace(/[\r\n\t]+/g, ' ');
    text = text.replace(/[^a-z0-9\s%.:\-\/]/g, ' ');
    text = text.replace(/\s+/g, ' ').trim();

    // 2. Extract and normalize percentages
    const { cleanText: textAfterProgress, progress } = this.extractProgress(text);
    text = textAfterProgress;

    // 3. Extract and normalize dates
    const { cleanText: textAfterDate, date } = this.extractDate(text, reportDateStr);
    text = textAfterDate;

    // 4. Expand domain abbreviations (COMP -> compressor, FDN -> foundation, etc.)
    for (const [canonicalTerm, abbreviations] of Object.entries(DOMAIN_ABBREVIATIONS)) {
      const cleanCanonical = canonicalTerm.replace(/_/g, ' ');
      for (const abbr of abbreviations) {
        const regex = new RegExp(`\\b${abbr.toLowerCase()}\\b`, 'g');
        text = text.replace(regex, cleanCanonical);
      }
    }

    // 5. Expand standalone acronyms (PCC, NDT, ESD, DCS, PTW)
    for (const [acronym, fullForm] of Object.entries(COMMON_ACRONYMS)) {
      const regex = new RegExp(`\\b${acronym.toLowerCase()}\\b`, 'g');
      text = text.replace(regex, fullForm.toLowerCase());
    }

    // 6. Map domain synonyms to standard concepts
    for (const [targetConcept, synonyms] of Object.entries(DOMAIN_SYNONYMS)) {
      const cleanTarget = targetConcept.replace(/_/g, ' ');
      for (const syn of synonyms) {
        const synRegex = new RegExp(`\\b${syn.toLowerCase()}\\b`, 'g');
        text = text.replace(synRegex, cleanTarget);
      }
    }

    // 7. Normalize units and dimension shorthand
    text = text.replace(/\b(cu\.?m|cum|m3|cubic meter[s]?)\b/g, 'm3');
    text = text.replace(/\b(sq\.?m|sqm|m2|square meter[s]?)\b/g, 'm2');
    text = text.replace(/\b(mtr|meter[s]?)\b/g, 'm');
    text = text.replace(/\b(in|inch[es]?|")\b/g, 'inch');

    // 8. Final whitespace collapse
    text = text.replace(/\s+/g, ' ').trim();

    return {
      normalizedText: text,
      extractedProgress: progress,
      extractedDate: date,
    };
  }

  private extractProgress(text: string): { cleanText: string; progress?: number } {
    // 1. Explicit percentages (e.g. 85%, 85 percent, approx 85%)
    const pctMatch = text.match(/(\d{1,3})\s*(%|percent)\b/i);
    if (pctMatch) {
      const val = parseInt(pctMatch[1], 10);
      if (val >= 0 && val <= 100) {
        return {
          cleanText: text.replace(pctMatch[0], `${val} percent`),
          progress: val / 100,
        };
      }
    }

    // 2. Qualitative completions
    if (/\b(completed in full|100% complete|fully completed|finished)\b/i.test(text)) {
      return { cleanText: text, progress: 1.0 };
    }
    if (/\b(not started|0% complete|pending start)\b/i.test(text)) {
      return { cleanText: text, progress: 0.0 };
    }

    return { cleanText: text };
  }

  private extractDate(text: string, reportDateStr?: string): { cleanText: string; date?: string } {
    const baseDate = reportDateStr ? new Date(reportDateStr) : new Date();

    if (/\btoday\b/i.test(text)) {
      return { cleanText: text, date: baseDate.toISOString() };
    }
    if (/\byesterday\b/i.test(text)) {
      const yesterday = new Date(baseDate);
      yesterday.setDate(yesterday.getDate() - 1);
      return { cleanText: text, date: yesterday.toISOString() };
    }

    // Date regex (YYYY-MM-DD or DD-MM-YYYY or DD/MM/YYYY)
    const dateMatch = text.match(/(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/);
    if (dateMatch) {
      const day = parseInt(dateMatch[1], 10);
      const month = parseInt(dateMatch[2], 10) - 1;
      const year = parseInt(dateMatch[3], 10);
      const d = new Date(Date.UTC(year, month, day));
      if (!isNaN(d.getTime())) {
        return { cleanText: text, date: d.toISOString() };
      }
    }

    return { cleanText: text, date: reportDateStr };
  }
}
