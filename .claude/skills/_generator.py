"""MIDAS v3.0 Studio Generator — Creates all remaining studio files."""
import os

BASE = r"F:\Million Dollar AI Studio\Framework\.claude\skills"

def write(path, content):
    full = os.path.join(BASE, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"  Created: {path}")

def agent(name, studio, role, exp, philosophy, tone, caps, forbidden, inputs, outputs, spawn_method, spawn_reason, checks, escalation):
    return f"""---
name: {name}
studio: {studio}
role: "{role}"
tier: 3
model_routing:
  default: sonnet
  complex: opus
  simple: haiku
---

# {role}

## Identity
- **Role:** {role}
- **Experience:** {exp}
- **Philosophy:** "{philosophy}"

## Communication Style
- **Tone:** {tone}
- **Rules:**
  - NEVER use introductory filler
  - Output raw artifacts without wrappers
  - Use precise, domain-specific terminology

## Capabilities
{chr(10).join(f'- {c}' for c in caps)}

## Forbidden Actions
{chr(10).join(f'- {f}' for f in forbidden)}

## Inputs
{chr(10).join(f'- {i}' for i in inputs)}

## Outputs
{chr(10).join(f'- {o}' for o in outputs)}

## Spawning Rule
- **Method:** {spawn_method}
- **Reason:** {spawn_reason}

## Quality Self-Check
Before returning output, verify:
{chr(10).join(f'- [ ] {c}' for c in checks)}

## Escalation
{chr(10).join(f'- {e}' for e in escalation)}
"""

def skill_md(name, desc, activation, deps, title, mission, roster_rows, pipeline, spawn_always_sub, spawn_always_inline, spawn_context, budget_rows, gates, integrations, templates_rows):
    roster = "| Agent | File | Spawning | Primary Output |\n|-------|------|----------|----------------|\n"
    roster += "\n".join(f"| {r[0]} | agents/{r[1]}.md | {r[2]} | {r[3]} |" for r in roster_rows)
    budget = "| Phase | Estimated Cost | Model |\n|-------|---------------|-------|\n"
    budget += "\n".join(f"| {b[0]} | {b[1]} | {b[2]} |" for b in budget_rows)
    tmpl = "| Template | File | When to Use | Tier |\n|----------|------|-------------|------|\n"
    tmpl += "\n".join(f"| {t[0]} | templates/{t[1]}.md | {t[2]} | {t[3]} |" for t in templates_rows)
    return f"""---
name: {name}
description: "{desc}"
activation: "{activation}"
tier: 2
dependencies: {deps}
---

# {name.replace('-', ' ').title().replace(' Studio', ' Studio')} — {title}

## Mission
{mission}

## Team Roster
{roster}

## Pipeline
```
{pipeline}
```

## Spawning Rules
- **ALWAYS subagent:** {spawn_always_sub}
- **ALWAYS inline:** {spawn_always_inline}
- **Context-dependent:** {spawn_context}

## Budget
{budget}

## Quality Gates
{chr(10).join(f'- **{g[0]}:** {g[1]}' for g in gates)}

## Integration Points
{chr(10).join(f'- {i}' for i in integrations)}

## Templates Available
{tmpl}
"""

def workflow(name, studio, desc, cost, phases_text):
    return f"""---
name: {name}
studio: {studio}
description: "{desc}"
estimated_cost: "{cost}"
---

# {name.replace('-', ' ').title()}

## Overview
{desc}

## Trigger
Activated when task matches this workflow's domain.

## Prerequisites
- Studio SKILL.md loaded
- Required inputs available from prior phase or human

{phases_text}

## Error Recovery
- Phase failure: retry once with enhanced context, then escalate to department head
- Budget exceeded: halt and report to department head
"""

def template(title, content):
    return f"# {title}\n\n{content}"

def reference(title, content):
    return f"# {title}\n\n{content}"

# ============================================================
# DESIGN STUDIO
# ============================================================
print("\n=== DESIGN STUDIO ===")

write("design-studio/SKILL.md", skill_md(
    "design-studio",
    "Design studio for UI/UX. Creates beautiful, usable, accessible interfaces and visual systems. Produces specifications that dev-studio implements.",
    "design, wireframe, UI/UX, accessibility, design system, mockup, prototype",
    "[brand-studio]",
    "VP of Design",
    "Create beautiful, usable, accessible interfaces and visual systems.",
    [
        ("Design Director", "design-director", "Inline", "Creative direction"),
        ("UX Researcher", "ux-researcher", "Inline/Subagent", "Usability analysis"),
        ("UI Designer", "ui-designer", "Subagent", "Component designs"),
        ("Interaction Designer", "interaction-designer", "Inline", "Animation specs"),
        ("Design System Architect", "design-system-architect", "Subagent", "Design tokens, component library"),
        ("Accessibility Auditor", "accessibility-auditor", "ALWAYS Subagent", "WCAG audit reports"),
        ("Responsive Specialist", "responsive-specialist", "Inline", "Breakpoint strategy"),
    ],
    "Brief → [Director: Strategy] → [UX: Research] → [UI: Design] → [Interaction: Animate]\n  → [Design System: Systematize] → [A11y Auditor: Review] → Handoff to dev",
    "accessibility-auditor (adversarial — WCAG compliance must be independently verified)",
    "design-director, interaction-designer, responsive-specialist (short deterministic output)",
    "ux-researcher (inline for heuristics, subagent for full audits); ui-designer, design-system-architect (subagent for large output)",
    [("Strategy", "$0.005", "haiku"), ("Research", "$0.015", "sonnet"), ("Design", "$0.040", "sonnet"), ("Systematize", "$0.020", "sonnet"), ("Review", "$0.010", "sonnet"), ("**Total**", "**$0.090**", "—")],
    [("WCAG Compliance", "All UI output meets WCAG 2.1 AA"), ("Visual Consistency", "Design tokens applied consistently"), ("Responsiveness", "All layouts tested at mobile/tablet/desktop breakpoints")],
    ["Provides TO dev-studio: design tokens, component specs, interaction patterns", "Receives FROM brand-studio: brand guidelines, color palette, typography", "When loaded WITH dev-studio: design specs become implementation requirements"],
    [("Design Tokens", "design-tokens", "New design system", "1"), ("Component Spec", "component-spec", "Component design", "2"), ("Page Layout", "page-layout", "Page design", "1"), ("Interaction Spec", "interaction-spec", "Animation design", "2"), ("Breakpoints", "responsive-breakpoints", "Responsive design", "1"), ("A11y Checklist", "a11y-checklist", "Accessibility review", "1")],
))

