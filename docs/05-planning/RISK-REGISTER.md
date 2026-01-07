# ABBY - Risk Register

**Product Name:** ABBY - The Anti-Dating App
**Version:** 1.0 MVP
**Last Updated:** December 20, 2024
**References:** PRD.md, FSD.md, ISD.md, DESIGN-BRIEF.md

---

## Summary

| Risk Level | Count |
|------------|-------|
| High | 2 |
| Medium | 5 |
| Low | 2 |

**Last Updated:** January 7, 2026 (ID Token Strategy Added)

---

## High Risks

### RISK-001: ElevenLabs Credentials Not Received

**Description:** Voice AI integration depends on ElevenLabs agent credentials. Without them, core "talk to Abby" experience cannot be tested or demonstrated.

**Likelihood:** Medium
**Impact:** High
**Category:** External

**Mitigation:**
- Follow up with Manuel/Nathan immediately for credentials
- Build voice UI with mock responses first
- Prepare text-only fallback mode

**Contingency:**
- If credentials delayed >3 days: Demo with text-only mode, voice as "coming soon"
- Document voice integration as separate deliverable

**Owner:** Diiiploy (escalate to Brent)

---

### RISK-002: Apple Developer / TestFlight Access Delayed

**Description:** Cannot deliver TestFlight build without Apple Developer account access. This is the primary client demo vehicle.

**Likelihood:** Medium
**Impact:** High
**Category:** External

**Mitigation:**
- Request Apple Developer invite from Manuel immediately
- Prepare Expo Go demo as interim fallback
- Document exact steps Manuel needs to take

**Contingency:**
- If access delayed: Demo via Expo Go or screen recording
- Ship to TestFlight once access granted (adds days to timeline)

**Owner:** Manuel (client action required)

---

## Medium Risks

### RISK-003: Shader Performance on Device

**Description:** GLSL shaders may run slower on physical devices than simulator. Could cause frame drops, battery drain, or thermal issues.

**Likelihood:** Medium
**Impact:** Medium
**Category:** Technical

**Mitigation:**
- Test on physical iPhone 12+ early (Day 2-3)
- Build adaptive complexity (reduce shader detail if needed)
- Implement Low Power Mode fallback (static gradients)

**Contingency:**
- If <45fps: Reduce shader complexity
- If overheating: Force static background mode

**Owner:** Diiiploy

---

### RISK-004: Nathan Backend Coordination

**Description:** App integrates with Nathan's backend for user data and interview storage. API contracts and timing need alignment.

**Likelihood:** Medium
**Impact:** Medium
**Category:** Resource

**Mitigation:**
- Define API contracts upfront (done in ISD)
- Mock all endpoints locally for MVP
- Sync with Nathan weekly

**Contingency:**
- If Nathan delayed: Ship with local-only mode, sync later
- All data structures designed to match Nathan's schema

**Owner:** Diiiploy + Nathan

---

### RISK-005: Voice Latency During Conversation

**Description:** ElevenLabs response latency may exceed 500ms target, breaking conversational flow with Abby.

**Likelihood:** Medium
**Impact:** Medium
**Category:** Technical

**Mitigation:**
- ElevenLabs agent already built and tested by client
- Optimize audio buffering and streaming
- Show "thinking" animation during latency

**Contingency:**
- If latency >1s: Add typing indicator, Abby "thinking" state
- Fallback to text if voice consistently slow

**Owner:** Diiiploy

---

### RISK-006: Scope Creep (150+ Questions)

**Description:** Full question bank has 150+ questions. Unclear how many are MVP vs. V2. Risk of scope expanding.

**Likelihood:** Medium
**Impact:** Medium
**Category:** Scope

**Mitigation:**
- Define MVP question count upfront (suggest 20-30 core questions)
- Build question system to be data-driven (easy to add more)
- Get client sign-off on MVP question list

**Contingency:**
- If client wants all 150: Negotiate timeline extension or V2 scope

