/**
 * SiteSync Design System — Typography Tokens
 *
 * Technical Brutalism + Minimalism:
 * Monospaced figures, high-density technical labels, tabular numbers, uppercase tracking.
 */

export const typography = {
  fontFamily: {
    sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", "Helvetica Neue", Arial, sans-serif',
    mono: 'ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },

  fontSize: {
    xs: ['0.6875rem', { lineHeight: '0.875rem', letterSpacing: '0.05em' }],     // 11px - metadata, timestamps, tags
    sm: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025em' }],           // 12px - table cells, tags, captions
    base: ['0.8125rem', { lineHeight: '1.25rem' }],                              // 13px - standard operational body
    md: ['0.875rem', { lineHeight: '1.25rem' }],                                 // 14px - prominent text, table headers
    lg: ['1rem', { lineHeight: '1.5rem', letterSpacing: '-0.01em' }],            // 16px - section headings
    xl: ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.02em' }],       // 18px - card titles, drawer headers
    '2xl': ['1.375rem', { lineHeight: '1.75rem', letterSpacing: '-0.03em' }],    // 22px - page headers
    '3xl': ['1.75rem', { lineHeight: '2rem', letterSpacing: '-0.03em' }],        // 28px - major KPI metrics
  },

  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    black: '900',
  },
} as const;

export type TypographyTokens = typeof typography;
