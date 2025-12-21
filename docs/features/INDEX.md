# ABBY - Features Index

**Project:** ABBY - The Anti-Dating App
**Last Updated:** December 20, 2024

---

## Feature Status Tracking

| Feature | Status | Document | Owner | Priority |
|---------|--------|----------|-------|----------|
| vibematrix | 🚀 Implemented | vibematrix-spec.md | Chi | MVP |
| abbyorb | 🚧 In Development | abbyorb-spec.md | Chi | MVP |
| question-flow | 🚧 Partially Implemented | question-flow-spec.md | Chi | MVP |
| glass-interface | 📝 Needs Implementation | glass-interface-spec.md | Chi | MVP |
| onboarding-auth | 📝 Needs Implementation | onboarding-auth-spec.md | Chi | MVP |
| voice-integration | 📝 Needs Implementation | voice-integration-spec.md | Chi | MVP |

---

## Status Legend

| Icon | Status | Description |
|------|--------|-------------|
| 🚀 | Implemented | Feature complete and tested |
| 🚧 | In Development | Actively being built |
| 📝 | Needs Spec | Requires specification document |
| ⏸️ | On Hold | Paused for dependencies |
| ❌ | Cancelled | Removed from scope |

---

## MVP Feature Breakdown

### Layer 0: VibeMatrix (Background)
- **Status**: 🚀 Implemented
- **Description**: GLSL shader backgrounds that morph based on conversation state
- **Key Components**: 18 shaders, noise-based transitions, performance monitoring
- **Dependencies**: @shopify/react-native-skia

### Layer 1: AbbyOrb (AI Presence)
- **Status**: 🚧 In Development
- **Description**: 3D orb representing Abby with voice-reactive animations
- **Key Components**: Breathing animations, voice sync, state transitions
- **Dependencies**: ElevenLabs, VibeMatrix alpha blending

### Layer 2: GlassInterface (UI System)
- **Status**: 📝 Needs Spec
- **Description**: Consistent blur-based UI maintaining glass metaphor
- **Key Components**: GlassCard, GlassButton, BlurView wrappers
- **Dependencies**: expo-blur

### Core Features

#### Question Flow System
- **Status**: 📝 Needs Spec
- **Description**: Adaptive question presentation with voice/touch input
- **Key Components**: Multiple choice, scales, text input, picturegram
- **Dependencies**: Voice integration, glass interface

#### Onboarding & Authentication
- **Status**: 📝 Needs Spec
- **Description**: Phone/social login and basic profile setup
- **Key Components**: Phone verification, Apple/Google/Facebook auth
- **Dependencies**: Expo AuthSession

#### Voice Integration
- **Status**: 📝 Needs Spec
- **Description**: ElevenLabs conversational agent integration
- **Key Components**: Real-time voice, transcription, intent recognition
- **Dependencies**: @elevenlabs/react-native, LiveKit

---

## V2 Features (Future)

| Feature | Description | Effort Estimate |
|---------|-------------|-----------------|
| Match Revelation Flow | Bio-only matches with photo unlock system | 3-4 weeks |
| Verification & Certification | Identity verification to eliminate fake profiles | 2-3 weeks |
| Coach Mode | Ongoing relationship guidance after matching | 2-3 weeks |
| Premium Subscriptions | Gold/Platinum tiers with advanced features | 1-2 weeks |
| Android Version | Cross-platform compatibility | 4-6 weeks |

---

## Architecture Dependencies

```
┌─────────────────┐
│ Voice Integration│
└─────────┬───────┘
          │
┌─────────▼───────┐    ┌─────────────────┐
│   AbbyOrb       │◄───┤  VibeMatrix     │
│   (Layer 1)     │    │  (Layer 0)      │
└─────────┬───────┘    └─────────────────┘
          │
┌─────────▼───────┐    ┌─────────────────┐
│ GlassInterface  │◄───┤ Question Flow   │
│ (Layer 2)       │    │                 │
└─────────────────┘    └─────────────────┘
          │
┌─────────▼───────┐
│  Onboarding     │
│  & Auth         │
└─────────────────┘
```

**Critical Path for MVP**:
1. VibeMatrix (✅ Done)
2. AbbyOrb (🚧 In Progress)
3. GlassInterface + Question Flow (parallel development)
4. Voice Integration (integrates with AbbyOrb)
5. Onboarding & Auth (final integration)

---

## Next Feature to Spec

**Status**: All MVP Features Specced ✅

Voice Integration is now fully specced. All core MVP features have comprehensive SpecKit specifications:

✅ **VibeMatrix** - Implemented & Optimized
✅ **AbbyOrb** - In Development
✅ **Question Flow** - Partially Implemented
✅ **Glass Interface** - Ready for Implementation
✅ **Onboarding & Auth** - Ready for Implementation
✅ **Voice Integration** - Ready for Implementation

**Next Steps**: Begin implementation of remaining features, starting with highest priority dependencies.

---

## 2024-12-20 Update

**What was done:**
- Completed glass-interface-spec.md with comprehensive glassmorphic UI system
- Completed onboarding-auth-spec.md with multi-provider authentication flows
- Completed voice-integration-spec.md with ElevenLabs conversational agent integration
- All MVP features now have complete SpecKit specifications

**Files created:**
- docs/features/glass-interface-spec.md - Complete glass UI component system
- docs/features/onboarding-auth-spec.md - Authentication and profile setup flows
- docs/features/voice-integration-spec.md - ElevenLabs voice conversation system

**Status:** ✅ Complete - All MVP Features Specced

**Next:**
- Begin implementation phase starting with highest priority dependencies
- Glass Interface system should be implemented first (Layer 2 foundation)
- Onboarding & Auth needed before user data persistence
- Voice Integration requires ElevenLabs credentials from client

---

*Index created: December 20, 2024*
*Last updated: December 20, 2024*