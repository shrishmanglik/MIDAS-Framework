# LegalAI Studio — Complete Build Specification

> **For Claude Code**: This is the complete specification for building the LegalAI Studio platform from scratch in the `Legal-AI-Studio` GitHub repo. Follow every section precisely. Build all files, commit, push to `main`, and deploy to Railway.

---

## 1. PROJECT OVERVIEW

**LegalAI Studio** is a modular legal intelligence platform for Canadian immigration, contracts, compliance, document generation, and AI-powered legal research. It targets two audiences:

1. **Legal professionals** — via the LegalAI Dashboard (full-featured, desktop-first)
2. **Immigration newcomers** — via the ATLAS Portal (simplified, mobile-first)

### Architecture

| Service | Stack | Port | Description |
|---------|-------|------|-------------|
| **Backend** | FastAPI + Python 3.11 | 8004 | REST API with 5 domain modules |
| **Frontend** | Next.js 14 + TypeScript | 3004 | LegalAI professional dashboard |
| **ATLAS** | Next.js 14 + TypeScript | 3005 | Newcomer immigration portal |
| **Database** | PostgreSQL 15 | 5432 | Data store |

### Five Modules

1. **Immigration Pathway Analyzer** — Deterministic CRS calculator (IRCC rules), PNP program matching, post-landing checklist
2. **Contract Review Engine** — PDF/DOCX upload, keyword-based clause extraction, deterministic risk scoring, missing clause detection
3. **Document Generator** — Jinja2 template rendering (NDA template included)
4. **Compliance Tracker** — Ontario employment standards lookup, compliance checklists by jurisdiction
5. **Legal Q&A** — Cache-first (SHA256 hash), Claude API fallback for answers with statute references

### Three-Tier Intelligence Model

- **Tier 1 (Deterministic)**: CRS calculator, PNP matcher, document generation, compliance lookups — zero AI cost
- **Tier 2 (Pattern-based)**: Contract clause extraction using keyword matching
- **Tier 3 (AI-powered)**: Legal Q&A via Claude API, ambiguous clause analysis — cache-first to minimize cost

### Critical Requirement: Legal Disclaimer

Every JSON response from legal endpoints (everything under `/api/v1/` except `/health` and `/auth`) MUST include a `disclaimer` field:

> "This information is provided for educational and informational purposes only. It does not constitute legal advice. For guidance on your specific situation, please consult a licensed legal professional in your jurisdiction."

This is enforced via FastAPI middleware (DisclaimerMiddleware) that intercepts responses and injects the field.

---

## 2. COMPLETE DIRECTORY STRUCTURE

Build exactly this file tree at the repo root:

```
.
├── README.md
├── .env.example
├── .gitignore
├── docker-compose.yml
├── docker-compose.dev.yml
├── railway-backend.toml
├── railway-frontend.toml
├── railway-atlas.toml
├── scripts/
│   └── deploy-railway.sh
│
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .env.example
│   ├── pyproject.toml
│   ├── alembic.ini
│   ├── alembic/
│   │   ├── env.py
│   │   └── versions/.gitkeep
│   ├── scripts/
│   │   └── seed.py
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   ├── security.py
│   │   │   ├── dependencies.py
│   │   │   └── exceptions.py
│   │   ├── middleware/
│   │   │   ├── __init__.py
│   │   │   └── disclaimer.py
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       ├── router.py
│   │   │       └── routes/
│   │   │           ├── __init__.py
│   │   │           ├── health.py
│   │   │           ├── auth.py
│   │   │           ├── immigration.py
│   │   │           ├── contracts.py
│   │   │           ├── documents.py
│   │   │           ├── compliance.py
│   │   │           └── legal.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── common.py
│   │   │   ├── auth.py
│   │   │   ├── immigration.py
│   │   │   ├── contracts.py
│   │   │   ├── documents.py
│   │   │   ├── compliance.py
│   │   │   └── legal.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py
│   │   │   ├── crs_calculator.py
│   │   │   ├── pnp_matcher.py
│   │   │   ├── immigration_service.py
│   │   │   ├── contract_service.py
│   │   │   ├── document_service.py
│   │   │   ├── compliance_service.py
│   │   │   └── legal_service.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── base.py
│   │   │   ├── user.py
│   │   │   ├── immigration.py
│   │   │   ├── contracts.py
│   │   │   ├── documents.py
│   │   │   ├── compliance.py
│   │   │   └── legal.py
│   │   └── data/
│   │       ├── __init__.py
│   │       ├── crs_rules.py
│   │       ├── immigration_programs.py
│   │       ├── employment_standards.py
│   │       ├── clause_library.py
│   │       └── document_templates/
│   │           └── nda.jinja2
│   └── tests/
│       ├── __init__.py
│       ├── conftest.py
│       ├── unit/
│       │   ├── __init__.py
│       │   ├── test_crs_calculator.py
│       │   ├── test_pnp_matcher.py
│       │   ├── test_compliance_service.py
│       │   └── test_contract_service.py
│       └── integration/
│           ├── __init__.py
│           ├── test_health.py
│           ├── test_immigration_routes.py
│           └── test_compliance_routes.py
│
├── frontend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .env.example
│   ├── .eslintrc.json
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── next.config.ts
│   ├── public/
│   │   └── favicon.ico
│   └── src/
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   ├── error.tsx
│       │   ├── globals.css
│       │   ├── (auth)/
│       │   │   ├── layout.tsx
│       │   │   ├── login/page.tsx
│       │   │   └── register/page.tsx
│       │   └── (dashboard)/
│       │       ├── layout.tsx
│       │       ├── page.tsx
│       │       ├── immigration/
│       │       │   ├── page.tsx
│       │       │   ├── calculator/page.tsx
│       │       │   ├── pathways/page.tsx
│       │       │   └── checklist/page.tsx
│       │       ├── contracts/
│       │       │   ├── page.tsx
│       │       │   ├── upload/page.tsx
│       │       │   └── [id]/page.tsx
│       │       ├── documents/
│       │       │   ├── page.tsx
│       │       │   └── generate/page.tsx
│       │       ├── compliance/
│       │       │   ├── page.tsx
│       │       │   ├── standards/page.tsx
│       │       │   └── checklist/page.tsx
│       │       └── legal-qa/page.tsx
│       ├── components/
│       │   ├── providers.tsx
│       │   ├── ui/ (button, card, input, label, select, textarea, badge, skeleton, toast, tabs, progress)
│       │   ├── layout/ (header, sidebar, footer, mobile-nav, disclaimer-banner)
│       │   ├── immigration/ (crs-form, crs-result, pathway-card, checklist-item)
│       │   ├── contracts/ (upload-dropzone, clause-card, risk-badge)
│       │   ├── documents/ (template-browser, generation-wizard)
│       │   ├── compliance/ (standards-table, checklist-view)
│       │   └── legal/ (qa-input, qa-response)
│       ├── lib/
│       │   ├── api/ (client, immigration, contracts, documents, compliance, legal)
│       │   ├── hooks/ (use-auth, use-crs-calculator)
│       │   ├── utils/ (cn, format)
│       │   └── validations/ (auth, immigration)
│       └── types/ (api, auth, immigration, contracts, documents, compliance, legal)
│
└── atlas/
    ├── Dockerfile
    ├── .dockerignore
    ├── .env.example
    ├── .eslintrc.json
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.ts
    ├── postcss.config.js
    ├── next.config.ts
    ├── public/
    │   └── favicon.ico
    └── src/
        ├── app/
        │   ├── layout.tsx
        │   ├── page.tsx
        │   ├── globals.css
        │   ├── (auth)/ (layout, login/page)
        │   ├── calculator/page.tsx
        │   ├── pathways/page.tsx
        │   └── checklist/page.tsx
        ├── components/
        │   ├── providers.tsx
        │   ├── ui/ (button, card, input, label, select, progress, badge)
        │   ├── layout/ (header, mobile-nav, footer)
        │   ├── calculator/ (crs-form, crs-result, score-breakdown)
        │   ├── pathways/ (pathway-card, eligibility-badge)
        │   └── checklist/ (task-item, progress-tracker)
        ├── lib/
        │   ├── api/ (client, immigration)
        │   ├── hooks/ (use-auth, use-crs-calculator)
        │   ├── utils/ (cn, format)
        │   └── validations/ (calculator)
        └── types/ (api, auth, immigration)
```

---

## 3. BACKEND SPECIFICATION

