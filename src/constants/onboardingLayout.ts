/**
 * Onboarding Layout Constants
 *
 * DESIGN SYSTEM ENFORCEMENT
 * See: docs/DESIGN-SYSTEM.md for full specification
 *
 * MANDATORY: Every screen MUST use these exact values.
 * DO NOT create custom values per screen.
 */

import { StyleSheet } from 'react-native';

/**
 * FIXED LAYOUT POSITIONS
 * These values are ABSOLUTE and NEVER change between screens
 */
export const LAYOUT = {
  // Back Arrow - ALWAYS same position
  // Arrow tip aligns flush with content text (both at left: 24)
  backArrow: {
    top: 60,
    left: 24,
    size: 42, // 50% larger than original 28
    touchTarget: 44,
    hitSlop: 20,
  },

  // Section Label (e.g., "LIFESTYLE") - when present
  sectionLabel: {
    top: 110,
    marginBottom: 12,
  },

  // Headline
  headline: {
    top: 140, // Without section label
    topWithSection: 170, // With section label
    marginBottom: 24,
  },

  // Content area
  content: {
    paddingTop: 140,
    paddingTopWithSection: 170,
    paddingHorizontal: 24,
    paddingBottom: 120,
  },

  // Footer (Continue button)
  footer: {
    bottom: 48,
    paddingHorizontal: 24,
  },

  // Spacing scale
  spacing: {
    micro: 4,
    small: 8,
    medium: 12,
    default: 16,
    large: 24,
    xl: 32,
    xxl: 48,
  },
} as const;

/**
 * TYPOGRAPHY SPECS
 * Font families, sizes, and colors
 */
export const TYPOGRAPHY = {
  // Section Label - JetBrains Mono, WHITE, UPPERCASE
  sectionLabel: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 12,
    letterSpacing: 1,
    color: '#FFFFFF',
  },

  // Headline - Merriweather Bold
  headline: {
    fontFamily: 'Merriweather_700Bold',
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.5,
    color: 'rgba(255, 255, 255, 0.95)',
  },

  // Body - Merriweather Regular
  body: {
    fontFamily: 'Merriweather_400Regular',
    fontSize: 15,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: 'rgba(255, 255, 255, 0.85)',
  },

  // Answer Option - Barlow Medium
  answerOption: {
    fontFamily: 'Barlow_500Medium',
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.95)',
  },

  // Button Text - Barlow SemiBold
  button: {
    fontFamily: 'Barlow_600SemiBold',
    fontSize: 18,
    letterSpacing: 0.5,
    color: '#FFFFFF',
  },

  // Input Text
  input: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.95)',
  },

  // Help Text / Caption
  helpText: {
    fontSize: 12,
    lineHeight: 18,
    color: 'rgba(255, 255, 255, 0.6)',
  },

  // Input Label
  inputLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
} as const;

/**
 * COLORS
 */
export const COLORS = {
  // White scale (for dark backgrounds)
  white: {
    full: '#FFFFFF',
    95: 'rgba(255, 255, 255, 0.95)',
    85: 'rgba(255, 255, 255, 0.85)',
    70: 'rgba(255, 255, 255, 0.70)',
    50: 'rgba(255, 255, 255, 0.50)',
    30: 'rgba(255, 255, 255, 0.30)',
    10: 'rgba(255, 255, 255, 0.10)',
  },

  // Charcoal (for light/glass backgrounds)
  charcoal: {
    dark: '#3A3A3A',
    medium: '#5A5A5A',
    light: '#7A7A7A',
  },

  // Accent
  blue: {
    primary: '#3B82F6',
    selected: 'rgba(59, 130, 246, 0.2)',
  },

  green: {
    primary: '#10B981',
    background: 'rgba(16, 185, 129, 0.15)',
  },

  red: {
    primary: '#DC2626',
    background: 'rgba(220, 38, 38, 0.08)',
  },
} as const;

/**
 * SHARED STYLES
 * Import these directly into your screens
 */
