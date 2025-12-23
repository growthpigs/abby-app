// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Fix event-target-shim/index import warnings from LiveKit
// LiveKit packages import 'event-target-shim/index' but v6.0.2 exports don't expose ./index subpath
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Redirect event-target-shim/index to the main module
  if (moduleName === 'event-target-shim/index') {
    return context.resolveRequest(context, 'event-target-shim', platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
