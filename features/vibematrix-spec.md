# FEATURE SPEC: VibeMatrix Background System

**What:** Living GLSL shader background that morphs based on conversation state
**Who:** All app users experiencing the "bioluminescent ocean" metaphor
**Why:** Creates emotional connection and organic feel - core differentiator from static dating apps
**Status:** 🚀 Implemented & Optimized

---

## User Stories

**US-003: Abby Introduction**
As a user who completed basic setup, I want to meet Abby in a magical way so that I feel excited about the process.

Acceptance Criteria:
- [x] VibeMatrix background renders smoothly with color morphing
- [x] Abby orb appears with breathing animation
- [x] Transition from onboarding to Abby is seamless
- [x] User feels the interface is "alive" not static
- [x] No white screens or jarring cuts

**US-006: Emotional State Visualization**
As a user, I want the background to reflect the mood of our conversation so that the experience feels emotionally connected.

Acceptance Criteria:
- [x] VibeMatrix shifts to TRUST (blue) during onboarding
- [x] VibeMatrix shifts to DEEP (violet) during intimate questions
- [x] VibeMatrix shifts to CAUTION (orange) during deal-breaker topics
- [x] Color transitions are smooth (800-1200ms) not jarring
- [x] Abby orb position and breathing adapt to conversation state

**US-009: Smooth Performance**
As a user, I want the app to run smoothly so that the magical feeling isn't broken by technical issues.

Acceptance Criteria:
- [x] App maintains 60fps during normal usage
- [x] Shader performance doesn't drain battery excessively
- [x] Low power mode switches to static backgrounds when battery < 20%
- [x] App launches in under 3 seconds
- [x] No crashes during 10-minute usage sessions

---

## Functional Requirements

What this feature DOES:
- [x] Renders 18 different procedural shader backgrounds (BG1-BG18)
- [x] Morphs between shaders using organic noise-based transitions
- [x] Adapts to 6 vibe states: TRUST, DEEP, CAUTION, PASSION, GROWTH, ALERT
- [x] Implements 3 quality tiers for performance optimization
- [x] Provides alpha-glow blending for orb color cohesion
- [x] Monitors and reports FPS performance
- [x] Automatically falls back to static gradients in low power mode

