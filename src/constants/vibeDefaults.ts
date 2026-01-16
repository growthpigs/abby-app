/**
 * Default Vibe Configuration
 *
 * CRITICAL: Single source of truth for initial vibe state.
 * Both useVibeController store and VibeMatrixAnimated MUST use these values.
 *
 * Changing these will change the app's startup appearance.
 * LOGIN/SIGNIN screens expect DEEP (purple) background.
 */

import { VibeColorTheme, VibeComplexity } from '../types/vibe';

export const DEFAULT_VIBE = {
  theme: 'DEEP' as VibeColorTheme,
  complexity: 'SMOOTHIE' as VibeComplexity,
} as const;
