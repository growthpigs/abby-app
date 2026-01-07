/**
 * SignInScreen - Email + Password on single screen
 *
 * Standard sign-in pattern: one form, one submit.
 * Full-screen glass overlay on VibeMatrix
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
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Typography } from '../ui/Typography';
import { validateEmail, sanitizeEmail } from '../../utils/validation';

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
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Back button */}
      <Pressable
        onPress={handleBack}
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
          Welcome{'\n'}back
        </Typography>

        {/* Email input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, emailError && styles.inputError]}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus={true}
            returnKeyType="next"
            placeholderTextColor="rgba(255, 255, 255, 0.3)"
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
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleSignIn}
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
      </View>

      {/* Fixed footer with Sign In button */}
      <View style={styles.footer}>
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
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '400',
  },
  inputError: {
    borderBottomColor: 'rgba(255, 100, 100, 0.7)',
  },
  fieldError: {
    fontSize: 12,
    color: 'rgba(255, 150, 150, 0.95)',
    marginBottom: 16,
    marginLeft: 8,
  },
  eyeButton: {
    padding: 12,
    position: 'absolute',
    right: 0,
  },
  eyeText: {
    fontSize: 20,
  },
  errorContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: 'rgba(255, 100, 100, 0.2)',
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    color: 'rgba(255, 150, 150, 0.95)',
    textAlign: 'center',
  },
  forgotButton: {
    marginTop: 16,
    alignSelf: 'center',
  },
  forgotText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textDecorationLine: 'underline',
  },
  footer: {
    position: 'absolute',
    bottom: 48,
    left: 24,
    right: 24,
  },
  signInButton: {
    width: '100%',
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
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
