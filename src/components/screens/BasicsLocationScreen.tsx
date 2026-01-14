/**
 * BasicsLocationScreen - Location selection
 *
 * Screen 8 in onboarding flow. User provides location via GPS or Zip Code.
 * This is the final onboarding screen before meeting Abby.
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { Typography } from '../ui/Typography';
import { GlassButton } from '../ui/GlassButton';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';

interface BasicsLocationScreenProps {
  onNext?: (location: { type: 'gps' | 'zip'; value: string | { lat: number; lng: number } }) => void;
  onSecretBack?: () => void;
  onSecretForward?: () => void;
}

export const BasicsLocationScreen: React.FC<BasicsLocationScreenProps> = ({
  onNext,
  onSecretBack,
  onSecretForward,
}) => {
  const layout = useResponsiveLayout();
  const [zipCode, setZipCode] = useState('');
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);

  const handleUseGPS = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLocationStatus('loading');

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationStatus('error');
        Alert.alert(
          'Location Access Required',
          'Please enable location access in Settings to use GPS location.',
          [{ text: 'OK' }]
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const coords = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };
      setGpsLocation(coords);
      setLocationStatus('success');
      setZipCode(''); // Clear zip if GPS used
    } catch (error) {
      setLocationStatus('error');
      Alert.alert('Location Error', 'Unable to get your location. Please try again or enter a zip code.');
    }
  };

  const handleNext = () => {
    if (gpsLocation) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onNext?.({ type: 'gps', value: gpsLocation });
    } else if (zipCode.length >= 5) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onNext?.({ type: 'zip', value: zipCode });
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

  const isValid = gpsLocation !== null || zipCode.length >= 5;

  const getGPSButtonTitle = () => {
    switch (locationStatus) {
      case 'loading':
        return 'Getting Location...';
      case 'success':
        return 'Location Captured ✓';
      case 'error':
        return 'Try Again';
      default:
        return 'Use GPS Location';
    }
  };

  return (
    <View style={styles.container}>
      {/* Back button */}
      <Pressable
        onPress={handleSecretBack}
        style={[styles.backButton, { top: layout.paddingTop + 20 }]}
        hitSlop={20}
      >
        <Typography variant="headline" style={styles.backArrow}>
          ←
        </Typography>
      </Pressable>

      {/* Content */}
      <View style={[styles.content, { paddingTop: layout.paddingTop + 60, paddingBottom: layout.paddingBottom }]}>
        {/* Section label */}
        <Typography variant="body" style={styles.sectionLabel}>
          Basics
        </Typography>

        {/* Headline */}
        <Typography variant="headline" style={styles.headline}>
          Please let us know{'\n'}where you live
        </Typography>

        {/* Subtext */}
        <Typography variant="body" style={[styles.subtext, { marginBottom: layout.sectionGap + 8 }]}>
          This helps us find matches near you
        </Typography>

        {/* Location options */}
        <View style={[styles.optionsContainer, { gap: layout.sectionGap }]}>
          {/* GPS Button */}
          <GlassButton
            onPress={handleUseGPS}
            variant={locationStatus === 'success' ? 'secondary' : 'primary'}
            disabled={locationStatus === 'loading'}
            style={styles.gpsButton}
          >
            {getGPSButtonTitle()}
          </GlassButton>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Typography variant="body" style={styles.dividerText}>or</Typography>
            <View style={styles.dividerLine} />
          </View>

          {/* Zip Code input */}
          <View style={styles.zipContainer}>
            <Typography variant="body" style={styles.zipLabel}>
              Enter your zip code
            </Typography>
            <TextInput
              style={styles.zipInput}
              value={zipCode}
              onChangeText={(text) => {
                setZipCode(text);
                if (text.length > 0) {
                  setGpsLocation(null); // Clear GPS if typing zip
                  setLocationStatus('idle');
                }
              }}
              placeholder="00000"
              keyboardType="number-pad"
              maxLength={10}
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
            />
          </View>
        </View>

      </View>

      {/* Fixed footer with Continue button */}
      <View style={[styles.footer, { bottom: layout.paddingBottom }]}>
        <GlassButton
          onPress={handleNext}
          disabled={!isValid}
          variant="primary"
        >
          Continue
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
        disabled={!isValid}
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
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
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
    color: 'rgba(255, 255, 255, 0.7)',
  },
  optionsContainer: {},
  gpsButton: {
    width: '100%',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dividerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  zipContainer: {
    gap: 8,
  },
  zipLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  zipInput: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '600',
    letterSpacing: 4,
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  footer: {
    position: 'absolute',
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

export default BasicsLocationScreen;
