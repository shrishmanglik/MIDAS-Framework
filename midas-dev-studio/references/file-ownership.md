# File Ownership Matrix — MIDAS Dev Studio

Defines which agent can read and write which files. Prevents conflicts and ensures accountability.

---

## Ownership Rules

1. **One writer per file.** Each file has exactly one agent that can create/modify it.
2. **Many readers.** Any agent can read any file they need for context.
3. **Violations are bugs.** If an agent writes outside its scope, it's an orchestration error.
4. **Handoffs via output/.** All inter-agent communication happens through `output/` artifacts.

## Agent → File Access Matrix

### Product Manager
| Access | Paths |
|---|---|
| **Write** | `output/requirements.json` |
| **Read** | User's project brief (conversation) |
| **Cannot Write** | `app/`, `frontend/`, `tests/`, `alembic/`, config files |

### Systems Architect
| Access | Paths |
|---|---|
| **Write** | `output/architecture.md`, `output/openapi-stub.yaml` |
| **Read** | `output/requirements.json` |
| **Cannot Write** | `app/`, `frontend/`, `tests/`, `alembic/` |

### Database Engineer
| Access | Paths |
|---|---|
| **Write** | `app/models/*.py`, `app/core/database.py`, `alembic/`, `output/schema.sql` |
| **Read** | `output/requirements.json`, `output/architecture.md` |
| **Cannot Write** | `app/routes/`, `app/services/`, `app/schemas/`, `frontend/`, `tests/` |

### Backend Developer
| Access | Paths |
|---|---|
| **Write** | `app/main.py`, `app/core/config.py`, `app/core/dependencies.py`, `app/core/security.py`, `app/routes/*.py`, `app/services/*.py`, `app/schemas/*.py`, `app/utils/*.py` |
| **Read** | `output/architecture.md`, `output/openapi-stub.yaml`, `app/models/` |
| **Cannot Write** | `app/models/`, `frontend/`, `tests/`, `alembic/` |

### Frontend Developer
| Access | Paths |
|---|---|
| **Write** | `frontend/` (all files) |
| **Read** | `output/architecture.md`, `output/openapi-stub.yaml` |
| **Cannot Write** | `app/`, `tests/`, `alembic/`, `output/` |

### QA Engineer
| Access | Paths |
|---|---|
| **Write** | `tests/` (all files), `output/test-results.txt`, `output/review-report.md` |
| **Read** | `app/`, `frontend/`, `output/requirements.json`, `output/architecture.md` |
| **Cannot Write** | `app/`, `frontend/`, `alembic/` |

### DevOps Engineer
| Access | Paths |
|---|---|
| **Write** | `Dockerfile`, `docker-compose.yaml`, `.github/`, `.env.example`, `nginx.conf` |
| **Read** | `app/`, `frontend/`, `output/architecture.md` |
| **Cannot Write** | `app/`, `frontend/`, `tests/`, `alembic/` |

## Shared Files

| File | Owner | Others |
|---|---|---|
| `README.md` | DevOps (generates) | All (read) |
| `pyproject.toml` | Backend Dev (creates) | DevOps (reads for Docker) |
| `package.json` | Frontend Dev (creates) | DevOps (reads for Docker) |
| `.gitignore` | DevOps | All (read) |

## Conflict Resolution

If two agents need to modify the same file:
1. **One writes, one reads.** The reader adapts to the writer's output.
2. **If genuinely shared,** designate one owner. The other proposes changes via `output/` artifact.
3. **Never merge conflicting writes.** Flag as orchestration error.
