# MDS Codebase Line Count Audit — 2026-05-26

> **Scope warning — read first.** This audit was requested against the full
> local workspace `E:\Million Dollar AI Studio\` (all products, websites,
> client sites, and the VCOS tree). That workspace **does not exist in this
> environment.** This is a Claude Code on-the-web session running in an
> ephemeral Linux container that contains only a fresh clone of the
> `shrishmanglik/MIDAS-Framework` repository at `/home/user/MIDAS-Framework`.
> There is no `E:` drive, no `F:` backup drive, and none of the product repos
> (pathway-ai, prep-ai, astro-ai, nestiq, atlas), marketing site, client sites,
> or the wider `vcos/` tree are reachable. The audit below therefore covers
> **one repo only**. See [Notes](#notes) for the full list of expected-but-missing paths.

- **Environment:** Linux cloud container (Claude Code on the web)
- **Repo audited:** `shrishmanglik/MIDAS-Framework` @ branch `claude/mds-codebase-audit-z4Abh`
- **Tool:** cloc 2.06 (installed via `npm install -g cloc`)
- **Excluded dirs:** `node_modules, .next, dist, build, __pycache__, venv, .git, .vercel, .pytest_cache, .ruff_cache, .mypy_cache`

## Summary Table

Rows are the major areas of the single available repo (no "products" exist in
this container). Counts are **code lines** (cloc `code` column, blanks/comments excluded).

| Area | Path | TypeScript | Python | CSS | Markdown | YAML | JSON | Other | TOTAL |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Framework packages | `packages/` | 0 | 1,281 | 0 | 0 | 0 | 0 | 79 (TOML) | 1,360 |
| Studios | `studios/` | 0 | 285 | 0 | 0 | 929 | 0 | 412 (Jinja) | 1,626 |
| Tests | `tests/` | 0 | 1,480 | 0 | 0 | 0 | 18 | 0 | 1,498 |
| Studio skills (docs) | `.claude/skills/` | 0 | 0 | 0 | 25,026 | 0 | 0 | 0 | 25,026 |
| Migrations | `migrations/` | 0 | 0 | 0 | 0 | 0 | 0 | 69 (SQL) | 69 |
| Scripts | `scripts/` | 0 | 80 | 0 | 0 | 0 | 0 | 0 | 80 |
| Root docs/config | `./` (CLAUDE.md, pyproject) | 0 | 0 | 0 | 67 | 0 | 11 | 54 (TOML) | 132 |
| **TOTAL (repo)** | `.` | **0** | **3,126** | **0** | **25,093** | **929** | **29** | **614** | **29,791** |

> `knowledge/` is empty (only `.gitkeep`) — 0 lines.

## Per-Product Breakdown

No standalone products are present in this environment. The breakdown below is
by repo area, with raw cloc output.

### Whole repo (`cloc .`)

```
Language        files    blank   comment     code
Markdown          157     6993         2    25093
Python             80      811       391     3126
YAML               19       65         5      929
Jinja Template      8       89        72      412
TOML                6       25         0      133
SQL                 1       12        17       69
JSON                4        0         0       29
--------------------------------------------------
SUM:              275     7995       487    29791
```

### `packages/` — framework libraries (Python)

```
Language    files   blank  comment    code
Python         56     414      199    1281
TOML            5      14        0      79
-----------------------------------------
SUM:           61     428      199    1360
```

Per-package Python source:

| Package | Path | Python files | Python code | TOML |
|---|---|---:|---:|---:|
| midas-core | `packages/midas-core/` | 17 | 424 | 15 |
| mds-common | `packages/mds-common/` | 24 | 444 | 16 |
| shield | `packages/shield/` | 5 | 185 | 16 |
| forge | `packages/forge/` | 5 | 120 | 16 |
| pulse | `packages/pulse/` | 5 | 108 | 16 |

### `studios/` — agent/workflow definitions

```
Language          files   blank  comment   code
YAML                 19      65        5    929
Jinja Template        8      89       72    412
Python                4      76       50    285
----------------------------------------------
SUM:                 31     230      127   1626
```

### `tests/`

```
Language    files   blank  comment    code
Python         20     307      133    1480
JSON            3       0        0      18
-----------------------------------------
SUM:           23     307      133    1498
```

### `.claude/skills/` — studio knowledge (Markdown)

```
Language     files   blank  comment    code
Markdown       156    6970        2   25026
```

### `migrations/` and `scripts/`

```
migrations/  SQL       1 file    69 code
scripts/     Python    1 file    80 code
```

## Totals

- **Total lines of code (TS + Python + CSS):** 3,126 (all Python; no TS/CSS in this repo)
  - Including other source-ish languages (Jinja templates 412, SQL 69): 3,607
- **Total lines of knowledge (MD + YAML):** 26,022 (Markdown 25,093 + YAML 929)
- **Grand total, all files (code lines):** 29,791 across 275 files
- **Number of distinct repos:** 1 (`shrishmanglik/MIDAS-Framework` only — see Notes)

## Notes

### Repos found that weren't expected
- None. Only the single expected framework repo is present.

### Expected paths that were MISSING (not reachable in this container)
All of the following were requested in the task but do **not** exist in this
environment because the `E:` workspace is not mounted here:

- `products/pathway-ai/` (TEF-Maitre) — **missing**
- `products/prep-ai/` (chemai-studio) — **missing**
- `products/astro-ai/` (jyotish-ai) — **missing**
- `products/nestiq/` — **missing**
- `products/atlas/` — **missing**
- MDS marketing site — **missing**
- `business/clients/` client sites — **missing**
- `vcos/` (entire VCOS tree) — **missing**
- `frameworks/midas/` / `vcos/development-studio/frameworks/midas/` — **missing**
- `F:` backup drive — **not present** (and out of scope)

### Bloat flags (repos > 20K lines)
- `.claude/skills/` holds **25,026 lines of Markdown** across 156 files — this is
  the dominant contributor to the repo total and the only area over 20K lines.
  It is documentation/knowledge (studio skill definitions), not executable code,
  so the flag is informational rather than a code-bloat concern.

### How to run the full audit (on the actual Windows workspace)
To produce the originally-scoped report, run this on the machine that has the
`E:` drive, where cloc and the full directory tree are available:

```bash
cloc "E:\Million Dollar AI Studio" \
  --exclude-dir=node_modules,.next,dist,build,__pycache__,venv,.git,.vercel \
  --by-file-by-lang --md
```

Then per-directory for each product/website/framework path, and a
`--include-lang=Markdown,YAML` pass for the knowledge total, mirroring the
sections above.
