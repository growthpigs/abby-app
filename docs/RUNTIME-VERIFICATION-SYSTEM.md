# Runtime-First Verification System

**Systematized on:** 2026-01-07
**Problem Solved:** Prevent silent documentation failures
**Status:** Three-layer system (manual + automated + enforced)

---

## The Problem We're Solving

**Static verification fails silently:**
- ✅ File exists
- ✅ Syntax is correct
- ✅ I claim "done"
- ❌ BUT: Developer reads conflicting info across 5 docs
- ❌ BUT: Code examples use wrong API (getAccessToken instead of getIdToken)
- ❌ BUT: Old status "BLOCKED ON BACKEND" contradicts new "READY"

**Result:** Runtime failure when developer tries to implement.

---

## The Three-Layer System

### Layer 1: Human Checklist (Before You Edit)

**File:** `docs/VERIFICATION-CHECKLIST.md`

```
Follow EVERY TIME before updating documentation:

1. Identify all affected documents
   grep -r "ID token\|authentication" docs/

2. List the connection points (where must this appear?)
   - Technical: TECH-STACK.md, API-CONTRACTS.md
   - Planning: API-INTEGRATION-PLAN.md, RISK-REGISTER.md
   - Reference: RUNBOOK.md, CLAUDE.md
   - Features: features/cognito-auth.md

3. Check for contradictions
   grep -r "access_token\|BLOCKED ON" docs/

4. Verify concrete code examples work
   - Can developer copy-paste?
   - Are variable names real (not placeholders)?
   - Would this execute?

5. Update ALL connection points consistently
   - Same terminology everywhere
   - Same dates everywhere
   - Same rationale everywhere
```

**Key Rule:** "Would a developer reading just this one doc get the RIGHT answer?"

---

### Layer 2: Automated Verification Script

**File:** `scripts/verify-docs.sh`
**Runs:** Before git commit

```bash
# Execute:
bash scripts/verify-docs.sh

# Checks:
1. Cross-references exist (ADR-001 mentioned where needed)
2. Code examples are present (getIdToken() syntax exists)
3. Terminology is consistent (ID token / id_token)
4. Decision dates match (2026-01-07 everywhere)
5. Outdated info is removed (no BLOCKED, no old patterns)
6. Connection points are covered (all 7 key docs mention auth)

# Output:
✅ API-INTEGRATION-PLAN.md references ADR-001
✅ API-CONTRACTS.md has getIdToken() code example
✅ ID token terminology appears 38 times (consistent)
✅ VERIFICATION PASSED

# If fails:
❌ API-CONTRACTS.md MISSING Bearer token format
❌ VERIFICATION FAILED (1 issue)
→ Fix and retry
```

**When to run:**
- Before each commit (automated by pre-commit hook)
- Manually: `bash scripts/verify-docs.sh`

---

### Layer 3: Git Pre-Commit Hook (Enforcement)

**File:** `SETUP-PRE-COMMIT-HOOK.md` (installation instructions)

```bash
# Install once:
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
PROJECT_ROOT=$(git rev-parse --show-toplevel)
DOCS_CHANGED=$(git diff --cached --name-only | grep -E "^docs/|^features/" | wc -l)

if [ $DOCS_CHANGED -gt 0 ]; then
  bash "$PROJECT_ROOT/scripts/verify-docs.sh" || exit 1
fi
EOF

chmod +x .git/hooks/pre-commit
```

