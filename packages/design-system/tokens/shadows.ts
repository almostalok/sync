/**
 * SiteSync Design System — Shadow Tokens
 *
 * Technical Brutalism:
 * Hard solid-offset shadows with zero blur. Tactile, architectural, physical feel.
 */

export const shadows = {
  none: 'none',
  sm: '1px 1px 0px 0px #0f172a',
  DEFAULT: '2px 2px 0px 0px #0f172a',
  md: '3px 3px 0px 0px #0f172a',
  lg: '4px 4px 0px 0px #0f172a',
  xl: '6px 6px 0px 0px #0f172a',
} as const;

export type ShadowTokens = typeof shadows;
