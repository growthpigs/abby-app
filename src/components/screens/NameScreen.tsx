/**
 * NameScreen - Name entry for signup
 *
 * Collects user's name during signup flow.
 * Full-screen glass overlay on VibeMatrix
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Typography } from '../ui/Typography';
import { GlassButton } from '../ui/GlassButton';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';

interface NameScreenProps {
  onNext?: (firstName: string, familyName: string) => void;
  onSecretBack?: () => void;
  onSecretForward?: () => void;
}

export const NameScreen: React.FC<NameScreenProps> = ({
  onNext,
  onSecretBack,
  onSecretForward,
}) => {
  const [firstName, setFirstName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const layout = useResponsiveLayout();

  const handleNext = () => {
    if (isValid) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onNext?.(firstName.trim(), familyName.trim());
    }
  };

  const handleSecretBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onSecretBack?.();
  };

  const handleSecretForward = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onSecretForward?.();
  };

  // Name validation: both first and family name required, at least 2 characters each
  const isValid = firstName.trim().length >= 2 && familyName.trim().length >= 2;

  // Responsive padding values
  const contentPaddingTop = layout.isSmallScreen ? 100 : layout.isMediumScreen ? 120 : 140;
  const headlineMarginBottom = layout.isSmallScreen ? 20 : layout.isMediumScreen ? 26 : 32;
  const nicknameLabelMarginTop = layout.isSmallScreen ? 20 : layout.isMediumScreen ? 26 : 32;
  const helpTextMarginTop = layout.isSmallScreen ? 12 : 16;
  const footerBottom = layout.isSmallScreen ? 32 : 48;
  const backButtonTop = layout.isSmallScreen ? 44 : 60;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Back button */}
      <Pressable
        onPress={handleSecretBack}
        style={[styles.backButton, { top: backButtonTop }]}
        hitSlop={20}
      >
        <Typography variant="headline" style={styles.backArrow}>
          ←
        </Typography>
      </Pressable>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: contentPaddingTop,
            paddingHorizontal: layout.paddingHorizontal,
            paddingBottom: footerBottom + 80, // Space for footer button
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Headline */}
        <Typography
          variant="headline"
          style={[styles.headline, { marginBottom: headlineMarginBottom }]}
        >
          What's your{'\n'}first name?
        </Typography>

        {/* First name input */}
        <TextInput
          style={[styles.nameInput, { height: layout.inputHeight }]}
          value={firstName}
          onChangeText={setFirstName}
          placeholder=""
          autoCapitalize="words"
          autoCorrect={false}
          autoFocus={true}
          returnKeyType="next"
          placeholderTextColor="rgba(255, 255, 255, 0.3)"
          maxLength={100}
        />

        {/* Family name section */}
        <Typography
          variant="body"
          style={[styles.nicknameLabel, { marginTop: nicknameLabelMarginTop }]}
        >
          Family Name
        </Typography>
        <TextInput
          style={[styles.nicknameInput, { height: layout.inputHeight }]}
          value={familyName}
          onChangeText={setFamilyName}
          placeholder=""
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={handleNext}
          placeholderTextColor="rgba(255, 255, 255, 0.3)"
          maxLength={100}
        />

        {/* Help text */}
        <View style={[styles.helpTextContainer, { marginTop: helpTextMarginTop }]}>
          <Typography variant="caption" style={styles.helpText}>
            Both first and last name are required
          </Typography>
        </View>
      </ScrollView>

      {/* Fixed footer with Continue button */}
      <View
        style={[
          styles.footer,
          {
            bottom: footerBottom,
            paddingHorizontal: layout.paddingHorizontal,
          },
        ]}
      >
        <GlassButton
          onPress={handleNext}
          disabled={!isValid}
          variant="primary"
        >
          Continue
        </GlassButton>
      </View>

      {/* Secret navigation triggers */}
      <Pressable
        onPress={handleSecretBack}
        style={styles.secretBackTrigger}
        hitSlop={10}
      />
      <Pressable
        onPress={handleNext}
        disabled={!isValid}
        style={styles.secretMiddleTrigger}
        hitSlop={10}
      />
      <Pressable
        onPress={handleSecretForward}
        style={styles.secretForwardTrigger}
        hitSlop={10}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    left: 24,
    zIndex: 10,
  },
  backArrow: {
    fontSize: 32,
    color: 'rgba(255, 255, 255, 0.95)',
  },
  content: {
    flexGrow: 1,
  },
  headline: {
    fontSize: 32,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  nameInput: {
    width: '100%',
    paddingHorizontal: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '500',
    letterSpacing: 0,
    textAlign: 'left',
  },
  nicknameLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  nicknameInput: {
    width: '100%',
    paddingHorizontal: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '500',
    letterSpacing: 0,
    textAlign: 'left',
  },
  helpTextContainer: {},
  helpText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  secretBackTrigger: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 70,
    height: 70,
    zIndex: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  secretMiddleTrigger: {
    position: 'absolute',
    top: 10,
    left: '50%',
    marginLeft: -35,
    width: 70,
    height: 70,
    zIndex: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  secretForwardTrigger: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 70,
    height: 70,
    zIndex: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
});

export default NameScreen;
