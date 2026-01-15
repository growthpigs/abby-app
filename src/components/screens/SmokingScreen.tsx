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
  Text,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Typography } from '../ui/Typography';
import { RadioGroup, RadioOption } from '../ui/RadioGroup';
import { GlassButton } from '../ui/GlassButton';
import {
  sharedStyles,
  answerStyles,
  LAYOUT,
  TYPOGRAPHY,
  COLORS,
} from '../../constants/onboardingLayout';

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
    <View style={sharedStyles.container}>
      {/* Back button - FIXED at top: 60, left: 24 */}
      <Pressable
        onPress={handleSecretBack}
        style={sharedStyles.backButton}
        hitSlop={LAYOUT.backArrow.hitSlop}
      >
        <Text style={styles.backArrow}>←</Text>
      </Pressable>

      {/* Content - paddingTop: 170 (with section label) */}
      <View style={sharedStyles.contentWithSection}>
        {/* Section label - JetBrains Mono, WHITE, UPPERCASE */}
        <Text style={sharedStyles.sectionLabel}>Lifestyle</Text>

        {/* Headline - Merriweather_700Bold, fontSize 32 */}
        <Text style={sharedStyles.headline}>
          Smoking{'\n'}preferences
        </Text>

        {/* Options */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* My smoking */}
          <View style={styles.questionGroup}>
            <Text style={styles.questionLabel}>Do you smoke?</Text>
            <RadioGroup
              options={MY_SMOKING_OPTIONS}
              value={smokingMe}
              onChange={setSmokingMe}
              layout="horizontal"
            />
          </View>

          {/* Partner's smoking preference */}
          <View style={styles.questionGroup}>
            <Text style={styles.questionLabel}>Partner smoking?</Text>
            <RadioGroup
              options={PARTNER_SMOKING_OPTIONS}
              value={smokingPartner}
              onChange={setSmokingPartner}
              layout="horizontal"
            />
          </View>
        </ScrollView>
      </View>

      {/* Fixed footer - bottom: 48 */}
      <View style={sharedStyles.footer}>
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
        style={sharedStyles.secretBackTrigger}
        hitSlop={10}
      />
      <Pressable
        onPress={handleNext}
        disabled={!isValid}
        style={sharedStyles.secretMiddleTrigger}
        hitSlop={10}
      />
      <Pressable
        onPress={handleSecretForward}
        style={sharedStyles.secretForwardTrigger}
        hitSlop={10}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  backArrow: {
    fontSize: LAYOUT.backArrow.size,
    color: COLORS.white[95],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: LAYOUT.spacing.large,
    gap: LAYOUT.spacing.xl,
  },
  questionGroup: {
    gap: LAYOUT.spacing.default,
  },
  questionLabel: {
    fontFamily: TYPOGRAPHY.answerOption.fontFamily,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white[95],
  },
});

export default SmokingScreen;
