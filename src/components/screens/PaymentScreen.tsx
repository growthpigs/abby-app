/**
 * PaymentScreen - "Unlock Photo" pay gate
 *
 * Clean payment UI with glassmorphism. Auto-approves for demo.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GlassSheet, GlassButton, Headline, Body, Caption } from '../ui';
import { useDemoStore } from '../../store/useDemoStore';

export const PaymentScreen: React.FC = () => {
  const advance = useDemoStore((state) => state.advance);
  const matchData = useDemoStore((state) => state.matchData);

  const handlePay = () => {
    // Auto-approve for demo
    advance();
  };

  if (!matchData) {
    return null;
  }

  return (
    <View style={styles.container}>
      <GlassSheet height={0.55}>
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

        {/* Action button */}
        <View style={styles.buttonContainer}>
          <GlassButton onPress={handlePay}>
            Unlock Photo
          </GlassButton>
        </View>
      </GlassSheet>
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
});

export default PaymentScreen;
