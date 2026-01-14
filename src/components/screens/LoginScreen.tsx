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

import React, { useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  Alert,
  ScrollView,
} from 'react-native';
import { Typography } from '../ui/Typography';
import { safeImpact, safeSelection } from '../../utils/haptics';

interface LoginScreenProps {
  onCreateAccount?: () => void;
  onSignIn?: () => void;
  onTrouble?: () => void;
  onSecretBack?: () => void;
  onSecretForward?: () => void;
  onAppleSignIn?: () => void;
  onGoogleSignIn?: () => void;
  onFacebookSignIn?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onCreateAccount,
  onSignIn,
  onTrouble,
  onSecretBack,
  onSecretForward,
  onAppleSignIn,
  onGoogleSignIn,
  onFacebookSignIn,
}) => {
  const { height, width } = useWindowDimensions();

  // Responsive sizing for smaller screens (iPhone 16 is ~844pt tall)
  const isSmallScreen = height < 750;
  const spacing = useMemo(() => ({
    paddingTop: isSmallScreen ? 50 : 80,
    logoMargin: isSmallScreen ? 20 : 40,
    buttonHeight: isSmallScreen ? 44 : 52,
    buttonMargin: isSmallScreen ? 8 : 12,
    dividerMargin: isSmallScreen ? 8 : 16,
  }), [isSmallScreen]);

  const showComingSoon = useCallback(() => {
    Alert.alert(
      'Coming Soon',
      'Social sign-in will be available in a future update.',
      [{ text: 'OK' }]
    );
  }, []);

  const handleAppleSignIn = useCallback(() => {
    safeImpact();
    if (onAppleSignIn) {
      onAppleSignIn();
    } else {
      showComingSoon();
    }
  }, [onAppleSignIn, showComingSoon]);

  const handleGoogleSignIn = useCallback(() => {
    safeImpact();
    if (onGoogleSignIn) {
      onGoogleSignIn();
    } else {
      showComingSoon();
    }
  }, [onGoogleSignIn, showComingSoon]);

  const handleFacebookSignIn = useCallback(() => {
    safeImpact();
    if (onFacebookSignIn) {
      onFacebookSignIn();
    } else {
      showComingSoon();
    }
  }, [onFacebookSignIn, showComingSoon]);

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
      // Default: log if no handler (dev only)
      if (__DEV__) console.log('[LoginScreen] Secret BACK trigger');
    }
  };

  const handleSecretForward = () => {
    safeImpact();
    if (onSecretForward) {
      onSecretForward();
    } else {
      // Default: log if no handler (dev only)
      if (__DEV__) console.log('[LoginScreen] Secret FORWARD trigger');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: spacing.paddingTop }
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Logo */}
        <Typography variant="headline" style={[styles.logo, { marginBottom: spacing.logoMargin }]}>
          ABBY
        </Typography>

        {/* Spacer to push buttons down */}
        <View style={{ flex: 1, minHeight: isSmallScreen ? 20 : 60 }} />

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

        {/* Social Auth Buttons */}
        <Pressable
          onPress={handleAppleSignIn}
          style={({ pressed }) => [
            styles.socialButton,
            styles.appleButton,
            { height: spacing.buttonHeight, marginBottom: spacing.buttonMargin },
            pressed && styles.buttonPressed,
          ]}
        >
          <Typography variant="body" style={styles.appleButtonText}>
             Continue with Apple
          </Typography>
        </Pressable>

        <Pressable
          onPress={handleGoogleSignIn}
          style={({ pressed }) => [
            styles.socialButton,
            styles.googleButton,
            { height: spacing.buttonHeight, marginBottom: spacing.buttonMargin },
            pressed && styles.buttonPressed,
          ]}
        >
          <Typography variant="body" style={styles.googleButtonText}>
            G  Continue with Google
          </Typography>
        </Pressable>

        <Pressable
          onPress={handleFacebookSignIn}
          style={({ pressed }) => [
            styles.socialButton,
            styles.facebookButton,
            { height: spacing.buttonHeight, marginBottom: spacing.buttonMargin },
            pressed && styles.buttonPressed,
          ]}
        >
          <Typography variant="body" style={styles.facebookButtonText}>
            f  Continue with Facebook
          </Typography>
        </Pressable>

        {/* Divider */}
        <View style={[styles.divider, { marginVertical: spacing.dividerMargin }]}>
          <View style={styles.dividerLine} />
          <Typography variant="caption" style={styles.dividerText}>or</Typography>
          <View style={styles.dividerLine} />
        </View>

        {/* Create account button */}
        <Pressable
          onPress={handleCreateAccount}
          style={({ pressed }) => [
            styles.primaryButton,
            { height: spacing.buttonHeight + 4, marginBottom: spacing.buttonMargin },
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
            { height: spacing.buttonHeight + 4, marginBottom: spacing.buttonMargin },
            pressed && styles.buttonPressed,
          ]}
        >
          <Typography variant="bodyLarge" style={styles.secondaryButtonText}>
            Sign in
          </Typography>
        </Pressable>

        {/* Trouble link */}
        <Pressable onPress={handleTrouble} style={[styles.troubleButton, { paddingVertical: isSmallScreen ? 8 : 12 }]}>
          <Typography variant="body" style={styles.troubleText}>
            Trouble signing in?
          </Typography>
        </Pressable>
      </ScrollView>

      {/* Secret navigation triggers (44x44 transparent) */}
      <Pressable
        onPress={handleSecretBack}
        style={styles.secretBackTrigger}
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
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  logo: {
    fontSize: 24,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    letterSpacing: 2,
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
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
    // Dynamic padding set in component
  },
  troubleText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textDecorationLine: 'underline',
  },
  // Social auth buttons
  socialButton: {
    width: '100%',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  appleButton: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  appleButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  googleButtonText: {
    color: '#1a1a1a',
    fontWeight: '600',
    fontSize: 15,
  },
  facebookButton: {
    backgroundColor: '#1877F2',
    borderColor: '#1877F2',
  },
  facebookButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    marginHorizontal: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
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
