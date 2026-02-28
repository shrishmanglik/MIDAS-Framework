# Deploying LegalAI Studio to Railway

This guide walks you through deploying the full LegalAI Studio stack (PostgreSQL + Backend + Frontend + ATLAS) to Railway in under 10 minutes.

**Estimated cost:** Free tier covers hobby use. ~$5-15/month for light production use.

---

## Prerequisites

- GitHub account (repo already pushed)
- Railway account (free at [railway.app](https://railway.app))

---

## Step 1: Create a Railway Account

1. Go to [railway.app](https://railway.app)
2. Click **Login** → Sign in with GitHub
3. Authorize Railway to access your GitHub account

---

## Step 2: Install Railway CLI (Optional but Recommended)

```bash
# macOS
brew install railway

# npm (any platform)
npm install -g @railway/cli

# Login
railway login
```

---

## Step 3: Create a New Railway Project

### Option A: Via Dashboard (Easiest)

1. Go to [railway.app/new](https://railway.app/new)
2. Click **"Deploy from GitHub repo"**
3. Select `shrishmanglik/MIDAS-Framework`
4. Railway will detect the monorepo — continue to Step 4

### Option B: Via CLI

```bash
cd /path/to/MIDAS-Framework/legalai-studio
railway init
# Name the project: legalai-studio
```

---

## Step 4: Add PostgreSQL Database

1. In your Railway project dashboard, click **"+ New"** → **"Database"** → **"PostgreSQL"**
2. Railway provisions a PostgreSQL instance automatically
3. Note the **connection string** — it will look like:
   ```
   postgresql://postgres:PASSWORD@HOST:PORT/railway
   ```

---

## Step 5: Deploy the Backend Service

1. Click **"+ New"** → **"GitHub Repo"** → select `shrishmanglik/MIDAS-Framework`
2. In service settings:
   - **Root Directory:** `legalai-studio/backend`
   - **Builder:** Dockerfile
   - **Dockerfile Path:** `Dockerfile`
3. Add these **environment variables** (Settings → Variables):

   | Variable | Value |
   |----------|-------|
   | `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (use Railway's reference variable — click "Add Reference" and select your PostgreSQL service) |
   | `JWT_SECRET` | Generate a random string: `openssl rand -hex 32` |
   | `CORS_ORIGINS` | `https://YOUR-FRONTEND.up.railway.app,https://YOUR-ATLAS.up.railway.app` (update after deploying frontends) |
   | `CLAUDE_API_KEY` | Your Anthropic API key (optional — only needed for Legal Q&A) |

4. **Important:** The `DATABASE_URL` from Railway uses `postgresql://` prefix. The app needs `postgresql+asyncpg://`. Add this variable:

   | Variable | Value |
   |----------|-------|
   | `DATABASE_URL` | Replace `postgresql://` with `postgresql+asyncpg://` in the connection string from Postgres |

   Or use Railway's variable reference with a template:
   ```
   postgresql+asyncpg://${{Postgres.PGUSER}}:${{Postgres.PGPASSWORD}}@${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/${{Postgres.PGDATABASE}}
   ```

5. Click **Deploy**

### After Backend Deploys — Run Migrations

```bash
# Via Railway CLI
railway run -s backend -- alembic upgrade head
railway run -s backend -- python scripts/seed.py

# Or via Railway Shell (Dashboard → Backend Service → Shell tab)
alembic upgrade head
python scripts/seed.py
```

Note the backend URL: `https://YOUR-BACKEND.up.railway.app`

---

## Step 6: Deploy the Frontend Service

1. Click **"+ New"** → **"GitHub Repo"** → select `shrishmanglik/MIDAS-Framework`
2. In service settings:
   - **Root Directory:** `legalai-studio/frontend`
   - **Builder:** Dockerfile
   - **Dockerfile Path:** `Dockerfile`
3. Add environment variables:

   | Variable | Value |
   |----------|-------|
   | `NEXT_PUBLIC_API_URL` | `https://YOUR-BACKEND.up.railway.app/api/v1` |
   | `PORT` | `3004` |

4. Click **Deploy**

Note the frontend URL: `https://YOUR-FRONTEND.up.railway.app`

---

## Step 7: Deploy the ATLAS Service

1. Click **"+ New"** → **"GitHub Repo"** → select `shrishmanglik/MIDAS-Framework`
2. In service settings:
   - **Root Directory:** `legalai-studio/atlas`
   - **Builder:** Dockerfile
   - **Dockerfile Path:** `Dockerfile`
3. Add environment variables:

   | Variable | Value |
   |----------|-------|
   | `NEXT_PUBLIC_API_URL` | `https://YOUR-BACKEND.up.railway.app/api/v1` |
   | `PORT` | `3005` |

4. Click **Deploy**

---

## Step 8: Update Backend CORS

Now that you have the frontend URLs, update the backend's `CORS_ORIGINS`:

1. Go to Backend service → Variables
2. Update `CORS_ORIGINS` to:
   ```
   https://YOUR-FRONTEND.up.railway.app,https://YOUR-ATLAS.up.railway.app
   ```
3. The backend will automatically redeploy

---

## Step 9: Add Custom Domains (Optional)

1. Go to each service → Settings → Domains
2. Click **"+ Custom Domain"**
3. Add your domain (e.g., `legalai.yourdomain.com`)
4. Update DNS records as instructed by Railway
5. Update `CORS_ORIGINS` on the backend to include custom domains
6. Update `NEXT_PUBLIC_API_URL` on frontends if backend gets a custom domain

---

## Step 10: Verify Deployment

```bash
# Health check
curl https://YOUR-BACKEND.up.railway.app/api/v1/health
# Expected: {"status":"ok","database":"connected","version":"0.1.0"}

# CRS Calculator (no auth needed)
curl -X POST https://YOUR-BACKEND.up.railway.app/api/v1/immigration/crs/calculate \
  -H "Content-Type: application/json" \
  -d '{"age":30,"education_level":"masters","first_language_scores":{"reading":9,"writing":9,"listening":9,"speaking":9},"canadian_work_experience":3}'

# API Docs
open https://YOUR-BACKEND.up.railway.app/docs

# Frontend
open https://YOUR-FRONTEND.up.railway.app

# ATLAS
open https://YOUR-ATLAS.up.railway.app
```

---

## CLI Deployment (Alternative — All-in-One)

If you prefer the CLI workflow:

```bash
cd /path/to/MIDAS-Framework/legalai-studio

# 1. Initialize project
railway init -n legalai-studio

# 2. Add PostgreSQL
railway add --plugin postgresql

# 3. Link and deploy backend
railway service create backend
railway link --service backend
railway variables set \
  DATABASE_URL="postgresql+asyncpg://\${{Postgres.PGUSER}}:\${{Postgres.PGPASSWORD}}@\${{Postgres.PGHOST}}:\${{Postgres.PGPORT}}/\${{Postgres.PGDATABASE}}" \
  JWT_SECRET="$(openssl rand -hex 32)" \
  CORS_ORIGINS="*"
railway up --service backend -d backend

# 4. Deploy frontend
railway service create frontend
railway link --service frontend
BACKEND_URL=$(railway domain --service backend)
railway variables set \
  NEXT_PUBLIC_API_URL="https://${BACKEND_URL}/api/v1" \
  PORT=3004
railway up --service frontend -d frontend

# 5. Deploy ATLAS
railway service create atlas
railway link --service atlas
railway variables set \
  NEXT_PUBLIC_API_URL="https://${BACKEND_URL}/api/v1" \
  PORT=3005
railway up --service atlas -d atlas

# 6. Generate domains
railway domain --service backend
railway domain --service frontend
railway domain --service atlas

# 7. Run migrations
railway run --service backend -- alembic upgrade head
railway run --service backend -- python scripts/seed.py

# 8. Update CORS with actual frontend domains
FRONTEND_URL=$(railway domain --service frontend)
ATLAS_URL=$(railway domain --service atlas)
railway variables set --service backend \
  CORS_ORIGINS="https://${FRONTEND_URL},https://${ATLAS_URL}"
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Backend can't connect to DB | Verify `DATABASE_URL` uses `postgresql+asyncpg://` prefix |
| CORS errors in browser | Update `CORS_ORIGINS` on backend with exact frontend URLs |
| Frontend shows "Network Error" | Verify `NEXT_PUBLIC_API_URL` points to backend URL with `/api/v1` |
| Build fails on frontend | Ensure `NEXT_PUBLIC_API_URL` is set as a build-time variable |
| 502 Bad Gateway | Check service logs; likely startup crash. Verify env vars are set |

---

## Architecture on Railway

```
┌─────────────────────────────────────────────────────────┐
│                    Railway Project                       │
│                                                         │
│  ┌──────────┐    ┌──────────────┐    ┌───────────────┐ │
│  │ PostgreSQL│◄───│   Backend    │◄───│   Frontend    │ │
│  │   (DB)    │    │  (FastAPI)   │    │  (Next.js)    │ │
│  │           │    │  :8004       │    │  :3004        │ │
│  └──────────┘    └──────┬───────┘    └───────────────┘ │
│                         │                               │
│                         │            ┌───────────────┐ │
│                         └────────────│    ATLAS       │ │
│                                      │  (Next.js)    │ │
│                                      │  :3005        │ │
│                                      └───────────────┘ │
└─────────────────────────────────────────────────────────┘
```

Each service gets a public `*.up.railway.app` URL automatically.
