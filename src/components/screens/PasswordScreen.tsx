/**
 * PasswordScreen - Password entry for signup/login
 *
 * Follows Cognito auth flow requirements.
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
        {/* Headline */}
        <Typography variant="headline" style={styles.headline}>
          {mode === 'signup' ? 'Create a\npassword' : 'Enter your\npassword'}
        </Typography>

        {/* Email display */}
        <Typography variant="body" style={styles.emailText}>
          {email}
        </Typography>

        {/* Password input with eye toggle */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.passwordInput}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus={true}
            returnKeyType={mode === 'signup' ? 'next' : 'done'}
            onSubmitEditing={mode === 'signin' ? handleNext : undefined}
            placeholderTextColor="rgba(255, 255, 255, 0.3)"
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
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.passwordInput}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm password"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleNext}
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              editable={!isLoading}
              maxLength={128}
            />
          </View>
        )}

        {/* Password requirements - compact, below inputs (signup only) */}
        {mode === 'signup' && (
          <View style={styles.requirementsContainer}>
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

      </View>

      {/* Fixed footer with Continue button */}
      <View style={styles.footer}>
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

      {/* Secret navigation triggers */}
      <Pressable
        onPress={handleSecretBack}
        style={styles.secretBackTrigger}
        hitSlop={10}
      />
      <Pressable
        onPress={handleNext}
        disabled={!isValid || isLoading}
        style={styles.secretMiddleTrigger}
        hitSlop={10}
      />
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
    marginBottom: 12,
  },
  emailText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.95)',
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
    marginTop: 20,
  },
  requirementsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 8,
  },
  requirement: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  requirementMet: {
    color: 'rgba(100, 255, 150, 0.9)',
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
  footer: {
    position: 'absolute',
    bottom: 48,
    left: 24,
    right: 24,
  },
  continueButton: {
    width: '100%',
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  continueButtonText: {
    color: '#1a1a1a',
    fontWeight: '600',
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

export default PasswordScreen;
