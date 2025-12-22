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

interface ConversationCallbacks {
  onConnect?: (props: { conversationId: string }) => void;
  onDisconnect?: (details: string) => void;
  onError?: (message: string, context?: Record<string, unknown>) => void;
  onMessage?: (props: { message: any; source: string }) => void;
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

  // Zustand selectors (separate for performance)
  const setAudioLevel = useVibeController((s) => s.setAudioLevel);
  const setAbbyMode = useVibeController((s) => s.setAbbyMode);
  const startSpeakingPulse = useVibeController((s) => s.startSpeakingPulse);
  const stopSpeakingPulse = useVibeController((s) => s.stopSpeakingPulse);

  // Session state - prevents double-starting
  const [isStarting, setIsStarting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

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

  // Initialize conversation with ElevenLabs SDK
  // Using correct callback signatures per ElevenLabs React Native docs
  const conversation = useConversation({
    onConnect: ({ conversationId }: { conversationId: string }) => {
      if (__DEV__) console.log('[AbbyAgent] Connected:', conversationId);
      setIsConnected(true);
      setIsStarting(false);
      setAbbyMode('SPEAKING');

      // Configure and start LiveKit audio session for iOS (if available)
      if (Platform.OS === 'ios' && AudioSession) {
        (async () => {
          try {
            // Configure audio for speaker output
            await AudioSession.configureAudio({
              ios: { defaultOutput: 'speaker' }
            });
            if (__DEV__) console.log('[AbbyAgent] iOS audio configured for speaker');

            // Start the audio session
            await AudioSession.startAudioSession();
            if (__DEV__) console.log('[AbbyAgent] iOS audio session started');

            // Force speaker output
            await AudioSession.selectAudioOutput('force_speaker');
            if (__DEV__) console.log('[AbbyAgent] iOS audio output set to speaker');
          } catch (err) {
            console.warn('[AbbyAgent] Failed to configure audio session:', err);
          }
        })();
      }

      callbacks.onConnect?.();
    },

    onDisconnect: (details: string) => {
      if (__DEV__) console.log('[AbbyAgent] Disconnected:', details);
      setIsConnected(false);
      setIsStarting(false);
      stopSpeakingPulse();
      stopAudioPulse();

      // Stop iOS audio session (if available)
      if (Platform.OS === 'ios' && AudioSession) {
        AudioSession.stopAudioSession().catch(() => {
          // Ignore errors on stop
        });
      }

      callbacks.onDisconnect?.();
    },

    onMessage: ({ message, source }: { message: any; source: string }) => {
      if (__DEV__) console.log(`[AbbyAgent] Message from ${source}:`, message);

      // User transcript - SDK uses nested structure per types.d.ts
      if (message.type === 'user_transcript') {
        const text = message.user_transcription_event?.user_transcript;
        if (text) callbacks.onUserTranscript?.(text);
      }

      // Agent response - SDK uses nested structure per types.d.ts
      if (message.type === 'agent_response') {
        const text = message.agent_response_event?.agent_response;
        if (text) callbacks.onAbbyResponse?.(text);
      }
    },

    onModeChange: ({ mode }: { mode: 'speaking' | 'listening' }) => {
      if (__DEV__) console.log('[AbbyAgent] Mode:', mode);

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
      callbacks.onError?.(new Error(message));
    },
  });

  // Start conversation with ElevenLabs agent
  // Uses guards to prevent double-starts and race conditions
  const startConversation = useCallback(async () => {
    // Guard 1: Voice not available (Expo Go)
    if (!VOICE_AVAILABLE) {
      console.warn('[AbbyAgent] Voice not available. Run with: npx expo run:ios');
      callbacks.onError?.(new Error('Voice requires a development build. Run: npx expo run:ios'));
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
      callbacks.onError?.(error);
      throw error;
    }

    // Guard 7: Agent ID format validation
    if (!AGENT_ID.startsWith('agent_')) {
      const error = new Error('ELEVENLABS_AGENT_ID must start with "agent_". Check your .env.local configuration.');
      callbacks.onError?.(error);
      throw error;
    }

    setIsStarting(true);
    if (__DEV__) console.log('[AbbyAgent] Starting session with agent:', AGENT_ID.slice(0, 8) + '...');

    try {
      // Start audio session BEFORE connecting (iOS only)
      // Must set proper audio category for two-way audio (playAndRecord)
      if (Platform.OS === 'ios' && AudioSession) {
        try {
          // Configure default output
          await AudioSession.configureAudio({
            ios: { defaultOutput: 'speaker' }
          });

          // Set Apple audio configuration for two-way voice
          // playAndRecord category enables both mic and speaker
          // defaultToSpeaker routes output through speaker (not earpiece)
          await AudioSession.setAppleAudioConfiguration({
            audioCategory: 'playAndRecord',
            audioCategoryOptions: ['defaultToSpeaker', 'allowBluetooth', 'mixWithOthers'],
            audioMode: 'voiceChat',
          });

          await AudioSession.startAudioSession();
          await AudioSession.selectAudioOutput('force_speaker');
          if (__DEV__) console.log('[AbbyAgent] iOS audio: playAndRecord + voiceChat + speaker');
        } catch (audioErr) {
          console.warn('[AbbyAgent] Pre-connect audio setup failed:', audioErr);
        }
      }

      await conversation.startSession({ agentId: AGENT_ID });
    } catch (err) {
      console.error('[AbbyAgent] Failed to start session:', err);
      setIsStarting(false);
      callbacks.onError?.(err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }, [enabled, isStarting, isConnected, conversation.status, callbacks.onError]);

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

    try {
      await conversation.endSession();
    } catch (err) {
      console.error('[AbbyAgent] Failed to end session:', err);
      // Don't throw - ending should be graceful
    }
  }, [isConnected, conversation.status, stopAudioPulse, stopSpeakingPulse]);

  return {
    startConversation,
    endConversation,
    isSpeaking: conversation.isSpeaking,
    isConnected,
    isStarting,
    status: conversation.status,
    voiceAvailable: VOICE_AVAILABLE,
  };
}

export default useAbbyAgent;
