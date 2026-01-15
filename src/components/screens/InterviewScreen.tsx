/**
 * InterviewScreen - Question flow with vibe shifts
 *
 * UI Layout (matches CoachIntroScreen):
 * - Top: Shader/orb visible above modal
 * - Middle: Draggable glass sheet at 50% with question
 * - Bottom: Floating ChatInput for responses
 *
 * API Integration:
 * - When authenticated: Uses /v1/questions/* API via QuestionsService
 * - Demo mode: Falls back to local ALL_DATA_POINTS
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  ActivityIndicator,
  Animated,
  PanResponder,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import AnimatedRN, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useDemoStore } from '../../store/useDemoStore';
import { useVibeController } from '../../store/useVibeController';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { ALL_DATA_POINTS } from '../../data/questions-schema';
import { isValidVibeTheme, VibeColorTheme } from '../../types/vibe';
import { abbyTTS } from '../../services/AbbyTTSService';
import { getShaderForVibe, DEFAULT_VIBE_SHADERS } from '../../constants/vibeShaderMap';
import { questionsService, type Question, type NextQuestionResponse } from '../../services/QuestionsService';
import { TokenManager } from '../../services/TokenManager';
import { type VibeShift } from '../../data/questions-schema';
import { FEATURE_FLAGS } from '../../config';
import { analyzeQuestionSentiment } from '../../utils/questionSentiment';
import { ChatInput } from '../ui/ChatInput';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Sheet snap points - start at 50% (halfway)
const SNAP_POINTS = [0.35, 0.50, 0.75, 0.9];
const DEFAULT_SNAP = 0.50; // Start at halfway

// Use the full 150 questions for demo/fallback mode
const DEMO_QUESTIONS = ALL_DATA_POINTS;

/**
 * Get emotionally-appropriate shader for a vibe theme
 */
const getShaderForVibeAndIndex = (
  theme: VibeColorTheme | null,
  vibeChangeCount: number
): number => {
  if (!theme) {
    return DEFAULT_VIBE_SHADERS.TRUST;
  }
  return getShaderForVibe(theme, vibeChangeCount);
};

export interface InterviewScreenProps {
  onBackgroundChange?: (index: number) => void;
  onSecretBack?: () => void;
  onSecretForward?: () => void;
}

// Unified question type for both API and local questions
interface DisplayQuestion {
  id: string;
  question: string;
  vibe_shift?: VibeShift;
}

