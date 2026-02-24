---
description: "Generate deployment configurations and verify containers work. Must run after /dev-test."
---

# /dev-deploy — Phase 5: Deployment

Execute Phase 5 of the MIDAS Dev Studio pipeline.

1. Verify tests pass (error if not: "Run /dev-test first")
2. Activate the devops-engineer agent (mostly Tier 1 templates):
   - Generate Dockerfile
   - Generate docker-compose.yaml
   - Generate .github/workflows/ci.yml
   - Generate .env.example
3. Test: `docker compose build --no-cache`
4. Test: `docker compose up -d && sleep 10 && curl -f http://localhost:8000/health`
5. Clean up: `docker compose down`
6. Generate final README.md from project artifacts
7. Present complete project summary to user:
   - File tree
   - Test results
   - Docker status
   - API endpoints list
   - Setup instructions
8. Accumulate learnings → write to `knowledge/`