for a in [
    ("design-director", "design-studio", "Design Director", "16 years in product design leadership",
     "Great design is invisible — users notice when it is bad, never when it is good",
     "Visionary yet practical, aesthetically opinionated but data-informed",
     ["Set creative direction and visual strategy", "Ensure brand alignment across all design output", "Review and approve design system decisions", "Translate business requirements into design briefs"],
     ["Writing code or markup — REASON: director designs, developers implement", "Making unilateral tech stack decisions — REASON: dev-studio's domain", "Skipping accessibility review — REASON: a11y is non-negotiable"],
     ["Project brief with business objectives", "Brand guidelines from brand-studio"],
     ["Design strategy brief", "Creative direction document", "Design review feedback"],
     "Inline", "Strategic decisions are short structured output",
     ["Design direction aligns with brand guidelines", "Brief is actionable for UI designer", "Accessibility requirements stated upfront"],
     ["If brand guidelines conflict with usability: escalate to CEO for resolution"]),
    ("ux-researcher", "design-studio", "UX Researcher", "8 years in usability research and information architecture",
     "Every pixel should earn its place through user validation",
     "Analytical, user-advocating, evidence-driven",
     ["Heuristic evaluation using Nielsen's 10 heuristics", "User flow mapping and task analysis", "Information architecture review", "Usability issue severity classification"],
     ["Designing visual solutions — REASON: UX identifies problems, UI solves them", "Ignoring edge case user flows — REASON: edge cases reveal design failures"],
     ["Existing designs or wireframes to evaluate", "User task scenarios", "Analytics data if available"],
     ["Heuristic evaluation report", "User flow diagrams", "Usability issue log with severity ratings"],
     "Inline/Subagent", "Inline for quick heuristic reviews; subagent for comprehensive UX audits",
     ["Every issue has severity rating", "Heuristics cited for each finding", "Recommendations are specific, not vague"],
     ["If fundamental IA issues found: escalate to design-director before UI work begins"]),
    ("ui-designer", "design-studio", "UI Designer", "10 years in interface design and visual systems",
     "Consistency is the foundation of usable interfaces",
     "Creative, systematic, detail-oriented",
     ["Component design with all states (default, hover, active, disabled, error)", "Layout systems using grid and spacing tokens", "Visual hierarchy through typography, color, and spacing", "Icon and illustration direction"],
     ["Writing production CSS/code — REASON: designer specifies, developer implements", "Ignoring design token system — REASON: tokens ensure consistency", "Designing without considering responsive behavior — REASON: mobile-first is mandatory"],
     ["Design brief from design-director", "Design tokens from design-system-architect", "Brand guidelines"],
     ["Component specifications (templates/component-spec.md)", "Page layout designs (templates/page-layout.md)", "Visual asset specifications"],
     "Subagent", "Creative design work benefits from focused context",
     ["All components use design tokens (no hardcoded values)", "All states designed (default, hover, active, disabled, error, loading)", "Visual hierarchy is clear and intentional"],
     ["If design tokens insufficient: request additions from design-system-architect"]),
    ("interaction-designer", "design-studio", "Interaction Designer", "7 years in motion design and microinteraction engineering",
     "Motion should guide, not distract",
     "Precise, timing-focused, animation-literate",
     ["Microinteraction specification (trigger, animation, timing)", "State transition definitions", "Loading and progress indicator design", "Gesture and input feedback patterns"],
     ["Implementing animations in code — REASON: specifies timing, developer implements", "Gratuitous animation — REASON: every motion must serve a purpose"],
     ["UI designs from ui-designer", "User flow from ux-researcher"],
     ["Interaction specifications (templates/interaction-spec.md)", "Animation timing sheets", "State transition diagrams"],
     "Inline", "Structured timing specs are short deterministic output",
     ["Every animation has purpose documented", "Timing values use standard easing curves", "Reduced motion alternatives specified"],
     ["If animation conflicts with performance budgets: consult with dev-studio frontend developer"]),
    ("design-system-architect", "design-studio", "Design System Architect", "12 years building design systems at scale",
     "A design system is a product, not a project",
     "Systematic, token-oriented, scalability-focused",
     ["Design token definition (color, typography, spacing, elevation, motion)", "Component library architecture", "Theme system design (light/dark, brand variations)", "Token naming convention and hierarchy"],
     ["Designing individual pages — REASON: system architect builds the system, not the pages", "Creating tokens without usage guidelines — REASON: tokens need context"],
     ["Brand guidelines from brand-studio", "Design direction from design-director"],
     ["Design token specification (templates/design-tokens.md)", "Component library structure", "Theme configuration"],
     "Subagent", "Full design system specification is large output requiring focus",
     ["Token naming follows consistent convention", "All tokens have usage guidelines", "Theme switching works without component changes"],
     ["If token system grows beyond 200 tokens: recommend consolidation to design-director"]),
    ("accessibility-auditor", "design-studio", "Accessibility Auditor", "9 years in WCAG compliance and assistive technology",
     "Accessibility is not a feature — it is a right",
     "Rigorous, compliance-focused, user-advocating",
     ["WCAG 2.1 AA compliance auditing", "Color contrast ratio verification", "Screen reader compatibility assessment", "Keyboard navigation testing", "Focus management review"],
     ["Approving designs that fail WCAG AA — REASON: compliance is non-negotiable", "Accepting 'will fix later' for critical a11y issues — REASON: shipping inaccessible is shipping broken"],
     ["UI designs, component specs, or implemented pages", "WCAG 2.1 AA criteria"],
     ["Accessibility audit report with violations", "Remediation recommendations", "Compliance scorecard"],
     "ALWAYS Subagent", "Adversarial — accessibility review must be independently verified with fresh context",
     ["Every violation has WCAG criterion reference", "Contrast ratios calculated for all text", "Keyboard navigation path verified", "Focus indicators documented"],
     ["If critical a11y violations found: HALT design handoff until fixed"]),
    ("responsive-specialist", "design-studio", "Responsive Specialist", "7 years in responsive and adaptive design",
     "Mobile-first is not a preference, it is physics — small screens have the hardest constraints",
     "Pragmatic, breakpoint-aware, mobile-first",
     ["Breakpoint strategy definition", "Mobile-first layout adaptation", "Touch target sizing", "Responsive typography scaling"],
     ["Designing desktop-first layouts — REASON: mobile-first ensures core content priority", "Ignoring touch target minimums — REASON: 44x44px minimum is a usability requirement"],
     ["Page layouts from ui-designer", "Design tokens from design-system-architect"],
     ["Responsive breakpoint strategy (templates/responsive-breakpoints.md)", "Layout adaptation specifications per breakpoint"],
     "Inline", "Deterministic breakpoint rules produce short structured output",
     ["Mobile layout prioritizes core content", "Touch targets meet 44x44px minimum", "Typography scales appropriately across breakpoints"],
     ["If layout cannot adapt to mobile: escalate to ui-designer for redesign"]),
]:
    write(f"design-studio/agents/{a[0]}.md", agent(*a))

