/**
 * ErrorModal - Network Error UI Component
 *
 * Displays user-friendly error messages with retry/dismiss options.
 * Used for network errors, API failures, etc.
 */

import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Modal,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { AlertCircle, RefreshCw, X } from 'lucide-react-native';
import { Headline, Body, Caption } from './Typography';
import { GlassButton } from './GlassButton';

export interface ErrorModalProps {
  visible: boolean;
  title?: string;
  message: string;
  onRetry?: () => void;
  onDismiss: () => void;
  retryLabel?: string;
  dismissLabel?: string;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  visible,
  title = 'Something went wrong',
  message,
  onRetry,
  onDismiss,
  retryLabel = 'Try Again',
  dismissLabel = 'Dismiss',
}) => {
  const handleRetry = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onRetry?.();
  }, [onRetry]);

  const handleDismiss = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDismiss();
  }, [onDismiss]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleDismiss}
    >
      <View style={styles.overlay}>
        <BlurView intensity={80} tint="dark" style={styles.blurOverlay} />

        <View style={styles.modalContainer}>
          <BlurView intensity={90} tint="light" style={styles.modal}>
            {/* Close button */}
            <Pressable
              onPress={handleDismiss}
              style={styles.closeButton}
              hitSlop={12}
            >
              <X size={20} stroke="rgba(0, 0, 0, 0.5)" />
            </Pressable>

            {/* Error icon */}
            <View style={styles.iconContainer}>
              <AlertCircle size={48} stroke="#DC2626" />
            </View>

            {/* Content */}
            <Headline style={styles.title}>{title}</Headline>
            <Body style={styles.message}>{message}</Body>

            {/* Actions */}
            <View style={styles.actions}>
              {onRetry && (
                <GlassButton
                  onPress={handleRetry}
                  variant="primary"
                  style={styles.retryButton}
                >
                  <View style={styles.buttonContent}>
                    <RefreshCw size={18} stroke="white" style={styles.buttonIcon} />
                    <Body style={styles.retryButtonText}>{retryLabel}</Body>
                  </View>
                </GlassButton>
              )}

              <Pressable
                onPress={handleDismiss}
                style={styles.dismissButton}
              >
                <Caption style={styles.dismissText}>{dismissLabel}</Caption>
              </Pressable>
            </View>
          </BlurView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    width: '85%',
    maxWidth: 340,
  },
  modal: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    textAlign: 'center',
    color: 'rgba(0, 0, 0, 0.85)',
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    color: 'rgba(0, 0, 0, 0.6)',
    lineHeight: 22,
    marginBottom: 28,
  },
  actions: {
    width: '100%',
    gap: 12,
    alignItems: 'center',
  },
  retryButton: {
    width: '100%',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  dismissButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  dismissText: {
    color: 'rgba(0, 0, 0, 0.5)',
    fontSize: 14,
  },
});

export default ErrorModal;
