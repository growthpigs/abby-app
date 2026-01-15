/**
 * CoachScreen - Free-form conversation with Abby (end screen)
 *
 * Same visual pattern as CoachIntroScreen but for post-interview conversation.
 * Uses useDraggableSheet hook for bottom sheet behavior.
 * Snap points at 35%, 55%, 75%, 90% of screen height.
 *
 * DYNAMIC VIBES: Background changes based on conversation emotion.
 * Uses EmotionVibeService to detect emotions from Abby's responses.
 */

import React, { useCallback, useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  ScrollView,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Pause, Play } from 'lucide-react-native';
import { useDemoStore } from '../../store/useDemoStore';
import { useAbbyAgent } from '../../services/AbbyRealtimeService';
import { ChatInput } from '../ui/ChatInput';
import { useDraggableSheet } from '../../hooks/useDraggableSheet';
import { analyzeTextForVibe } from '../../services/EmotionVibeService';
import { VibeColorTheme, VibeComplexity } from '../../types/vibe';
import { SHEET_SNAP_POINTS, SHEET_DEFAULT_SNAP } from '../../constants/layout';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface CoachScreenProps {
  onBackgroundChange?: (index: number) => void;
  onVibeChange?: (theme: VibeColorTheme, complexity: VibeComplexity) => void;
  onSecretBack?: () => void;
  onSecretForward?: () => void;
}

export interface CoachScreenRef {
  expandSheet: () => void;
}

