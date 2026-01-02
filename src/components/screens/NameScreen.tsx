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
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Typography } from '../ui/Typography';
import { GlassButton } from '../ui/GlassButton';

interface NameScreenProps {
  onNext?: (name: string, nickname: string) => void;
  onSecretBack?: () => void;
  onSecretForward?: () => void;
}

export const NameScreen: React.FC<NameScreenProps> = ({
  onNext,
  onSecretBack,
  onSecretForward,
}) => {
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');

  const handleNext = () => {
    if (isValid) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // Pass nickname or fall back to first name
      const displayName = nickname.trim() || name.trim();
      onNext?.(name.trim(), displayName);
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

  // Name validation: at least 2 characters
  const isValid = name.trim().length >= 2;

  return (
    <View style={styles.container}>
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
          What's your{'\n'}first name?
        </Typography>

        {/* Name input */}
        <TextInput
          style={styles.nameInput}
          value={name}
          onChangeText={setName}
          placeholder=""
          autoCapitalize="words"
          autoCorrect={false}
          autoFocus={true}
          returnKeyType="next"
          placeholderTextColor="rgba(255, 255, 255, 0.3)"
          maxLength={100}
        />

        {/* Nickname section */}
        <Typography variant="body" style={styles.nicknameLabel}>
          Nickname (optional)
        </Typography>
        <TextInput
          style={styles.nicknameInput}
          value={nickname}
          onChangeText={setNickname}
          placeholder="What should we call you?"
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={handleNext}
          placeholderTextColor="rgba(255, 255, 255, 0.3)"
          maxLength={100}
        />

        {/* Help text */}
        <View style={styles.helpTextContainer}>
          <Typography variant="caption" style={styles.helpText}>
            This is how you'll appear to your matches
          </Typography>
        </View>
      </View>

      {/* Fixed footer with Continue button */}
      <View style={styles.footer}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  nameInput: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '500',
  },
  nicknameLabel: {
    marginTop: 32,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  nicknameInput: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '500',
  },
  helpTextContainer: {
    marginTop: 16,
  },
  helpText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 48,
    left: 24,
    right: 24,
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
