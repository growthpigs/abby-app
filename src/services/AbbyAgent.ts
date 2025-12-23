/**
 * AbbyAgent - ElevenLabs Conversational AI Service
 *
 * Wraps useConversation hook with ABBY-specific behavior.
 * Bridges SDK events to VibeController state.
 *
 * Key Integration Points:
 * - isSpeaking → startSpeakingPulse() / stopSpeakingPulse()
 * - Mode change → setAbbyMode()
 * - Simulated audio level → setAudioLevel() (SDK doesn't provide amplitude)
 */

import { useCallback, useRef, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useVibeController } from '../store/useVibeController';

// ============================================
// Type Definitions (from @elevenlabs/react-native)
// ============================================

type ConversationStatus = 'disconnected' | 'connecting' | 'connected';

interface ConversationConfig {
  agentId?: string;
  conversationToken?: string;
}

interface Conversation {
  startSession: (config: ConversationConfig) => Promise<void>;
  endSession: () => Promise<void>;
  status: ConversationStatus;
  isSpeaking: boolean;
  canSendFeedback: boolean;
  getId: () => string;
  sendFeedback: (like: boolean) => void;
  sendContextualUpdate: (text: string) => void;
  sendUserMessage: (text: string) => void;
  sendUserActivity: () => void;
}

/**
 * Message source types from ElevenLabs SDK
 * - 'user': User's transcribed speech
 * - 'ai': Agent's response text
 */
type MessageSource = 'user' | 'ai';

interface ConversationCallbacks {
  onConnect?: (props: { conversationId: string }) => void;
  onDisconnect?: (details: string) => void;
  onError?: (message: string, context?: Record<string, unknown>) => void;
  /**
   * Called when a message is received from user (transcript) or AI (response)
   * SDK v0.5.7+ returns message as plain string
   */
  onMessage?: (props: { message: string; source: MessageSource }) => void;
  onModeChange?: (prop: { mode: 'speaking' | 'listening' }) => void;
  onStatusChange?: (prop: { status: ConversationStatus }) => void;
}

type UseConversationHook = (options?: ConversationCallbacks) => Conversation;

interface AudioSessionAPI {
  configureAudio: (config: { ios?: { defaultOutput: string } }) => Promise<void>;
  startAudioSession: () => Promise<void>;
  stopAudioSession: () => Promise<void>;
  selectAudioOutput: (output: string) => Promise<void>;
  setAppleAudioConfiguration: (config: {
    audioCategory?: 'soloAmbient' | 'playback' | 'record' | 'playAndRecord' | 'multiRoute';
    audioCategoryOptions?: ('mixWithOthers' | 'duckOthers' | 'allowBluetooth' | 'allowBluetoothA2DP' | 'allowAirPlay' | 'defaultToSpeaker')[];
    audioMode?: 'default' | 'gameChat' | 'measurement' | 'moviePlayback' | 'spokenAudio' | 'videoChat' | 'videoRecording' | 'voiceChat' | 'voicePrompt';
  }) => Promise<void>;
}

// ============================================
// Conditional Imports
// ============================================

// Native modules may not be available in Expo Go
// ElevenLabs SDK internally uses LiveKit which requires native code
let useConversation: UseConversationHook;
let AudioSession: AudioSessionAPI | null = null;

// Flag to track if voice features are available
export let VOICE_AVAILABLE = false;

