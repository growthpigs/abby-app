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
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Send } from 'lucide-react-native';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Message Abby...',
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

  const canSend = message.trim().length > 0 && !disabled;

  return (
    <View style={styles.container}>
      <BlurView intensity={40} tint="light" style={styles.blurContainer}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder={placeholder}
            placeholderTextColor="rgba(0, 0, 0, 0.4)"
            multiline
            maxLength={500}
            editable={!disabled}
            blurOnSubmit={false}
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
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 8 : 12,
  },

  blurContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    // Subtle shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },

  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Merriweather_400Regular',
    maxHeight: 100,
    color: 'rgba(0, 0, 0, 0.85)',
    paddingVertical: 6,
    paddingRight: 8,
  },

  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  sendButtonActive: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
});

export default ChatInput;
