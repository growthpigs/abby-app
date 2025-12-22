// Mock LiveKit React Native SDK for Jest
module.exports = {
  AudioSession: {
    configureAudio: jest.fn(() => Promise.resolve()),
    startAudioSession: jest.fn(() => Promise.resolve()),
    stopAudioSession: jest.fn(() => Promise.resolve()),
    selectAudioOutput: jest.fn(() => Promise.resolve()),
    setAppleAudioConfiguration: jest.fn(() => Promise.resolve()),
  },
};
