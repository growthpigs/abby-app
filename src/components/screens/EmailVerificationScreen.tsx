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
import { GlassButton } from '../ui/GlassButton';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';

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
  const layout = useResponsiveLayout();
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
      {/* Back button */}
      <Pressable
        onPress={handleSecretBack}
        style={[styles.backButton, { top: layout.paddingTop + 20 }]}
        hitSlop={20}
      >
        <Typography variant="headline" style={styles.backArrow}>
          ←
        </Typography>
      </Pressable>

      {/* Content */}
      <View style={[styles.content, {
        paddingTop: layout.paddingTop + 60,
        paddingHorizontal: layout.paddingHorizontal,
        paddingBottom: layout.paddingBottom,
      }]}>
        {/* Headline */}
        <Typography variant="headline" style={[styles.headline, {
          fontSize: layout.headlineFontSize,
          marginBottom: layout.sectionGap,
        }]}>
          Verification code{'\n'}sent to {email}
        </Typography>

        {/* Subtext */}
        <Typography variant="body" style={[styles.subtext, {
          fontSize: layout.bodyFontSize,
          marginBottom: layout.sectionGap * 1.5,
        }]}>
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

      </View>

      {/* Fixed footer with Continue button and resend link */}
      <View style={[styles.footer, {
        bottom: layout.paddingBottom,
        left: layout.paddingHorizontal,
        right: layout.paddingHorizontal,
      }]}>
        <GlassButton
          onPress={handleNext}
          disabled={!isValid || isLoading}
          variant="primary"
        >
          {isLoading ? 'Verifying...' : 'Continue'}
        </GlassButton>
        <Pressable onPress={handleResend} disabled={isLoading} style={[styles.resendButton, { paddingVertical: layout.buttonMargin }]}>
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
        hitSlop={10}
      />
      {/* Middle = Primary action (Next/Done/OK) */}
      <Pressable
        onPress={handleNext}
        disabled={!isValid || isLoading}
        style={styles.secretMiddleTrigger}
        hitSlop={10}
      />
      {/* Right = Forward */}
      <Pressable
        onPress={handleSecretForward}
        style={styles.secretForwardTrigger}
        hitSlop={10}
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
    left: 24,
    zIndex: 10,
  },
  backArrow: {
    fontSize: 32,
    color: 'rgba(255, 255, 255, 0.95)',
  },
  content: {
    flex: 1,
  },
  headline: {
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  subtext: {
    color: 'rgba(255, 255, 255, 0.7)',
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
  footer: {
    position: 'absolute',
  },
  resendButton: {
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
