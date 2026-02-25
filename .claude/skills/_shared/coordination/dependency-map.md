---
name: "dependency-map"
description: "Maps dependencies between MIDAS studios"
---

# Studio Dependency Map

## Core Dependencies (every studio depends on these)
- **midas-framework** — Operating system kernel, quality gates, routing

## Studio Dependency Graph

```
midas-framework (core — loaded always)
│
├── research-studio (independent)
│
├── brand-studio (independent)
│   └── Used by: content, marketing, design, ads, all customer-facing studios
│
├── design-studio
│   └── Depends on: brand-studio
│
├── dev-studio
│   └── Depends on: design-studio (for UI specs)
│
├── content-studio
│   └── Depends on: brand-studio, research-studio
│
├── marketing-studio
│   └── Depends on: content-studio, research-studio, brand-studio
│
├── advertisement-studio
│   └── Depends on: marketing-studio, brand-studio, content-studio
│
├── sales-studio
│   └── Depends on: marketing-studio, content-studio, research-studio
│
├── client-success-studio
│   └── Depends on: sales-studio, content-studio
│
├── finance-studio
│   └── Depends on: research-studio
│
├── legal-studio
│   └── Independent (consulted by many)
│
├── hr-studio
│   └── Depends on: legal-studio
│
├── edtech-studio
│   └── Depends on: content-studio, design-studio
│
├── astro-studio
│   └── Depends on: content-studio
│
├── healthcare-studio
│   └── Depends on: content-studio, legal-studio
│
├── ecommerce-studio
│   └── Depends on: content-studio, design-studio, marketing-studio
│
├── real-estate-studio
│   └── Depends on: content-studio, marketing-studio
│
├── data-studio
│   └── Depends on: dev-studio
│
├── security-studio
│   └── Depends on: dev-studio, legal-studio
│
└── devops-studio
    └── Depends on: dev-studio, security-studio
```

## Common Cross-Studio Flows

### New Product Launch
research → design → dev → content → marketing → ads → sales

### Compliance Initiative
legal → security → devops → hr (policies)

### Content Campaign
research → brand → content → marketing → ads → data (analytics)

### Full App Build
research → design → dev → security → devops → content (docs) → marketing (launch)