# Design studio workflows
for name, desc, cost, phases in [
    ("full-design-pipeline", "End-to-end design process from brief to developer handoff", "$0.090",
     "## Phase 1: Strategy\n### Agent: design-director (Inline)\nDefine creative direction, review brand guidelines, set design objectives.\n### Output: Design strategy brief\n\n## Phase 2: Research\n### Agent: ux-researcher (Inline/Subagent)\nHeuristic evaluation, user flow mapping, information architecture review.\n### Output: UX research findings\n\n## Phase 3: Design\n### Agent: ui-designer (Subagent)\nComponent design, page layouts, visual hierarchy using design tokens.\n### Output: UI specifications\n\n## Phase 4: Interaction\n### Agent: interaction-designer (Inline)\nMicrointeraction specs, state transitions, animation timing.\n### Output: Interaction specifications\n\n## Phase 5: Systematize\n### Agent: design-system-architect (Subagent)\nDesign tokens, component library, theme system.\n### Output: Design system specification\n\n## Phase 6: Review\n### Agent: accessibility-auditor (ALWAYS Subagent)\nWCAG 2.1 AA compliance audit, contrast checks, keyboard nav.\n### Output: Accessibility audit report\n### Gate: Zero critical a11y violations before handoff"),
    ("design-system-creation", "Create design token system and component library from scratch", "$0.060",
     "## Phase 1: Audit\nReview existing brand assets and guidelines.\n### Output: Brand asset inventory\n\n## Phase 2: Tokens\n### Agent: design-system-architect (Subagent)\nDefine color, typography, spacing, elevation, motion tokens.\n### Output: Token specification\n\n## Phase 3: Components\n### Agent: ui-designer (Subagent)\nDesign core components using token system.\n### Output: Component specifications\n\n## Phase 4: Review\n### Agent: accessibility-auditor (ALWAYS Subagent)\nVerify all components meet WCAG AA.\n### Output: Component a11y audit"),
    ("design-review-pipeline", "Multi-dimensional design review: heuristics + accessibility + responsive", "$0.025",
     "## Phase 1: Heuristic Review\n### Agent: ux-researcher (Inline)\nNielsen's 10 heuristics evaluation.\n\n## Phase 2: Accessibility Review\n### Agent: accessibility-auditor (ALWAYS Subagent)\nWCAG 2.1 AA compliance check.\n\n## Phase 3: Responsive Review\n### Agent: responsive-specialist (Inline)\nBreakpoint behavior verification.\n\n## Merge: Combine findings, prioritize by severity."),
    ("rapid-prototype-pipeline", "Quick wireframe to mockup for concept validation", "$0.030",
     "## Phase 1: Wireframe\n### Agent: ui-designer (Subagent)\nLow-fidelity layout with content hierarchy.\n\n## Phase 2: Quick Review\n### Agent: ux-researcher (Inline)\nFast heuristic check on wireframe.\n\n## Phase 3: Mockup\n### Agent: ui-designer (Subagent)\nApply visual design to approved wireframe."),
]:
    write(f"design-studio/workflows/{name}.md", workflow(name, "design-studio", desc, cost, phases))

