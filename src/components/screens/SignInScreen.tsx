/**
 * SignInScreen - Email + Password on single screen
 *
 * Standard sign-in pattern: one form, one submit.
 * Full-screen glass overlay on VibeMatrix
 *
 * Uses shared design system constants from onboardingLayout
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Typography } from '../ui/Typography';
import { validateEmail, sanitizeEmail } from '../../utils/validation';
import {
  sharedStyles,
  LAYOUT,
  TYPOGRAPHY,
  COLORS,
} from '../../constants/onboardingLayout';

interface SignInScreenProps {
  onSignIn?: (email: string, password: string) => void;
  onBack?: () => void;
  onForgotPassword?: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export const SignInScreen: React.FC<SignInScreenProps> = ({
  onSignIn,
  onBack,
  onForgotPassword,
  isLoading = false,
  error = null,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = () => {
    if (isValid && !isLoading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // Use sanitizeEmail for consistent lowercase + trimmed email
      onSignIn?.(sanitizeEmail(email), password);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onBack?.();
  };

  const handleForgotPassword = () => {
    Haptics.selectionAsync();
    onForgotPassword?.();
  };

  // Validation using shared utilities
  // For sign-in: validate email format, password just needs to exist (full validation on signup)
  const emailValidation = useMemo(() => validateEmail(email), [email]);
  const passwordValid = password.length > 0; // For sign-in, any password length is allowed
  const isValid = emailValidation.valid && passwordValid;

  // Show validation hint for email
  const emailError = email.length > 0 && !emailValidation.valid ? emailValidation.error : null;

  return (
    <KeyboardAvoidingView
      style={sharedStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Back button - uses sharedStyles.backButton (top: 60, left: 24) */}
      <Pressable
        onPress={handleBack}
        style={sharedStyles.backButton}
        hitSlop={LAYOUT.backArrow.hitSlop}
      >
        <Typography variant="headline" style={styles.backArrow}>
          ←
        </Typography>
      </Pressable>

      {/* Content - uses sharedStyles.content (paddingTop: 140) */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Headline - uses sharedStyles.headline (Merriweather_700Bold, fontSize: 32) */}
        <Typography
          variant="headline"
          style={sharedStyles.headline}
        >
          Welcome{'\n'}back
        </Typography>

        {/* Email input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[sharedStyles.textInput, emailError && styles.inputError]}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus={true}
            returnKeyType="next"
            placeholderTextColor={COLORS.white[30]}
            editable={!isLoading}
            maxLength={254}
          />
        </View>
        {emailError && (
          <Typography variant="caption" style={styles.fieldError}>
            {emailError}
          </Typography>
        )}

        {/* Password input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={sharedStyles.textInput}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleSignIn}
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

        {/* Error message */}
        {error && (
          <View style={styles.errorContainer}>
            <Typography variant="caption" style={styles.errorText}>
              {error}
            </Typography>
          </View>
        )}

        {/* Forgot password */}
        <Pressable onPress={handleForgotPassword} style={styles.forgotButton}>
          <Typography variant="body" style={styles.forgotText}>
            Forgot password?
          </Typography>
        </Pressable>
      </ScrollView>

      {/* Fixed footer with Sign In button - uses sharedStyles.footer (bottom: 48) */}
      <View style={sharedStyles.footer}>
        <Pressable
          onPress={handleSignIn}
          disabled={!isValid || isLoading}
          style={({ pressed }) => [
            styles.signInButton,
            (!isValid || isLoading) && styles.signInButtonDisabled,
            pressed && styles.buttonPressed,
          ]}
        >
          {isLoading ? (
            <ActivityIndicator color="#1a1a1a" />
          ) : (
            <Typography variant="bodyLarge" style={styles.signInButtonText}>
              Sign In
            </Typography>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  // Back arrow icon styling (position from sharedStyles.backButton)
  backArrow: {
    fontSize: LAYOUT.backArrow.size,
    color: COLORS.white[95],
  },
  scrollView: {
    flex: 1,
  },
  // ScrollView content container - uses LAYOUT constants
  scrollContent: {
    flexGrow: 1,
    paddingTop: LAYOUT.content.paddingTop,
    paddingHorizontal: LAYOUT.content.paddingHorizontal,
    paddingBottom: LAYOUT.content.paddingBottom,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.default,
  },
  inputError: {
    borderBottomColor: 'rgba(255, 100, 100, 0.7)',
  },
  fieldError: {
    fontSize: TYPOGRAPHY.helpText.fontSize,
    color: 'rgba(255, 150, 150, 0.95)',
    marginLeft: LAYOUT.spacing.small,
    marginBottom: LAYOUT.spacing.medium,
  },
  eyeButton: {
    padding: LAYOUT.spacing.medium,
    position: 'absolute',
    right: 0,
  },
  eyeText: {
    fontSize: 20,
  },
  errorContainer: {
    padding: LAYOUT.spacing.medium,
    backgroundColor: 'rgba(255, 100, 100, 0.2)',
    borderRadius: 8,
    marginTop: LAYOUT.spacing.default,
  },
  errorText: {
    fontSize: 14,
    color: 'rgba(255, 150, 150, 0.95)',
    textAlign: 'center',
  },
  forgotButton: {
    alignSelf: 'center',
    marginTop: LAYOUT.spacing.default,
  },
  forgotText: {
    fontSize: 14,
    color: COLORS.white[50],
    textDecorationLine: 'underline',
  },
  signInButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.white[95],
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInButtonDisabled: {
    backgroundColor: COLORS.white[30],
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  signInButtonText: {
    color: '#1a1a1a',
    fontWeight: '600',
  },
});

export default SignInScreen;
