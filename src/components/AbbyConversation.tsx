/**
 * AbbyConversation - Voice Conversation UI
 *
 * Minimal UI for testing the ElevenLabs voice agent.
 * Shows mic button + conversation status + transcripts.
 *
 * Integrates with:
 * - useAbbyAgent hook for conversation control
 * - VibeController for orb animation (via AbbyAgent)
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useAbbyAgent } from '../services/AbbyAgent';

interface AbbyConversationProps {
  onClose?: () => void;
}

export const AbbyConversation: React.FC<AbbyConversationProps> = ({
  onClose,
}) => {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [abbyText, setAbbyText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const agent = useAbbyAgent({
    onUserTranscript: useCallback((text: string) => {
      setTranscript(text);
    }, []),
    onAbbyResponse: useCallback((text: string) => {
      setAbbyText(text);
      setTranscript(''); // Clear user transcript when Abby responds
    }, []),
    onError: useCallback((err: Error) => {
      setError(err.message);
      setIsLoading(false);
      setIsActive(false);
    }, []),
    onConnect: useCallback(() => {
      setIsLoading(false);
      setIsActive(true);
    }, []),
    onDisconnect: useCallback(() => {
      setIsActive(false);
      setIsLoading(false);
    }, []),
  });

  const toggleConversation = async () => {
    try {
      setError(null);

      if (isActive) {
        // End conversation
        setIsLoading(true);
        await agent.endConversation();
        setIsActive(false);
        setIsLoading(false);
        setTranscript('');
        setAbbyText('');
      } else {
        // Start conversation
        setIsLoading(true);
        await agent.startConversation();
        // onConnect callback will set isActive and clear isLoading
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Close button */}
      {onClose && (
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>x</Text>
        </TouchableOpacity>
      )}

      {/* Conversation transcript */}
      {(transcript || abbyText) && (
        <BlurView intensity={40} tint="dark" style={styles.bubble}>
          {abbyText && (
            <View style={styles.abbyRow}>
              <Text style={styles.label}>Abby</Text>
              <Text style={styles.abbyText}>{abbyText}</Text>
            </View>
          )}
          {transcript && (
            <View style={styles.userRow}>
              <Text style={styles.label}>You</Text>
              <Text style={styles.userText}>{transcript}</Text>
            </View>
          )}
        </BlurView>
      )}

      {/* Error display */}
      {error && (
        <BlurView intensity={60} tint="dark" style={styles.errorBubble}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => setError(null)}>
            <Text style={styles.dismissText}>Dismiss</Text>
          </TouchableOpacity>
        </BlurView>
      )}

      {/* Mic button */}
      <TouchableOpacity
        style={[
          styles.micButton,
          isActive && styles.micButtonActive,
          isLoading && styles.micButtonLoading,
        ]}
        onPress={toggleConversation}
        disabled={isLoading}
        activeOpacity={0.7}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.micIcon}>{isActive ? '||' : '|||'}</Text>
        )}
      </TouchableOpacity>

      {/* Status label */}
      <Text style={styles.status}>
        {isLoading
          ? 'Connecting...'
          : isActive
          ? agent.isSpeaking
            ? 'Abby is speaking...'
            : 'Listening...'
          : 'Tap to talk'}
      </Text>

      {/* Speaking indicator */}
      {isActive && agent.isSpeaking && (
        <View style={styles.speakingIndicator}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: -40,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '300',
  },
  bubble: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    width: '100%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  abbyRow: {
    marginBottom: 12,
  },
  userRow: {
    opacity: 0.7,
  },
  label: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  userText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    lineHeight: 20,
  },
  abbyText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 24,
  },
  errorBubble: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.5)',
  },
  errorText: {
    color: '#f87171',
    fontSize: 14,
    marginBottom: 8,
  },
  dismissText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    textAlign: 'right',
  },
  micButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  micButtonActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    borderColor: 'rgba(16, 185, 129, 0.6)',
  },
  micButtonLoading: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.15)',
  },
  micIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 2,
  },
  status: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    marginTop: 12,
    fontWeight: '500',
  },
  speakingIndicator: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(16, 185, 129, 0.8)',
  },
  dot1: {
    // Animation handled by React Native Animated or Reanimated if needed
  },
  dot2: {},
  dot3: {},
});

export default AbbyConversation;
