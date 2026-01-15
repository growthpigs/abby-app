/**
 * EmailScreen - Email entry
 *
 * Exact copy of Tinder's email screen
 * Full-screen glass overlay on VibeMatrix
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  TextInput,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Typography } from '../ui/Typography';
import { GlassButton } from '../ui/GlassButton';
import {
  sharedStyles,
  LAYOUT,
  COLORS,
} from '../../constants/onboardingLayout';

interface EmailScreenProps {
  onNext?: (email: string) => void;
  onSecretBack?: () => void;
  onSecretForward?: () => void;
}

export const EmailScreen: React.FC<EmailScreenProps> = ({
  onNext,
  onSecretBack,
  onSecretForward,
}) => {
  const [email, setEmail] = useState('');

  const handleNext = () => {
    if (isValid) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onNext?.(email);
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

  // Email validation: standard pattern (no whitespace, @ required, domain with TLD)
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <View style={sharedStyles.container}>
      {/* Back button */}
      <Pressable
        onPress={handleSecretBack}
        style={sharedStyles.backButton}
        hitSlop={LAYOUT.backArrow.hitSlop}
      >
        <Text style={styles.backArrow}>←</Text>
      </Pressable>

      {/* Content */}
      <View style={sharedStyles.content}>
        {/* Headline */}
        <Typography variant="headline" style={sharedStyles.headline}>
          What's your{'\n'}email?
        </Typography>

        {/* Email input */}
        <TextInput
          style={sharedStyles.textInput}
          value={email}
          onChangeText={setEmail}
          placeholder=""
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus={true}
          returnKeyType="done"
          onSubmitEditing={handleNext}
          placeholderTextColor={COLORS.white[30]}
          maxLength={254}
        />

        {/* Help text */}
        <View>
          <Typography variant="caption" style={sharedStyles.helpText}>
            We'll send you a verification code to confirm your email.{' '}
            <Typography variant="caption" style={styles.helpLink}>
              Why do we need this?
            </Typography>
          </Typography>
        </View>
      </View>

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

      {/* Secret navigation triggers (all 70x70, invisible) */}
      {/* Left = Back */}
      <Pressable
        onPress={handleSecretBack}
        style={sharedStyles.secretBackTrigger}
        hitSlop={10}
      />
      {/* Middle = Primary action (Next/Done/OK) */}
      <Pressable
        onPress={handleNext}
        disabled={!isValid}
        style={sharedStyles.secretMiddleTrigger}
        hitSlop={10}
      />
      {/* Right = Forward */}
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
  helpLink: {
    color: COLORS.white[70],
    textDecorationLine: 'underline',
  },
});

export default EmailScreen;
