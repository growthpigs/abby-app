/**
 * SettingsScreen - Input Mode Selection
 *
 * Simple settings screen allowing users to choose their preferred input mode:
 * - Voice only: Just speak, no text display
 * - Text only: Full screen text, no voice
 * - Voice + Text: Speak and see transcript (default)
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import {
  useSettingsStore,
  InputMode,
} from '../../store/useSettingsStore';

interface InputModeOptionProps {
  mode: InputMode;
  label: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
}

const InputModeOption: React.FC<InputModeOptionProps> = ({
  label,
  description,
  isSelected,
  onSelect,
}) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.optionContainer,
        pressed && styles.optionPressed,
      ]}
    >
      <BlurView
        intensity={60}
        tint="dark"
        style={[styles.optionBlur, isSelected && styles.optionSelected]}
      >
        <View style={styles.optionContent}>
          <View style={styles.radioContainer}>
            <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
              {isSelected && <View style={styles.radioInner} />}
            </View>
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
              {label}
            </Text>
            <Text style={styles.optionDescription}>{description}</Text>
          </View>
        </View>
      </BlurView>
    </Pressable>
  );
};

interface SettingsScreenProps {
  onClose: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onClose }) => {
  const inputMode = useSettingsStore((state) => state.inputMode);
  const setInputMode = useSettingsStore((state) => state.setInputMode);

  const handleSelectMode = async (mode: InputMode) => {
    await setInputMode(mode);
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <BlurView intensity={60} tint="dark" style={styles.headerBlur}>
          <Text style={styles.headerText}>How do you want{'\n'}to talk with Abby?</Text>
        </BlurView>
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        <InputModeOption
          mode="voice_only"
          label="Voice only"
          description="Just speak - no text on screen"
          isSelected={inputMode === 'voice_only'}
          onSelect={() => handleSelectMode('voice_only')}
        />

        <InputModeOption
          mode="voice_and_text"
          label="Voice + Text"
          description="Speak and see the conversation"
          isSelected={inputMode === 'voice_and_text'}
          onSelect={() => handleSelectMode('voice_and_text')}
        />

        <InputModeOption
          mode="text_only"
          label="Text only"
          description="Type your responses"
          isSelected={inputMode === 'text_only'}
          onSelect={() => handleSelectMode('text_only')}
        />
      </View>

      {/* Continue button */}
      <View style={styles.buttonContainer}>
        <Pressable
          onPress={handleContinue}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
        >
          <BlurView intensity={80} tint="light" style={styles.buttonBlur}>
            <Text style={styles.buttonText}>Continue</Text>
          </BlurView>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  headerContainer: {
    marginBottom: 32,
    borderRadius: 20,
    overflow: 'hidden',
  },
  headerBlur: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  headerText: {
    fontFamily: 'Merriweather_400Regular',
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 32,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  optionsContainer: {
    gap: 12,
  },
  optionContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  optionPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  optionBlur: {
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
  },
  optionSelected: {
    borderColor: 'rgba(255, 255, 255, 0.4)',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioContainer: {
    marginRight: 16,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: '#FFFFFF',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  textContainer: {
    flex: 1,
  },
  optionLabel: {
    fontFamily: 'Merriweather_400Regular',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },
  optionLabelSelected: {
    color: '#FFFFFF',
  },
  optionDescription: {
    fontFamily: 'Merriweather_400Regular',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  buttonContainer: {
    marginTop: 32,
    alignItems: 'center',
  },
  button: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonBlur: {
    paddingVertical: 16,
    paddingHorizontal: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  buttonText: {
    fontFamily: 'Merriweather_400Regular',
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
  },
});

export default SettingsScreen;
