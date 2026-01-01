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
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Typography } from '../ui/Typography';
import { Checkbox } from '../ui/Checkbox';
import { GlassButton } from '../ui/GlassButton';

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
    <View style={styles.container}>
      {/* Back button */}
      <Pressable
        onPress={handleSecretBack}
        style={styles.backButton}
        hitSlop={20}
      >
        <Typography variant="headline" style={styles.backArrow}>
          ←
        </Typography>
      </Pressable>

      {/* Content */}
      <View style={styles.content}>
        {/* Section label */}
        <Typography variant="body" style={styles.sectionLabel}>
          Preferences
        </Typography>

        {/* Headline */}
        <Typography variant="headline" style={styles.headline}>
          Who would you{'\n'}like to meet?
        </Typography>

        {/* Subtext */}
        <Typography variant="body" style={styles.subtext}>
          Select all that apply
        </Typography>

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

      {/* Fixed footer with Continue button */}
      <View style={styles.footer}>
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
        hitSlop={0}
      />
      <Pressable
        onPress={handleNext}
        disabled={!isValid}
        style={styles.secretMiddleTrigger}
        hitSlop={0}
      />
      <Pressable
        onPress={handleSecretForward}
        style={styles.secretForwardTrigger}
        hitSlop={0}
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
    top: 60,
    left: 24,
    zIndex: 10,
  },
  backArrow: {
    fontSize: 32,
    color: 'rgba(255, 255, 255, 0.95)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 140,
    paddingBottom: 48,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  headline: {
    fontSize: 32,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 40,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
    gap: 16,
  },
  checkbox: {
    paddingVertical: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 48,
    left: 24,
    right: 24,
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

export default EthnicityPreferenceScreen;
