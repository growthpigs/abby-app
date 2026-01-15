# FEATURE SPEC: Glass Interface System

**What:** Consistent glassmorphic UI component library maintaining the "glass over bioluminescent ocean" metaphor
**Who:** All app users interacting with any UI elements throughout the app
**Why:** Creates cohesive, premium feel while ensuring readability over animated backgrounds
**Status:** 📝 Needs Implementation

---

## User Stories

**US-008: Consistent Glass UI**
As a user, I want all interface elements to feel cohesive with the glass metaphor so that the experience feels premium and unified.

Acceptance Criteria:
- [ ] All UI components use BlurView consistently with proper intensity settings
- [ ] Text is always readable over the moving background with proper contrast
- [ ] Buttons and cards feel like they're floating on glass with subtle shadows
- [ ] Touch feedback works properly through blur effects with haptic response
- [ ] Interface never breaks the glass/ocean metaphor with harsh edges or flat colors
- [ ] Components are accessible with minimum 44x44px touch targets
- [ ] High contrast mode increases border opacity for visibility

**US-010: Responsive Glass Components**
As a user, I want interface elements to respond appropriately to my touch so that the glass metaphor feels realistic and satisfying.

Acceptance Criteria:
- [ ] Buttons scale down 2% when pressed with 150ms ease-out transition
- [ ] Cards lift with subtle shadow increase on press
- [ ] All interactive elements provide light haptic feedback
- [ ] Focus states show subtle glow for text inputs
- [ ] Disabled states are visually distinct but maintain glass aesthetic
- [ ] Voice-first design accommodates users with different interaction preferences

---

## Functional Requirements

What this feature DOES:
- [ ] Provides consistent BlurView-based components (GlassCard, GlassButton, GlassInput)
- [ ] Maintains glassmorphic aesthetic with proper transparency and blur effects
- [ ] Ensures text readability over animated VibeMatrix backgrounds
- [ ] Implements proper touch feedback and haptic responses
- [ ] Supports accessibility requirements (VoiceOver, high contrast, touch targets)
- [ ] Adapts to different vibe states while maintaining glass metaphor
- [ ] Provides proper layering in the Glass Sandwich architecture (Layer 2)

