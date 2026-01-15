/**
 * PaymentScreen - "Unlock Photo" pay gate
 *
 * Calls backend /v1/payments API then advances demo flow.
 */

import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { GlassSheet, GlassButton, Headline, Body, Caption } from '../ui';
import { useDemoStore } from '../../store/useDemoStore';
import { api } from '../../services/api';

export interface PaymentScreenProps {
  onSecretBack?: () => void;
  onSecretForward?: () => void;
}

export const PaymentScreen: React.FC<PaymentScreenProps> = ({
  onSecretBack,
  onSecretForward,
}) => {
  const advance = useDemoStore((state) => state.advance);
  const matchData = useDemoStore((state) => state.matchData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Call backend payment API
      const response = await api.createPayment({
        amount: 999, // $9.99 in cents
        currency: 'usd',
        productId: 'photo_unlock',
      });

      if (__DEV__) {
        console.log('[PaymentScreen] Payment created:', response.paymentId, response.status);
      }

      // Payment succeeded - advance the flow
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      advance();
    } catch (err) {
      if (__DEV__) {
        console.error('[PaymentScreen] Payment failed:', err);
      }
      setError('Payment failed. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  // Secret navigation handlers
  const handleSecretBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onSecretBack?.();
  }, [onSecretBack]);

  const handleSecretForward = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onSecretForward?.();
  }, [onSecretForward]);

  if (!matchData) {
    return null;
  }

  return (
    <View style={styles.container}>
      <GlassSheet height={0.67}>
        {/* Header */}
        <Caption style={styles.label}>UNLOCK PHOTO</Caption>

        {/* Main content */}
        <View style={styles.content}>
          <Headline style={styles.headline}>
            See {matchData?.name}'s Photo
          </Headline>
          <Body style={styles.description}>
            You've found someone with {matchData?.compatibilityScore}% compatibility.
            Unlock their photo to continue.
          </Body>
        </View>

        {/* Price display */}
        <View style={styles.priceSection}>
          <Headline style={styles.price}>$9.99</Headline>
          <Caption style={styles.priceNote}>One-time unlock</Caption>
        </View>

        {/* Error message */}
        {error && (
          <Caption style={styles.errorText}>{error}</Caption>
        )}

        {/* Action button */}
        <View style={styles.buttonContainer}>
          <GlassButton onPress={handlePay} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color="rgba(0,0,0,0.6)" />
            ) : (
              'Unlock Photo'
            )}
          </GlassButton>
        </View>
      </GlassSheet>

      {/* Secret navigation triggers (all 70x70, invisible) */}
      {/* Left = Back */}
      <Pressable
        onPress={handleSecretBack}
        style={styles.secretBackTrigger}
        hitSlop={10}
      />
      {/* Middle = Primary action (Unlock Photo) */}
      <Pressable
        onPress={handlePay}
        style={styles.secretMiddleTrigger}
        hitSlop={10}
      />
      {/* Right = Forward */}
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
  label: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    letterSpacing: 3,
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headline: {
    textAlign: 'center',
    marginBottom: 16,
    color: 'rgba(0, 0, 0, 0.85)',
  },
  description: {
    textAlign: 'center',
    color: 'rgba(0, 0, 0, 0.6)',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  priceSection: {
    alignItems: 'center',
    paddingVertical: 24,
    marginHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
    marginBottom: 24,
  },
  price: {
    fontSize: 48,
    color: 'rgba(0, 0, 0, 0.85)',
    marginBottom: 4,
  },
  priceNote: {
    color: 'rgba(0, 0, 0, 0.4)',
    fontSize: 13,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: 32,
  },
  errorText: {
    color: '#E11D48',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
  },

  // Secret navigation triggers
  secretBackTrigger: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 70,
    height: 70,
    zIndex: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
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
    borderColor: 'rgba(255, 255, 255, 0.5)',
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
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 8,
  },
});

export default PaymentScreen;
