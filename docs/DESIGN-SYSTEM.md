# ABBY - Design System Specification (HIFD)

> **Living Document** | Version: 1.0 | Last Updated: 2025-12-09
>
> Creative Direction & Visual Engineering. "The Living Vogue Build."

---

## 1. Core Visual Philosophy

> "The Interface is the Organism."

We reject the flat, static "SaaS" look of Tinder/Hinge.

| Principle | Description |
|-----------|-------------|
| **The Vibe** | High-end editorial (Vogue/Vanity Fair) mixed with psychedelic fluid dynamics (Oil on Water) |
| **The Metaphor** | A glass pane floating over a living, bioluminescent ocean |
| **The Physics** | Heavy, viscous, expensive. Nothing moves fast unless exploding with joy (Match) |

**Aesthetic Goal**: "1990s Rave meets 2025 Luxury"

---

## 2. The "Glass Sandwich" Layout

Strict Z-Index hierarchy. Never deviate.

### Layer 0: The Vibe Matrix (The Rave)
- **Concept**: Procedural, generative fluid background
- **Tech**: GLSL Shader (Domain Warping)
- **Behavior**: Never stops moving. Morphs from "Smoothie" (Calm) to "Paisley" (Rave)

### Layer 1: Abby (The Soul)
- **Concept**: 3D-style polymorphic orb
- **Material**: Glass or liquid mercury. Refracts background colors.
- **States**:
  - **Center**: Large (250px), Breathing (Onboarding/Reveal)
  - **Docked**: Small (80px), Passive (Coach/Chat)

### Layer 2: The Glass UI (The Vogue)
- **Concept**: Frosted glass sheet where information lives
- **Tech**: `BlurView` (Intensity: 80-100, Tint: Dark/Adaptive)
- **Rule**: Text NEVER touches the background directly. Always on Glass.

---

## 3. Color Palette: "The Emotion Axis"

We use **Cosine-Based Palettes** that blend dynamically in the shader.

| Theme | Primary | Secondary | Accent | Context |
|-------|---------|-----------|--------|---------|
| **TRUST** | `#3B82F6` Electric Blue | `#06B6D4` Cyan | `#FFFFFF` | Onboarding, Settings |
| **PASSION** | `#E11D48` Rose Red | `#F472B6` Hot Pink | `#FDE047` Lemon | Match Reveal, Success |
| **CAUTION** | `#F59E0B` Amber | `#D97706` Burnt Orange | `#FEF3C7` | Analyzing, Waiting |
| **GROWTH** | `#10B981` Emerald | `#34D399` Mint | `#ECFDF5` | Chat, Advice |
| **DEEP** | `#4C1D95` Violet | `#8B5CF6` Indigo | `#C4B5FD` | Deep Questions |
| **ALERT** | `#374151` Grey | `#6B7280` Slate | `#F3F4F6` | Intervention |

### Color Constants (TypeScript)

```typescript
export const VIBE_COLORS = {
  TRUST: {
    primary: [0.231, 0.510, 0.965],   // #3B82F6
    secondary: [0.024, 0.714, 0.831], // #06B6D4
  },
  PASSION: {
    primary: [0.882, 0.114, 0.282],   // #E11D48
    secondary: [0.957, 0.447, 0.714], // #F472B6
  },
  CAUTION: {
    primary: [0.961, 0.620, 0.043],   // #F59E0B
    secondary: [0.851, 0.467, 0.024], // #D97706
  },
  GROWTH: {
    primary: [0.063, 0.725, 0.506],   // #10B981
    secondary: [0.204, 0.827, 0.600], // #34D399
  },
  DEEP: {
    primary: [0.298, 0.114, 0.584],   // #4C1D95
    secondary: [0.545, 0.361, 0.965], // #8B5CF6
  },
  ALERT: {
    primary: [0.216, 0.255, 0.318],   // #374151
    secondary: [0.420, 0.447, 0.498], // #6B7280
  },
} as const;
```

---

## 4. Typography System

> "Editorial Luxury."

Mix traditional Serif headers with clean Sans-Serif data.

### Headers (The Voice of Abby)

| Property | Value |
|----------|-------|
| **Font** | Playfair Display, New York, or high-contrast Serif |
| **Usage** | Big questions, Match Names, Value Props |
| **Weight** | 700 |
| **Line Height** | 1.1 |
| **Letter Spacing** | -0.5 |
| **Color** | `#FFFFFF` (High Emphasis) |

### Body Copy (The Data)

