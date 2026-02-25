---
name: "deployment-strategies"
studio: "devops-studio"
---

# Deployment Strategy Guide

## Strategies Comparison
| Strategy | Downtime | Risk | Rollback | Complexity |
|----------|----------|------|----------|-----------|
| Recreate | Yes | High | Slow | Low |
| Rolling | No | Medium | Medium | Medium |
| Blue/Green | No | Low | Instant | High |
| Canary | No | Very Low | Fast | High |
| Feature Flags | No | Very Low | Instant | Medium |

## When to Use What
- **Recreate**: Dev environments, non-critical services
- **Rolling**: Standard production deployments
- **Blue/Green**: Critical services, database migrations
- **Canary**: High-traffic services, risky changes
- **Feature Flags**: Gradual rollouts, A/B testing

