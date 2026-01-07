/**
 * Mock for @elevenlabs/react-native when running in Expo Go
 * Provides type-safe stubs that let the app run without native modules
 *
 * NOTE: The real ABBY app uses OpenAI Realtime API for voice, NOT ElevenLabs.
 * This mock exists only for legacy code paths that haven't been migrated yet.
 */

import React, { ReactNode } from 'react';

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
  onMessage?: (props: { message: string; source: string }) => void;
  onModeChange?: (prop: { mode: 'speaking' | 'listening' }) => void;
  onStatusChange?: (prop: { status: ConversationStatus }) => void;
}

export const useConversation = (options?: ConversationCallbacks): Conversation => ({
  status: 'disconnected',
  isSpeaking: false,
  canSendFeedback: false,
  startSession: async () => {
    console.warn('[ElevenLabs Mock] Voice not available in Expo Go - run with expo run:ios');
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

/**
 * ElevenLabsProvider mock - pass-through wrapper
 * The real app uses OpenAI Realtime API, but legacy code still references this provider
 */
interface ElevenLabsProviderProps {
  children: ReactNode;
}

export const ElevenLabsProvider: React.FC<ElevenLabsProviderProps> = ({ children }) => {
  return <>{children}</>;
};

export default { useConversation, ElevenLabsProvider };
