/**
 * EthnicityScreen - User's ethnicity selection
 *
 * Screen 8 in client onboarding spec.
 * Single select - user chooses one ethnicity.
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
  COLORS,
} from '../../constants/onboardingLayout';

interface EthnicityScreenProps {
  onNext?: (ethnicity: string) => void;
  onSecretBack?: () => void;
  onSecretForward?: () => void;
}

// Client spec: Screen 8 - Ethnicity (single select)
const ETHNICITY_OPTIONS: RadioOption[] = [
  { label: 'White', value: 'white' },
  { label: 'Black', value: 'black' },
  { label: 'Hispanic', value: 'hispanic' },
  { label: 'Asian', value: 'asian' },
  { label: 'Indian', value: 'indian' },
  { label: 'Middle Eastern', value: 'middle_eastern' },
  { label: 'Native American', value: 'native_american' },
  { label: 'Caribbean', value: 'caribbean' },
  { label: 'European', value: 'european' },
];

export const EthnicityScreen: React.FC<EthnicityScreenProps> = ({
  onNext,
  onSecretBack,
  onSecretForward,
}) => {
  const [selectedEthnicity, setSelectedEthnicity] = useState<string | null>(null);

  const handleNext = () => {
    if (selectedEthnicity) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onNext?.(selectedEthnicity);
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
        <Text style={sharedStyles.sectionLabel}>About You</Text>

        {/* Headline - Merriweather_700Bold, fontSize 32 */}
        <Text style={sharedStyles.headline}>
          What's your{'\n'}ethnicity?
        </Text>

        {/* Options */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <RadioGroup
            options={ETHNICITY_OPTIONS}
            value={selectedEthnicity}
            onChange={setSelectedEthnicity}
            layout="vertical"
          />
        </ScrollView>
      </View>

      {/* Fixed footer - bottom: 48 */}
      <View style={sharedStyles.footer}>
        <GlassButton
          onPress={handleNext}
          disabled={!selectedEthnicity}
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
        disabled={!selectedEthnicity}
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
});

export default EthnicityScreen;
