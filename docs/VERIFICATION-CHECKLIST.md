# Documentation Verification Checklist

**Use this checklist BEFORE updating any living document. Don't skip steps.**

---

## Pre-Update Verification (Before Editing)

- [ ] **Identify all affected documents** - What other docs reference this decision?
  - Search: `grep -r "ID token\|authentication\|jwt" docs/`
  - Search: `grep -r "API Integration\|Auth Strategy" docs/`

- [ ] **List the connection points** - Where must this decision appear?
  - Technical docs? (TECH-STACK.md, API-CONTRACTS.md)
  - Planning docs? (API-INTEGRATION-PLAN.md, RISK-REGISTER.md)
  - Reference docs? (RUNBOOK.md, CLAUDE.md)
  - Feature docs? (features/cognito-auth.md)

- [ ] **Check for contradictions** - Are there conflicting statements?
  - Search for old patterns: `grep -r "access_token\|AccessToken" docs/`
  - Search for deprecated info: `grep -r "ElevenLabs\|BLOCKED ON" docs/`

---

## During Update: Runtime Verification

For EACH document updated:

- [ ] **Concrete Code Examples** - Does the code actually work?
  - Example shows variable names that exist (not placeholders)
  - Extraction: `session.getIdToken()` (matches AuthService.ts)
  - Usage: `Bearer ${idToken}` (shows proper string interpolation)
  - Test: Could a developer copy-paste this and it would work?

- [ ] **Cross-References** - Do links/file paths actually exist?
  - `grep -l "ADR-001-COGNITO-TOKEN-STRATEGY.md"` - Does file exist?
  - `grep -l "RUNBOOK.md" docs/05-planning/API-INTEGRATION-PLAN.md` - Is reference correct?
  - Check: File exists at mentioned path
  - Check: Section mentioned actually exists in target file

- [ ] **Decision Consistency** - Same decision stated same way everywhere?
  - TECH-STACK: "ID tokens"
  - API-CONTRACTS: "id_token"
  - RUNBOOK: "ID token"
  - Must be consistent terminology (not "ID tokens" vs "IdTokens" vs "id_tokens")

- [ ] **Date Consistency** - Same dates mentioned consistently?
  - Decision date: 2026-01-07 (everywhere)
  - Timeline: 0-3 months, 3-6 months (same in each doc)
  - Check: `grep "2026-01-07\|2026-01-06\|2026-01-04" docs/ -r | wc -l`

- [ ] **Outdated Info Removed** - No contradicting old information?
  - Search for: "BLOCKED ON", "ERROR", "FAILED" in docs
  - Old decisions: "use access_token" (should be removed/updated)
  - Deprecated: "ElevenLabs" (mark as legacy, don't delete)

---

## Post-Update: Pre-Commit Verification

**Run this bash script before `git commit`:**

```bash
#!/bin/bash
# docs-verify.sh

echo "🔍 Running documentation verification..."

# 1. Check cross-references
echo "✓ Checking cross-references..."
if ! grep -q "ADR-001-COGNITO-TOKEN-STRATEGY.md" docs/05-planning/API-INTEGRATION-PLAN.md; then
  echo "❌ ADR-001 not referenced in API-INTEGRATION-PLAN.md"
  exit 1
fi

# 2. Check code examples parse
echo "✓ Checking code examples..."
if ! grep -q "session.getIdToken().getJwtToken()" docs/04-technical/API-CONTRACTS.md; then
  echo "❌ Missing getIdToken() example in API-CONTRACTS.md"
  exit 1
fi

# 3. Check consistency
echo "✓ Checking terminology consistency..."
ID_TOKEN_COUNT=$(grep -r "ID token" docs/ | wc -l)
if [ $ID_TOKEN_COUNT -lt 5 ]; then
  echo "⚠️  Warning: 'ID token' appears only $ID_TOKEN_COUNT times (check consistency)"
fi

# 4. Check decision dates
echo "✓ Checking decision dates..."
DECISION_DATES=$(grep -r "2026-01-07" docs/ | wc -l)
if [ $DECISION_DATES -lt 3 ]; then
  echo "⚠️  Warning: Decision date 2026-01-07 appears only $DECISION_DATES times"
fi

# 5. Check for contradictions
echo "✓ Checking for contradictions..."
if grep -r "access_token" docs/04-technical/API-CONTRACTS.md | grep -v "# "; then
  echo "❌ Old access_token references found in API-CONTRACTS.md"
  exit 1
fi

echo "✅ All documentation verifications passed!"
exit 0
```

---

## Connection Points Checklist

**For authentication decisions, always verify these 6 connection points:**

- [ ] **CLAUDE.md** - Project status updated with decision
- [ ] **RUNBOOK.md** - Operational procedures updated
- [ ] **API-INTEGRATION-PLAN.md** - Integration strategy reflects decision
- [ ] **RISK-REGISTER.md** - Risk documented with timeline
- [ ] **TECH-STACK.md** - Technology choice explained with rationale
- [ ] **API-CONTRACTS.md** - Code contracts show correct usage
- [ ] **features/cognito-auth.md** - Feature spec updated
- [ ] **handover.md** - Session context recorded
- [ ] **features/INDEX.md** - Status tracking updated

**For each: Ask "Would a developer reading this get the RIGHT answer?"**

---

## Example: "Fail Fast" Scenario

**WRONG (Silent failure waiting to happen):**
```
✅ Created ADR-001.md (file exists)
✅ Updated RUNBOOK.md (file exists)
✗ BUT: API-INTEGRATION-PLAN.md still says "BLOCKED ON BACKEND"
✗ BUT: API-CONTRACTS.md still says "Bearer <access_token>"
✗ BUT: RISK-REGISTER.md has no token strategy risk
→ Developer reads multiple docs, gets conflicting info, implements wrong pattern
→ Fails at runtime when token is rejected by API
```

**RIGHT (Caught immediately):**
```
Running verification script before commit:
  ✗ "BLOCKED ON BACKEND" still in API-INTEGRATION-PLAN.md
  ✗ "access_token" still in API-CONTRACTS.md
  → Fix before commit
  → Comprehensive update across all 6 connection points
  → Commit only when all files agree
```

---

## Remember: Execution vs Assumption

- ❌ "File exists" → Not verification
- ❌ "Syntax looks correct" → Not verification
- ✅ "Bash command confirms content" → Verification
- ✅ "Developer could copy example and it works" → Verification

**Before claiming "done": Run the verification script. Show the output.**

---

*Created: 2026-01-07 (after catching static verification failure)*
*Purpose: Prevent silent failures in documentation updates*
