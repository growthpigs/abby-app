/**
 * Typography - Editorial luxury text components
 *
 * Mix traditional Serif headers with clean Sans-Serif data.
 * "The Voice of Abby" for headers, "The Data" for body.
 *
 * Usage:
 *   <Headline>Match Found!</Headline>
 *   <Body>Coffee enthusiast, weekend hiker...</Body>
 *   <Caption>87% Compatible</Caption>
 */

import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';

interface TypographyProps {
  children: React.ReactNode;
  style?: TextStyle;
  color?: string;
}

// Headers - The Voice of Abby (Serif feel, high contrast)
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

// Body - The Data (System Sans, clean)
export const Body: React.FC<TypographyProps> = ({ children, style, color }) => (
  <Text style={[styles.body, color ? { color } : null, style]}>
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

// Caption - Small metadata
export const Caption: React.FC<TypographyProps> = ({ children, style, color }) => (
  <Text style={[styles.caption, color ? { color } : null, style]}>
    {children}
  </Text>
);

// Question - Interview questions (Serif, medium weight)
export const Question: React.FC<TypographyProps> = ({ children, style, color }) => (
  <Text style={[styles.question, color ? { color } : null, style]}>
    {children}
  </Text>
);

// Unified Typography component with variant prop
type TypographyVariant = 'headline' | 'headlineLarge' | 'headlineSmall' | 'body' | 'bodyLarge' | 'bodySmall' | 'caption' | 'question';

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
    case 'question':
      return <Question style={style} color={color}>{children}</Question>;
    default:
      return <Body style={style} color={color}>{children}</Body>;
  }
};

const styles = StyleSheet.create({
  // Headers - Editorial luxury feel
  headline: {
    fontWeight: '700',
    lineHeight: 36,
    letterSpacing: -0.5,
    color: '#FFFFFF',
    fontSize: 28,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headlineLarge: {
    fontSize: 36,
    lineHeight: 44,
  },
  headlineSmall: {
    fontSize: 22,
    lineHeight: 28,
  },

  // Body - Clean, readable
  body: {
    fontWeight: '400',
    letterSpacing: 0.2,
    color: '#E5E5E5',
    fontSize: 16,
    lineHeight: 24,
  },
  bodyLarge: {
    fontSize: 18,
    lineHeight: 28,
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
  },

  // Caption - Metadata, progress
  caption: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
  },

  // Question - Interview prompts
  question: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
    letterSpacing: -0.3,
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});

export default {
  Headline,
  HeadlineLarge,
  HeadlineSmall,
  Body,
  BodyLarge,
  BodySmall,
  Caption,
  Question,
};
