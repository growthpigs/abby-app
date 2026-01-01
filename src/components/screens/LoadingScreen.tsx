/**
 * LoadingScreen - Account creation loading
 *
 * Exact copy of Tinder's loading screen
 * Full-screen glass overlay on VibeMatrix
 */

import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Typography } from '../ui/Typography';

interface LoadingScreenProps {
  onComplete?: () => void;
  loadingText?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  onComplete,
  loadingText = 'Setting up your profile...',
}) => {
  useEffect(() => {
    // Auto-complete after 2 seconds
    const timer = setTimeout(() => {
      onComplete?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <View style={styles.container}>
      {/* Content centered */}
      <View style={styles.content}>
        {/* Logo */}
        <Typography variant="headline" style={styles.logo}>
          ABBY
        </Typography>

        {/* Loading spinner */}
        <ActivityIndicator
          size="large"
          color="rgba(255, 255, 255, 0.95)"
          style={styles.spinner}
        />

        {/* Loading text */}
        <Typography variant="body" style={styles.loadingText}>
          {loadingText}
        </Typography>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    fontSize: 48,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    letterSpacing: 2, // Reduced from 4 to prevent overflow
    marginBottom: 60,
    textAlign: 'center',
    width: '100%', // Ensure full width for centering
  },
  spinner: {
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
});

export default LoadingScreen;
