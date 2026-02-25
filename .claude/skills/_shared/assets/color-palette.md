---
name: "color-palette"
description: "Semantic color palette used across all MIDAS studios"
---

# MDS Color Palette

## Semantic Colors (for documents, dashboards, status indicators)

### Status Colors

| Status | Color | Hex | Usage |
|--------|-------|-----|-------|
| Success | Green | `#22C55E` | Passed gates, completed tasks, healthy metrics |
| Warning | Amber | `#F59E0B` | Approaching limits, needs attention |
| Error | Red | `#EF4444` | Failed gates, blockers, critical issues |
| Info | Blue | `#3B82F6` | Informational, neutral updates |
| Neutral | Gray | `#6B7280` | Inactive, archived, placeholder |

### Priority Colors

| Priority | Color | Hex |
|----------|-------|-----|
| P0 — Critical | Red | `#DC2626` |
| P1 — High | Orange | `#EA580C` |
| P2 — Medium | Yellow | `#CA8A04` |
| P3 — Low | Gray | `#9CA3AF` |

### Tier Colors

| Tier | Color | Hex | Meaning |
|------|-------|-----|---------|
| Tier 1 | Silver | `#94A3B8` | Template execution ($0) |
| Tier 2 | Blue | `#3B82F6` | Rules + Light LLM ($0.001-$0.005) |
| Tier 3 | Gold | `#D97706` | Full LLM ($0.01-$0.10+) |

## Studio Identity Colors

Each studio has an assigned accent color for visual differentiation:

| Studio | Color | Hex |
|--------|-------|-----|
| midas-framework | Gold | `#D97706` |
| research-studio | Indigo | `#4F46E5` |
| design-studio | Violet | `#7C3AED` |
| brand-studio | Rose | `#E11D48` |
| dev-studio | Emerald | `#059669` |
| content-studio | Sky | `#0284C7` |
| marketing-studio | Orange | `#EA580C` |
| advertisement-studio | Fuchsia | `#C026D3` |
| sales-studio | Lime | `#65A30D` |
| client-success-studio | Teal | `#0D9488` |
| finance-studio | Green | `#16A34A` |
| legal-studio | Slate | `#475569` |
| hr-studio | Pink | `#DB2777` |
| edtech-studio | Cyan | `#0891B2` |
| astro-studio | Purple | `#9333EA` |
| healthcare-studio | Red | `#DC2626` |
| ecommerce-studio | Amber | `#D97706` |
| real-estate-studio | Stone | `#78716C` |
| data-studio | Blue | `#2563EB` |
| security-studio | Red-Dark | `#991B1B` |
| devops-studio | Gray | `#374151` |

## Application Rules

1. **Status always overrides studio color** — a failed gate is always red regardless of studio
2. **Never use color as the only indicator** — always pair with text labels for accessibility
3. **Client deliverables use client colors** — studio colors are internal only
4. **Dashboard charts** use studio colors for multi-studio views
5. **Markdown documents** reference colors by semantic name, not hex value