### 3.1 Dependencies (pyproject.toml)

```toml
[tool.poetry]
name = "legalai-backend"
version = "0.1.0"
description = "LegalAI Studio — Backend API"
packages = [{include = "app"}]

[tool.poetry.dependencies]
python = "^3.11"
fastapi = "^0.109.0"
uvicorn = {version = "^0.27.0", extras = ["standard"]}
sqlalchemy = {version = "^2.0.0", extras = ["asyncio"]}
asyncpg = "^0.29.0"
alembic = "^1.13.0"
pydantic = "^2.6.0"
pydantic-settings = "^2.1.0"
python-jose = {version = "^3.3.0", extras = ["cryptography"]}
passlib = {version = "^1.7.4", extras = ["bcrypt"]}
python-multipart = "^0.0.6"
pymupdf = "^1.24.0"
pdfplumber = "^0.11.0"
python-docx = "^1.1.0"
weasyprint = "^62.0"
jinja2 = "^3.1.0"
anthropic = "^0.40.0"
httpx = "^0.27.0"

[tool.poetry.group.dev.dependencies]
pytest = "^8.0.0"
pytest-asyncio = "^0.23.0"
httpx = "^0.27.0"
ruff = "^0.3.0"
coverage = "^7.4.0"

[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"

[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
```

### 3.2 Config (app/core/config.py)

Pydantic BaseSettings with env_file=".env":

| Field | Type | Default |
|-------|------|---------|
| PROJECT_NAME | str | "LegalAI Studio" |
| VERSION | str | "0.1.0" |
| DEBUG | bool | False |
| DATABASE_URL | str | "postgresql+asyncpg://postgres:postgres@localhost:5432/legalai" |
| JWT_SECRET | str | (required) |
| JWT_ALGORITHM | str | "HS256" |
| ACCESS_TOKEN_EXPIRE_MINUTES | int | 15 |
| REFRESH_TOKEN_EXPIRE_DAYS | int | 7 |
| CORS_ORIGINS | str | "http://localhost:3004,http://localhost:3005" |
| CLAUDE_API_KEY | str | "" |
| SUPABASE_URL | str | "" |
| SUPABASE_KEY | str | "" |

Property `cors_origins_list` splits CORS_ORIGINS by comma into list[str].

### 3.3 Database (app/core/database.py)

Async SQLAlchemy engine + session:
- `create_async_engine(settings.DATABASE_URL, pool_size=20, max_overflow=10, pool_pre_ping=True)`
- `async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)`
- `async def get_session()` — async generator yielding session

### 3.4 Security (app/core/security.py)

- `create_access_token(data: dict)` — JWT with HS256, expires in ACCESS_TOKEN_EXPIRE_MINUTES
- `create_refresh_token(data: dict)` — JWT with REFRESH_TOKEN_EXPIRE_DAYS
- `verify_token(token: str) -> dict` — decode and validate JWT
- `hash_password(password: str) -> str` — bcrypt hash via passlib
- `verify_password(plain, hashed) -> bool` — bcrypt verify

### 3.5 DisclaimerMiddleware (app/middleware/disclaimer.py)

**Critical compliance component.** FastAPI middleware (BaseHTTPMiddleware) that:
1. Intercepts ALL responses under `/api/v1/`
2. EXCLUDES `/api/v1/health` and `/api/v1/auth/`
3. If response Content-Type is `application/json`, reads the body, parses JSON, injects `"disclaimer"` field, re-serializes
4. Returns modified response

Disclaimer text: `"This information is provided for educational and informational purposes only. It does not constitute legal advice. For guidance on your specific situation, please consult a licensed legal professional in your jurisdiction."`

### 3.6 ORM Models

**Base** (app/models/base.py):
- `DeclarativeBase` from SQLAlchemy
- `UUIDMixin`: `id = Column(UUID, primary_key=True, default=uuid4)`
- `TimestampMixin`: `created_at = Column(DateTime, default=func.now())`, `updated_at = Column(DateTime, onupdate=func.now())`

**User**: id, email (unique, 320), password_hash (128), name (200), role (enum: user/admin), created_at, updated_at

**ImmigrationProgram**: id, name, province, program_type, min_crs_score (int|null), requirements (JSONB), active (bool)

**EEDraw**: id, draw_number, draw_date, min_score, invitations, program_type

