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
 * Glass Sandwich Architecture - Z-Index Layers
 * CRITICAL: These values enforce the visual hierarchy. Do NOT reorder.
 *
 * Layer Stack (bottom to top):
 * L0: VibeMatrix - Animated shader background (always alive)
 * L0.5: GlassFloor - Frosted glass base (auth screens only)
 * L1: AbbyOrb - Reactive 3D orb (center ↔ docked transitions)
 * L2: GlassInterface - All UI content on glass (cards, text, buttons)
 * L3: Modals/Overlays - Temporary UI (payments, errors)
 * L4: Debug - Development tools
 */
export const Z_INDEX = {
  /** Layer 0: VibeMatrix shader background (always renders) */
  VIBE_MATRIX: 0,
  /** Layer 0.5: GlassFloor (auth/onboarding screens) */
  GLASS_FLOOR: 5,
  /** Layer 1: AbbyOrb (center ↔ docked modes) */
  ABBY_ORB: 10,
  /** Layer 2: GlassInterface - All UI content */
  GLASS_INTERFACE: 20,
  /** Layer 3: Modals and overlays (payments, errors) */
  MODAL: 100,
  /** Layer 3.5: Tooltips and dropdowns */
  TOOLTIP: 500,
  /** Layer 4: Dev/debug overlays (always on top) */
  DEBUG: 9999,
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
