# Design Studio — The Visual Mind

> "Design is not just what it looks like and feels like. Design is how it works." — Steve Jobs

The Design Studio transforms product requirements into pixel-perfect, accessible, and delightful user interfaces. It owns the entire visual pipeline from user research through final developer handoff, ensuring every screen adheres to the MDS design system's cosmic dark theme with gold accents and clean minimalism.

---

## Activation Triggers

- "Design a page/screen/component for..."
- "Create a UI for..."
- "Build a design system..."
- "Make this accessible..."
- "Add animations/transitions to..."
- "Review this design..."
- "Create a user flow for..."
- "Design tokens for..."
- Any request involving visual design, UX research, component specs, or motion design

---

## Methodology

### Phase 1: Research & Discovery

| Aspect | Detail |
|--------|--------|
| **INPUT** | Product brief, user stories, business requirements |
| **PROCESS** | UX Researcher conducts user analysis, creates personas, maps existing flows, identifies pain points |
| **OUTPUT** | Research report with personas, journey maps, and design recommendations |
| **GATE** | Research findings validated against business goals; at least 2 personas defined |

### Phase 2: Wireframe & Architecture

| Aspect | Detail |
|--------|--------|
| **INPUT** | Research findings, feature requirements |
| **PROCESS** | UI Designer creates low-fidelity wireframes, information architecture, and layout grids |
| **OUTPUT** | Wireframe set with annotations, responsive breakpoints defined |
| **GATE** | Wireframes cover all user flows; navigation paths validated; no dead ends |

### Phase 3: Visual Design

| Aspect | Detail |
|--------|--------|
| **INPUT** | Approved wireframes, MDS design system tokens |
| **PROCESS** | UI Designer applies visual design — colors, typography, spacing, imagery. Design System Architect ensures token compliance |
| **OUTPUT** | High-fidelity component specs with Tailwind classes, design token references |
| **GATE** | All components use MDS tokens; WCAG 2.1 AA contrast ratios met; responsive at all breakpoints |

### Phase 4: Prototype & Motion

| Aspect | Detail |
|--------|--------|
| **INPUT** | Visual designs, interaction requirements |
| **PROCESS** | Motion Designer specifies animations, transitions, micro-interactions with CSS/Framer Motion code |
| **OUTPUT** | Animation specs with timing functions, interaction states, and code snippets |
| **GATE** | Animations under 300ms for micro-interactions; no layout shift; respects prefers-reduced-motion |

### Phase 5: Handoff & QA

| Aspect | Detail |
|--------|--------|
| **INPUT** | Complete design specs, component code |
| **PROCESS** | Design review checklist, accessibility audit, responsive check executed |
| **OUTPUT** | Developer-ready specs with Tailwind classes, component props, spacing values, and animation code |
| **GATE** | All checklist items passed; zero critical accessibility violations; responsive across mobile/tablet/desktop |

---

## Team Roster

| Agent | Role | Specialty |
|-------|------|-----------|
| UI Designer | Visual Design Lead | Component design, visual specs, Tailwind/shadcn patterns |
| UX Researcher | User Advocate | Personas, user flows, usability analysis, journey maps |
| Design System Architect | Consistency Guardian | Token management, component documentation, pattern library |
| Motion Designer | Interaction Specialist | Animations, transitions, micro-interactions, Framer Motion |

---

## Quality Gates

| Gate | Criteria | Required Score |
|------|----------|----------------|
| Research Completeness | Personas defined, flows mapped, pain points identified | 100% coverage |
| Visual Consistency | All components use MDS design tokens | Zero deviations |
| Accessibility | WCAG 2.1 AA compliance | Zero critical violations |
| Responsive | Works at 375px, 768px, 1024px, 1440px | All breakpoints pass |
| Performance | No animation jank, images optimized, CSS efficient | Lighthouse > 90 |
| Handoff Quality | Specs include all values needed for implementation | Zero ambiguities |

---

## Templates Available

| Template | Purpose | Location |
|----------|---------|----------|
| Design Tokens | Color, typography, spacing, shadow definitions | `templates/design-tokens.md` |
| Component Spec | Full specification for a UI component | `templates/component-spec.md` |
| Page Layout | Responsive page layout with grid system | `templates/page-layout.md` |
| User Flow | User journey and flow diagram template | `templates/user-flow.md` |

---

## References Available

| Reference | Content | Location |
|-----------|---------|----------|
| MDS Design System | Complete design system specification | `references/mds-design-system.md` |
| Component Patterns | Common UI component patterns | `references/component-patterns.md` |
| Accessibility Guide | WCAG 2.1 AA requirements and techniques | `references/accessibility-guide.md` |
| Color & Typography | Full palette and type scale | `references/color-typography.md` |

---

## Integration Points

| Direction | Studio | Data Exchanged |
|-----------|--------|----------------|
| **Receives from** | Dev Studio | Feature briefs, technical constraints, API schemas |
| **Receives from** | Research Studio | User personas, market positioning, brand guidelines |
| **Provides to** | Dev Studio | Component specs, Tailwind classes, animation code |
| **Provides to** | Marketing Studio | Visual assets, brand-consistent templates, style guides |
| **Provides to** | Sales Studio | Pitch deck visual templates, product screenshots |

---

## Anti-Patterns

| Anti-Pattern | Why It Fails | Instead Do |
|-------------|-------------|------------|
| Designing without research | Creates solutions for imaginary problems | Always start with Phase 1 research |
| Ignoring the design system | Causes visual inconsistency, increases maintenance | Use MDS tokens for every value |
| Pixel-perfect without responsive | Desktop-only designs break on mobile | Design mobile-first, verify all breakpoints |
| Over-animating | Causes performance issues, accessibility problems | Use animation sparingly, respect prefers-reduced-motion |
| Skipping accessibility | Excludes users, creates legal risk | Run accessibility audit on every component |
| Designing in isolation | Creates specs developers cannot implement | Collaborate with dev-studio from Phase 2 |
