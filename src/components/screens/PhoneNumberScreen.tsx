/**
 * PhoneNumberScreen - Phone verification entry
 *
 * Exact copy of Tinder's phone number screen
 * Full-screen glass overlay on VibeMatrix
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Typography } from '../ui/Typography';
import { GlassButton } from '../ui/GlassButton';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';

// Format phone number as XXX-XXX-XXXX
const formatPhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
};

// Extract raw digits from formatted number
const getDigitsOnly = (value: string): string => value.replace(/\D/g, '');

interface PhoneNumberScreenProps {
  onNext?: (countryCode: string, phoneNumber: string) => void;
  onSecretBack?: () => void;
  onSecretForward?: () => void;
}

export const PhoneNumberScreen: React.FC<PhoneNumberScreenProps> = ({
  onNext,
  onSecretBack,
  onSecretForward,
}) => {
  const layout = useResponsiveLayout();
  const [countryCode, setCountryCode] = useState('US +1');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleNext = () => {
    if (phoneNumber.length >= 10) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onNext?.(countryCode, phoneNumber);
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

  // Validate: 10+ digits, numbers only
  const isValid = phoneNumber.length >= 10 && /^\d+$/.test(phoneNumber);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Back button */}
      <Pressable
        onPress={handleSecretBack}
        style={[styles.backButton, { top: layout.paddingTop }]}
        hitSlop={20}
      >
        <Typography variant="headline" style={styles.backArrow}>
          ←
        </Typography>
      </Pressable>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: layout.paddingTop + 60,
            paddingHorizontal: layout.paddingHorizontal,
            paddingBottom: layout.paddingBottom,
          }
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Headline */}
        <Typography
          variant="headline"
          style={[
            styles.headline,
            {
              fontSize: layout.headlineFontSize,
              marginBottom: layout.sectionGap * 1.5,
            }
          ]}
        >
          Can we get{'\n'}your number?
        </Typography>

        {/* Country code + phone input row */}
        <View style={[styles.inputRow, { marginBottom: layout.buttonMargin }]}>
          <Pressable style={[styles.countryCodeButton, { height: layout.inputHeight }]}>
            <Typography variant="bodyLarge" style={styles.countryCodeText}>
              {countryCode}
            </Typography>
          </Pressable>

          <TextInput
            style={[styles.phoneInput, { height: layout.inputHeight }]}
            value={formatPhoneNumber(phoneNumber)}
            onChangeText={(text) => setPhoneNumber(getDigitsOnly(text))}
            placeholder="123-456-7890"
            keyboardType="phone-pad"
            autoFocus={true}
            returnKeyType="done"
            onSubmitEditing={handleNext}
            placeholderTextColor="rgba(255, 255, 255, 0.3)"
            maxLength={15}
          />
        </View>

        {/* Help text */}
        <View style={styles.helpTextContainer}>
          <Typography variant="caption" style={[styles.helpText, { fontSize: layout.captionFontSize }]}>
            We'll text you a code to verify you're really you. Message and data rates may apply.{' '}
            <Typography variant="caption" style={[styles.helpLink, { fontSize: layout.captionFontSize }]}>
              What happens if your number changes?
            </Typography>
          </Typography>
        </View>
      </ScrollView>

      {/* Fixed footer with Continue button */}
      <View style={[styles.footer, { bottom: layout.paddingBottom, paddingHorizontal: layout.paddingHorizontal }]}>
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
    </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  headline: {
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  countryCodeButton: {
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    minWidth: 90,
    justifyContent: 'center',
  },
  countryCodeText: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '500',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '400',
  },
  helpTextContainer: {
    marginTop: 8,
  },
  helpText: {
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 18,
  },
  helpLink: {
    color: 'rgba(255, 255, 255, 0.8)',
    textDecorationLine: 'underline',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  nextButton: {
    width: '100%',
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  nextButtonText: {
    color: '#1a1a1a',
    fontWeight: '600',
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
    marginLeft: -35, // Half of 70 to center
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

export default PhoneNumberScreen;
