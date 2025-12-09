# ABBY - Functional Specification Document (FSD)

> **Living Document** | Version: 1.0 | Last Updated: 2025-12-09
>
> Technical specification for the "Living UI" build. Handoff document for engineering.

---

## 1. System Architecture

The application uses a **Layered Rendering Architecture** ("Glass Sandwich") to separate the living environment from user interaction.

### 1.1 The Rendering Stack

| Layer | Component | Tech Stack | Z-Index | Role |
|-------|-----------|------------|---------|------|
| L0 | `VibeMatrix` | Skia `<Canvas>` + GLSL | 0 | The Environment. Fluid simulation. Full screen. |
| L1 | `AbbyOrb` | Skia `<Mesh>` / `<Circle>` | 10 | The Agent. Reactive 3D object. |
| L2 | `GlassInterface` | `expo-blur` (BlurView) | 20 | The HUD. All text, buttons, inputs. |
| L3 | `SemanticOverlay` | React Native `<View>` | 30 | Accessibility (VoiceOver targets). |

### 1.2 Technology Stack

| Category | Technology |
|----------|------------|
| **Runtime** | React Native (Expo SDK 50+) |
| **Language** | TypeScript 5.0+ |
| **Graphics** | `@shopify/react-native-skia` |
| **Animation** | `react-native-reanimated` v3 |
| **Blur** | `expo-blur` |
| **State** | `zustand` |

---

## 2. The Visual Engine ("Vibe Matrix")

The background is **procedural**, not static. Driven by a GLSL Fragment Shader.

### 2.1 Shader Logic

**Core Function**: Domain Warping (fBM)
```glsl
f(p) = fbm( p + fbm( p + fbm(p) ) )
```

**Noise Algorithm**: 3D Simplex Noise (injected into Skia runtime)

### 2.2 Uniform Variables

| Uniform | Type | Description | Animation |
|---------|------|-------------|-----------|
| `u_time` | float | Clock-driven | Speed increases with complexity |
| `u_complexity` | float | 0.0 - 1.0. Turbulence/sharpness | `withTiming(target, { duration: 1500 })` |
| `u_colorA` | vec3 | Primary RGB | Interpolated via `mix()` in shader |
| `u_colorB` | vec3 | Secondary RGB | Interpolated via `mix()` in shader |

### 2.3 The 5x5 Vibe Grid (State Mapping)

| State | Complexity | Color Theme | Visual Output |
|-------|------------|-------------|---------------|
| Onboarding | 0.1 (Smooth) | Trust Blue | Slow, liquid, safe |
| Deep Questions | 0.4 (Ridges) | Deep Violet | Swirling currents |
| Searching | 0.3 (Turbulent) | Caution Orange | "Processing" motion |
| Match Reveal | 1.0 (Paisley) | Passion Red | Fractal, sharp, high speed |
| Coach Mode | 0.0 (Static) | Growth Green | Calm, barely moving |
| Intervention | 1.0 (Spiky) | Alert Grey | Frozen, jagged edges |

---

## 3. The Agent Component ("Abby")

Abby is a **polymorphic UI element**. She is never hidden; she only transforms.

### 3.1 States & Geometry

#### State A: Center Stage (The Guide)
- **Position**: `top: 15%`, `alignSelf: 'center'`
- **Size**: `width: 250px`
- **Mesh**: Spherical with liquid edge distortion (`sin(angle * frequency + time)`)
- **Interaction**: Pulses (scale: 1.05) on tap. Parallax on device tilt.

#### State B: Docked (The Companion)
- **Position**: `bottom: 40px`, `alignSelf: 'center'`
- **Size**: `width: 80px`
- **Mesh**: Simplified Sphere (low poly for performance)
- **Transition**: `LayoutAnimation` (Reanimated). NO FADING.

### 3.2 The "Red Flag" Mutation

When `intervention_active === true`:
- **Shape**: Apply "Jagged" modifier to vertex shader
- **Motion**: Stuttering/Glitch effect (random `u_time` jumps)
- **Color**: Flash between Red and Grey

---

## 4. Functional Logic (The Hub)

The main screen is a **Finite State Machine (FSM)**.

### 4.1 State Definitions

| State | Renders |
|-------|---------|
| `INTERVIEW` | `QuestionCard` component on Glass Layer |
| `SEARCH` | `LoaderText` + `StatusLog` |
| `MATCH` | `MatchCard` (Bio Only) |
| `PAYMENT` | `PayGateModal` (Overlay) |
| `REVEAL` | `PhotoCard` + `ActionButtons` |
| `COACH` | `ChatInterface` |

### 4.2 The "Engine" Logic (Mocked Backend)

Question Graph JSON Structure:
```typescript
{
  "q_12": {
    "text": "How do you handle conflict?",
    "type": "scale_1_10",
    "vibe_shift": "DEEP",
    "next": "q_13"
  },
  "q_13": {
    "text": "Do you want children?",
    "type": "binary",
    "logic": {
      "yes": "q_14a",
      "no": "q_15"
    }
  }
}
```

### 4.3 The "Breadcrumb" Reveal Logic

| Stage | Action | Visual |
|-------|--------|--------|
| 1. Match Found | Show `MatchCard`, Image = null | Vibe = Paisley/Red |
| 2. Interest | User taps "Interested", wait for partner | State remains MATCH |
| 3. Mutual | Trigger `PayGateModal` | Overlay slides up |
| 4. Success | Update `showPhoto={true}` | Photo reveals |

---

## 5. Data Mocking (Prototype)

Mock these endpoints locally:

| Endpoint | Returns |
|----------|---------|
| `GET /user-status` | `'NEW'`, `'ACTIVE'`, or `'PAUSED'` |
| `GET /questions/next` | Next question object |
| `GET /match-queue` | `null` (Searching) or `MatchObject` |

---

## 6. Edge Cases & Error Handling

### 6.1 "Red Flag" Intervention (Gottman Protocol)

- **Trigger**: User answers 3+ questions with "Contempt" or "Stonewalling" flags
- **Action**:
  1. Lock State to `INTERVENTION`
  2. Set Vibe to Level 5 (Grey)
  3. Show Modal: "Let's Pause. We noticed a pattern..."
  4. Disable all navigation

### 6.2 Low Power Mode

- **Detection**: Use `expo-battery`
- **Action** (if `lowPowerMode === true`):
  1. Unmount `VibeMatrix` (Shader)
  2. Mount `StaticBackground` (Image)
  3. Stop Abby animations

### 6.3 Network Latency ("Search" State)

- **Logic**: If "Deliberate Delay" (1hr) is active, persist state on app close/reopen
- **Storage**: `AsyncStorage` saves `search_start_timestamp`
- **Resume**: If `now - timestamp < 1hr`, force State `SEARCH`

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2025-12-09 | 1.0 | Initial document creation |
