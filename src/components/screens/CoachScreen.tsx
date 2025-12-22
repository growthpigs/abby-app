/**
 * CoachScreen - Free-form conversation with Abby
 *
 * Same visual pattern as InterviewScreen but uses ElevenLabs Agent
 * for natural two-way conversation instead of scripted questions.
 *
 * UI Layout:
 * - Top: Conversation status
 * - Middle: Chat card with glassmorphic backing
 * - Bottom: Voice controls + End Chat button
 */

import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useDemoStore } from '../../store/useDemoStore';
import { useVibeController } from '../../store/useVibeController';
import { useSettingsStore } from '../../store/useSettingsStore';
import { ConversationOverlay } from '../ui/ConversationOverlay';
import { useAbbyAgent } from '../../services/AbbyAgent';

export interface CoachScreenProps {
  onBackgroundChange?: (index: number) => void;
}

export const CoachScreen: React.FC<CoachScreenProps> = ({
  onBackgroundChange,
}) => {
  const messages = useDemoStore((state) => state.messages);
  const addMessage = useDemoStore((state) => state.addMessage);
  const reset = useDemoStore((state) => state.reset);
  const inputMode = useSettingsStore((state) => state.inputMode);

  const [agentStatus, setAgentStatus] = useState<string>('Connecting...');
  const [abbyText, setAbbyText] = useState<string>('');

  // Initialize ElevenLabs Agent
  const { startConversation, endConversation, isSpeaking, status, isConnected } = useAbbyAgent({
    enabled: true, // Always enabled in COACH mode
    onAbbyResponse: (text) => {
      setAbbyText(text);
      addMessage('abby', text);
    },
    onUserTranscript: (text) => {
      addMessage('user', text);
    },
    onConnect: () => {
      setAgentStatus('Connected');
    },
    onDisconnect: () => {
      setAgentStatus('Disconnected');
    },
    onError: (error) => {
      setAgentStatus(`Error: ${error.message}`);
    },
  });

  // Set background to beautiful shader for COACH mode
  useEffect(() => {
    if (onBackgroundChange) {
      onBackgroundChange(5); // Liquid Marble - calming for conversation
    }
  }, [onBackgroundChange]);

  // Auto-start conversation when screen mounts
  useEffect(() => {
    const initConversation = async () => {
      try {
        await startConversation();
      } catch (err) {
        console.warn('[Coach] Failed to start conversation:', err);
        setAgentStatus('Failed to connect');
      }
    };
    initConversation();

    // Cleanup on unmount
    return () => {
      endConversation();
    };
  }, []);

  // End chat and reset
  const handleEndChat = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await endConversation();
    reset(); // Go back to ONBOARDING
  }, [endConversation, reset]);

  return (
    <View style={styles.container}>
      {/* Middle: Chat status card */}
      <View style={styles.middleSection}>
        <Animated.View entering={FadeIn.duration(300)}>
          <BlurView intensity={60} tint="dark" style={styles.chatCard}>
            {isSpeaking ? (
              <Text style={styles.chatText}>
                {abbyText || 'Abby is speaking...'}
              </Text>
            ) : (
              <Text style={styles.chatText}>
                {isConnected
                  ? "I'm listening. Tell me what's on your mind."
                  : agentStatus}
              </Text>
            )}
          </BlurView>
        </Animated.View>

        {/* Connection status indicator */}
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusDot,
            isConnected ? styles.statusConnected : styles.statusDisconnected
          ]} />
          <Text style={styles.statusText}>
            {isConnected ? 'Live' : agentStatus}
          </Text>
        </View>
      </View>

      {/* Bottom: Speaking indicator + End Chat button */}
      <View style={styles.bottomSection}>
        {/* Speaking indicator */}
        {isSpeaking && (
          <View style={styles.speakingIndicator}>
            <Text style={styles.speakingText}>Abby is speaking...</Text>
          </View>
        )}

        {/* End Chat button */}
        <Pressable
          onPress={handleEndChat}
          style={({ pressed }) => [
            styles.endButton,
            pressed && styles.endButtonPressed,
          ]}
        >
          <BlurView intensity={60} tint="dark" style={styles.buttonBlur}>
            <Text style={styles.buttonText}>End Chat</Text>
          </BlurView>
        </Pressable>
      </View>

      {/* Conversation Overlay - scrolling chat transcript */}
      <ConversationOverlay
        messages={messages}
        inputMode={inputMode}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },

  // MIDDLE - Chat card
  middleSection: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 10,
  },
  chatCard: {
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  chatText: {
    fontFamily: 'Merriweather_400Regular',
    fontSize: 18,
    lineHeight: 28,
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusConnected: {
    backgroundColor: '#10B981', // Green
  },
  statusDisconnected: {
    backgroundColor: '#EF4444', // Red
  },
  statusText: {
    fontFamily: 'Merriweather_400Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },

  // BOTTOM - Speaking indicator + End button
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
    gap: 16,
  },
  speakingIndicator: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  speakingText: {
    fontFamily: 'Merriweather_400Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
  },
  endButton: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  endButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonBlur: {
    paddingVertical: 16,
    paddingHorizontal: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  buttonText: {
    fontFamily: 'Merriweather_400Regular',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default CoachScreen;
