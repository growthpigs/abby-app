/**
 * ChatInput - Liquid Glass chat input for Abby
 *
 * Frosted white glass effect using expo-blur with light tint.
 * Pill-shaped input with Send icon button.
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Send } from 'lucide-react-native';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  onFocus?: () => void;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Reply to Abby...',
  onFocus,
}: ChatInputProps) {
  const [message, setMessage] = useState('');

  // Sanitize input: remove control chars, limit whitespace
  const sanitizeInput = (text: string): string => {
    return text
      .trim()
      .replace(/[\x00-\x09\x0B-\x1F\x7F-\x9F]/g, '') // Remove control chars (keep \n)
      .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines
      .replace(/[ \t]{3,}/g, '  ') // Max 2 consecutive spaces
      .slice(0, 500); // Hard limit
  };

  const handleSend = () => {
    const sanitized = sanitizeInput(message);
    if (sanitized.length > 0 && !disabled) {
      onSend(sanitized);
      setMessage('');
    }
  };

  // Handle Enter key to submit (desktop keyboard or mobile "done" button)
  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (e.nativeEvent.key === 'Enter') {
      e.preventDefault?.();
      handleSend();
    }
  };

  const canSend = message.trim().length > 0 && !disabled;

  return (
    <View style={styles.container}>
      <BlurView intensity={80} tint="light" style={styles.blurContainer}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            onFocus={onFocus}
            onKeyPress={handleKeyPress}
            onSubmitEditing={handleSend}
            placeholder={placeholder}
            placeholderTextColor="rgba(0, 0, 0, 0.4)"
            multiline={false}
            maxLength={500}
            editable={!disabled}
            blurOnSubmit={true}
            returnKeyType="send"
            accessibilityLabel="Message input"
            accessibilityHint="Type a message to send to Abby"
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              canSend && styles.sendButtonActive,
            ]}
            onPress={handleSend}
            disabled={!canSend}
            activeOpacity={0.7}
            accessibilityLabel="Send message"
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSend }}
          >
            <Send
              size={18}
              color={canSend ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.3)'}
            />
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Outer shadow for floating effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },

  blurContainer: {
    borderRadius: 28, // Match login buttons
    overflow: 'hidden',
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    minHeight: 56, // Match login button height
    // iOS Liquid Glass: subtle transparent white that lets background shine through
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },

  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Merriweather_400Regular',
    color: 'rgba(0, 0, 0, 0.85)',
    paddingVertical: 8,
    paddingRight: 12,
    letterSpacing: 0,
    textAlign: 'left',
  },

  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sendButtonActive: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
});

export default ChatInput;
