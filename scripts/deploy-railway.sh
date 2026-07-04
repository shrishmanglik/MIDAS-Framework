#!/usr/bin/env bash
set -euo pipefail

# LegalAI Studio — Railway Deployment Script
# Prerequisites: railway CLI installed and authenticated (railway login)

echo "=== LegalAI Studio — Railway Deployment ==="
echo ""

# Check railway CLI
if ! command -v railway &> /dev/null; then
    echo "ERROR: Railway CLI not found. Install with: npm install -g @railway/cli"
    exit 1
fi

# Check authentication
if ! railway whoami &> /dev/null 2>&1; then
    echo "ERROR: Not logged in. Run: railway login"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

echo "[1/7] Creating Railway project..."
railway init -n legalai-studio 2>/dev/null || echo "Project already exists, linking..."

echo "[2/7] Adding PostgreSQL..."
railway add --plugin postgresql 2>/dev/null || echo "PostgreSQL already provisioned"

echo "[3/7] Deploying backend..."
railway service create backend 2>/dev/null || true
railway link --service backend

JWT_SECRET=$(openssl rand -hex 32)
railway variables set \
    JWT_SECRET="$JWT_SECRET" \
    CORS_ORIGINS="*" \
    DATABASE_URL='postgresql+asyncpg://${{Postgres.PGUSER}}:${{Postgres.PGPASSWORD}}@${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/${{Postgres.PGDATABASE}}'

railway up --service backend -d backend --detach
echo "Backend deploying..."

# Wait for backend to be ready
echo "Waiting for backend to deploy (this may take 2-3 minutes)..."
sleep 30

# Generate backend domain
BACKEND_DOMAIN=$(railway domain --service backend 2>/dev/null || echo "")
if [ -z "$BACKEND_DOMAIN" ]; then
    echo "Generating backend domain..."
    BACKEND_DOMAIN=$(railway domain --service backend)
fi
BACKEND_URL="https://${BACKEND_DOMAIN}"
echo "Backend URL: $BACKEND_URL"

echo "[4/7] Deploying frontend..."
railway service create frontend 2>/dev/null || true
railway link --service frontend
railway variables set \
    NEXT_PUBLIC_API_URL="${BACKEND_URL}/api/v1" \
    PORT="3004"
railway up --service frontend -d frontend --detach

FRONTEND_DOMAIN=$(railway domain --service frontend 2>/dev/null || echo "")
if [ -z "$FRONTEND_DOMAIN" ]; then
    FRONTEND_DOMAIN=$(railway domain --service frontend)
fi
echo "Frontend URL: https://${FRONTEND_DOMAIN}"

echo "[5/7] Deploying ATLAS..."
railway service create atlas 2>/dev/null || true
railway link --service atlas
railway variables set \
    NEXT_PUBLIC_API_URL="${BACKEND_URL}/api/v1" \
    PORT="3005"
railway up --service atlas -d atlas --detach

ATLAS_DOMAIN=$(railway domain --service atlas 2>/dev/null || echo "")
if [ -z "$ATLAS_DOMAIN" ]; then
    ATLAS_DOMAIN=$(railway domain --service atlas)
fi
echo "ATLAS URL: https://${ATLAS_DOMAIN}"

echo "[6/7] Updating backend CORS..."
railway link --service backend
railway variables set \
    CORS_ORIGINS="https://${FRONTEND_DOMAIN},https://${ATLAS_DOMAIN}"

echo "[7/7] Running migrations and seeding..."
echo "Waiting for backend to be ready..."
sleep 60

railway run --service backend -- alembic upgrade head 2>/dev/null || echo "Migrations may need manual run (backend still starting)"
railway run --service backend -- python scripts/seed.py 2>/dev/null || echo "Seeding may need manual run"

echo ""
echo "=== Deployment Complete ==="
echo ""
echo "Backend API:  ${BACKEND_URL}"
echo "API Docs:     ${BACKEND_URL}/docs"
echo "Frontend:     https://${FRONTEND_DOMAIN}"
echo "ATLAS:        https://${ATLAS_DOMAIN}"
echo ""
echo "If migrations didn't run, execute manually:"
echo "  railway run --service backend -- alembic upgrade head"
echo "  railway run --service backend -- python scripts/seed.py"