# Design studio templates
for name, title, content in [
    ("design-tokens", "Design Token Specification", """## Color Tokens
| Token | Value | Usage |
|-------|-------|-------|
| --color-primary | #[hex] | Primary actions, links |
| --color-secondary | #[hex] | Secondary actions |
| --color-surface | #[hex] | Card/panel backgrounds |
| --color-background | #[hex] | Page background |
| --color-text-primary | #[hex] | Body text |
| --color-text-secondary | #[hex] | Supporting text |
| --color-error | #[hex] | Error states |
| --color-success | #[hex] | Success states |
| --color-warning | #[hex] | Warning states |

## Typography Tokens
| Token | Value | Usage |
|-------|-------|-------|
| --font-family-primary | [family] | Body text, UI elements |
| --font-family-heading | [family] | Headings |
| --font-size-xs | 0.75rem | Captions, labels |
| --font-size-sm | 0.875rem | Secondary text |
| --font-size-base | 1rem | Body text |
| --font-size-lg | 1.125rem | Large body |
| --font-size-xl | 1.5rem | H3 |
| --font-size-2xl | 2rem | H2 |
| --font-size-3xl | 2.5rem | H1 |

## Spacing Tokens
| Token | Value | Usage |
|-------|-------|-------|
| --space-1 | 0.25rem (4px) | Tight spacing |
| --space-2 | 0.5rem (8px) | Element padding |
| --space-3 | 0.75rem (12px) | Card padding |
| --space-4 | 1rem (16px) | Section spacing |
| --space-6 | 1.5rem (24px) | Component gaps |
| --space-8 | 2rem (32px) | Section gaps |
| --space-12 | 3rem (48px) | Page sections |

## Elevation Tokens
| Token | Value | Usage |
|-------|-------|-------|
| --shadow-sm | 0 1px 2px rgba(0,0,0,0.05) | Subtle lift |
| --shadow-md | 0 4px 6px rgba(0,0,0,0.1) | Cards, dropdowns |
| --shadow-lg | 0 10px 15px rgba(0,0,0,0.1) | Modals, popovers |"""),
    ("component-spec", "Component Specification", """## Component: [Name]

### Description
[What this component does and when to use it]

### Variants
- Default
- [Variant 2]
- [Variant 3]

### States
| State | Visual Change | Trigger |
|-------|--------------|---------|
| Default | [description] | Initial render |
| Hover | [description] | Mouse over |
| Active/Pressed | [description] | Mouse down |
| Focused | [description] | Keyboard focus |
| Disabled | [description] | disabled prop |
| Loading | [description] | async operation |
| Error | [description] | validation failure |

### Props/API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| [prop] | [type] | [default] | [description] |

### Tokens Used
- Background: --color-[token]
- Text: --color-[token]
- Padding: --space-[token]
- Border radius: --radius-[token]

### Accessibility
- Role: [ARIA role]
- Keyboard: [keyboard interaction]
- Screen reader: [announcement behavior]"""),
    ("page-layout", "Page Layout Patterns", """## Layout: Dashboard
- Sidebar (240px fixed) + Main content (fluid)
- Top nav bar (64px fixed)
- Content area with 16px grid gap

## Layout: Marketing Landing
- Full-width hero section
- Centered content (max-width: 1200px)
- Alternating sections with subtle background variation

## Layout: Form Page
- Centered card (max-width: 640px)
- Single column form layout
- Sticky submit bar on mobile

## Layout: List/Table
- Filters bar (sticky)
- Scrollable table/list area
- Pagination or infinite scroll footer

## Grid System
- 12-column grid
- Gutter: 24px (desktop), 16px (tablet), 12px (mobile)
- Max container: 1280px"""),
    ("interaction-spec", "Interaction Specification", """## Interaction: [Name]

### Trigger
[What initiates this interaction — click, hover, scroll, load]

### Animation
| Property | From | To | Duration | Easing |
|----------|------|----|----------|--------|
| opacity | 0 | 1 | 200ms | ease-out |
| transform | translateY(8px) | translateY(0) | 200ms | ease-out |

### Standard Timing
- Micro (instant feedback): 100-150ms
- Short (UI transitions): 200-300ms
- Medium (content transitions): 300-500ms
- Long (page transitions): 500-800ms

### Standard Easing
- ease-out: Elements entering (decelerate into rest)
- ease-in: Elements exiting (accelerate away)
- ease-in-out: Elements moving between positions

### Reduced Motion
When prefers-reduced-motion is active:
- Replace animations with instant state changes
- Keep opacity transitions (reduced to 100ms)
- Remove all transform animations"""),
    ("responsive-breakpoints", "Responsive Breakpoint Strategy", """## Breakpoints
| Name | Min Width | Target |
|------|-----------|--------|
| mobile | 0px | Phones (portrait) |
| tablet | 768px | Tablets, phones (landscape) |
| desktop | 1024px | Laptops, small monitors |
| wide | 1280px | Large monitors |

## Mobile-First Rules
1. Default styles target mobile
2. Use min-width media queries to add complexity
3. Never hide core content — reflow it

## Touch Targets
- Minimum: 44x44px
- Recommended: 48x48px
- Spacing between targets: 8px minimum

## Typography Scaling
| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| H1 | 1.75rem | 2rem | 2.5rem |
| H2 | 1.5rem | 1.75rem | 2rem |
| Body | 1rem | 1rem | 1rem |
| Small | 0.875rem | 0.875rem | 0.875rem |"""),
    ("a11y-checklist", "WCAG 2.1 AA Compliance Checklist", """## Perceivable
- [ ] Color contrast ratio >= 4.5:1 for normal text
- [ ] Color contrast ratio >= 3:1 for large text (18px+ or 14px+ bold)
- [ ] Information not conveyed by color alone
- [ ] All images have meaningful alt text
- [ ] Video has captions
- [ ] Audio has transcripts

## Operable
- [ ] All functionality available via keyboard
- [ ] No keyboard traps
- [ ] Focus indicator visible on all interactive elements
- [ ] Skip navigation link present
- [ ] No content flashes more than 3 times per second
- [ ] Touch targets minimum 44x44px

## Understandable
- [ ] Page language declared in HTML
- [ ] Form labels associated with inputs
- [ ] Error messages are specific and helpful
- [ ] Required fields clearly indicated
- [ ] Consistent navigation across pages

## Robust
- [ ] Valid HTML markup
- [ ] ARIA roles used correctly
- [ ] Name, role, value available for custom components
- [ ] Works with screen readers (VoiceOver, NVDA)"""),
]:
    write(f"design-studio/templates/{name}.md", template(title, content))

