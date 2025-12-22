# FEATURE SPEC: Question Flow System

**What:** Adaptive multi-modal question presentation system with voice and touch input for deep compatibility assessment
**Who:** All app users participating in Abby's interview process
**Why:** Core differentiator from swipe-based dating - thoughtful questions reveal compatibility better than photos
**Status:** 🚧 Partially Implemented

---

## User Stories

**US-002: Basic Profile Setup**
As a new user, I want to provide my basic information so that Abby can begin to understand who I am.

Acceptance Criteria:
- [x] User enters full legal name (private) and display name (public)
- [x] User enters date of birth and preferred age range
- [x] User selects sexual identity from comprehensive list
- [x] User selects who they're looking for from comprehensive list
- [x] User selects ethnicity (theirs and preferences)
- [x] User selects relationship type and smoking preferences

**US-005: Deep Compatibility Questions**
As a user, I want Abby to ask me thoughtful questions about relationships so that she can find someone truly compatible.

Acceptance Criteria:
- [x] Questions appear as appropriate UI (buttons, sliders, text input)
- [ ] User can answer via voice or touch interface
- [x] Progress is saved if user exits mid-interview
- [ ] Abby reacts to answers with appropriate responses
- [ ] Interface adapts to question type (multiple choice, scale, open-ended)

**US-006: Emotional State Visualization**
As a user, I want the background to reflect the mood of our conversation so that the experience feels emotionally connected.

Acceptance Criteria:
- [x] VibeMatrix shifts to TRUST (blue) during onboarding
- [x] VibeMatrix shifts to DEEP (violet) during intimate questions
- [x] VibeMatrix shifts to CAUTION (orange) during deal-breaker topics
- [x] Color transitions are smooth (800-1200ms) not jarring
- [x] Abby orb position and breathing adapt to conversation state

**US-007: Physical Preferences (Picturegram)**
As a user, I want to communicate my physical preferences visually so that I can be honest about attraction.

Acceptance Criteria:
- [ ] User can select multiple physical preference categories
- [ ] Interface feels judgment-free and safe
- [ ] Preferences are captured with appropriate weights
- [ ] User understands their choices affect matching

---

## Functional Requirements

What this feature DOES:
- [x] Renders questions with glassmorphic backing and typography
- [x] Displays progress indicators with dot navigation
- [x] Triggers vibe state changes based on question content
- [x] Coordinates with VibeMatrix for background transitions
- [x] Supports question restart/reset functionality
- [ ] Adapts UI based on question type (choice/scale/text/picturegram)
- [ ] Processes voice input via AbbyOrb integration
- [ ] Handles skip logic and conditional follow-up questions
- [ ] Validates answers and provides error feedback
- [ ] Saves progress automatically for resume capability
- [ ] Implements timeout handling for questions
- [ ] Provides accessibility support (VoiceOver, high contrast)

What this feature does NOT do:
- ❌ Generate questions dynamically (uses predefined question sets)
- ❌ Store answers permanently without explicit save
- ❌ Allow editing previous answers once submitted
- ❌ Support branching conversation trees (linear flow only)
- ❌ Provide real-time matching during interview

---

## Data Model

Entities involved:
- **Question** - Static question definitions from questions.json
- **InterviewSession** - Tracks progress through question flow
- **InterviewResponse** - Individual answer storage
- **User** - Basic profile information
- **AppState** - Current question and UI state

New fields needed:
| Entity | Field | Type | Description |
|--------|-------|------|-------------|
| AppState | currentQuestionId | string | Active question being shown |
| AppState | interviewMode | enum | demo / full / paused |
| InterviewSession | questionFlow | string[] | Ordered list of question IDs |
| InterviewSession | currentIndex | number | Position in flow |
| Question | uiType | enum | Standard UI layout to use |
| Question | validation | object | Answer validation rules |

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /interview/start | POST | Initialize new interview session |
| /interview/resume | GET | Resume existing session |
| /interview/answer | POST | Submit question answer |
| /interview/skip | POST | Skip optional question |
| /interview/progress | GET | Get current progress and next question |
| /voice/transcribe | POST | Convert voice to structured answer |

