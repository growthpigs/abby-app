# ABBY Design System

> **MANDATORY** - All screens MUST follow these specifications exactly.
> Last updated: 2026-01-15

---

## Typography

### Font Families

| Role | Font | Weight | Usage |
|------|------|--------|-------|
| **Section Label** | JetBrains Mono | 400 | "LIFESTYLE", "BASICS", "CERTIFICATION" |
| **Headline** | Merriweather | 700 Bold | Screen titles, questions |
| **Body** | Merriweather | 400 Regular | Descriptions, paragraphs |
| **Answer Button** | Barlow | 500 Medium | "Yes", "No", "Casually" |
| **Button Text** | Barlow | 600 SemiBold | "Continue", "Unlock Now" |
| **Input Text** | System Default | 400 | User input fields |

### Typography Specs

```
SECTION LABEL (JetBrains Mono)
├── Font Size: 12px
├── Letter Spacing: 1px
├── Color: #FFFFFF (white)
├── Transform: UPPERCASE
└── Usage: Category labels at top of screens

HEADLINE (Merriweather Bold)
├── Font Size: 32px
├── Line Height: 40px
├── Letter Spacing: -0.5px
├── Color: rgba(255, 255, 255, 0.95)
└── Usage: Main screen question/title

BODY (Merriweather Regular)
├── Font Size: 15px
├── Line Height: 24px
├── Letter Spacing: 0.2px
├── Color: rgba(255, 255, 255, 0.85)
└── Usage: Descriptions, help text

ANSWER OPTION (Barlow Medium)
├── Font Size: 17px
├── Color: rgba(255, 255, 255, 0.95)
└── Usage: Selection buttons (Yes/No/etc)

BUTTON TEXT (Barlow SemiBold)
├── Font Size: 18px
├── Letter Spacing: 0.5px
├── Color: #FFFFFF
└── Usage: Continue, Submit, Unlock
```

---

## Layout Constants

### Positioning (FIXED - Never Change)

```
BACK ARROW
├── Top: 60px (below Dynamic Island)
├── Left: 24px
├── Size: 28px (icon)
├── Color: rgba(255, 255, 255, 0.95)
└── Touch Target: 44x44px with 20px hitSlop

SECTION LABEL (when present)
├── Top: 110px
├── Left: 24px
├── Margin Bottom: 12px

HEADLINE
├── Top: 140px (or 170px if section label present)
├── Left: 24px
├── Right: 24px
├── Margin Bottom: 24px

CONTENT AREA
├── Padding Top: 140px (or 170px with section)
├── Padding Horizontal: 24px
├── Padding Bottom: 120px (space for footer)

FOOTER (Continue Button)
├── Bottom: 48px
├── Left: 24px
├── Right: 24px
```

### Spacing Scale

```
4px  - Micro (tight element spacing)
8px  - Small (between related elements)
12px - Medium (section label to headline)
16px - Default (form elements)
24px - Large (major sections)
32px - XL (screen sections)
48px - XXL (footer from bottom)
```

---

## Colors

### Primary Palette

```
WHITE (Text on dark backgrounds)
├── Primary: #FFFFFF
├── 95%: rgba(255, 255, 255, 0.95)
├── 85%: rgba(255, 255, 255, 0.85)
├── 70%: rgba(255, 255, 255, 0.70)
├── 50%: rgba(255, 255, 255, 0.50)
└── 30%: rgba(255, 255, 255, 0.30)

CHARCOAL (Text on light/glass backgrounds)
├── Dark: #3A3A3A
├── Medium: #5A5A5A
├── Light: #7A7A7A

ACCENT BLUE
├── Primary: #3B82F6
├── Selected: rgba(59, 130, 246, 0.2)

SUCCESS GREEN
├── Primary: #10B981
├── Background: rgba(16, 185, 129, 0.15)

ERROR RED
├── Primary: #DC2626
├── Background: rgba(220, 38, 38, 0.08)
```

---

## Components

### Back Arrow

```tsx
// ALWAYS use this exact implementation
<Pressable
  onPress={handleBack}
  style={styles.backButton}
  hitSlop={20}
>
  <ArrowLeft size={28} stroke="rgba(255, 255, 255, 0.95)" />
</Pressable>

// Style - NEVER CHANGE THESE VALUES
backButton: {
  position: 'absolute',
  top: 60,
  left: 24,
  width: 44,
  height: 44,
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10,
}
```

