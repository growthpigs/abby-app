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
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Typography } from '../ui/Typography';
import { RadioGroup, RadioOption } from '../ui/RadioGroup';
import { GlassButton } from '../ui/GlassButton';

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
          Basics
        </Typography>

        {/* Headline */}
        <Typography variant="headline" style={styles.headline}>
          Desired{'\n'}relationship type
        </Typography>

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
            <Typography variant="body" style={styles.toggleText}>
              {showNonMono ? 'Hide Non-Monogamous Options ▲' : 'See Non-Monogamous Options ▼'}
            </Typography>
          </Pressable>
        </ScrollView>
      </View>

      {/* Fixed footer with Continue button */}
      <View style={styles.footer}>
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
        style={styles.secretBackTrigger}
        hitSlop={0}
      />
      <Pressable
        onPress={handleNext}
        disabled={!selectedType}
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
    marginBottom: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  toggleButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textDecorationLine: 'underline',
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

export default BasicsRelationshipScreen;