try {
  // This will throw if native module isn't linked (Expo Go)
  const elevenlabs = require('@elevenlabs/react-native');
  const livekit = require('@livekit/react-native');
  useConversation = elevenlabs.useConversation;
  AudioSession = livekit.AudioSession;
  VOICE_AVAILABLE = true;

  // Configure iOS audio for LOUDER output BEFORE SDK's useEffect runs
  // Using 'spokenAudio' mode - optimized for voice content (podcasts/audiobooks)
  // This typically results in louder playback than 'voiceChat' mode
  if (Platform.OS === 'ios' && AudioSession) {
    AudioSession.setAppleAudioConfiguration({
      audioCategory: 'playAndRecord',
      audioCategoryOptions: ['defaultToSpeaker', 'allowBluetooth', 'allowBluetoothA2DP'],
      audioMode: 'spokenAudio',  // Optimized for spoken content - louder than voiceChat
    }).catch(() => {
      // Ignore errors - audio may still work with SDK defaults
    });
  }
} catch (e) {
  if (__DEV__) {
    console.warn('[AbbyAgent] Voice native modules not available. Run with a development build (expo run:ios) for voice support.');
  }
  // Mock useConversation for when native modules aren't available
  // This lets the app run in Expo Go for UI development
  // Provides helpful error feedback via callbacks
  useConversation = (options?: ConversationCallbacks): Conversation => ({
    status: 'disconnected',
    isSpeaking: false,
    canSendFeedback: false,
    startSession: async () => {
      console.warn('[AbbyAgent] Voice not available - run with expo run:ios');
      // Call error callback to provide user feedback
      options?.onError?.(
        'Voice features require a development build. Run: npx expo run:ios',
        { reason: 'native_modules_unavailable', platform: 'expo_go' }
      );
    },
    endSession: async () => {},
    getId: () => '',
    sendFeedback: () => {},
    sendContextualUpdate: () => {},
    sendUserMessage: () => {},
    sendUserActivity: () => {},
  });
}

// Agent ID from ElevenLabs dashboard
const AGENT_ID = process.env.EXPO_PUBLIC_ELEVENLABS_AGENT_ID || '';