### Question Metadata API
```typescript
GET /questions/metadata
Response: {
  totalQuestions: number;
  categories: string[];
  estimatedDuration: number; // minutes
  questionTypes: string[];
}
```

---

## UI Components

| Component | Purpose | Location | Status |
|-----------|---------|----------|--------|
| InterviewScreen | Main question flow container | `src/components/screens/InterviewScreen.tsx` | ✅ Demo Version |
| QuestionCard | Renders individual question | `src/components/ui/QuestionCard.tsx` | 📝 Needs Creation |
| ChoiceQuestion | Multiple choice UI | `src/components/questions/ChoiceQuestion.tsx` | 📝 Needs Creation |
| ScaleQuestion | Slider/rating UI | `src/components/questions/ScaleQuestion.tsx` | 📝 Needs Creation |
| TextQuestion | Text input UI | `src/components/questions/TextQuestion.tsx` | 📝 Needs Creation |
| PicturegramQuestion | Visual preference selector | `src/components/questions/PicturegramQuestion.tsx` | 📝 Needs Creation |
| ProgressIndicator | Question progress dots | Embedded in InterviewScreen | ✅ Basic Version |
| VoiceInput | Voice answer capture | `src/components/ui/VoiceInput.tsx` | 📝 Needs Creation |

---

## Question Types & UI Layouts

### 1. Choice Questions (Single/Multiple)
```typescript
interface ChoiceQuestion {
  type: 'single_choice' | 'multi_choice';
  options: Array<{
    id: string;
    text: string;
    voiceText?: string;
  }>;
}
```

**UI Layout:**
- Vertical stack of GlassButtons
- Max 4 options visible, scroll if more
- Selection: Radio (single) or Checkbox (multi)
- Voice: "I choose option 1" or "Option A"

### 2. Scale Questions
```typescript
interface ScaleQuestion {
  type: 'scale_1_5' | 'scale_1_10';
  scaleMin: number;
  scaleMax: number;
  scaleLabels?: string[]; // ["Not important", "Very important"]
}
```

**UI Layout:**
- Horizontal slider with haptic feedback
- Current value floating label
- Endpoint labels if provided
- Voice: "Set it to 7" or "About halfway"

### 3. Text Questions
```typescript
interface TextQuestion {
  type: 'free_text';
  maxLength?: number;
  placeholder?: string;
  validation?: string; // regex pattern
}
```

**UI Layout:**
- GlassCard with text area
- Real-time character count
- Validation feedback
- Voice: Direct transcription with confidence check

### 4. Picturegram Questions
```typescript
interface PicturegramQuestion {
  type: 'picturegram';
  categories: string[];
  allowMultiple: boolean;
  weightSelection: boolean;
}
```

**UI Layout:**
- Grid of visual options
- Weight sliders if enabled
- "I'm not sure" skip option
- Voice: "I prefer athletic and curvy types"

---

## Implementation Tasks

### Setup ✅
- [x] TASK-001: Create basic InterviewScreen with glassmorphic design
- [x] TASK-002: Implement progress indicators and navigation
- [x] TASK-003: Set up vibe state coordination with VibeMatrix
- [x] TASK-004: Create demo question flow

### Core - In Progress 🚧
- [ ] TASK-005: Build QuestionCard component with type detection
- [ ] TASK-006: Implement ChoiceQuestion component (single/multi)
- [ ] TASK-007: Create ScaleQuestion with slider interaction
- [ ] TASK-008: Build TextQuestion with validation
- [ ] TASK-009: Implement PicturegramQuestion visual selector
- [ ] TASK-010: Integrate voice input via AbbyOrb
- [ ] TASK-011: Add question skip/back navigation logic
- [ ] TASK-012: Implement auto-save and resume functionality

