# Installing the Pre-Commit Hook

**Purpose:** Automatically run documentation verification before each commit

## Installation

Copy and run these commands:

```bash
cd /Users/rodericandrews/_PAI/projects/abby-client-api

# Create the hook file
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Pre-commit hook: Verify documentation before allowing commit
# Installed: 2026-01-07
# Purpose: Prevent commits with inconsistent documentation

set -e

PROJECT_ROOT=$(git rev-parse --show-toplevel)
DOCS_CHANGED=$(git diff --cached --name-only | grep -E "^docs/|^features/" | wc -l)

if [ $DOCS_CHANGED -gt 0 ]; then
  echo "📋 Documentation changes detected. Running verification..."
  echo ""

  if bash "$PROJECT_ROOT/scripts/verify-docs.sh"; then
    echo ""
    echo "✅ Documentation verification passed. Proceeding with commit."
    exit 0
  else
    echo ""
    echo "❌ Documentation verification FAILED."
    echo "Fix the issues above and try again."
    echo ""
    echo "To skip verification (NOT RECOMMENDED):"
    echo "  git commit --no-verify"
    exit 1
  fi
else
  exit 0
fi
EOF

# Make it executable
chmod +x .git/hooks/pre-commit

# Verify installation
echo "✅ Pre-commit hook installed"
ls -la .git/hooks/pre-commit
```

## Testing the Hook

```bash
# Try committing a docs change
git add docs/VERIFICATION-CHECKLIST.md
git commit -m "test: verify pre-commit hook"

# You should see:
# 📋 Documentation changes detected. Running verification...
# ... verification output ...
# ✅ Documentation verification passed. Proceeding with commit.
```

## How It Works

1. **On each `git commit`**, the hook runs automatically
2. **If docs files changed** → Runs `scripts/verify-docs.sh`
3. **If verification passes** → Commit proceeds normally
4. **If verification fails** → Commit is blocked with error message
5. **To skip** (not recommended): `git commit --no-verify`

## What Gets Checked

- ✅ Cross-references (ADR-001 mentioned everywhere needed)
- ✅ Code examples (getIdToken() syntax is present)
- ✅ Terminology (ID token vs id_token consistency)
- ✅ Decision dates (2026-01-07 appears consistently)
- ✅ Outdated info (BLOCKED, old patterns removed)
- ✅ Connection points (All 7 key docs mention auth)

## If Hook Breaks

```bash
# Temporarily disable
git commit --no-verify

# Then investigate
bash scripts/verify-docs.sh

# Fix the issues, then retry
git add .
git commit -m "docs: fix verification failures"
```

---

*Created: 2026-01-07 as part of "Runtime-First Verification Systemization"*
