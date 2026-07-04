#!/usr/bin/env bash
set -euo pipefail

#
# Creates the standalone legalai-studio GitHub repo from the MIDAS-Framework subtree.
# Run this from your local machine.
#
# Usage:
#   bash create-legalai-repo.sh [github-username]
#
# Example:
#   bash create-legalai-repo.sh shrishmanglik
#

GITHUB_USER="${1:-shrishmanglik}"
REPO_NAME="legalai-studio"
BRANCH="claude/create-chemai-studio-repo-taNDo"

echo "=== Creating standalone ${REPO_NAME} repo ==="
echo ""

# Check prerequisites
for cmd in git gh; do
    if ! command -v "$cmd" &> /dev/null; then
        echo "ERROR: $cmd not found. Install it first."
        [ "$cmd" = "gh" ] && echo "  brew install gh  OR  npm install -g @github/cli"
        exit 1
    fi
done

if ! gh auth status &> /dev/null 2>&1; then
    echo "ERROR: Not logged in to GitHub. Run: gh auth login"
    exit 1
fi

# Step 1: Create the new GitHub repo
echo "[1/5] Creating GitHub repo: ${GITHUB_USER}/${REPO_NAME}..."
gh repo create "${GITHUB_USER}/${REPO_NAME}" \
    --public \
    --description "LegalAI Studio — Full-stack legal intelligence platform with immigration CRS calculator, contract review, document generation, compliance tracking, and AI-powered legal Q&A" \
    || echo "Repo may already exist, continuing..."

# Step 2: Clone the subtree branch from MIDAS-Framework
echo "[2/5] Cloning subtree from MIDAS-Framework..."
TEMP_DIR=$(mktemp -d)
git clone --single-branch --branch "${BRANCH}" \
    "https://github.com/${GITHUB_USER}/MIDAS-Framework.git" \
    "${TEMP_DIR}"

# Step 3: Re-initialize as a fresh repo
echo "[3/5] Setting up fresh repo..."
cd "${TEMP_DIR}"
rm -rf .git
git init -b main
git add -A
git commit -m "feat: LegalAI Studio — full-stack legal intelligence platform

Complete project with 208 files across 3 applications:

Backend (FastAPI, port 8004):
- CRS calculator with deterministic IRCC scoring rules
- Contract review engine with clause extraction and risk scoring
- Document generator with Jinja2 templates
- Employment compliance tracker (Ontario ESA)
- Legal Q&A with Claude API and cache-first strategy
- Disclaimer middleware for all legal endpoints
- SQLAlchemy async ORM with Alembic migrations
- Unit and integration tests

Frontend — LegalAI Dashboard (Next.js 14, port 3004):
- 5-module professional dashboard (Immigration, Contracts, Documents, Compliance, Legal Q&A)
- shadcn/ui components with dark cosmic theme
- SWR data fetching, react-hook-form + Zod validation

Frontend — ATLAS Portal (Next.js 14, port 3005):
- Mobile-first immigration newcomer portal
- CRS calculator wizard, pathway matching, settlement checklist

Infrastructure:
- Docker Compose with 4 services (PostgreSQL, Backend, Frontend, ATLAS)
- Railway deployment configs and automated deploy script
- Dev overrides with hot-reload"

# Step 4: Push to the new repo
echo "[4/5] Pushing to ${GITHUB_USER}/${REPO_NAME}..."
git remote add origin "https://github.com/${GITHUB_USER}/${REPO_NAME}.git"
git push -u origin main

# Step 5: Clean up
echo "[5/5] Cleaning up..."
cd -
rm -rf "${TEMP_DIR}"

echo ""
echo "=== Done! ==="
echo ""
echo "Your repo is live at: https://github.com/${GITHUB_USER}/${REPO_NAME}"
echo ""
echo "Next steps:"
echo "  1. Clone it:  git clone https://github.com/${GITHUB_USER}/${REPO_NAME}.git"
echo "  2. Deploy it: cd ${REPO_NAME} && bash scripts/deploy-railway.sh"
echo "  3. Or see:    DEPLOY.md for manual deployment instructions"
