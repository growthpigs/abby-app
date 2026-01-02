/**
 * SettingsScreen - Input Mode Selection
 *
 * Per settings-spec.md: ONLY input mode selection for MVP.
 * V2 will add notifications, voice customization, privacy, accessibility.
 *
 * 3 modes: voice only, text only, voice+text (default)
 */

import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Mic, MessageSquare, Trash2 } from 'lucide-react-native';
import { AuthService } from '../../services/AuthService';
import { Headline, Body, Caption } from '../ui/Typography';
import { useSettingsStore, InputMode } from '../../store/useSettingsStore';

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
              // TODO: Call DELETE /v1/profile when API endpoint is available
              // For now, just logout to clear local data
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

  return (
    <View style={styles.container}>
      <BlurView intensity={90} tint="light" style={styles.blurContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Caption style={styles.headerTitle}>SETTINGS</Caption>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Body style={styles.closeText}>Done</Body>
          </Pressable>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Headline style={styles.questionText}>
            How do you want to talk with Abby?
          </Headline>

          <View style={styles.optionsContainer}>
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

          <Caption style={styles.defaultNote}>
            Default is Voice + Text
          </Caption>

          {/* Account Section - GDPR Compliance */}
          <View style={styles.accountSection}>
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
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2000,
  },
  blurContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  headerTitle: {
    fontSize: 12,
    letterSpacing: 3,
    color: 'rgba(0, 0, 0, 0.5)',
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  closeText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  questionText: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 32,
    color: 'rgba(0, 0, 0, 0.85)',
  },
  optionsContainer: {
    gap: 12,
  },
  modeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    gap: 12,
  },
  modeOptionSelected: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
  modeOptionPressed: {
    opacity: 0.8,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: '#3B82F6',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
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
    fontSize: 17,
    color: 'rgba(0, 0, 0, 0.85)',
    marginBottom: 2,
  },
  modeTitleSelected: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  modeDescription: {
    fontSize: 13,
    color: 'rgba(0, 0, 0, 0.5)',
  },
  defaultNote: {
    textAlign: 'center',
    marginTop: 24,
    color: 'rgba(0, 0, 0, 0.4)',
  },
  accountSection: {
    marginTop: 48,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  sectionTitle: {
    fontSize: 12,
    letterSpacing: 2,
    color: 'rgba(0, 0, 0, 0.5)',
    marginBottom: 16,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.2)',
    gap: 12,
  },
  deleteButtonPressed: {
    opacity: 0.7,
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
  },
  deleteButtonText: {
    color: '#DC2626',
    fontWeight: '600',
  },
  deleteWarning: {
    textAlign: 'center',
    marginTop: 12,
    color: 'rgba(0, 0, 0, 0.4)',
    fontSize: 11,
  },
});

export default SettingsScreen;
