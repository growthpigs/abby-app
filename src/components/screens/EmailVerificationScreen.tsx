/**
 * EmailVerificationScreen - Email verification code entry
 *
 * Exact copy of Tinder's email verification screen
 * Full-screen glass overlay on VibeMatrix
 *
 * DESIGN SYSTEM: Uses shared constants from onboardingLayout.ts
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Typography } from '../ui/Typography';
import { GlassButton } from '../ui/GlassButton';
import {
  sharedStyles,
  LAYOUT,
  TYPOGRAPHY,
  COLORS,
} from '../../constants/onboardingLayout';

interface EmailVerificationScreenProps {
  email?: string;
  onNext?: (code: string) => void;
  onResend?: () => void;
  onSecretBack?: () => void;
  onSecretForward?: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = ({
  email = 'your email',
  onNext,
  onResend,
  onSecretBack,
  onSecretForward,
  isLoading = false,
  error = null,
}) => {
  const [code, setCode] = useState('');
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const handleNext = () => {
    if (code.length === 6 && !isLoading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onNext?.(code);
    }
  };

  const handleResend = async () => {
    Haptics.selectionAsync();
    setResendMessage(null);
    try {
      await onResend?.();
      setResendMessage('Code sent! Check your email.');
    } catch {
      setResendMessage('Failed to resend. Try again.');
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

  const isValid = code.length === 6;

  return (
    <View style={sharedStyles.container}>
      {/* Back button */}
      <Pressable
        onPress={handleSecretBack}
        style={sharedStyles.backButton}
        hitSlop={LAYOUT.backArrow.hitSlop}
      >
        <Typography variant="headline" style={styles.backArrow}>
          ←
        </Typography>
      </Pressable>

      {/* Content */}
      <View style={sharedStyles.content}>
        {/* Headline */}
        <Typography variant="headline" style={sharedStyles.headline}>
          Verification code{'\n'}sent to {email}
        </Typography>

        {/* Subtext */}
        <Typography variant="body" style={styles.subtext}>
          Enter the code below
        </Typography>

        {/* Code input */}
        <TextInput
          style={styles.codeInput}
          value={code}
          onChangeText={setCode}
          placeholder="000000"
          keyboardType="number-pad"
          autoFocus={true}
          maxLength={6}
          returnKeyType="done"
          onSubmitEditing={handleNext}
          placeholderTextColor={COLORS.white[30]}
          editable={!isLoading}
        />

        {/* Loading indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={COLORS.white[95]} />
            <Typography variant="body" style={styles.loadingText}>
              Verifying...
            </Typography>
          </View>
        )}

        {/* Error message */}
        {error && !isLoading && (
          <View style={styles.errorContainer}>
            <Typography variant="caption" style={styles.errorText}>
              {error}
            </Typography>
          </View>
        )}

        {/* Resend success message */}
        {resendMessage && !error && !isLoading && (
          <View style={styles.resendMessageContainer}>
            <Typography variant="caption" style={styles.resendMessageText}>
              {resendMessage}
            </Typography>
          </View>
        )}

      </View>

      {/* Fixed footer with Continue button and resend link */}
      <View style={sharedStyles.footer}>
        <GlassButton
          onPress={handleNext}
          disabled={!isValid || isLoading}
          variant="primary"
        >
          {isLoading ? 'Verifying...' : 'Continue'}
        </GlassButton>
        <Pressable onPress={handleResend} disabled={isLoading} style={styles.resendButton}>
          <Typography variant="body" style={[styles.resendText, isLoading && styles.resendTextDisabled]}>
            Didn't receive a code?
          </Typography>
        </Pressable>
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
        disabled={!isValid || isLoading}
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

/**
 * Screen-specific styles
 * Shared styles (backButton, headline, content, footer, secretTriggers) come from sharedStyles
 */
const styles = StyleSheet.create({
  // Back arrow icon style
  backArrow: {
    fontSize: LAYOUT.backArrow.size,
    color: COLORS.white[95],
  },
  // Subtext below headline
  subtext: {
    color: COLORS.white[70],
    marginBottom: LAYOUT.spacing.large,
  },
  // Verification code input - specialized for 6-digit entry
  codeInput: {
    width: '100%',
    paddingVertical: LAYOUT.spacing.default,
    paddingHorizontal: LAYOUT.spacing.default,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.white[30],
    fontSize: 32,
    color: COLORS.white[95],
    fontWeight: '600',
    letterSpacing: 8,
    textAlign: 'center',
  },
  // Resend code button
  resendButton: {
    alignItems: 'center',
    paddingVertical: LAYOUT.spacing.default,
  },
  resendText: {
    fontSize: TYPOGRAPHY.helpText.fontSize,
    color: COLORS.white[85],
    textDecorationLine: 'underline',
  },
  resendTextDisabled: {
    color: COLORS.white[50],
  },
  // Loading state
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: LAYOUT.spacing.large,
    gap: LAYOUT.spacing.medium,
  },
  loadingText: {
    color: COLORS.white[70],
    fontSize: TYPOGRAPHY.helpText.fontSize,
  },
  // Error message
  errorContainer: {
    marginTop: LAYOUT.spacing.default,
    padding: LAYOUT.spacing.medium,
    backgroundColor: COLORS.red.background,
    borderRadius: 8,
  },
  errorText: {
    fontSize: TYPOGRAPHY.helpText.fontSize,
    color: COLORS.red.primary,
    textAlign: 'center',
  },
  // Success message after resend
  resendMessageContainer: {
    marginTop: LAYOUT.spacing.default,
    padding: LAYOUT.spacing.medium,
    backgroundColor: COLORS.green.background,
    borderRadius: 8,
  },
  resendMessageText: {
    fontSize: TYPOGRAPHY.helpText.fontSize,
    color: COLORS.green.primary,
    textAlign: 'center',
  },
});

export default EmailVerificationScreen;