**ClauseLibrary**: id, clause_type, name, description, risk_level, example_text

**ContractReview**: id, user_id (FK), filename, file_url, status (pending/processing/completed/failed), risk_score (float|null), summary, clauses_found (JSONB), missing_clauses (JSONB), created_at, updated_at

**DocumentTemplate**: id, name, category, description, template_content (text), jurisdiction, variables_schema (JSONB), created_at

**UserDocument**: id, user_id (FK), template_id (FK|null), title, content, file_url, created_at

**EmploymentStandard**: id, province, topic, rule_text, effective_date, source_url

**ComplianceRule**: id, jurisdiction, category, rule_name, description, checklist_items (JSONB)

**Statute**: id, jurisdiction, title, section, content, category

**LegalAICache**: id, query_hash (unique), query_text, response_text, statute_ids (JSONB), created_at, expires_at

**ImmigrationProfile**: id, user_id (FK), profile_data (JSONB), crs_score (int|null), updated_at

### 3.7 CRS Scoring Rules (app/data/crs_rules.py)

**This is the most important data file. It must be accurate to published IRCC formulas.**

```python
# Age points: age -> (single_points, with_spouse_points)
AGE_POINTS = {
    17: (0, 0), 18: (99, 90), 19: (105, 95),
    20: (110, 100), 21: (110, 100), 22: (110, 100), 23: (110, 100),
    24: (110, 100), 25: (110, 100), 26: (110, 100), 27: (110, 100),
    28: (110, 100), 29: (110, 100),
    30: (105, 95), 31: (99, 90), 32: (94, 85), 33: (88, 80),
    34: (83, 75), 35: (77, 70), 36: (72, 65), 37: (66, 60),
    38: (61, 55), 39: (55, 50), 40: (50, 45), 41: (39, 35),
    42: (28, 25), 43: (17, 15), 44: (6, 5), 45: (0, 0),
}

# Education: level -> (single, with_spouse)
EDUCATION_POINTS = {
    "none": (0, 0), "high_school": (30, 28),
    "one_year_post_secondary": (90, 84), "two_year_post_secondary": (98, 91),
    "bachelors": (120, 112), "two_or_more_post_secondary": (128, 119),
    "masters": (135, 126), "phd": (150, 140),
}

# First language: CLB -> points per ability (4 abilities)
FIRST_LANGUAGE_POINTS_SINGLE = {3: 0, 4: 6, 5: 6, 6: 9, 7: 17, 8: 23, 9: 31, 10: 34}
FIRST_LANGUAGE_POINTS_WITH_SPOUSE = {3: 0, 4: 6, 5: 6, 6: 8, 7: 16, 8: 22, 9: 29, 10: 32}

# Second language: CLB -> points per ability
SECOND_LANGUAGE_POINTS_SINGLE = {0: 0, 4: 0, 5: 1, 6: 1, 7: 3, 8: 3, 9: 6, 10: 6}
SECOND_LANGUAGE_POINTS_WITH_SPOUSE = {0: 0, 4: 0, 5: 1, 6: 1, 7: 3, 8: 3, 9: 6, 10: 6}

# Canadian work: years -> (single, with_spouse)
CANADIAN_WORK_EXPERIENCE_POINTS = {0: (0,0), 1: (40,35), 2: (53,46), 3: (64,56), 4: (72,63), 5: (80,70)}

# Spouse education, language, work experience points tables
# Skill transferability: education+language, education+work, foreign+language, foreign+canadian, certificate+language
# Additional points: provincial_nomination=600, job_offer_noc_00=200, job_offer_other=50, canadian_education, french_bonus, sibling=15

# Maximums: Core single=500, Core with_spouse=460, Spouse=40, Skill_transferability=100, Additional=600, Total=1200
```

Include ALL tables from the IRCC CRS grid. See Section C (Skill Transferability) for cross-factor combination tables.

### 3.8 CRS Calculator Service (app/services/crs_calculator.py)

**The single most important service. ~295 lines. 100% deterministic, zero AI cost.**