export const CoachScreen = forwardRef<CoachScreenRef, CoachScreenProps>(
  ({
    onBackgroundChange,
    onVibeChange,
    onSecretBack,
    onSecretForward,
  }, ref) => {
  const scrollRef = useRef<ScrollView>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Responsive layout for smaller iPhone screens
  const layout = useResponsiveLayout();

  const messages = useDemoStore((state) => state.messages);
  const addMessage = useDemoStore((state) => state.addMessage);
  const reset = useDemoStore((state) => state.reset);

  const [agentStatus, setAgentStatus] = useState<string>('Connecting...');

  // Use draggable sheet hook (replaces manual pan responder + snap logic)
  // Uses centralized constants from layout.ts - SINGLE SOURCE OF TRUTH
  const { translateY, panHandlers, animateIn, snapTo } = useDraggableSheet({
    snapPoints: [...SHEET_SNAP_POINTS],
    defaultSnap: SHEET_DEFAULT_SNAP,
  });

  // Safe scroll helper - clears previous timeout to prevent memory leaks
  const scrollToTop = useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }, 100);
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Initialize Abby conversation (OpenAI Realtime API)
  const { startConversation, endConversation, toggleMute, sendTextMessage, isSpeaking, isConnected, isMuted } = useAbbyAgent({
    enabled: true,
    onAbbyResponse: (text) => {
      addMessage('abby', text);
      scrollToTop();

      // Detect emotion from Abby's response and trigger dynamic vibe change
      const vibeConfig = analyzeTextForVibe(text);
      onBackgroundChange?.(vibeConfig.backgroundIndex);
      onVibeChange?.(vibeConfig.theme, vibeConfig.complexity);
    },
    onUserTranscript: (text) => {
      // Dedup: Don't add if last user message has same text (prevents double-add from typed input)
      const lastUserMsg = messages.filter(m => m.speaker === 'user').pop();
      if (lastUserMsg?.text === text) {
        return; // Already added by handleSendMessage
      }
      addMessage('user', text);
      scrollToTop();
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

  // Set background to Liquid Marble shader
  useEffect(() => {
    if (onBackgroundChange) {
      onBackgroundChange(5); // Liquid Marble - calming for conversation
    }
  }, [onBackgroundChange]);

  // Animate sheet in on mount
  useEffect(() => {
    animateIn();
  }, [animateIn]);

  // Auto-start conversation when screen mounts
  useEffect(() => {
    const initConversation = async () => {
      try {
        await startConversation();
      } catch (err) {
        if (__DEV__) console.warn('[Coach] Failed to start conversation:', err);
        setAgentStatus('Failed to connect');
      }
    };
    initConversation();

    // Cleanup on unmount - must handle async gracefully
    return () => {
      endConversation().catch((err) => {
        // Cleanup errors are expected if session already ended
        if (typeof __DEV__ !== 'undefined' && __DEV__) console.debug('[Coach] Cleanup:', err?.message || 'session ended');
      });
    };
  }, []);

  // End chat and reset demo
  const handleEndChat = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await endConversation();
    reset(); // Go back to COACH_INTRO
  }, [endConversation, reset]);

  // Handle mute/unmute
  const handleToggleMute = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await toggleMute();
  }, [toggleMute]);

  // Handle sending text message
  const handleSendMessage = useCallback((text: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Add user message to conversation display
    addMessage('user', text);
    // Send to Abby agent (with error handling)
    sendTextMessage(text).catch((err) => {
      if (__DEV__) {
        console.warn('[CoachScreen] sendTextMessage failed:', err);
      }
      // Could add user-visible error feedback here in future
    });
    // Scroll to show newest message
    scrollToTop();
  }, [addMessage, sendTextMessage, scrollToTop]);

  // Handle ChatInput focus - snap to 100% when user taps
  // Snap points: [0.35, 0.55, 0.75, 0.9, 1.0], so index 4 is 100%
  const handleChatInputFocus = useCallback(() => {
    snapTo(4);
  }, [snapTo]);

  // Expose expandSheet method to parent for AbbyOrb tap handler
  useImperativeHandle(ref, () => ({
    expandSheet: () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      snapTo(4); // Expand to 100%
    },
  }), [snapTo]);

  // Secret navigation handlers
  const handleSecretBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onSecretBack?.();
  }, [onSecretBack]);

  const handleSecretForward = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onSecretForward?.();
  }, [onSecretForward]);

  return (
    <View style={styles.container}>
      {/* Backdrop - not tappable for this screen */}
      <View style={styles.backdrop} />

      {/* Bottom Sheet - animated & draggable */}
      <Animated.View
        style={[
          styles.bottomSheet,
          {
            transform: [{ translateY }],
          },
        ]}
      >
        <BlurView intensity={80} tint="light" style={styles.blurContainer} pointerEvents="box-none">
          {/* DRAGGABLE HEADER - Handle only, no buttons */}
          <View {...panHandlers} style={styles.draggableHeader}>
            <View style={[styles.handleContainer, { paddingTop: layout.isSmallScreen ? 8 : 12 }]}>
              <View style={styles.handle} />
            </View>
          </View>

          {/* Status row - OUTSIDE drag zone to prevent accidental taps */}
          <View style={[styles.statusRow, {
            paddingBottom: layout.isSmallScreen ? 8 : 12,
            paddingHorizontal: layout.paddingHorizontal,
          }]}>
            <View style={[
              styles.statusDot,
              isConnected ? (isMuted ? styles.statusMuted : styles.statusConnected) : styles.statusDisconnected
            ]} />
            <Text style={styles.statusText}>
              {isMuted ? 'Muted' : (isConnected ? (isSpeaking ? 'Abby is speaking...' : 'Listening') : agentStatus)}
            </Text>

            {/* Mute/Unmute button - 44x44 for iOS HIG compliance */}
            {isConnected && (
              <Pressable
                onPress={handleToggleMute}
                style={({ pressed }) => [
                  styles.muteButton,
                  pressed && styles.muteButtonPressed,
                ]}
              >
                {isMuted ? (
                  <Play size={18} stroke="#888888" />
                ) : (
                  <Pause size={18} stroke="#888888" />
                )}
              </Pressable>
            )}</View>

          {/* Content area - pointerEvents auto to capture touches */}
          <View style={[styles.contentContainer, { paddingHorizontal: layout.paddingHorizontal }]} pointerEvents="auto">
            {/* Conversation transcript - newest at top */}
            <ScrollView
              ref={scrollRef}
              style={styles.messagesContainer}
              contentContainerStyle={[styles.messagesContent, {
                flexGrow: 1,
                paddingBottom: layout.isSmallScreen ? 12 : 20,
              }]}
              showsVerticalScrollIndicator={true}
              bounces={true}
              alwaysBounceVertical={true}
              scrollEventThrottle={16}
            >
              {messages.length === 0 ? (
                <Text style={[styles.placeholderText, {
                  fontSize: layout.bodyFontSize + 2,
                  paddingVertical: layout.isSmallScreen ? 12 : 20,
                }]}>
                  {isConnected ? "Let's talk about your match! I'm here to help you prepare." : "Connecting to Abby..."}
                </Text>
              ) : (
                [...messages].reverse().map((message) => {
                  if (!message?.text) return null;
                  return (
                    <View key={message.id} style={[
                      styles.messageBubble,
                      { marginBottom: layout.isSmallScreen ? 10 : 16 },
                      message.speaker === 'user' && styles.messageBubbleUser
                    ]}>
                      <Text style={[
                        styles.messageText,
                        { fontSize: layout.isSmallScreen ? 15 : 17, lineHeight: layout.isSmallScreen ? 20 : 23 },
                        message.speaker === 'user' && styles.userMessageText
                      ]}>
                        {message.speaker === 'abby' ? '' : 'You: '}{message.text}
                      </Text>
                    </View>
                  );
                })
              )}
            </ScrollView>

            {/* End Chat button */}
            <Pressable
              onPress={handleEndChat}
              style={({ pressed }) => [
                styles.endButton,
                {
                  paddingVertical: layout.isSmallScreen ? 12 : 16,
                  marginBottom: layout.isSmallScreen ? 28 : 40,
                  borderRadius: layout.buttonRadius + 4,
                },
                pressed && styles.endButtonPressed,
              ]}
            >
              <Text style={[styles.buttonText, { fontSize: layout.isSmallScreen ? 14 : 16 }]}>End Chat</Text>
            </Pressable>
          </View>

        </BlurView>
      </Animated.View>

      {/* Chat input - positioned OUTSIDE bottom sheet, relative to screen */}
      <View style={[styles.chatInputContainer, { bottom: layout.isSmallScreen ? 10 : 15 }]}>
        <ChatInput
          onSend={handleSendMessage}
          disabled={!isConnected}
          onFocus={handleChatInputFocus}
        />
      </View>

      {/* Secret navigation triggers (all 70x70, invisible) */}
      {/* Left = Back */}
      <Pressable
        onPress={handleSecretBack}
        style={styles.secretBackTrigger}
        hitSlop={10}
      />
      {/* Middle = Primary action (End Chat) */}
      <Pressable
        onPress={handleEndChat}
        style={styles.secretMiddleTrigger}
        hitSlop={10}
      />
      {/* Right = Forward */}
      <Pressable
        onPress={handleSecretForward}
        style={styles.secretForwardTrigger}
        hitSlop={10}
      />
    </View>
  );
  }
);

