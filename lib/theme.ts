/**
 * Brand colours as hex, for the places a colour cannot be a class name:
 * native tab bar tints, status bar, map markers, icon props.
 *
 * These mirror the oklch tokens in global.css. React Native cannot parse
 * `oklch(...)`, so anything handed to a native prop reads from here instead of
 * `useThemeColor`.
 */
export const BRAND = {
  /** Primary: warm apricot-coral. Passes AA with white labels on top. */
  accent: '#c34b2e',
  /** Soft apricot wash, for tints and bubbles. */
  accentSoft: '#fbe4d6',
  /** Deep plum ink used for text. */
  ink: '#2f1d2d',
  /** Secondary text. */
  muted: '#857682',
  /** Warm cream page background. */
  paper: '#fffcf5',
  /** Hairline borders on cream. */
  border: '#eae0d4',
  /** Teal secondary. */
  teal: '#228b91',
  /** Playful third colour. */
  lilac: '#9b7fc4',
  /** Warm amber highlight. */
  sun: '#e0a12b',
  /** Positive/verified green, warm-leaning so it sits with the apricot. */
  success: '#2f8f63',
} as const;

/** Bubble decoration tints, matching --color-bubble-* in global.css. */
export const BUBBLE_TINTS = {
  apricot: '#fbe1cd',
  teal: '#d7ecec',
  lilac: '#e9e0f2',
} as const;
