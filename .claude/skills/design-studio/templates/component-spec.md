# Component Spec Template

Use this template to fully specify a UI component before implementation. Fill in every section — incomplete specs create ambiguous implementations.

---

## Component: [Name]

### Meta

| Field | Value |
|-------|-------|
| **Component Name** | [PascalCase name, e.g., `PredictionCard`] |
| **Category** | [data-display / input / navigation / feedback / layout / overlay] |
| **Status** | [draft / review / approved / implemented] |
| **MDS Version** | [design system version, e.g., 1.3.0] |
| **Author** | [who created this spec] |
| **Date** | [YYYY-MM-DD] |

---

### Purpose

[One clear sentence: what this component does and why it exists.]

---

### Anatomy

```
+---------------------------------------------+
|  [Part 1: Name]                              |
|  [Part 2: Name]                              |
|                                               |
|  [Part 3: Name]                              |
|                                               |
|  [Part 4: Name]          [Part 5: Name]      |
+---------------------------------------------+
```

| Part | Element | Required | Description |
|------|---------|----------|-------------|
| 1 | [name] | Yes/No | [what it displays] |
| 2 | [name] | Yes/No | [what it displays] |
| 3 | [name] | Yes/No | [what it displays] |

---

### Props / API

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `variant` | `"default" \| "featured" \| "compact"` | `"default"` | No | Visual variant |
| `title` | `string` | — | Yes | Component heading |
| ... | ... | ... | ... | ... |

---

### Variants

#### Default
- [Description of default appearance]
- Tailwind: `[classes]`

#### Featured
- [Description of featured appearance]
- Tailwind: `[classes]`

#### Compact
- [Description of compact appearance]
- Tailwind: `[classes]`

---

### Visual Specification

#### Layout
```
Container: [Tailwind classes]
Inner padding: [spacing token]
Gap between children: [spacing token]
```

#### Typography
| Element | Font Size | Weight | Color | Tailwind |
|---------|-----------|--------|-------|----------|
| Title | `--mds-font-size-lg` | semibold | `--mds-color-text-primary` | `text-lg font-semibold text-slate-100` |
| ... | ... | ... | ... | ... |

#### Colors
| Element | Token | Tailwind |
|---------|-------|----------|
| Background | `--mds-color-bg-secondary` | `bg-slate-900/60` |
| Border | `--mds-color-border-subtle` | `border-slate-700/50` |
| ... | ... | ... |

#### Spacing
| Property | Token | Tailwind |
|----------|-------|----------|
| Padding | `--mds-space-6` | `p-6` |
| Gap | `--mds-space-4` | `gap-4` |
| ... | ... | ... |

---

### States

| State | Visual Change | Tailwind Additions |
|-------|--------------|-------------------|
| Default | Base styling | — |
| Hover | [describe change] | `hover:[classes]` |
| Active / Pressed | [describe change] | `active:[classes]` |
| Focus | [describe change] | `focus-visible:[classes]` |
| Disabled | [describe change] | `disabled:[classes] opacity-50 pointer-events-none` |
| Loading | [describe change] | [skeleton or spinner] |
| Error | [describe change] | `border-status-error text-status-error` |
| Empty | [describe change] | [empty state content] |

---

### Responsive Behavior

| Breakpoint | Layout Change | Tailwind |
|-----------|--------------|----------|
| Mobile (< 640px) | [stack, reduce padding, etc.] | `[classes]` |
| Tablet (640-1024px) | [adjust grid, medium padding] | `sm:[classes]` |
| Desktop (> 1024px) | [full layout, maximum padding] | `lg:[classes]` |

---

### Animation

| Trigger | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Mount | [entrance animation] | [ms] | [easing] |
| Hover | [hover effect] | [ms] | [easing] |
| State change | [transition] | [ms] | [easing] |

---

### Accessibility

| Requirement | Implementation |
|------------|----------------|
| ARIA role | `role="[role]"` |
| ARIA label | `aria-label="[label]"` |
| Keyboard | [Tab, Enter, Space, Escape behavior] |
| Screen reader | [What is announced] |
| Color contrast | [Verified ratios] |
| Focus indicator | `focus-visible:ring-2 focus-visible:ring-amber-500` |

---

### Code Skeleton

```tsx
import { cn } from "@/lib/utils";

interface [Name]Props {
  // props from API table above
}

export function [Name]({ variant = "default", ...props }: [Name]Props) {
  return (
    <div className={cn(
      "rounded-xl border border-slate-700/50 bg-slate-900/60 p-6",
      variant === "featured" && "ring-2 ring-amber-500/50",
      variant === "compact" && "p-4",
    )}>
      {/* component internals */}
    </div>
  );
}
```

---

### Usage Guidelines

#### Do
- [Correct usage example 1]
- [Correct usage example 2]

#### Don't
- [Incorrect usage example 1]
- [Incorrect usage example 2]

---

### Related Components

| Component | Relationship |
|-----------|-------------|
| [ComponentA] | [Parent / child / sibling / alternative] |
| [ComponentB] | [How they relate] |