### Polish - Pending 📝
- [ ] TASK-013: Add answer validation and error states
- [ ] TASK-014: Implement conditional follow-up questions
- [ ] TASK-015: Create loading states and smooth transitions
- [ ] TASK-016: Add accessibility support (VoiceOver, high contrast)
- [ ] TASK-017: Optimize performance for long question flows
- [ ] TASK-018: Add analytics tracking for question completion

---

## Question Flow Logic

### Flow Types

| Flow Type | Questions | Duration | Purpose |
|-----------|-----------|----------|---------|
| Demo | 10 questions | 3-5 minutes | Client demonstration (tap-through) |
| **MVP** | **150 questions** | **30-45 minutes** | **Full compatibility assessment (approved 2024-12-22)** |

> **Decision (2024-12-22):** MVP uses all 150 questions from `docs/data/questions-schema.ts`. This is the approved client question set.

### Question Prioritization

| Priority | Count | Purpose | Examples |
|----------|-------|---------|---------|
| P0 - Dealbreakers | 20 | Must align or no match | Children, monogamy, religion |
| P1 - Core Values | 30 | Primary compatibility | Politics, lifestyle, family |
| P2 - Preferences | 50 | Nice-to-have alignment | Hobbies, communication style |
| P3 - Deep Dive | 50+ | Personality insights | Conflict resolution, intimacy |

### Adaptive Flow Algorithm
```typescript
function determineNextQuestion(
  currentAnswers: InterviewResponse[],
  userProfile: User
): string | null {
  // 1. Check for required follow-ups based on answers
  const followUps = getTriggeredFollowUps(currentAnswers);
  if (followUps.length > 0) return followUps[0];

  // 2. Get next priority question that hasn't been answered
  const unanswered = getUnansweredQuestionsByPriority();
  return unanswered[0] || null; // null = interview complete
}
```

---

## Voice Integration Specifications

### Voice Answer Processing
```typescript
interface VoiceAnswerFlow {
  1: 'User speaks answer';
  2: 'STT transcription via /voice/transcribe';
  3: 'Intent extraction and answer parsing';
  4: 'Confidence check (>70% required)';
  5: 'Show parsed answer for confirmation';
  6: 'Submit via /interview/answer on confirmation';
}
```

### Voice Commands
| Command | Action | Context |
|---------|--------|---------|
| "Go back" | Previous question | If navigation allowed |
| "Skip this" | Skip to next | If question optional |
| "Repeat question" | Abby re-reads | Always available |
| "I'm not sure" | Mark uncertain | Store confidence flag |
| "Switch to text" | Disable voice | Fallback mode |

### Voice Confidence Handling
- **>90%**: Auto-submit answer
- **70-90%**: Show confirmation dialog
- **50-70%**: Show "Did you mean X?" with options
- **<50%**: Request repeat with alternative phrasing

---

## Architecture: Glass Sandwich Layer 2

```
Layer 3 (Z:30) - SemanticOverlay    │ Accessibility targets
Layer 2 (Z:20) - GlassInterface     │ BlurView + all UI ← THIS LAYER
Layer 1 (Z:10) - AbbyOrb            │ Reactive 3D orb
Layer 0 (Z:0)  - VibeMatrix         │ GLSL shader background
```

**Critical Integration**: Question Flow sits on Layer 2, coordinating with:
- **AbbyOrb** (Layer 1) for voice input and emotional reactions
- **VibeMatrix** (Layer 0) for background state changes
- **SemanticOverlay** (Layer 3) for accessibility

---

## State Management & Data Flow

### Zustand Store Structure
```typescript
interface InterviewState {
  // Session Management
  currentSessionId: string | null;
  currentQuestionId: string | null;
  currentQuestionIndex: number;

  // Flow Control
  questionFlow: string[]; // Ordered question IDs
  completedQuestions: Set<string>;
  answers: Map<string, InterviewResponse>;

  // UI State
  isLoading: boolean;
  showVoiceInput: boolean;
  error: string | null;

  // Actions
  startInterview: (userId: string) => Promise<void>;
  answerQuestion: (response: InterviewResponse) => Promise<void>;
  skipQuestion: (reason?: string) => Promise<void>;
  resumeInterview: () => Promise<void>;
}
```

