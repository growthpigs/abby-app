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
  Text,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { RadioGroup, RadioOption } from '../ui/RadioGroup';
import { GlassButton } from '../ui/GlassButton';
import {
  sharedStyles,
  answerStyles,
  LAYOUT,
  TYPOGRAPHY,
  COLORS,
} from '../../constants/onboardingLayout';

interface BasicsGenderScreenProps {
  onNext?: (gender: string) => void;
  onSecretBack?: () => void;
  onSecretForward?: () => void;
}

const BASIC_OPTIONS: RadioOption[] = [
  { label: 'Man', value: 'man' },
  { label: 'Woman', value: 'woman' },
];

// Client spec: Screen 6 - Sexual Identity
// Primary options (1 choice) + Other options (multi-select capable)
const EXPANDED_OPTIONS: RadioOption[] = [
  { label: 'Man', value: 'man' },
  { label: 'Woman', value: 'woman' },
  { label: 'Agender', value: 'agender' },
  { label: 'Androgynous', value: 'androgynous' },
  { label: 'Bigender', value: 'bigender' },
  { label: 'Cis Woman', value: 'cis_woman' },
  { label: 'Genderfluid', value: 'genderfluid' },
  { label: 'Genderqueer', value: 'genderqueer' },
  { label: 'Gender Nonconforming', value: 'gender_nonconforming' },
  { label: 'Non-binary', value: 'non_binary' },
  { label: 'Other', value: 'other' },
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
        <Text style={sharedStyles.sectionLabel}>Basics</Text>

        {/* Headline - Merriweather Bold, fontSize 32 */}
        <Text style={sharedStyles.headline}>I am a...</Text>

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
              <Text style={styles.seeAllText}>See All Options ▼</Text>
            </Pressable>
          )}
        </ScrollView>
      </View>

      {/* Fixed footer - bottom: 48 */}
      <View style={sharedStyles.footer}>
        <GlassButton
          onPress={handleNext}
          disabled={!selectedGender}
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
        disabled={!selectedGender}
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
  },
  seeAllButton: {
    paddingVertical: LAYOUT.spacing.medium,
    alignItems: 'center',
    marginTop: LAYOUT.spacing.default,
  },
  seeAllText: {
    fontFamily: TYPOGRAPHY.answerOption.fontFamily,
    fontSize: TYPOGRAPHY.answerOption.fontSize,
    color: COLORS.white[85],
    textDecorationLine: 'underline',
  },
});

export default BasicsGenderScreen;
