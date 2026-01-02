# ABBY - Product Requirements Document

**Product Name:** ABBY - The Anti-Dating App
**Version:** 1.0 MVP
**Last Updated:** January 2, 2026
**Client:** Manuel Negreiro

---

## Product Overview

### Vision
ABBY revolutionizes online dating by eliminating the "swipe grid" entirely. Instead of browsing endless profiles, users have intimate conversations with Abby, an AI matchmaker who learns their deepest compatibility needs and finds their person. The interface feels alive - a glass pane floating over a living, bioluminescent ocean that breathes and reacts to the emotional state of the conversation.

### Target Users
**Primary:** Adults 25-45 seeking serious relationships - Professionals, divorced individuals, and people burned out on traditional dating apps who value genuine connection over casual encounters.

**Secondary:** Dating-curious individuals 22-35 - People who find traditional dating apps overwhelming or superficial but are open to AI-guided matchmaking.

### Success Metrics
| Metric | Target |
|--------|--------|
| User Completion Rate | 80%+ complete the full Abby interview |
| Session Duration | Average 15+ minutes per session |
| Voice Usage | 60%+ of users engage with voice features |
| Frame Rate | Consistent 60fps during animations |
| Client Validation | Approved for V2 development funding |

---

## User Stories (MVP)

### Epic: Onboarding & Authentication

**US-001: Account Creation**
As a potential user, I want to create an account so that I can access the app securely.

> **Implementation Note (2026-01-02):** Client originally requested phone + social auth. MVP implements email/password via AWS Cognito. Phone/social auth deferred to V2. See SCREEN-SPECS.md for gap analysis.

Acceptance Criteria:
- [x] User can enter email address
- [x] User can create password (Cognito requirements enforced)
- [x] Email verification with 6-digit code works
- [x] User can resend verification code
- [x] Account creation saves auth info via Cognito
- [ ] ~~User can enter phone number~~ (V2 - orphaned screens exist)
- [ ] ~~User can continue with Apple, Facebook, or Google~~ (V2)

**US-002: Basic Profile Setup**
As a new user, I want to provide my basic information so that Abby can begin to understand who I am.

Acceptance Criteria:
- [x] User enters full name
- [ ] ~~User enters display name/nickname~~ (V2 - missing)
- [x] User enters date of birth
- [ ] ~~User enters preferred age range~~ (V2 - slider missing)
- [x] User selects gender identity (2 options - man/woman)
- [ ] ~~10+ gender options per client spec~~ (V2 - expansion needed)
- [x] User selects who they're looking for
- [x] User selects ethnicity (theirs and preferences)
- [x] User selects relationship type and smoking preferences
- [x] User grants location permissions

---

### Epic: Meeting Abby

**US-003: Abby Introduction**
As a user who completed basic setup, I want to meet Abby in a magical way so that I feel excited about the process.

Acceptance Criteria:
- [x] VibeMatrix background renders smoothly with color morphing (18 shaders)
- [x] Abby orb appears with breathing animation (LiquidGlass4)
- [x] Transition from onboarding to Abby is seamless
- [x] User feels the interface is "alive" not static
- [x] No white screens or jarring cuts

**US-004: Voice Conversation with Abby**
As a user meeting Abby, I want to have a natural voice conversation so that it feels like talking to a real matchmaker.

> **Implementation Note (2026-01-02):** Using OpenAI Realtime API via client backend (dev.api.myaimatchmaker.ai), NOT ElevenLabs. Currently in demo mode - falls back to simulated responses when API unavailable.

Acceptance Criteria:
- [x] User can activate voice mode (CoachIntroScreen, CoachScreen)
- [x] Service falls back to demo mode when API unavailable
- [ ] Real-time voice latency under 500ms (requires real API connection)
- [x] User can switch between voice and text seamlessly
- [ ] WebSocket/WebRTC connection for real-time audio (TODO)

---

### Epic: The Interview Process

**US-005: Deep Compatibility Questions**
As a user, I want Abby to ask me thoughtful questions about relationships so that she can find someone truly compatible.

Acceptance Criteria:
- [x] Questions appear as appropriate UI (buttons, sliders, text input)
- [x] User can answer via voice or touch interface
- [ ] Progress is saved if user exits mid-interview (TODO - no persistence)
- [x] Abby reacts to answers with appropriate responses (demo mode)
- [x] Interface adapts to question type (QuestionsService)

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

> **Implementation Note (2026-01-02):** Not implemented in MVP. This is part of the full question flow (V2).

Acceptance Criteria:
- [ ] User can select multiple physical preference categories (V2)
- [ ] Interface feels judgment-free and safe (V2)
- [ ] Preferences are captured with appropriate weights (V2)
- [ ] User understands their choices affect matching (V2)

---

### Epic: Glass Interface System

**US-008: Consistent Glass UI**
As a user, I want all interface elements to feel cohesive with the glass metaphor so that the experience feels premium and unified.

Acceptance Criteria:
- [x] All UI components use BlurView consistently (expo-blur)
- [x] Text is always readable over the moving background
- [x] Buttons and cards feel like they're floating on glass (GlassCard)
- [x] Touch feedback works properly through blur effects
- [x] Interface never breaks the glass/ocean metaphor (28 screens)

