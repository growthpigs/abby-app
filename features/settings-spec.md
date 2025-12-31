# FEATURE SPEC: Settings & Input Mode

**What:** Simple settings screen allowing users to choose their preferred input mode (voice only, text only, or both)
**Who:** All app users before or during the interview process
**Why:** Different users have different preferences - some prefer speaking, others prefer typing, some want both
**Status:** 📝 Needs Implementation

---

## User Stories

**US-NEW-001: Input Mode Selection**
As a user, I want to choose my preferred input mode (voice only, text only, or both) so that I can interact with Abby in my most comfortable way.

Acceptance Criteria:
- [ ] User can access Settings screen before interview starts
- [ ] 3 input modes available: voice only, text only, voice+text
- [ ] Selection persists across app sessions (AsyncStorage)
- [ ] Can change mode during interview (in voice+text mode via drag)
- [ ] Default mode is voice+text
- [ ] Settings accessible via gear icon on Onboarding screen

---

## Functional Requirements

What this feature DOES:
- [ ] Provides settings screen with 3 input mode options
- [ ] Persists user preference to AsyncStorage
- [ ] Loads saved preference on app launch
- [ ] Integrates with ConversationOverlay to control height behavior
- [ ] Integrates with voice services to enable/disable STT/TTS

What this feature does NOT do:
- ❌ Manage other app settings (V2 feature)
- ❌ Sync settings to cloud/backend
- ❌ Provide per-question mode switching
- ❌ Handle premium settings (V2 feature)

---

## Data Model

### Types
```typescript
type InputMode = 'voice_only' | 'text_only' | 'voice_and_text';

interface SettingsState {
  inputMode: InputMode;

  // Actions
  setInputMode: (mode: InputMode) => void;
  loadSettings: () => Promise<void>;
}
```

### Storage
```typescript
// AsyncStorage key
const SETTINGS_KEY = '@abby/settings';

// Storage format
interface StoredSettings {
  inputMode: InputMode;
  version: number; // For future migrations
}
```

---

## UI Components

| Component | Purpose | Location |
|-----------|---------|----------|
| SettingsScreen | Main settings screen with input mode selection | `src/components/screens/SettingsScreen.tsx` ❌ |
| InputModeSelector | Radio button group for 3 modes | Inline in SettingsScreen |

### Screen Layout
```
┌─────────────────────────────────────┐
│         [Shader Background]         │
│                                     │
│            [Abby Orb]               │
│                                     │
├─────────────────────────────────────┤
│                                     │
│         ┌───────────────┐           │
│         │  How do you   │           │
│         │  want to talk │           │
│         │  with Abby?   │           │
│         └───────────────┘           │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ ○ Voice only               │    │
│  │   Just speak - no text     │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ ● Voice + Text (default)   │    │
│  │   Speak and see transcript │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ ○ Text only                │    │
│  │   Type your responses      │    │
│  └─────────────────────────────┘    │
│                                     │
│        [Continue Button]            │
│                                     │
└─────────────────────────────────────┘
```

### Visual Style
- Uses GlassCard for option containers
- Radio buttons with glass styling
- Selected option has brighter border
- Continue button is GlassButton primary variant

---

## Implementation Tasks

### Setup
- [ ] TASK-001: Install @react-native-async-storage/async-storage
- [ ] TASK-002: Create useSettingsStore Zustand store

### Core
- [ ] TASK-003: Create SettingsScreen component
- [ ] TASK-004: Implement input mode radio buttons
- [ ] TASK-005: Add AsyncStorage persistence
- [ ] TASK-006: Load settings on app launch

### Integration
- [ ] TASK-007: Add settings navigation from Onboarding
- [ ] TASK-008: Connect inputMode to ConversationOverlay
- [ ] TASK-009: Connect inputMode to voice services

---

## Navigation

### Access Points
1. **Onboarding Screen** - Gear icon in top-right corner
2. **Future:** Profile/Settings menu (V2)

### Flow
```
Onboarding → [Gear Icon] → Settings → [Continue] → Back to Onboarding
                                   ↓
                            [Save to AsyncStorage]
```

---

## State Management

### Zustand Store
```typescript
// src/store/useSettingsStore.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

type InputMode = 'voice_only' | 'text_only' | 'voice_and_text';

interface SettingsStore {
  inputMode: InputMode;
  isLoaded: boolean;

  setInputMode: (mode: InputMode) => Promise<void>;
  loadSettings: () => Promise<void>;
}

const SETTINGS_KEY = '@abby/settings';

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  inputMode: 'voice_and_text', // Default
  isLoaded: false,

  setInputMode: async (mode) => {
    set({ inputMode: mode });
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({
      inputMode: mode,
      version: 1
    }));
  },

  loadSettings: async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        set({ inputMode: parsed.inputMode, isLoaded: true });
      } else {
        set({ isLoaded: true });
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
      set({ isLoaded: true });
    }
  },
}));
```

---

## Dependencies

```json
{
  "@react-native-async-storage/async-storage": "^1.x"
}
```

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| First launch (no stored settings) | Default to voice_and_text |
| Corrupted storage | Clear and use default |
| Storage permission denied | Use default, don't persist |
| Mode change during interview | Apply immediately to overlay |
| Voice service unavailable | Gracefully fall back to text_only |

---

## Testing Checklist

- [ ] Default mode is voice_and_text on fresh install
- [ ] Mode persists after app restart
- [ ] All 3 modes display correctly in Settings
- [ ] ConversationOverlay height changes with mode
- [ ] Voice services enable/disable based on mode
- [ ] Navigation to/from Settings works
- [ ] Accessibility: VoiceOver announces options correctly

---

## Future Enhancements (V2)

| Enhancement | Description |
|-------------|-------------|
| Notification preferences | Control push notification settings |
| Voice customization | Choose Abby's voice style |
| Privacy settings | Data retention preferences |
| Accessibility options | High contrast, font size |

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2024-12-22 | Initial SpecKit specification created for Settings feature | Chi |

---

*Document created: December 22, 2024*
*Last updated: December 22, 2024*
