/**
 * EmailVerificationScreen - Email verification code entry
 *
 * Exact copy of Tinder's email verification screen
 * Full-screen glass overlay on VibeMatrix
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
        {/* Headline */}
        <Typography variant="headline" style={styles.headline}>
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
          placeholderTextColor="rgba(255, 255, 255, 0.3)"
          editable={!isLoading}
        />

        {/* Loading indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="rgba(255, 255, 255, 0.9)" />
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

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Resend link */}
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
        style={styles.secretBackTrigger}
        hitSlop={0}
      />
      {/* Middle = Primary action (Next/Done/OK) */}
      <Pressable
        onPress={handleNext}
        disabled={!isValid || isLoading}
        style={styles.secretMiddleTrigger}
        hitSlop={0}
      />
      {/* Right = Forward */}
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
  headline: {
    fontSize: 32,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 40,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  subtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 32,
  },
  codeInput: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    fontSize: 32,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '600',
    letterSpacing: 8,
    textAlign: 'center',
  },
  resendButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textDecorationLine: 'underline',
  },
  resendTextDisabled: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 12,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  errorContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(255, 100, 100, 0.2)',
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    color: 'rgba(255, 150, 150, 0.95)',
    textAlign: 'center',
  },
  resendMessageContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(100, 255, 150, 0.15)',
    borderRadius: 8,
  },
  resendMessageText: {
    fontSize: 14,
    color: 'rgba(150, 255, 180, 0.95)',
    textAlign: 'center',
  },
  secretBackTrigger: {
    position: 'absolute',
    top: 10, // TOP corner (avoids keyboard)
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
    top: 10, // TOP center (avoids keyboard)
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
    top: 10, // TOP corner (avoids keyboard)
    right: 10,
    width: 70,
    height: 70,
    zIndex: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
});

export default EmailVerificationScreen;
