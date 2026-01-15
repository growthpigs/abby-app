/**
 * AbbyRealtimeService - OpenAI Realtime API Integration
 *
 * Handles real-time voice conversations with Abby using the client's backend.
 * Replaces ElevenLabs integration with client's OpenAI Realtime API.
 *
 * API Endpoints:
 * - POST /v1/abby/realtime/session - Create WebRTC/WebSocket session
 * - POST /v1/abby/session/{id}/end - End session
 * - POST /v1/abby/realtime/{session_id}/message - Send text message
 * - GET /v1/abby/memory/context - Get conversation context
 * - GET /v1/abby/realtime/available - Check API availability
 *
 * Audio Playback:
 * - Uses native Text-to-Speech (TTS) to speak Abby's responses
 * - Updates isSpeakingState during audio playback
 * - Respects mute setting - no audio when muted
 *
 * NOTE: This includes TTS support via native platform APIs.
 * Real OpenAI Realtime API requires WebRTC/WebSocket connection handling.
 */

import { TokenManager } from './TokenManager';
import { secureFetch, type SecureFetchError } from '../utils/secureFetch';
import { TIMEOUTS, API_CONFIG, FEATURE_FLAGS } from '../config';
import { abbyTTS } from './AbbyTTSService';

const API_BASE_URL = API_CONFIG.API_URL;

// Request timeout for realtime API (20 seconds - slightly longer for voice)
const REQUEST_TIMEOUT_MS = TIMEOUTS.NETWORK.REALTIME;

// Availability check timeout (5 seconds - fast fail)
const AVAILABILITY_TIMEOUT_MS = TIMEOUTS.NETWORK.AVAILABILITY;

// ========================================
// Demo Mode Responses
// ========================================

const DEMO_INTRO_MESSAGES = [
  "Hi there! I'm Abby, your AI matchmaker. I'm running in demo mode right now, but I can still show you how our conversation would flow.",
  "I'd normally ask you questions about what you're looking for in a partner, your interests, values, and relationship goals.",
  "When the full system is connected, I'll use our conversation to understand you deeply and find your perfect match.",
  "For now, feel free to explore the app! Tap 'Start Interview' when you're ready to continue.",
];

const DEMO_COACH_MESSAGES = [
  "Great job completing the interview! In demo mode, I can't give you real match insights yet.",
  "Once we're fully connected, I'll help you prepare for your first date, offer conversation starters, and provide personalized advice.",
  "Is there anything you'd like to know about how Abby works?",
];

// ========================================
// Types
// ========================================

export interface RealtimeSessionResponse {
  sessionId: string;
  wsUrl?: string; // WebSocket URL if provided
  rtcConfig?: RTCConfiguration; // WebRTC config if provided
  expiresAt: string;
}

export interface RealtimeMessageRequest {
  message: string;
  userId?: string;
}

export interface ConversationCallbacks {
  onAbbyResponse?: (text: string) => void;
  onUserTranscript?: (text: string) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  onAudioLevel?: (level: number) => void;  // For orb animation during TTS
}

// ========================================
// Service Implementation
// ========================================

export class AbbyRealtimeService {
  private sessionId: string | null = null;
  private ws: WebSocket | null = null;
  private isConnectedState: boolean = false;
  private isMutedState: boolean = false;
  private isSpeakingState: boolean = false;
  private isDemoModeState: boolean = false;
  private demoMessageIndex: number = 0;
  // Timer tracking: Use Set to track ALL timers for proper cleanup
  private activeTimers: Set<NodeJS.Timeout> = new Set();
  private callbacks: ConversationCallbacks = {};
  private screenType: 'intro' | 'coach' = 'intro';
  // Conversation history for multi-turn chat context (OpenAI format)
  private conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  constructor(callbacks?: ConversationCallbacks, screenType: 'intro' | 'coach' = 'intro') {
    this.callbacks = callbacks || {};
    this.screenType = screenType;
  }