Class `CRSCalculator` with static/class methods:
- `calculate_age_points(age, has_spouse) -> int`
- `calculate_education_points(level, has_spouse) -> int`
- `calculate_language_points(scores, is_first, has_spouse) -> int` — iterates 4 abilities, looks up CLB -> points
- `calculate_canadian_work_experience_points(years, has_spouse) -> int`
- `calculate_spouse_education_points(level) -> int`
- `calculate_spouse_language_points(scores) -> int`
- `calculate_spouse_work_experience_points(years) -> int`
- `calculate_skill_transferability(input) -> int` — education_group (max 50) + foreign_group (max 50) + certificate (max 50), total capped at 100
- `calculate_additional_points(input) -> int` — provincial nomination, job offer, Canadian education, French bonus, sibling
- `calculate(input: CRSInput) -> CRSResult` — orchestrates all sections, returns total + breakdown

CRS Input schema must include: age, has_spouse, education_level, first_language (LanguageScores with speaking/listening/reading/writing as CLB 0-12), second_language (optional), canadian_work_experience_years, foreign_work_experience_years, spouse factors, has_certificate_of_qualification, has_provincial_nomination, job_offer_noc_level, canadian_education_years, has_sibling_in_canada, french_clb7_plus, english_clb5_plus.

### 3.9 Other Services

**PNPMatcher** — Rule-based. Loads programs from data module. Checks eligibility against profile. Returns sorted matches.

**ContractService** — `upload_and_review(file, user_id)`: parse PDF (PyMuPDF) or DOCX (python-docx), extract text, run keyword-based clause detection, compare against clause library, compute risk score. Risk scoring formula: `base_risk = len(missing_clauses) / len(all_standard_clauses) * 100`.

**DocumentService** — `list_templates()`, `get_template(id)`, `generate_document(template_id, variables)`: load Jinja2 template, render with variables. Include NDA template.

**ComplianceService** — `get_employment_standards(province)`, `get_compliance_checklist(jurisdiction, category)`: pure DB/data lookups.

**LegalService** — `answer_question(question, jurisdiction)`: compute `SHA256(normalize(question) + jurisdiction)` as cache key. Check LegalAICache. If cached and not expired (7 days TTL), return cached. Otherwise call Claude API with statute context, cache result, return.

### 3.10 Seed Data

**immigration_programs.py**: 5-8 programs (Federal Skilled Worker, CEC, Federal Skilled Trades, Ontario HCP, BC PNP Tech, Alberta Advantage)

**employment_standards.py**: ~30 Ontario ESA rules covering minimum_wage, vacation, overtime, public_holidays, termination_notice, parental_leave

**clause_library.py**: 10-15 standard contract clauses (confidentiality, non_compete, non_solicitation, indemnification, limitation_of_liability, termination, governing_law, IP, force_majeure, assignment, dispute_resolution)

**document_templates/nda.jinja2**: Mutual NDA template with variables: party_a_name, party_a_address, party_b_name, party_b_address, effective_date, term_years, jurisdiction, governing_law

### 3.11 API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/v1/health | No | Health check (excluded from disclaimer) |
| POST | /api/v1/auth/register | No | Register user |
| POST | /api/v1/auth/login | No | Login, returns JWT tokens |
| POST | /api/v1/auth/refresh | No | Refresh access token |
| GET | /api/v1/auth/me | Yes | Current user info |
| POST | /api/v1/immigration/crs/calculate | No | Calculate CRS score |
| GET | /api/v1/immigration/programs | No | List immigration programs |
| POST | /api/v1/immigration/pathways/match | Yes | Match pathways to profile |
| GET | /api/v1/immigration/checklist | No | Post-landing checklist |
| GET | /api/v1/immigration/draws | No | Recent EE draws |
| POST | /api/v1/contracts/upload | Yes | Upload contract (multipart PDF/DOCX) |
| GET | /api/v1/contracts/{id} | Yes | Get review result |
| GET | /api/v1/contracts | Yes | List user's reviews |
| GET | /api/v1/clauses | No | List clause library |
| GET | /api/v1/documents/templates | No | List templates |
| GET | /api/v1/documents/templates/{id} | No | Template detail |
| POST | /api/v1/documents/generate | Yes | Generate document |
| GET | /api/v1/compliance/standards | No | Standards by province (?province=ON) |
| GET | /api/v1/compliance/checklist | No | Compliance checklist |
| POST | /api/v1/legal/qa | Yes | Legal Q&A |
| GET | /api/v1/legal/qa/history | Yes | User's Q&A history |

