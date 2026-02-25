# Project README Template

# [Project Name]

[One-line description]

## Quick Start
```bash
# Clone and setup
git clone [repo-url]
cd [project-name]

# Backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env  # Edit with your values
alembic upgrade head
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

## Tech Stack
- **Backend:** FastAPI, SQLAlchemy, Alembic
- **Frontend:** Next.js, React, TypeScript
- **Database:** PostgreSQL
- **Auth:** JWT

## Project Structure
```
├── app/
│   ├── main.py
│   ├── api/routes/
│   ├── models/
│   ├── schemas/
│   └── services/
├── frontend/
│   ├── src/pages/
│   ├── src/components/
│   └── src/lib/api/
├── tests/
├── alembic/
├── docker-compose.yml
└── README.md
```

## Environment Variables
See `.env.example` for required configuration.

## API Documentation
Run the server and visit `http://localhost:8000/docs` for interactive API docs.