export const InterviewScreen: React.FC<InterviewScreenProps> = ({
  onBackgroundChange,
  onSecretBack,
  onSecretForward,
}) => {
  // Demo store for fallback mode
  const currentDemoIndex = useDemoStore((state) => state.currentQuestionIndex);
  const answerQuestion = useDemoStore((state) => state.answerQuestion);
  const nextQuestion = useDemoStore((state) => state.nextQuestion);
  const advance = useDemoStore((state) => state.advance);
  const addMessage = useDemoStore((state) => state.addMessage);

  const setColorTheme = useVibeController((state) => state.setColorTheme);
  const setComplexity = useVibeController((state) => state.setComplexity);
  const setAudioLevel = useVibeController((state) => state.setAudioLevel);
  const layout = useResponsiveLayout();

  // API state
  const [isApiMode, setIsApiMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [currentApiQuestion, setCurrentApiQuestion] = useState<Question | null>(null);
  const [progress, setProgress] = useState({ current: 1, total: 10 });
  const [hasMore, setHasMore] = useState(true);
  const answerStartTime = useRef<number>(Date.now());

  // Track TTS errors for user feedback
  const [voiceError, setVoiceError] = useState(false);

  // Prevent double-submission during API calls
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track current vibe for emotion-based texture selection
  const [currentVibe, setCurrentVibe] = useState<VibeColorTheme>('TRUST');
  const [vibeChangeCount, setVibeChangeCount] = useState(0);

  // Ref for audio level callback
  const audioLevelRef = useRef(setAudioLevel);
  audioLevelRef.current = setAudioLevel;

  // Animated value for bottom sheet position
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // Derive current question based on mode
  const currentQuestion: DisplayQuestion | null = isApiMode
    ? currentApiQuestion
      ? {
          id: currentApiQuestion.id,
          question: currentApiQuestion.text,
          vibe_shift: currentApiQuestion.metadata?.vibe_shift as VibeShift | undefined,
        }
      : null
    : DEMO_QUESTIONS[Math.min(currentDemoIndex, DEMO_QUESTIONS.length - 1)];

  const isLastQuestion = isApiMode ? !hasMore : currentDemoIndex >= DEMO_QUESTIONS.length - 1;
  const displayProgress = isApiMode
    ? `${progress.current}/${progress.total}`
    : `${currentDemoIndex + 1}/${DEMO_QUESTIONS.length}`;

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

  // Pan responder for draggable header
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
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

  // Animate sheet in on mount (to 50%)
  useEffect(() => {
    Animated.spring(translateY, {
      toValue: SCREEN_HEIGHT * (1 - DEFAULT_SNAP),
      useNativeDriver: true,
      damping: 50,
      stiffness: 400,
    }).start();
  }, []);

  // Initialize: Check auth and load first question
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      setIsLoading(true);
      setApiError(null);

      try {
        const token = await TokenManager.getToken();
        if (!isMounted) return;

        if (token) {
          if (__DEV__) console.log('[Interview] Authenticated, using API mode');
          setIsApiMode(true);

          try {
            answerStartTime.current = Date.now();
            const response = await questionsService.getNextQuestion();
            if (!isMounted) return;

            setCurrentApiQuestion(response.question);
            setProgress(response.progress);
            setHasMore(response.hasMore);
          } catch (fetchError) {
            if (!isMounted) return;
            if (__DEV__) console.error('[Interview] Fetch error:', fetchError);
            setIsApiMode(false);
          }
        } else {
          if (__DEV__) console.log('[Interview] No token, using demo mode');
          setIsApiMode(false);
        }
      } catch (error) {
        if (!isMounted) return;
        if (__DEV__) console.error('[Interview] Init error:', error);
        setIsApiMode(false);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch next question from API
  const fetchNextQuestion = async () => {
    try {
      setIsLoading(true);
      setApiError(null);
      answerStartTime.current = Date.now();

      const response: NextQuestionResponse = await questionsService.getNextQuestion();

      setCurrentApiQuestion(response.question);
      setProgress(response.progress);
      setHasMore(response.hasMore);

      if (__DEV__) {
        console.log('[Interview] API question:', response.question.text);
      }
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Failed to load question';
      if (__DEV__) console.error('[Interview] Fetch error:', error);
      setApiError(errMsg);

      if (!currentApiQuestion) {
        setIsApiMode(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Submit answer to API
  const submitApiAnswer = async (answerValue: string) => {
    if (!currentApiQuestion) return;

    const responseTime = Date.now() - answerStartTime.current;

    try {
      await questionsService.submitAnswer(
        currentApiQuestion.id,
        answerValue,
        responseTime
      );

      if (__DEV__) console.log('[Interview] Answer submitted to API');

      if (hasMore) {
        await fetchNextQuestion();
      } else {
        advance();
      }
    } catch (error) {
      if (__DEV__) console.error('[Interview] Submit error:', error);
      if (hasMore) {
        await fetchNextQuestion();
      } else {
        advance();
      }
    }
  };

  // Submit answer (handles both API and demo mode)
  const submitAnswer = useCallback(
    async (answerValue: string) => {
      if (!currentQuestion || isSubmitting) return;

      setIsSubmitting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      try {
        addMessage('user', answerValue);

        if (isApiMode) {
          await submitApiAnswer(answerValue);
        } else {
          answerQuestion({
            questionId: currentQuestion.id,
            value: answerValue,
            answeredAt: Date.now(),
          });

          if (isLastQuestion) {
            advance();
          } else {
            nextQuestion();
          }
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentQuestion, isApiMode, isLastQuestion, isSubmitting, addMessage, answerQuestion, advance, nextQuestion]
  );

  // Handle sending message via ChatInput
  const handleSendMessage = useCallback((text: string) => {
    submitAnswer(text);
  }, [submitAnswer]);

  // Secret navigation handlers
  const handleSecretBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onSecretBack?.();
  }, [onSecretBack]);

  const handleSecretForward = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onSecretForward?.();
  }, [onSecretForward]);

  // Emotion-based texture selection
  useEffect(() => {
    if (onBackgroundChange) {
      const shaderId = getShaderForVibeAndIndex(currentVibe, vibeChangeCount);
      onBackgroundChange(shaderId);
    }
  }, [currentVibe, vibeChangeCount, onBackgroundChange]);

  // Speak question when it changes + trigger vibe shift
  useEffect(() => {
    if (!currentQuestion || isLoading) return;

    setVoiceError(false);

    let newVibe: VibeColorTheme;
    let newShaderId: number | undefined;

    if (currentQuestion.vibe_shift && isValidVibeTheme(currentQuestion.vibe_shift)) {
      newVibe = currentQuestion.vibe_shift as VibeColorTheme;
    } else {
      const sentiment = analyzeQuestionSentiment(currentQuestion.question);
      newVibe = sentiment.theme;
      newShaderId = sentiment.shaderId;
      setComplexity(sentiment.complexity);
    }

    setColorTheme(newVibe);

    if (newVibe !== currentVibe) {
      setCurrentVibe(newVibe);
      setVibeChangeCount((prev) => prev + 1);
    }

    if (newShaderId !== undefined && onBackgroundChange) {
      onBackgroundChange(newShaderId);
    }

    addMessage('abby', currentQuestion.question);

    if (FEATURE_FLAGS.VOICE_ENABLED) {
      abbyTTS
        .speak(currentQuestion.question, (level) => {
          audioLevelRef.current?.(level);
        })
        .catch((err) => {
          if (__DEV__) console.warn('[Interview] TTS error:', err);
          setVoiceError(true);
        });
    }

    return () => {
      if (FEATURE_FLAGS.VOICE_ENABLED) {
        abbyTTS.stop();
      }
    };
  }, [currentQuestion?.id, isLoading, setColorTheme, setComplexity, currentVibe, onBackgroundChange]);

  // Loading state
  if (isLoading && !currentQuestion) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="rgba(255, 255, 255, 0.8)" />
          <Text style={styles.loadingText}>Loading questions...</Text>
        </View>
      </View>
    );
  }

  // No question available
  if (!currentQuestion) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Backdrop */}
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
          {/* DRAGGABLE HEADER */}
          <View {...panResponder.panHandlers} style={styles.draggableHeader}>
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>
          </View>

          {/* Progress indicator - top right corner */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {displayProgress}
              {isApiMode && <Text style={styles.apiIndicator}> • API</Text>}
            </Text>
          </View>

          {/* Question text - pushed up 20px */}
          <AnimatedRN.View
            key={currentQuestion.id}
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(200)}
            style={styles.questionContainer}
          >
            <Text
              style={[
                styles.questionText,
                {
                  fontSize: layout.isSmallScreen ? 21 : 23,
                  lineHeight: layout.isSmallScreen ? 26 : 29,
                },
              ]}
            >
              {currentQuestion.question}
            </Text>
          </AnimatedRN.View>

          {/* Voice error indicator */}
          {voiceError && <Text style={styles.voiceErrorText}>🔇 Voice unavailable</Text>}

          {/* API error banner */}
          {apiError && (
            <Text style={styles.apiErrorText}>⚠️ Sync issue - answers saved locally</Text>
          )}

          {/* Loading overlay */}
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="small" color="rgba(0, 0, 0, 0.4)" />
            </View>
          )}
        </BlurView>
      </Animated.View>

      {/* Chat input - FLOATING at screen bottom (outside sheet) */}
      <View style={[styles.chatInputContainer, {
        bottom: layout.isSmallScreen ? 24 : 34,
        left: layout.paddingHorizontal,
        right: layout.paddingHorizontal,
      }]}>
        <ChatInput
          onSend={handleSendMessage}
          disabled={isLoading || isSubmitting}
          placeholder="Type your answer..."
        />
      </View>

      {/* Secret navigation triggers */}
      <Pressable onPress={handleSecretBack} style={styles.secretBackTrigger} hitSlop={10} />
      <Pressable
        onPress={() => submitAnswer('Yes')}
        style={styles.secretMiddleTrigger}
        hitSlop={10}
      />
      <Pressable onPress={handleSecretForward} style={styles.secretForwardTrigger} hitSlop={10} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
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
    // No shadows - clean design
    elevation: 0,
  },

  blurContainer: {
    flex: 1,
  },

  // Draggable header area
  draggableHeader: {
    paddingTop: 12,
  },

  handleContainer: {
    paddingBottom: 8,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },

  // Progress indicator - top right corner
  progressContainer: {
    position: 'absolute',
    top: 16,
    right: 20,
    zIndex: 10,
  },
  progressText: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    color: 'rgba(0, 0, 0, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  apiIndicator: {
    color: 'rgba(59, 130, 246, 0.7)',
    fontSize: 10,
  },

  // Question - pushed up 20px from center
  questionContainer: {
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 20,
  },
  questionText: {
    fontFamily: 'Merriweather_400Regular',
    fontSize: 23,
    lineHeight: 29,
    color: 'rgba(0, 0, 0, 0.85)',
    textAlign: 'center',
  },
  voiceErrorText: {
    fontFamily: 'Merriweather_400Regular',
    fontSize: 12,
    color: 'rgba(180, 100, 0, 0.9)',
    textAlign: 'center',
    marginBottom: 12,
  },
  apiErrorText: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    color: 'rgba(180, 100, 0, 0.8)',
    textAlign: 'center',
    marginBottom: 8,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontFamily: 'Merriweather_400Regular',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 16,
    left: 20,
  },

  // Chat input wrapper - FLOATING PILL at screen bottom
  chatInputContainer: {
    position: 'absolute',
    bottom: 34,
    left: 20,
    right: 20,
    zIndex: 200,
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

export default InterviewScreen;
