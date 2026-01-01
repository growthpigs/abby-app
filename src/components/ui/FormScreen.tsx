/**
 * FormScreen - Keyboard-aware screen wrapper
 *
 * Handles keyboard management and safe areas for all form screens
 * Ensures inputs don't get hidden behind keyboard
 *
 * Usage: Wrap any screen with form inputs
 */

import React, { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  ViewStyle,
  View,
} from 'react-native';

interface FormScreenProps {
  children: ReactNode;
  scrollEnabled?: boolean;
  keyboardVerticalOffset?: number;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  testID?: string;
}

export function FormScreen({
  children,
  scrollEnabled = true,
  keyboardVerticalOffset = 0,
  style,
  contentContainerStyle,
  testID,
}: FormScreenProps) {
  const content = scrollEnabled ? (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    children
  );

  return (
    <View style={[styles.safeArea, style]} testID={testID}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
        {content}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
});

export default FormScreen;