# Design studio references
for name, title, content in [
    ("design-principles", "MDS Design Principles", "## 1. Clarity Over Cleverness\nEvery element must communicate its purpose immediately.\n\n## 2. Consistency Is Kindness\nConsistent patterns reduce cognitive load.\n\n## 3. Accessible By Default\nAccessibility is not an afterthought.\n\n## 4. Content First\nDesign serves content, not the other way around.\n\n## 5. Progressive Disclosure\nShow what is needed when it is needed.\n\n## 6. Responsive Is Responsible\nEvery screen size deserves a good experience."),
    ("color-theory", "Color Theory Reference", "## Contrast Ratios (WCAG)\n- Normal text: 4.5:1 minimum\n- Large text (18px+): 3:1 minimum\n- UI components: 3:1 minimum\n\n## Color Harmony\n- Complementary: opposite on wheel (high contrast)\n- Analogous: adjacent on wheel (harmonious)\n- Triadic: equidistant on wheel (vibrant)\n\n## Semantic Colors\n- Red/Orange: error, danger, destructive\n- Green: success, positive, growth\n- Yellow/Amber: warning, caution\n- Blue: information, trust, primary action\n- Gray: neutral, disabled, secondary"),
    ("typography-guide", "Typography Guide", "## Type Scale (1.25 ratio)\n- xs: 12px / 0.75rem\n- sm: 14px / 0.875rem\n- base: 16px / 1rem\n- lg: 20px / 1.25rem\n- xl: 25px / 1.563rem\n- 2xl: 31px / 1.953rem\n- 3xl: 39px / 2.441rem\n\n## Line Height\n- Headings: 1.2-1.3\n- Body: 1.5-1.6\n- UI labels: 1.2\n\n## Font Pairing Rules\n- Pair serif heading with sans-serif body\n- Maximum 2 font families per project\n- Use weight variation within a family for hierarchy"),
    ("motion-design-guide", "Motion Design Guide", "## Animation Principles\n1. **Duration:** UI transitions 200-500ms, decorative 500-1000ms\n2. **Easing:** ease-out for enter, ease-in for exit, ease-in-out for move\n3. **Purpose:** Every animation must guide attention or provide feedback\n4. **Restraint:** Less is more — animate only what needs attention\n\n## Reduced Motion\nAlways provide `prefers-reduced-motion` alternatives:\n- Replace slide/scale with fade\n- Reduce durations to 100ms\n- Remove parallax and auto-play"),
    ("wcag-reference", "WCAG 2.1 AA Quick Reference", "## Level A (Minimum)\n- Alt text for images\n- Keyboard accessible\n- No keyboard traps\n- Page titled\n- Focus order logical\n- Link purpose clear\n\n## Level AA (Target)\n- Contrast 4.5:1 normal, 3:1 large\n- Text resizable to 200%\n- Multiple ways to find pages\n- Consistent navigation\n- Consistent identification\n- Error suggestion\n- Error prevention (legal/financial)\n\n## Testing Tools\n- axe DevTools (automated)\n- Lighthouse (automated)\n- VoiceOver/NVDA (manual screen reader)\n- Keyboard-only navigation (manual)"),
    ("platform-conventions", "Platform Design Conventions", "## Web\n- Navigation: top bar or left sidebar\n- Actions: buttons on right, cancel on left\n- Modals: centered overlay with backdrop\n\n## iOS (HIG)\n- Navigation: tab bar (bottom), nav bar (top)\n- Actions: trailing edge, destructive in red\n- Typography: SF Pro, Dynamic Type support\n\n## Android (Material)\n- Navigation: bottom navigation, drawer\n- Actions: FAB for primary, top app bar for secondary\n- Typography: Roboto, Material type scale\n\n## Cross-Platform\n- Respect platform conventions over consistency\n- Use native components where possible\n- Test on actual devices, not just emulators"),
]:
    write(f"design-studio/references/{name}.md", reference(title, content))

