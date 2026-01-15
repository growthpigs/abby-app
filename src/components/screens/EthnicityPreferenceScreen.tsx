/**
 * EthnicityPreferenceScreen - Preferred partner ethnicities
 *
 * Screen 9 in client onboarding spec.
 * Multi-select - user can choose multiple ethnicities.
 * Includes "Don't care" option.
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
import { Checkbox } from '../ui/Checkbox';
import { GlassButton } from '../ui/GlassButton';
import {
  sharedStyles,
  answerStyles,
  LAYOUT,
  TYPOGRAPHY,
  COLORS,
} from '../../constants/onboardingLayout';

interface EthnicityPreferenceScreenProps {
  onNext?: (ethnicities: string[]) => void;
  onSecretBack?: () => void;
  onSecretForward?: () => void;
}

// Client spec: Screen 9 - Ethnicity Preferred (multi-select)
const ETHNICITY_OPTIONS = [
  { label: 'White', value: 'white' },
  { label: 'Black', value: 'black' },
  { label: 'Hispanic', value: 'hispanic' },
  { label: 'Asian', value: 'asian' },
  { label: 'Indian', value: 'indian' },
  { label: 'Middle Eastern', value: 'middle_eastern' },
  { label: 'Native American', value: 'native_american' },
  { label: 'Caribbean', value: 'caribbean' },
  { label: 'European', value: 'european' },
  { label: "Don't care", value: 'dont_care' },
];

export const EthnicityPreferenceScreen: React.FC<EthnicityPreferenceScreenProps> = ({
  onNext,
  onSecretBack,
  onSecretForward,
}) => {
  const [selectedEthnicities, setSelectedEthnicities] = useState<string[]>([]);

  const handleToggle = (value: string) => {
    Haptics.selectionAsync();

    // If "Don't care" is selected, clear all others
    if (value === 'dont_care') {
      setSelectedEthnicities(['dont_care']);
      return;
    }

    // If selecting something else, remove "Don't care"
    setSelectedEthnicities(prev => {
      const withoutDontCare = prev.filter(v => v !== 'dont_care');

      if (withoutDontCare.includes(value)) {
        return withoutDontCare.filter(v => v !== value);
      } else {
        return [...withoutDontCare, value];
      }
    });
  };

  const handleNext = () => {
    if (selectedEthnicities.length > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onNext?.(selectedEthnicities);
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

  const isValid = selectedEthnicities.length > 0;

  return (
    <View style={sharedStyles.container}>
      {/* Back button - FIXED: top: 60, left: 24 */}
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
        <Text style={sharedStyles.sectionLabel}>
          Preferences
        </Text>

        {/* Headline - Merriweather_700Bold, fontSize 32 */}
        <Text style={sharedStyles.headline}>
          Who would you{'\n'}like to meet?
        </Text>

        {/* Subtext */}
        <Text style={styles.subtext}>
          Select all that apply
        </Text>

        {/* Options */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {ETHNICITY_OPTIONS.map((option) => (
            <Checkbox
              key={option.value}
              checked={selectedEthnicities.includes(option.value)}
              onChange={() => handleToggle(option.value)}
              label={option.label}
              style={styles.checkbox}
            />
          ))}
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
  subtext: {
    fontFamily: TYPOGRAPHY.body.fontFamily,
    fontSize: 14,
    color: COLORS.white[50],
    marginBottom: LAYOUT.spacing.large,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: LAYOUT.spacing.large,
    gap: LAYOUT.spacing.default,
  },
  checkbox: {
    paddingVertical: LAYOUT.spacing.micro,
  },
});

export default EthnicityPreferenceScreen;
