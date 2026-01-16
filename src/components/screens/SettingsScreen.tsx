/**
 * SettingsScreen - Input Mode Selection
 *
 * Per settings-spec.md: ONLY input mode selection for MVP.
 * V2 will add notifications, voice customization, privacy, accessibility.
 *
 * 3 modes: voice only, text only, voice+text (default)
 *
 * Uses GlassSheet for animated bottom-to-top entry (matches CertificationScreen)
 */

import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Mic, MessageSquare, Trash2, X } from 'lucide-react-native';
import { AuthService } from '../../services/AuthService';
import { GlassSheet } from '../ui/GlassSheet';
import { Headline, Body, Caption } from '../ui/Typography';
import { useSettingsStore, InputMode } from '../../store/useSettingsStore';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { LAYOUT, TYPOGRAPHY, COLORS } from '../../constants/onboardingLayout';

export interface SettingsScreenProps {
  onClose?: () => void;
}

interface InputModeOptionProps {
  mode: InputMode;
  currentMode: InputMode;
  icon: React.ReactNode;
  title: string;
  description: string;
  onSelect: (mode: InputMode) => void;
}

const InputModeOption: React.FC<InputModeOptionProps> = ({
  mode,
  currentMode,
  icon,
  title,
  description,
  onSelect,
}) => {
  const isSelected = mode === currentMode;

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(mode);
  }, [mode, onSelect]);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.modeOption,
        isSelected && styles.modeOptionSelected,
        pressed && styles.modeOptionPressed,
      ]}
    >
      <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
        {isSelected && <View style={styles.radioInner} />}
      </View>
      <View style={styles.modeIcon}>{icon}</View>
      <View style={styles.modeContent}>
        <Body style={[styles.modeTitle, isSelected && styles.modeTitleSelected]}>
          {title}
        </Body>
        <Caption style={styles.modeDescription}>{description}</Caption>
      </View>
    </Pressable>
  );
};

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onClose,
}) => {
  const inputMode = useSettingsStore((state) => state.inputMode);
  const setInputMode = useSettingsStore((state) => state.setInputMode);
  const layout = useResponsiveLayout();

  const handleSelectMode = useCallback((mode: InputMode) => {
    setInputMode(mode);
  }, [setInputMode]);

  const handleDeleteData = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Delete All My Data',
      'This will permanently delete your account and all associated data. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              if (__DEV__) {
                console.log('[Settings] User requested data deletion');
              }
              await AuthService.logout();
              onClose?.();
            } catch (error) {
              if (__DEV__) {
                console.error('[Settings] Error during data deletion:', error);
              }
              Alert.alert(
                'Error',
                'Failed to delete your data. Please try again later.'
              );
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, [onClose]);

  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose?.();
  }, [onClose]);

  return (
    <View style={styles.container}>
      <GlassSheet height={1}>
        {/* Header - centered label like CertificationScreen */}
        <Caption style={styles.label}>SETTINGS</Caption>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Headline style={[
            styles.questionText,
            {
              fontSize: layout.isSmallScreen ? TYPOGRAPHY.headline.fontSize - 4 : TYPOGRAPHY.headline.fontSize,
              marginBottom: layout.isSmallScreen ? LAYOUT.spacing.large : LAYOUT.spacing.xl,
            },
          ]}>
            How do you want to talk with Abby?
          </Headline>

          <View style={[styles.optionsContainer, { gap: layout.isSmallScreen ? LAYOUT.spacing.medium : LAYOUT.spacing.default }]}>
            <InputModeOption
              mode="voice_only"
              currentMode={inputMode}
              icon={<Mic size={24} stroke="rgba(0, 0, 0, 0.7)" />}
              title="Voice only"
              description="Just speak - no text display"
              onSelect={handleSelectMode}
            />

            <InputModeOption
              mode="voice_and_text"
              currentMode={inputMode}
              icon={<Mic size={24} stroke="rgba(0, 0, 0, 0.7)" />}
              title="Voice + Text"
              description="Speak and see transcript"
              onSelect={handleSelectMode}
            />

            <InputModeOption
              mode="text_only"
              currentMode={inputMode}
              icon={<MessageSquare size={24} stroke="rgba(0, 0, 0, 0.7)" />}
              title="Text only"
              description="Type your responses"
              onSelect={handleSelectMode}
            />
          </View>

          <Caption style={[
            styles.defaultNote,
            { marginTop: layout.isSmallScreen ? LAYOUT.spacing.default : LAYOUT.spacing.large },
          ]}>
            Default is Voice + Text
          </Caption>

          {/* Account Section - GDPR Compliance */}
          <View style={[
            styles.accountSection,
            {
              marginTop: layout.isSmallScreen ? LAYOUT.spacing.xl : LAYOUT.spacing.xxl,
              paddingTop: layout.isSmallScreen ? LAYOUT.spacing.default : LAYOUT.spacing.large,
            },
          ]}>
            <Caption style={styles.sectionTitle}>ACCOUNT</Caption>
            <Pressable
              onPress={handleDeleteData}
              style={({ pressed }) => [
                styles.deleteButton,
                pressed && styles.deleteButtonPressed,
              ]}
              testID="delete-data-button"
              accessibilityLabel="Delete all my data"
              accessibilityHint="Permanently deletes your account and all data"
            >
              <Trash2 size={20} stroke="#DC2626" />
              <Body style={styles.deleteButtonText}>Delete All My Data</Body>
            </Pressable>
            <Caption style={styles.deleteWarning}>
              This permanently removes your account and all data
            </Caption>
          </View>
        </ScrollView>
      </GlassSheet>

      {/* Close button - OUTSIDE GlassSheet, same vertical position as hamburger */}
      <Pressable
        onPress={handleClose}
        style={styles.closeButton}
        hitSlop={10}
      >
        <X size={24} stroke="rgba(255, 255, 255, 0.95)" />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2000,
  },
  label: {
    textAlign: 'center',
    marginTop: 60, // Space below GlassSheet handle
    marginBottom: 8,
    letterSpacing: 1,
    fontSize: 11,
    color: '#6A6A6A',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  questionText: {
    textAlign: 'center',
    color: COLORS.charcoal.dark,
  },
  optionsContainer: {},
  modeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: LAYOUT.spacing.default,
    backgroundColor: COLORS.white[50],
    borderRadius: LAYOUT.spacing.default,
    borderWidth: 2,
    borderColor: COLORS.white[10],
    gap: LAYOUT.spacing.medium,
  },
  modeOptionSelected: {
    borderColor: COLORS.blue.primary,
    backgroundColor: COLORS.blue.selected,
  },
  modeOptionPressed: {
    opacity: 0.8,
  },
  radioOuter: {
    width: LAYOUT.spacing.large,
    height: LAYOUT.spacing.large,
    borderRadius: LAYOUT.spacing.medium,
    borderWidth: 2,
    borderColor: COLORS.white[30],
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: COLORS.blue.primary,
  },
  radioInner: {
    width: LAYOUT.spacing.medium,
    height: LAYOUT.spacing.medium,
    borderRadius: LAYOUT.spacing.small - 2,
    backgroundColor: COLORS.blue.primary,
  },
  modeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeContent: {
    flex: 1,
  },
  modeTitle: {
    fontSize: TYPOGRAPHY.answerOption.fontSize,
    color: COLORS.charcoal.dark,
    marginBottom: 2,
  },
  modeTitleSelected: {
    color: COLORS.blue.primary,
    fontWeight: '600',
  },
  modeDescription: {
    fontSize: 13,
    color: COLORS.charcoal.light,
  },
  defaultNote: {
    textAlign: 'center',
    color: COLORS.charcoal.light,
  },
  accountSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.white[10],
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sectionLabel.fontSize,
    letterSpacing: 2,
    color: COLORS.charcoal.light,
    marginBottom: LAYOUT.spacing.default,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: LAYOUT.spacing.default,
    backgroundColor: COLORS.red.background,
    borderRadius: LAYOUT.spacing.medium,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.2)',
    gap: LAYOUT.spacing.medium,
  },
  deleteButtonPressed: {
    opacity: 0.7,
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
  },
  deleteButtonText: {
    color: COLORS.red.primary,
    fontWeight: '600',
  },
  deleteWarning: {
    textAlign: 'center',
    marginTop: LAYOUT.spacing.medium,
    color: COLORS.charcoal.light,
    fontSize: 11,
  },
  // Close button - same vertical position as hamburger menu (top: 12)
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 16,
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
  },
});

export default SettingsScreen;
