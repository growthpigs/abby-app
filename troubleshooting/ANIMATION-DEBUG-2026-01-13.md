# VibeMatrix Animation Debug Log - 2026-01-13

## Problem Statement
Shader animation (organic, flowing background) works on `test-jan2-animation` branch but NOT on `client-api-integration` branch.

## Environment
- Expo SDK 54
- React Native 0.81.5
- @shopify/react-native-skia
- react-native-reanimated
- iOS Simulator (iPhone 17 Pro)

## What We've Tried

### 1. Package Version Investigation
| Branch | Reanimated | Worklets | Skia | Animation |
|--------|------------|----------|------|-----------|
| test-jan2-animation | 4.1.6 | 0.5.1 | 2.4.7 | WORKS |
| client-api-integration (original) | 3.19.5 | none | 2.4.14 | BROKEN |
| client-api-integration (updated) | 4.1.6 | 0.5.2 | 2.4.14 | STILL BROKEN |

### 2. Nuclear Clean Rebuilds
- Deleted: node_modules, ios, package-lock.json
- Fresh: npm install, expo prebuild --clean, pod install
- Result: Still broken

### 3. Babel Plugin Investigation
- Both branches use same babel.config.js
- Both use `react-native-reanimated/plugin`
- NOT a differentiator

### 4. Code Comparison
- VibeMatrixAnimated.tsx is IDENTICAL between branches
- ShaderLayer internal component identical
- useClock() used correctly

### 5. GitHub Issue #2640 Fix
- Issue: "useClock does not update when passed as a uniform"
- Fix: Remove dependency array from useDerivedValue
- Applied: Changed `}, [clock, morphProgress, morphDirection]);` to `});`
- Result: Still broken

## Key Observations

1. **Same code + same packages = different behavior**
   - This suggests something OUTSIDE the code is causing the issue
   - Could be: Metro cache, native build artifact, simulator state

2. **Works immediately when switching to test-jan2-animation**
   - Even with fresh rebuild on same machine
   - Points to branch-specific difference we haven't found

3. **Bundle identifier difference**
   - test-jan2-animation: `com.manuelnegreiro.abby`
   - client-api-integration: `com.myaimatchmaker.abby`
   - These are DIFFERENT apps on the simulator

## Theories Still To Test

1. **Web Test** - Does Skia animation work on web? Would isolate iOS-specific issues
2. **Simulator State** - Fresh simulator with no cached apps
3. **app.json Differences** - May have settings affecting Skia/Reanimated
4. **Native Module Caching** - iOS may be caching old native code

## Files Changed

- `package.json` - Updated to Reanimated 4.1.6 + worklets
- `src/components/layers/VibeMatrixAnimated.tsx` - Removed useDerivedValue dependency array

## Next Steps

1. Test on web (Skia has web support)
2. Compare app.json between branches more thoroughly
3. Try fresh simulator
4. Check if there's a Skia-specific config we're missing