### Local Storage Strategy
```typescript
// Auto-save after each answer
AsyncStorage.setItem('interview_progress', JSON.stringify({
  sessionId,
  currentQuestionIndex,
  answers: Array.from(answersMap),
  timestamp: Date.now(),
}));

// Resume on app restart
const savedProgress = await AsyncStorage.getItem('interview_progress');
if (savedProgress && !isExpired(savedProgress)) {
  resumeFromProgress(JSON.parse(savedProgress));
}
```

---

## Performance Specifications

### Question Loading Budget
| Metric | Target | Fallback |
|--------|--------|----------|
| Question Render | <100ms | Show loading skeleton |
| Voice Processing | <500ms | "Processing..." indicator |
| Answer Submission | <200ms | Optimistic UI update |
| Background Transition | 800-1200ms | Sync with VibeMatrix timing |

### Memory Management
- **Question Cache**: Load questions in batches of 10
- **Answer Storage**: Compress old answers after 100 responses
- **Voice Data**: Stream-only, no local audio storage
- **Images**: Lazy load picturegram options

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| User exits mid-question | Auto-save current progress, 7-day expiry |
| Network failure during answer | Queue answer locally, retry on reconnect |
| Voice service unavailable | Graceful fallback to text input with notice |
| Invalid answer format | Show error message, allow retry |
| Question load failure | Retry 3x, then skip to next available |
| Session expires | Clear local data, restart from beginning |
| Device interruption (call) | Pause timer, resume on return |
| Background app timeout | Save progress, clear sensitive data |
| Extremely long text input | Truncate at character limit with warning |
| Rapid answer submission | Debounce to prevent double-submission |

---

## Accessibility Considerations

### VoiceOver Support
- All question elements properly labeled
- Answer options announced clearly
- Progress status communicated
- Voice command alternatives provided

### Visual Accessibility
- High contrast mode support
- Large text size compatibility
- Focus indicators for keyboard navigation
- Color-blind friendly progress indicators

### Motor Accessibility
- Large touch targets (44x44px minimum)
- Voice-first design reduces motor demands
- Extended timeout options
- Single-tap answer submission

---

## Testing Checklist

- [x] Happy path works - Demo flow completes successfully
- [ ] Voice input tested - STT integration functional
- [ ] Error states handled - Network failures, invalid inputs
- [ ] Loading states shown - Smooth question transitions
- [ ] Resume functionality - Progress preservation works
- [ ] Accessibility tested - VoiceOver, high contrast
- [ ] Performance tested - 60fps during transitions
- [ ] Edge cases covered - Interruptions, failures handled
- [ ] Multi-modal input - Voice and touch work seamlessly
- [ ] Question validation - All answer types validated

---

## Analytics & Metrics

### Completion Tracking
```typescript
interface QuestionMetrics {
  questionId: string;
  timeSpent: number;        // milliseconds
  answerMethod: 'voice' | 'touch';
  skipCount: number;        // how many times skipped
  voiceConfidence?: number; // if voice used
  revisionCount: number;    // how many times changed
}
```

### Flow Analytics
- **Completion Rate**: % users who finish full interview
- **Drop-off Points**: Where users most commonly exit
- **Time Per Question**: Average and distribution
- **Voice Adoption**: % users who try voice input
- **Skip Patterns**: Most commonly skipped questions

---

## Migration from Demo to Production

### Phase 1: Expand Demo (Current)
- Keep existing 10-question demo functional
- Add proper question type components
- Integrate voice input

### Phase 2: Full Question Set
- Load complete 150-question database
- Implement adaptive flow logic
- Add skip/back navigation

### Phase 3: Production Polish
- Full accessibility support
- Advanced analytics
- Performance optimization

