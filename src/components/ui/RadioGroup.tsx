/**
 * RadioGroup - Single-select option group
 *
 * Used for gender, relationship status, location preferences, etc.
 * Glass aesthetic with pill-shaped buttons
 *
 * Design: Horizontal or vertical layout with active state
 */

import React from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Typography } from './Typography';

export interface RadioOption {
  label: string;
  value: string;
  description?: string;
}

interface RadioGroupProps {
  options: RadioOption[];
  value: string | null;
  onChange: (value: string) => void;
  layout?: 'horizontal' | 'vertical';
  style?: ViewStyle;
  testID?: string;
}

export function RadioGroup({
  options,
  value,
  onChange,
  layout = 'vertical',
  style,
  testID,
}: RadioGroupProps) {
  const handlePress = (optionValue: string) => {
    if (value !== optionValue) {
      onChange(optionValue);
      Haptics.selectionAsync();
    }
  };

  return (
    <View
      style={[
        styles.container,
        layout === 'horizontal' && styles.horizontalContainer,
        style,
      ]}
      testID={testID}
    >
      {options.map((option) => {
        const isSelected = value === option.value;

        return (
          <Pressable
            key={option.value}
            onPress={() => handlePress(option.value)}
            style={[
              styles.optionWrapper,
              layout === 'horizontal' && styles.horizontalOption,
            ]}
          >
            <BlurView
              intensity={isSelected ? 30 : 20}
              tint="light"
              style={[
                styles.option,
                isSelected && styles.selectedOption,
              ]}
            >
              <View style={styles.radio}>
                <View style={styles.radioOuter}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </View>

              <View style={styles.labelContainer}>
                <Typography
                  variant="bodyLarge"
                  style={[
                    styles.label,
                    isSelected && styles.selectedLabel,
                  ]}
                >
                  {option.label}
                </Typography>

                {option.description && (
                  <Typography
                    variant="caption"
                    style={styles.description}
                  >
                    {option.description}
                  </Typography>
                )}
              </View>
            </BlurView>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  horizontalContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionWrapper: {
    flex: 0,
  },
  horizontalOption: {
    flex: 1,
    minWidth: 120,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    gap: 12,
  },
  selectedOption: {
    borderColor: 'rgba(255, 255, 255, 0.4)',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  radio: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  labelContainer: {
    flex: 1,
    gap: 4,
  },
  label: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  selectedLabel: {
    color: 'rgba(255, 255, 255, 0.98)',
  },
  description: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
});

export default RadioGroup;
