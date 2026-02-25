---
name: "docker-best-practices"
studio: "devops-studio"
---

# Docker Best Practices

## Image Building
- Use multi-stage builds (separate build and runtime)
- Use specific version tags (not :latest)
- Order layers from least to most frequently changing
- Use .dockerignore to exclude unnecessary files
- Minimize layer count (combine RUN commands)

## Security
- Never run as root (use USER directive)
- Scan images for vulnerabilities
- Use minimal base images (alpine, distroless)
- Don't store secrets in images
- Pin dependency versions

## Runtime
- Always set resource limits (CPU, memory)
- Use health checks
- Log to stdout/stderr (not files)
- One process per container
- Use read-only filesystem where possible

