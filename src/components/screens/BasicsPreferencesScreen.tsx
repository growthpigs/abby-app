/**
 * BasicsPreferencesScreen - "I want to date..." preference selection
 *
 * Screen 6b in onboarding flow. User selects who they want to date.
 * Options: Men, Women, See All (expands to full list)
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

interface BasicsPreferencesScreenProps {
  onNext?: (preference: string) => void;
  onSecretBack?: () => void;
  onSecretForward?: () => void;
}

const BASIC_OPTIONS: RadioOption[] = [
  { label: 'Men', value: 'men' },
  { label: 'Women', value: 'women' },
  { label: 'Everyone', value: 'everyone' },
];

// Client spec: Screen 7 - Sexual Preference
// Primary options (1 choice) + Other options (multi-select capable)
const EXPANDED_OPTIONS: RadioOption[] = [
  { label: 'Men', value: 'men' },
  { label: 'Women', value: 'women' },
  { label: 'Everyone', value: 'everyone' },
  { label: 'Agender people', value: 'agender' },
  { label: 'Androgynous people', value: 'androgynous' },
  { label: 'Bigender people', value: 'bigender' },
  { label: 'Cis Women', value: 'cis_woman' },
  { label: 'Genderfluid people', value: 'genderfluid' },
  { label: 'Genderqueer people', value: 'genderqueer' },
  { label: 'Gender Nonconforming people', value: 'gender_nonconforming' },
  { label: 'Non-binary people', value: 'non_binary' },
  { label: 'Other', value: 'other' },
];

export const BasicsPreferencesScreen: React.FC<BasicsPreferencesScreenProps> = ({
  onNext,
  onSecretBack,
  onSecretForward,
}) => {
  const [selectedPreference, setSelectedPreference] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const options = showAll ? EXPANDED_OPTIONS : BASIC_OPTIONS;

  const handleNext = () => {
    if (selectedPreference) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onNext?.(selectedPreference);
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

  const handleSeeAll = () => {
    Haptics.selectionAsync();
    setShowAll(true);
  };

  return (
    <View style={styles.container}>
      {/* Full-screen glass overlay */}
      <View style={styles.glassOverlay} />

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
          Basics
        </Typography>

        {/* Headline */}
        <Typography variant="headline" style={styles.headline}>
          I want to date...
        </Typography>

        {/* Options */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <RadioGroup
            options={options}
            value={selectedPreference}
            onChange={setSelectedPreference}
            layout="vertical"
          />

          {/* See All button */}
          {!showAll && (
            <Pressable onPress={handleSeeAll} style={styles.seeAllButton}>
              <Typography variant="body" style={styles.seeAllText}>
                See All Options ▼
              </Typography>
            </Pressable>
          )}
        </ScrollView>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Continue button */}
        <GlassButton
          onPress={handleNext}
          disabled={!selectedPreference}
          variant="primary"
          style={styles.continueButton}
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
        disabled={!selectedPreference}
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
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
    marginBottom: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  seeAllButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textDecorationLine: 'underline',
  },
  continueButton: {
    marginTop: 24,
  },
  secretBackTrigger: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 70,
    height: 70,
    zIndex: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  secretMiddleTrigger: {
    position: 'absolute',
    top: 10,
    left: '50%',
    marginLeft: -35,
    width: 70,
    height: 70,
    zIndex: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  secretForwardTrigger: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 70,
    height: 70,
    zIndex: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
});

export default BasicsPreferencesScreen;
