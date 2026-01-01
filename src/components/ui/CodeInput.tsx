/**
 * CodeInput - 6-digit verification code input
 *
 * Used for email verification after signup
 * Displays 6 individual digit boxes with auto-focus progression
 *
 * Design: Glass aesthetic with individual frosted boxes
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ViewStyle,
  Pressable,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

interface CodeInputProps {
  value: string; // 6-digit string
  onChangeText: (code: string) => void;
  onComplete?: (code: string) => void;
  autoFocus?: boolean;
  editable?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export function CodeInput({
  value,
  onChangeText,
  onComplete,
  autoFocus = false,
  editable = true,
  style,
  testID,
}: CodeInputProps) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(autoFocus ? 0 : null);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Ensure value is always 6 characters (pad with empty strings)
  const digits = (value + '      ').slice(0, 6).split('');

  useEffect(() => {
    // Auto-complete callback when 6 digits entered
    if (value.length === 6 && onComplete) {
      onComplete(value);
    }
  }, [value, onComplete]);

  const handleChangeText = (text: string, index: number) => {
    // Only allow digits
    const sanitized = text.replace(/[^0-9]/g, '');

    if (sanitized.length === 0) {
      // Backspace - remove current digit
      const newValue = digits.map((d, i) => (i === index ? '' : d)).join('').trim();
      onChangeText(newValue);

      // Focus previous input
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }

      Haptics.selectionAsync();
    } else if (sanitized.length === 1) {
      // Single digit - update and move to next
      const newDigits = [...digits];
      newDigits[index] = sanitized;
      const newValue = newDigits.join('').trim();
      onChangeText(newValue);

      // Focus next input
      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      } else {
        // Last digit - blur to trigger keyboard dismiss
        inputRefs.current[index]?.blur();
      }

      Haptics.selectionAsync();
    } else if (sanitized.length > 1) {
      // Paste or multi-digit - fill from current position
      const pasteDigits = sanitized.slice(0, 6 - index).split('');
      const newDigits = [...digits];
      pasteDigits.forEach((d, i) => {
        if (index + i < 6) {
          newDigits[index + i] = d;
        }
      });
      const newValue = newDigits.join('').trim();
      onChangeText(newValue);

      // Focus next empty or last
      const nextEmpty = newDigits.findIndex((d, i) => i > index && d === ' ');
      if (nextEmpty !== -1 && nextEmpty < 6) {
        inputRefs.current[nextEmpty]?.focus();
      } else {
        inputRefs.current[5]?.blur();
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
    Haptics.selectionAsync();
  };

  const handleBlur = () => {
    setFocusedIndex(null);
  };

  const handleBoxPress = (index: number) => {
    if (editable) {
      inputRefs.current[index]?.focus();
    }
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      {digits.map((digit, index) => {
        const isFocused = focusedIndex === index;
        const hasValue = digit.trim().length > 0;

        return (
          <Pressable
            key={index}
            onPress={() => handleBoxPress(index)}
            style={styles.boxWrapper}
          >
            <BlurView
              intensity={20}
              tint="light"
              style={[
                styles.box,
                isFocused && styles.focusedBox,
                hasValue && styles.filledBox,
                !editable && styles.disabledBox,
              ]}
            >
              <TextInput
                ref={(ref) => { inputRefs.current[index] = ref; }}
                value={digit.trim()}
                onChangeText={(text) => handleChangeText(text, index)}
                onFocus={() => handleFocus(index)}
                onBlur={handleBlur}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                editable={editable}
                autoFocus={autoFocus && index === 0}
                style={styles.input}
                textAlign="center"
                accessibilityLabel={`Digit ${index + 1} of 6`}
              />
            </BlurView>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  boxWrapper: {
    flex: 1,
  },
  box: {
    height: 64,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusedBox: {
    borderColor: 'rgba(255, 255, 255, 0.4)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  filledBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  disabledBox: {
    opacity: 0.5,
  },
  input: {
    fontSize: 28,
    fontFamily: 'JetBrainsMono-Regular',
    color: 'rgba(255, 255, 255, 0.95)',
    width: '100%',
    height: '100%',
    padding: 0,
  },
});

export default CodeInput;
