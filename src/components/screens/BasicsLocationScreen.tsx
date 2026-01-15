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
  Text,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { GlassButton } from '../ui/GlassButton';
import {
  sharedStyles,
  LAYOUT,
  TYPOGRAPHY,
  COLORS,
} from '../../constants/onboardingLayout';

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
        return 'Location Captured';
      case 'error':
        return 'Try Again';
      default:
        return 'Use GPS Location';
    }
  };

  return (
    <View style={sharedStyles.container}>
      {/* Back button - FIXED at top: 60, left: 24 */}
      <Pressable
        onPress={handleSecretBack}
        style={sharedStyles.backButton}
        hitSlop={LAYOUT.backArrow.hitSlop}
      >
        <Text style={styles.backArrow}>←</Text>
      </Pressable>

      {/* Content - paddingTop: 170 (with section label) */}
      <View style={sharedStyles.contentWithSection}>
        {/* Section label - JetBrains Mono, WHITE, UPPERCASE */}
        <Text style={sharedStyles.sectionLabel}>Basics</Text>

        {/* Headline - Merriweather_700Bold, fontSize 32 */}
        <Text style={sharedStyles.headline}>
          Please let us know{'\n'}where you live
        </Text>

        {/* Subtext */}
        <Text style={styles.subtext}>
          This helps us find matches near you
        </Text>

        {/* Location options */}
        <View style={styles.optionsContainer}>
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
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Zip Code input */}
          <View style={styles.zipContainer}>
            <Text style={styles.zipLabel}>
              Enter your zip code
            </Text>
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
              placeholderTextColor={COLORS.white[30]}
            />
          </View>
        </View>

      </View>

      {/* Fixed footer - bottom: 48 */}
      <View style={sharedStyles.footer}>
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
        style={sharedStyles.secretBackTrigger}
        hitSlop={10}
      />
      <Pressable
        onPress={handleNext}
        disabled={!isValid}
        style={sharedStyles.secretMiddleTrigger}
        hitSlop={10}
      />
      <Pressable
        onPress={handleSecretForward}
        style={sharedStyles.secretForwardTrigger}
        hitSlop={10}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  backArrow: {
    fontSize: LAYOUT.backArrow.size,
    color: COLORS.white[95],
  },
  subtext: {
    fontFamily: TYPOGRAPHY.body.fontFamily,
    fontSize: TYPOGRAPHY.body.fontSize,
    lineHeight: TYPOGRAPHY.body.lineHeight,
    color: COLORS.white[70],
    marginBottom: LAYOUT.spacing.large,
  },
  optionsContainer: {
    gap: LAYOUT.spacing.large,
  },
  gpsButton: {
    width: '100%',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT.spacing.default,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.white[30],
  },
  dividerText: {
    fontSize: 14,
    color: COLORS.white[50],
  },
  zipContainer: {
    gap: LAYOUT.spacing.small,
  },
  zipLabel: {
    fontSize: TYPOGRAPHY.inputLabel.fontSize,
    color: TYPOGRAPHY.inputLabel.color,
  },
  zipInput: {
    width: '100%',
    paddingVertical: LAYOUT.spacing.default,
    paddingHorizontal: LAYOUT.spacing.default,
    borderWidth: 1,
    borderColor: COLORS.white[30],
    borderRadius: 12,
    fontSize: 24,
    color: COLORS.white[95],
    fontWeight: '600',
    letterSpacing: 4,
    textAlign: 'center',
    backgroundColor: COLORS.white[10],
  },
});

export default BasicsLocationScreen;
