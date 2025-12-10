/**
 * App.abby.tsx - Abby Voice Conversation
 *
 * Auto-starts conversation when entering.
 * No buttons - just speak and Abby responds.
 * Minimal UI - orb takes center stage.
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ElevenLabsProvider, useConversation } from '@elevenlabs/react-native';

// Background
import VibeMatrix3 from './src/components/layers/VibeMatrix3';

// Orb (G4 - audio reactive)
import { LiquidGlass4 } from './src/components/layers/LiquidGlass4';

const AGENT_ID = process.env.EXPO_PUBLIC_ELEVENLABS_AGENT_ID || '';

// Inner component that uses the conversation (must be inside ElevenLabsProvider)
function AbbyScreen() {
  const [status, setStatus] = useState('Ready');
  const [abbyText, setAbbyText] = useState('');
  const startedRef = useRef(false);

  const conversation = useConversation({
    onConnect: useCallback(() => {
      console.log('[Abby] Connected');
      setStatus('Listening...');
    }, []),
    onDisconnect: useCallback(() => {
      console.log('[Abby] Disconnected');
      setStatus('Disconnected');
    }, []),
    onMessage: useCallback((msg: { type: string; text?: string }) => {
      if (msg.type === 'agent_response' && msg.text) {
        setAbbyText(msg.text);
      }
    }, []),
    onModeChange: useCallback((mode: { mode: string }) => {
      if (mode.mode === 'speaking') {
        setStatus('Abby speaking...');
      } else if (mode.mode === 'listening') {
        setStatus('Listening...');
      }
    }, []),
    onError: useCallback((err: Error) => {
      console.error('[Abby] Error:', err);
      setStatus(`Error: ${err.message}`);
    }, []),
  });

  // Auto-start on mount
  useEffect(() => {
    if (startedRef.current) return;
    if (!AGENT_ID) {
      setStatus('No Agent ID configured');
      return;
    }

    startedRef.current = true;
    setStatus('Connecting...');
    console.log('[Abby] Auto-starting session with agentId:', AGENT_ID);

    conversation.startSession({ agentId: AGENT_ID })
      .then(() => {
        console.log('[Abby] startSession completed successfully');
      })
      .catch((err: unknown) => {
        console.error('[Abby] Start failed:', err);
        console.error('[Abby] Error details:', JSON.stringify(err, null, 2));
        const msg = err instanceof Error ? err.message : 'Connection failed';
        setStatus(`Error: ${msg}`);
        startedRef.current = false;
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Track conversation in ref for cleanup
  const conversationRef = useRef(conversation);
  conversationRef.current = conversation;

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      console.log('[Abby] Cleanup - status:', conversationRef.current.status);
      if (conversationRef.current.status === 'connected') {
        conversationRef.current.endSession();
      }
    };
  }, []); // Empty deps - only run cleanup on unmount

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={styles.backgroundLayer} pointerEvents="none">
        <VibeMatrix3 />
      </View>

      {/* Orb */}
      <View style={styles.orbLayer} pointerEvents="none">
        <LiquidGlass4 />
      </View>

      {/* Status at bottom */}
      <View style={styles.statusContainer}>
        {abbyText ? (
          <Text style={styles.abbyText} numberOfLines={2}>
            {abbyText}
          </Text>
        ) : null}
        <Text style={styles.statusText}>{status}</Text>
      </View>

      <StatusBar style="light" />
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
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  orbLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  statusContainer: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 20,
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