# Design studio scripts
write("design-studio/scripts/contrast_checker.py", '''"""WCAG Contrast Ratio Checker"""

def relative_luminance(r, g, b):
    """Calculate relative luminance per WCAG 2.1."""
    def linearize(c):
        c = c / 255.0
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b)

def contrast_ratio(color1, color2):
    """Calculate contrast ratio between two RGB tuples."""
    l1 = relative_luminance(*color1)
    l2 = relative_luminance(*color2)
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)

def check_wcag(fg, bg):
    """Check WCAG 2.1 AA compliance."""
    ratio = contrast_ratio(fg, bg)
    return {
        "ratio": round(ratio, 2),
        "aa_normal": ratio >= 4.5,
        "aa_large": ratio >= 3.0,
        "aaa_normal": ratio >= 7.0,
        "aaa_large": ratio >= 4.5,
    }

def hex_to_rgb(hex_color):
    """Convert hex color to RGB tuple."""
    hex_color = hex_color.lstrip("#")
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

if __name__ == "__main__":
    import sys
    if len(sys.argv) == 3:
        fg = hex_to_rgb(sys.argv[1])
        bg = hex_to_rgb(sys.argv[2])
        result = check_wcag(fg, bg)
        print(f"Contrast ratio: {result['ratio']}:1")
        print(f"AA Normal text: {'PASS' if result['aa_normal'] else 'FAIL'}")
        print(f"AA Large text:  {'PASS' if result['aa_large'] else 'FAIL'}")
    else:
        print("Usage: python contrast_checker.py #foreground #background")
''')

write("design-studio/scripts/token_generator.py", '''"""Generate CSS Custom Properties from token specification."""

def generate_css(tokens):
    """Convert token dict to CSS custom properties."""
    lines = [":root {"]
    for category, values in tokens.items():
        lines.append(f"  /* {category} */")
        for name, value in values.items():
            lines.append(f"  --{category}-{name}: {value};")
        lines.append("")
    lines.append("}")
    return "\\n".join(lines)

EXAMPLE_TOKENS = {
    "color": {
        "primary": "#2563EB",
        "secondary": "#7C3AED",
        "surface": "#FFFFFF",
        "background": "#F8FAFC",
        "text-primary": "#0F172A",
        "text-secondary": "#64748B",
        "error": "#DC2626",
        "success": "#16A34A",
        "warning": "#D97706",
    },
    "space": {
        "1": "0.25rem",
        "2": "0.5rem",
        "3": "0.75rem",
        "4": "1rem",
        "6": "1.5rem",
        "8": "2rem",
        "12": "3rem",
    },
    "font-size": {
        "xs": "0.75rem",
        "sm": "0.875rem",
        "base": "1rem",
        "lg": "1.125rem",
        "xl": "1.5rem",
        "2xl": "2rem",
        "3xl": "2.5rem",
    },
}

if __name__ == "__main__":
    print(generate_css(EXAMPLE_TOKENS))
''')

print(f"Design studio complete")

# ============================================================
# BRAND STUDIO
# ============================================================
print("\n=== BRAND STUDIO ===")

write("brand-studio/SKILL.md", skill_md(
    "brand-studio",
    "Brand identity studio. Owns and protects brand identity across every touchpoint. Provides guidelines to content, marketing, design, and ads studios.",
    "brand voice, visual identity, naming, brand audit, brand guidelines, tone",
    "[]",
    "VP of Brand",
    "Own and protect the brand identity across every touchpoint.",
    [
        ("Brand Strategist", "brand-strategist", "Inline", "Positioning, messaging"),
        ("Brand Voice Guardian", "brand-voice-guardian", "ALWAYS Subagent", "Voice audit reports"),
        ("Visual Identity Manager", "visual-identity-manager", "Inline", "Visual compliance checks"),
        ("Naming Specialist", "naming-specialist", "Subagent", "Product/feature names"),
    ],
    "Brief → [Strategist: Position] → [Voice Guardian: Audit] → Guidelines",
    "brand-voice-guardian (adversarial — voice compliance must be independently verified)",
    "brand-strategist, visual-identity-manager (short deterministic output)",
    "naming-specialist (subagent for creative brainstorming)",
    [("Strategy", "$0.005", "sonnet"), ("Audit", "$0.010", "sonnet"), ("**Total**", "**$0.015**", "—")],
    [("Voice Consistency", "All content passes brand voice check"), ("Visual Compliance", "All designs use approved assets")],
    ["Provides TO content-studio, marketing-studio, ads-studio, design-studio: brand guidelines, voice rules", "Source of truth for all brand-related decisions"],
    [("Brand Brief", "brand-brief", "New positioning work", "2"), ("Messaging Matrix", "messaging-matrix", "Audience messaging", "1"), ("Brand Audit", "brand-audit-scorecard", "Consistency check", "1")],
))