---

### Epic: Performance & Polish

**US-009: Smooth Performance**
As a user, I want the app to run smoothly so that the magical feeling isn't broken by technical issues.

Acceptance Criteria:
- [x] App maintains 60fps during normal usage
- [x] Shader performance optimized (registry pattern, 18 shaders)
- [ ] Low power mode switches to static backgrounds when battery < 20% (V2)
- [x] App launches in under 3 seconds
- [x] No crashes during 10-minute usage sessions (344 tests pass)

**US-010: TestFlight Demo**
As a client, I want to see a working demo on my device so that I can evaluate the concept.

Acceptance Criteria:
- [ ] App is available via TestFlight (pending EAS build)
- [x] Full user flow can be completed without crashes
- [x] Core experience (VibeMatrix + Abby + Questions) is functional
- [x] Voice integration works (demo mode fallback)
- [x] App demonstrates the "alive" feeling effectively

---

### Epic: Settings & Input Mode (Added 2024-12-22)

**US-011: Input Mode Selection**
As a user, I want to choose my preferred input mode (voice only, text only, or both) so that I can interact with Abby in my most comfortable way.

Acceptance Criteria:
- [x] User can access Settings screen (hamburger menu)
- [x] 3 input modes available: voice only, text only, voice+text
- [x] Selection persists across app sessions (AsyncStorage)
- [x] Default mode is voice+text
- [x] Settings accessible via hamburger menu when authenticated

**US-012: Conversation Transcript Display**
As a user, I want to see the conversation with Abby as text so that I can follow along and reference what was said.

Acceptance Criteria:
- [x] Transcript appears in blur overlay during interview
- [x] Abby's messages and user responses both shown
- [x] Overlay height adapts to snap points (0.35, 0.55, 0.75, 0.9)
- [x] Drag handle allows hiding/showing text
- [x] Auto-scrolls to latest message

---

## User Stories (V2 / Future)

| ID | Story | Description |
|----|-------|-------------|
| US-F01 | Match Revelation Flow | User receives bio-only match, can pay to unlock photos, full reveal system |
| US-F02 | Verification & Certification | Identity verification system to eliminate bots and fake profiles |
| US-F03 | Coach Mode | Ongoing relationship guidance from Abby after matching |
| US-F04 | Premium Subscription Tiers | Gold/Platinum features with advanced matching and priority support |
| US-F05 | Android Version | Cross-platform compatibility for broader market reach |

---

## Non-Functional Requirements

### Performance
- Maintain 60fps during animations and shader rendering
- App launch time under 3 seconds
- Voice response latency under 500ms
- Memory usage under 200MB during normal operation

### Security
- All user data encrypted in transit and at rest
- No profile browsing prevents unauthorized access to user photos
- Secure storage of voice conversation metadata

### Scalability
- Architecture supports 1000+ concurrent users (V2)
- Question flow easily extensible without code changes
- Shader system supports additional vibe states

### Accessibility
- Voice-first design accommodates various abilities
- Text alternatives for all voice interactions
- High contrast mode for visual impairments

---

## Constraints & Assumptions

### Constraints
- iOS only for MVP (iPhone 12+ recommended)
- 14-day development timeline (hard deadline)
- $5K budget for MVP phase
- Must coordinate with Nathan's backend development

### Assumptions
- OpenAI Realtime API is accessible via client backend (demo mode fallback)
- AWS Cognito is configured and working (✅ Verified)
- Apple Developer account access available for TestFlight
- Users are comfortable with AI-guided matchmaking
- Target demographic has modern iPhones capable of shader rendering

---

## Dependencies

| Dependency | Type | Status | Risk |
|------------|------|--------|------|
| OpenAI Realtime API (via client backend) | External | Demo Mode | Medium |
| AWS Cognito (auth) | External | ✅ Configured | Low |
| Apple Developer/TestFlight Access | External | Pending | High |
| Client Backend API (dev.api.myaimatchmaker.ai) | External | ✅ Integrated | Low |
| @shopify/react-native-skia | External | ✅ Stable | Low |
| Expo SDK 50+ | External | ✅ Stable | Low |

> **Note (2026-01-02):** ElevenLabs was replaced with OpenAI Realtime API via client backend. Nathan's API has been replaced by client's own API at dev.api.myaimatchmaker.ai.

---

## Open Questions

- [x] ~~How many of the 100+ questions should be included in MVP vs V2?~~ → 150 questions approved
- [x] ~~What fallback experience if voice fails or user prefers not to use it?~~ → Demo mode fallback + text input option
- [ ] Should we implement any basic matching algorithm for MVP demo? → Using mock data currently
- [x] ~~What happens after user completes interview?~~ → Demo flow: Interview → Searching → Match → Payment → Reveal → Coach

### New Questions (2026-01-02)
- [ ] Is email-only auth acceptable, or must we add phone + social for MVP?
- [ ] Is hamburger menu acceptable, or must we implement "Main Street" hub design?
- [ ] When are pricing/membership screens needed?
- [ ] Confirm certification/verification is V2 feature?

---

*Document created: December 20, 2024*
*Last updated: January 2, 2026*