**Owner:** Diiiploy + Manuel

---

### RISK-007: ID Token Authentication Pattern (Non-Standard)

**Description:** Rod's iOS app uses ID tokens instead of AWS-recommended access tokens for API calls. This is a pragmatic decision to avoid backend changes but deviates from best practices and may cause issues when scaling.

**Likelihood:** Low (0-3 months)
**Impact:** Medium (hidden technical debt)
**Category:** Technical

**Status:** MITIGATED - Documented in ADR-001-COGNITO-TOKEN-STRATEGY.md

**Mitigation:**
- Decision explicitly documented with risk timeline
- ID tokens work identically for JWT validation
- Both token types from same Cognito pool are valid
- Token refresh mechanism handles both types
- Clear migration path to access tokens (≈2 hours refactor effort)

**Risk Timeline:**
- 0-3 months: No risk identified (MVP phase)
- 3-6 months: Risk emerges if adding second backend service that validates `token_use` field
- 6+ months: Enterprise customers may audit token usage; permission scopes stored only in access tokens

**Contingency:**
- Document decision in all code reviews
- Plan refactor to access tokens at 6-month mark
- Budget ~2 hours for access token migration
- Track in TECH-DEBT.md under "Authentication Refactoring"

**Owner:** Rod (frontend) + Nathan (backend)

---

## Low Risks

### RISK-008: Typography Licensing

**Description:** Playfair Display and Inter fonts need to be properly licensed for mobile app use.

**Likelihood:** Low
**Impact:** Low
**Category:** External

**Mitigation:**
- Both fonts are Google Fonts (open source, free for commercial use)
- Include font licenses in app bundle

**Contingency:**
- If licensing issue: Substitute with similar open source fonts

**Owner:** Diiiploy

---

### RISK-009: 14-Day Timeline Pressure

**Description:** Hard deadline of 14 days is aggressive for full MVP scope. Risk of incomplete features.

**Likelihood:** Low (with scope control)
**Impact:** Medium
**Category:** Schedule

**Mitigation:**
- Phased delivery accepted by client
- Core experience prioritized (VibeMatrix + Abby + Questions)
- Daily progress check-ins

**Contingency:**
- If behind schedule: Ship core experience, add polish in V1.1
- Soft deadline is 7 days - provides buffer

**Owner:** Diiiploy

---

## Risk Categories

| Category | Description |
|----------|-------------|
| Technical | Tech challenges, integrations, unknowns |
| Schedule | Timeline threats, dependencies |
| Resource | Availability, skills, capacity |
| External | Third parties, APIs, regulations |
| Scope | Feature creep, unclear requirements |

---

## Assumptions

These assumptions underpin our plan. If they change, risks increase:

1. ElevenLabs agent is functional and tested (built by client)
2. Apple Developer account access will be provided within 2-3 days
3. Nathan's backend can be mocked for MVP demo
4. Client accepts phased delivery (core first, polish second)
5. Target devices are iPhone 12+ with iOS 14+
6. MVP question count is 20-30, not full 150+

---

## Dependencies

| Dependency | Owner | Status | Risk if Delayed |
|------------|-------|--------|-----------------|
| ElevenLabs credentials | Manuel/Nathan | Pending | Blocks voice demo |
| Apple Developer invite | Manuel | Pending | Blocks TestFlight |
| Nathan API contracts | Nathan | Can mock | Delays real data |
| MVP question list | Manuel | Pending | Scope uncertainty |
| @shopify/react-native-skia | Open source | Stable | Low |
| Expo SDK 50+ | Open source | Stable | Low |

---

## Sign-Off

By approving this risk register, you acknowledge:

- You understand the identified risks
- You accept the mitigation strategies
- You're ready to proceed to Creative phase

[ ] Approved to proceed

**Approved by:** ___________________
**Date:** ___________________

---

*Document created: December 20, 2024*
