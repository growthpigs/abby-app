/**
 * Typography - Editorial luxury text components
 *
 * DESIGN SYSTEM ENFORCEMENT
 * See: docs/DESIGN-SYSTEM.md for full specification
 *
 * Font System:
 * - Merriweather Bold: Headlines (32px)
 * - Merriweather Regular: Body text (15px)
 * - JetBrains Mono: Section labels ONLY (12px, WHITE, UPPERCASE)
 * - Barlow: Answer options and buttons (see GlassButton, answerStyles)
 *
 * Usage:
 *   <Headline>Verify Your Identity</Headline>  // Merriweather Bold 32px
 *   <Body>Coffee enthusiast, hiker...</Body>   // Merriweather Regular 15px
 *   <Caption>CERTIFICATION</Caption>           // JetBrains Mono 12px WHITE
 *   <SectionLabel>LIFESTYLE</SectionLabel>     // JetBrains Mono 12px WHITE
 */

import React from 'react';
import { Text, StyleSheet, StyleProp, TextStyle } from 'react-native';
import { TYPOGRAPHY, COLORS } from '../../constants/onboardingLayout';

interface TypographyProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  color?: string;
  numberOfLines?: number;
}

// Headers - Merriweather serif (elegant, editorial)
export const Headline: React.FC<TypographyProps> = ({ children, style, color }) => (
  <Text style={[styles.headline, color ? { color } : null, style]}>
    {children}
  </Text>
);

export const HeadlineLarge: React.FC<TypographyProps> = ({ children, style, color }) => (
  <Text style={[styles.headline, styles.headlineLarge, color ? { color } : null, style]}>
    {children}
  </Text>
);

export const HeadlineSmall: React.FC<TypographyProps> = ({ children, style, color }) => (
  <Text style={[styles.headline, styles.headlineSmall, color ? { color } : null, style]}>
    {children}
  </Text>
);

// Body - Merriweather serif (readable, elegant)
export const Body: React.FC<TypographyProps> = ({ children, style, color, numberOfLines }) => (
  <Text style={[styles.body, color ? { color } : null, style]} numberOfLines={numberOfLines}>
    {children}
  </Text>
);

export const BodyLarge: React.FC<TypographyProps> = ({ children, style, color }) => (
  <Text style={[styles.body, styles.bodyLarge, color ? { color } : null, style]}>
    {children}
  </Text>
);

export const BodySmall: React.FC<TypographyProps> = ({ children, style, color }) => (
  <Text style={[styles.body, styles.bodySmall, color ? { color } : null, style]}>
    {children}
  </Text>
);

// Caption - JetBrains Mono UPPERCASE (labels only)
export const Caption: React.FC<TypographyProps> = ({ children, style, color }) => (
  <Text style={[styles.caption, color ? { color } : null, style]}>
    {children}
  </Text>
);

// SectionLabel - JetBrains Mono WHITE UPPERCASE (LIFESTYLE, BASICS, etc.)
export const SectionLabel: React.FC<TypographyProps> = ({ children, style }) => (
  <Text style={[styles.sectionLabel, style]}>
    {children}
  </Text>
);

// Question - Merriweather (interview prompts)
export const Question: React.FC<TypographyProps> = ({ children, style, color }) => (
  <Text style={[styles.question, color ? { color } : null, style]}>
    {children}
  </Text>
);

