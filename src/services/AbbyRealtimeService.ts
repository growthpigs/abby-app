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
 * NOTE: This is a simplified stub to match the ElevenLabs interface.
 * Real OpenAI Realtime API requires WebRTC/WebSocket connection handling.
 */

import { TokenManager } from './TokenManager';
import { secureFetch, type SecureFetchError } from '../utils/secureFetch';

const API_BASE_URL = 'https://dev.api.myaimatchmaker.ai/v1';

// Request timeout for realtime API (20 seconds - slightly longer for voice)
const REQUEST_TIMEOUT_MS = 20000;

// Availability check timeout (5 seconds - fast fail)
const AVAILABILITY_TIMEOUT_MS = 5000;

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
  private demoMessageTimer: NodeJS.Timeout | null = null;
  private callbacks: ConversationCallbacks = {};
  private screenType: 'intro' | 'coach' = 'intro';

  constructor(callbacks?: ConversationCallbacks, screenType: 'intro' | 'coach' = 'intro') {
    this.callbacks = callbacks || {};
    this.screenType = screenType;
  }

  /**
   * Start a real-time conversation session
   * Falls back to demo mode if API is unavailable
   */
  async startConversation(): Promise<void> {
    try {
      if (__DEV__) console.log('[AbbyRealtime] Starting conversation...');

      // Check API availability first
      const isAvailable = await this.checkAvailability();
      if (!isAvailable) {
        if (__DEV__) console.log('[AbbyRealtime] API unavailable, entering demo mode');
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
        if (__DEV__) console.log('[AbbyRealtime] Session creation failed, entering demo mode');
        return this.startDemoMode();
      }

      const data: RealtimeSessionResponse = await response.json();
      this.sessionId = data.sessionId;

      if (__DEV__) console.log('[AbbyRealtime] Session created:', this.sessionId);

      // TODO: Establish WebSocket/WebRTC connection
      // For now, simulate connection
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
   */
  private sendNextDemoMessage(): void {
    const messages = this.screenType === 'intro' ? DEMO_INTRO_MESSAGES : DEMO_COACH_MESSAGES;

    if (this.demoMessageIndex >= messages.length) {
      return; // All demo messages sent
    }

    // Simulate typing delay (1.5-3 seconds)
    const delay = 1500 + Math.random() * 1500;

    this.demoMessageTimer = setTimeout(() => {
      if (!this.isConnectedState) return; // Session ended

      const message = messages[this.demoMessageIndex];
      this.callbacks.onAbbyResponse?.(message);
      this.demoMessageIndex++;

      // Continue with next message after a pause
      if (this.demoMessageIndex < messages.length) {
        const nextDelay = 2000 + Math.random() * 2000;
        this.demoMessageTimer = setTimeout(() => {
          this.sendNextDemoMessage();
        }, nextDelay);
      }
    }, delay);
  }

  /**
   * End the conversation session
   */
  async endConversation(): Promise<void> {
    // Clean up demo mode timers
    if (this.demoMessageTimer) {
      clearTimeout(this.demoMessageTimer);
      this.demoMessageTimer = null;
    }

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
   */
  async sendTextMessage(message: string): Promise<void> {
    // Demo mode - generate a simulated response
    if (this.isDemoModeState) {
      if (__DEV__) console.log('[AbbyRealtime] Demo mode - simulating response to:', message);

      // Simulate typing delay
      setTimeout(() => {
        const demoResponse = this.generateDemoResponse(message);
        this.callbacks.onAbbyResponse?.(demoResponse);
      }, 1000 + Math.random() * 1500);

      return;
    }

    if (!this.sessionId) {
      throw new Error('No active session');
    }

    try {
      if (__DEV__) console.log('[AbbyRealtime] Sending message:', message);

      const token = await TokenManager.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await secureFetch(
        `${API_BASE_URL}/abby/realtime/${encodeURIComponent(this.sessionId)}/message`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            message,
          } as RealtimeMessageRequest),
          timeout: REQUEST_TIMEOUT_MS,
        }
      );

      if (!response.ok) {
        const fetchError: SecureFetchError = {
          code: `HTTP_${response.status}`,
          message: 'Failed to send message',
          status: response.status,
        };
        throw fetchError;
      }

      const data = await response.json();

      // Trigger callback with Abby's response
      if (data.response) {
        this.callbacks.onAbbyResponse?.(data.response);
      }

      if (__DEV__) console.log('[AbbyRealtime] Message sent, response received');
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
      return response.ok;
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
}

export function useAbbyAgent(config: UseAbbyAgentConfig = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const serviceRef = useRef<AbbyRealtimeService | null>(null);

  // Initialize service with callbacks
  useEffect(() => {
    if (config.enabled !== false) {
      serviceRef.current = new AbbyRealtimeService(
        {
          onAbbyResponse: config.onAbbyResponse,
          onUserTranscript: config.onUserTranscript,
          onConnect: () => {
            setIsConnected(true);
            setIsDemoMode(serviceRef.current?.isDemoMode ?? false);
            config.onConnect?.();
          },
          onDisconnect: () => {
            setIsConnected(false);
            setIsDemoMode(false);
            config.onDisconnect?.();
          },
          onError: config.onError,
        },
        config.screenType ?? 'intro'
      );
    }

    return () => {
      // Cleanup on unmount
      serviceRef.current?.endConversation().catch(() => {
        // Ignore cleanup errors
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
