module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  // Mock React Native and Expo modules for node testing
  moduleNameMapper: {
    '^react-native$': '<rootDir>/__mocks__/react-native.js',
    '^react$': '<rootDir>/__mocks__/react.js',
    '^@livekit/react-native$': '<rootDir>/__mocks__/@livekit/react-native.js',
    '^expo-blur$': '<rootDir>/__mocks__/expo-blur.js',
    '^expo-haptics$': '<rootDir>/__mocks__/expo-haptics.js',
  },
  // Silence console during tests
  silent: true,
};
