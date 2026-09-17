/**
 * SiteSync Design System — Radius Tokens
 *
 * Technical Brutalism + Minimalism:
 * Strictly 0px radius across all components. Sharp, razor-cut architectural geometry.
 * No rounded cards, no pills, no bubble containers.
 */

export const radius = {
  none: '0px',
  sm: '0px',
  md: '0px',
  lg: '0px',
  xl: '0px',
} as const;

export type RadiusTokens = typeof radius;
