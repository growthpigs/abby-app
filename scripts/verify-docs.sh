#!/bin/bash
# verify-docs.sh
# Run BEFORE git commit to catch documentation inconsistencies
# Usage: ./scripts/verify-docs.sh

set -e

PROJECT_ROOT="$(git rev-parse --show-toplevel)"
DOCS_DIR="$PROJECT_ROOT/docs"
FAILED=0

echo "==============================================="
echo "   DOCUMENTATION VERIFICATION (Runtime-First)"
echo "==============================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_pass() {
  echo -e "${GREEN}✅${NC} $1"
}

check_fail() {
  echo -e "${RED}❌${NC} $1"
  FAILED=$((FAILED + 1))
}

check_warn() {
  echo -e "${YELLOW}⚠️${NC} $1"
}

# ============================================================
# 1. Cross-Reference Verification
# ============================================================
echo "1. CROSS-REFERENCES"
echo "---"

# Check ADR-001 is referenced in key docs
if grep -q "ADR-001-COGNITO-TOKEN-STRATEGY" "$DOCS_DIR/05-planning/API-INTEGRATION-PLAN.md"; then
  check_pass "API-INTEGRATION-PLAN.md references ADR-001"
else
  check_fail "API-INTEGRATION-PLAN.md MISSING ADR-001 reference"
fi

if grep -q "ADR-001-COGNITO-TOKEN-STRATEGY" "$DOCS_DIR/06-reference/RUNBOOK.md"; then
  check_pass "RUNBOOK.md references ADR-001"
else
  check_fail "RUNBOOK.md MISSING ADR-001 reference"
fi

if grep -q "ADR-001" "$DOCS_DIR/04-technical/TECH-STACK.md"; then
  check_pass "TECH-STACK.md references ADR-001"
else
  check_fail "TECH-STACK.md MISSING ADR-001 reference"
fi

echo ""

# ============================================================
# 2. Code Example Verification
# ============================================================
echo "2. CODE EXAMPLES (Can developers execute this?)"
echo "---"

# Check getIdToken() example exists
if grep -q "session.getIdToken().getJwtToken()" "$DOCS_DIR/04-technical/API-CONTRACTS.md"; then
  check_pass "API-CONTRACTS.md has getIdToken() code example"
else
  check_fail "API-CONTRACTS.md MISSING getIdToken() example"
fi

# Check Bearer token format documented
if grep -q "Authorization: Bearer" "$DOCS_DIR/04-technical/API-CONTRACTS.md"; then
  check_pass "API-CONTRACTS.md documents Bearer token format"
else
  check_fail "API-CONTRACTS.md MISSING Bearer token format"
fi

# Check token extraction code in RUNBOOK
if grep -q "const idToken = session.getIdToken" "$DOCS_DIR/06-reference/RUNBOOK.md"; then
  check_pass "RUNBOOK.md documents token extraction"
else
  check_fail "RUNBOOK.md MISSING token extraction code"
fi

echo ""

# ============================================================
# 3. Terminology Consistency
# ============================================================
echo "3. TERMINOLOGY CONSISTENCY"
echo "---"

# Count "ID token" references
ID_TOKEN_COUNT=$(grep -r "ID token" "$DOCS_DIR/" --include="*.md" | wc -l)
if [ $ID_TOKEN_COUNT -ge 5 ]; then
  check_pass "ID token terminology appears $ID_TOKEN_COUNT times (consistent)"
else
  check_warn "ID token terminology appears only $ID_TOKEN_COUNT times (check coverage)"
fi

# Count "id_token" references (in code examples)
ID_TOKEN_CODE=$(grep -r "id_token\|idToken" "$DOCS_DIR/" --include="*.md" | wc -l)
if [ $ID_TOKEN_CODE -ge 3 ]; then
  check_pass "id_token code references appear $ID_TOKEN_CODE times"
else
  check_warn "id_token code references only $ID_TOKEN_CODE times"
fi

# Check for conflicting "access_token" references in API-CONTRACTS
if grep -q "Bearer.*access_token" "$DOCS_DIR/04-technical/API-CONTRACTS.md"; then
  check_fail "API-CONTRACTS.md still mentions access_token (should be id_token)"
else
  check_pass "API-CONTRACTS.md correctly uses id_token (not access_token)"
fi

echo ""

# ============================================================
# 4. Decision Date Consistency
# ============================================================
echo "4. DECISION DATE CONSISTENCY"
echo "---"

DECISION_DATE_COUNT=$(grep -r "2026-01-07" "$DOCS_DIR/" --include="*.md" | wc -l)
if [ $DECISION_DATE_COUNT -ge 3 ]; then
  check_pass "Decision date (2026-01-07) appears $DECISION_DATE_COUNT times"
else
  check_warn "Decision date (2026-01-07) only appears $DECISION_DATE_COUNT times (expected 5+)"
fi

echo ""

# ============================================================
# 5. Outdated Information Check
# ============================================================
echo "5. OUTDATED INFORMATION"
echo "---"

# Check for "BLOCKED ON BACKEND" (outdated status)
if grep -q "BLOCKED ON BACKEND" "$DOCS_DIR/05-planning/API-INTEGRATION-PLAN.md"; then
  check_fail "API-INTEGRATION-PLAN.md still says 'BLOCKED ON BACKEND' (outdated)"
else
  check_pass "API-INTEGRATION-PLAN.md status is current"
fi

# Check for old ElevenLabs references in auth docs
if grep -q "ElevenLabs" "$DOCS_DIR/04-technical/API-CONTRACTS.md"; then
  check_warn "API-CONTRACTS.md mentions ElevenLabs (OK if marked legacy)"
else
  check_pass "API-CONTRACTS.md doesn't mention ElevenLabs"
fi

echo ""

# ============================================================
# 6. Connection Points Coverage
# ============================================================
echo "6. CONNECTION POINTS COVERAGE"
echo "---"

REQUIRED_DOCS=(
  "CLAUDE.md"
  "06-reference/RUNBOOK.md"
  "05-planning/API-INTEGRATION-PLAN.md"
  "05-planning/RISK-REGISTER.md"
  "04-technical/TECH-STACK.md"
  "04-technical/API-CONTRACTS.md"
  "../features/cognito-auth.md"
)

UPDATED_COUNT=0
for doc in "${REQUIRED_DOCS[@]}"; do
  # Check if doc mentions authentication/token/cognito (indicating it's been updated)
  if grep -qi "cognito\|token\|authentication" "$PROJECT_ROOT/$doc" 2>/dev/null; then
    check_pass "$(basename $doc) mentions authentication/tokens"
    UPDATED_COUNT=$((UPDATED_COUNT + 1))
  else
    check_warn "$(basename $doc) doesn't mention authentication (check if needed)"
  fi
done

echo ""
echo "Updated ${UPDATED_COUNT}/7 key documents"

echo ""

# ============================================================
# Results
# ============================================================
echo "==============================================="
if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ VERIFICATION PASSED${NC}"
  echo "All documentation checks passed. Safe to commit."
  exit 0
else
  echo -e "${RED}❌ VERIFICATION FAILED ($FAILED issues)${NC}"
  echo "Fix the issues above before committing."
  exit 1
fi
