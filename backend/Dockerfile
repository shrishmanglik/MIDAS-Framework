# ── Stage 1: Base ─────────────────────────────────────────────
FROM python:3.11-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# System dependencies required by WeasyPrint and PDF processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgdk-pixbuf-2.0-0 \
    libffi-dev \
    libcairo2 \
    libglib2.0-0 \
    shared-mime-info \
    && rm -rf /var/lib/apt/lists/*

# ── Stage 2: Dependencies ────────────────────────────────────
FROM base AS deps

WORKDIR /build

COPY pyproject.toml ./

RUN pip install poetry==1.8.2 && \
    poetry config virtualenvs.create false && \
    poetry install --no-root --only main --no-interaction

# ── Stage 3: Development ─────────────────────────────────────
FROM deps AS development

RUN pip install poetry==1.8.2 && \
    poetry config virtualenvs.create false && \
    poetry install --no-root --no-interaction

WORKDIR /app
COPY . .

RUN useradd -m -r -s /bin/bash appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8004

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8004", "--reload"]

# ── Stage 4: Production ──────────────────────────────────────
FROM base AS production

WORKDIR /app

COPY --from=deps /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=deps /usr/local/bin /usr/local/bin

COPY app/ ./app/
COPY alembic/ ./alembic/
COPY alembic.ini ./

RUN useradd -m -r -s /bin/bash appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8004

# Railway injects PORT env var; default to 8004
ENV PORT=8004

CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT} --workers 4
