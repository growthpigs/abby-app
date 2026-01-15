/**
 * PasswordScreen - Password entry for signup/login
 *
 * Follows Cognito auth flow requirements.
 * Full-screen glass overlay on VibeMatrix
 *
 * Uses shared design system constants from onboardingLayout
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Typography } from '../ui/Typography';
import {
  sharedStyles,
  LAYOUT,
  TYPOGRAPHY,
  COLORS,
} from '../../constants/onboardingLayout';

interface PasswordScreenProps {
  mode: 'signup' | 'signin';
  email: string;
  onNext?: (password: string) => void;
  onSecretBack?: () => void;
  onSecretForward?: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export const PasswordScreen: React.FC<PasswordScreenProps> = ({
  mode,
  email,
  onNext,
  onSecretBack,
  onSecretForward,
  isLoading = false,
  error = null,
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleNext = () => {
    if (isValid && !isLoading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onNext?.(password);
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

  // Password validation (Cognito requirements)
  // 8+ chars, uppercase, lowercase, number, special char
  const passwordValid =
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password);

  // For signup, also need confirm password match
  const isValid =
    mode === 'signin'
      ? password.length >= 8
      : passwordValid && password === confirmPassword;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Back button - uses sharedStyles.backButton (top: 60, left: 24) */}
      <Pressable
        onPress={handleSecretBack}
        style={sharedStyles.backButton}
        hitSlop={LAYOUT.backArrow.hitSlop}
      >
        <Text style={styles.backArrow}>←</Text>
      </Pressable>

      {/* Scrollable Content - uses sharedStyles.content (paddingTop: 140) */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: LAYOUT.content.paddingTop,
            paddingHorizontal: LAYOUT.content.paddingHorizontal,
            paddingBottom: LAYOUT.content.paddingBottom,
          }
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Headline - uses sharedStyles.headline (Merriweather_700Bold, fontSize 32) */}
        <Typography
          variant="headline"
          style={sharedStyles.headline}
        >
          {mode === 'signup' ? 'Create a\npassword' : 'Enter your\npassword'}
        </Typography>

        {/* Email display - uses sharedStyles.helpText */}
        <Typography
          variant="body"
          style={[
            sharedStyles.helpText,
            { marginTop: 0, marginBottom: LAYOUT.spacing.large }
          ]}
        >
          {email}
        </Typography>

        {/* Password input with eye toggle - uses sharedStyles.textInput */}
        <View style={[styles.inputContainer, { marginBottom: LAYOUT.spacing.large }]}>
          <TextInput
            style={[sharedStyles.textInput, styles.passwordInputExtra]}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus={true}
            returnKeyType={mode === 'signup' ? 'next' : 'done'}
            onSubmitEditing={mode === 'signin' ? handleNext : undefined}
            placeholderTextColor={COLORS.white[30]}
            editable={!isLoading}
            maxLength={128}
          />
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
            hitSlop={12}
          >
            <Typography variant="body" style={styles.eyeText}>
              {showPassword ? '👁' : '👁‍🗨'}
            </Typography>
          </Pressable>
        </View>

        {/* Confirm password - directly below first input (signup only) */}
        {mode === 'signup' && (
          <View style={[styles.inputContainer, { marginBottom: LAYOUT.spacing.large }]}>
            <TextInput
              style={[sharedStyles.textInput, styles.passwordInputExtra]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm password"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleNext}
              placeholderTextColor={COLORS.white[30]}
              editable={!isLoading}
              maxLength={128}
            />
          </View>
        )}

        {/* Password requirements - compact, below inputs (signup only) */}
        {mode === 'signup' && (
          <View style={[styles.requirementsContainer, { marginTop: LAYOUT.spacing.default }]}>
            <View style={styles.requirementsRow}>
              <Typography
                variant="caption"
                style={[styles.requirement, password.length >= 8 && styles.requirementMet]}
              >
                {password.length >= 8 ? '✓' : '○'} 8+ chars
              </Typography>
              <Typography
                variant="caption"
                style={[styles.requirement, /[A-Z]/.test(password) && styles.requirementMet]}
              >
                {/[A-Z]/.test(password) ? '✓' : '○'} Uppercase
              </Typography>
              <Typography
                variant="caption"
                style={[styles.requirement, /[a-z]/.test(password) && styles.requirementMet]}
              >
                {/[a-z]/.test(password) ? '✓' : '○'} Lowercase
              </Typography>
            </View>
            <View style={styles.requirementsRow}>
              <Typography
                variant="caption"
                style={[styles.requirement, /[0-9]/.test(password) && styles.requirementMet]}
              >
                {/[0-9]/.test(password) ? '✓' : '○'} Number
              </Typography>
              <Typography
                variant="caption"
                style={[styles.requirement, /[!@#$%^&*(),.?":{}|<>]/.test(password) && styles.requirementMet]}
              >
                {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? '✓' : '○'} Special
              </Typography>
              {confirmPassword.length > 0 && (
                <Typography
                  variant="caption"
                  style={[styles.requirement, password === confirmPassword && styles.requirementMet]}
                >
                  {password === confirmPassword ? '✓' : '○'} Match
                </Typography>
              )}
            </View>
          </View>
        )}

        {/* Error message */}
        {error && (
          <View style={styles.errorContainer}>
            <Typography variant="caption" style={styles.errorText}>
              {error}
            </Typography>
          </View>
        )}
      </ScrollView>

      {/* Fixed footer with Continue button - uses sharedStyles.footer (bottom: 48) */}
      <View style={sharedStyles.footer}>
        <Pressable
          onPress={handleNext}
          disabled={!isValid || isLoading}
          style={({ pressed }) => [
            styles.continueButton,
            (!isValid || isLoading) && styles.continueButtonDisabled,
            pressed && styles.buttonPressed,
          ]}
        >
          {isLoading ? (
            <ActivityIndicator color="#1a1a1a" />
          ) : (
            <Typography variant="bodyLarge" style={styles.continueButtonText}>
              Continue
            </Typography>
          )}
        </Pressable>
      </View>

      {/* Secret navigation triggers - uses sharedStyles */}
      <Pressable
        onPress={handleSecretBack}
        style={sharedStyles.secretBackTrigger}
        hitSlop={10}
      />
      <Pressable
        onPress={handleNext}
        disabled={!isValid || isLoading}
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
  container: {
    flex: 1,
  },
  backArrow: {
    fontSize: LAYOUT.backArrow.size,
    color: COLORS.white[95],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInputExtra: {
    // Extra styles for password input (extends sharedStyles.textInput)
    flex: 1,
    fontWeight: '400',
    letterSpacing: 0,
    textAlign: 'left',
  },
  eyeButton: {
    padding: 12,
    position: 'absolute',
    right: 0,
  },
  eyeText: {
    fontSize: 20,
  },
  requirementsContainer: {
    // marginTop applied dynamically via LAYOUT.spacing
  },
  requirementsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: LAYOUT.spacing.default,
    marginBottom: LAYOUT.spacing.small,
  },
  requirement: {
    fontSize: 11,
    color: COLORS.white[50],
  },
  requirementMet: {
    color: COLORS.green.primary,
  },
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
  continueButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.white[95],
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: COLORS.white[30],
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  continueButtonText: {
    color: COLORS.charcoal.dark,
    fontWeight: '600',
  },
});

export default PasswordScreen;
