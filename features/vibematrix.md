# VibeMatrix - Background Shader Feature

> Owner: Chi | Layer 0 of Glass Sandwich

---

## Overview

The living, procedural background that responds to app state. Domain-warped fBM shaders creating a "bioluminescent ocean" effect.

---

## Current State

- **10 approved demo backgrounds** (BG1-10) - used in interview flow
- **8 additional shaders** (BG11-18) - NOT approved for demo
- **Dev toggle** in `App.liquid.tsx` for testing
- **FPS Monitor** added for performance testing

---

## Demo Flow Background Mapping (LOCKED IN)

**10 questions → 10 backgrounds, soft → hard progression**

| Question | Shader | Name | Vibe |
|----------|--------|------|------|
| 1 | BG1 | Domain Warping fBM | Soft, welcoming |
| 2 | BG2 | Warm Fire Swirls | Warming up |
| 3 | BG3 | Neon Aurora Spirals | Getting energetic |
| 4 | BG4 | Aerial Reef | Building |
| 5 | BG5 | Liquid Marble | Mid-point depth |
| 6 | BG6 | Kaleidoscope Bloom | More intense |
| 7 | BG7 | Ocean Shore | Deepening |
| 8 | BG8 | Deep Ocean | Strong |
| 9 | BG9 | Blob Metaballs | Very intense |
| 10 | BG10 | Chromatic Bloom | Peak intensity |

**Code**: `src/components/screens/InterviewScreen.tsx`
```typescript
const getBackgroundIndexForQuestion = (questionIndex: number): number => {
  return questionIndex + 1; // Question 0 → BG1, Question 9 → BG10
};
```

---

### Full Shader Inventory

| Range | Style | Status |
|-------|-------|--------|
| BG1-10 | Demo flow (soft → hard) | ✅ APPROVED |
| BG11-18 | Extra variations | ❌ NOT in demo |

---

## GPU Performance Research (2024-12-10)

### Can we run Background + Orb + Audio?

**Yes, with caveats.**

| Scenario | Expected FPS | Battery/hr |
|----------|-------------|------------|
| BG shader only | 60fps | 5-10% |
| BG + Orb | 55-60fps | 10-15% |
| BG + Orb + Audio | 50-60fps | 15-25% |

### Key Findings

**Skia on iOS**:
- Uses Metal backend (hardware accelerated)
- 60fps achievable if using Reanimated shared values (not React state)
- Multiple Canvas layers acceptable

**Audio doesn't compete with GPU**:
- iOS audio uses hardware decoder (AAC/MP3)
- Separate resource path from GPU
- `expo-av` deprecated in SDK 55 - use `react-native-track-player`

**Known Issues**:
- Memory leaks possible on iOS (RAM grows with renders)
- Thermal throttling after 15+ min continuous use
- Need Low Power Mode fallback

### Shader Complexity Analysis

**Heavy example - BG16 (Ink Bloom)**:
- ~500 ops per pixel
- 6 octave fBM, 4 ink drops, water flow distortion
- Use for "premium" moments, not constant

**Recommendation**: Implement 3 quality tiers:
1. Full - current shaders
2. Medium - reduce fBM octaves (6→3)
3. Low - static gradient images

---

## Files

| File | Purpose |
|------|---------|
| `src/shaders/vibeMatrix*.ts` | Shader source code |
| `src/components/layers/VibeMatrix*.tsx` | Canvas wrappers |
| `src/components/dev/FPSMonitor.tsx` | Performance monitor |

---

## Open Tasks

- [ ] Test BG16 + G10 combo on real device (check FPS monitor)
- [ ] Profile with Xcode Instruments
- [ ] Test on iPhone 11/12 (older GPUs)
- [ ] Implement Low Power Mode detection
- [ ] Create quality tier system

---

## Layer Blending Architecture (LOCKED IN)

**Orb affects background colors via alpha-glow blending.**

How it works:
- Orb shaders return `vec4(color, alpha)` where alpha = edge + glow falloff
- GPU framebuffer blends orb color over background at alpha < 1.0 regions
- Orb's glow naturally tints the background, creating cohesive color sync
- When vibe changes (TRUST→PASSION), both layers shift together

Why this is correct:
- Single render pass per layer (no compositing overhead)
- Alpha blending is GPU-native and cheap
- Emergent visual cohesion without explicit color-sync logic
- Matches "living, breathing" design philosophy

Technical notes:
- All G1-G10 orbs updated to proper alpha transparency
- Background runs independently - blending happens at framebuffer level
- No React state sync needed between layers

---

## Morph Transitions (NEW)

**Organic "ink spreading" effect between background shaders.**

### Problem with Crossfade
Simple opacity crossfade (`mix(shaderA, shaderB, t)`) creates a uniform dissolve effect that looks digital/artificial.

### Solution: Noise-Based Per-Pixel Blending
Instead of uniform opacity, use fBM noise to determine per-pixel visibility:

```
Each pixel samples noise(uv) → value 0-1
As progress 0→1, threshold sweeps through noise range
Pixel shows shaderA where noise < threshold
Pixel shows shaderB where noise > threshold
smoothstep creates soft edges at boundary
```

### Result
- Old shader shrinks in organic blob shapes
- New shader grows into those same shapes
- Complementary alphas ensure no gaps or overlaps
- Creates "ink spreading through water" visual effect

### Architecture
```
┌─────────────────────────────────────────┐
│         VibeMatrixAnimated              │
│  ┌─────────────┐  ┌─────────────┐       │
│  │  Current    │  │  Next       │       │
│  │ (dir=-1)    │  │ (dir=+1)    │       │
│  └──────┬──────┘  └──────┬──────┘       │
│         │ morphProgress (0→1)           │
│         ▼                               │
│  Same noise pattern, opposite alphas    │
│  alpha_current = 1 - alpha_next         │
└─────────────────────────────────────────┘
```

### Files
- `src/shaders/morphWrapper.ts` - Injects noise-based alpha into any shader
- `src/components/layers/VibeMatrixAnimated.tsx` - Orchestrates morph transitions

### Parameters (Tunable)
- Blob size: `uv * 3.0` in morphFbm (lower = larger blobs)
- Edge softness: `edge = 0.15` in getMorphAlpha
- Duration: `transitionDuration` prop (default 1000ms)

---

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2024-12-10 | Orb-background color blending via alpha glow | Emergent cohesion, GPU-native, matches design philosophy |
| 2024-12-10 | Layered shaders viable | Research confirms Metal backend handles it |
| 2024-12-10 | Need quality tiers | Battery/thermal concerns on extended use |

---

## Changelog

| Date | Change |
|------|--------|
| 2024-12-10 | MORPH TRANSITIONS: Replaced uniform crossfade with noise-based per-pixel blending. Creates organic "ink spreading" effect between shaders. See `morphWrapper.ts` (Chi) |
| 2024-12-10 | Fixed overexposure in BG4, BG7, BG8, BG9, BG10 - removed base offsets, reduced additive ops, added gamma correction (Chi) |
| 2024-12-10 | Fixed overexposure in BG2, BG3, BG5, BG6 - removed brightness multipliers |
| 2024-12-10 | LOCKED IN: Demo flow uses BG1-10 only, mapped 1:1 to questions |
| 2024-12-10 | LOCKED IN: Alpha-glow blending architecture for orb+background cohesion |
| 2024-12-10 | All G1-G10 orbs updated to proper alpha transparency |
| 2024-12-10 | Dev UI switched to black text (better visibility on bright backgrounds) |
| 2024-12-10 | Added GPU performance research, FPS monitor |
| 2024-12-09 | 18 shader variations complete |
