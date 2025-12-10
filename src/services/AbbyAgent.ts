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
import { useConversation } from '@elevenlabs/react-native';
import { AudioSession } from '@livekit/react-native';
import { useVibeController } from '../store/useVibeController';

// Agent ID from ElevenLabs dashboard
const AGENT_ID = process.env.EXPO_PUBLIC_ELEVENLABS_AGENT_ID || '';

export interface AbbyAgentConfig {
  onUserTranscript?: (text: string) => void;
  onAbbyResponse?: (text: string) => void;
  onError?: (error: Error) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function useAbbyAgent(config: AbbyAgentConfig = {}) {
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

      // Configure and start LiveKit audio session for iOS
      if (Platform.OS === 'ios') {
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

      config.onConnect?.();
    },

    onDisconnect: (details: string) => {
      if (__DEV__) console.log('[AbbyAgent] Disconnected:', details);
      setIsConnected(false);
      setIsStarting(false);
      stopSpeakingPulse();
      stopAudioPulse();

      // Stop iOS audio session
      if (Platform.OS === 'ios') {
        AudioSession.stopAudioSession().catch(() => {
          // Ignore errors on stop
        });
      }

      config.onDisconnect?.();
    },

    onMessage: ({ message, source }: { message: any; source: string }) => {
      if (__DEV__) console.log(`[AbbyAgent] Message from ${source}:`, message);

      // User transcript - SDK uses nested structure per types.d.ts
      if (message.type === 'user_transcript') {
        const text = message.user_transcription_event?.user_transcript;
        if (text) config.onUserTranscript?.(text);
      }

      // Agent response - SDK uses nested structure per types.d.ts
      if (message.type === 'agent_response') {
        const text = message.agent_response_event?.agent_response;
        if (text) config.onAbbyResponse?.(text);
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
      config.onError?.(new Error(message));
    },
  });

  // Start conversation with ElevenLabs agent
  // Uses guards to prevent infinite loop from unstable references
  const startConversation = useCallback(async () => {
    // Guard 1: Already starting
    if (isStarting) {
      if (__DEV__) console.log('[AbbyAgent] Already starting, skipping');
      return;
    }

    // Guard 2: Already connected
    if (isConnected) {
      if (__DEV__) console.log('[AbbyAgent] Already connected, skipping');
      return;
    }

    // Guard 3: Check SDK status
    if (conversation.status === 'connected' || conversation.status === 'connecting') {
      if (__DEV__) console.log('[AbbyAgent] SDK already connected/connecting, skipping');
      return;
    }

    if (!AGENT_ID) {
      throw new Error(
        'ELEVENLABS_AGENT_ID not configured. Add it to .env.local'
      );
    }

    setIsStarting(true);
    if (__DEV__) console.log('[AbbyAgent] Starting session with agent:', AGENT_ID.slice(0, 8) + '...');

    try {
      await conversation.startSession({ agentId: AGENT_ID });
    } catch (err) {
      console.error('[AbbyAgent] Failed to start session:', err);
      setIsStarting(false);
      throw err;
    }
  }, [isStarting, isConnected, conversation.status]);

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
  };
}

export default useAbbyAgent;
