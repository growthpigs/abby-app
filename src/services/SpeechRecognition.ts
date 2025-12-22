/**
 * SpeechRecognition - STT Service for User Input
 *
 * Uses @react-native-voice/voice for speech-to-text recognition.
 * Provides a React hook for easy integration with components.
 *
 * Voice I/O Strategy:
 * - This handles user voice INPUT (STT)
 * - AbbyVoice/ElevenLabs handles Abby's OUTPUT (TTS)
 */

import { useCallback, useEffect, useState, useRef } from 'react';
import Voice, {
  SpeechResultsEvent,
  SpeechErrorEvent,
  SpeechEndEvent,
  SpeechStartEvent,
} from '@react-native-voice/voice';

export interface SpeechRecognitionState {
  isListening: boolean;
  transcript: string;
  partialTranscript: string;
  error: string | null;
}

export interface UseSpeechRecognitionConfig {
  onResult?: (transcript: string) => void;
  onPartialResult?: (partial: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
  locale?: string; // e.g., 'en-US'
}

/**
 * Hook for speech recognition
 */
export function useSpeechRecognition(config: UseSpeechRecognitionConfig = {}) {
  const { locale = 'en-US' } = config;

  const [state, setState] = useState<SpeechRecognitionState>({
    isListening: false,
    transcript: '',
    partialTranscript: '',
    error: null,
  });

  // Use refs to avoid stale closure issues
  const configRef = useRef(config);
  configRef.current = config;

  // Handle speech start
  const onSpeechStart = useCallback((e: SpeechStartEvent) => {
    if (__DEV__) console.log('[SpeechRecognition] Started:', e);
    setState((prev) => ({
      ...prev,
      isListening: true,
      error: null,
      partialTranscript: '',
    }));
    configRef.current.onStart?.();
  }, []);

  // Handle speech end
  const onSpeechEnd = useCallback((e: SpeechEndEvent) => {
    if (__DEV__) console.log('[SpeechRecognition] Ended:', e);
    setState((prev) => ({
      ...prev,
      isListening: false,
    }));
    configRef.current.onEnd?.();
  }, []);

  // Handle final results
  const onSpeechResults = useCallback((e: SpeechResultsEvent) => {
    if (__DEV__) console.log('[SpeechRecognition] Results:', e.value);
    const transcript = e.value?.[0] || '';

    setState((prev) => ({
      ...prev,
      transcript,
      partialTranscript: '',
    }));

    if (transcript) {
      configRef.current.onResult?.(transcript);
    }
  }, []);

  // Handle partial results (during speaking)
  const onSpeechPartialResults = useCallback((e: SpeechResultsEvent) => {
    const partial = e.value?.[0] || '';

    setState((prev) => ({
      ...prev,
      partialTranscript: partial,
    }));

    if (partial) {
      configRef.current.onPartialResult?.(partial);
    }
  }, []);

  // Handle errors
  const onSpeechError = useCallback((e: SpeechErrorEvent) => {
    console.error('[SpeechRecognition] Error:', e.error);
    const errorMessage = e.error?.message || 'Unknown speech error';

    setState((prev) => ({
      ...prev,
      isListening: false,
      error: errorMessage,
    }));

    configRef.current.onError?.(errorMessage);
  }, []);

  // Setup event listeners
  useEffect(() => {
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechPartialResults = onSpeechPartialResults;
    Voice.onSpeechError = onSpeechError;

    // Cleanup on unmount
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, [onSpeechStart, onSpeechEnd, onSpeechResults, onSpeechPartialResults, onSpeechError]);

  // Start listening
  const startListening = useCallback(async () => {
    try {
      setState((prev) => ({
        ...prev,
        error: null,
        transcript: '',
        partialTranscript: '',
      }));

      await Voice.start(locale);
    } catch (err) {
      console.error('[SpeechRecognition] Failed to start:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to start';
      setState((prev) => ({
        ...prev,
        error: errorMessage,
      }));
    }
  }, [locale]);

  // Stop listening
  const stopListening = useCallback(async () => {
    try {
      await Voice.stop();
    } catch (err) {
      console.error('[SpeechRecognition] Failed to stop:', err);
    }
  }, []);

  // Cancel (stop without finalizing)
  const cancelListening = useCallback(async () => {
    try {
      await Voice.cancel();
      setState((prev) => ({
        ...prev,
        isListening: false,
        partialTranscript: '',
      }));
    } catch (err) {
      console.error('[SpeechRecognition] Failed to cancel:', err);
    }
  }, []);

  // Check if speech recognition is available
  const checkAvailability = useCallback(async (): Promise<boolean> => {
    try {
      const isAvailable = await Voice.isAvailable();
      return !!isAvailable;
    } catch {
      return false;
    }
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    cancelListening,
    checkAvailability,
  };
}

/**
 * Standalone service class for non-hook usage
 */
class SpeechRecognitionService {
  private listeners: {
    onResult?: (transcript: string) => void;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: string) => void;
  } = {};

  async initialize() {
    Voice.onSpeechStart = () => {
      this.listeners.onStart?.();
    };

    Voice.onSpeechEnd = () => {
      this.listeners.onEnd?.();
    };

    Voice.onSpeechResults = (e: SpeechResultsEvent) => {
      const transcript = e.value?.[0] || '';
      if (transcript) {
        this.listeners.onResult?.(transcript);
      }
    };

    Voice.onSpeechError = (e: SpeechErrorEvent) => {
      const errorMessage = e.error?.message || 'Unknown speech error';
      this.listeners.onError?.(errorMessage);
    };
  }

  setListeners(listeners: typeof this.listeners) {
    this.listeners = listeners;
  }

  async start(locale: string = 'en-US') {
    await Voice.start(locale);
  }

  async stop() {
    await Voice.stop();
  }

  async cancel() {
    await Voice.cancel();
  }

  async destroy() {
    await Voice.destroy();
    Voice.removeAllListeners();
  }

  async isAvailable(): Promise<boolean> {
    try {
      const available = await Voice.isAvailable();
      return !!available;
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const speechRecognition = new SpeechRecognitionService();

export default useSpeechRecognition;
