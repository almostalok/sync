/**
 * Prompt safety and sanitization module.
 * Protects extraction pipeline from adversarial prompt injections in field reports.
 */
export class PromptSafetyGuard {
  private static INJECTION_PATTERNS = [
    /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
    /system\s*prompt\s*:/i,
    /you\s+are\s+now\s+a\s+/i,
    /forget\s+(all\s+)?previous/i,
    /override\s+(all\s+)?rules/i,
    /delete\s+from\s+/i,
    /drop\s+table\s+/i,
  ];

  /**
   * Sanitizes input text and neutralizes prompt injection attempts.
   */
  public static sanitizeReportText(rawText: string): { sanitizedText: string; hadInjectionAttempt: boolean } {
    let hadInjectionAttempt = false;
    let sanitizedText = rawText;

    for (const pattern of this.INJECTION_PATTERNS) {
      if (pattern.test(sanitizedText)) {
        hadInjectionAttempt = true;
        sanitizedText = sanitizedText.replace(pattern, '[REDACTED_SYSTEM_DIRECTIVE]');
      }
    }

    return { sanitizedText, hadInjectionAttempt };
  }
}