### Section Label

```tsx
// JetBrains Mono, WHITE, UPPERCASE
<Caption style={styles.sectionLabel}>LIFESTYLE</Caption>

sectionLabel: {
  fontFamily: 'JetBrainsMono_400Regular',
  fontSize: 12,
  letterSpacing: 1,
  color: '#FFFFFF',
  textTransform: 'uppercase',
  marginBottom: 12,
}
```

### Headline

```tsx
<Headline style={styles.headline}>
  Smoking Preferences
</Headline>

headline: {
  fontFamily: 'Merriweather_700Bold',
  fontSize: 32,
  lineHeight: 40,
  letterSpacing: -0.5,
  color: 'rgba(255, 255, 255, 0.95)',
  marginBottom: 24,
}
```

### Answer Option Buttons

```tsx
// Use Barlow font for answer options
<Pressable style={[styles.option, isSelected && styles.optionSelected]}>
  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
    Yes
  </Text>
</Pressable>

option: {
  paddingVertical: 16,
  paddingHorizontal: 20,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: 12,
  marginBottom: 12,
}
optionSelected: {
  backgroundColor: 'rgba(59, 130, 246, 0.2)',
  borderWidth: 2,
  borderColor: '#3B82F6',
}
optionText: {
  fontFamily: 'Barlow_500Medium',
  fontSize: 17,
  color: 'rgba(255, 255, 255, 0.95)',
}
optionTextSelected: {
  fontFamily: 'Barlow_600SemiBold',
  color: '#FFFFFF',
}
```

### Continue Button (GlassButton)

```tsx
<GlassButton onPress={handleNext} disabled={!isValid}>
  Continue
</GlassButton>

// GlassButton specs:
├── Border Radius: 9999px (pill)
├── Padding: 16px vertical, 32px horizontal
├── Background: rgba(255, 255, 255, 0.15)
├── Border: 1px rgba(255, 255, 255, 0.3)
├── Blur Intensity: 40
├── Text: Barlow SemiBold, 18px, #FFFFFF
```

### Text Input

```tsx
<TextInput style={styles.textInput} />

textInput: {
  width: '100%',
  paddingVertical: 12,
  paddingHorizontal: 8,
  borderBottomWidth: 2,
  borderBottomColor: 'rgba(255, 255, 255, 0.3)',
  fontSize: 20,
  color: 'rgba(255, 255, 255, 0.95)',
}
```

### Close Button (Modal overlays)

```tsx
// White X, no background, top-right corner
<Pressable style={styles.closeButton} hitSlop={10}>
  <X size={24} stroke="rgba(255, 255, 255, 0.9)" />
</Pressable>

closeButton: {
  position: 'absolute',
  top: 60,
  right: 20,
  width: 44,
  height: 44,
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
}
```

---

## Screen Template

Every onboarding screen should follow this structure:

```tsx
<View style={styles.container}>
  {/* Back Arrow - FIXED POSITION */}
  <Pressable style={styles.backButton} onPress={handleBack} hitSlop={20}>
    <ArrowLeft size={28} stroke="rgba(255, 255, 255, 0.95)" />
  </Pressable>

  {/* Content */}
  <View style={styles.content}>
    {/* Section Label (optional) */}
    <Caption style={styles.sectionLabel}>LIFESTYLE</Caption>

    {/* Headline */}
    <Headline style={styles.headline}>
      Smoking Preferences
    </Headline>

    {/* Question/Content */}
    <Body style={styles.question}>
      Do you smoke?
    </Body>

    {/* Answer Options */}
    <View style={styles.options}>
      {options.map(opt => (
        <AnswerOption key={opt.value} {...opt} />
      ))}
    </View>
  </View>

  {/* Footer - FIXED POSITION */}
  <View style={styles.footer}>
    <GlassButton onPress={handleNext} disabled={!isValid}>
      Continue
    </GlassButton>
  </View>
</View>
```

---

## Rules

