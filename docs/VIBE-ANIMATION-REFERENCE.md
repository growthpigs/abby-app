# VibeMatrix Animation Reference

> Complete documentation of Abby's 750-state visual system

**Branch:** `client-api-integration` (CURRENT)
**Last Updated:** 2026-01-13
**Animation Status:** Working (with fixes applied)

---

## Animation State Machine

### AppState → Vibe Mapping

| App State | Theme | Colors | Complexity | Orb Energy | Use Case |
|-----------|-------|--------|------------|------------|----------|
| `COACH_INTRO` | GROWTH | Emerald→Mint | SMOOTHIE (0.1) | CALM | Welcome screen |
| `ONBOARDING` | TRUST | Blue→Cyan | SMOOTHIE (0.1) | CALM | Account setup |
| `VERIFICATION` | TRUST | Blue→Cyan | SMOOTHIE (0.1) | CALM | ID verification |
| `INTERVIEW_LIGHT` | TRUST | Blue→Cyan | FLOW (0.3) | CALM | Light questions |
| `INTERVIEW_DEEP` | DEEP | Violet→Indigo | OCEAN (0.5) | ENGAGED | Deep questions |
| `INTERVIEW_SPICY` | PASSION | Rose→Pink | OCEAN (0.5) | ENGAGED | Spicy questions |
| `PROFILE_COMPLETE` | PASSION | Rose→Pink | STORM (0.7) | EXCITED | Milestone celebration |
| `SEARCHING` | CAUTION | Amber→Orange | OCEAN (0.5) | ENGAGED | Finding matches |
| `MATCH_FOUND` | PASSION | Rose→Pink | STORM (0.7) | EXCITED | Match reveal! |
| `COACH` | GROWTH | Emerald→Mint | SMOOTHIE (0.1) | CALM | Coaching mode |
| `INTERVENTION` | DEEP | Violet→Indigo | PAISLEY (1.0) | CALM | Red flag warning |

---

## Color Themes

### TRUST (Blue)
- **Primary:** `#3B82F6` (Electric Blue)
- **Secondary:** `#06B6D4` (Cyan)
- **Angle:** 135°
- **Use:** Onboarding, light questions, building rapport

### PASSION (Red/Pink)
- **Primary:** `#E11D48` (Rose Red)
- **Secondary:** `#F472B6` (Hot Pink)
- **Angle:** 45°
- **Use:** Matches, celebrations, spicy questions

### CAUTION (Orange)
- **Primary:** `#F59E0B` (Amber)
- **Secondary:** `#D97706` (Burnt Orange)
- **Angle:** 180°
- **Use:** Processing, searching, analyzing

### GROWTH (Green)
- **Primary:** `#10B981` (Emerald)
- **Secondary:** `#34D399` (Mint)
- **Angle:** 90°
- **Use:** Coaching, advice, support

### DEEP (Purple)
- **Primary:** `#4C1D95` (Violet)
- **Secondary:** `#8B5CF6` (Indigo)
- **Angle:** 225°
- **Use:** Deep questions, interventions, serious moments

### ALERT (Grey)
- **Primary:** `#374151` (Cool Grey)
- **Secondary:** `#6B7280` (Slate)
- **Angle:** 270°
- **Use:** Warnings, system messages

---

## Complexity Levels (Animation Intensity)

| Level | Value | Visual Effect |
|-------|-------|---------------|
| `SMOOTHIE` | 0.1 | Gentle, slow morphing |
| `FLOW` | 0.3 | Moderate movement |
| `OCEAN` | 0.5 | Significant animation |
| `STORM` | 0.7 | Intense, dramatic |
| `PAISLEY` | 1.0 | Maximum complexity |

---

## Orb Energy States

| Energy | Value | Visual |
|--------|-------|--------|
| `CALM` | 0.0 | Gentle pulse |
| `ENGAGED` | 0.5 | Active response |
| `EXCITED` | 1.0 | High energy |

---

## Testing Checklist

### State Transitions to Verify

- [ ] Login → COACH_INTRO (Green SMOOTHIE)
- [ ] Name entry → TRUST FLOW (Blue)
- [ ] Light question → INTERVIEW_LIGHT (Blue FLOW)
- [ ] Deep question → INTERVIEW_DEEP (Purple OCEAN)
- [ ] Spicy question → INTERVIEW_SPICY (Pink OCEAN)
- [ ] Search initiated → SEARCHING (Orange OCEAN)
- [ ] Match found → MATCH_FOUND (Pink STORM)
- [ ] Coach mode → COACH (Green SMOOTHIE)

