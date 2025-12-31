/**
 * BasicsGenderScreen - "I am a..." gender selection
 *
 * Screen 6 in onboarding flow. User selects their gender identity.
 * Options: Man, Woman, See All (expands to full list)
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

interface BasicsGenderScreenProps {
  onNext?: (gender: string) => void;
  onSecretBack?: () => void;
  onSecretForward?: () => void;
}

const BASIC_OPTIONS: RadioOption[] = [
  { label: 'Man', value: 'man' },
  { label: 'Woman', value: 'woman' },
];

const EXPANDED_OPTIONS: RadioOption[] = [
  { label: 'Man', value: 'man' },
  { label: 'Woman', value: 'woman' },
  { label: 'Non-binary', value: 'non_binary' },
  { label: 'Transgender', value: 'transgender' },
  { label: 'Genderqueer', value: 'genderqueer' },
  { label: 'Genderfluid', value: 'genderfluid' },
  { label: 'Prefer not to say', value: 'prefer_not_to_say' },
];

export const BasicsGenderScreen: React.FC<BasicsGenderScreenProps> = ({
  onNext,
  onSecretBack,
  onSecretForward,
}) => {
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const options = showAll ? EXPANDED_OPTIONS : BASIC_OPTIONS;

  const handleNext = () => {
    if (selectedGender) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onNext?.(selectedGender);
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
          I am a...
        </Typography>

        {/* Options */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <RadioGroup
            options={options}
            value={selectedGender}
            onChange={setSelectedGender}
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
          disabled={!selectedGender}
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
        disabled={!selectedGender}
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

export default BasicsGenderScreen;
