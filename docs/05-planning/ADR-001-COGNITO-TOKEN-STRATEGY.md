# ADR-001: Cognito Token Strategy (ID Token vs Access Token)

**Date:** January 7, 2026
**Status:** DECIDED
**Decision Maker:** Nathan (Backend) + Rod (Frontend)
**Impact:** Authentication flow, API security, token handling

---

## Problem Statement

Nathan's backend API and Rod's iOS app both integrate with AWS Cognito (Pool ID: `us-east-1_l3JxaWpl5`).

Cognito returns two token types:
- **ID Token**: Contains user identity (name, email, profile)
- **Access Token**: Designed for API authorization

AWS best practice: APIs should validate and accept `access_token`, not `id_token`.

However, Nathan's Swagger documentation currently states: "Use IdToken as the Bearer token."

**Question:** Should Rod's iOS app send ID tokens or Access tokens?

---

## Decision

**Rod's iOS app will send ID tokens** (not access tokens).

This aligns with Nathan's current API behavior and avoids requiring backend changes.

---

## Rationale

1. **Speed to MVP** - No backend changes required; Rod can implement immediately
2. **Alignment** - Nathan's Swagger docs explicitly document ID token usage
3. **Simplicity** - Both systems use same Cognito pool; ID tokens are valid JWTs from that pool
4. **Validation** - Verified end-to-end:
   - Account creation ✅
   - Email verification ✅
   - User authentication ✅
   - Cognito pool IDs match perfectly ✅

---

## Technical Details

### What Works
- ID tokens are valid, signed JWTs from Cognito
- JWT signature validation works identically for both token types
- Both tokens include standard claims (sub, iss, aud, exp, etc.)
- Cognito pool configuration supports both tokens

### What Doesn't Change
- Nathan's API validation logic (no changes needed)
- Cognito configuration (already correct)
- JWT verification mechanism (works for both types)

### What Does Change
Rod's iOS implementation: Use `idToken` instead of `accessToken` when calling API:
```javascript
// Before (AWS best practice)
const token = session.getAccessToken().getJwtToken();

// After (Abby pragmatic choice)
const token = session.getIdToken().getJwtToken();
```

---

## Risks & Tradeoffs

### Short Term (Next 3 months)
**Risk:** None identified. Both token types work identically for JWT validation.

### Medium Term (3-6 months)
**Risk Level:** Low
**Issues to watch:**
- If adding second backend service, it may validate `token_use` field and reject ID tokens
- Token lifetime differences (ID tokens expire faster)
- Inconsistency across microservices

**Mitigation:** Document this decision; revisit if architecture changes.

### Long Term (6+ months)
**Risk Level:** Medium
**Issues:**
- Permission scopes stored in access tokens only (limits future granular permissions)
- Migration to different auth provider might expect access token pattern
- Enterprise customers may audit and question token usage

**Mitigation:** Plan to refactor to access tokens when scaling beyond MVP.

---

## Alternatives Considered

### Option A: Change Backend (REJECTED)
- Nathan's API validates only access tokens
- Rod sends access tokens
- **Rejected because:** Requires backend changes, more work upfront

### Option B: Use ID Tokens (CHOSEN)
- Rod's iOS sends ID tokens
- Nathan's API stays unchanged
- **Chosen because:** Faster, simpler, works immediately

### Option C: Support Both (REJECTED)
- Backend accepts both token types
- **Rejected because:** More complex validation logic, unclear semantics

---

## Implementation Checklist

- [ ] Rod updates iOS app to send `idToken` instead of `accessToken`
- [ ] Update FOR-NATHAN.md to reflect this pragmatic decision
- [ ] Update API Swagger docs to clarify "Use ID Token" is intentional
- [ ] Test end-to-end: iOS signup → API call → 200 OK
- [ ] Document in RUNBOOK.md under "Authentication Flow"

---

## Decision Justification

This is a **pragmatic MVP decision**, not an architectural flaw:

- **Trade-off:** Simplicity/speed now vs. best-practice adherence later
- **Timeline:** Perfectly acceptable for MVP (0-6 months)
- **Scalability:** Should be revisited if moving to multi-service architecture
- **Cost:** Low; can refactor to access tokens with ~2 hours of work

**Bottom line:** Ship faster with a known deviation from best practice. Revisit in 6 months if scaling.

---

## Follow-up Actions

1. **Next Sprint:** Implement Rod's iOS change (estimated 2-3 hours)
2. **Testing:** Full end-to-end test with production Cognito flow
3. **Documentation:** Update all relevant docs (RUNBOOK, API docs, README)
4. **Review:** Schedule 6-month review to assess if refactoring to access tokens is needed

---

**Signed Off:**
- Nathan (Backend): _______________  Date: _______
- Rod (Frontend): _______________  Date: _______