### 3.12 Tests

**Unit tests for CRS calculator** (15-20 tests): age scoring boundaries (17→0, 20→110, 29→110, 30→105, 45→0), education levels, language CLB scoring, work experience, total calculation with known inputs, spouse vs no spouse, skill transferability, additional points (provincial nomination = 600).

**Unit tests for PNP matcher**: high-CRS matches FSW, CEC requires Canadian experience, provincial programs filter by province.

**Unit tests for compliance**: Ontario standards lookup, unknown province returns empty.

**Unit tests for contracts**: clause detection in sample text, missing clause detection, risk scoring.

**Integration tests**: GET /health returns 200, POST /immigration/crs/calculate with valid input returns score + disclaimer, GET /compliance/standards?province=ON returns data + disclaimer.

---

## 4. FRONTEND SPECIFICATION (LegalAI Dashboard)

### 4.1 Dependencies (package.json)

next 14, react 18, @radix-ui/react-slot, @radix-ui/react-tabs, @radix-ui/react-select, @radix-ui/react-label, @radix-ui/react-progress, class-variance-authority, clsx, tailwind-merge, lucide-react, zod, react-hook-form, @hookform/resolvers, swr

Dev: typescript, tailwindcss, postcss, autoprefixer, eslint, eslint-config-next

### 4.2 Theme — Dark Cosmic

```css
--background: 222 47% 10%;     /* #0A1628 */
--foreground: 210 40% 98%;     /* #F8FAFC */
--primary: 43 69% 53%;         /* #D4AF37 gold */
--secondary: 217 33% 17%;     /* #0F172A */
--card: 222 47% 11%;
--muted: 217 33% 17%;
--muted-foreground: 215 20% 65%;
--destructive: 0 84% 60%;
--border: 217 33% 17%;
--ring: 43 69% 53%;            /* gold */
```

### 4.3 Layout

- **Root layout**: Inter font, `<Providers>` wrapper (SWR config), dark body
- **Auth layout** (`(auth)/`): Centered card on dark background, no sidebar
- **Dashboard layout** (`(dashboard)/`): Header (logo + nav + user menu) + Sidebar (5 module nav icons) + DisclaimerBanner (gold border) + Main content + Footer (disclaimer text)

### 4.4 UI Components (shadcn/ui pattern)

Use CVA (class-variance-authority) + Radix UI primitives. Each component ~20-50 lines. Standard shadcn patterns.

button.tsx, card.tsx, input.tsx, label.tsx, select.tsx, textarea.tsx, badge.tsx, skeleton.tsx, toast.tsx, tabs.tsx, progress.tsx

### 4.5 API Client (lib/api/client.ts)

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8004/api/v1";

