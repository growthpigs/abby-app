# VibeMatrix - Background Shader Feature

> Owner: Chi | Layer 0 of Glass Sandwich

---

## Overview

The living, procedural background that responds to app state. Domain-warped fBM shaders creating a "bioluminescent ocean" effect.

---

## Current State

- **18 background shader variations** (BG1-18)
- **Dev toggle** in `App.liquid.tsx` for testing
- **FPS Monitor** added for performance testing

### Shader Inventory

| Range | Style | Complexity |
|-------|-------|------------|
| BG1-7 | Original (tie-dye, fire, aurora, marble) | Low-Medium |
| BG8-13 | William Mapan inspired (deep ocean, metaballs) | Medium |
| BG14-18 | Artistic (tidal pools, ink bloom, lagoon) | Medium-High |

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
| 2024-12-10 | LOCKED IN: Alpha-glow blending architecture for orb+background cohesion |
| 2024-12-10 | All G1-G10 orbs updated to proper alpha transparency |
| 2024-12-10 | Dev UI switched to black text (better visibility on bright backgrounds) |
| 2024-12-10 | Added GPU performance research, FPS monitor |
| 2024-12-09 | 18 shader variations complete |
