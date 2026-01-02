# ABBY MVP - Development Roadmap

**Last Updated:** 2026-01-02
**Status:** Gap Closure Phase
**Drive Mirror:** [ABBY MVP - Roadmap Breakdown](https://docs.google.com/spreadsheets/d/1LTSmWsXBE5x5Kv7DLhfhVkX89M01qdViP3FnDPOXMcg/edit)

---

## Project Timeline

| Phase | Start | Status | Description |
|-------|-------|--------|-------------|
| Phase 0: Foundation | Dec 20, 2024 | ✅ COMPLETE | VibeMatrix, AbbyOrb, Glass UI, Auth |
| Phase 1: Legal Blockers | Jan 2, 2026 | ✅ COMPLETE | 18+ checkbox, GDPR delete |
| Phase 2: Profile Submission | Jan 2, 2026 | ✅ COMPLETE | Fix getProfilePayload() call |
| Phase 3: State Persistence | Jan 2, 2026 | ✅ COMPLETE | Interview + Onboarding recovery |
| Phase 4: UX Fixes | - | ⏳ PENDING | ProfileScreen, RevealScreen, ErrorModal |
| Phase 5: Social Auth | - | ⏳ PENDING | Apple/Google/Facebook buttons |
| Phase 6: Design Alignment | - | ⏳ PENDING | Gender options, Nickname, Age slider |
| Phase 7: API Integration | - | ⏳ PENDING | Matches, Photos, Token refresh |
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

## Phase 4: UX Fixes

### Tasks
| Task | File | Status | Owner |
|------|------|--------|-------|
| 4.1 Create ProfileScreen | ProfileScreen.tsx (new) | ⏳ | Chi |
| 4.2 Fix post-reveal dead end | RevealScreen.tsx | ⏳ | Chi |
| 4.3 Add network error UI | ErrorModal.tsx (new) | ⏳ | Chi |

### Acceptance Criteria
- [ ] Users can edit profile after onboarding
- [ ] RevealScreen has "Message", "More Matches", "View All" buttons
- [ ] Network errors show retry/dismiss modal

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

## Phase 7: API Integration

### Tasks
| Task | File | Status | Owner |
|------|------|--------|-------|
| 7.1 Integrate Matches API | MatchesScreen.tsx | ⏳ | Chi |
| 7.2 Integrate Photos API | PhotosScreen.tsx | ⏳ | Chi |
| 7.3 Token refresh | secureFetch.ts | ⏳ | Chi |

### Acceptance Criteria
- [ ] Matches load from `/v1/matches/candidates`
- [ ] Photos upload/delete working
- [ ] 401 errors trigger token refresh + retry

---

## Phase 8: Polish

### Tasks
| Task | File | Status | Owner |
|------|------|--------|-------|
| 8.1 Accessibility | All screens | ⏳ | Chi |
| 8.2 Error handling | All services | ⏳ | Chi |

### Acceptance Criteria
- [ ] All touch targets 44x44 minimum
- [ ] All buttons have accessibilityLabel
- [ ] Errors display consistently

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
