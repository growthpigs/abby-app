# ABBY - Product Requirements Document (PRD)

> **Living Document** | Version: 1.0 | Last Updated: 2025-12-09
>
> Source of Truth for design, engineering, and QA.

---

## 1. Executive Summary

**ABBY** is a high-end, purpose-driven matchmaking service disguised as an app. It rejects the "swiping" paradigm entirely.

Instead of a catalog of humans, users interact with **Abby**—an omnipresent, living AI entity—who:
- Conducts a deep psychological interview (150 questions)
- Performs matchmaking in the background
- Delivers **one curated match at a time**

### Core Value Proposition

| Pillar | Description |
|--------|-------------|
| **Privacy** | 100% Anonymous. No public profiles. "Breadcrumb" reveal system. |
| **Quality** | Matches based on deep psychological compatibility (Gottman principles), not looks. |
| **Efficiency** | The AI does the work. The user lives their life. |
| **Living Interface** | The app is not a tool; it is a companion. The UI "breathes," morphs, and reacts. |

---

## 2. Target Audience

### Persona 1: The Intentional Dater
- Tired of "hookup culture" (Tinder/Hinge)
- Willing to pay premium ($25+) for verified, high-quality connections
- Values time over volume

### Persona 2: The Private Professional
- High-net-worth or public-facing individual
- Cannot risk having face on a public dating grid
- Needs discrete, verified matching

### Persona 3: The "Awkward" Gen Z
- Needs coaching on social cues and relationship maintenance
- Relies on Abby as a "Buddy/Therapist" for guidance
- Appreciates AI-mediated communication

---

## 3. Platform & Technical Constraints

| Attribute | Specification |
|-----------|---------------|
| **Platform** | iOS Only (v1.0) |
| **Framework** | React Native (Expo SDK 50+) |
| **Target** | TestFlight Prototype → App Store |
| **Backend** | Mocked locally (Android backend separate) |

---

## 4. Core Functional Pillars

### 4.1 The "Living" Interface (Glass Sandwich)

Three distinct Z-index layers:
- **Layer 0 (Background)**: GLSL Shader-based "Vibe Matrix" (Fluid Simulation)
- **Layer 1 (Abby)**: Reactive 3D-style Orb that morphs based on state
- **Layer 2 (Foreground)**: Glassmorphic modals for text and interactions

**Constraint**: No hard cuts or white screens. All transitions must be continuous morphs.

### 4.2 The Engine (150-Question Profile)

Non-linear conversational interface supporting:
- Rich Inline Buttons (single-tap answers)
- Scale Sliders (1-10)
- Logic Jumps (skip irrelevant questions based on previous answers)

### 4.3 The Matchmaker (The Black Box)

- **Deliberate Delay**: 1hr - 24hrs wait to build value
- **Presentation**: Match Card shows Bio/Summary ONLY initially
- **Reveal Flow**: Mutual "Interested" tap → Pay Gate → Photo Unlock

---

## 5. User Stories

### EPIC 1: Onboarding & Identity

| ID | Story |
|----|-------|
| US 1.1 | As a new user, I want to authenticate via phone number so my account is secure and real. |
| US 1.2 | As a privacy-conscious user, I want to verify my ID privately so I know everyone is verified (No Bots). |
| US 1.3 | As a user, I want to be introduced to "Abby" as an entity, not a tutorial. |

### EPIC 2: The Interview (Data Ingestion)

| ID | Story |
|----|-------|
| US 2.1 | As a user, I want to answer questions in a conversational chat format so it doesn't feel like a form. |
| US 2.2 | As a user, I want to tap "Rich Buttons" for answers instead of typing. |
| US 2.3 | As a user, I want to see Abby "react" (pulse/glow) when I submit an answer. |

### EPIC 3: The Search & Reveal

| ID | Story |
|----|-------|
| US 3.1 | As a user, I want to see Abby "analyzing" candidates visually so I feel the algorithm working. |
| US 3.2 | As a user, I want to receive a notification when a match is found. |
| US 3.3 | As a user, I want to read a detailed bio before seeing their photo. |
| US 3.4 | As a matched user, I want to pay to unlock the connection, ensuring high intent. |

### EPIC 4: The Coach (Retention)

| ID | Story |
|----|-------|
| US 4.1 | As a user in chat, I want to tap Abby to get private advice without leaving the conversation. |
| US 4.2 | As a Pro user, I want Abby to suggest date ideas based on shared interests. |

### EPIC 5: Safety & Intervention

| ID | Story |
|----|-------|
| US 5.1 | As the system, I want to pause accounts flagging "Four Horsemen" traits (Gottman). |

---

## 6. Success Metrics

| Metric | Target |
|--------|--------|
| **Completion Rate** | % users finishing 150-question profile > 60% |
| **Conversion to Match** | % matches resulting in mutual "Interested" tap |
| **Stickiness** | Frequency of "Coach Abby" interactions post-match |

---

## 7. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| 150-question process too long | "Living UI" provides constant dopamine feedback (pulsing/color shifts) to gamify |
| High GPU usage from Shaders | "Low Power Mode" fallback using static PNGs if battery < 20% |

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2025-12-09 | 1.0 | Initial document creation |
