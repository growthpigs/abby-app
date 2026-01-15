/**
 * BasicsRelationshipScreen - Desired relationship type
 *
 * Screen 7 in onboarding flow. User selects relationship type.
 * Options: Long-term, Short-term, New Friends
 * Collapsible: Non-Monogamous options
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
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

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface BasicsRelationshipScreenProps {
  onNext?: (relationshipType: string) => void;
  onSecretBack?: () => void;
  onSecretForward?: () => void;
}

// Client spec: Screen 10 - Desired relationship type
const BASIC_OPTIONS: RadioOption[] = [
  {
    label: 'Long-term relationship',
    value: 'long_term',
    description: 'Looking for a serious, committed relationship'
  },
  {
    label: 'Marriage',
    value: 'marriage',
    description: 'Ready to find a life partner'
  },
  {
    label: 'Short-term dating',
    value: 'short_term',
    description: 'Casual dating, seeing where things go'
  },
  {
    label: 'New friends',
    value: 'friends',
    description: 'Looking for friendship first'
  },
];

const NON_MONO_OPTIONS: RadioOption[] = [
  {
    label: 'Open relationship',
    value: 'open_relationship',
    description: 'Primary partner with room for others'
  },
  {
    label: 'Polyamory',
    value: 'polyamory',
    description: 'Multiple committed relationships'
  },
  {
    label: 'Relationship anarchy',
    value: 'relationship_anarchy',
    description: 'No hierarchies, all connections valued equally'
  },
];

export const BasicsRelationshipScreen: React.FC<BasicsRelationshipScreenProps> = ({
  onNext,
  onSecretBack,
  onSecretForward,
}) => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showNonMono, setShowNonMono] = useState(false);

  const allOptions = showNonMono ? [...BASIC_OPTIONS, ...NON_MONO_OPTIONS] : BASIC_OPTIONS;

  const handleNext = () => {
    if (selectedType) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onNext?.(selectedType);
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

  const handleToggleNonMono = () => {
    Haptics.selectionAsync();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowNonMono(!showNonMono);
  };

  return (
    <View style={sharedStyles.container}>
      {/* Back button - uses shared positioning: top: 60, left: 24 */}
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
        <Text style={sharedStyles.headline}>
          Desired{'\n'}relationship type
        </Text>

        {/* Options */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <RadioGroup
            options={allOptions}
            value={selectedType}
            onChange={setSelectedType}
            layout="vertical"
          />

          {/* Non-Monogamous toggle */}
          <Pressable onPress={handleToggleNonMono} style={styles.toggleButton}>
            <Text style={styles.toggleText}>
              {showNonMono ? 'Hide Non-Monogamous Options ▲' : 'See Non-Monogamous Options ▼'}
            </Text>
          </Pressable>
        </ScrollView>
      </View>

      {/* Fixed footer - bottom: 48 */}
      <View style={sharedStyles.footer}>
        <GlassButton
          onPress={handleNext}
          disabled={!selectedType}
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
        disabled={!selectedType}
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
  toggleButton: {
    marginTop: LAYOUT.spacing.default,
    paddingVertical: LAYOUT.spacing.medium,
    alignItems: 'center',
  },
  toggleText: {
    fontFamily: TYPOGRAPHY.body.fontFamily,
    fontSize: LAYOUT.spacing.default,
    color: COLORS.white[85],
    textDecorationLine: 'underline',
  },
});

export default BasicsRelationshipScreen;
