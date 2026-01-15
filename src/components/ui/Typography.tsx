/**
 * Typography - Clean, modern text components
 *
 * Font System:
 * - Barlow: Body text (readable, modern sans-serif)
 * - JetBrains Mono: Labels, headlines, captions (UPPERCASE, technical feel)
 *
 * Usage:
 *   <Headline>MATCH FOUND</Headline>           // JetBrains Mono, uppercase
 *   <Body>Coffee enthusiast, weekend hiker...</Body>  // Barlow, normal case
 *   <Caption>87% COMPATIBLE</Caption>          // JetBrains Mono, uppercase
 */

import React from 'react';
import { Text, StyleSheet, StyleProp, TextStyle } from 'react-native';

interface TypographyProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  color?: string;
  numberOfLines?: number;
}

// Headers - JetBrains Mono UPPERCASE (technical, bold)
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

// Body - Barlow (clean, readable)
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

// Caption - JetBrains Mono UPPERCASE (small labels)
export const Caption: React.FC<TypographyProps> = ({ children, style, color }) => (
  <Text style={[styles.caption, color ? { color } : null, style]}>
    {children}
  </Text>
);

// Question - Barlow (interview prompts - readable at larger size)
export const Question: React.FC<TypographyProps> = ({ children, style, color }) => (
  <Text style={[styles.question, color ? { color } : null, style]}>
    {children}
  </Text>
);

const styles = StyleSheet.create({
  // Headers - JetBrains Mono UPPERCASE
  headline: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontWeight: '400',
    lineHeight: 36,
    letterSpacing: 2,
    color: '#FFFFFF',
    fontSize: 24,
    textTransform: 'uppercase',
    // No shadows - clean design
  },
  headlineLarge: {
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: 3,
  },
  headlineSmall: {
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 1.5,
  },

  // Body - Barlow (clean, readable)
  body: {
    fontFamily: 'Barlow_400Regular',
    fontWeight: '400',
    letterSpacing: 0.2,
    color: '#E5E5E5',
    fontSize: 16,
    lineHeight: 24,
  },
  bodyLarge: {
    fontFamily: 'Barlow_500Medium',
    fontSize: 18,
    lineHeight: 28,
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
  },

  // Caption - JetBrains Mono UPPERCASE (metadata, labels)
  caption: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 2,
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
  },

  // Question - Barlow (interview prompts)
  question: {
    fontFamily: 'Barlow_500Medium',
    fontSize: 23,
    fontWeight: '500',
    lineHeight: 29, // 1.25x line height as requested
    letterSpacing: 0,
    color: '#FFFFFF',
    textAlign: 'center',
    // No shadows - clean design
  },
});

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

export default {
  Headline,
  HeadlineLarge,
  HeadlineSmall,
  Body,
  BodyLarge,
  BodySmall,
  Caption,
  Question,
  Typography,
};
