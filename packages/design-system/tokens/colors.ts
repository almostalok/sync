/**
 * SiteSync Design System — Color Tokens
 *
 * Technical Brutalism + Minimalism:
 * High-contrast architectural drafting palette. Stark paper white, raw technical canvas,
 * pitch carbon black, and industrial indicator colors. Zero soft glow, zero pastel gradients.
 */

export const colors = {
  // Primary: Pitch Carbon Black / Industrial Blueprint
  primary: {
    DEFAULT: '#0f172a',
    dark: '#000000',
    navy: '#0f172a',
    light: '#1e293b',
    hover: '#000000',
    subtle: '#f1f5f9',
  },

  // Secondary: Raw Steel / Cement
  secondary: {
    DEFAULT: '#334155',
    dark: '#1e293b',
    light: '#64748b',
    lighter: '#94a3b8',
    subtle: '#f8fafc',
  },

  // Surfaces & Backgrounds (Architectural raw canvas & stark white panels)
  surface: {
    DEFAULT: '#ffffff',
    subtle: '#f8f8f6',
    muted: '#f1f5f9',
    sunken: '#e2e8f0',
    sidebar: '#0a0f1d',
    sidebarHover: '#141c2e',
    sidebarActive: '#000000',
  },

  // Hard Brutalist Borders & Dividers
  border: {
    DEFAULT: '#0f172a', // Solid dark carbon border
    strong: '#000000',  // Pure black
    subtle: '#cbd5e1',  // Secondary division
    navy: '#0f172a',
  },

  // Text & Typography
  text: {
    primary: '#000000',      // Pure black text for maximum high contrast
    secondary: '#334155',    // Deep slate
    muted: '#64748b',        // Technical metadata
    light: '#94a3b8',
    inverse: '#ffffff',
    inverseMuted: '#cbd5e1',
  },

  // Semantic Industrial Operational Status (High-contrast, bold indicators)
  status: {
    // Verified / Completed / Healthy
    verified: {
      text: '#14532d',
      bg: '#f0fdf4',
      border: '#15803d',
      badge: '#16a34a',
    },
    // Attention / Warning / Review Required
    warning: {
      text: '#78350f',
      bg: '#fffbeb',
      border: '#d97706',
      badge: '#f59e0b',
    },
    // Critical / Blocked / Delayed / Failed
    critical: {
      text: '#7f1d1d',
      bg: '#fef2f2',
      border: '#b91c1c',
      badge: '#dc2626',
    },
    // Information / Selected / Active / In-Progress
    info: {
      text: '#1e3a8a',
      bg: '#eff6ff',
      border: '#1d4ed8',
      badge: '#2563eb',
    },
    // Inactive / Historical / Neutral
    neutral: {
      text: '#334155',
      bg: '#f8fafc',
      border: '#64748b',
      badge: '#64748b',
    },
  },

  // Gantt & Project Controls Visuals
  controls: {
    plannedBar: '#cbd5e1',
    actualBar: '#0f172a',
    criticalBar: '#b91c1c',
    completedBar: '#15803d',
    delayedBar: '#c2410c',
    gridLine: '#e2e8f0',
    todayLine: '#000000',
  }
} as const;

export type ColorTokens = typeof colors;