1. **NEVER** change back arrow position (top: 60, left: 24)
2. **NEVER** change headline position (top: 140 or 170 with section)
3. **ALWAYS** use JetBrains Mono for section labels (WHITE, UPPERCASE)
4. **ALWAYS** use Merriweather for headlines and body text
5. **ALWAYS** use Barlow for answer options and button text
6. **ALWAYS** use the exact spacing values defined above
7. **NEVER** add drop shadows to any element
8. **ALWAYS** test on both iPhone SE (small) and iPhone Pro Max (large)

---

## Match Flow Screens (Non-Onboarding)

> **Added: 2026-01-15** - UI Polish patterns for PhotosScreen, MatchesScreen, MatchScreen, RevealScreen, PaymentScreen

### PASSION Palette (Match Flow Primary)

```
PASSION PINK
├── Primary: #E11D48
├── Tint: rgba(225, 29, 72, 0.15)  // For badges, backgrounds
├── Light: rgba(225, 29, 72, 0.1)  // For photo placeholders

CHARCOAL (Text on Glass)
├── Headlines: #3A3A3A
├── Body: #5A5A5A
├── Subtle: #7A7A7A
```

### Glass Card Pattern (CertificationScreen Reference)

```tsx
// STANDARD GLASS CARD - use for all list items on glass backgrounds
matchCard: {
  backgroundColor: 'rgba(255, 255, 255, 0.15)',  // NOT 0.5!
  borderRadius: 12,
  // NO border - clean glass design
}

// PRESSED STATE
matchCardPressed: {
  backgroundColor: 'rgba(255, 255, 255, 0.25)',  // Subtle highlight
}
```

### Pass/Like Button Pattern (MatchesScreen)

```tsx
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
  backgroundColor: '#E11D48',  // PASSION pink
  borderWidth: 0,
}
// Icon: <Heart size={32} stroke="#fff" fill="#fff" />
```

### Compatibility Badge Pattern

```tsx
// ALWAYS use PASSION pink, NOT green
compatibilityBadge: {
  backgroundColor: 'rgba(225, 29, 72, 0.15)',  // PASSION tint
  paddingVertical: 6,
  paddingHorizontal: 16,
  borderRadius: 20,
}
compatibilityLabel: {
  color: '#E11D48',  // PASSION pink
  fontSize: 13,
  fontWeight: '600',
}
```

### Photo Placeholder Pattern

```tsx
// Blurred/hidden photo state
photoPlaceholder: {
  backgroundColor: 'rgba(225, 29, 72, 0.1)',  // PASSION light tint
  // NO border - clean design
}
photoHint: {
  color: 'rgba(255, 255, 255, 0.6)',  // Subtle white
  fontSize: 11,
}
```

### Caption/Label Colors (Match Flow)

```
Section Labels (CERTIFICATION, MATCH FOUND, YOUR MATCH, etc):
├── Font: JetBrains Mono
├── Color: #5A5A5A  // Medium GRAY for readability on pale blur
├── Size: 11px
├── Letter Spacing: 1px
├── Transform: UPPERCASE

⚠️ NOTE: Do NOT use #FFFFFF (white) - it's unreadable on pale blur backgrounds
```

### Loading Indicators

```tsx
// ALWAYS use PASSION pink for loading spinners in match flow
<ActivityIndicator size="large" color="#E11D48" />
```

### Secret Navigation Triggers

```tsx
// ALWAYS invisible (for demo navigation only)
secretTrigger: {
  position: 'absolute',
  width: 70,
  height: 70,
  zIndex: 9999,
  // NO borderWidth, NO borderColor - truly invisible
}
```

---

## File References

| Component | File |
|-----------|------|
| Typography | `src/components/ui/Typography.tsx` |
| GlassButton | `src/components/ui/GlassButton.tsx` |
| Layout Constants | `src/constants/onboardingLayout.ts` |
| Design System Doc | `docs/DESIGN-SYSTEM.md` (this file) |
| **PhotosScreen** | `src/components/screens/PhotosScreen.tsx` |
| **MatchesScreen** | `src/components/screens/MatchesScreen.tsx` |
| **MatchScreen** | `src/components/screens/MatchScreen.tsx` |
| **RevealScreen** | `src/components/screens/RevealScreen.tsx` |
| **PaymentScreen** | `src/components/screens/PaymentScreen.tsx` |
| **CertificationScreen** | `src/components/screens/CertificationScreen.tsx` (reference) |