What this feature does NOT do:
- ❌ Play video files or static images as backgrounds
- ❌ Respond directly to touch input (that's handled by UI layer)
- ❌ Store shader state between app sessions (resets on launch)
- ❌ Generate new shaders dynamically (uses pre-built collection)

---

## Data Model

Entities involved:
- **AppState** - Current vibe state (TRUST/DEEP/CAUTION/PASSION/GROWTH/ALERT)
- **AppState** - Low power mode boolean
- **InterviewSession** - Question progression for background mapping

New fields needed:
| Entity | Field | Type | Description |
|--------|-------|------|-------------|
| AppState | vibeState | enum | Current emotional state for background |
| AppState | lowPowerMode | boolean | If shaders should be disabled for battery |
| AppState | shaderQuality | enum | full/medium/low quality tier |

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /app/config | GET | Get lowPowerModeThreshold from feature flags |

*Note: VibeMatrix is frontend-only. No direct API calls - state driven via Zustand store.*

---

## UI Components

| Component | Purpose | Location |
|-----------|---------|----------|
| VibeMatrix | Base shader renderer | `src/components/layers/VibeMatrix.tsx` |
| VibeMatrixAnimated | Morph transition orchestrator | `src/components/layers/VibeMatrixAnimated.tsx` |
| FPSMonitor | Performance debugging | `src/components/dev/FPSMonitor.tsx` |

---

## Implementation Tasks

### Setup ✅
- [x] TASK-001: Install @shopify/react-native-skia dependency
- [x] TASK-002: Create base shader infrastructure
- [x] TASK-003: Set up Canvas rendering pipeline

### Core ✅
- [x] TASK-004: Implement 18 shader variations (BG1-BG18)
- [x] TASK-005: Create vibe state mapping system
- [x] TASK-006: Build noise-based morph transitions
- [x] TASK-007: Implement alpha-glow blending for orb cohesion
- [x] TASK-008: Add performance monitoring
- [x] TASK-009: Create quality tier system (full/medium/low)

### Polish ✅
- [x] TASK-010: Fix overexposure issues in BG4,7,8,9,10
- [x] TASK-011: Optimize shader complexity for 60fps target
- [x] TASK-012: Implement low power mode fallbacks
- [x] TASK-013: Lock in demo flow background mapping (BG1-10)

---

## Architecture: Glass Sandwich Layer 0

```
Layer 3 (Z:30) - SemanticOverlay    │ Accessibility targets
Layer 2 (Z:20) - GlassInterface     │ BlurView + all UI
Layer 1 (Z:10) - AbbyOrb            │ Reactive 3D orb
Layer 0 (Z:0)  - VibeMatrix         │ GLSL shader background ← THIS LAYER
```

**Critical**: VibeMatrix renders first, all other layers composite on top with proper blending.

---

## Vibe State Mapping

| Vibe State | Color | Hex | Shader Style | Trigger Context |
|------------|-------|-----|--------------|-----------------|
| TRUST | Blue | #3B82F6 | Soft, welcoming domain warping | Onboarding, safe topics |
| DEEP | Violet | #4C1D95 | Rich, complex patterns | Intimate/personal questions |
| CAUTION | Orange | #F59E0B | Energetic, warning tones | Deal-breakers, sensitive topics |
| PASSION | Red | #E11D48 | Intense, dynamic motion | Physical preferences, attraction |
| GROWTH | Green | #10B981 | Organic, flowing forms | Future planning, relationship goals |
| ALERT | Grey | #374151 | Muted, system-like | Error states, loading |

---

## Demo Flow Background Mapping (LOCKED IN)

**10 questions → 10 backgrounds, soft → hard progression**

| Question | Shader | Name | Vibe | Implementation |
|----------|--------|------|------|----------------|
| 1 | BG1 | Domain Warping fBM | Soft, welcoming | `src/shaders/vibeMatrix1.ts` |
| 2 | BG2 | Warm Fire Swirls | Warming up | `src/shaders/vibeMatrix2.ts` |
| 3 | BG3 | Neon Aurora Spirals | Getting energetic | `src/shaders/vibeMatrix3.ts` |
| 4 | BG4 | Aerial Reef | Building | `src/shaders/vibeMatrix4.ts` |
| 5 | BG5 | Liquid Marble | Mid-point depth | `src/shaders/vibeMatrix5.ts` |
| 6 | BG6 | Kaleidoscope Bloom | More intense | `src/shaders/vibeMatrix6.ts` |
| 7 | BG7 | Ocean Shore | Deepening | `src/shaders/vibeMatrix7.ts` |
| 8 | BG8 | Deep Ocean | Strong | `src/shaders/vibeMatrix8.ts` |
| 9 | BG9 | Blob Metaballs | Very intense | `src/shaders/vibeMatrix9.ts` |
| 10 | BG10 | Chromatic Bloom | Peak intensity | `src/shaders/vibeMatrix10.ts` |

**Code**: `src/components/screens/InterviewScreen.tsx`
```typescript
const getBackgroundIndexForQuestion = (questionIndex: number): number => {
  return questionIndex + 1; // Question 0 → BG1, Question 9 → BG10
};
```

---

## Performance Specifications

### Quality Tiers

| Tier | fBM Octaves | Frame Rate Target | Battery Impact | When Used |
|------|-------------|-------------------|----------------|-----------|
| Full | 6 octaves | 60fps | 5-10%/hr | Normal operation |
| Medium | 3 octaves | 55fps | 3-7%/hr | Thermal throttling |
| Low | Static gradient | 60fps | 1-2%/hr | Battery < 20% |

### Performance Budget

| Metric | Target | Fallback Behavior |
|--------|--------|-------------------|
| Frame Rate | 60fps | Auto-reduce quality tier |
| Memory | <200MB | Dispose shader resources |
| Battery | <10%/10min | Switch to static mode |
| GPU Thermal | <45°C | Reduce complexity |

### Key Findings from Testing

**Skia on iOS Metal Backend**:
- 60fps achievable with Reanimated shared values (not React state)
- Multiple Canvas layers acceptable performance-wise
- GPU handles complex fBM math efficiently
- Battery impact manageable with quality tiers

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Device overheating | Auto-switch to Low quality tier, cooldown period |
| Memory pressure | Dispose unused shader resources, simplify active shader |
| App backgrounded | Pause all animations, dispose GPU resources |
| Battery < 20% | Force static gradient mode regardless of user preference |
| Shader compilation failure | Fall back to previous working shader or default gradient |
| Frame rate < 45fps sustained | Auto-reduce quality tier, warn in dev mode |

---

## Testing Checklist

- [x] Happy path works - all 18 shaders render correctly
- [x] Error states handled - fallbacks work for compilation failures
- [x] Loading states shown - smooth initialization, no white flash
- [x] Performance optimized - 60fps maintained on iPhone 12+
- [x] Battery tested - low power mode triggers correctly
- [x] Thermal tested - quality reduction prevents overheating
- [x] Accessibility checked - performance doesn't block VoiceOver

---

## Technical Implementation

### File Structure
```
src/
├── shaders/
│   ├── vibeMatrix1.ts → vibeMatrix18.ts    # Individual shader implementations
│   └── morphWrapper.ts                      # Noise-based transition system
├── components/
│   ├── layers/
│   │   ├── VibeMatrix.tsx                  # Base shader renderer
│   │   └── VibeMatrixAnimated.tsx          # Morph orchestrator
│   └── dev/
│       └── FPSMonitor.tsx                  # Performance debugging
└── constants/
    └── colors.ts                           # Vibe state color mapping
```

### Morph Transition Technology

**Problem**: Simple crossfade creates artificial, digital-looking transitions
**Solution**: Noise-based per-pixel blending for organic "ink spreading" effect

```glsl
// Each pixel samples noise(uv) → value 0-1
// As progress 0→1, threshold sweeps through noise range
// Pixel shows shaderA where noise < threshold
// Pixel shows shaderB where noise > threshold
// smoothstep creates soft edges at boundary
```

**Result**: Organic blob shapes that shrink/grow naturally during transitions

---

## Integration Points

### State Management (Zustand)
```typescript
interface AppState {
  vibeState: 'TRUST' | 'DEEP' | 'CAUTION' | 'PASSION' | 'GROWTH' | 'ALERT';
  lowPowerMode: boolean;
  shaderQuality: 'full' | 'medium' | 'low';
}
```

### Voice Integration
- Orb breathing syncs with voice activity via alpha-glow blending
- Conversation emotional tone triggers vibe state changes
- ElevenLabs emotion responses map to specific transitions

### Interview Flow
- Question progression automatically cycles through BG1-BG10
- Sensitive topics trigger CAUTION vibe (orange backgrounds)
- Physical preferences trigger PASSION vibe (red backgrounds)

---

## Future Enhancements (V2)

| Enhancement | Description | Effort |
|-------------|-------------|--------|
| Dynamic Procedural Generation | AI-generated shaders based on user responses | 3-4 weeks |
| Music Sync | Background responds to ambient music rhythm | 1-2 weeks |
| Weather Integration | Outdoor conditions affect color palette | 1 week |
| Seasonal Themes | Background styles change with calendar seasons | 2 weeks |
| User Customization | Allow users to pick favorite background styles | 1 week |

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2024-12-20 | Enhanced to SpecKit format with complete API/data integration | Chi |
| 2024-12-10 | MORPH TRANSITIONS: Replaced uniform crossfade with noise-based per-pixel blending | Chi |
| 2024-12-10 | Fixed overexposure in multiple backgrounds, added gamma correction | Chi |
| 2024-12-10 | LOCKED IN: Demo flow uses BG1-10 only, mapped 1:1 to questions | Chi |
| 2024-12-10 | LOCKED IN: Alpha-glow blending architecture for orb+background cohesion | Chi |
| 2024-12-10 | Added GPU performance research, FPS monitor | Chi |
| 2024-12-09 | 18 shader variations complete | Chi |

---

*Document created: December 20, 2024*
*Last updated: December 20, 2024*