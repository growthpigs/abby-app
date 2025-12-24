# ABBY Maintenance Plan

**Generated**: 2025-12-24 10:30 CET
**Analyzed by**: Claude Code Analysis Mode
**Project**: ABBY iOS App (React Native Expo)

---

## Executive Summary

| Category | Count |
|----------|-------|
| **Critical** | 1 |
| **High** | 3 |
| **Medium** | 8 |
| **Low** | 6 |
| **Total Issues** | 18 |

**Quick Win Time Estimate**: ~45 minutes of safe work
**Full Cleanup Time Estimate**: ~3-4 hours

---

## IMMEDIATE (Do First - Low Risk, High Value)

### Issue #1: Remove Unused Dependencies

**Category**: Code Quality
**Severity**: Medium
**Effort**: 5min
**Risk**: Low

**Current State**:
```json
// package.json has unused dependencies:
"event-target-shim": "^6.0.2",      // Added for Metro resolution, no longer needed
"expo-font": "...",                 // Fonts loaded via app.json instead
"react-native-worklets-core": "..." // Not used in production
```

**Proposed Fix**:
```bash
npm uninstall event-target-shim expo-font react-native-worklets-core
```

**Why This Matters**: Reduces bundle size and attack surface
**Breaking Risk**: Very low - depcheck confirmed these are unused
**Tests Needed**: Run `npm test` after removal

---

### Issue #2: Remove Unused DevDependencies

**Category**: Code Quality
**Severity**: Low
**Effort**: 5min
**Risk**: None

**Current State**:
```json
// Unused devDependencies:
"@config-plugins/react-native-webrtc": "13.0.0",
"@livekit/react-native-expo-plugin": "0.4.2"
```

**Proposed Fix**:
```bash
npm uninstall -D @config-plugins/react-native-webrtc @livekit/react-native-expo-plugin
```

**Why This Matters**: Cleaner dev environment, faster installs
**Breaking Risk**: None - these are config plugins for features not in use
**Tests Needed**: Build the app to verify

---

### Issue #3: Add Missing Jest Dependency

**Category**: Testing
**Severity**: Low
**Effort**: 2min
**Risk**: None

**Current State**:
```typescript
// Tests import from @jest/globals but it's not listed as devDependency
import { describe, expect, test } from '@jest/globals';
```

**Proposed Fix**:
```bash
npm install -D @jest/globals
```

**Why This Matters**: Proper dependency declaration for reproducible builds
**Breaking Risk**: None - tests already work (transitive dependency)
**Tests Needed**: `npm test`

---

## QUICK WINS (Do Second - Medium Value, Low Risk)

### Issue #4: Fix @ts-ignore Comments (4 instances)

**Category**: Type Safety
**Severity**: Medium
**Effort**: 15min
**Risk**: Low

**Current State**:
```typescript
// src/components/screens/CoachScreen.tsx:177-178
// src/components/screens/CoachIntroScreen.tsx (similar)
// @ts-ignore - color works via SvgProps
<Play size={11} color="#888888" />
```

**Proposed Fix**:
```typescript
import type { SvgProps } from 'react-native-svg';

// Option 1: Use proper typing
<Play size={11} stroke="#888888" />

// Option 2: Create properly typed wrapper
const PlayIcon = Play as React.FC<{ size: number; color?: string }>;
<PlayIcon size={11} color="#888888" />
```

**Why This Matters**: Prevents future type-related bugs
**Breaking Risk**: Low - purely cosmetic fix
**Tests Needed**: Visual verification

---

### Issue #5: Fix `as any` Type Casts (4 instances)

**Category**: Type Safety
**Severity**: Medium
**Effort**: 20min
**Risk**: Low

**Current State**:
```typescript
// src/components/screens/CoachIntroScreen.tsx:143-156
translateY.setOffset((translateY as any)._value);
const minY = SCREEN_HEIGHT * 0.1 - (translateY as any)._offset;
const currentY = (translateY as any)._value;
```

**Proposed Fix**:
```typescript
// Use useRef to track the value explicitly
const currentY = useRef(0);

// In pan responder:
onPanResponderGrant: () => {
  currentY.current = /* get value via listener */;
}
```

**Why This Matters**: Type safety and React Native architecture best practices
**Breaking Risk**: Low - internal implementation detail
**Tests Needed**: Manual drag gesture testing

---

### Issue #6: Remove Debug Console Statements

**Category**: Code Quality
**Severity**: Low
**Effort**: 15min
**Risk**: None

**Current State**:
30+ files contain console.log/warn/error statements, many are debug leftovers.

Files with most console statements:
- `src/components/layers/ShaderTest.tsx` (development file)
- `src/components/layers/LiquidGlass*.tsx` (shader debugging)
- `src/components/layers/VibeMatrix*.tsx` (shader debugging)