CoachScreen.displayName = 'CoachScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    // Transparent - just for layout
  },

  // Bottom sheet - full height, positioned via translateY
  bottomSheet: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    zIndex: 50,
    // No shadows - clean design
    elevation: 0,
  },

  blurContainer: {
    flex: 1,
  },

  // Draggable header area
  draggableHeader: {
    // Entire header area is draggable
  },

  handleContainer: {
    paddingTop: 12,
    paddingBottom: 8,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },

  // Status row - vertically aligned with mute button
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 0,
    paddingBottom: 12,
    marginTop: -15,
    paddingHorizontal: 20,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusConnected: {
    backgroundColor: '#10B981',
  },
  statusDisconnected: {
    backgroundColor: '#EF4444',
  },
  statusMuted: {
    backgroundColor: '#F59E0B',
  },
  statusText: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Mute button - 44x44 for iOS HIG compliance
  muteButton: {
    marginLeft: 'auto',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  muteButtonPressed: {
    opacity: 0.7,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: [{ scale: 0.95 }],
  },

  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },

  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingTop: 8,
    paddingBottom: 20,
  },

  chatInputContainer: {
    position: 'absolute',
    bottom: 15,
    left: 6,
    right: 6,
    zIndex: 200,
    pointerEvents: 'box-none',
  },
  placeholderText: {
    fontFamily: 'Merriweather_400Regular',
    fontSize: 18,
    lineHeight: 28,
    color: 'rgba(0, 0, 0, 0.8)',
    textAlign: 'center',
    paddingVertical: 20,
  },
  messageBubble: {
    marginBottom: 16,
  },
  messageBubbleUser: {
    marginBottom: 8,
    marginTop: -4,
  },
  messageText: {
    fontFamily: 'Merriweather_400Regular',
    fontSize: 17,
    lineHeight: 23,  // 17 * 1.35 ≈ 23 (15% more line height)
    color: 'rgba(0, 0, 0, 0.85)',
  },
  userMessageText: {
    color: 'rgba(0, 0, 0, 0.5)',
    fontStyle: 'italic',
  },

  endButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 30,
    paddingVertical: 16,
    marginHorizontal: 4,
    marginBottom: 40,
    alignItems: 'center',
  },
  endButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontFamily: 'Merriweather_400Regular',
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Secret navigation triggers
  secretBackTrigger: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 70,
    height: 70,
    zIndex: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
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
    borderColor: 'rgba(255, 255, 255, 0.5)',
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
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 8,
  },
});

export default CoachScreen;
