/**
 * PaymentScreen - "Unlock Photo" pay gate
 *
 * Black card aesthetic. Auto-approves for demo.
 * Slides up over MatchScreen.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GlassCard, GlassButton, Headline, Body, Caption } from '../ui';
import { useDemoStore } from '../../store/useDemoStore';

export const PaymentScreen: React.FC = () => {
  const advance = useDemoStore((state) => state.advance);
  const matchData = useDemoStore((state) => state.matchData);

  const handlePay = () => {
    // Auto-approve for demo
    advance();
  };

  return (
    <View style={styles.container}>
      {/* Payment card */}
      <GlassCard style={styles.paymentCard}>
        <Caption style={styles.label}>UNLOCK PHOTO</Caption>
        <Headline style={styles.headline}>
          See {matchData?.name}'s Photo
        </Headline>
        <Body style={styles.description}>
          You've found someone with {matchData?.compatibilityScore}% compatibility.
          Unlock their photo to continue.
        </Body>
        <View style={styles.priceContainer}>
          <Headline style={styles.price}>$9.99</Headline>
          <Caption style={styles.priceNote}>One-time unlock</Caption>
        </View>
      </GlassCard>

      {/* Payment button */}
      <View style={styles.buttonContainer}>
        <GlassButton onPress={handlePay}>
          Unlock Photo
        </GlassButton>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 100,
    paddingHorizontal: 24,
  },
  paymentCard: {
    marginBottom: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  label: {
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 3,
  },
  headline: {
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  priceContainer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  price: {
    fontSize: 40,
    marginBottom: 4,
  },
  priceNote: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  buttonContainer: {
    alignItems: 'center',
  },
});

export default PaymentScreen;