const styles = StyleSheet.create({
  // Headers - Merriweather Bold (DESIGN SYSTEM: 32px, lineHeight 40)
  headline: {
    fontFamily: TYPOGRAPHY.headline.fontFamily,
    fontWeight: '700',
    fontSize: TYPOGRAPHY.headline.fontSize, // 32px
    lineHeight: TYPOGRAPHY.headline.lineHeight, // 40px
    letterSpacing: TYPOGRAPHY.headline.letterSpacing, // -0.5
    color: TYPOGRAPHY.headline.color, // rgba(255, 255, 255, 0.95)
  },
  headlineLarge: {
    fontSize: 36,
    lineHeight: 44,
  },
  headlineSmall: {
    fontSize: 24,
    lineHeight: 32,
  },

  // Body - Merriweather Regular (DESIGN SYSTEM: 15px, lineHeight 24)
  body: {
    fontFamily: TYPOGRAPHY.body.fontFamily,
    fontWeight: '400',
    fontSize: TYPOGRAPHY.body.fontSize, // 15px
    lineHeight: TYPOGRAPHY.body.lineHeight, // 24px
    letterSpacing: TYPOGRAPHY.body.letterSpacing, // 0.2
    color: TYPOGRAPHY.body.color, // rgba(255, 255, 255, 0.85)
  },
  bodyLarge: {
    fontSize: 17,
    lineHeight: 26,
  },
  bodySmall: {
    fontSize: 13,
    lineHeight: 20,
  },

  // Caption - JetBrains Mono UPPERCASE (DESIGN SYSTEM: 12px, WHITE)
  caption: {
    fontFamily: TYPOGRAPHY.sectionLabel.fontFamily,
    fontSize: TYPOGRAPHY.sectionLabel.fontSize, // 12px
    fontWeight: '400',
    letterSpacing: TYPOGRAPHY.sectionLabel.letterSpacing, // 1
    color: TYPOGRAPHY.sectionLabel.color, // #FFFFFF
    textTransform: 'uppercase',
  },

  // SectionLabel - JetBrains Mono WHITE UPPERCASE (DESIGN SYSTEM enforced)
  sectionLabel: {
    fontFamily: TYPOGRAPHY.sectionLabel.fontFamily,
    fontSize: TYPOGRAPHY.sectionLabel.fontSize, // 12px
    fontWeight: '400',
    letterSpacing: TYPOGRAPHY.sectionLabel.letterSpacing, // 1
    color: TYPOGRAPHY.sectionLabel.color, // #FFFFFF - MUST BE WHITE
    textTransform: 'uppercase',
  },

  // Question - Merriweather (interview prompts)
  question: {
    fontFamily: 'Merriweather_400Regular',
    fontSize: 22,
    fontWeight: '400',
    lineHeight: 28,
    letterSpacing: 0,
    color: COLORS.white[95],
    textAlign: 'center',
  },
});

// Unified Typography component with variant prop
type TypographyVariant = 'headline' | 'headlineLarge' | 'headlineSmall' | 'body' | 'bodyLarge' | 'bodySmall' | 'caption' | 'sectionLabel' | 'question';

interface UnifiedTypographyProps extends TypographyProps {
  variant?: TypographyVariant;
}

export const Typography: React.FC<UnifiedTypographyProps> = ({
  variant = 'body',
  children,
  style,
  color,
}) => {
  switch (variant) {
    case 'headline':
      return <Headline style={style} color={color}>{children}</Headline>;
    case 'headlineLarge':
      return <HeadlineLarge style={style} color={color}>{children}</HeadlineLarge>;
    case 'headlineSmall':
      return <HeadlineSmall style={style} color={color}>{children}</HeadlineSmall>;
    case 'body':
      return <Body style={style} color={color}>{children}</Body>;
    case 'bodyLarge':
      return <BodyLarge style={style} color={color}>{children}</BodyLarge>;
    case 'bodySmall':
      return <BodySmall style={style} color={color}>{children}</BodySmall>;
    case 'caption':
      return <Caption style={style} color={color}>{children}</Caption>;
    case 'sectionLabel':
      return <SectionLabel style={style}>{children}</SectionLabel>;
    case 'question':
      return <Question style={style} color={color}>{children}</Question>;
    default:
      return <Body style={style} color={color}>{children}</Body>;
  }
};

export default {
  Headline,
  HeadlineLarge,
  HeadlineSmall,
  Body,
  BodyLarge,
  BodySmall,
  Caption,
  SectionLabel,
  Question,
  Typography,
};
