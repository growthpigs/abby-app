/**
 * NameScreen - Full name + Nickname entry
 *
 * Screen 4 in client onboarding spec.
 * Full name is private (not shown to matches).
 * Nickname/first name appears on profile.
 */

import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Typography } from '../ui/Typography';

interface NameScreenProps {
  onNext?: (fullName: string, nickname: string) => void;
  onSecretBack?: () => void;
  onSecretForward?: () => void;
}

export const NameScreen: React.FC<NameScreenProps> = ({
  onNext,
  onSecretBack,
  onSecretForward,
}) => {
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const nicknameRef = useRef<TextInput>(null);

  const handleNext = () => {
    if (isValid) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onNext?.(fullName.trim(), nickname.trim());
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

  const handleFullNameSubmit = () => {
    nicknameRef.current?.focus();
  };

  // Validation: both fields required, min 1 char each
  const isValid = fullName.trim().length > 0 && nickname.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Full-screen glass overlay */}
      <View style={styles.glassOverlay} />

      {/* Back button */}
      <Pressable
        onPress={handleSecretBack}
        style={styles.backButton}
        hitSlop={20}
      >
        <Typography variant="headline" style={styles.backArrow}>
          ←
        </Typography>
      </Pressable>

      {/* Content */}
      <View style={styles.content}>
        {/* Headline */}
        <Typography variant="headline" style={styles.headline}>
          What's your{'\n'}name?
        </Typography>

        {/* Full name input */}
        <View style={styles.inputGroup}>
          <Typography variant="body" style={styles.inputLabel}>
            Full name
          </Typography>
          <TextInput
            style={styles.textInput}
            value={fullName}
            onChangeText={setFullName}
            placeholder=""
            autoCapitalize="words"
            autoCorrect={false}
            autoFocus={true}
            returnKeyType="next"
            onSubmitEditing={handleFullNameSubmit}
            placeholderTextColor="rgba(255, 255, 255, 0.3)"
          />
          <Typography variant="caption" style={styles.inputHint}>
            This won't appear anywhere on your profile
          </Typography>
        </View>

        {/* Nickname input */}
        <View style={styles.inputGroup}>
          <Typography variant="body" style={styles.inputLabel}>
            Nickname / First name
          </Typography>
          <TextInput
            ref={nicknameRef}
            style={styles.textInput}
            value={nickname}
            onChangeText={setNickname}
            placeholder=""
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleNext}
            placeholderTextColor="rgba(255, 255, 255, 0.3)"
          />
          <Typography variant="caption" style={styles.inputHint}>
            This will appear on your profile
          </Typography>
        </View>
      </View>

      {/* Secret navigation triggers */}
      <Pressable
        onPress={handleSecretBack}
        style={styles.secretBackTrigger}
        hitSlop={0}
      />
      <Pressable
        onPress={handleNext}
        disabled={!isValid}
        style={styles.secretMiddleTrigger}
        hitSlop={0}
      />
      <Pressable
        onPress={handleSecretForward}
        style={styles.secretForwardTrigger}
        hitSlop={0}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 10,
  },
  backArrow: {
    fontSize: 32,
    color: 'rgba(255, 255, 255, 0.95)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 140,
    paddingBottom: 48,
  },
  headline: {
    fontSize: 32,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 40,
    letterSpacing: -0.5,
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  textInput: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '400',
  },
  inputHint: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 8,
    fontStyle: 'italic',
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
