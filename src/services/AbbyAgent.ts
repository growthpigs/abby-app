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

import { useCallback, useRef, useEffect } from 'react';
import { useConversation } from '@elevenlabs/react-native';
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
  const conversation = useConversation({
    onConnect: () => {
      if (__DEV__) console.log('[AbbyAgent] Connected');
      setAbbyMode('SPEAKING');
      config.onConnect?.();
    },

    onDisconnect: () => {
      if (__DEV__) console.log('[AbbyAgent] Disconnected');
      stopSpeakingPulse();
      stopAudioPulse();
      config.onDisconnect?.();
    },

    onMessage: (message: { type: string; text?: string }) => {
      if (__DEV__) console.log('[AbbyAgent] Message:', message.type);

      if (message.type === 'user_transcript' && message.text) {
        config.onUserTranscript?.(message.text);
      }

      if (message.type === 'agent_response' && message.text) {
        config.onAbbyResponse?.(message.text);
      }
    },

    onModeChange: (mode: { mode: string }) => {
      if (__DEV__) console.log('[AbbyAgent] Mode:', mode.mode);

      if (mode.mode === 'speaking') {
        startSpeakingPulse();
        startAudioPulse();
        setAbbyMode('SPEAKING');
      } else if (mode.mode === 'listening') {
        stopSpeakingPulse();
        stopAudioPulse();
        setAbbyMode('PROCESSING'); // User is talking
      } else {
        // Thinking/processing
        stopAudioPulse();
        setAbbyMode('PROCESSING');
      }
    },

    onError: (error: Error) => {
      console.error('[AbbyAgent] Error:', error);
      stopAudioPulse();
      config.onError?.(error);
    },
  });

  // Start conversation with ElevenLabs agent
  const startConversation = useCallback(async () => {
    if (!AGENT_ID) {
      throw new Error(
        'ELEVENLABS_AGENT_ID not configured. Add it to .env.local'
      );
    }

    if (__DEV__) console.log('[AbbyAgent] Starting session with agent:', AGENT_ID.slice(0, 8) + '...');

    try {
      await conversation.startSession({ agentId: AGENT_ID });
    } catch (err) {
      console.error('[AbbyAgent] Failed to start session:', err);
      throw err;
    }
  }, [conversation]);

  // End conversation
  const endConversation = useCallback(async () => {
    if (__DEV__) console.log('[AbbyAgent] Ending session');
    stopAudioPulse();
    stopSpeakingPulse();

    try {
      await conversation.endSession();
    } catch (err) {
      console.error('[AbbyAgent] Failed to end session:', err);
      // Don't throw - ending should be graceful
    }
  }, [conversation, stopAudioPulse, stopSpeakingPulse]);

  return {
    startConversation,
    endConversation,
    isSpeaking: conversation.isSpeaking,
    status: conversation.status,
  };
}

export default useAbbyAgent;
