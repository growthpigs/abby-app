/**
 * Typography - Editorial luxury text components
 *
 * Font System:
 * - Merriweather: Headlines and body text (elegant serif)
 * - JetBrains Mono: Labels and captions ONLY (UPPERCASE, technical feel)
 *
 * Usage:
 *   <Headline>Verify Your Identity</Headline>  // Merriweather serif
 *   <Body>Coffee enthusiast, hiker...</Body>   // Merriweather serif
 *   <Caption>CERTIFICATION</Caption>           // JetBrains Mono UPPERCASE
 */

import React from 'react';
import { Text, StyleSheet, StyleProp, TextStyle } from 'react-native';

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

// Question - Merriweather (interview prompts)
export const Question: React.FC<TypographyProps> = ({ children, style, color }) => (
  <Text style={[styles.question, color ? { color } : null, style]}>
    {children}
  </Text>
);

const styles = StyleSheet.create({
  // Headers - Merriweather serif
  headline: {
    fontFamily: 'Merriweather_700Bold',
    fontWeight: '700',
    lineHeight: 32,
    letterSpacing: -0.5,
    color: '#FFFFFF',
    fontSize: 24,
    // No shadows - clean design
  },
  headlineLarge: {
    fontSize: 32,
    lineHeight: 40,
  },
  headlineSmall: {
    fontSize: 20,
    lineHeight: 26,
  },

  // Body - Merriweather serif (elegant, readable)
  body: {
    fontFamily: 'Merriweather_400Regular',
    fontWeight: '400',
    letterSpacing: 0.2,
    color: '#E5E5E5',
    fontSize: 15,
    lineHeight: 24,
  },
  bodyLarge: {
    fontSize: 17,
    lineHeight: 26,
  },
  bodySmall: {
    fontSize: 13,
    lineHeight: 20,
  },

  // Caption - JetBrains Mono UPPERCASE (labels only)
  caption: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 2,
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
  },

  // Question - Merriweather (interview prompts)
  question: {
    fontFamily: 'Merriweather_400Regular',
    fontSize: 22,
    fontWeight: '400',
    lineHeight: 28, // 1.25x line height
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
