/**
 * NameScreen - Name entry for signup
 *
 * Collects user's name during signup flow.
 * Full-screen glass overlay on VibeMatrix
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { GlassButton } from '../ui/GlassButton';
import {
  sharedStyles,
  LAYOUT,
  COLORS,
} from '../../constants/onboardingLayout';

interface NameScreenProps {
  onNext?: (firstName: string, familyName: string) => void;
  onSecretBack?: () => void;
  onSecretForward?: () => void;
}

export const NameScreen: React.FC<NameScreenProps> = ({
  onNext,
  onSecretBack,
  onSecretForward,
}) => {
  const [firstName, setFirstName] = useState('');
  const [familyName, setFamilyName] = useState('');

  const handleNext = () => {
    if (isValid) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onNext?.(firstName.trim(), familyName.trim());
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

  // Name validation: both first and family name required, at least 2 characters each
  const isValid = firstName.trim().length >= 2 && familyName.trim().length >= 2;

  return (
    <KeyboardAvoidingView
      style={sharedStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Back button */}
      <Pressable
        onPress={handleSecretBack}
        style={sharedStyles.backButton}
        hitSlop={LAYOUT.backArrow.hitSlop}
      >
        <Text style={styles.backArrow}>←</Text>
      </Pressable>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Headline */}
        <Text style={sharedStyles.headline}>
          What's your{'\n'}first name?
        </Text>

        {/* First name input */}
        <TextInput
          style={sharedStyles.textInput}
          value={firstName}
          onChangeText={setFirstName}
          placeholder=""
          autoCapitalize="words"
          autoCorrect={false}
          autoFocus={true}
          returnKeyType="next"
          placeholderTextColor={COLORS.white[30]}
          maxLength={100}
        />

        {/* Family name section */}
        <Text style={[sharedStyles.inputLabel, { marginTop: LAYOUT.spacing.xl }]}>
          Family Name
        </Text>
        <TextInput
          style={sharedStyles.textInput}
          value={familyName}
          onChangeText={setFamilyName}
          placeholder=""
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={handleNext}
          placeholderTextColor={COLORS.white[30]}
          maxLength={100}
        />

        {/* Help text */}
        <Text style={sharedStyles.helpText}>
          Both first and last name are required
        </Text>
      </ScrollView>

      {/* Fixed footer with Continue button */}
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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: LAYOUT.content.paddingTop,
    paddingHorizontal: LAYOUT.content.paddingHorizontal,
    paddingBottom: LAYOUT.content.paddingBottom,
  },
  backArrow: {
    fontSize: LAYOUT.backArrow.size,
    color: COLORS.white[95],
  },
});

export default NameScreen;
