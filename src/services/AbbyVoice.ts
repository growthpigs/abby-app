/**
 * AbbyVoice - TTS Service for Abby
 *
 * Uses ElevenLabs TTS API - SAME voice as the conversational agent
 * Voice: Jessica Anne Bogart - Eloquent Villain
 */

import { Audio, AVPlaybackStatus } from 'expo-av';

// ElevenLabs API credentials
const ELEVENLABS_API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY || '';
const ELEVENLABS_VOICE_ID = process.env.EXPO_PUBLIC_ELEVENLABS_VOICE_ID || '';

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

  // Generation tracking for race condition prevention
  private currentGenerationId: number = 0;

  /**
   * Generate speech from text using ElevenLabs TTS API
   * Same voice as the conversational agent (Jessica Anne Bogart)
   */
  async generateSpeech(text: string): Promise<string> {
    if (!ELEVENLABS_API_KEY) {
      if (__DEV__) console.error('[AbbyVoice] EXPO_PUBLIC_ELEVENLABS_API_KEY not configured');
      throw new Error('Voice service not configured');
    }
    if (!ELEVENLABS_VOICE_ID) {
      if (__DEV__) console.error('[AbbyVoice] EXPO_PUBLIC_ELEVENLABS_VOICE_ID not configured');
      throw new Error('Voice service not configured');
    }

    if (__DEV__) console.log('[AbbyVoice] Generating speech');

    // 10 second timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (__DEV__) console.log('[AbbyVoice] API response status:', response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error('[AbbyVoice] API error:', error);
      throw new Error(`TTS failed: ${response.status} - ${error}`);
    }

    // ElevenLabs returns raw audio bytes - convert to base64 data URI
    const audioBlob = await response.blob();
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });

    if (__DEV__) console.log('[AbbyVoice] Audio generated, size:', audioBlob.size);
    return base64;
  }

  /**
   * Play audio and report amplitude levels via callback
   * Includes race condition protection - if speak() is called again
   * while generating, the previous generation is cancelled.
   */
  async speak(text: string, onAudioLevel?: AudioLevelCallback): Promise<void> {
    // Increment generation ID to cancel any in-flight requests
    const generationId = ++this.currentGenerationId;

    try {
      // Stop any existing playback
      await this.stop();

      this.audioLevelCallback = onAudioLevel || null;

      // Generate speech
      if (__DEV__) console.log('[AbbyVoice] Starting speak()... (gen:', generationId, ')');
      this.currentText = text;
      this.durationMs = estimateDurationMs(text);
      if (__DEV__) console.log('[AbbyVoice] Estimated duration:', this.durationMs, 'ms');
      const audioUrl = await this.generateSpeech(text);

      // Check if we were cancelled during generation
      if (generationId !== this.currentGenerationId) {
        if (__DEV__) console.log('[AbbyVoice] Generation', generationId, 'cancelled (new request started)');
        return;
      }

      // Configure audio mode with speaker output for louder playback
      if (__DEV__) console.log('[AbbyVoice] Configuring audio mode...');
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        // Use playback category for louder speaker output
        interruptionModeIOS: 1, // MixWithOthers
        shouldDuckAndroid: false,
      });

      // Check again after async operation
      if (generationId !== this.currentGenerationId) {
        if (__DEV__) console.log('[AbbyVoice] Generation', generationId, 'cancelled after audio config');
        return;
      }

      // Load audio (paused) to check cancellation before playing
      // Volume at max 1.0 - expo-av doesn't allow higher values
      if (__DEV__) console.log('[AbbyVoice] Loading audio from URL...');
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: false, volume: 1.0 },
        this.onPlaybackStatusUpdate.bind(this)
      );

      // Final check before committing to playback
      if (generationId !== this.currentGenerationId) {
        if (__DEV__) console.log('[AbbyVoice] Generation', generationId, 'cancelled before playback');
        await sound.unloadAsync();
        return;
      }

      // Now play (after confirming not cancelled)
      if (__DEV__) console.log('[AbbyVoice] Audio loaded, playing...');
      await sound.playAsync();
      this.sound = sound;
      this.isPlaying = true;

      // Start simulated amplitude animation
      // (expo-av doesn't provide real-time amplitude, so we simulate based on playback)
      this.startAmplitudeSimulation();
      if (__DEV__) console.log('[AbbyVoice] Amplitude simulation started');

    } catch (error) {
      // Only log error if this generation is still current
      if (generationId === this.currentGenerationId) {
        console.error('[AbbyVoice] Error:', error);
        this.isPlaying = false;
      }
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
    if (__DEV__) console.log('[AbbyVoice] Generated pattern with', this.amplitudePattern.length, 'samples');

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
