/**
 * App.abby.tsx - Abby Voice Conversation
 *
 * ⚠️ DEPRECATED - Uses old ElevenLabs SDK (removed)
 * This file needs updating to use AbbyRealtimeService
 *
 * Auto-starts conversation when entering.
 * No buttons - just speak and Abby responds.
 * Minimal UI - orb takes center stage.
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ElevenLabsProvider, useConversation } from '@elevenlabs/react-native';

// Orb (G4 - audio reactive) - DISABLED for now
// import { LiquidGlass4 } from './src/components/layers/LiquidGlass4';

const AGENT_ID = process.env.EXPO_PUBLIC_ELEVENLABS_AGENT_ID || '';

// Inner component that uses the conversation (must be inside ElevenLabsProvider)
function AbbyScreen() {
  const [status, setStatus] = useState('Ready');
  const [abbyText, setAbbyText] = useState('');

  // Refs for stable references
  const startedRef = useRef(false);
  const mountedRef = useRef(true);
  const conversationRef = useRef<ReturnType<typeof useConversation> | null>(null);

  const conversation = useConversation({
    // Correct signatures per ElevenLabs docs
    onConnect: useCallback(({ conversationId }: { conversationId: string }) => {
      console.log('[Abby] Connected:', conversationId);
      setStatus('Listening...');
    }, []),
    onDisconnect: useCallback((details: { reason: string; message?: string }) => {
      console.log('[Abby] Disconnected:', details.reason, details.message);
      setStatus('Disconnected');
    }, []),
    onMessage: useCallback(({ message, source }: { message: any; source: string }) => {
      console.log(`[Abby] Message from ${source}:`, message);
      // SDK uses nested structure per types.d.ts
      if (message.type === 'agent_response') {
        const text = message.agent_response_event?.agent_response;
        if (text) setAbbyText(text);
      }
    }, []),
    onModeChange: useCallback(({ mode }: { mode: 'speaking' | 'listening' }) => {
      console.log('[Abby] Mode:', mode);
      if (mode === 'speaking') {
        setStatus('Abby speaking...');
      } else if (mode === 'listening') {
        setStatus('Listening...');
      }
    }, []),
    onStatusChange: useCallback(({ status }: { status: string }) => {
      console.log('[Abby] Status:', status);
    }, []),
    onError: useCallback((message: string, context?: Record<string, unknown>) => {
      console.error('[Abby] Error:', message, context);
      setStatus(`Error: ${message}`);
    }, []),
  });

  // Keep ref updated
  conversationRef.current = conversation;

  // Single effect: delayed auto-start + cleanup
  useEffect(() => {
    mountedRef.current = true;
    console.log('[Abby] Mount - scheduling start');

    // Delay start to survive Strict Mode double-mount
    const timer = setTimeout(() => {
      if (!mountedRef.current) {
        console.log('[Abby] Aborted - unmounted before start');
        return;
      }
      if (startedRef.current) {
        console.log('[Abby] Already started');
        return;
      }
      if (!AGENT_ID) {
        setStatus('No Agent ID');
        return;
      }

      startedRef.current = true;
      setStatus('Connecting...');
      console.log('[Abby] Starting with agentId:', AGENT_ID);

      conversationRef.current?.startSession({
        agentId: AGENT_ID,
        // Full voice mode - no textOnly override
      })
        .then(() => {
          if (mountedRef.current) {
            console.log('[Abby] Session started');
          }
        })
        .catch((err: unknown) => {
          if (mountedRef.current) {
            console.error('[Abby] Failed:', err);
            const msg = err instanceof Error ? err.message : 'Failed';
            setStatus(`Error: ${msg}`);
            startedRef.current = false;
          }
        });
    }, 500);

    return () => {
      console.log('[Abby] Unmount - cleaning up');
      mountedRef.current = false;
      clearTimeout(timer);
      // Only end if actually connected
      const conv = conversationRef.current;
      if (conv && conv.status === 'connected') {
        console.log('[Abby] Ending session');
        conv.endSession();
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Plain black background - no shaders */}

      {/* Status at bottom */}
      <View style={styles.statusContainer}>
        {abbyText ? (
          <Text style={styles.abbyText} numberOfLines={2}>
            {abbyText}
          </Text>
        ) : null}
        <Text style={styles.statusText}>{status}</Text>
      </View>

      <StatusBar hidden />
    </View>
  );
}

export default function AppAbby() {
  return (
    <ElevenLabsProvider>
      <AbbyScreen />
    </ElevenLabsProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  statusContainer: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  abbyText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  statusText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: '500',
  },
});