for a in [
    ("brand-strategist", "brand-studio", "Brand Strategist", "14 years in brand strategy and positioning",
     "A brand is not what you say it is — it is what they say it is",
     "Strategic, narrative-driven, positioning-focused",
     ["Brand positioning development", "Messaging hierarchy creation", "Value proposition articulation", "Brand architecture design"],
     ["Designing visual assets — REASON: visual-identity-manager's domain", "Writing content — REASON: content-studio's domain"],
     ["Business objectives", "Target audience profiles", "Competitive landscape"],
     ["Brand positioning statement", "Messaging hierarchy", "Value proposition matrix"],
     "Inline", "Strategic decisions are short structured output",
     ["Positioning is differentiated from competitors", "Messaging hierarchy is consistent", "Value props are evidence-backed"],
     ["If positioning conflicts across products: escalate to CEO"]),
    ("brand-voice-guardian", "brand-studio", "Brand Voice Guardian", "10 years in editorial and brand management",
     "Every word is a brand decision",
     "Rigorous, editorial, consistency-obsessed",
     ["Voice consistency auditing across all content", "Tone calibration for different audiences", "Prohibited language detection", "Brand compliance scoring"],
     ["Writing or rewriting content — REASON: guardian audits, writers create", "Approving content that violates voice guidelines — REASON: compliance is non-negotiable"],
     ["Content to review from any studio", "Brand voice guidelines"],
     ["Voice audit report with violations", "Compliance score", "Specific remediation instructions"],
     "ALWAYS Subagent", "Adversarial — voice review must be independent with fresh context",
     ["Every violation cites specific guideline rule", "Remediation instructions are specific and actionable", "Compliance score calculated consistently"],
     ["If systemic voice violations found: report to brand-strategist for guideline review"]),
    ("visual-identity-manager", "brand-studio", "Visual Identity Manager", "8 years in brand design and identity systems",
     "Consistency builds recognition — recognition builds trust",
     "Rule-based, visual-system-focused, compliance-oriented",
     ["Logo usage compliance verification", "Color palette enforcement", "Typography standards checking", "Brand asset management"],
     ["Designing new visual assets — REASON: design-studio creates, brand-studio enforces", "Approving off-brand usage — REASON: exceptions erode brand equity"],
     ["Visual assets to review", "Brand visual standards"],
     ["Visual compliance report", "Asset usage corrections"],
     "Inline", "Rule-based visual checks produce short deterministic output",
     ["Logo usage meets clear space requirements", "Colors match approved palette", "Typography uses approved fonts"],
     ["If brand assets need updating: coordinate with design-studio"]),
    ("naming-specialist", "brand-studio", "Naming Specialist", "9 years in brand naming and verbal identity",
     "The best names are inevitable in hindsight",
     "Creative, linguistic, culturally-aware",
     ["Product and feature naming", "Campaign naming", "Trademark preliminary screening", "Name testing criteria development"],
     ["Final trademark decisions — REASON: legal-studio handles IP", "Naming without checking cultural implications — REASON: names travel across cultures"],
     ["Naming brief with context and constraints", "Existing brand architecture"],
     ["Name candidates with rationale", "Naming scorecard", "Preliminary trademark notes"],
     "Subagent", "Creative naming needs focused brainstorming context",
     ["Multiple candidates presented (minimum 5)", "Cultural/linguistic checks noted", "Domain/trademark preliminary check done"],
     ["If trademark conflict suspected: escalate to legal-studio for formal check"]),
]:
    write(f"brand-studio/agents/{a[0]}.md", agent(*a))

# Brand studio workflows, templates, references
for name, desc, cost, phases in [
    ("brand-audit-pipeline", "Full brand consistency check across all assets and touchpoints", "$0.020",
     "## Phase 1: Inventory\nCatalog all brand touchpoints and assets.\n\n## Phase 2: Voice Audit\n### Agent: brand-voice-guardian (ALWAYS Subagent)\nReview content for voice consistency.\n\n## Phase 3: Visual Audit\n### Agent: visual-identity-manager (Inline)\nCheck visual assets for compliance.\n\n## Phase 4: Report\nConsolidate findings with remediation priorities."),
    ("naming-pipeline", "Creative naming from brief to final candidate selection", "$0.015",
     "## Phase 1: Brief\n### Agent: brand-strategist (Inline)\nDefine naming criteria, constraints, and brand fit.\n\n## Phase 2: Generate\n### Agent: naming-specialist (Subagent)\nBrainstorm 20+ candidates, filter to top 10.\n\n## Phase 3: Screen\nPreliminary trademark and cultural checks.\n\n## Phase 4: Select\nScore top 5, present to human for final decision."),
    ("brand-refresh-pipeline", "Evolution of brand elements while maintaining equity", "$0.025",
     "## Phase 1: Audit Current Brand\nAssess what works and what needs evolution.\n\n## Phase 2: Strategy\n### Agent: brand-strategist (Inline)\nDefine refresh objectives and boundaries.\n\n## Phase 3: Evolve\nUpdate elements while preserving brand equity.\n\n## Phase 4: Validate\n### Agent: brand-voice-guardian (ALWAYS Subagent)\nVerify refresh maintains brand recognition."),
]:
    write(f"brand-studio/workflows/{name}.md", workflow(name, "brand-studio", desc, cost, phases))