class ApiClient {
  private getToken(): string | null { return localStorage.getItem("token"); }
  async get<T>(path: string): Promise<T> { /* fetch with Bearer token */ }
  async post<T>(path: string, body?: unknown): Promise<T> { /* ... */ }
  async upload<T>(path: string, file: File): Promise<T> { /* FormData */ }
}
export const apiClient = new ApiClient();
```

### 4.6 Key Pages

**Dashboard overview**: 5 module cards with icons (Scale for immigration, FileSearch for contracts, FileText for documents, Shield for compliance, MessageCircle for legal QA). Each links to module.

**CRS Calculator page**: Multi-step form (personal → education → language → work → additional). Uses react-hook-form + zod. Real-time preview. Submit shows CRSResult with score breakdown bars.

**Contract upload page**: Dropzone for PDF/DOCX. File validation. Upload progress. Redirects to review detail.

**Contract review detail** (`[id]`): Risk score badge (green/yellow/red), clauses found list, missing clauses alerts, summary.

**Document generation**: Template browser → select → fill variables form → generate → download.

**Compliance standards**: Province selector → filterable/sortable table.

**Legal Q&A**: Question textarea + jurisdiction selector → submit → loading skeleton → response with source references.

---

## 5. ATLAS SPECIFICATION (Newcomer Portal)

Separate Next.js 14 app. Mobile-first. Simpler UI. Blue-tinted theme instead of gold.

### Theme

```
background: #0A1628, foreground: #F8FAFC
primary: #3B82F6 (blue), secondary: #0F172A
accent: #3B82F6, muted: #1E293B
```

### Pages

- **Landing**: "Calculate Your CRS Score" hero with prominent blue CTA button
- **Calculator**: Mobile-optimized step-by-step wizard. Larger touch targets. Progress bar. Same API as main frontend.
- **Pathways**: Card-based program matches with green/yellow/red eligibility indicators
- **Checklist**: Post-landing tasks with progress tracking

### Layout

Simplified header ("ATLAS" logo + back nav). Bottom tab navigation (Calculator, Pathways, Checklist). Footer with disclaimer.

---

## 6. DOCKER CONFIGURATION

### docker-compose.yml

4 services: `db` (postgres:15-alpine with healthcheck), `backend` (port 8004, depends on db:service_healthy), `frontend` (port 3004, depends on backend:service_healthy), `atlas` (port 3005, depends on backend:service_healthy). Named volume for pgdata.

### Backend Dockerfile

Multi-stage: base (python:3.11-slim + WeasyPrint system deps: libpango, libcairo, libgdk-pixbuf, libffi-dev, shared-mime-info) → deps (poetry install) → development (full deps + source) → production (only runtime deps + app code). Non-root user. `ENV PORT=8004`. CMD: `uvicorn app.main:app --host 0.0.0.0 --port ${PORT} --workers 4`

### Frontend/Atlas Dockerfiles

Multi-stage: deps (node:20-alpine, npm install) → builder (copy source, `NEXT_PUBLIC_API_URL` build arg, npm run build) → runner (standalone output, non-root user). PORT env var for Railway compatibility.

---

## 7. DEPLOYMENT (Railway)

### Railway Config Files

**railway-backend.toml**:
```toml
[build]
dockerfilePath = "backend/Dockerfile"
[deploy]
healthcheckPath = "/api/v1/health"
healthcheckTimeout = 30
```

**railway-frontend.toml** and **railway-atlas.toml**: similar with `healthcheckPath = "/"`.

### scripts/deploy-railway.sh

Automated script that:
1. Creates Railway project
2. Adds PostgreSQL plugin
3. Deploys backend with env vars (DATABASE_URL using Railway references, JWT_SECRET, CORS_ORIGINS)
4. Deploys frontend with NEXT_PUBLIC_API_URL pointing to backend
5. Deploys ATLAS with NEXT_PUBLIC_API_URL pointing to backend
6. Updates CORS_ORIGINS on backend with frontend/atlas domains
7. Runs `alembic upgrade head` and `python scripts/seed.py`

### Deployment Steps

After building the entire project, deploy it:

```bash
# Install Railway CLI
npm install -g @railway/cli
railway login

# Run automated deploy
bash scripts/deploy-railway.sh
```

---

## 8. VERIFICATION CHECKLIST

After building everything, verify:

1. `docker-compose build` — all 4 images build successfully
2. `docker-compose up -d` — all services start and pass health checks
3. `curl http://localhost:8004/api/v1/health` — returns `{"status":"ok"}`
4. `POST /api/v1/immigration/crs/calculate` with `{"age":30,"education_level":"masters","first_language":{"speaking":9,"listening":9,"reading":9,"writing":9},"canadian_work_experience_years":3}` — returns CRS score + disclaimer
5. `GET /api/v1/compliance/standards?province=ON` — returns Ontario standards + disclaimer
6. `http://localhost:3004` — LegalAI dashboard loads
7. `http://localhost:3005` — ATLAS calculator loads
8. `pytest -v` — all tests pass

---

## 9. BUILD ORDER

1. Root config files (.env.example, .gitignore, docker-compose.yml, README.md)
2. Backend core (config, database, security, dependencies, exceptions, middleware, main.py, health route, router)
3. Database models + seed data (all ORM models, CRS rules, programs, standards, clauses, NDA template, alembic, seed script)
4. Schemas + services (all Pydantic schemas, CRS calculator, PNP matcher, all services)
5. Backend routes (all API route handlers)
6. Frontend (config, theme, UI components, layout, pages, API client, hooks, types)
7. ATLAS (config, theme, components, pages)
8. Tests (unit + integration)
9. Deployment configs (railway.toml files, deploy script)
10. Commit all, push to main, deploy to Railway

**Target: ~200+ files, ~14,000+ lines of production code.**
