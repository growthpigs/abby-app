/**
 * Layout Constants
 *
 * SINGLE SOURCE OF TRUTH for UI layout values.
 * All screens should import from here instead of defining locally.
 */

/**
 * Bottom sheet snap points (percentage of screen height)
 * Used by: CoachIntroScreen, CoachScreen, useDraggableSheet
 */
export const SHEET_SNAP_POINTS = [0.35, 0.55, 0.75, 0.9] as const;

/**
 * Default snap point index (55% height - room for conversation)
 * Index into SHEET_SNAP_POINTS array
 */
export const SHEET_DEFAULT_SNAP_INDEX = 1;

/**
 * Default snap point value (for direct use)
 */
export const SHEET_DEFAULT_SNAP = SHEET_SNAP_POINTS[SHEET_DEFAULT_SNAP_INDEX];

/**
 * Animation durations (ms)
 */
export const ANIMATION_DURATIONS = {
  /** Fast micro-interactions */
  fast: 200,
  /** Standard transitions */
  normal: 300,
  /** Slow, organic transitions */
  slow: 800,
  /** Very slow morphing (shader transitions) */
  morph: 1200,
} as const;

/**
 * Demo typing simulation delays (ms)
 * Used by AbbyRealtimeService for simulated responses
 */
export const DEMO_TYPING_DELAYS = {
  /** Minimum delay before next character */
  min: 1500,
  /** Additional random delay (0 to this value) */
  variance: 1500,
} as const;

/**
 * Touch targets (min size for accessibility)
 */
export const TOUCH_TARGETS = {
  /** Minimum touch target size (44x44 recommended by Apple) */
  min: 44,
  /** Small buttons (like mute) */
  small: 28,
  /** Standard buttons */
  standard: 44,
  /** Large buttons */
  large: 56,
} as const;

/**
 * Modal/overlay z-index values
 */
export const Z_INDEX = {
  /** Background shader layer */
  background: 0,
  /** Main content */
  content: 10,
  /** Glass UI layer */
  glass: 20,
  /** Modals and overlays */
  modal: 100,
  /** Tooltips and dropdowns */
  tooltip: 1000,
  /** Dev/debug overlays */
  debug: 9999,
} as const;

/**
 * Border radius values
 */
export const BORDER_RADIUS = {
  /** Small (buttons, tags) */
  sm: 8,
  /** Medium (cards) */
  md: 16,
  /** Large (modals, sheets) */
  lg: 24,
  /** Full round (avatars, pills) */
  full: 9999,
} as const;
