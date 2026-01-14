/**
 * CoachIntroScreen - Abby greets user with ElevenLabs Agent
 *
 * First screen in the demo flow. Abby initiates conversation.
 * User can tap "Start Interview" to advance to questions.
 *
 * Uses draggable bottom sheet pattern (from ProperDress SwatchSelectionModal).
 * Snap points at 35%, 55%, 75%, 90% of screen height.
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
  PanResponder,
  Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Pause, Play } from 'lucide-react-native';
import { useDemoStore } from '../../store/useDemoStore';
import { useAbbyAgent } from '../../services/AbbyRealtimeService';
import { useVibeController } from '../../store/useVibeController';
import { VibeColorTheme } from '../../types/vibe';
import { SHEET_SNAP_POINTS, SHEET_DEFAULT_SNAP } from '../../constants/layout';
import { TIMEOUTS } from '../../config';
import { ChatInput } from '../ui/ChatInput';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';

// Keywords that trigger color changes during conversation
const VIBE_KEYWORDS: Record<VibeColorTheme, string[]> = {
  TRUST: ['trust', 'honest', 'reliable', 'safe', 'secure', 'comfortable', 'welcome'],
  PASSION: ['love', 'passion', 'heart', 'romantic', 'chemistry', 'attraction', 'excited'],
  CAUTION: ['think', 'consider', 'careful', 'maybe', 'unsure', 'wonder'],
  GROWTH: ['learn', 'grow', 'journey', 'discover', 'understand', 'better', 'improve'],
  DEEP: ['feel', 'emotional', 'vulnerable', 'deep', 'meaningful', 'important', 'matter'],
  ALERT: ['concern', 'worry', 'problem', 'issue', 'difficult', 'challenge'],
};

// Detect vibe from text
const detectVibeFromText = (text: string): VibeColorTheme | null => {
  const lower = text.toLowerCase();
  for (const [vibe, keywords] of Object.entries(VIBE_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      return vibe as VibeColorTheme;
    }
  }
  return null;
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Use centralized constants - SINGLE SOURCE OF TRUTH
const SNAP_POINTS = SHEET_SNAP_POINTS;
const DEFAULT_SNAP = SHEET_DEFAULT_SNAP;

export interface CoachIntroScreenProps {
  onBackgroundChange?: (index: number) => void;
  onSecretBack?: () => void;
  onSecretForward?: () => void;
}

export interface CoachIntroScreenRef {
  expandSheet: () => void;
}

export const CoachIntroScreen = forwardRef<CoachIntroScreenRef, CoachIntroScreenProps>(
  ({
    onBackgroundChange,
    onSecretBack,
    onSecretForward,
  }, ref) => {
  const scrollRef = useRef<ScrollView>(null);
  const layout = useResponsiveLayout();

  const messages = useDemoStore((state) => state.messages);
  const addMessage = useDemoStore((state) => state.addMessage);
  const advance = useDemoStore((state) => state.advance);

  // Vibe controller for color changes
  const setColorTheme = useVibeController((state) => state.setColorTheme);

  const [agentStatus, setAgentStatus] = useState<string>('Initializing...');

  // Animated value for bottom sheet position
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // Initialize Abby Agent
  const { startConversation, endConversation, toggleMute, isSpeaking, isConnected, isMuted, isDemoMode, sendTextMessage } = useAbbyAgent({
    enabled: true,
    onAbbyResponse: (text) => {
      addMessage('abby', text);

      // Trigger color change based on conversation content
      const detectedVibe = detectVibeFromText(text);
      if (detectedVibe) {
        if (__DEV__) console.log('[CoachIntro] 🎨 Vibe shift:', detectedVibe);
        setColorTheme(detectedVibe);
      }

      // Scroll to top to show newest message
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      }, TIMEOUTS.UI.SCROLL_DELAY);
    },
    onUserTranscript: (text) => {
      addMessage('user', text);
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      }, TIMEOUTS.UI.SCROLL_DELAY);
    },
    onConnect: () => {
      setAgentStatus('Ready');
    },
    onDisconnect: () => {
      setAgentStatus('Ended');
      // AUTO-ADVANCE: When conversation ends, transition to interview
      if (__DEV__) console.log('[CoachIntro] 🚀 Disconnected, advancing to interview');
      advance();
    },
    onError: (error) => {
      setAgentStatus(`Error: ${error.message}`);
      // Show visible alert so user can see the error in release mode
      Alert.alert('Connection Issue', error.message, [{ text: 'OK' }]);
    },
  });

  // Find closest snap point
  const findClosestSnapPoint = useCallback((position: number): number => {
    const currentPercentage = 1 - position / SCREEN_HEIGHT;
    let closest: number = SNAP_POINTS[0];
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

  // Expose expandSheet method to parent for AbbyOrb tap handler
  useImperativeHandle(ref, () => ({
    expandSheet: () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // Expand to 100% (1.0 means fully expanded, so translateY = 0)
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 50,
        stiffness: 400,
      }).start();
    },
  }), [translateY]);

  // Pan responder for draggable header
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to vertical drags
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderGrant: () => {
        translateY.setOffset((translateY as unknown as { _value: number })._value);
        translateY.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        const newY = gestureState.dy;
        const offset = (translateY as unknown as { _offset: number })._offset;
        const minY = SCREEN_HEIGHT * 0.1 - offset;
        const maxY = SCREEN_HEIGHT - offset;

        const constrainedY = Math.max(minY, Math.min(maxY, newY));
        translateY.setValue(constrainedY);
      },
      onPanResponderRelease: (_, gestureState) => {
        translateY.flattenOffset();
        const currentY = (translateY as unknown as { _value: number })._value;
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
        if (__DEV__) console.warn('[CoachIntro] Failed to start conversation:', err);
        setAgentStatus('Failed to connect');
      }
    };
    initConversation();

    // Cleanup on unmount - must handle async gracefully
    return () => {
      endConversation().catch((err) => {
        // Cleanup errors are expected if session already ended
        if (typeof __DEV__ !== 'undefined' && __DEV__) console.debug('[CoachIntro] Cleanup:', err?.message || 'session ended');
      });
    };
  }, []);

  // Start Interview - advance to INTERVIEW state
  // Uses timeout race to prevent hanging if endConversation() takes too long
  const handleStartInterview = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Race between endConversation and a 2s timeout to prevent UI hang
    try {
      const timeout = new Promise<void>((resolve) => setTimeout(resolve, 2000));
      await Promise.race([endConversation(), timeout]);
    } catch (err) {
      // Ignore errors - we're navigating away anyway
      if (__DEV__) console.warn('[CoachIntro] endConversation error (continuing):', err);
    }

    advance(); // Go to INTERVIEW
  }, [endConversation, advance]);

  // Handle mute/unmute
  const handleToggleMute = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await toggleMute();
  }, [toggleMute]);

  // Handle sending text message to Abby
  const handleSendMessage = useCallback((text: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Add user message to transcript
    addMessage('user', text);
    // Send to Abby agent (with error handling)
    sendTextMessage(text).catch((err) => {
      if (__DEV__) {
        console.warn('[CoachIntro] sendTextMessage failed:', err);
      }
      // Show visible alert for message send failures
      const errorMsg = err?.message || err?.code || 'Unknown error';
      Alert.alert('Message Failed', errorMsg, [{ text: 'OK' }]);
    });
    // Scroll to show newest message
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }, TIMEOUTS.UI.SCROLL_DELAY);
  }, [addMessage, sendTextMessage]);

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
          <View {...panResponder.panHandlers} style={styles.draggableHeader}>
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
            <Text style={[styles.statusText, { fontSize: layout.captionFontSize }]}>
              {isMuted ? 'Muted' : (isConnected ? (isSpeaking ? 'Speaking...' : (isDemoMode ? 'Demo Mode' : 'Connected')) : agentStatus)}
            </Text>

            {/* Mute/Unmute button - responsive size, min 44x44 for iOS HIG compliance */}
            {isConnected && (
              <Pressable
                onPress={handleToggleMute}
                style={({ pressed }) => [
                  styles.muteButton,
                  { width: layout.buttonHeight, height: layout.buttonHeight, borderRadius: layout.buttonHeight / 2 },
                  pressed && styles.muteButtonPressed,
                ]}
              >
                {isMuted ? (
                  <Play size={18} stroke="#888888" />
                ) : (
                  <Pause size={18} stroke="#888888" />
                )}
              </Pressable>
            )}
          </View>

          {/* Conversation transcript - grows to fill available space */}
          <ScrollView
            ref={scrollRef}
            style={styles.messagesContainer}
            contentContainerStyle={[styles.messagesContent, {
              paddingBottom: layout.isSmallScreen ? 80 : 100,
              paddingHorizontal: layout.paddingHorizontal,
            }]}
            showsVerticalScrollIndicator={true}
            bounces={true}
            alwaysBounceVertical={true}
            scrollEventThrottle={16}
          >
            {messages.length === 0 ? (
              <Text style={[styles.placeholderText, { fontSize: layout.isSmallScreen ? 16 : 18, lineHeight: layout.isSmallScreen ? 24 : 28 }]}>
                {isConnected
                  ? (isDemoMode
                      ? "Hi! I'm Abby. I'm in demo mode - type a message to chat!"
                      : "Hi! I'm Abby. Ready to help you find your perfect match?")
                  : "Connecting to Abby..."}
              </Text>
            ) : (
              [...messages].reverse().map((message) => {
                if (!message?.text) return null;
                return (
                  <View key={message.id} style={[
                    styles.messageBubble,
                    { marginBottom: layout.isSmallScreen ? 12 : 16 },
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

        </BlurView>
      </Animated.View>

      {/* Chat input - OUTSIDE the animated sheet, fixed at actual screen bottom */}
      {/* This ensures it's always visible regardless of sheet translateY position */}
      <View style={[styles.chatInputContainer, {
        bottom: layout.isSmallScreen ? 24 : 34,
        left: layout.paddingHorizontal,
        right: layout.paddingHorizontal,
      }]}>
        <ChatInput
          onSend={handleSendMessage}
          disabled={!isConnected}
          placeholder="Reply to Abby..."
        />
      </View>

      {/* Secret navigation triggers (responsive size, invisible) */}
      {/* Left = Back */}
      <Pressable
        onPress={handleSecretBack}
        style={[styles.secretBackTrigger, {
          width: layout.isSmallScreen ? 60 : 70,
          height: layout.isSmallScreen ? 60 : 70,
        }]}
        hitSlop={10}
      />
      {/* Middle = Primary action (Start Interview) */}
      <Pressable
        onPress={handleStartInterview}
        style={[styles.secretMiddleTrigger, {
          width: layout.isSmallScreen ? 60 : 70,
          height: layout.isSmallScreen ? 60 : 70,
          marginLeft: layout.isSmallScreen ? -30 : -35,
        }]}
        hitSlop={10}
      />
      {/* Right = Forward */}
      <Pressable
        onPress={handleSecretForward}
        style={[styles.secretForwardTrigger, {
          width: layout.isSmallScreen ? 60 : 70,
          height: layout.isSmallScreen ? 60 : 70,
        }]}
        hitSlop={10}
      />
    </View>
  );
  }
);

CoachIntroScreen.displayName = 'CoachIntroScreen';

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

  // Messages container - THE flexible element
  // In flex column layout: items WITHOUT flex get natural size FIRST,
  // then items WITH flex: 1 split remaining space.
  // Order: header (natural) → status (natural) → scroll (flex:1) → input (natural)
  messagesContainer: {
    flex: 1,          // ← Takes remaining space after header, status, and input
    minHeight: 100,   // Minimum to ensure scrolling works
  },
  messagesContent: {
    paddingTop: 8,
    paddingBottom: 100, // Extra space so messages don't hide behind fixed input at screen bottom
    paddingHorizontal: 20,
  },
  placeholderText: {
    fontFamily: 'Merriweather_400Regular',
    fontSize: 18,
    lineHeight: 28,
    color: 'rgba(0, 0, 0, 0.6)',
    textAlign: 'left',
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
    color: 'rgba(0, 0, 0, 0.65)',
    textAlign: 'left',
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

  // Chat input wrapper - FLOATING PILL at screen bottom
  // CRITICAL: Outside animated sheet so it's always visible
  // Uses horizontal margins to create floating pill effect
  chatInputContainer: {
    position: 'absolute',
    bottom: 34, // Safe area for home indicator
    left: 20,
    right: 20,
    // NO background - ChatInput component has its own glassmorphic blur
    zIndex: 200, // Above everything including sheet
  },
});

export default CoachIntroScreen;