export const sharedStyles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
  },

  // Back Arrow Button - FIXED POSITION
  // Arrow tip flush with content text left edge
  backButton: {
    position: 'absolute',
    top: LAYOUT.backArrow.top,
    left: LAYOUT.backArrow.left,
    width: LAYOUT.backArrow.touchTarget,
    height: LAYOUT.backArrow.touchTarget,
    alignItems: 'flex-start', // Tip aligns with left edge
    justifyContent: 'center',
    zIndex: 10,
  },

  // Section Label - JetBrains Mono WHITE UPPERCASE
  sectionLabel: {
    fontFamily: TYPOGRAPHY.sectionLabel.fontFamily,
    fontSize: TYPOGRAPHY.sectionLabel.fontSize,
    letterSpacing: TYPOGRAPHY.sectionLabel.letterSpacing,
    color: TYPOGRAPHY.sectionLabel.color,
    textTransform: 'uppercase',
    marginBottom: LAYOUT.sectionLabel.marginBottom,
  },

  // Headline - Merriweather Bold
  headline: {
    fontFamily: TYPOGRAPHY.headline.fontFamily,
    fontSize: TYPOGRAPHY.headline.fontSize,
    lineHeight: TYPOGRAPHY.headline.lineHeight,
    letterSpacing: TYPOGRAPHY.headline.letterSpacing,
    color: TYPOGRAPHY.headline.color,
    marginBottom: LAYOUT.headline.marginBottom,
  },

  // Content (without section label)
  content: {
    flex: 1,
    paddingTop: LAYOUT.content.paddingTop,
    paddingHorizontal: LAYOUT.content.paddingHorizontal,
    paddingBottom: LAYOUT.content.paddingBottom,
  },

  // Content (with section label)
  contentWithSection: {
    flex: 1,
    paddingTop: LAYOUT.content.paddingTopWithSection,
    paddingHorizontal: LAYOUT.content.paddingHorizontal,
    paddingBottom: LAYOUT.content.paddingBottom,
  },

  // Footer - FIXED POSITION
  footer: {
    position: 'absolute',
    left: LAYOUT.footer.paddingHorizontal,
    right: LAYOUT.footer.paddingHorizontal,
    bottom: LAYOUT.footer.bottom,
  },

  // Text Input
  textInput: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.white[30],
    fontSize: TYPOGRAPHY.input.fontSize,
    color: TYPOGRAPHY.input.color,
  },

  // Input Label
  inputLabel: {
    fontSize: TYPOGRAPHY.inputLabel.fontSize,
    color: TYPOGRAPHY.inputLabel.color,
    marginBottom: TYPOGRAPHY.inputLabel.marginBottom,
  },

  // Help Text
  helpText: {
    fontSize: TYPOGRAPHY.helpText.fontSize,
    lineHeight: TYPOGRAPHY.helpText.lineHeight,
    color: TYPOGRAPHY.helpText.color,
    marginTop: LAYOUT.spacing.default,
  },

  // Close Button (for modals)
  // Position BELOW secret triggers (which end at y:80) to avoid overlap
  closeButton: {
    position: 'absolute',
    top: 85,
    right: 16,
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000, // Above secret triggers
  },

  // Secret triggers (dev mode)
  secretBackTrigger: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 70,
    height: 70,
    zIndex: 9999,
  },
  secretMiddleTrigger: {
    position: 'absolute',
    top: 10,
    left: '50%',
    marginLeft: -35,
    width: 70,
    height: 70,
    zIndex: 9999,
  },
  secretForwardTrigger: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 70,
    height: 70,
    zIndex: 9999,
  },
});

/**
 * ANSWER OPTION STYLES
 * Use Barlow font for answer buttons
 */
export const answerStyles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white[10],
    borderRadius: 12,
    marginBottom: 12,
  },
  containerSelected: {
    backgroundColor: COLORS.blue.selected,
    borderWidth: 2,
    borderColor: COLORS.blue.primary,
  },
  text: {
    fontFamily: TYPOGRAPHY.answerOption.fontFamily,
    fontSize: TYPOGRAPHY.answerOption.fontSize,
    color: TYPOGRAPHY.answerOption.color,
  },
  textSelected: {
    fontFamily: 'Barlow_600SemiBold',
    color: COLORS.white.full,
  },
});

export default LAYOUT;
