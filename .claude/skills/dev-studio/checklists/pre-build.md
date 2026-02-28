# Pre-Build Checklist

> Complete this checklist BEFORE writing any code. Verify that requirements are clear, architecture is defined, and the development environment is ready.

## Requirements Validation

- [ ] **Requirements document exists** -- A structured requirements doc with user stories and acceptance criteria is available
- [ ] **All P0 requirements have acceptance criteria** -- Every must-have feature has testable Given/When/Then statements
- [ ] **Scope boundary is defined** -- Out-of-scope items are explicitly listed to prevent scope creep
- [ ] **Non-functional requirements are measurable** -- Performance targets use numbers (e.g., "p95 < 200ms"), not adjectives ("fast")
- [ ] **Unknowns are flagged** -- Every assumption is documented with its impact if wrong
- [ ] **Human has approved the requirements** -- No building starts until the brief owner signs off

## Architecture Validation

- [ ] **Architecture specification exists** -- System diagram, API contracts, and database schema are documented
- [ ] **Tech stack is justified** -- Every technology choice has a documented trade-off analysis
- [ ] **API contracts are complete** -- All endpoints defined with method, path, auth, request schema, response schema, and error cases
- [ ] **Database schema is defined** -- All entities, relationships, constraints, and indexes are specified
- [ ] **Auth model is specified** -- Authentication method, token lifecycle, and authorization strategy are documented
- [ ] **Cross-cutting concerns are addressed** -- Logging, error handling, validation, and CORS strategies are defined
- [ ] **ADRs are written** -- Every significant decision has an Architecture Decision Record

## Environment Readiness

- [ ] **Project directory structure is created** -- Backend, frontend, and shared directories exist
- [ ] **.env.example exists** -- All required environment variables are documented with descriptions
- [ ] **Database is accessible** -- Local development database is running and connectable
- [ ] **Dependencies are listed** -- package.json / pyproject.toml have all required dependencies
- [ ] **Linter is configured** -- Ruff (Python) and ESLint (TypeScript) configs are in place
- [ ] **Test framework is set up** -- pytest.ini / jest.config exists and a sample test passes
- [ ] **Git repository is initialized** -- .gitignore includes .env files, node_modules, __pycache__, .next

## Dependency Audit

- [ ] **No unnecessary dependencies** -- Every dependency in the manifest is actually used
- [ ] **Versions are pinned** -- No floating version ranges that could break builds
- [ ] **No known vulnerabilities** -- `npm audit` / `pip audit` shows zero critical/high issues
- [ ] **Licenses are compatible** -- No GPL dependencies in proprietary projects without review

## Team Alignment

- [ ] **File ownership is clear** -- Every agent knows which files they own and which they must not touch
- [ ] **API conventions are documented** -- URL patterns, error format, pagination style are agreed upon
- [ ] **Testing strategy is defined** -- Coverage targets, test naming conventions, and required test types are documented
- [ ] **Branch strategy is set** -- Feature branch naming, PR process, and merge rules are established

## Tier Classification

- [ ] **Task complexity is assessed** -- Simple (single endpoint) / Standard (multi-endpoint) / Complex (full application)
- [ ] **Execution tier is selected** -- Tier 1 (template), Tier 2 (rules + light LLM), or Tier 3 (full LLM)
- [ ] **Agent assignments are determined** -- Which agents are needed and in what order

## Go / No-Go Decision

All items above must be checked before proceeding to the Build phase. If ANY item is unchecked:

1. **Missing requirements** -- Return to Product Manager for clarification
2. **Missing architecture** -- Return to Systems Architect for specification
3. **Missing environment** -- DevOps Engineer sets up the development environment
4. **Missing approvals** -- Escalate to human for sign-off

**Do NOT start building with incomplete inputs. Incomplete inputs produce incomplete software.**
