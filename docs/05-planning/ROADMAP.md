# ABBY MVP - Development Roadmap

**Last Updated:** 2026-01-15
**Status:** Code Quality Phase (Audit Complete)
**Drive Mirror:** [ABBY MVP - Roadmap Breakdown](https://docs.google.com/spreadsheets/d/1LTSmWsXBE5x5Kv7DLhfhVkX89M01qdViP3FnDPOXMcg/edit)

---

## Project Timeline

| Phase | Start | Status | Description |
|-------|-------|--------|-------------|
| Phase 0: Foundation | Dec 20, 2024 | ✅ COMPLETE | VibeMatrix, AbbyOrb, Glass UI, Auth |
| Phase 1: Legal Blockers | Jan 2, 2026 | ✅ COMPLETE | 18+ checkbox, GDPR delete |
| Phase 2: Profile Submission | Jan 2, 2026 | ✅ COMPLETE | Fix getProfilePayload() call |
| Phase 3: State Persistence | Jan 2, 2026 | ✅ COMPLETE | Interview + Onboarding recovery |
| Phase 4: UX Fixes | Jan 2, 2026 | ✅ COMPLETE | ProfileScreen, RevealScreen, ErrorModal (verified 2026-01-14) |
| Phase 5: Social Auth | - | ⏳ PENDING | Apple/Google/Facebook buttons (blocked: client config) |
| Phase 6: Design Alignment | - | ⏳ PENDING | Gender options, Nickname, Age slider |
| Phase 7: API Integration | - | 🟡 PARTIAL | Auth ✅, Profile ✅, Questions ✅, Voice ✅; Matches/Photos/Payment 🟡 stub |
| Phase 8: Polish | - | ⏳ PENDING | Accessibility, Error handling |

---

## Phase 0: Foundation (COMPLETE)

### Deliverables Completed
| # | Category | Items | Status |
|---|----------|-------|--------|
| 1 | VibeMatrix | 18 GLSL shaders, 6 emotional states | ✅ |
| 2 | AbbyOrb | LiquidGlass4 with breathing animation | ✅ |
| 3 | Glass UI | 11 components (GlassCard, RichButton, etc) | ✅ |
| 4 | Authentication | Cognito email/password flow | ✅ |
| 5 | Onboarding | 14 screens (name, DOB, gender, etc) | ✅ |
| 6 | Voice Integration | AbbyRealtimeService (demo mode) | ✅ |
| 7 | Core Flow | Interview, Searching, Match, Reveal, Coach | ✅ |

### Metrics
- **Screens:** 28 implemented
- **Components:** 11 UI components
- **Services:** 8 (AuthService, TokenManager, etc)
- **Tests:** 344 passing
- **LOC:** 4,531+

---

## Phase 1: Legal Blockers (COMPLETE)

### Tasks
| Task | File | Status | Owner |
|------|------|--------|-------|
| 1.1 Add 18+ checkbox | DOBScreen.tsx | ✅ DONE | Chi |
| 1.2 Add "Delete My Data" | SettingsScreen.tsx | ✅ DONE | Chi |
| 1.3 Wire phone screens (V2) | index.ts, App.tsx | ⏳ V2 | - |

### Acceptance Criteria
- [x] 18+ checkbox blocks navigation if unchecked
- [x] Delete data shows confirmation alert
- [x] Delete calls API and logs out user

---

## Phase 2: Profile Submission Fix (COMPLETE)

### Tasks
| Task | File | Status | Owner |
|------|------|--------|-------|
| 2.1 Call getProfilePayload() | App.tsx | ✅ DONE | Chi |

### Acceptance Criteria
- [x] Profile data submitted to `/v1/profile/public` after onboarding
- [x] API errors don't block authentication
- [x] Success logged for debugging

---

## Phase 3: State Persistence (COMPLETE)

### Tasks
| Task | File | Status | Owner |
|------|------|--------|-------|
| 3.1 Interview persistence | useDemoStore.ts | ✅ DONE | Chi |
| 3.2 Onboarding recovery | useOnboardingStore.ts | ✅ DONE | Chi |

### Acceptance Criteria
- [x] App crash mid-interview shows "Resume?" dialog on restart
- [x] App crash mid-onboarding continues from last screen
- [x] Sessions expire after 7/30 days respectively

---

## Phase 4: UX Fixes (✅ COMPLETE)

### Tasks
| Task | File | Status | Owner |
|------|------|--------|-------|
| 4.1 Create ProfileScreen | ProfileScreen.tsx | ✅ DONE | Chi (2026-01-13) |
| 4.2 Fix post-reveal dead end | RevealScreen.tsx | ✅ DONE | Chi (2026-01-13) |
| 4.3 Add network error UI | ErrorModal.tsx | ✅ DONE | Chi (2026-01-13) |

### Acceptance Criteria
- [x] Users can edit profile after onboarding (ProfileScreen.tsx 11KB, fully wired to API)
- [x] RevealScreen has "Message", "More Matches", "View All" buttons + "Meet Coach" with fallback to advance()
- [x] Network errors show retry/dismiss modal (ErrorModal.tsx with retry/dismiss buttons + haptics)

### Verification (2026-01-14)
- ✅ ProfileScreen: 11KB implementation with edit fields, API integration to PUT /profile/public
- ✅ ErrorModal: 3.3KB component with retry/dismiss, BlurView glass effect, haptic feedback
- ✅ RevealScreen: Callbacks with fallback behavior (onMessage, onFindMoreMatches, onViewAllMatches)
- ✅ All 461 tests passing (14 test suites, including animation-fixes, ui-stability, demo-flow)
- ✅ TypeScript: Clean compilation (npx tsc --noEmit)

---

## Phase 5: Social Auth

### Tasks
| Task | File | Status | Owner |
|------|------|--------|-------|
| 5.1 Add social buttons | LoginScreen.tsx | ⏳ | Chi |
| 5.2 Configure Cognito providers | CognitoConfig.ts | ⏳ CLIENT | Client |

### Acceptance Criteria
- [ ] Apple/Google/Facebook buttons visible
- [ ] Buttons show "Coming soon" if providers not configured
- [ ] Works with Cognito federated identity when available

---

## Phase 6: Design Alignment

### Tasks
| Task | File | Status | Owner |
|------|------|--------|-------|
| 6.1 Expand gender options | BasicsGenderScreen.tsx | ✅ DONE | - |
| 6.2 Add nickname field | NameScreen.tsx | ⏳ | Chi |
| 6.3 Add age range slider | DOBScreen.tsx | ⏳ | Chi |
| 6.4 Main Street hub | TBD | ❓ CLIENT | Client |

### Acceptance Criteria
- [ ] 10+ gender options available (already done)
- [ ] Nickname field optional, saves to store
- [ ] Age range slider 18-99, dual handles
- [ ] Client decision: hamburger vs Main Street

---

## Phase 7: API Integration (⚠️ PARTIAL - See Clarification Below)

### Tasks
| Task | File | Status | Owner | Notes |
|------|------|--------|-------|-------|
| 7.1 Integrate Matches API | MatchesScreen.tsx | 🟡 STUB | Chi | Has API_BASE but uses mock data |
| 7.2 Integrate Photos API | PhotosScreen.tsx | 🟡 STUB | Chi | Has API_BASE but uses mock data |
| 7.3 Token refresh | secureFetch.ts | ✅ DONE | Chi | Handles 401 refresh + retry |
| 7.4 Centralize API URLs | src/config.ts | ✅ DONE | Chi | All endpoints centralized |
| 7.5 Profile API | ProfileScreen.tsx | ✅ DONE | Chi | PUT /profile/public wired |

### Clarification: What "COMPLETE" Actually Means
- ✅ **DONE:** Auth (Cognito), Questions (via QuestionsService), Profile (PUT), Voice (demo + real fallback)
- 🟡 **STUB:** Photos, Matches, Payment (have placeholders/mocks, need real API wiring)
- ✅ **INFRASTRUCTURE:** Token refresh, API URL centralization, error handling

### Acceptance Criteria
- [x] Token refresh handles 401 errors with automatic retry
- [x] All API URLs use `API_CONFIG.API_URL` (no hardcoded strings)
- [x] ProfileScreen.tsx saves to `/v1/profile/public` ✅
- [x] QuestionService wired to `/v1/questions/next` and `/v1/answers` ✅
- [ ] Photos: Real integration to `/v1/photos/*` (PENDING)
- [ ] Matches: Real integration to `/v1/matches/candidates` (PENDING)
- [ ] Payment: Real Stripe integration (PENDING)

### Code Quality (2026-01-14)
- **461 tests passing** (all Phase 7 infrastructure tested)
- **TypeScript:** Clean compilation
- **API URLs:** Centralized in `src/config.ts`
- **Docs:** Updated with stub status clarification

### Code Quality Audit (2026-01-15)
- **Comprehensive Antipattern Audit:** Full codebase scan for code smells and technical debt
- **Fix Applied:** 3 unguarded `console.warn` in QuestionsService.ts (lines 180, 254, 260)
- **Multi-Agent Discovery:** Audit exposed stale-report risk in parallel AI development
- **PAI Documentation:**
  - EP-087 added to `error-patterns.md` (Code Audit Cache Fallacy)
  - Pre-check verification added to `RUNBOOK.md`
  - See: `docs/06-reference/RUNBOOK.md#code-audit-pre-check-verification`

---

## Phase 8: Polish (🟡 IN PROGRESS)

### Tasks
| Task | File | Status | Owner |
|------|------|--------|-------|
| 8.1 Accessibility | All screens | ⏳ | Chi |
| 8.2 Error handling | All services | ⏳ | Chi |
| 8.3 Match Flow UI Polish | 5 screens | ✅ DONE | Chi (2026-01-15) |

### 8.3 Match Flow UI Polish (COMPLETE - 2026-01-15)
Applied consistent PASSION palette + glass design to non-onboarding screens:

| Screen | Changes |
|--------|---------|
| PhotosScreen | Primary badge → PASSION pink, empty slots → subtle white glass |
| MatchesScreen | Pass/Like buttons redesigned (icons only, glass/pink), cards → glass style |
| MatchScreen | Labels → WHITE, compatibility → PASSION pink, photo placeholder → pink tint |
| RevealScreen | Labels → WHITE, badges → PASSION pink, View All → subtle white |
| PaymentScreen | Hidden secret nav trigger borders |

**Design System Documentation:**
- `docs/DESIGN-SYSTEM.md` - Added "Match Flow Screens" section with all patterns
- `HANDOVER.md` - Added "DO NOT CHANGE" quick reference table
- Reference: `CertificationScreen.tsx` is the gold standard for glass styling

**Key Learning:** EP-088 "File Existence Fallacy" - Runtime verification > static checks

### Acceptance Criteria
- [ ] All touch targets 44x44 minimum
- [ ] All buttons have accessibilityLabel
- [ ] Errors display consistently
- [x] Match flow screens use consistent PASSION palette (2026-01-15)
- [x] Design patterns documented to prevent AI regression (2026-01-15)

---

## Client Decisions Required

| Decision | Options | Impact |
|----------|---------|--------|
| Phone auth for MVP? | Yes / V2 | Orphaned screens exist |
| Social auth for MVP? | Yes / V2 | Cognito config needed |
| Main Street vs Hamburger? | Keep / Rebuild | Major UX change |
| Pricing screens for MVP? | Yes / V2 | New screens needed |
| Certification for MVP? | Yes / V2 | New screens + verification API |

---

## Gap Analysis Reference

See `docs/03-design/SCREEN-SPECS.md` for:
- Full 28-screen inventory
- Client requirements comparison
- Critical/High/Medium gap severity
- Prioritized action plan

---

*Document created: 2026-01-02*
*Synced with: Claude Code plan file*