export interface AbbyAgentConfig {
  enabled?: boolean;  // When false, startConversation is a no-op (saves resources)
  onUserTranscript?: (text: string) => void;
  onAbbyResponse?: (text: string) => void;
  onError?: (error: Error) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function useAbbyAgent(config: AbbyAgentConfig = {}) {
  // Destructure config with defaults
  const { enabled = true, ...callbacks } = config;

  // Stabilize callbacks to prevent useCallback recreation on every render
  // Pattern from SpeechRecognition.ts - avoids stale closure issues
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  // Zustand selectors (separate for performance)
  const setAudioLevel = useVibeController((s) => s.setAudioLevel);
  const setAbbyMode = useVibeController((s) => s.setAbbyMode);
  const startSpeakingPulse = useVibeController((s) => s.startSpeakingPulse);
  const stopSpeakingPulse = useVibeController((s) => s.stopSpeakingPulse);

  // Session state - prevents double-starting
  const [isStarting, setIsStarting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isTogglingMute, setIsTogglingMute] = useState(false); // Prevents race condition on rapid toggle

  // Ref to track muted state in callbacks (validator fix - prevents pulse restart while muted)
  const isMutedRef = useRef(false);

  // Sync ref with state (callbacks can't read state directly due to closures)
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Pulse animation ref (persists across renders)
  const pulseIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pulseTimeRef = useRef(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pulseIntervalRef.current) {
        clearInterval(pulseIntervalRef.current);
      }
    };
  }, []);

  // Simulated audio level pulsing (SDK doesn't provide real amplitude)
  const startAudioPulse = useCallback(() => {
    if (pulseIntervalRef.current) clearInterval(pulseIntervalRef.current);
    pulseTimeRef.current = 0;

    pulseIntervalRef.current = setInterval(() => {
      pulseTimeRef.current += 0.1;
      const t = pulseTimeRef.current;

      // Organic speech-like pulse pattern
      // Combines multiple sine waves for natural-feeling variation
      const level =
        0.35 + // Base level
        Math.sin(t * 4) * 0.2 + // Primary rhythm
        Math.sin(t * 7) * 0.1 + // Secondary variation
        Math.sin(t * 11) * 0.05; // Micro-variation

      setAudioLevel(Math.max(0, Math.min(1, level)));
    }, 50); // 20fps update rate
  }, [setAudioLevel]);

  const stopAudioPulse = useCallback(() => {
    if (pulseIntervalRef.current) {
      clearInterval(pulseIntervalRef.current);
      pulseIntervalRef.current = null;
    }
    setAudioLevel(0);
  }, [setAudioLevel]);

  // Timeout helper to prevent hanging on AudioSession calls
  // Defined early so it's available for startConversation, endConversation, and mute/unmute
  const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
      ),
    ]);
  };

  // Initialize conversation with ElevenLabs SDK
  // Using correct callback signatures per ElevenLabs React Native docs
  const conversation = useConversation({
    onConnect: ({ conversationId }: { conversationId: string }) => {
      if (__DEV__) console.log('[AbbyAgent] Connected:', conversationId);
      setIsConnected(true);
      setIsStarting(false);
      setAbbyMode('SPEAKING');

      // Force speaker output after connection established
      // SDK already started audio session, we just ensure speaker routing
      if (Platform.OS === 'ios' && AudioSession) {
        AudioSession.selectAudioOutput('force_speaker').catch(() => {});
      }

      callbacksRef.current.onConnect?.();
    },

    onDisconnect: (details: string) => {
      if (__DEV__) console.log('[AbbyAgent] Disconnected:', details);
      setIsConnected(false);
      setIsStarting(false);
      stopSpeakingPulse();
      stopAudioPulse();

      // IMPORTANT: Do NOT call stopAudioSession() here!
      // The SDK manages its own audio cleanup. Calling stopAudioSession()
      // during SDK-initiated disconnect interrupts LiveKit's track management
      // and causes "could not find local track subscription" warnings.
      // Audio session cleanup happens in endConversation() instead.

      callbacksRef.current.onDisconnect?.();
    },

    onMessage: ({ message, source }: { message: string; source: string }) => {
      if (__DEV__) console.log(`[AbbyAgent] Message from ${source}:`, message);

      // SDK v0.5.7+ simplified API: message is the extracted text string
      // source is 'user' for user transcripts, 'ai' for agent responses
      if (source === 'user') {
        callbacksRef.current.onUserTranscript?.(message);
      } else if (source === 'ai') {
        callbacksRef.current.onAbbyResponse?.(message);
      }
    },

    onModeChange: ({ mode }: { mode: 'speaking' | 'listening' }) => {
      if (__DEV__) console.log('[AbbyAgent] Mode:', mode);

      // Skip visual updates while muted (validator fix - prevents pulse restart)
      if (isMutedRef.current) {
        if (__DEV__) console.log('[AbbyAgent] Muted, skipping mode change visual update');
        return;
      }

      if (mode === 'speaking') {
        startSpeakingPulse();
        startAudioPulse();
        setAbbyMode('SPEAKING');
      } else if (mode === 'listening') {
        stopSpeakingPulse();
        stopAudioPulse();
        setAbbyMode('PROCESSING'); // User is talking
      } else {
        // Thinking/processing
        stopAudioPulse();
        setAbbyMode('PROCESSING');
      }
    },

    onStatusChange: ({ status }: { status: string }) => {
      if (__DEV__) console.log('[AbbyAgent] Status:', status);
    },

    onError: (message: string, context?: Record<string, unknown>) => {
      console.error('[AbbyAgent] Error:', message, context);
      stopAudioPulse();
      callbacksRef.current.onError?.(new Error(message));
    },
  });

  // Start conversation with ElevenLabs agent
  // Uses guards to prevent double-starts and race conditions
  const startConversation = useCallback(async () => {
    // Guard 1: Voice not available (Expo Go)
    if (!VOICE_AVAILABLE) {
      console.warn('[AbbyAgent] Voice not available. Run with: npx expo run:ios');
      callbacksRef.current.onError?.(new Error('Voice requires a development build. Run: npx expo run:ios'));
      return;
    }

    // Guard 2: Disabled (saves resources when not in COACH mode)
    if (!enabled) {
      if (__DEV__) console.log('[AbbyAgent] Disabled, skipping start');
      return;
    }

    // Guard 3: Already starting
    if (isStarting) {
      if (__DEV__) console.log('[AbbyAgent] Already starting, skipping');
      return;
    }

    // Guard 4: Already connected
    if (isConnected) {
      if (__DEV__) console.log('[AbbyAgent] Already connected, skipping');
      return;
    }

    // Guard 5: Check SDK status
    if (conversation.status === 'connected' || conversation.status === 'connecting') {
      if (__DEV__) console.log('[AbbyAgent] SDK already connected/connecting, skipping');
      return;
    }

    // Guard 6: Agent ID required and valid format
    if (!AGENT_ID || AGENT_ID.trim().length === 0) {
      const error = new Error('ELEVENLABS_AGENT_ID not configured. Add it to .env.local');
      callbacksRef.current.onError?.(error);
      throw error;
    }

    // Guard 7: Agent ID format validation
    if (!AGENT_ID.startsWith('agent_')) {
      const error = new Error('ELEVENLABS_AGENT_ID must start with "agent_". Check your .env.local configuration.');
      callbacksRef.current.onError?.(error);
      throw error;
    }

    setIsStarting(true);
    if (__DEV__) console.log('[AbbyAgent] Starting session with agent:', AGENT_ID.slice(0, 8) + '...');

    try {
      // CRITICAL: Start audio session BEFORE SDK initiates WebRTC connection
      // The SDK expects audio infrastructure to be ready when it publishes tracks
      // Without this, microphone track may publish but not actually capture audio,
      // causing the agent to disconnect after timeout (no audio input detected)
      if (Platform.OS === 'ios' && AudioSession) {
        try {
          if (__DEV__) console.log('[AbbyAgent] Pre-starting audio session...');
          await withTimeout(AudioSession.startAudioSession(), 5000);
          await withTimeout(AudioSession.selectAudioOutput('force_speaker'), 5000);
          if (__DEV__) console.log('[AbbyAgent] Audio session ready');
        } catch (err) {
          // Log but continue - SDK may still work with its own audio init
          console.warn('[AbbyAgent] Audio pre-start warning:', err);
        }
      }

      await conversation.startSession({ agentId: AGENT_ID });
    } catch (err) {
      console.error('[AbbyAgent] Failed to start session:', err);
      setIsStarting(false);
      callbacksRef.current.onError?.(err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }, [enabled, isStarting, isConnected, conversation.status]);

  // End conversation
  const endConversation = useCallback(async () => {
    if (!isConnected && conversation.status !== 'connected') {
      if (__DEV__) console.log('[AbbyAgent] Not connected, nothing to end');
      return;
    }

    if (__DEV__) console.log('[AbbyAgent] Ending session');
    stopAudioPulse();
    stopSpeakingPulse();
    setIsConnected(false);
    setIsMuted(false);

    try {
      // First end the SDK session - let it clean up WebRTC tracks
      await conversation.endSession();

      // THEN stop audio session (after SDK cleanup is complete)
      // This is the correct place for audio teardown, not onDisconnect
      if (Platform.OS === 'ios' && AudioSession) {
        try {
          await withTimeout(AudioSession.stopAudioSession(), 3000);
          if (__DEV__) console.log('[AbbyAgent] Audio session stopped after conversation end');
        } catch (err) {
          console.warn('[AbbyAgent] Audio stop warning:', err);
          // Don't throw - audio cleanup is best-effort
        }
      }
    } catch (err) {
      console.error('[AbbyAgent] Failed to end session:', err);
      // Don't throw - ending should be graceful
    }
  }, [isConnected, conversation.status, stopAudioPulse, stopSpeakingPulse]);

  // Mute conversation (stops audio I/O - agent keeps running on backend)
  const muteConversation = useCallback(async () => {
    if (!isConnected || isMuted || isTogglingMute) return;

    setIsTogglingMute(true);
    if (__DEV__) console.log('[AbbyAgent] Muting conversation');

    // Stop audio FIRST, then update state
    if (Platform.OS === 'ios' && AudioSession) {
      try {
        await withTimeout(AudioSession.stopAudioSession(), 5000);
        if (__DEV__) console.log('[AbbyAgent] Audio session stopped (muted)');
      } catch (err) {
        console.warn('[AbbyAgent] Failed to mute audio:', err);
        callbacksRef.current.onError?.(err instanceof Error ? err : new Error('Failed to mute audio'));
        setIsTogglingMute(false);
        return; // Don't update state - keep UI honest about actual audio state
      }
    } else if (Platform.OS === 'android') {
      // Android: State-only mute (no native AudioSession support)
      if (__DEV__) console.warn('[AbbyAgent] Android mute is UI-only - audio may continue');
    }

    // Update state AFTER successful audio stop (or on Android where it's UI-only)
    setIsMuted(true);
    setIsTogglingMute(false);
    stopAudioPulse();
    stopSpeakingPulse();
    setAbbyMode('IDLE');
  }, [isConnected, isMuted, isTogglingMute, stopAudioPulse, stopSpeakingPulse, setAbbyMode]);

  // Unmute conversation (restarts audio I/O)
  const unmuteConversation = useCallback(async () => {
    if (!isConnected || !isMuted || isTogglingMute) return;

    setIsTogglingMute(true);
    if (__DEV__) console.log('[AbbyAgent] Unmuting conversation');

    // Restart audio FIRST using SIMPLE config (confirmed working)
    if (Platform.OS === 'ios' && AudioSession) {
      try {
        await withTimeout(AudioSession.configureAudio({ ios: { defaultOutput: 'speaker' } }), 5000);
        await withTimeout(AudioSession.startAudioSession(), 5000);
        await withTimeout(AudioSession.selectAudioOutput('force_speaker'), 5000);
        if (__DEV__) console.log('[AbbyAgent] Audio session resumed (force_speaker)');
      } catch (err) {
        console.warn('[AbbyAgent] Failed to resume audio:', err);
        callbacksRef.current.onError?.(err instanceof Error ? err : new Error('Failed to unmute audio'));
        setIsTogglingMute(false);
        return; // Don't update state - keep UI honest about actual audio state
      }
    } else if (Platform.OS === 'android') {
      // Android: State-only unmute (no native AudioSession support)
      if (__DEV__) console.warn('[AbbyAgent] Android unmute is UI-only');
    }

    // Update state AFTER successful audio restart (or on Android where it's UI-only)
    setIsMuted(false);
    setIsTogglingMute(false);
    setAbbyMode('LISTENING');
  }, [isConnected, isMuted, isTogglingMute, setAbbyMode]);

  // Toggle mute/unmute
  const toggleMute = useCallback(async () => {
    if (isMuted) {
      await unmuteConversation();
    } else {
      await muteConversation();
    }
  }, [isMuted, muteConversation, unmuteConversation]);

  // Send a text message to the agent (for typed input)
  const sendTextMessage = useCallback((text: string) => {
    if (!isConnected) {
      if (__DEV__) console.warn('[AbbyAgent] Cannot send message - not connected');
      return;
    }

    if (!text.trim()) {
      if (__DEV__) console.warn('[AbbyAgent] Cannot send empty message');
      return;
    }

    if (__DEV__) console.log('[AbbyAgent] Sending text message:', text.slice(0, 50) + '...');
    conversation.sendUserMessage(text.trim());
  }, [isConnected, conversation]);

  return {
    startConversation,
    endConversation,
    muteConversation,
    unmuteConversation,
    toggleMute,
    sendTextMessage,
    isSpeaking: conversation.isSpeaking,
    isConnected,
    isStarting,
    isMuted,
    status: conversation.status,
    voiceAvailable: VOICE_AVAILABLE,
  };
}

export default useAbbyAgent;
