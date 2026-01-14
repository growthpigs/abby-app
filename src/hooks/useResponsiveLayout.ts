/**
 * useResponsiveLayout - Responsive sizing for different iPhone sizes
 *
 * iPhone 16 (smaller): ~844pt height
 * iPhone 16 Pro Max: ~932pt height
 *
 * Provides dynamic spacing, font sizes, and button heights
 * that adapt to smaller screens.
 */

import { useWindowDimensions } from 'react-native';
import { useMemo } from 'react';

// Screen height breakpoints
const SMALL_SCREEN_HEIGHT = 750;  // iPhone SE, iPhone 16 (smaller)
const MEDIUM_SCREEN_HEIGHT = 850; // iPhone 16 Pro

export interface ResponsiveLayout {
  isSmallScreen: boolean;
  isMediumScreen: boolean;

  // Spacing
  paddingTop: number;
  paddingBottom: number;
  paddingHorizontal: number;
  sectionGap: number;

  // Button sizes
  buttonHeight: number;
  buttonHeightLarge: number;
  buttonMargin: number;
  buttonRadius: number;

  // Typography scale
  headlineFontSize: number;
  titleFontSize: number;
  bodyFontSize: number;
  captionFontSize: number;

  // Input sizes
  inputHeight: number;
}

export function useResponsiveLayout(): ResponsiveLayout {
  const { height } = useWindowDimensions();

  return useMemo(() => {
    const isSmallScreen = height < SMALL_SCREEN_HEIGHT;
    const isMediumScreen = height >= SMALL_SCREEN_HEIGHT && height < MEDIUM_SCREEN_HEIGHT;

    return {
      isSmallScreen,
      isMediumScreen,

      // Spacing - reduced for small screens
      paddingTop: isSmallScreen ? 40 : isMediumScreen ? 60 : 80,
      paddingBottom: isSmallScreen ? 24 : 32,
      paddingHorizontal: isSmallScreen ? 20 : 24,
      sectionGap: isSmallScreen ? 12 : isMediumScreen ? 16 : 20,

      // Button sizes - smaller on small screens
      buttonHeight: isSmallScreen ? 44 : 52,
      buttonHeightLarge: isSmallScreen ? 48 : 56,
      buttonMargin: isSmallScreen ? 8 : 12,
      buttonRadius: isSmallScreen ? 22 : 26,

      // Typography - slightly smaller on small screens
      headlineFontSize: isSmallScreen ? 28 : 36,
      titleFontSize: isSmallScreen ? 20 : 24,
      bodyFontSize: isSmallScreen ? 14 : 16,
      captionFontSize: isSmallScreen ? 11 : 12,

      // Input sizes
      inputHeight: isSmallScreen ? 48 : 56,
    };
  }, [height]);
}

export default useResponsiveLayout;
