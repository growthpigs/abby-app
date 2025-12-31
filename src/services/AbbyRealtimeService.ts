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

const API_BASE_URL = 'https://dev.api.myaimatchmaker.ai/v1';

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
  private callbacks: ConversationCallbacks = {};

  constructor(callbacks?: ConversationCallbacks) {
    this.callbacks = callbacks || {};
  }

  /**
   * Start a real-time conversation session
   */
  async startConversation(): Promise<void> {
    try {
      if (__DEV__) console.log('[AbbyRealtime] Starting conversation...');

      // Check API availability first
      const isAvailable = await this.checkAvailability();
      if (!isAvailable) {
        throw new Error('Abby Realtime API is not available');
      }

      // Get access token
      const token = await TokenManager.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Create session
      const response = await fetch(`${API_BASE_URL}/abby/realtime/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          // TODO: Add session config if needed
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create session: ${error}`);
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
      if (__DEV__) console.error('[AbbyRealtime] Connection failed:', err);
      this.callbacks.onError?.(err);
      throw error;
    }
  }

  /**
   * End the conversation session
   */
  async endConversation(): Promise<void> {
    if (!this.sessionId) {
      if (__DEV__) console.log('[AbbyRealtime] No active session to end');
      return;
    }

    try {
      if (__DEV__) console.log('[AbbyRealtime] Ending session:', this.sessionId);

      const token = await TokenManager.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      await fetch(`${API_BASE_URL}/abby/session/${this.sessionId}/end`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
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
      throw error;
    }
  }

  /**
   * Send a text message to Abby
   */
  async sendTextMessage(message: string): Promise<void> {
    if (!this.sessionId) {
      throw new Error('No active session');
    }

    try {
      if (__DEV__) console.log('[AbbyRealtime] Sending message:', message);

      const token = await TokenManager.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${API_BASE_URL}/abby/realtime/${this.sessionId}/message`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            message,
          } as RealtimeMessageRequest),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to send message: ${error}`);
      }

      const data = await response.json();

      // Trigger callback with Abby's response
      if (data.response) {
        this.callbacks.onAbbyResponse?.(data.response);
      }

      if (__DEV__) console.log('[AbbyRealtime] Message sent, response received');
    } catch (error) {
      if (__DEV__) console.error('[AbbyRealtime] Failed to send message:', error);
      throw error;
    }
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
      const response = await fetch(`${API_BASE_URL}/abby/realtime/available`);
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

      const response = await fetch(`${API_BASE_URL}/abby/memory/context`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch context');
      }

      return await response.json();
    } catch (error) {
      if (__DEV__) console.error('[AbbyRealtime] Failed to get context:', error);
      throw error;
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

  const serviceRef = useRef<AbbyRealtimeService | null>(null);

  // Initialize service with callbacks
  useEffect(() => {
    if (config.enabled !== false) {
      serviceRef.current = new AbbyRealtimeService({
        onAbbyResponse: config.onAbbyResponse,
        onUserTranscript: config.onUserTranscript,
        onConnect: () => {
          setIsConnected(true);
          config.onConnect?.();
        },
        onDisconnect: () => {
          setIsConnected(false);
          config.onDisconnect?.();
        },
        onError: config.onError,
      });
    }

    return () => {
      // Cleanup on unmount
      serviceRef.current?.endConversation().catch(() => {
        // Ignore cleanup errors
      });
    };
  }, [config.enabled]);

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
  };
}

export default AbbyRealtimeService;
