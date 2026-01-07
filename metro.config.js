// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Mock native modules for Expo Go compatibility
const nativeMocks = {
  'expo-secure-store': path.resolve(__dirname, 'src/mocks/expo-secure-store.ts'),
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Redirect native modules to mocks for Expo Go compatibility
  if (nativeMocks[moduleName]) {
    return {
      filePath: nativeMocks[moduleName],
      type: 'sourceFile',
    };
  }

  // Fix event-target-shim/index import warnings from LiveKit
  // LiveKit packages import 'event-target-shim/index' but v6.0.2 exports don't expose ./index subpath
  if (moduleName === 'event-target-shim/index') {
    return context.resolveRequest(context, 'event-target-shim', platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
