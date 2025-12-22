/**
 * ConversationOverlay - Blur sheet for conversation transcript
 *
 * Displays Abby's questions and user responses with adaptive height:
 * - voice_only: 0% (hidden)
 * - voice_and_text: 50% (halfway, with drag handle)
 * - text_only: 100% (full screen frost)
 *
 * Includes question progress indicator in header.
 * Typography: Merriweather 17pt, 5px left padding, 125% line height
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { InputMode } from '../../store/useSettingsStore';

// Message type
export interface ConversationMessage {
  id: string;
  speaker: 'abby' | 'user';
  text: string;
  timestamp: number;
}

interface ConversationOverlayProps {
  messages: ConversationMessage[];
  inputMode: InputMode;
  onCollapsedChange?: (collapsed: boolean) => void;
}

// Height percentages for each mode (from bottom of screen)
const HEIGHT_CONFIG = {
  voice_only: 0,
  voice_and_text: 0.55, // Slightly taller for better visibility
  text_only: 1,
};

export const ConversationOverlay: React.FC<ConversationOverlayProps> = ({
  messages,
  inputMode,
  onCollapsedChange,
}) => {
  const { height: screenHeight } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);

  // Animation values
  const heightPercent = useSharedValue(HEIGHT_CONFIG[inputMode]);
  const dragOffset = useSharedValue(0);
  const isCollapsed = useSharedValue(false);

  // Update height when mode changes
  useEffect(() => {
    heightPercent.value = withSpring(HEIGHT_CONFIG[inputMode], {
      damping: 20,
      stiffness: 100,
    });
  }, [inputMode]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages.length]);

  // Drag gesture (only for voice_and_text mode)
  const dragGesture = Gesture.Pan()
    .enabled(inputMode === 'voice_and_text')
    .onUpdate((event) => {
      // Drag down to collapse
      dragOffset.value = Math.max(0, event.translationY);
    })
    .onEnd((event) => {
      const threshold = screenHeight * 0.15;

      if (event.translationY > threshold) {
        // Collapse
        isCollapsed.value = true;
        heightPercent.value = withSpring(0.1, { damping: 20 });
        onCollapsedChange?.(true);
      } else {
        // Snap back
        isCollapsed.value = false;
        heightPercent.value = withSpring(0.5, { damping: 20 });
        onCollapsedChange?.(false);
      }

      dragOffset.value = withSpring(0);
    });

  // Tap to expand when collapsed
  const tapGesture = Gesture.Tap()
    .enabled(inputMode === 'voice_and_text' && isCollapsed.value)
    .onEnd(() => {
      isCollapsed.value = false;
      heightPercent.value = withSpring(0.5, { damping: 20 });
      onCollapsedChange?.(false);
    });

  const combinedGesture = Gesture.Race(dragGesture, tapGesture);

  // Animated styles
  const containerStyle = useAnimatedStyle(() => {
    const baseHeight = screenHeight * heightPercent.value;
    const adjustedHeight = Math.max(0, baseHeight - dragOffset.value);

    return {
      height: adjustedHeight,
      opacity: interpolate(heightPercent.value, [0, 0.1], [0, 1]),
    };
  });

  // Don't render if voice_only mode
  if (inputMode === 'voice_only') {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
      <GestureDetector gesture={combinedGesture}>
        <Animated.View style={[styles.container, containerStyle]}>
          <BlurView
            intensity={80}
            tint="light"
            style={styles.blur}
          >
            {/* Drag handle (for sliding down) */}
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>

            {/* Conversation messages - scrolling chat */}
            <ScrollView
              ref={scrollRef}
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </ScrollView>
          </BlurView>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

// Individual message bubble
const MessageBubble: React.FC<{ message: ConversationMessage }> = ({
  message,
}) => {
  const isAbby = message.speaker === 'abby';

  return (
    <View style={styles.messageContainer}>
      <Text
        style={[
          styles.messageText,
          isAbby ? styles.abbyText : styles.userText,
        ]}
      >
        {message.text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  gestureRoot: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  blur: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 34, // Safe area for home indicator
  },
  messageContainer: {
    marginBottom: 16,
  },
  messageText: {
    fontFamily: 'Merriweather_400Regular',
    fontSize: 17,
    lineHeight: 24,
    color: 'rgba(0, 0, 0, 0.85)',
  },
  abbyText: {
    opacity: 1,
  },
  userText: {
    opacity: 0.6,
    fontStyle: 'italic',
  },
});

export default ConversationOverlay;
