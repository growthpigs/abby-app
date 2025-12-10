# Abby Project Learnings

**Purpose:** Project-specific discoveries, patterns, and insights.

**Last Updated:** 2025-12-10

---

## Shader/Skia Patterns

### Skia Canvas absoluteFillObject Container Bug (2025-12-10)
When Skia Canvas uses `StyleSheet.absoluteFillObject`, it fills its PARENT container, not the screen. Wrapping in a 300x300 View makes shader render as flat square. Solution: Render at root level or use explicit width/height.

### SkSL vs GLSL Differences (2025-12-10)
- Use `atan(y, x)` not `atan2(y, x)`
- Use `floor(x/y)*y` not `x % y` for floats
- No function overloading in SkSL

### Reanimated Array Animation (2025-12-10)
Can't animate `useSharedValue([r,g,b])` - arrays swap instantly. Use separate shared values per channel:
```typescript
const colorR = useSharedValue(0.5);
const colorG = useSharedValue(0.3);
const colorB = useSharedValue(0.9);
```

---

## Architecture Patterns

### Reverse Chameleon Effect (2025-12-10)
Orb alpha-glow naturally tints background via GPU framebuffer compositing. Zero code needed - emergent from alpha blending. Orb "breathes color into surroundings."

### 750-State Visual System (2025-12-10)
Structure state as orthogonal axes:
- Active Party (2) × Background Mode (5) × Color Theme (5) × Complexity (5) × Orb Energy (3)
- = 750 states from 5 small axes
- Each axis has clear trigger/meaning

### File Ownership for Parallel Work (2025-12-10)
When running multiple Claude Code agents:
- Define exclusive file ownership per agent
- Mark "coordinate" files that need sync
- Set explicit sync points

---

## Integration Lessons

### ElevenLabs Agent SDK Required (2025-12-10)
Custom stack (Whisper STT + ElevenLabs TTS) failed due to:
- Whisper: Batch-only API, 500ms-2s latency
- ElevenLabs TTS: Returns MP3, can't extract PCM amplitude
- Solution: Use ElevenLabs Agent SDK (all-in-one)

### expo-av Deprecated (2025-12-10)
`expo-av` deprecated in SDK 54. Need to migrate audio playback.

---

## Color Tuning

### Color Saturation on Dark Backgrounds (2025-12-10)
Initial color themes were too harsh/saturated:
- CAUTION: #F59E0B → #D97706 (deeper orange)
- TRUST: #3B82F6 → #2563EB (deeper blue)
- GROWTH: #10B981 → #059669 (deeper emerald)

Darker, less saturated colors work better over animated shader backgrounds.

---

## Open Questions

1. **Speaking pulse wiring** - How to connect `isSpeaking` to orb `audioLevel`?
2. **10 background switching** - Need shader switcher component
3. **Gradient backgrounds** - Shaders need `u_gradientAngle` uniform