### What to Look For

1. **Color Morph** - Colors should interpolate smoothly, never hard cut
2. **Complexity Change** - Animation speed/intensity should transition
3. **No Flicker** - Shader should never flash white or reset
4. **60 FPS** - Animation should be smooth

---

## Technical Implementation

### Key Files

| File | Purpose |
|------|---------|
| `src/store/useVibeController.ts` | State machine & mappings |
| `src/store/storeSync.ts` | Demo→Vibe synchronization |
| `src/constants/colors.ts` | Color definitions |
| `src/components/layers/VibeMatrixAnimated.tsx` | Shader rendering |
| `src/shaders/factory/registryV2.ts` | Shader preset registry |
| `src/shaders/factory/presets.ts` | 19 shader preset definitions |
| `src/shaders/factory/effects/domainWarp.ts` | Domain warp effect |
| `src/components/dev/VibeDebugOverlay.tsx` | Debug overlay with shader switching |

### Critical Fixes Applied (2026-01-13)

#### Fix 1: useDerivedValue Dependency Array

```typescript
// VibeMatrixAnimated.tsx - GitHub Issue #2640
// WRONG: dependency array kills useClock updates
const uniforms = useDerivedValue(() => {
  return { u_time: clock.value, ... };
}, [clock, morphProgress]);  // ❌ BREAKS ANIMATION

// CORRECT: no dependency array
const uniforms = useDerivedValue(() => {
  return { u_time: clock.value, ... };
});  // ✅ Animation works
```

#### Fix 2: Canvas mode="continuous"

```tsx
// Without this, Skia only re-renders on prop changes
<Canvas style={styles.canvas} mode="continuous">
```

#### Fix 3: Animation Speed

```glsl
// domainWarp.ts - increased 3x
float speed = mix(0.15, 0.5, u_complexity);  // was 0.05, 0.25
```

### Package Requirements

```json
{
  "react-native-reanimated": "~4.1.1",
  "react-native-worklets": "^0.5.1",
  "@shopify/react-native-skia": "^2.4.7"
}
```

---

## Shader Presets (19 Available)

Switch via debug overlay (🎨 button → SHADER PRESETS):

| ID | Name | Description |
|----|------|-------------|
| 0 | DOMAIN_WARP | Organic flowing patterns (default) |
| 1 | DOMAIN_WARP_ENHANCED | Enhanced with tie-dye flow |
| 2 | WARM_FIRE_SWIRLS | Fire swirls, warm colors |
| 3 | NEON_AURORA_SPIRALS | Aurora, neon colors |
| 4 | CELLULAR_DREAMS | Aerial reef patterns |
| 5 | LIQUID_MARBLE | Marble with veins |
| 6 | KALEIDOSCOPE_BLOOM | Radial symmetry |
| 7 | FLOWING_STREAMS | Ocean shore streams |
| 8 | RADIAL_FLOW_FIELD | Deep ocean flow |
| 9 | BLOB_METABALLS | Organic metaballs |
| 10 | CHROMATIC_BLOOM | Chromatic aberration |
| 11 | LAYERED_ORBS | Coral reef orbs |
| 12 | STIPPLED_GRADIENT | Pointillist effect |
| 13 | BREATHING_NEBULA | Fluid nebula |
| 14 | MAGNETIC_FIELD_LINES | Tidal pool lines |
| 15 | CRYSTALLINE_FACETS | Seafoam crystals |
| 16 | INK_BLOOM | Ink in water |
| 17 | CELLULAR_MEMBRANE | Lagoon membrane |
| 18 | AURORA_CURTAINS | Ocean aurora |

---

## Known Issues

1. **Speed still slow** - Animation slower than original handwritten shaders
2. **Directional bias** - Animation drifts toward top-left corner
3. **Factory vs Original** - Generated shaders differ from original G1/G2/G4
4. **Web not supported** - Skia CanvasKit (WASM) doesn't match iOS native behavior
5. **Haptics warning** - iOS simulator shows haptic pattern errors (harmless)

---

## Debug Overlay Usage

1. Tap 🎨 button (bottom right)
2. **DEMO STATES** - Switch app screens
3. **DIRECT VIBE STATES** - Change color themes
4. **SHADER PRESETS** - Switch texture effects (0-18)

---

## Verified Working: 2026-01-13

- Animation is running (not static)
- Color transitions work
- Shader switching works
- Speed slower than original (needs tuning)