**Proposed Fix**:
1. Keep: Intentional logging in AbbyAgent.ts for connection state
2. Remove: All `console.log('[DEV]`, `console.log('[DEBUG]'`, shader compile logs
3. Wrap remaining logs with `__DEV__` check:
```typescript
if (__DEV__) {
  console.log('[AbbyAgent] Connected');
}
```

**Why This Matters**: Cleaner production logs, minor performance improvement
**Breaking Risk**: None
**Tests Needed**: None

---

## PLANNED WORK (Needs Review - High Value, Medium Risk)

### Issue #7: CRITICAL Security - xmldom Vulnerability

**Category**: Security
**Severity**: CRITICAL
**Effort**: 30min
**Risk**: Medium (major version update)

**Current State**:
```
xmldom <= 0.6.0 (via @expo/plist via @react-native-voice/voice)
GHSA-crh6-fp67-6883 - Allows multiple root nodes in DOM (CVSS 9.8)
GHSA-5fg8-2547-mr8q - Misinterpretation of malicious XML (CVSS 6.5)
```

**Proposed Fix**:
```bash
# Option 1: Update voice package (major version change)
npm install @react-native-voice/voice@3.1.5

# Option 2: If voice features not needed, remove entirely
npm uninstall @react-native-voice/voice
```

**Why This Matters**: CVSS 9.8 is critical - remote code execution possible
**Breaking Risk**: Medium - @react-native-voice/voice is listed as unused
**Tests Needed**: Full voice functionality testing OR verify voice not used

**Decision Required**: Is @react-native-voice/voice actually used? Depcheck says NO.

---

### Issue #8: TypeScript Module Resolution (39 errors)

**Category**: Type Safety
**Severity**: High
**Effort**: 1hr
**Risk**: Low (configuration only)

**Current State**:
```
src/components/layers/AbbyOrb/OrbCore2D.tsx(11,66): error TS2307:
Cannot find module '@shopify/react-native-skia' or its corresponding type declarations.
```

39 files fail tsc due to Skia type resolution.

**Root Cause Analysis**:
- Skia works at runtime (native module)
- Types not resolving in pure tsc check
- Jest tests pass (different module resolution)

**Proposed Fix**:
```json
// tsconfig.json - add skipLibCheck or configure moduleResolution
{
  "compilerOptions": {
    "skipLibCheck": true,
    // OR add to paths:
    "paths": {
      "@shopify/react-native-skia": ["node_modules/@shopify/react-native-skia"]
    }
  }
}
```

**Why This Matters**: Enables `tsc --noEmit` for CI validation
**Breaking Risk**: None - runtime unaffected
**Tests Needed**: Run `npx tsc --noEmit` after fix

---

### Issue #9: Dead Code Cleanup (50 unimported files)

**Category**: Code Quality
**Severity**: Medium
**Effort**: 2hr
**Risk**: Medium (need to verify usage)

**Current State**:
50 files flagged as unimported by `npx unimported`:

**Categories**:

| Category | Count | Action |
|----------|-------|--------|
| Legacy VibeMatrix components (1-18) | 18 | Archive or delete - replaced by shader strings |
| LiquidGlass variants (5-10) | 6 | Keep in App.liquid.tsx for dev testing |
| Dev/Experimental | 4 | Archive: AbbyConversation, AbbyDemo, FPSMonitor, ShaderTest |
| Screens (future) | 2 | Keep: OnboardingScreen, SettingsScreen (v2 features) |
| Services (unused) | 1 | Verify: SpeechRecognition.ts |
| Data/Types | 3 | Verify usage: demo-questions.ts, useVibeStore.ts, orb.ts |
| Shader infrastructure | 2 | Keep: shaders/index.ts (used by VibeMatrixAnimated) |
| Orb components | 5 | Archive: AbbyOrb/* (replaced by LiquidGlass4) |

**Proposed Fix**:
```bash
# Create archive directory
mkdir -p src/archive/legacy-shaders
mkdir -p src/archive/experimental

# Move legacy components
mv src/components/layers/VibeMatrix{1..18}.tsx src/archive/legacy-shaders/
mv src/components/layers/AbbyOrb* src/archive/experimental/
```

**Why This Matters**: Reduces cognitive load, cleaner codebase
**Breaking Risk**: Medium - need to verify App.liquid.tsx usage
**Tests Needed**: All tests, verify dev apps still work

**Decision Required**: Which variant apps (App.*.tsx) should remain supported?

---

### Issue #10: Consolidate Layer Components

**Category**: Architecture
**Severity**: High
**Effort**: 2hr
**Risk**: Medium

**Current State**:
- 37 component files in `src/components/layers/`
- Production only uses: AnimatedVibeLayer, VibeMatrixAnimated, LiquidGlass4
- Dev testing uses: All LiquidGlass variants, some VibeMatrix variants

**Proposed Structure**:
```
src/components/layers/
├── AnimatedVibeLayer.tsx      # Production entry point
├── VibeMatrixAnimated.tsx     # Shader-based background
├── LiquidGlass4.tsx           # Production orb
├── dev/                       # Dev testing only
│   ├── LiquidGlass1-3.tsx
│   ├── LiquidGlass5-10.tsx
│   └── TestHarness.tsx
└── archive/                   # Deprecated, to be deleted
    └── VibeMatrix1-18.tsx
```

**Why This Matters**: Clearer architecture, easier onboarding
**Breaking Risk**: Medium - affects dev workflow
**Tests Needed**: Verify App.liquid.tsx works after reorg

---

## DEFERRED (Architecture Decisions Required)

### Issue #11: Voice Package Decision

**Category**: Dependencies
**Severity**: High
**Effort**: 15min
**Risk**: Low

**Context**:
`@react-native-voice/voice` is flagged as:
1. Unused (depcheck)
2. Source of CRITICAL xmldom vulnerability
3. Contains deprecated expo config plugin

**Options**:
1. **Remove entirely** (if not needed) - Fixes security + reduces bundle
2. **Downgrade to 3.1.5** (if needed) - Fixes security but older API
3. **Keep and suppress** - Document risk and monitor

**Decision Required**: Is native speech recognition planned for ABBY?
- Currently using ElevenLabs for voice
- SpeechRecognition.ts is unimported

---

### Issue #12: LiquidGlass Variant Strategy

**Category**: Architecture
**Severity**: Low
**Effort**: Variable
**Risk**: Low

**Context**:
10 LiquidGlass variants exist (LiquidGlass.tsx through LiquidGlass10.tsx).
Only LiquidGlass4.tsx is used in production.

**Options**:
1. **Keep all** - Valuable for A/B testing and demos
2. **Archive unused** - Keep 4, archive others
3. **Merge into single configurable component** - More complex but cleaner

**Decision Required**: What's the strategy for visual variants?

---

### Issue #13: Test Coverage Expansion

**Category**: Testing
**Severity**: Medium
**Effort**: 4hr+
**Risk**: None

**Current State**:
- 251 tests, all passing
- Coverage only tracked for morphWrapper.ts (100%)
- No coverage for: screens, layers, services

**Proposed Approach**:
1. Add integration tests for demo flow
2. Add unit tests for AbbyAgent.ts and AbbyVoice.ts
3. Add snapshot tests for critical UI components

**Decision Required**: What's the target coverage percentage?

---

## Safe Automation (Pre-Approved Only)

**IF USER APPROVES, the following can be automated:**

1. Remove unused dependencies (Issue #1, #2)
2. Add @jest/globals (Issue #3)
3. Wrap console.logs with __DEV__ check (Issue #6)
4. Fix eslint auto-fixable issues (none found)

**Command to execute**:
```bash
# Create safety branch
git checkout -b auto-cleanup-2024-12-24

# Remove unused deps
npm uninstall event-target-shim expo-font react-native-worklets-core
npm uninstall -D @config-plugins/react-native-webrtc @livekit/react-native-expo-plugin

# Add missing dep
npm install -D @jest/globals

# Run tests to verify
npm test

# If tests pass, commit
git add -A
git commit -m "chore: remove unused dependencies and add missing jest types"
```

---

## DO NOT TOUCH

The following areas require extreme caution:

1. **ElevenLabs Integration** (`src/services/AbbyAgent.ts`)
   - Just validated and working
   - Contains conversation state machine

2. **useDraggableSheet Hook** (`src/hooks/useDraggableSheet.ts`)
   - Core gesture handling
   - Recently refactored and tested

3. **Shader Source Strings** (`src/shaders/vibeMatrix*.ts`)
   - GLSL code - changes break compilation
   - Visual changes require device testing

4. **App.demo.tsx Entry Point**
   - Production demo flow
   - Any changes need full flow testing

---

## Files Reference

### Scan Output Files
- `lint-report.txt` - No lint script configured
- `type-coverage.txt` - 39 Skia module errors
- `dead-code.txt` - 50 unimported files (see Issue #9)
- `security-audit.json` - 5 vulnerabilities (1 critical)
- `coverage-report.txt` - 251 tests, 100% on morphWrapper

### Key Metrics
| Metric | Value |
|--------|-------|
| Total Source Files | 37 layers + 6 screens + 4 services |
| Test Count | 251 |
| Test Pass Rate | 100% |
| Security Vulns | 5 (1 critical, 4 moderate) |
| Unused Files | 50 |
| Unused Dependencies | 7 |
| TypeScript Errors | 39 (all Skia module resolution) |
| Console Statements | 30+ files |

---

## Recommended Action Plan

### Today (15 min)
1. Remove `@react-native-voice/voice` if unused - Fixes CRITICAL vulnerability
2. Remove other unused dependencies

### This Week (2 hr)
3. Fix TypeScript module resolution
4. Clean up console.log statements
5. Archive truly unused files

### Next Sprint
6. Add test coverage for services
7. Consolidate layer components
8. Document component usage patterns

---

*Analysis complete. Ready for your review when you return!*
