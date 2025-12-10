/**
 * AbbyDemo - Test component for Abby's talking orb
 *
 * Demonstrates:
 * - G4 orb with audio reactivity
 * - TTS via Fal.ai Orpheus
 * - Vibe color switching
 */

import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, Pressable, TextInput } from 'react-native';
import { useSharedValue, withSpring } from 'react-native-reanimated';
import { LiquidGlass4 } from './layers/LiquidGlass4';
import { abbyVoice } from '../services/AbbyVoice';

// Vibe color presets (normalized RGB)
const VIBE_COLORS = {
  TRUST: {
    colorA: [0.231, 0.510, 0.965] as [number, number, number],   // Blue
    colorB: [0.024, 0.714, 0.831] as [number, number, number],   // Cyan
  },
  PASSION: {
    colorA: [0.957, 0.447, 0.714] as [number, number, number],   // Pink
    colorB: [0.659, 0.333, 0.969] as [number, number, number],   // Purple
  },
  CAUTION: {
    colorA: [0.961, 0.620, 0.043] as [number, number, number],   // Orange
    colorB: [0.851, 0.467, 0.024] as [number, number, number],   // Burnt Orange
  },
  GROWTH: {
    colorA: [0.063, 0.725, 0.506] as [number, number, number],   // Emerald
    colorB: [0.204, 0.827, 0.600] as [number, number, number],   // Mint
  },
  DEEP: {
    colorA: [0.545, 0.361, 0.965] as [number, number, number],   // Indigo
    colorB: [0.298, 0.114, 0.584] as [number, number, number],   // Violet
  },
};

type VibeKey = keyof typeof VIBE_COLORS;

// Sample phrases for Abby
const SAMPLE_PHRASES = [
  "Hi, I'm Abby. I'm here to help you find someone truly compatible.",
  "That's really interesting. Tell me more about what matters to you.",
  "I think I've found someone special. Would you like to hear about them?",
  "Take your time. This is an important question.",
  "I understand. Let's explore that a bit deeper.",
];

export const AbbyDemo: React.FC = () => {
  const [audioLevel, setAudioLevel] = useState(0);
  const [currentVibe, setCurrentVibe] = useState<VibeKey>('PASSION');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false); // TTS generation phase
  const [customText, setCustomText] = useState('');
  const [activePhraseIndex, setActivePhraseIndex] = useState<number | null>(null);

  const handleSpeak = useCallback(async (text: string) => {
    if (isLoading) return;

    console.log('[AbbyDemo] handleSpeak called:', text.substring(0, 30));
    setIsLoading(true);
    setIsGenerating(true); // Show "thinking" state
    try {
      await abbyVoice.speak(text, (level) => {
        setIsGenerating(false); // Audio started playing
        setAudioLevel(level);
      });
      console.log('[AbbyDemo] speak() completed');
    } catch (error) {
      console.error('[AbbyDemo] Speech error:', error);
    } finally {
      console.log('[AbbyDemo] Setting isLoading to false');
      setIsLoading(false);
      setIsGenerating(false);
      setActivePhraseIndex(null);
      setAudioLevel(0);
    }
  }, [isLoading]);

  const handleStop = useCallback(async () => {
    await abbyVoice.stop();
    setAudioLevel(0);
  }, []);

  const colors = VIBE_COLORS[currentVibe];

  return (
    <View style={styles.container}>
      {/* Orb */}
      <View style={styles.orbContainer}>
        <LiquidGlass4
          audioLevel={audioLevel}
          colorA={colors.colorA}
          colorB={colors.colorB}
        />
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {/* Vibe selector */}
        <View style={styles.vibeRow}>
          {(Object.keys(VIBE_COLORS) as VibeKey[]).map((vibe) => (
            <Pressable
              key={vibe}
              style={[
                styles.vibeBtn,
                currentVibe === vibe && styles.vibeBtnActive,
              ]}
              onPress={() => setCurrentVibe(vibe)}
            >
              <Text style={[
                styles.vibeBtnText,
                currentVibe === vibe && styles.vibeBtnTextActive,
              ]}>
                {vibe}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Sample phrases */}
        <Text style={styles.sectionLabel}>Quick phrases:</Text>
        <View style={styles.phrasesContainer}>
          {SAMPLE_PHRASES.map((phrase, i) => {
            const isActive = activePhraseIndex === i;
            const isOther = isLoading && !isActive;
            return (
              <Pressable
                key={i}
                style={[
                  styles.phraseBtn,
                  isActive && styles.phraseBtnActive,
                  isOther && styles.phraseBtnDisabled,
                ]}
                onPress={() => {
                  console.log('[AbbyDemo] Phrase button pressed:', i);
                  setActivePhraseIndex(i);
                  handleSpeak(phrase);
                }}
                disabled={isLoading}
              >
                <Text style={[
                  styles.phraseBtnText,
                  isActive && styles.phraseBtnTextActive,
                  isOther && styles.phraseBtnTextDisabled,
                ]} numberOfLines={1}>
                  {phrase.substring(0, 40)}...
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Custom text input */}
        <Text style={styles.sectionLabel}>Custom text:</Text>
        <TextInput
          style={styles.textInput}
          value={customText}
          onChangeText={setCustomText}
          placeholder="Type something for Abby to say..."
          placeholderTextColor="rgba(255,255,255,0.4)"
          multiline
        />
        <Pressable
          style={[styles.speakBtn, isLoading && styles.speakBtnDisabled]}
          onPress={() => customText && handleSpeak(customText)}
          disabled={isLoading || !customText}
        >
          <Text style={styles.speakBtnText}>
            {isLoading ? 'Speaking...' : 'Speak'}
          </Text>
        </Pressable>

        {/* Stop button */}
        <Pressable style={styles.stopBtn} onPress={handleStop}>
          <Text style={styles.stopBtnText}>Stop</Text>
        </Pressable>

        {/* Debug info */}
        <Text style={styles.debug}>
          {isGenerating ? 'Generating speech...' : `Audio Level: ${audioLevel.toFixed(2)}`}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  orbContainer: {
    flex: 1,
    maxHeight: '50%',
  },
  controls: {
    flex: 1,
    padding: 16,
  },
  vibeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  vibeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  vibeBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderColor: 'rgba(255,255,255,0.5)',
  },
  vibeBtnText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: '600',
  },
  vibeBtnTextActive: {
    color: '#fff',
  },
  sectionLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginBottom: 8,
    marginTop: 8,
  },
  phrasesContainer: {
    gap: 6,
  },
  phraseBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  phraseBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderColor: 'rgba(255,255,255,0.4)',
  },
  phraseBtnDisabled: {
    opacity: 0.3,
  },
  phraseBtnText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
  },
  phraseBtnTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  phraseBtnTextDisabled: {
    color: 'rgba(255,255,255,0.4)',
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  speakBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  speakBtnDisabled: {
    opacity: 0.5,
  },
  speakBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  stopBtn: {
    backgroundColor: 'rgba(255,100,100,0.3)',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  stopBtnText: {
    color: '#ff6666',
    fontSize: 14,
    fontWeight: '600',
  },
  debug: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    marginTop: 12,
    textAlign: 'center',
  },
});

export default AbbyDemo;