  /**
   * Schedule a timer that is automatically tracked for cleanup.
   * When the timer fires, it removes itself from the Set.
   * When endConversation() is called, all remaining timers are cleared.
   */
  private scheduleTimer(callback: () => void, delay: number): NodeJS.Timeout {
    const timer = setTimeout(() => {
      this.activeTimers.delete(timer);
      callback();
    }, delay);
    this.activeTimers.add(timer);
    return timer;
  }

  /**
   * Clear all tracked timers (called during cleanup)
   */
  private clearAllTimers(): void {
    this.activeTimers.forEach((timer) => clearTimeout(timer));
    this.activeTimers.clear();
  }

  /**
   * Start a real-time conversation session
   * Falls back to demo mode if API is unavailable
   */
  async startConversation(): Promise<void> {
    try {
      if (__DEV__) console.log('[AbbyRealtime] Starting conversation...');

      // Clear conversation history for fresh start
      this.conversationHistory = [];

      // Check API availability first
      const isAvailable = await this.checkAvailability();
      if (!isAvailable) {
        const msg = `Backend unavailable at ${API_BASE_URL}. Entering demo mode.`;
        if (__DEV__) {
          console.warn('[AbbyRealtime]', msg);
          console.warn('[AbbyRealtime] Set EXPO_PUBLIC_USE_REAL_API=true in .env to use real backend');
        }
        return this.startDemoMode();
      }

      // Get access token
      const token = await TokenManager.getToken();
      if (!token) {
        if (__DEV__) console.log('[AbbyRealtime] No token, entering demo mode');
        return this.startDemoMode();
      }

      // Create session
      const response = await secureFetch(`${API_BASE_URL}/abby/realtime/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          // TODO: Add session config if needed
        }),
        timeout: REQUEST_TIMEOUT_MS,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'no response body');
        if (__DEV__) {
          console.error('[AbbyRealtime] Session creation failed');
          console.error('[AbbyRealtime]   Status:', response.status);
          console.error('[AbbyRealtime]   URL:', `${API_BASE_URL}/abby/realtime/session`);
          console.error('[AbbyRealtime]   Response:', errorText);
          console.log('[AbbyRealtime] Entering demo mode');
        }
        return this.startDemoMode();
      }

      const data: any = await response.json();
      const receivedFields = Object.keys(data).join(', ') || 'empty';

      // Debug: Log the actual response to see what field the backend is using
      if (__DEV__) {
        console.log('[AbbyRealtime] Session response:', JSON.stringify(data, null, 2));
        console.log('[AbbyRealtime] Available fields:', receivedFields);
      }

      // Try multiple field names (sessionId, id, session_id, session, uuid, etc.)
      this.sessionId = data.sessionId || data.id || data.session_id || data.session || data.uuid || null;

      // CRITICAL: If no session ID found, report what fields we got and enter demo mode
      if (!this.sessionId) {
        if (__DEV__) console.error('[AbbyRealtime] No session ID found! Got fields:', receivedFields);
        // Report to user what happened - this will show an Alert
        this.callbacks.onError?.(new Error(`Session created but no ID found. Fields: ${receivedFields}. Data: ${JSON.stringify(data).substring(0, 100)}`));
        return this.startDemoMode();
      }

      if (__DEV__) console.log('[AbbyRealtime] ✅ Session created:', this.sessionId);

      // Session valid - mark as connected
      this.isConnectedState = true;
      this.callbacks.onConnect?.();

      if (__DEV__) console.log('[AbbyRealtime] Connected');
    } catch (error) {
      const err = error as Error;
      if (__DEV__) console.warn('[AbbyRealtime] Connection failed, entering demo mode:', err.message);
      // Fall back to demo mode instead of throwing
      return this.startDemoMode();
    }
  }

  /**
   * Start demo mode - simulates conversation when API unavailable
   */
  private startDemoMode(): void {
    if (__DEV__) console.log('[AbbyRealtime] 🎭 Starting demo mode');
    this.isDemoModeState = true;
    this.isConnectedState = true;
    this.demoMessageIndex = 0;
    this.callbacks.onConnect?.();

    // Start sending demo messages with delays
    this.sendNextDemoMessage();
  }

  /**
   * Send next demo message with natural typing delay
   * Uses scheduleTimer for proper cleanup tracking
   */
  private sendNextDemoMessage(): void {
    const messages = this.screenType === 'intro' ? DEMO_INTRO_MESSAGES : DEMO_COACH_MESSAGES;

    if (this.demoMessageIndex >= messages.length) {
      return; // All demo messages sent
    }

    // Simulate typing delay (1.5-3 seconds)
    const delay = TIMEOUTS.DEMO.TYPING_MIN + Math.random() * (TIMEOUTS.DEMO.TYPING_MAX - TIMEOUTS.DEMO.TYPING_MIN);

    this.scheduleTimer(() => {
      if (!this.isConnectedState) return; // Session ended

      const message = messages[this.demoMessageIndex];
      this.callbacks.onAbbyResponse?.(message);
      // IMPORTANT: Speak the message (respects mute setting)
      this.speakText(message).catch((err) => {
        if (__DEV__) console.warn('[AbbyRealtime] Speech failed for message:', err);
      });
      this.demoMessageIndex++;

      // Continue with next message after a pause
      if (this.demoMessageIndex < messages.length) {
        const nextDelay = TIMEOUTS.DEMO.MESSAGE_PAUSE + Math.random() * TIMEOUTS.DEMO.MESSAGE_PAUSE;
        this.scheduleTimer(() => {
          this.sendNextDemoMessage();
        }, nextDelay);
      }
    }, delay);
  }

  /**
   * End the conversation session
   */
  async endConversation(): Promise<void> {
    // Clear ALL tracked timers (demo messages, text message responses, etc.)
    this.clearAllTimers();

    // Clear conversation history
    this.conversationHistory = [];

    // Stop any playing TTS audio
    await abbyTTS.stop();

    // If in demo mode, just cleanup state
    if (this.isDemoModeState) {
      if (__DEV__) console.log('[AbbyRealtime] Ending demo mode session');
      this.isDemoModeState = false;
      this.isConnectedState = false;
      this.callbacks.onDisconnect?.();
      return;
    }

    if (!this.sessionId) {
      if (__DEV__) console.log('[AbbyRealtime] No active session to end');
      this.isConnectedState = false;
      this.callbacks.onDisconnect?.();
      return;
    }

    try {
      if (__DEV__) console.log('[AbbyRealtime] Ending session:', this.sessionId);

      const token = await TokenManager.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      await secureFetch(`${API_BASE_URL}/abby/session/${encodeURIComponent(this.sessionId)}/end`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        timeout: REQUEST_TIMEOUT_MS,
      });

      // Cleanup
      this.ws?.close();
      this.ws = null;
      this.sessionId = null;
      this.isConnectedState = false;
      this.callbacks.onDisconnect?.();

      if (__DEV__) console.log('[AbbyRealtime] Session ended');
    } catch (error) {
      if (__DEV__) console.error('[AbbyRealtime] Failed to end session:', error);
      // Clean up anyway
      this.isConnectedState = false;
      this.callbacks.onDisconnect?.();
      throw error;
    }
  }

  /**
   * Send a text message to Abby
   *
   * Uses POST /v1/chat with use_abby_fallback: true for text conversations.
   * This endpoint returns Abby's response directly via HTTP (unlike the
   * /abby/realtime/{session_id}/message endpoint which only INJECTS text
   * into a WebRTC/WebSocket session).
   */
  async sendTextMessage(message: string): Promise<void> {
    // Demo mode - generate a simulated response
    if (this.isDemoModeState) {
      if (__DEV__) console.warn('[AbbyRealtime] 🎭 DEMO MODE - Not sending to backend:', message);

      // Simulate typing delay - uses tracked timer for cleanup
      this.scheduleTimer(() => {
        const demoResponse = this.generateDemoResponse(message);
        this.callbacks.onAbbyResponse?.(demoResponse);
        // IMPORTANT: Speak the response
        this.speakText(demoResponse).catch((err) => {
          if (__DEV__) console.warn('[AbbyRealtime] Speech failed for demo response:', err);
        });
      }, 1000 + Math.random() * 1500);

      return;
    }

    // NOTE: We use /v1/chat for text mode, NOT /v1/abby/realtime/{session_id}/message
    // The realtime/message endpoint only INJECTS text into WebRTC sessions.
    // The /v1/chat endpoint actually returns Abby's response via HTTP.
    //
    // API Contract (from types.ts):
    //   Request:  { message: string, conversationId?: string }
    //   Response: { response: string, conversationId: string, suggestedActions?: string[] }

    try {
      // Per Geraldo: Use /v1/abby/realtime/{session_id}/message, NOT /v1/chat
      console.log('[AbbyRealtime] 💬 Sending message via realtime endpoint:', message);
      console.log('[AbbyRealtime] 🎭 isDemoMode:', this.isDemoModeState);
      console.log('[AbbyRealtime] 📍 sessionId:', this.sessionId);

      const token = await TokenManager.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Must have a session first
      if (!this.sessionId) {
        throw new Error('No session - call startConversation() first');
      }

      const endpoint = `${API_BASE_URL}/abby/realtime/${this.sessionId}/message`;
      console.log('[AbbyRealtime] 📍 Full URL:', endpoint);

      // Use POST /v1/abby/realtime/{session_id}/message
      const response = await secureFetch(
        endpoint,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: message,  // Just the message text
          }),
          timeout: REQUEST_TIMEOUT_MS,
        }
      );

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'no response body');
        // ALWAYS log errors for debugging - remove after fixing
        console.error('[AbbyRealtime] ❌ Chat API failed');
        console.error('[AbbyRealtime]   Status:', response.status);
        console.error('[AbbyRealtime]   Full response:', errorText);
        const fetchError: SecureFetchError = {
          code: `HTTP_${response.status}`,
          message: `HTTP ${response.status}: ${errorText.substring(0, 150)}`,
          status: response.status,
        };
        throw fetchError;
      }

      const data = await response.json();
      if (__DEV__) console.log('[AbbyRealtime] ✅ Chat response:', JSON.stringify(data).substring(0, 300));

      // Extract Abby's response - API returns { response: string, conversationId: string }
      let abbyResponse: string | null = null;

      if (data.response) {
        // Expected format from AbbyChatResponse
        abbyResponse = data.response;
        // Store conversationId for future messages
        if (data.conversationId && !this.sessionId) {
          this.sessionId = data.conversationId;
        }
      } else if (data.choices?.[0]?.message?.content) {
        // Fallback: OpenAI chat completion format (if backend proxies to OpenAI)
        abbyResponse = data.choices[0].message.content;
      } else if (data.content) {
        // Fallback: Direct content format
        abbyResponse = data.content;
      }

      if (abbyResponse) {
        // Add assistant response to conversation history
        this.conversationHistory.push({ role: 'assistant', content: abbyResponse });

        this.callbacks.onAbbyResponse?.(abbyResponse);
        // IMPORTANT: Speak the response
        this.speakText(abbyResponse).catch((err) => {
          if (__DEV__) console.warn('[AbbyRealtime] Speech failed for chat response:', err);
        });
        if (__DEV__) console.log('[AbbyRealtime] ✅ Response received and spoken');
      } else {
        // Remove failed user message from history
        this.conversationHistory.pop();
        // Unexpected response format - log for debugging
        const debugData = JSON.stringify(data, null, 0).substring(0, 300);
        if (__DEV__) console.error('[AbbyRealtime] Unexpected chat response format:', debugData);
        this.callbacks.onError?.(new Error(`Unexpected response format: ${debugData}`));
      }
    } catch (error) {
      if (__DEV__) console.error('[AbbyRealtime] Failed to send message:', error);
      if (error && typeof error === 'object' && 'code' in error) {
        throw error;
      }
      throw { code: 'REQUEST_FAILED', message: 'Failed to send message' };
    }
  }

  /**
   * Generate a demo response based on user input
   */
  private generateDemoResponse(userMessage: string): string {
    const lower = userMessage.toLowerCase();

    // Simple keyword-based responses for demo
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      return "Hello! Great to chat with you. In demo mode, I can show you how our conversations would flow, but I can't provide personalized matchmaking just yet.";
    }

    if (lower.includes('match') || lower.includes('date') || lower.includes('relationship')) {
      return "That's exactly what I'm here to help with! Once we're fully connected, I'll use our conversations to understand your preferences and find compatible matches for you.";
    }

    if (lower.includes('how') && lower.includes('work')) {
      return "Abby works by having natural conversations with you to understand who you really are - your values, interests, and what you're looking for. Then I use that understanding to find your perfect match.";
    }

    if (lower.includes('?')) {
      return "That's a great question! In demo mode, I can't give you a personalized answer, but when we're fully connected, I'll be able to help with anything related to finding your perfect match.";
    }

    // Default response
    return "Thanks for sharing that with me! When the full system is connected, I'll be able to have a much deeper conversation with you about finding your ideal partner.";
  }

  /**
   * Toggle mute state
   */
  async toggleMute(): Promise<void> {
    this.isMutedState = !this.isMutedState;
    if (__DEV__) console.log('[AbbyRealtime] Muted:', this.isMutedState);

    // TODO: Implement actual mute/unmute logic with WebRTC
  }

  /**
   * Check if Realtime API is available
   */
  private async checkAvailability(): Promise<boolean> {
    try {
      const response = await secureFetch(`${API_BASE_URL}/abby/realtime/available`, {
        timeout: AVAILABILITY_TIMEOUT_MS,
      });
      // Accept 401 as "available but needs auth" (backend requires auth on health check)
      return response.ok || response.status === 401;
    } catch (error) {
      if (__DEV__) console.error('[AbbyRealtime] Availability check failed:', error);
      return false;
    }
  }

  /**
   * Get conversation context/memory
   */
  async getContext(): Promise<any> {
    try {
      const token = await TokenManager.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await secureFetch(`${API_BASE_URL}/abby/memory/context`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        timeout: REQUEST_TIMEOUT_MS,
      });

      if (!response.ok) {
        const fetchError: SecureFetchError = {
          code: `HTTP_${response.status}`,
          message: 'Failed to get context',
          status: response.status,
        };
        throw fetchError;
      }

      return await response.json();
    } catch (error) {
      if (__DEV__) console.error('[AbbyRealtime] Failed to get context:', error);
      if (error && typeof error === 'object' && 'code' in error) {
        throw error;
      }
      throw { code: 'REQUEST_FAILED', message: 'Failed to get context' };
    }
  }

  // Getters for state
  get isConnected(): boolean {
    return this.isConnectedState;
  }

  get isMuted(): boolean {
    return this.isMutedState;
  }

  get isSpeaking(): boolean {
    return this.isSpeakingState;
  }

  get isDemoMode(): boolean {
    return this.isDemoModeState;
  }

  // Update speaking state (would be triggered by WebRTC events)
  setSpeaking(speaking: boolean): void {
    this.isSpeakingState = speaking;
  }

  /**
   * Speak text using AbbyTTSService (backend API)
   * Updates isSpeakingState during playback
   * Respects mute setting and feature flag
   */
  private async speakText(text: string): Promise<void> {
    // 1. CHECK MUTE STATE
    if (this.isMutedState) {
      if (__DEV__) console.log('[AbbyRealtime] Muted - skipping TTS');
      return;
    }

    // 2. CHECK FEATURE FLAG (prevents keyboard issues in simulator)
    if (!FEATURE_FLAGS.VOICE_ENABLED) {
      if (__DEV__) console.log('[AbbyRealtime] Voice disabled by feature flag');
      return;
    }

    try {
      // 3. UPDATE SPEAKING STATE
      this.isSpeakingState = true;
      if (__DEV__) console.log('[AbbyRealtime] 🔊 Speaking via AbbyTTSService:', text.substring(0, 50));

      // 4. CALL TTS SERVICE with audio level callback
      await abbyTTS.speak(text, (level) => {
        this.callbacks.onAudioLevel?.(level);  // Forward to orb animation
      });

    } catch (error) {
      // 5. ERROR HANDLING
      if (__DEV__) console.warn('[AbbyRealtime] TTS error:', error);
    } finally {
      // 6. ALWAYS CLEAR SPEAKING STATE (even on error)
      this.isSpeakingState = false;
    }
  }
}

/**
 * React hook wrapper for AbbyRealtimeService
 * Maintains same interface as useAbbyAgent (ElevenLabs) for drop-in replacement
 */
import { useState, useCallback, useRef, useEffect } from 'react';

export interface UseAbbyAgentConfig {
  enabled?: boolean;
  screenType?: 'intro' | 'coach';
  onAbbyResponse?: (text: string) => void;
  onUserTranscript?: (text: string) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  onAudioLevel?: (level: number) => void;  // For orb animation during TTS
}

export function useAbbyAgent(config: UseAbbyAgentConfig = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const serviceRef = useRef<AbbyRealtimeService | null>(null);

  // Store callbacks in refs to avoid stale closures and unnecessary re-initialization
  // This pattern ensures callbacks are always fresh without triggering effect re-runs
  const callbacksRef = useRef({
    onAbbyResponse: config.onAbbyResponse,
    onUserTranscript: config.onUserTranscript,
    onConnect: config.onConnect,
    onDisconnect: config.onDisconnect,
    onError: config.onError,
    onAudioLevel: config.onAudioLevel,
  });

  // Keep refs updated with latest callbacks
  useEffect(() => {
    callbacksRef.current = {
      onAbbyResponse: config.onAbbyResponse,
      onUserTranscript: config.onUserTranscript,
      onConnect: config.onConnect,
      onDisconnect: config.onDisconnect,
      onError: config.onError,
      onAudioLevel: config.onAudioLevel,
    };
  });

  // Initialize service with callbacks (uses refs to avoid stale closures)
  useEffect(() => {
    if (config.enabled !== false) {
      serviceRef.current = new AbbyRealtimeService(
        {
          onAbbyResponse: (text) => callbacksRef.current.onAbbyResponse?.(text),
          onUserTranscript: (text) => callbacksRef.current.onUserTranscript?.(text),
          onConnect: () => {
            setIsConnected(true);
            setIsDemoMode(serviceRef.current?.isDemoMode ?? false);
            callbacksRef.current.onConnect?.();
          },
          onDisconnect: () => {
            setIsConnected(false);
            setIsDemoMode(false);
            callbacksRef.current.onDisconnect?.();
          },
          onError: (error) => callbacksRef.current.onError?.(error),
          onAudioLevel: (level) => callbacksRef.current.onAudioLevel?.(level),
        },
        config.screenType ?? 'intro'
      );
    }

    return () => {
      // Cleanup on unmount
      serviceRef.current?.endConversation().catch((err) => {
        // Cleanup errors are expected if session already ended
        if (typeof __DEV__ !== 'undefined' && __DEV__) console.debug('[useAbbyAgent] Cleanup:', err?.message || 'session ended');
      });
    };
  }, [config.enabled, config.screenType]);

  const startConversation = useCallback(async () => {
    if (!serviceRef.current) throw new Error('Service not initialized');
    await serviceRef.current.startConversation();
  }, []);

  const endConversation = useCallback(async () => {
    if (!serviceRef.current) throw new Error('Service not initialized');
    await serviceRef.current.endConversation();
  }, []);

  const sendTextMessage = useCallback(async (message: string) => {
    if (!serviceRef.current) throw new Error('Service not initialized');
    await serviceRef.current.sendTextMessage(message);
  }, []);

  const toggleMute = useCallback(async () => {
    if (!serviceRef.current) throw new Error('Service not initialized');
    await serviceRef.current.toggleMute();
    setIsMuted(serviceRef.current.isMuted);
  }, []);

  return {
    startConversation,
    endConversation,
    sendTextMessage,
    toggleMute,
    isConnected,
    isMuted,
    isSpeaking,
    isDemoMode,
  };
}

export default AbbyRealtimeService;
