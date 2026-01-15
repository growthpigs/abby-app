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
  Text,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { RadioGroup, RadioOption } from '../ui/RadioGroup';
import { GlassButton } from '../ui/GlassButton';
import {
  sharedStyles,
  LAYOUT,
  TYPOGRAPHY,
  COLORS,
} from '../../constants/onboardingLayout';

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
        <Text style={sharedStyles.sectionLabel}>Basics</Text>

        {/* Headline - Merriweather_700Bold, fontSize 32 */}
        <Text style={sharedStyles.headline}>I want to date...</Text>

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
              <Text style={styles.seeAllText}>See All Options ▼</Text>
            </Pressable>
          )}
        </ScrollView>
      </View>

      {/* Fixed footer - bottom: 48 */}
      <View style={sharedStyles.footer}>
        <GlassButton
          onPress={handleNext}
          disabled={!selectedPreference}
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
        disabled={!selectedPreference}
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
    marginTop: LAYOUT.spacing.default,
    paddingVertical: LAYOUT.spacing.medium,
    alignItems: 'center',
  },
  seeAllText: {
    fontFamily: TYPOGRAPHY.body.fontFamily,
    fontSize: TYPOGRAPHY.body.fontSize,
    color: COLORS.white[85],
    textDecorationLine: 'underline',
  },
});

export default BasicsPreferencesScreen;
