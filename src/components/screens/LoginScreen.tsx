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
import Svg, { Path, G } from 'react-native-svg';
import { Typography } from '../ui/Typography';
import { safeImpact, safeSelection } from '../../utils/haptics';

// Brand Icons as SVG components
const AppleIcon = ({ size = 20, color = '#FFFFFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </Svg>
);

const GoogleIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </Svg>
);

const FacebookIcon = ({ size = 20, color = '#FFFFFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </Svg>
);

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
          <View style={styles.socialButtonContent}>
            <AppleIcon size={20} color="#FFFFFF" />
            <Typography variant="body" style={styles.appleButtonText}>
              Continue with Apple
            </Typography>
          </View>
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
          <View style={styles.socialButtonContent}>
            <GoogleIcon size={20} />
            <Typography variant="body" style={styles.googleButtonText}>
              Continue with Google
            </Typography>
          </View>
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
          <View style={styles.socialButtonContent}>
            <FacebookIcon size={20} color="#FFFFFF" />
            <Typography variant="body" style={styles.facebookButtonText}>
              Continue with Facebook
            </Typography>
          </View>
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
  socialButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
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