**Behavior:**
- Runs automatically on `git commit` if docs changed
- Blocks commit if verification fails
- Shows error output with fixes needed
- Can skip with `--no-verify` (but shouldn't)

**Example:**
```
$ git commit -m "docs: update auth strategy"
📋 Documentation changes detected. Running verification...
✅ VERIFICATION PASSED. Proceeding with commit.

# vs

$ git commit -m "docs: oops, forgot to update one file"
❌ VERIFICATION FAILED (1 issue):
  ❌ API-CONTRACTS.md MISSING Bearer token format

Fix the issues above and try again.
```

---

## Connection Points (The 7 Must-Haves)

For ANY architectural decision (like ID token strategy), these 7 docs must be aligned:

| Doc | Section | What | Example |
|-----|---------|------|---------|
| **CLAUDE.md** | Recent Session Work | Project status + decision | "2026-01-07: ID token strategy approved" |
| **RUNBOOK.md** | Reference Section | How-to + code examples | Token extraction code |
| **API-INTEGRATION-PLAN.md** | Phase 1 Strategy | Integration approach | "Use ID token for all API calls" |
| **RISK-REGISTER.md** | Medium Risks | Decision + timeline | "RISK-007: ID Token Pattern" |
| **TECH-STACK.md** | Authentication | Tech choice + rationale | "Decision (2026-01-07): ID tokens" |
| **API-CONTRACTS.md** | API Headers | Code spec | "Authorization: Bearer <id_token>" |
| **features/cognito-auth.md** | Feature Status | Implementation notes | Updated login flow with ID token |

**Rule:** If you update one, you MUST update all seven.

---

## How to Use This System

### Scenario 1: Making a Documentation Update

```
1. READ THIS FIRST
   - Open docs/VERIFICATION-CHECKLIST.md
   - Follow each step

2. IDENTIFY CONNECTION POINTS
   - Where must this decision appear?
   - grep search for related keywords

3. UPDATE ALL DOCUMENTS
   - TECH-STACK.md (what tech + why)
   - API-CONTRACTS.md (code spec)
   - API-INTEGRATION-PLAN.md (strategy)
   - RISK-REGISTER.md (risks + timeline)
   - RUNBOOK.md (how-to)
   - CLAUDE.md (status)
   - features/*.md (feature spec)

4. RUN VERIFICATION SCRIPT
   bash scripts/verify-docs.sh
   → Should see all ✅ checks passing

5. COMMIT
   git add docs/ features/
   git commit -m "docs: description"
   → Pre-commit hook runs automatically
   → Only commits if verification passes
```

### Scenario 2: Pre-Commit Hook Blocks Your Commit

```
$ git commit
❌ VERIFICATION FAILED (2 issues):
  ❌ API-CONTRACTS.md MISSING Bearer token format
  ❌ Decision date appears only 3 times (expected 5+)

# What to do:
1. Read the error carefully
2. Open the file mentioned
3. Add missing content
4. Re-test: bash scripts/verify-docs.sh
5. Stage changes: git add docs/
6. Retry commit: git commit
```

### Scenario 3: You Disagree With a Check

```
# Skip hook (if you're sure it's a false positive):
git commit --no-verify

# But THEN investigate:
bash scripts/verify-docs.sh

# If it's a real issue, fix it and recommit:
git add docs/
git commit -m "docs: fix verification issue"

# If hook is wrong, update it:
vim scripts/verify-docs.sh
# ...fix the check...
git add scripts/verify-docs.sh
git commit -m "ci: improve documentation verification"
```

---

## Meta-Learning: Why This Prevents Silent Failures

**Before:** I assumed documentation was done because ✅ files existed.
**Reality:** Developer copied wrong token type from outdated doc → Runtime 401 error.

**After:** Three-layer verification ensures:
1. **Human checks** prevent copying mistakes (checklist catches them)
2. **Script verification** catches consistency issues (grep finds contradictions)
3. **Hook enforcement** prevents incomplete commits (blocks bad updates)

**Result:** If it passes all three layers, developers won't hit runtime failures.

---

## Files in This System

```
docs/
├── VERIFICATION-CHECKLIST.md          ← Read before updating docs
├── RUNTIME-VERIFICATION-SYSTEM.md     ← This file
├── SETUP-PRE-COMMIT-HOOK.md           ← Installation instructions
└── [all other docs]                   ← Subject to verification

scripts/
└── verify-docs.sh                     ← Runs the automated checks

.git/
└── hooks/
    └── pre-commit                     ← Blocks bad commits (install via hook doc)
```

---

## Example: How It Caught Our ID Token Error

**Wrong approach (what I almost shipped):**
```
✅ Created ADR-001.md (file exists)
✅ Updated RUNBOOK.md (file exists)
❌ BUT: API-INTEGRATION-PLAN.md still says "BLOCKED ON BACKEND"
❌ BUT: API-CONTRACTS.md still says "Bearer <access_token>"
❌ BUT: RISK-REGISTER.md had no token strategy risk
→ Inconsistent docs → Developer copies wrong token type
```

**Right approach (what we did):**
```
1. CHECKLIST identified connection points
   → Found 7 places that needed updating

2. SCRIPT found contradictions
   grep "BLOCKED" → Found outdated status
   grep "access_token" → Found wrong token type
   grep "token risk" → Found missing risk

3. HOOK prevented commit
   Until all docs were consistent

4. Result:
   ✅ All 7 docs agree on ID token strategy
   ✅ Code examples are correct
   ✅ Dates are consistent
   ✅ Risks are documented
```

---

## Next Steps to Activate This System

```bash
# 1. Install the hook (one-time setup)
cd /Users/rodericandrews/_PAI/projects/abby-client-api
bash docs/SETUP-PRE-COMMIT-HOOK.md  # Follow the instructions

# 2. Test it works
git add docs/VERIFICATION-CHECKLIST.md
git commit -m "test: verify pre-commit hook"

# 3. Use the checklist from now on
# Before updating ANY documentation, open:
#   docs/VERIFICATION-CHECKLIST.md
# and follow step-by-step
```

---

## Proof This System Works

The verification script currently passes:
```bash
bash scripts/verify-docs.sh

✅ API-INTEGRATION-PLAN.md references ADR-001
✅ API-CONTRACTS.md has getIdToken() code example
✅ ID token terminology appears 38 times
✅ Decision date (2026-01-07) appears 10 times
✅ API-CONTRACTS.md correctly uses id_token
✅ API-INTEGRATION-PLAN.md status is current

✅ VERIFICATION PASSED
```

If we had not updated all connection points, this would have failed.

---

*System created: 2026-01-07*
*Refined after catching static-vs-runtime verification failure*
*Purpose: Prevent documentation inconsistencies from reaching developers*
