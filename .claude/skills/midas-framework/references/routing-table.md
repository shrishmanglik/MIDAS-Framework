# Routing Table

Task type → required studio(s) mapping. CEO uses this for every incoming task.

## Single-Studio Routes

| Task Type | Primary Studio | Trigger Keywords |
|-----------|---------------|------------------|
| Build web app | dev-studio | "build", "code", "create app", "API", "backend", "frontend" |
| Write blog post | content-studio | "blog", "article", "write about" |
| Write LinkedIn post | content-studio | "LinkedIn", "post", "thought leadership" |
| Design UI | design-studio | "design", "wireframe", "mockup", "UI" |
| Market research | research-studio | "research", "market size", "TAM", "competitor" |
| Create ad campaign | advertisement-studio | "ad campaign", "Google Ads", "Meta ads" |
| Write proposal | sales-studio | "proposal", "SOW", "pitch", "quote" |
| Review contract | legal-studio | "contract review", "NDA", "terms" |
| Set up infrastructure | devops-studio | "deploy", "Docker", "CI/CD", "monitoring" |
| Analyze data | data-studio | "dashboard", "analytics", "ETL", "BI" |
| Security audit | security-studio | "pen test", "security review", "vulnerability" |
| Brand guidelines | brand-studio | "brand voice", "visual identity", "logo usage" |
| Email campaign | marketing-studio | "email sequence", "nurture", "drip campaign" |
| Client onboarding | client-success-studio | "onboard client", "training plan" |
| Job description | hr-studio | "job posting", "hire", "interview" |

## Domain-Enriched Routes (2 studios)

| Task Type | Primary Studio | Domain Studio | Why Both |
|-----------|---------------|---------------|----------|
| Build financial app | dev-studio | finance-studio | Finance provides domain rules, dev builds |
| Build education app | dev-studio | edtech-studio | EdTech provides curriculum, dev builds |
| Build astrology app | dev-studio | astro-studio | Astro provides calculations, dev builds |
| Build health app | dev-studio | healthcare-studio | Healthcare provides compliance, dev builds |
| Build e-commerce app | dev-studio | ecommerce-studio | EComm provides domain patterns, dev builds |
| Build real estate app | dev-studio | real-estate-studio | RE provides MLS knowledge, dev builds |
| Financial content | content-studio | finance-studio | Finance provides accuracy, content writes |
| Health content | content-studio | healthcare-studio | Healthcare provides medical accuracy, content writes |
| Legal compliance check | dev-studio | legal-studio | Legal reviews, dev fixes |

## Multi-Studio Routes (3+ studios)

| Task Type | Studios (in order) | Coordination |
|-----------|--------------------|--------------|
| Full product launch | research → design → dev → content → marketing → legal | Sequential pipeline |
| Marketing campaign | research → brand → content → marketing → ads | Sequential with parallel content+marketing |
| Client project delivery | sales → dev → security → devops → client-success | Sequential pipeline |
| Brand refresh | research → brand → design → content → marketing | Sequential, brand leads |
| Compliance audit | legal → security → dev → devops | Parallel legal+security, then dev+devops fixes |

## Routing Algorithm

```
1. EXTRACT keywords from task description
2. MATCH keywords against trigger keywords (fuzzy match)
3. IF single match → route to that studio
4. IF multiple matches → check multi-studio routes
5. IF domain keywords present → add domain studio
6. IF no match → ask human for clarification
7. LOAD required studio SKILL.md files
8. DETERMINE execution order from dependency graph
9. EXECUTE
```

## Ambiguity Resolution
When a task could match multiple studios:
- "Write code" → dev-studio (not content-studio)
- "Write copy" → content-studio (not dev-studio)
- "Design system" → design-studio (not dev-studio, unless "design system implementation")
- "Test" → dev-studio QA agent (unless "A/B test" → marketing-studio)
- "Review" → depends on what's being reviewed (code → dev, content → content, contract → legal)
