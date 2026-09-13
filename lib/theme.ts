/**
 * Brand colours as hex, for the places a colour cannot be a class name:
 * native tab bar tints, status bar, map markers, icon props.
 *
 * These mirror the oklch tokens in global.css. React Native cannot parse
 * `oklch(...)`, so anything handed to a native prop reads from here instead of
 * `useThemeColor`.
 */
export const BRAND = {
  /** Primary coral. Dark labels are used on top for accessible contrast. */
  accent: '#FF827D',
  /** Soft coral wash, for tints and bubbles. */
  accentSoft: '#FFE5E2',
  /** Deep violet-black used for text. */
  ink: '#332D3E',
  /** Secondary text. */
  muted: '#756F7D',
  /** Warm blush page background. */
  paper: '#FBF7F4',
  /** Hairline borders on the warm background. */
  border: '#E7DFE4',
  /** Requested soft green. */
  teal: '#A8D8D5',
  /** Requested violet. */
  lilac: '#B7AEEB',
  /** Warm highlight derived from coral. */
  sun: '#FFB0A8',
  /** Positive/verified green. */
  success: '#5E918E',
} as const;

/** Bubble decoration tints, matching --color-bubble-* in global.css. */
export const BUBBLE_TINTS = {
  apricot: '#FFE5E2',
  teal: '#DDEDEB',
  lilac: '#E9E5FA',
} as const;
