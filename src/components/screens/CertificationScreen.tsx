/**
 * CertificationScreen - Identity Verification Flow
 *
 * Shows verification status for: email, phone, ID, photo.
 * Calls backend /v1/verification API.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { X } from 'lucide-react-native';
import { GlassSheet, GlassButton, Headline, Body, Caption } from '../ui';
import { api } from '../../services/api';
import { TokenManager } from '../../services/TokenManager';
import type { VerificationStatus, VerificationType } from '../../services/api/types';

// Demo mode mock data
const DEMO_VERIFICATION_STATUS: VerificationStatus = {
  emailVerified: true,
  phoneVerified: false,
  idVerified: false,
  photoVerified: false,
};

export interface CertificationScreenProps {
  onComplete?: () => void;
  onBack?: () => void;
}

interface VerificationItem {
  type: VerificationType;
  label: string;
  description: string;
  verified: boolean;
}

export const CertificationScreen: React.FC<CertificationScreenProps> = ({
  onComplete,
  onBack,
}) => {
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [verifyingType, setVerifyingType] = useState<VerificationType | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch verification status on mount
  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Check if authenticated - use demo data if not
      const token = await TokenManager.getToken();
      if (!token) {
        if (__DEV__) {
          console.log('[CertificationScreen] No auth token - using demo data');
        }
        setStatus(DEMO_VERIFICATION_STATUS);
        setIsLoading(false);
        return;
      }

      const result = await api.getVerificationStatus();
      setStatus(result);
      if (__DEV__) {
        console.log('[CertificationScreen] Status:', result);
      }
    } catch (err) {
      if (__DEV__) {
        console.error('[CertificationScreen] Failed to fetch status:', err);
      }
      // Fallback to demo data on error
      setStatus(DEMO_VERIFICATION_STATUS);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (type: VerificationType) => {
    setVerifyingType(type);
    setError(null);
    try {
      // Check if authenticated - simulate in demo mode
      const token = await TokenManager.getToken();
      if (!token) {
        if (__DEV__) {
          console.log('[CertificationScreen] Demo mode - simulating verification:', type);
        }
        // Simulate verification delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Update demo status to mark this type as verified
        setStatus(prev => prev ? {
          ...prev,
          [`${type}Verified`]: true,
        } : prev);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setVerifyingType(null);
        return;
      }

      await api.startVerification({ type });
      if (__DEV__) {
        console.log('[CertificationScreen] Started verification:', type);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Refresh status after starting verification
      await fetchStatus();
    } catch (err) {
      if (__DEV__) {
        console.error('[CertificationScreen] Verification failed:', err);
      }
      setError(`Failed to start ${type} verification`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setVerifyingType(null);
    }
  };

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBack?.();
  }, [onBack]);

  const handleComplete = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onComplete?.();
  }, [onComplete]);

  // Build verification items list
  const verificationItems: VerificationItem[] = status ? [
    {
      type: 'email',
      label: 'Email',
      description: 'Verify your email address',
      verified: status.emailVerified,
    },
    {
      type: 'phone',
      label: 'Phone',
      description: 'Verify your phone number',
      verified: status.phoneVerified,
    },
    {
      type: 'id',
      label: 'Government ID',
      description: 'Upload a valid ID document',
      verified: status.idVerified,
    },
    {
      type: 'photo',
      label: 'Selfie',
      description: 'Take a photo to verify identity',
      verified: status.photoVerified,
    },
  ] : [];

  const allVerified = status &&
    status.emailVerified &&
    status.phoneVerified &&
    status.idVerified &&
    status.photoVerified;

  if (isLoading && !status) {
    return (
      <View style={styles.container}>
        <GlassSheet height={0.8}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="rgba(0,0,0,0.6)" />
            <Body style={styles.loadingText}>Loading verification status...</Body>
          </View>
        </GlassSheet>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GlassSheet height={0.85}>
        {/* Header */}
        <Caption style={styles.label}>CERTIFICATION</Caption>
        <Headline style={styles.headline}>Verify Your Identity</Headline>
        <Body style={styles.description}>
          Complete these steps to become a certified member and build trust.
        </Body>

        {/* Error message */}
        {error && (
          <Caption style={styles.errorText}>{error}</Caption>
        )}

        {/* Verification items */}
        <View style={styles.itemsContainer}>
          {verificationItems.map((item) => (
            <Pressable
              key={item.type}
              style={[
                styles.verificationItem,
                item.verified && styles.verificationItemVerified,
              ]}
              onPress={() => !item.verified && handleVerify(item.type)}
              disabled={item.verified || verifyingType !== null}
            >
              <View style={styles.itemContent}>
                <View style={styles.itemHeader}>
                  <Body style={styles.itemLabel}>{item.label}</Body>
                  {item.verified ? (
                    <View style={styles.checkBadge}>
                      <Caption style={styles.checkText}>✓</Caption>
                    </View>
                  ) : verifyingType === item.type ? (
                    <ActivityIndicator size="small" color="rgba(0,0,0,0.6)" />
                  ) : null}
                </View>
                <Caption style={styles.itemDescription}>{item.description}</Caption>
              </View>
              {!item.verified && verifyingType !== item.type && (
                <Caption style={styles.verifyButton}>VERIFY</Caption>
              )}
            </Pressable>
          ))}
        </View>

        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <Caption style={styles.progressText}>
            {verificationItems.filter(i => i.verified).length} of {verificationItems.length} verified
          </Caption>
        </View>

        {/* Action buttons */}
        <View style={styles.buttonContainer}>
          {allVerified ? (
            <GlassButton onPress={handleComplete}>
              Continue
            </GlassButton>
          ) : (
            <Body style={styles.incompleteText}>
              Complete all verifications to continue
            </Body>
          )}
        </View>
      </GlassSheet>

      {/* Close button */}
      <Pressable
        onPress={handleBack}
        style={styles.closeButton}
        hitSlop={10}
      >
        <X size={24} stroke="rgba(255, 255, 255, 0.9)" />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2000,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: 'rgba(0, 0, 0, 0.5)',
  },
  label: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
    letterSpacing: 3,
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.5)',
  },
  headline: {
    textAlign: 'center',
    marginBottom: 8,
    color: 'rgba(0, 0, 0, 0.85)',
  },
  description: {
    textAlign: 'center',
    color: 'rgba(0, 0, 0, 0.6)',
    lineHeight: 22,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  errorText: {
    color: '#E11D48',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
  },
  itemsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  verificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  verificationItemVerified: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  itemLabel: {
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.85)',
  },
  itemDescription: {
    color: 'rgba(0, 0, 0, 0.5)',
    fontSize: 12,
  },
  checkBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  verifyButton: {
    color: '#3B82F6',
    fontWeight: '600',
    fontSize: 12,
    letterSpacing: 1,
  },
  progressContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  progressText: {
    color: 'rgba(0, 0, 0, 0.5)',
    fontSize: 13,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  incompleteText: {
    color: 'rgba(0, 0, 0, 0.4)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
});

export default CertificationScreen;
