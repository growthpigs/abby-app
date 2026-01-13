/**
 * PermissionsScreen - App permissions & Terms acceptance
 *
 * Screen 5 in onboarding flow. Shows required permissions
 * and T&C agreement before proceeding.
 *
 * Requests:
 * - Microphone (required for voice chat with Abby)
 * - Location (requested on BasicsLocationScreen if GPS chosen)
 *
 * Deferred (requested on-demand):
 * - Notifications (requested when match found)
 * - Camera (requested when uploading photos)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import * as Location from 'expo-location';
import { Typography } from '../ui/Typography';
import { Checkbox } from '../ui/Checkbox';
import { GlassButton } from '../ui/GlassButton';

interface PermissionsScreenProps {
  onNext?: () => void;
  onSecretBack?: () => void;
  onSecretForward?: () => void;
}

type PermissionStatus = 'pending' | 'granted' | 'denied';

interface PermissionItem {
  id: string;
  label: string;
  description: string;
  status: PermissionStatus;
  required: boolean;
}

export const PermissionsScreen: React.FC<PermissionsScreenProps> = ({
  onNext,
  onSecretBack,
  onSecretForward,
}) => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [permissions, setPermissions] = useState<PermissionItem[]>([
    {
      id: 'microphone',
      label: 'Microphone Access',
      description: 'Talk to Abby with your voice',
      status: 'pending',
      required: true, // Required for voice features
    },
    {
      id: 'location',
      label: 'Location Access',
      description: 'Find matches near you',
      status: 'pending',
      required: false, // Can use zip code instead
    },
    {
      id: 'notifications',
      label: 'Push Notifications',
      description: 'Get notified when you have a new match (requested later)',
      status: 'pending',
      required: false,
    },
    {
      id: 'camera',
      label: 'Camera Access',
      description: 'Take photos for your profile (requested when needed)',
      status: 'pending',
      required: false,
    },
  ]);

  // Check current permission status on mount
  useEffect(() => {
    checkCurrentPermissions();
  }, []);

  const checkCurrentPermissions = async () => {
    try {
      // Check microphone
      const audioStatus = await Audio.getPermissionsAsync();
      updatePermissionStatus('microphone', audioStatus.granted ? 'granted' : 'pending');

      // Check location
      const locationStatus = await Location.getForegroundPermissionsAsync();
      updatePermissionStatus('location', locationStatus.granted ? 'granted' : 'pending');
    } catch (error) {
      if (__DEV__) {
        if (__DEV__) console.warn('[PermissionsScreen] Error checking permissions:', error);
      }
    }
  };

  const updatePermissionStatus = (id: string, status: PermissionStatus) => {
    setPermissions(prev =>
      prev.map(p => (p.id === id ? { ...p, status } : p))
    );
  };

  const requestMicrophonePermission = async (): Promise<boolean> => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      updatePermissionStatus('microphone', granted ? 'granted' : 'denied');
      return granted;
    } catch (error) {
      if (__DEV__) {
        if (__DEV__) console.error('[PermissionsScreen] Microphone permission error:', error);
      }
      updatePermissionStatus('microphone', 'denied');
      return false;
    }
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      updatePermissionStatus('location', granted ? 'granted' : 'denied');
      return granted;
    } catch (error) {
      if (__DEV__) {
        if (__DEV__) console.error('[PermissionsScreen] Location permission error:', error);
      }
      updatePermissionStatus('location', 'denied');
      return false;
    }
  };

  const handleNext = async () => {
    if (!termsAccepted) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRequesting(true);

    try {
      // Request microphone (required for voice)
      const micGranted = await requestMicrophonePermission();

      if (!micGranted) {
        Alert.alert(
          'Microphone Required',
          'Abby needs microphone access to talk with you. Please enable it in Settings.',
          [
            { text: 'Continue Anyway', onPress: () => onNext?.() },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
        setIsRequesting(false);
        return;
      }

      // Request location (optional - can use zip code)
      await requestLocationPermission();
      // Don't block on location - user can enter zip code later

      // All done, proceed
      onNext?.();
    } catch (error) {
      if (__DEV__) {
        if (__DEV__) console.error('[PermissionsScreen] Permission request error:', error);
      }
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsRequesting(false);
    }
  };

  const handlePermissionTap = async (permissionId: string) => {
    Haptics.selectionAsync();

    switch (permissionId) {
      case 'microphone':
        await requestMicrophonePermission();
        break;
      case 'location':
        await requestLocationPermission();
        break;
      case 'notifications':
        // Will be requested later when needed
        Alert.alert('Coming Soon', 'Push notifications will be requested when you get a match!');
        break;
      case 'camera':
        // Will be requested later when needed
        Alert.alert('Coming Soon', 'Camera access will be requested when you upload photos!');
        break;
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

  const getCheckboxState = (permission: PermissionItem): boolean => {
    return permission.status === 'granted';
  };

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
          Permissions
        </Typography>

        {/* Subtext */}
        <Typography variant="body" style={styles.subtext}>
          Abby needs a few things to help find your perfect match
        </Typography>

        {/* Permissions list */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {permissions.map((permission) => (
            <Checkbox
              key={permission.id}
              checked={getCheckboxState(permission)}
              disabled={false}
              onChange={() => handlePermissionTap(permission.id)}
              label={permission.label}
              description={permission.description}
              style={styles.permissionItem}
            />
          ))}

          {/* Terms checkbox - user must accept */}
          <View style={styles.termsContainer}>
            <Checkbox
              checked={termsAccepted}
              onChange={setTermsAccepted}
              label="I agree to the Terms & Conditions"
              description="By continuing, you agree to our Terms of Service and Privacy Policy"
              style={styles.permissionItem}
            />
          </View>
        </ScrollView>
      </View>

      {/* Fixed footer with Continue button */}
      <View style={styles.footer}>
        <GlassButton
          onPress={handleNext}
          disabled={!termsAccepted || isRequesting}
          variant="primary"
        >
          {isRequesting ? 'Requesting...' : 'Continue'}
        </GlassButton>
      </View>

      {/* Secret navigation triggers */}
      <Pressable
        onPress={handleSecretBack}
        style={styles.secretBackTrigger}
        hitSlop={10}
      />
      <Pressable
        onPress={handleNext}
        disabled={!termsAccepted || isRequesting}
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
  subtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    gap: 16,
    paddingBottom: 24,
  },
  permissionItem: {
    paddingVertical: 8,
  },
  termsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footer: {
    position: 'absolute',
    bottom: 48,
    left: 24,
    right: 24,
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

export default PermissionsScreen;
