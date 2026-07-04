-- MIDAS Framework — Initial Database Schema
-- v001: Core tables for workflow state, cost tracking, and knowledge storage.

BEGIN;

-- ---------------------------------------------------------
-- Workflow runs
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS workflow_runs (
    id          TEXT PRIMARY KEY,
    workflow    TEXT NOT NULL,
    studio      TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'pending',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata    JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_workflow_runs_status ON workflow_runs(status);
CREATE INDEX idx_workflow_runs_studio ON workflow_runs(studio);

-- ---------------------------------------------------------
-- Step executions
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS step_executions (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    run_id      TEXT NOT NULL REFERENCES workflow_runs(id) ON DELETE CASCADE,
    step_name   TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'pending',
    agent_id    TEXT,
    started_at  TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error       TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0,
    outputs     JSONB DEFAULT '{}'::jsonb,
    is_immutable BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE(run_id, step_name)
);

CREATE INDEX idx_step_executions_run_id ON step_executions(run_id);
CREATE INDEX idx_step_executions_status ON step_executions(status);

-- ---------------------------------------------------------
-- Cost records
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS cost_records (
    id          TEXT PRIMARY KEY,
    run_id      TEXT NOT NULL REFERENCES workflow_runs(id) ON DELETE CASCADE,
    step_name   TEXT NOT NULL,
    model_tier  TEXT NOT NULL,
    cost_tier   TEXT NOT NULL,
    input_tokens    INTEGER NOT NULL DEFAULT 0,
    output_tokens   INTEGER NOT NULL DEFAULT 0,
    cost_usd    DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    latency_ms  DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cost_records_run_id ON cost_records(run_id);
CREATE INDEX idx_cost_records_step ON cost_records(step_name);

-- ---------------------------------------------------------
-- Knowledge entries
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS knowledge_entries (
    id          TEXT PRIMARY KEY,
    domain      TEXT NOT NULL,
    title       TEXT NOT NULL,
    content     TEXT NOT NULL,
    source_project TEXT DEFAULT '',
    source_step TEXT DEFAULT '',
    confidence  DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    tags        TEXT[] DEFAULT '{}',
    is_promoted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_knowledge_domain ON knowledge_entries(domain);
CREATE INDEX idx_knowledge_promoted ON knowledge_entries(is_promoted) WHERE is_promoted = TRUE;
CREATE INDEX idx_knowledge_tags ON knowledge_entries USING GIN(tags);

-- ---------------------------------------------------------
-- Budget snapshots (for auditing)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS budget_snapshots (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    run_id      TEXT NOT NULL REFERENCES workflow_runs(id) ON DELETE CASCADE,
    total_budget DOUBLE PRECISION NOT NULL,
    total_spent DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    remaining   DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    is_exceeded BOOLEAN NOT NULL DEFAULT FALSE,
    step_costs  JSONB DEFAULT '{}'::jsonb,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_budget_snapshots_run ON budget_snapshots(run_id);

COMMIT;