| Property | Value |
|----------|-------|
| **Font** | System Sans (SF Pro / Roboto) |
| **Usage** | Chat bubbles, settings text, descriptions |
| **Weight** | 400 |
| **Letter Spacing** | 0.2 |
| **Size** | 16px |
| **Color** | `#E5E5E5` (Medium Emphasis) |

### TypeScript Constants

```typescript
export const TYPOGRAPHY = {
  header: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontWeight: '700' as const,
    lineHeight: 1.1,
    letterSpacing: -0.5,
    color: '#FFFFFF',
  },
  headerLarge: { fontSize: 32 },
  headerMedium: { fontSize: 24 },
  headerSmall: { fontSize: 20 },

  body: {
    fontFamily: 'System',
    fontWeight: '400' as const,
    letterSpacing: 0.2,
    color: '#E5E5E5',
  },
  bodyLarge: { fontSize: 18 },
  bodyMedium: { fontSize: 16 },
  bodySmall: { fontSize: 14 },
} as const;
```

---

## 5. UI Components

### 5.1 Rich Inline Buttons

| Property | Value |
|----------|-------|
| **Background** | Glass (Blur 20) |
| **Border** | `1px solid rgba(255, 255, 255, 0.3)` |
| **Shape** | Pill (full rounded corners) |
| **Pressed State** | Background fills `rgba(255, 255, 255, 0.1)`, scale 98% |
| **Haptic** | Light impact on tap |

```typescript
export const BUTTON_STYLES = {
  container: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 9999, // Pill
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  pressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: [{ scale: 0.98 }],
  },
};
```

### 5.2 The "Match Card" (The Reveal)

| Property | Value |
|----------|-------|
| **Layout** | Vertical card, 80% of screen height |
| **Top** | "Ghost" silhouette (No Photo) |
| **Middle** | Bio in Serif font |
| **Bottom** | "Interested" button |
| **Background Vibe** | Level 5 Paisley (Red) |

### 5.3 The Pay Gate

| Property | Value |
|----------|-------|
| **Appearance** | "Black Card" aesthetic |
| **Motion** | Slides up from bottom over Match Card |
| **Text** | "Unlock Connection. $25." |

### 5.4 Glass Card

```typescript
export const GLASS_CARD = {
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  borderRadius: 24,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.1)',
  overflow: 'hidden' as const,
};
```

---

## 6. Motion & Physics Guidelines

> "Honey, not Water."

| Property | Value |
|----------|-------|
| **Global Speed** | Slow. 800ms to 1200ms for page transitions |
| **Easing** | `Bezier(0.25, 0.1, 0.25, 1.0)` (Smooth, heavy) |
| **Fluidity** | Colors INTERPOLATE (morph), never cross-fade |

### Animation Constants

```typescript
import { Easing } from 'react-native-reanimated';

export const MOTION = {
  duration: {
    fast: 300,
    medium: 600,
    slow: 800,
    glacial: 1200,
  },
  easing: Easing.bezier(0.25, 0.1, 0.25, 1.0),
  spring: {
    damping: 15,
    stiffness: 100,
    mass: 1,
  },
};
```

---

## 7. Abby Orb Specifications

### Center Mode (Guide)

| Property | Value |
|----------|-------|
| **Position** | `top: 15%`, `alignSelf: 'center'` |
| **Size** | 250px diameter |
| **Animation** | Breathing (scale 1.0 ↔ 1.05, 3s loop) |
| **Padding** | 50px from edges |

### Docked Mode (Companion)

| Property | Value |
|----------|-------|
| **Position** | `bottom: 40px`, `alignSelf: 'center'` |
| **Size** | 80px diameter |
| **Transition** | 800ms, Layout Animation |

### Polymorphism

| Uniform | Range | Effect |
|---------|-------|--------|
| `u_complexity` | 0.0 → 1.0 | Sphere → Crystal |
| **Duration** | 800ms | Smooth morph |

---

## 8. Assets Required

| Asset | Specification |
|-------|---------------|
| **Fonts** | `PlayfairDisplay-Bold.ttf`, `PlayfairDisplay-Regular.ttf` |
| **Sound** | `haptic_click.wav` (button presses) |
| **App Icon** | Abby Orb on black background |
| **Icons** | `lucide-react-native` (thin stroke weight) |

---

## 9. Reference Images (Pending)

> **Note**: User will upload "Paisley" and "Orb" reference images.
>
> Upon receipt, analyze and implement:
> 1. `VibeMatrix.tsx` shader replicating "Paisley" texture via Domain Warping
> 2. `AbbyOrb.tsx` matching "Orb" visual style

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2025-12-09 | 1.0 | Initial document creation |
