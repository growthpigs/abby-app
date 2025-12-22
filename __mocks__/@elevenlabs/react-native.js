// Mock ElevenLabs React Native SDK for Jest
module.exports = {
  useConversation: jest.fn(() => ({
    status: 'disconnected',
    isSpeaking: false,
    canSendFeedback: false,
    startSession: jest.fn(),
    endSession: jest.fn(),
    getId: jest.fn(() => ''),
    sendFeedback: jest.fn(),
    sendContextualUpdate: jest.fn(),
    sendUserMessage: jest.fn(),
    sendUserActivity: jest.fn(),
  })),
  ElevenLabsProvider: 'ElevenLabsProvider',
};
