/**
 * VerificationCodeScreen - Phone verification code entry
 *
 * Exact copy of Tinder's verification code screen
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
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';

interface VerificationCodeScreenProps {
  phoneNumber?: string;
  onNext?: (code: string) => void;
  onResend?: () => void;
  onSecretBack?: () => void;
  onSecretForward?: () => void;
}

export const VerificationCodeScreen: React.FC<VerificationCodeScreenProps> = ({
  phoneNumber = 'US +1 XXX-XXX-XXXX',
  onNext,
  onResend,
  onSecretBack,
  onSecretForward,
}) => {
  const [code, setCode] = useState('');
  const layout = useResponsiveLayout();

  const handleNext = () => {
    if (code.length === 6) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onNext?.(code);
    }
  };

  const handleResend = () => {
    Haptics.selectionAsync();
    onResend?.();
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
        style={[styles.backButton, { top: layout.paddingTop + 10 }]}
        hitSlop={20}
      >
        <Typography variant="headline" style={styles.backArrow}>
          ←
        </Typography>
      </Pressable>

      {/* Content */}
      <View style={[
        styles.content,
        {
          paddingTop: layout.paddingTop + 60,
          paddingHorizontal: layout.paddingHorizontal,
          paddingBottom: layout.paddingBottom,
        }
      ]}>
        {/* Headline */}
        <Typography variant="headline" style={[
          styles.headline,
          {
            fontSize: layout.headlineFontSize,
            lineHeight: layout.headlineFontSize + 8,
            marginBottom: layout.sectionGap,
          }
        ]}>
          Verification code{'\n'}sent to {phoneNumber}
        </Typography>

        {/* Subtext */}
        <Typography variant="body" style={[
          styles.subtext,
          {
            fontSize: layout.bodyFontSize,
            marginBottom: layout.sectionGap * 2,
          }
        ]}>
          Enter the code below
        </Typography>

        {/* Code input */}
        <TextInput
          style={[
            styles.codeInput,
            {
              paddingVertical: layout.isSmallScreen ? 12 : 16,
              fontSize: layout.isSmallScreen ? 28 : 32,
            }
          ]}
          value={code}
          onChangeText={setCode}
          placeholder="000000"
          keyboardType="number-pad"
          autoFocus={true}
          maxLength={6}
          returnKeyType="done"
          onSubmitEditing={handleNext}
          placeholderTextColor="rgba(255, 255, 255, 0.3)"
        />

      </View>

      {/* Fixed footer with Continue button and resend link */}
      <View style={[
        styles.footer,
        {
          bottom: layout.paddingBottom,
          left: layout.paddingHorizontal,
          right: layout.paddingHorizontal,
        }
      ]}>
        <GlassButton
          onPress={handleNext}
          disabled={!isValid}
          variant="primary"
        >
          Continue
        </GlassButton>
        <Pressable onPress={handleResend} style={[styles.resendButton, { paddingVertical: layout.buttonMargin }]}>
          <Typography variant="body" style={[styles.resendText, { fontSize: layout.captionFontSize + 2 }]}>
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
        disabled={!isValid}
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
    letterSpacing: -0.5,
  },
  subtext: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  codeInput: {
    width: '100%',
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
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
    color: 'rgba(255, 255, 255, 0.8)',
    textDecorationLine: 'underline',
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

export default VerificationCodeScreen;
