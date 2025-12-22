/**
 * CoachIntroScreen - Abby greets user with ElevenLabs Agent
 *
 * First screen in the demo flow. Abby initiates conversation.
 * User can tap "Start Interview" to advance to questions.
 *
 * Uses draggable bottom sheet pattern (from ProperDress SwatchSelectionModal).
 * Snap points at 25%, 50%, 75%, 90% of screen height.
 */

import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  ScrollView,
  Animated,
  PanResponder,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Pause, Play } from 'lucide-react-native';
import { useDemoStore } from '../../store/useDemoStore';
import { useAbbyAgent } from '../../services/AbbyAgent';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Snap points as percentages of screen height (from bottom)
const SNAP_POINTS = [0.35, 0.55, 0.75, 0.9];
const DEFAULT_SNAP = 0.55; // Start at 55%

export interface CoachIntroScreenProps {
  onBackgroundChange?: (index: number) => void;
}

export const CoachIntroScreen: React.FC<CoachIntroScreenProps> = ({
  onBackgroundChange,
}) => {
  const scrollRef = useRef<ScrollView>(null);

  const messages = useDemoStore((state) => state.messages);
  const addMessage = useDemoStore((state) => state.addMessage);
  const advance = useDemoStore((state) => state.advance);

  const [agentStatus, setAgentStatus] = useState<string>('Connecting...');

  // Animated value for bottom sheet position
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // Initialize ElevenLabs Agent
  const { startConversation, endConversation, toggleMute, isSpeaking, isConnected, isMuted } = useAbbyAgent({
    enabled: true,
    onAbbyResponse: (text) => {
      addMessage('abby', text);
      // Scroll to top to show newest message
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      }, 100);
    },
    onUserTranscript: (text) => {
      addMessage('user', text);
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      }, 100);
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

  // Find closest snap point
  const findClosestSnapPoint = useCallback((position: number): number => {
    const currentPercentage = 1 - position / SCREEN_HEIGHT;
    let closest = SNAP_POINTS[0];
    let minDistance = Math.abs(currentPercentage - closest);

    for (const snap of SNAP_POINTS) {
      const distance = Math.abs(currentPercentage - snap);
      if (distance < minDistance) {
        minDistance = distance;
        closest = snap;
      }
    }

    return SCREEN_HEIGHT * (1 - closest);
  }, []);

  // Pan responder for draggable header
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to vertical drags
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderGrant: () => {
        translateY.setOffset((translateY as any)._value);
        translateY.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        const newY = gestureState.dy;
        const minY = SCREEN_HEIGHT * 0.1 - (translateY as any)._offset;
        const maxY = SCREEN_HEIGHT - (translateY as any)._offset;

        const constrainedY = Math.max(minY, Math.min(maxY, newY));
        translateY.setValue(constrainedY);
      },
      onPanResponderRelease: (_, gestureState) => {
        translateY.flattenOffset();
        const currentY = (translateY as any)._value;
        const velocity = gestureState.vy;

        // Snap to closest point
        const snapY = findClosestSnapPoint(currentY + velocity * 100);
        Animated.spring(translateY, {
          toValue: snapY,
          useNativeDriver: true,
          damping: 50,
          stiffness: 400,
        }).start();
      },
    })
  ).current;

  // Set background to Liquid Marble shader
  useEffect(() => {
    if (onBackgroundChange) {
      onBackgroundChange(5); // Liquid Marble - calming for intro
    }
  }, [onBackgroundChange]);

  // Animate sheet in on mount
  useEffect(() => {
    Animated.spring(translateY, {
      toValue: SCREEN_HEIGHT * (1 - DEFAULT_SNAP),
      useNativeDriver: true,
      damping: 50,
      stiffness: 400,
    }).start();
  }, []);

  // Auto-start conversation when screen mounts
  useEffect(() => {
    const initConversation = async () => {
      try {
        await startConversation();
      } catch (err) {
        console.warn('[CoachIntro] Failed to start conversation:', err);
        setAgentStatus('Failed to connect');
      }
    };
    initConversation();

    // Cleanup on unmount - must handle async gracefully
    return () => {
      endConversation().catch(() => {
        // Ignore cleanup errors - session may already be ended
      });
    };
  }, []);

  // Start Interview - advance to INTERVIEW state
  const handleStartInterview = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await endConversation();
    advance(); // Go to INTERVIEW
  }, [endConversation, advance]);

  // Handle mute/unmute
  const handleToggleMute = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await toggleMute();
  }, [toggleMute]);

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
        <BlurView intensity={80} tint="light" style={styles.blurContainer}>
          {/* DRAGGABLE HEADER - Handle only, no buttons */}
          <View {...panResponder.panHandlers} style={styles.draggableHeader}>
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>
          </View>

          {/* Status row - OUTSIDE drag zone to prevent accidental taps */}
          <View style={styles.statusRow}>
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
                  // @ts-ignore - color works via SvgProps
                  <Play size={15} color="#FFFFFF" />
                ) : (
                  // @ts-ignore - color works via SvgProps
                  <Pause size={15} color="#FFFFFF" />
                )}
              </Pressable>
            )}
          </View>

          {/* Content area */}
          <View style={styles.contentContainer}>
            {/* Conversation transcript - newest at top */}
            <ScrollView
              ref={scrollRef}
              style={styles.messagesContainer}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
            >
              {messages.length === 0 ? (
                <Text style={styles.placeholderText}>
                  {isConnected ? "Hi! I'm Abby. Ready to help you find your perfect match?" : "Connecting to Abby..."}
                </Text>
              ) : (
                [...messages].reverse().map((message) => (
                  <View key={message.id} style={[
                    styles.messageBubble,
                    message.speaker === 'user' && styles.messageBubbleUser
                  ]}>
                    <Text style={[
                      styles.messageText,
                      message.speaker === 'user' && styles.userMessageText
                    ]}>
                      {message.speaker === 'abby' ? '' : 'You: '}{message.text}
                    </Text>
                  </View>
                ))
              )}
            </ScrollView>

            {/* Start Interview button */}
            <Pressable
              onPress={handleStartInterview}
              style={({ pressed }) => [
                styles.startButton,
                pressed && styles.startButtonPressed,
              ]}
            >
              <Text style={styles.buttonText}>Start Interview</Text>
            </Pressable>
          </View>
        </BlurView>
      </Animated.View>
    </View>
  );
};

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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
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

  // Status row - moved up 30px (reduced padding + negative margin)
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 0,
    paddingBottom: 12,
    marginTop: -18,
    paddingHorizontal: 20,
    gap: 8,
    position: 'relative',
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
    fontFamily: 'Merriweather_400Regular',
    fontSize: 13,
    color: 'rgba(0, 0, 0, 0.5)',
  },

  // Mute button - thin white outline, moved down 30px, reduced 25%
  muteButton: {
    position: 'absolute',
    right: 16,
    top: -5,
    width: 33,
    height: 33,
    borderRadius: 17,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  muteButtonPressed: {
    opacity: 0.7,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: [{ scale: 0.95 }],
  },

  // Content area
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Messages container
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingBottom: 16,
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

  // Start button
  startButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 30,
    paddingVertical: 16,
    marginHorizontal: 4,
    marginBottom: 40,
    alignItems: 'center',
  },
  startButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontFamily: 'Merriweather_400Regular',
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default CoachIntroScreen;