---

## Integration Points

### AbbyOrb Integration
```typescript
// Voice activation flow
orbTapped() → setVoiceMode(true) → showVoiceInput() →
processVoiceAnswer() → confirmAnswer() → submitAnswer()
```

### VibeMatrix Integration
```typescript
// Vibe state changes
answerQuestion() → checkVibeShift() → setColorTheme() →
triggerBackgroundTransition() → waitForTransition() → nextQuestion()
```

### Backend Integration (V2)
- Real-time answer synchronization
- Cloud-based progress backup
- Cross-device session resumption
- Analytics data pipeline

---

## Security Considerations

| Layer | Approach |
|-------|----------|
| Answer Data | Encrypt sensitive answers before local storage |
| Voice Transcripts | Never store audio, encrypt transcriptions |
| Progress Data | Expire local cache after 7 days |
| Question Logic | Validate answer formats on client and server |
| Skip Logic | Prevent manipulation of required questions |

---

## Future Enhancements (V2)

| Enhancement | Description | Effort Estimate |
|-------------|-------------|------------------|
| Dynamic Question Generation | AI-generated follow-up questions | 4-6 weeks |
| Conversation Mode | Abby asks follow-up questions naturally | 3-4 weeks |
| Answer Revision | Allow users to change previous answers | 1-2 weeks |
| Question Branching | Conditional question trees | 2-3 weeks |
| Real-time Matching | Show compatibility as user answers | 3-4 weeks |
| Question Insights | Show why questions matter for matching | 1-2 weeks |

---

## File Structure

```
src/
├── components/
│   ├── screens/
│   │   └── InterviewScreen.tsx          # Main container ✅
│   ├── questions/
│   │   ├── QuestionCard.tsx             # Question wrapper (TBD)
│   │   ├── ChoiceQuestion.tsx           # Multiple choice UI (TBD)
│   │   ├── ScaleQuestion.tsx            # Slider/rating UI (TBD)
│   │   ├── TextQuestion.tsx             # Text input UI (TBD)
│   │   └── PicturegramQuestion.tsx      # Visual preferences (TBD)
│   └── ui/
│       ├── VoiceInput.tsx               # Voice capture UI (TBD)
│       └── ProgressIndicator.tsx        # Enhanced progress (TBD)
├── data/
│   ├── demo-questions.ts                # Demo question set ✅
│   ├── questions.json                   # Full question database (TBD)
│   └── question-flow-logic.ts           # Adaptive flow (TBD)
├── store/
│   └── useInterviewStore.ts             # Question flow state (TBD)
└── types/
    └── interview.ts                     # Question/answer types (TBD)
```

---

## Open Questions & Decisions

### MVP Scope Decisions ✅ RESOLVED
1. ~~**How many questions for MVP?**~~ → ✅ **All 150 questions** (approved 2024-12-22)
2. ~~**Which question types for MVP?**~~ → ✅ All 5 types from schema
3. ~~**Voice integration timeline?**~~ → ✅ Voice I/O Only strategy, parallel with UI
4. **Skip/back navigation?** → TBD (linear flow for MVP)

### Technical Decisions
1. **Question loading strategy?** → Load all 150 upfront (schema is static)
2. **Answer validation?** → Client-side only for MVP
3. **Progress persistence?** → Local (AsyncStorage) for MVP
4. ~~**Voice confidence threshold?**~~ → ✅ 70% to show confirmation, 90% to auto-submit

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2024-12-22 | **MAJOR:** Updated to 150 questions for MVP (all questions from schema) | Chi |
| 2024-12-22 | Resolved MVP scope decisions - voice strategy, question types | Chi |
| 2024-12-20 | Created comprehensive SpecKit specification | Chi |
| 2024-12-10 | Implemented demo InterviewScreen with vibe coordination | CC1 |
| 2024-12-09 | Created basic question rendering and progress tracking | CC1 |

---

*Document created: December 20, 2024*
*Last updated: December 22, 2024*