What this feature does NOT do:
- ❌ Replace the VibeMatrix background system (that's Layer 0)
- ❌ Render the AbbyOrb (that's Layer 1)
- ❌ Handle voice input/output (that's the voice-integration feature)
- ❌ Manage application state (that's the Zustand store)
- ❌ Implement question logic (that's the question-flow feature)

---

## Data Model

Entities involved:
- **AppState** - Current vibe state for adaptive glass styling
- **AppState** - High contrast mode for accessibility

New fields needed:
| Entity | Field | Type | Description |
|--------|-------|------|-------------|
| AppState | highContrastMode | boolean | Accessibility mode for increased contrast |
| AppState | reduceMotion | boolean | Accessibility preference for reduced animations |

---

## API Endpoints

*Note: Glass Interface is frontend-only. No API endpoints required.*

---

## UI Components

| Component | Purpose | Location |
|-----------|---------|----------|
| GlassCard | Base container component with blur background | `src/components/ui/GlassCard.tsx` ✅ |
| GlassButton | Interactive button with variants and haptics | `src/components/ui/GlassButton.tsx` ✅ |
| **ConversationOverlay** | **Blur sheet for transcript display with drag handle** | `src/components/ui/ConversationOverlay.tsx` ❌ **NEW** |
| GlassInput | Text input with glass styling and focus states | `src/components/ui/GlassInput.tsx` ❌ |
| GlassPicker | Selection component for choice questions | `src/components/ui/GlassPicker.tsx` ❌ |
| GlassSlider | Range input for scale questions | `src/components/ui/GlassSlider.tsx` ❌ |
| GlassModal | Full-screen overlay for modals | `src/components/ui/GlassModal.tsx` ❌ |
| GlassInterface | Layer 2 container managing all glass components | `src/components/layers/GlassInterface.tsx` ❌ |

### Existing Component Analysis

**GlassCard.tsx** ✅ (Implemented)
- Uses BlurView with configurable intensity, padding, borderRadius
- Good foundation but needs enhancement for vibe state adaptation

**GlassButton.tsx** ✅ (Implemented)
- Three variants: primary, secondary, ghost
- Includes haptic feedback and press animations
- Needs integration with high contrast mode

---

## ConversationOverlay Component Specification (NEW - 2024-12-22)

### Overview
Blur sheet overlay that displays conversation transcript during the interview flow. Adapts height based on input mode setting.

### Visual Spec
```
┌─────────────────────────────────────┐
│         [Shader Background]         │
│                                     │
│            [Abby Orb]               │
│                                     │
├─────────────────────────────────────┤ ← BlurView starts
│5px│                                 │
│   │ "What draws                     │   Merriweather 400
│   │ you to                          │   13px font
│   │ someone                         │   16.25px line height (125%)
│   │ initially?"                     │   White + textShadow
│   │                                 │
│   │ [User response...]              │
│   │                                 │
│   │ "That's beautiful..."           │
│   └─────────────────────────────────│
│    ──────── (drag handle)           │
└─────────────────────────────────────┘
```

### Props
```typescript
interface ConversationOverlayProps {
  messages: ConversationMessage[];
  inputMode: 'voice_only' | 'text_only' | 'voice_and_text';
  onDragEnd?: (collapsed: boolean) => void;
}

interface ConversationMessage {
  id: string;
  speaker: 'abby' | 'user';
  text: string;
  timestamp: number;
}
```

### Height Behavior by Input Mode
| Mode | Height | Drag Handle | Notes |
|------|--------|-------------|-------|
| `voice_only` | 0% (hidden) | N/A | No overlay, just orb |
| `voice_and_text` | 50% | Yes | Can drag down to hide |
| `text_only` | 100% | No | Full screen frost |

### Typography
```typescript
const overlayTextStyle = {
  fontFamily: 'Merriweather_400Regular',
  fontSize: 13,
  lineHeight: 16.25, // 13 * 1.25
  color: '#FFFFFF',
  paddingLeft: 5,
  textShadowColor: 'rgba(0,0,0,0.5)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 2,
};
```

### Animation
- Uses react-native-reanimated for height animation
- Drag gesture via react-native-gesture-handler PanGestureHandler
- BlurView intensity: 60 (dark tint)
- Transition duration: 300ms with easeInOut

### Implementation Notes
1. Sits in Layer 2 (Z:20) with other glass components
2. Uses ScrollView with auto-scroll to latest message
3. Abby messages align left, user messages could have different style
4. Drag handle only visible in `voice_and_text` mode

---

## Implementation Tasks

### Setup
- [x] TASK-001: Analyze existing GlassCard and GlassButton components
- [ ] TASK-002: Create component style system with vibe state adaptation
- [ ] TASK-003: Set up accessibility hooks and providers

### Core Components
- [ ] TASK-004: Enhance GlassCard with vibe state color blending
- [ ] TASK-005: Enhance GlassButton with accessibility improvements
- [ ] TASK-006: Implement GlassInput with focus states and validation
- [ ] TASK-007: Create GlassPicker for multiple choice questions
- [ ] TASK-008: Build GlassSlider for scale-based questions
- [ ] TASK-009: Develop GlassModal for full-screen overlays
- [ ] **TASK-NEW-001: Build ConversationOverlay with 3 height modes** (2024-12-22)
- [ ] **TASK-NEW-002: Implement drag handle gesture for ConversationOverlay** (2024-12-22)

### Layer Architecture
- [ ] TASK-010: Create GlassInterface layer container (Z-index: 20)
- [ ] TASK-011: Implement proper z-index management across all components
- [ ] TASK-012: Ensure components never render below AbbyOrb or above SemanticOverlay

### Integration
- [ ] TASK-013: Integrate with Question Flow component requirements
- [ ] TASK-014: Adapt InterviewScreen to use Glass components instead of raw BlurView
- [ ] TASK-015: Test component performance with VibeMatrix animations
- [ ] TASK-016: Implement high contrast and reduced motion accessibility modes

### Polish
- [ ] TASK-017: Fine-tune blur intensities and transparency values
- [ ] TASK-018: Optimize component rendering performance
- [ ] TASK-019: Create component documentation and usage guidelines
- [ ] TASK-020: Test on various iOS devices for consistency

---

## Architecture: Glass Sandwich Layer 2

```
Layer 3 (Z:30) - SemanticOverlay    │ Accessibility targets
Layer 2 (Z:20) - GlassInterface     │ THIS LAYER - All UI components
Layer 1 (Z:10) - AbbyOrb            │ Reactive 3D orb
Layer 0 (Z:0)  - VibeMatrix         │ GLSL shader background
```

**Critical**: GlassInterface renders over VibeMatrix and AbbyOrb, but under SemanticOverlay. All components must use proper z-index ordering.

---

## Component Specifications

### GlassCard Enhanced
```typescript
interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;        // 40-100, defaults to 80
  padding?: number;         // Defaults to 24
  borderRadius?: number;    // Defaults to 16
  vibeAdaptive?: boolean;   // Adapts border color to vibe state
  elevation?: 'low' | 'medium' | 'high';  // Shadow depth
}
```

### GlassButton Enhanced
```typescript
interface GlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  accessibilityLabel?: string;
  hapticFeedback?: 'light' | 'medium' | 'heavy';
}
```

### GlassInput (New)
```typescript
interface GlassInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  maxLength?: number;
  autoFocus?: boolean;
  keyboardType?: KeyboardType;
  secureTextEntry?: boolean;
  error?: string;
  label?: string;
}
```

### GlassPicker (New)
```typescript
interface GlassPickerProps {
  options: Array<{value: string, label: string}>;
  selectedValue?: string;
  onValueChange: (value: string) => void;
  multiSelect?: boolean;
  orientation?: 'horizontal' | 'vertical';
}
```

### GlassSlider (New)
```typescript
interface GlassSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue: number;
  maximumValue: number;
  step?: number;
  showLabels?: boolean;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
}
```

---

## Design System Integration

### Glass Styling Constants
```typescript
export const GlassStyles = {
  blur: {
    intensity: {
      light: 40,
      medium: 80,
      heavy: 100
    },
    tint: 'systemThinMaterial' as const
  },
  transparency: {
    low: 0.05,
    medium: 0.1,
    high: 0.2
  },
  borders: {
    normal: 'rgba(255,255,255,0.2)',
    highContrast: 'rgba(255,255,255,0.8)',
    vibeAdaptive: (vibeColor: string) => `${vibeColor}40` // 25% opacity
  },
  shadows: {
    low: '0 4px 16px rgba(0,0,0,0.08)',
    medium: '0 8px 32px rgba(0,0,0,0.12)',
    high: '0 16px 48px rgba(0,0,0,0.16)'
  }
};
```

### Vibe State Adaptation
```typescript
const getVibeGlassStyle = (vibeState: VibeState) => ({
  TRUST: { borderColor: '#3B82F620', glowColor: '#3B82F610' },
  DEEP: { borderColor: '#4C1D9520', glowColor: '#4C1D9510' },
  CAUTION: { borderColor: '#F59E0B20', glowColor: '#F59E0B10' },
  PASSION: { borderColor: '#E11D4820', glowColor: '#E11D4810' },
  GROWTH: { borderColor: '#10B98120', glowColor: '#10B98110' },
  ALERT: { borderColor: '#37415120', glowColor: '#37415110' }
});
```

---

## Accessibility Specifications

### Touch Targets
- Minimum size: 44x44px for all interactive elements
- Spacing: Minimum 8px between adjacent touchable areas
- Button padding: Minimum 12px vertical, 16px horizontal

### Visual Accessibility
- High contrast mode: Increase border opacity from 0.2 to 0.8
- Reduced motion: Disable scaling animations, keep opacity changes
- Focus indicators: 2px solid border with vibe-appropriate color

### Screen Reader Support
```typescript
// Example accessibility props for GlassButton
accessibilityRole="button"
accessibilityLabel={accessibilityLabel || title}
accessibilityHint="Double tap to activate"
accessibilityState={{ disabled }}
```

---

## Performance Specifications

### Rendering Performance
- Component render time: <16ms (60fps target)
- BlurView instances: Maximum 10 concurrent on screen
- Memory usage: <50MB additional for all glass components

### Optimization Strategies
- Memoize glass style calculations with React.useMemo
- Use Reanimated worklets for animations to avoid JS bridge
- Implement component virtualization for long lists with glass cards
- Cache blur styles to prevent recalculation

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| High contrast mode enabled | Border opacity increases to 0.8, maintain blur effects |
| Reduce motion enabled | Disable scale animations, keep opacity transitions |
| Multiple modals stacked | Proper z-index layering, blur intensities stack |
| Rapid vibe state changes | Smooth color transitions, avoid visual flickering |
| Memory pressure | Gracefully reduce blur intensity, maintain functionality |
| Touch while animating | Interrupt animation, respond to new touch immediately |

---

## Integration Points

### Question Flow Integration
- GlassPicker for multiple choice questions
- GlassSlider for scale questions
- GlassInput for text input questions
- GlassCard for question containers

### Voice Integration
- Visual feedback for voice recording states
- Accessibility alternatives for voice-only interactions
- Microphone permission states in glass modals

### VibeMatrix Integration
- Components adapt border colors to current vibe state
- Glass transparency allows background to show through
- Performance coordination to maintain 60fps

### AbbyOrb Integration
- Z-index management ensures orb renders above glass components
- Color coordination between orb glow and glass borders
- Touch area management around docked orb positions

---

## Testing Checklist

- [ ] Happy path works - All components render correctly with proper glass styling
- [ ] Error states handled - Invalid input states, network errors show in glass modals
- [ ] Loading states shown - Skeleton screens and loading indicators use glass styling
- [ ] Performance optimized - 60fps maintained with multiple glass components on screen
- [ ] Accessibility tested - VoiceOver navigation, high contrast mode, touch targets
- [ ] Vibe adaptation tested - Components properly adapt colors across all vibe states
- [ ] Touch feedback verified - Haptic feedback works on all interactive elements

---

## Future Enhancements (V2)

| Enhancement | Description | Effort |
|-------------|-------------|--------|
| Dynamic Blur Adaptation | Blur intensity responds to background complexity | 1-2 weeks |
| Gesture Customization | User-configurable haptic feedback levels | 1 week |
| Theme Variants | Light mode glass styling option | 2 weeks |
| Advanced Animations | Particle effects within glass components | 2-3 weeks |
| Custom Shapes | Non-rectangular glass shapes for special components | 1-2 weeks |

---

## Match Flow Screen Patterns (CRITICAL - DO NOT CHANGE)

> **Added:** 2026-01-15 | **Status:** LOCKED IN | **Reference:** `CertificationScreen.tsx`

### PASSION Palette (Match Flow Primary)

```typescript
// DO NOT USE OTHER COLORS FOR MATCH FLOW
const PASSION = {
  primary: '#E11D48',                    // Main accent
  tint: 'rgba(225, 29, 72, 0.15)',       // Badges, backgrounds
  light: 'rgba(225, 29, 72, 0.1)',       // Photo placeholders
};
```

### Glass Card Pattern (List Items on Glass)

```typescript
// CORRECT - Use this pattern
matchCard: {
  backgroundColor: 'rgba(255, 255, 255, 0.15)',  // NOT 0.5!
  borderRadius: 12,
  // NO border - clean glass design
}

// WRONG - DO NOT USE
matchCard: {
  backgroundColor: 'rgba(255, 255, 255, 0.5)',   // TOO BRIGHT
  borderWidth: 1,                                 // AVOID BORDERS
}
```

### Pass/Like Button Pattern (MatchesScreen)

```typescript
// PASS BUTTON - Subtle glass, white X icon
passButton: {
  width: 72,
  height: 72,
  borderRadius: 36,
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.3)',
}
// Icon: <X size={32} stroke="rgba(255, 255, 255, 0.9)" />

// LIKE BUTTON - PASSION pink filled, white heart icon
likeButton: {
  width: 72,
  height: 72,
  borderRadius: 36,
  backgroundColor: '#E11D48',  // PASSION pink solid
  borderWidth: 0,              // NO BORDER
}
// Icon: <Heart size={32} stroke="#fff" fill="#fff" />

// DO NOT USE - Old red/green bordered pattern
// ❌ Red pass button with border
// ❌ Green like button with border
// ❌ Text labels on buttons
```

### Caption/Label Colors

```typescript
// ALWAYS white for section labels in match flow
sectionLabel: {
  fontFamily: 'JetBrainsMono_400Regular',
  fontSize: 11,
  letterSpacing: 1,
  color: '#FFFFFF',        // WHITE - NOT gray!
  textTransform: 'uppercase',
}
```

### Compatibility Badge Pattern

```typescript
// ALWAYS use PASSION pink, NOT green
compatibilityBadge: {
  backgroundColor: 'rgba(225, 29, 72, 0.15)',  // PASSION tint
  paddingVertical: 6,
  paddingHorizontal: 16,
  borderRadius: 20,
}
compatibilityLabel: {
  color: '#E11D48',  // PASSION pink - NOT green!
  fontSize: 13,
  fontWeight: '600',
}
```

### Loading Indicators

```typescript
// ALWAYS PASSION pink for match flow spinners
<ActivityIndicator size="large" color="#E11D48" />
// NOT blue, NOT gray
```

### Files Using These Patterns

| Screen | File | Notes |
|--------|------|-------|
| PhotosScreen | `src/components/screens/PhotosScreen.tsx` | Primary badge, empty slots |
| MatchesScreen | `src/components/screens/MatchesScreen.tsx` | Pass/Like buttons, cards |
| MatchScreen | `src/components/screens/MatchScreen.tsx` | Labels, badges, placeholder |
| RevealScreen | `src/components/screens/RevealScreen.tsx` | Labels, badges |
| PaymentScreen | `src/components/screens/PaymentScreen.tsx` | Secret triggers hidden |
| **CertificationScreen** | `src/components/screens/CertificationScreen.tsx` | **GOLD STANDARD REFERENCE** |

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-01-15 | Added Match Flow Screen Patterns (PASSION palette, glass cards, Pass/Like buttons) - LOCKED | Chi |
| 2024-12-22 | Added ConversationOverlay component specification with 3 height modes | Chi |
| 2024-12-22 | Added 13pt/5px typography spec for conversation transcript | Chi |
| 2024-12-22 | Added drag handle gesture requirements | Chi |
| 2024-12-20 | Initial SpecKit specification created with comprehensive component analysis | Chi |

---

*Document created: December 20, 2024*
*Last updated: December 22, 2024*