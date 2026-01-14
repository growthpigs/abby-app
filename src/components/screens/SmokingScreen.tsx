/**
 * SmokingScreen - Smoking habits & preferences
 *
 * Screen 11 in client onboarding spec.
 * Two questions:
 * - Smoking - Me: yes/no/casually
 * - Smoking - Partner: yes/no/don't care
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Typography } from '../ui/Typography';
import { RadioGroup, RadioOption } from '../ui/RadioGroup';
import { GlassButton } from '../ui/GlassButton';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';

interface SmokingScreenProps {
  onNext?: (smokingMe: string, smokingPartner: string) => void;
  onSecretBack?: () => void;
  onSecretForward?: () => void;
}

// Client spec: Screen 11 - Smoking preferences
const MY_SMOKING_OPTIONS: RadioOption[] = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
  { label: 'Casually', value: 'casually' },
];

const PARTNER_SMOKING_OPTIONS: RadioOption[] = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
  { label: "I don't care", value: 'dont_care' },
];

export const SmokingScreen: React.FC<SmokingScreenProps> = ({
  onNext,
  onSecretBack,
  onSecretForward,
}) => {
  const layout = useResponsiveLayout();
  const [smokingMe, setSmokingMe] = useState<string | null>(null);
  const [smokingPartner, setSmokingPartner] = useState<string | null>(null);

  const handleNext = () => {
    if (smokingMe && smokingPartner) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onNext?.(smokingMe, smokingPartner);
    }
  };

  const handleSecretBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onSecretBack?.();
  };

  const handleSecretForward = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onSecretForward?.();
  };

  const isValid = smokingMe !== null && smokingPartner !== null;

  return (
    <View style={styles.container}>
      {/* Back button */}
      <Pressable
        onPress={handleSecretBack}
        style={[
          styles.backButton,
          { top: layout.isSmallScreen ? 40 : 60 },
        ]}
        hitSlop={20}
      >
        <Typography variant="headline" style={styles.backArrow}>
          ←
        </Typography>
      </Pressable>

      {/* Content */}
      <View
        style={[
          styles.content,
          {
            paddingHorizontal: layout.paddingHorizontal,
            paddingTop: layout.isSmallScreen ? 100 : 140,
            paddingBottom: layout.paddingBottom,
          },
        ]}
      >
        {/* Section label */}
        <Typography
          variant="body"
          style={[
            styles.sectionLabel,
            { marginBottom: layout.isSmallScreen ? 4 : 8 },
          ]}
        >
          Lifestyle
        </Typography>

        {/* Headline */}
        <Typography
          variant="headline"
          style={[
            styles.headline,
            {
              fontSize: layout.headlineFontSize,
              lineHeight: layout.isSmallScreen ? 34 : 40,
              marginBottom: layout.isSmallScreen ? 20 : 32,
            },
          ]}
        >
          Smoking{'\n'}preferences
        </Typography>

        {/* Options */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { gap: layout.isSmallScreen ? 20 : 32 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* My smoking */}
          <View style={[styles.questionGroup, { gap: layout.isSmallScreen ? 10 : 16 }]}>
            <Typography variant="body" style={styles.questionLabel}>
              Do you smoke?
            </Typography>
            <RadioGroup
              options={MY_SMOKING_OPTIONS}
              value={smokingMe}
              onChange={setSmokingMe}
              layout="horizontal"
            />
          </View>

          {/* Partner's smoking preference */}
          <View style={[styles.questionGroup, { gap: layout.isSmallScreen ? 10 : 16 }]}>
            <Typography variant="body" style={styles.questionLabel}>
              Partner smoking?
            </Typography>
            <RadioGroup
              options={PARTNER_SMOKING_OPTIONS}
              value={smokingPartner}
              onChange={setSmokingPartner}
              layout="horizontal"
            />
          </View>
        </ScrollView>
      </View>

      {/* Fixed footer with Continue button */}
      <View
        style={[
          styles.footer,
          {
            bottom: layout.isSmallScreen ? 32 : 48,
            left: layout.paddingHorizontal,
            right: layout.paddingHorizontal,
          },
        ]}
      >
        <GlassButton
          onPress={handleNext}
          disabled={!isValid}
          variant="primary"
        >
          Continue
        </GlassButton>
      </View>

      {/* Secret navigation triggers */}
      <Pressable
        onPress={handleSecretBack}
        style={styles.secretBackTrigger}
        hitSlop={10}
      />
      <Pressable
        onPress={handleNext}
        disabled={!isValid}
        style={styles.secretMiddleTrigger}
        hitSlop={10}
      />
      <Pressable
        onPress={handleSecretForward}
        style={styles.secretForwardTrigger}
        hitSlop={10}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    left: 24,
    zIndex: 10,
  },
  backArrow: {
    fontSize: 32,
    color: 'rgba(255, 255, 255, 0.95)',
  },
  content: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headline: {
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  questionGroup: {},
  questionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  footer: {
    position: 'absolute',
  },
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

export default SmokingScreen;
