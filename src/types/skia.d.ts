/**
 * Type augmentation for @shopify/react-native-skia
 *
 * The Canvas component's `mode` prop exists in Skia 2.4.7 but is not
 * included in the published TypeScript definitions.
 *
 * Reference: Animation fix for GitHub Issue #2640
 * - mode="default": Standard rendering (on-demand)
 * - mode="continuous": Forces 60fps render loop (required for useClock animation)
 */

import '@shopify/react-native-skia';

declare module '@shopify/react-native-skia' {
  interface CanvasProps {
    /**
     * Canvas rendering mode
     * - 'default': Renders on-demand when content changes
     * - 'continuous': Forces continuous 60fps render loop (required for useClock)
     */
    mode?: 'default' | 'continuous';
  }
}
