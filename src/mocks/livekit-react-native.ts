/**
 * Mock for @livekit/react-native when running in Expo Go
 * Provides type-safe stubs that let the app run without native modules
 */

export const AudioSession = {
  configureAudio: async () => {
    console.warn('[LiveKit Mock] Audio not available in Expo Go');
  },
  startAudioSession: async () => {
    console.warn('[LiveKit Mock] Audio not available in Expo Go');
  },
  stopAudioSession: async () => {},
  selectAudioOutput: async () => {},
  setAppleAudioConfiguration: async () => {},
};

export default { AudioSession };
