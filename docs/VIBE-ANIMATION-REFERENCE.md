# VibeMatrix Animation Reference

> Complete documentation of Abby's 750-state visual system

**Branch:** `test-jan2-animation` (WORKING)
**Last Verified:** 2026-01-13

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

### Critical Fix Applied

```typescript
// VibeMatrixAnimated.tsx - GitHub Issue #2640
const uniforms = useDerivedValue(() => {
  return {
    u_time: clock.value,
    // ... other uniforms
  };
}); // NO dependency array - required for useClock to update
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

## Known Issues

1. **Branch-specific:** Animation ONLY works on `test-jan2-animation`, not `client-api-integration`
2. **Web not supported:** Skia CanvasKit (WASM) doesn't match iOS native behavior
3. **Haptics warning:** iOS simulator shows haptic pattern errors (harmless)

---

## Verified Working: 2026-01-13

Screenshot shows login screen with purple/pink gradient animating ✓
