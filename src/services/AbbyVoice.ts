/**
 * AbbyVoice - TTS Service for Abby
 *
 * Uses Fal.ai Orpheus TTS (Tara voice)
 * Returns audio URL and provides amplitude extraction during playback
 */

import { Audio, AVPlaybackStatus } from 'expo-av';

const FAL_KEY = '00c10bec-d5cf-4fd0-8cc7-7bd74ed652cb:55ad5ca184ab611adf4fa82fcd7824a3';
const FAL_TTS_ENDPOINT = 'https://fal.run/fal-ai/orpheus-tts';

// Orpheus voices: tara, leah, jess, leo, dan, mia, zac, zoe
const ABBY_VOICE = 'tara';

// Estimate audio duration from text (rough: ~150ms per syllable, ~4 chars per syllable)
const estimateDurationMs = (text: string): number => {
  const syllables = Math.ceil(text.replace(/[^a-zA-Z]/g, '').length / 4);
  return syllables * 150 + 500; // Add 500ms buffer
};

export interface AbbyVoiceState {
  isLoading: boolean;
  isPlaying: boolean;
  audioLevel: number; // 0.0 - 1.0 for shader
  error: string | null;
}

type AudioLevelCallback = (level: number) => void;

class AbbyVoiceService {
  private sound: Audio.Sound | null = null;
  private audioLevelCallback: AudioLevelCallback | null = null;
  private animationFrame: number | null = null;
  private isPlaying: boolean = false;
  private playbackPositionMs: number = 0;
  private durationMs: number = 0;
  private currentText: string = '';

  /**
   * Generate speech from text using Fal.ai Orpheus
   */
  async generateSpeech(text: string): Promise<string> {
    console.log('[AbbyVoice] Generating speech for:', text.substring(0, 50));

    const response = await fetch(FAL_TTS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voice: ABBY_VOICE,
      }),
    });

    console.log('[AbbyVoice] API response status:', response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error('[AbbyVoice] API error:', error);
      throw new Error(`TTS failed: ${response.status} - ${error}`);
    }

    const result = await response.json();
    console.log('[AbbyVoice] API result:', JSON.stringify(result).substring(0, 200));

    if (!result.audio?.url) {
      throw new Error('No audio URL in response');
    }

    console.log('[AbbyVoice] Audio URL:', result.audio.url);
    return result.audio.url;
  }

  /**
   * Play audio and report amplitude levels via callback
   */
  async speak(text: string, onAudioLevel?: AudioLevelCallback): Promise<void> {
    try {
      // Stop any existing playback
      await this.stop();

      this.audioLevelCallback = onAudioLevel || null;

      // Generate speech
      console.log('[AbbyVoice] Starting speak()...');
      this.currentText = text;
      this.durationMs = estimateDurationMs(text);
      console.log('[AbbyVoice] Estimated duration:', this.durationMs, 'ms');
      const audioUrl = await this.generateSpeech(text);

      // Configure audio mode
      console.log('[AbbyVoice] Configuring audio mode...');
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      // Load and play
      console.log('[AbbyVoice] Loading audio from URL...');
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true },
        this.onPlaybackStatusUpdate.bind(this)
      );

      console.log('[AbbyVoice] Audio loaded, playing...');
      this.sound = sound;
      this.isPlaying = true;

      // Start simulated amplitude animation
      // (expo-av doesn't provide real-time amplitude, so we simulate based on playback)
      this.startAmplitudeSimulation();
      console.log('[AbbyVoice] Amplitude simulation started');

    } catch (error) {
      console.error('[AbbyVoice] Error:', error);
      this.isPlaying = false;
      throw error;
    }
  }

  /**
   * Stop current playback
   */
  async stop(): Promise<void> {
    this.stopAmplitudeSimulation();
    this.isPlaying = false;

    if (this.sound) {
      try {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
      } catch (e) {
        // Ignore cleanup errors
      }
      this.sound = null;
    }

    // Reset amplitude
    if (this.audioLevelCallback) {
      this.audioLevelCallback(0);
    }
  }

  /**
   * Playback status callback - tracks position for amplitude sync
   */
  private onPlaybackStatusUpdate(status: AVPlaybackStatus): void {
    if (!status.isLoaded) return;

    // Track playback position for amplitude sync
    this.playbackPositionMs = status.positionMillis || 0;
    if (status.durationMillis && status.durationMillis > 0) {
      this.durationMs = status.durationMillis;
    }

    if (status.didJustFinish) {
      this.isPlaying = false;
      this.stopAmplitudeSimulation();

      if (this.audioLevelCallback) {
        this.audioLevelCallback(0);
      }

      // Cleanup
      if (this.sound) {
        this.sound.unloadAsync();
        this.sound = null;
      }
    }
  }

  /**
   * Generate amplitude pattern from text
   * Each word creates a pulse, longer words = longer pulses
   */
  private lastLevel: number = 0;
  private amplitudePattern: number[] = [];

  private generateAmplitudePattern(text: string): number[] {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const pattern: number[] = [];
    const samplesPerMs = 0.06; // 60 samples per second

    // Easing functions
    const easeOutBack = (t: number): number => {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    };

    const easeInQuad = (t: number): number => t * t;

    for (const word of words) {
      // Word duration based on length
      const wordDurationMs = Math.max(180, word.length * 40);
      const wordSamples = Math.ceil(wordDurationMs * samplesPerMs);

      // Attack phase (15% of duration) - punchy snap in
      const attackSamples = Math.ceil(wordSamples * 0.15);
      // Sustain phase (20% of duration) - hold at peak
      const sustainSamples = Math.ceil(wordSamples * 0.20);
      // Decay phase (65% of duration) - gentle ease out
      const decaySamples = wordSamples - attackSamples - sustainSamples;

      // Attack: snap up with overshoot
      for (let i = 0; i < attackSamples; i++) {
        const t = i / attackSamples;
        const amp = easeOutBack(t);
        pattern.push(Math.min(amp, 1.0) * 0.6);
      }

      // Sustain: hold near peak
      for (let i = 0; i < sustainSamples; i++) {
        pattern.push(0.55);
      }

      // Decay: ease out gently
      for (let i = 0; i < decaySamples; i++) {
        const t = i / decaySamples;
        const amp = 1.0 - easeInQuad(t);
        pattern.push(amp * 0.55);
      }

      // Gap between words (~60ms)
      const gapSamples = Math.ceil(60 * samplesPerMs);
      for (let i = 0; i < gapSamples; i++) {
        pattern.push(0);
      }
    }

    return pattern;
  }

  private startAmplitudeSimulation(): void {
    this.lastLevel = 0;
    this.amplitudePattern = this.generateAmplitudePattern(this.currentText);
    console.log('[AbbyVoice] Generated pattern with', this.amplitudePattern.length, 'samples');

    const animate = () => {
      if (!this.isPlaying) return;

      // Use actual playback position to index into pattern
      const progress = this.durationMs > 0
        ? this.playbackPositionMs / this.durationMs
        : 0;

      const patternIndex = Math.floor(progress * this.amplitudePattern.length);
      const target = this.amplitudePattern[patternIndex] || 0;

      // Smooth interpolation
      this.lastLevel = this.lastLevel + (target - this.lastLevel) * 0.25;

      if (this.audioLevelCallback) {
        this.audioLevelCallback(this.lastLevel);
      }

      this.animationFrame = requestAnimationFrame(animate);
    };

    animate();
  }

  private stopAmplitudeSimulation(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }
}

// Singleton instance
export const abbyVoice = new AbbyVoiceService();

export default abbyVoice;
