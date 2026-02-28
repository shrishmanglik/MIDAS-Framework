# LegalAI Studio

A modular legal intelligence platform providing immigration pathway analysis, contract review, document generation, compliance tracking, and AI-powered legal research.

> **Disclaimer:** This platform provides legal information for educational and informational purposes only. It does not constitute legal advice. For guidance on your specific situation, please consult a licensed legal professional in your jurisdiction.

## Architecture

| Service | Technology | Port | Description |
|---------|-----------|------|-------------|
| **Backend** | FastAPI + Python 3.11 | 8004 | REST API with 5 domain modules |
| **Frontend** | Next.js 14 + TypeScript | 3004 | LegalAI professional dashboard |
| **ATLAS** | Next.js 14 + TypeScript | 3005 | Immigration newcomer portal |
| **Database** | PostgreSQL 15 | 5432 | Persistent data store |

## Modules

1. **Immigration Pathway Analyzer** — CRS score calculator, PNP program matching, post-landing checklist
2. **Contract Review Engine** — PDF/DOCX upload, clause extraction, risk scoring, missing clause detection
3. **Document Generator** — Template-based legal document creation (NDAs, agreements)
4. **Compliance Tracker** — Employment standards lookup, compliance checklists by jurisdiction
5. **Legal Q&A** — AI-powered legal research with statute references and caching

## Quick Start

```bash
# 1. Copy environment file
cp .env.example .env
# Edit .env with your values (at minimum set JWT_SECRET)

# 2. Start all services
docker-compose up -d

# 3. Run database migrations
docker-compose exec backend alembic upgrade head

# 4. Seed development data
docker-compose exec backend python scripts/seed.py

# 5. Open applications
# LegalAI Dashboard: http://localhost:3004
# ATLAS Portal:      http://localhost:3005
# API Docs:          http://localhost:8004/docs
```

## Development

```bash
# Start with hot-reload
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Run backend tests
docker-compose exec backend pytest -v

# Run with coverage
docker-compose exec backend pytest --cov=app --cov-report=term-missing
```

## Project Structure

```
legalai-studio/
├── backend/          # FastAPI application
│   ├── app/
│   │   ├── api/      # Route handlers
│   │   ├── core/     # Config, security, database
│   │   ├── data/     # Seed data and templates
│   │   ├── middleware/# Disclaimer injection
│   │   ├── models/   # SQLAlchemy ORM models
│   │   ├── schemas/  # Pydantic request/response models
│   │   └── services/ # Business logic
│   └── tests/
├── frontend/         # LegalAI dashboard (Next.js)
└── atlas/            # ATLAS newcomer portal (Next.js)
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/health` | No | Health check |
| POST | `/api/v1/auth/register` | No | User registration |
| POST | `/api/v1/auth/login` | No | User login |
| POST | `/api/v1/immigration/crs/calculate` | No | Calculate CRS score |
| GET | `/api/v1/immigration/programs` | No | List immigration programs |
| POST | `/api/v1/immigration/pathways/match` | Yes | Match pathways to profile |
| GET | `/api/v1/immigration/checklist` | No | Post-landing checklist |
| POST | `/api/v1/contracts/upload` | Yes | Upload contract for review |
| GET | `/api/v1/contracts/{id}` | Yes | Get review results |
| GET | `/api/v1/documents/templates` | No | List document templates |
| POST | `/api/v1/documents/generate` | Yes | Generate document |
| GET | `/api/v1/compliance/standards` | No | Employment standards |
| POST | `/api/v1/legal/qa` | Yes | Legal Q&A |
