/**
 * GlassInput - Frosted glass text input
 *
 * Used for all form inputs (email, password, name, etc.)
 * Matches Glass design system with BlurView + light tint
 *
 * Based on ChatInput.tsx pattern
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  KeyboardTypeOptions,
  ReturnKeyTypeOptions,
  NativeSyntheticEvent,
  TextInputSubmitEditingEventData,
} from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  autoFocus?: boolean;
  returnKeyType?: ReturnKeyTypeOptions;
  onSubmitEditing?: (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => void;
  editable?: boolean;
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  testID?: string;
  accessibilityLabel?: string;
  /** Accessibility hint for screen readers */
  accessibilityHint?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function GlassInput({
  value,
  onChangeText,
  placeholder = '',
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  autoFocus = false,
  returnKeyType = 'done',
  onSubmitEditing,
  editable = true,
  maxLength,
  multiline = false,
  numberOfLines = 1,
  style,
  inputStyle,
  testID,
  accessibilityLabel,
  accessibilityHint,
  onFocus,
  onBlur,
}: GlassInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleChangeText = (text: string) => {
    // Sanitize input (remove control characters)
    const sanitized = text
      .replace(/[\x00-\x09\x0B-\x1F\x7F-\x9F]/g, '')
      .slice(0, maxLength || 500);

    onChangeText(sanitized);
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  return (
    <BlurView
      intensity={20}
      tint="light"
      style={[
        styles.container,
        multiline && styles.multilineContainer,
        isFocused && styles.focusedContainer,
        !editable && styles.disabledContainer,
        style,
      ]}
    >
      <TextInput
        value={value}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(255, 255, 255, 0.4)"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        autoFocus={autoFocus}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        editable={editable}
        maxLength={maxLength}
        multiline={multiline}
        numberOfLines={multiline ? numberOfLines : 1}
        onFocus={handleFocus}
        onBlur={handleBlur}
        testID={testID}
        accessibilityLabel={accessibilityLabel || placeholder}
        accessibilityHint={accessibilityHint}
        style={[
          styles.input,
          multiline && styles.multilineInput,
          inputStyle,
        ]}
      />
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  multilineContainer: {
    minHeight: 100,
  },
  focusedContainer: {
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  disabledContainer: {
    opacity: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  input: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: 'Merriweather-Regular',
    color: 'rgba(255, 255, 255, 0.95)',
    minHeight: 56,
  },
  multilineInput: {
    paddingTop: 16,
    paddingBottom: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
});

export default GlassInput;