for name, title, content in [
    ("brand-brief", "Brand Positioning Brief", "## Brand Name\n[name]\n\n## Category\n[what category we compete in]\n\n## Target Audience\n[primary audience description]\n\n## Brand Promise\n[one sentence — what we promise]\n\n## Positioning Statement\nFor [target audience] who [need/want], [brand] is the [category] that [key benefit] because [reason to believe].\n\n## Brand Values\n1. [Value 1] — [what it means in practice]\n2. [Value 2]\n3. [Value 3]\n\n## Competitive Differentiation\n[How we are fundamentally different from alternatives]"),
    ("messaging-matrix", "Messaging Matrix", "## Structure\n| Audience | Primary Message | Supporting Points | Proof Points | Tone |\n|----------|----------------|-------------------|-------------|------|\n| [Audience 1] | [key message] | [3 supports] | [evidence] | [tone] |\n| [Audience 2] | [key message] | [3 supports] | [evidence] | [tone] |\n| [Audience 3] | [key message] | [3 supports] | [evidence] | [tone] |\n\n## Message Hierarchy\n1. **Umbrella message:** [overarching brand message]\n2. **Pillar 1:** [supporting theme]\n3. **Pillar 2:** [supporting theme]\n4. **Pillar 3:** [supporting theme]"),
    ("brand-audit-scorecard", "Brand Audit Scorecard", "## Scoring (1-5 per dimension)\n| Dimension | Score | Notes |\n|-----------|-------|-------|\n| Voice consistency | [1-5] | [notes] |\n| Visual consistency | [1-5] | [notes] |\n| Messaging clarity | [1-5] | [notes] |\n| Differentiation | [1-5] | [notes] |\n| Audience resonance | [1-5] | [notes] |\n| **Overall** | **[avg]** | |\n\n## Critical Issues\n- [Issue 1]: [severity] — [remediation]\n\n## Strengths\n- [Strength 1]: [evidence]"),
]:
    write(f"brand-studio/templates/{name}.md", template(title, content))

for name, title, content in [
    ("brand-guidelines", "MDS Brand Guidelines", "## Brand Voice\n- **Primary tone:** Authoritative yet approachable\n- **Technical level:** Expert-accessible (explain complex ideas simply)\n- **Personality:** Confident, innovative, human-centered\n\n## Voice Spectrum\n| Context | Formality | Technical | Warmth |\n|---------|-----------|-----------|--------|\n| Client proposals | High | Medium | Medium |\n| Blog posts | Medium | Varies | High |\n| Social media | Low-Medium | Low | High |\n| Documentation | Medium | High | Low |\n| Internal comms | Low | Medium | High |"),
    ("voice-spectrum", "Voice Spectrum", "## Formal ↔ Casual Scale\n1 (Most Formal): Legal documents, contracts\n3: Client proposals, white papers\n5 (Balanced): Blog posts, case studies\n7: Social media, newsletters\n9 (Most Casual): Internal Slack, team updates\n\n## Technical ↔ Accessible Scale\n1 (Most Technical): API documentation, architecture specs\n5 (Balanced): Product pages, feature descriptions\n9 (Most Accessible): Marketing copy, social posts\n\n## Rule: Match formality to audience and channel. Never be more formal than necessary."),
    ("visual-standards", "Visual Standards", "## Logo\n- Minimum size: 32px height\n- Clear space: 1x logo height on all sides\n- Approved colors: primary on white, white on dark\n- Never: stretch, rotate, add effects, place on busy backgrounds\n\n## Colors\n- Primary: [hex] — use for CTAs, links, key UI\n- Secondary: [hex] — use for accents, highlights\n- Neutrals: [scale from 50-900]\n\n## Typography\n- Headings: [font family], weights 600-700\n- Body: [font family], weight 400\n- Code: [monospace font], weight 400"),
    ("competitor-positioning", "Competitor Positioning", "## Our Position\n[How MDS differentiates in the market]\n\n## vs Traditional Agencies\n- They: high cost, slow delivery, human-dependent\n- We: AI-powered, fast, scalable, cost-effective\n\n## vs Solo AI Tools\n- They: single-purpose, no coordination\n- We: full-studio orchestration, quality gates, domain expertise\n\n## vs Freelancers\n- They: inconsistent quality, availability issues\n- We: consistent quality, always available, institutional knowledge"),
    ("prohibited-language", "Prohibited Language", "## Never Use\n- \"Leverage\" (use: use, apply)\n- \"Synergy\" (use: collaboration, combined effect)\n- \"Disrupt\" (use: transform, improve)\n- \"Revolutionary\" (use: significant, meaningful)\n- \"Best-in-class\" (use: specific measurable claim)\n- \"Cutting-edge\" (use: current, modern)\n- \"Game-changer\" (use: specific impact description)\n\n## Always Avoid\n- Jargon without explanation\n- Superlatives without evidence\n- Passive voice in CTAs\n- Gendered language (use: they/them defaults)\n- Ableist language (use: inclusive alternatives)"),
]:
    write(f"brand-studio/references/{name}.md", reference(title, content))

print("Brand studio complete")

print("\n=== GENERATION COMPLETE ===")
print("Studios created: design-studio, brand-studio")
