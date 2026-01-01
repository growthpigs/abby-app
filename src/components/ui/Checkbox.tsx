/**
 * Checkbox - Single checkbox with label
 *
 * Used for terms/conditions, permissions, preferences
 * Glass aesthetic with checkmark animation
 *
 * Design: Inline checkbox + tappable label
 */

import React from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Typography } from './Typography';
import { Check } from 'lucide-react-native';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  testID?: string;
  accessibilityLabel?: string;
}

export function Checkbox({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  style,
  labelStyle,
  testID,
  accessibilityLabel,
}: CheckboxProps) {
  const handlePress = () => {
    if (!disabled) {
      onChange(!checked);
      Haptics.selectionAsync();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={[styles.container, disabled && styles.disabled, style]}
      testID={testID}
      accessibilityLabel={accessibilityLabel || label}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
    >
      <BlurView
        intensity={checked ? 30 : 20}
        tint="light"
        style={[
          styles.box,
          checked && styles.checkedBox,
          disabled && styles.disabledBox,
        ]}
      >
        {checked && (
          <Check
            size={16}
            color="rgba(255, 255, 255, 0.95)"
            strokeWidth={3}
          />
        )}
      </BlurView>

      <View style={styles.labelContainer}>
        <Typography
          variant="body"
          style={[
            styles.label,
            disabled && styles.disabledLabel,
            labelStyle,
          ]}
        >
          {label}
        </Typography>

        {description && (
          <Typography
            variant="caption"
            style={[
              styles.description,
              disabled && styles.disabledLabel,
            ]}
          >
            {description}
          </Typography>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  disabled: {
    opacity: 0.5,
  },
  box: {
    width: 24,
    height: 24,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2, // Align with first line of text
  },
  checkedBox: {
    borderColor: 'rgba(255, 255, 255, 0.6)',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  disabledBox: {
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  labelContainer: {
    flex: 1,
    gap: 4,
  },
  label: {
    color: '#FFFFFF',
    lineHeight: 20,
  },
  disabledLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  description: {
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 11,
  },
});

export default Checkbox;
