/**
 * LoginScreen - Tinder-style auth entry point
 *
 * Full-screen glass overlay on VibeMatrix (DEEP vibe)
 * Exact copy of Tinder's login screen layout and measurements
 *
 * Features:
 * - Full-screen edge-to-edge glass
 * - Centered content (logo, headline, buttons)
 * - Secret navigation triggers (44x44 bottom corners)
 */

import React from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { Typography } from '../ui/Typography';
import { safeImpact, safeSelection } from '../../utils/haptics';

interface LoginScreenProps {
  onCreateAccount?: () => void;
  onSignIn?: () => void;
  onTrouble?: () => void;
  onSecretBack?: () => void;
  onSecretForward?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onCreateAccount,
  onSignIn,
  onTrouble,
  onSecretBack,
  onSecretForward,
}) => {
  const { height } = useWindowDimensions();

  const handleCreateAccount = () => {
    safeImpact();
    onCreateAccount?.();
  };

  const handleSignIn = () => {
    safeImpact();
    onSignIn?.();
  };

  const handleTrouble = () => {
    safeSelection();
    onTrouble?.();
  };

  const handleSecretBack = () => {
    safeImpact();
    if (onSecretBack) {
      onSecretBack();
    } else {
      // Default: show alert if no handler
      console.log('[LoginScreen] Secret BACK trigger');
    }
  };

  const handleSecretForward = () => {
    safeImpact();
    if (onSecretForward) {
      onSecretForward();
    } else {
      // Default: show alert if no handler
      console.log('[LoginScreen] Secret FORWARD trigger');
    }
  };

  return (
    <View style={styles.container}>
      {/* Content centered */}
      <View style={styles.content}>
        {/* Logo */}
        <Typography variant="headline" style={styles.logo}>
          ABBY
        </Typography>

        {/* Headline */}
        <Typography variant="headline" style={styles.headline}>
          It starts with{'\n'}Abby™
        </Typography>

        {/* Spacer to push buttons down */}
        <View style={{ flex: 1 }} />

        {/* Legal text */}
        <Typography variant="caption" style={styles.legal}>
          By tapping "Create account" or "Sign in", you agree to our{' '}
          <Typography variant="caption" style={styles.legalLink}>
            Terms
          </Typography>
          . Learn how we process your data in our{' '}
          <Typography variant="caption" style={styles.legalLink}>
            Privacy Policy
          </Typography>{' '}
          and{' '}
          <Typography variant="caption" style={styles.legalLink}>
            Cookies Policy
          </Typography>
          .
        </Typography>

        {/* Create account button */}
        <Pressable
          onPress={handleCreateAccount}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Typography variant="bodyLarge" style={styles.primaryButtonText}>
            Create account
          </Typography>
        </Pressable>

        {/* Sign in button */}
        <Pressable
          onPress={handleSignIn}
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Typography variant="bodyLarge" style={styles.secondaryButtonText}>
            Sign in
          </Typography>
        </Pressable>

        {/* Trouble link */}
        <Pressable onPress={handleTrouble} style={styles.troubleButton}>
          <Typography variant="body" style={styles.troubleText}>
            Trouble signing in?
          </Typography>
        </Pressable>
      </View>

      {/* Secret navigation triggers (44x44 transparent) */}
      <Pressable
        onPress={handleSecretBack}
        style={styles.secretBackTrigger}
        hitSlop={0}
      />
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 100, // Logo position from top
    paddingBottom: 48,
    alignItems: 'center',
  },
  logo: {
    fontSize: 24,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    letterSpacing: 2,
    marginBottom: 60,
  },
  headline: {
    fontSize: 40,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    lineHeight: 48,
    letterSpacing: -0.5,
  },
  legal: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  legalLink: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    textDecorationLine: 'underline',
  },
  primaryButton: {
    width: '100%',
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  secondaryButton: {
    width: '100%',
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  primaryButtonText: {
    color: '#1a1a1a',
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#1a1a1a',
    fontWeight: '600',
  },
  troubleButton: {
    paddingVertical: 12,
  },
  troubleText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textDecorationLine: 'underline',
  },
  // Secret navigation triggers (70x70 transparent touchable areas at TOP corners - avoids keyboard)
  secretBackTrigger: {
    position: 'absolute',
    top: 10, // TOP corner (avoids keyboard covering it)
    left: 10,
    width: 70,
    height: 70,
    zIndex: 9999, // Ensure on top of everything
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)', // Subtle white border
    borderRadius: 8,
  },
  secretForwardTrigger: {
    position: 'absolute',
    top: 10, // TOP corner (avoids keyboard covering it)
    right: 10,
    width: 70,
    height: 70,
    zIndex: 9999, // Ensure on top of everything
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)', // Subtle white border
    borderRadius: 8,
  },
});

export default LoginScreen;
