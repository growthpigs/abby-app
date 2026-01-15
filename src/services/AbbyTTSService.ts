/**
 * AbbyTTSService - Text-to-Speech Integration
 *
 * Handles text-to-speech for Abby using the client's backend TTS endpoint.
 * Replaces ElevenLabs TTS with client's API.
 *
 * API Endpoint:
 * - POST /v1/abby/tts - Convert text to speech audio
 *
 * Usage:
 * - InterviewScreen uses this for speaking questions
 * - Provides audio level callbacks for orb animation
 */

import { TokenManager } from './TokenManager';
import { Audio } from 'expo-av';
import { API_CONFIG } from '../config';

const API_BASE_URL = API_CONFIG.API_URL;

// ========================================
// Types
// ========================================

export interface TTSRequest {
  text: string;
  voiceId?: string;
  speed?: number;
  pitch?: number;
}

export interface TTSResponse {
  audio_url?: string; // URL to audio file (snake_case from API)
  audioData?: string; // Base64 encoded audio (if inline)
  duration_ms?: number; // Duration in milliseconds (snake_case from API)
}

type AudioLevelCallback = (level: number) => void;

// ========================================
// Service Implementation
// ========================================

class AbbyTTSService {
  private sound: Audio.Sound | null = null;
  private audioLevelCallback: AudioLevelCallback | null = null;
  private audioLevelInterval: NodeJS.Timeout | null = null;
  // Track speech duration timer for cleanup (prevents leak in simulateSpeechDuration)
  private speechDurationTimer: NodeJS.Timeout | null = null;

  /**
   * Speak text using Abby's voice
   * @param text - Text to speak
   * @param onAudioLevel - Callback for audio level (0-1) for orb animation
   */
  async speak(text: string, onAudioLevel?: AudioLevelCallback): Promise<void> {
    try {
      if (__DEV__) console.log('[AbbyTTS] Speaking:', text.substring(0, 50) + '...');

      // Store callback for audio level updates
      this.audioLevelCallback = onAudioLevel || null;

      // Get access token
      const token = await TokenManager.getToken();
      if (!token) {
        // Not authenticated - skip TTS silently in demo mode
        if (__DEV__) console.log('[AbbyTTS] No auth token - skipping TTS (demo mode)');
        // Still simulate audio levels for orb animation
        if (onAudioLevel) {
          this.simulateSpeechDuration(text, onAudioLevel);
        }
        return;
      }

      // Request TTS from API
      const response = await fetch(`${API_BASE_URL}/abby/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          text,
        } as TTSRequest),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`TTS request failed: ${error}`);
      }

      const data: TTSResponse = await response.json();

      // Play audio (API returns snake_case: audio_url)
      if (!data.audio_url) {
        throw new Error('No audio_url in TTS response');
      }
      await this.playAudioFromUrl(data.audio_url);

      if (__DEV__) console.log('[AbbyTTS] Audio playback completed');
    } catch (error) {
      if (__DEV__) console.error('[AbbyTTS] Speech failed:', error);
      throw error;
    }
  }

  /**
   * Stop current speech
   */
  async stop(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
      }

      if (this.audioLevelInterval) {
        clearInterval(this.audioLevelInterval);
        this.audioLevelInterval = null;
      }

      // Clear speech duration timer (from simulateSpeechDuration)
      if (this.speechDurationTimer) {
        clearTimeout(this.speechDurationTimer);
        this.speechDurationTimer = null;
      }

      if (__DEV__) console.log('[AbbyTTS] Stopped');
    } catch (error) {
      if (__DEV__) console.error('[AbbyTTS] Stop failed:', error);
    }
  }

  /**
   * Play audio from URL
   */
  private async playAudioFromUrl(url: string): Promise<void> {
    try {
      // Configure audio mode
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // Load and play
      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true },
        this.onPlaybackStatusUpdate.bind(this)
      );

      this.sound = sound;

      // Simulate audio levels for orb animation
      this.startAudioLevelSimulation();
    } catch (error) {
      if (__DEV__) console.error('[AbbyTTS] Playback failed:', error);
      throw error;
    }
  }

  /**
   * Handle playback status updates
   */
  private onPlaybackStatusUpdate(status: any): void {
    if (status.didJustFinish) {
      this.stop();
    }
  }

  /**
   * Simulate audio levels for orb animation
   * Real implementation would analyze actual audio waveform
   */
  private startAudioLevelSimulation(): void {
    if (!this.audioLevelCallback) return;

    let phase = 0;
    this.audioLevelInterval = setInterval(() => {
      if (!this.audioLevelCallback) {
        clearInterval(this.audioLevelInterval!);
        return;
      }

      // Simulate natural voice levels (0.3-0.9 range)
      const baseLevel = 0.6;
      const variation = Math.sin(phase) * 0.3;
      const randomNoise = (Math.random() - 0.5) * 0.1;
      const level = Math.max(0, Math.min(1, baseLevel + variation + randomNoise));

      this.audioLevelCallback(level);
      phase += 0.2;
    }, 50); // Update every 50ms
  }

  /**
   * Simulate speech duration for demo mode (no actual audio)
   * Provides audio level callbacks for orb animation
   */
  private simulateSpeechDuration(text: string, onAudioLevel: AudioLevelCallback): void {
    // Estimate speech duration: ~150ms per word
    const words = text.split(/\s+/).length;
    const duration = Math.max(1000, words * 150);

    if (__DEV__) console.log(`[AbbyTTS] Simulating ${words} words (~${duration}ms)`);

    this.audioLevelCallback = onAudioLevel;
    this.startAudioLevelSimulation();

    // Stop simulation after estimated duration (tracked for cleanup)
    this.speechDurationTimer = setTimeout(() => {
      this.stop();
    }, duration);
  }
}

// Export singleton instance
export const abbyTTS = new AbbyTTSService();

export default abbyTTS;
