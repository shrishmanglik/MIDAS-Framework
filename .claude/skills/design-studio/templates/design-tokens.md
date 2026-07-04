# Design Tokens Template

Use this template to define or update design tokens for any MDS product. All tokens follow the three-tier hierarchy: Primitive > Semantic > Component.

---

## Token Naming Convention

```
--mds-{category}-{property}-{variant}

Categories: color, font, spacing, shadow, radius, border, motion
Variants: primary, secondary, tertiary, accent, muted, inverse
```

---

## Color Tokens

### Primitive Colors (raw values — never use directly in components)

| Token | Value | Swatch |
|-------|-------|--------|
| `--mds-slate-950` | `#020617` | Deepest background |
| `--mds-slate-900` | `#0f172a` | Primary background |
| `--mds-cosmic-900` | `#0A1628` | Cosmic blue base |
| `--mds-cosmic-800` | `#111d35` | Cosmic blue lighter |
| `--mds-cosmic-700` | `#1a2a4a` | Cosmic blue lightest |
| `--mds-slate-700` | `#334155` | Border/divider base |
| `--mds-slate-600` | `#475569` | Muted elements |
| `--mds-slate-400` | `#94a3b8` | Secondary text |
| `--mds-slate-300` | `#cbd5e1` | Primary text alternative |
| `--mds-slate-100` | `#f1f5f9` | Heading text |
| `--mds-white` | `#ffffff` | Emphasis text |
| `--mds-gold-500` | `#D4AF37` | Primary gold accent |
| `--mds-gold-400` | `#E5C04B` | Light gold |
| `--mds-gold-600` | `#B8962E` | Dark gold |
| `--mds-amber-500` | `#f59e0b` | Warm accent |
| `--mds-amber-400` | `#fbbf24` | Warm accent light |

### Semantic Colors (purpose-based — use in components)

| Token | Maps To | Usage |
|-------|---------|-------|
| `--mds-color-bg-primary` | `--mds-cosmic-900` | Page background |
| `--mds-color-bg-secondary` | `--mds-slate-900` | Card/panel background |
| `--mds-color-bg-tertiary` | `--mds-cosmic-800` | Nested container background |
| `--mds-color-bg-elevated` | `--mds-cosmic-700` | Elevated surface (modals, dropdowns) |
| `--mds-color-text-primary` | `--mds-slate-100` | Headings, important text |
| `--mds-color-text-secondary` | `--mds-slate-400` | Body text, descriptions |
| `--mds-color-text-muted` | `--mds-slate-600` | Placeholder, disabled text |
| `--mds-color-text-inverse` | `--mds-slate-950` | Text on light/accent backgrounds |
| `--mds-color-accent-primary` | `--mds-gold-500` | Primary CTA, active states |
| `--mds-color-accent-hover` | `--mds-gold-400` | Accent hover state |
| `--mds-color-accent-muted` | `rgba(212, 175, 55, 0.1)` | Accent background tint |
| `--mds-color-border-default` | `--mds-slate-700` | Default borders |
| `--mds-color-border-subtle` | `rgba(51, 65, 85, 0.5)` | Subtle borders |
| `--mds-color-border-accent` | `rgba(212, 175, 55, 0.3)` | Accent borders |

---

## Typography Tokens

### Font Families

| Token | Value | Usage |
|-------|-------|-------|
| `--mds-font-sans` | `'Inter', system-ui, sans-serif` | All UI text |
| `--mds-font-mono` | `'JetBrains Mono', monospace` | Code, data values |
| `--mds-font-display` | `'Cal Sans', 'Inter', sans-serif` | Hero headings (optional) |

### Font Sizes (based on 1rem = 16px)

| Token | Value | Line Height | Usage |
|-------|-------|-------------|-------|
| `--mds-font-size-xs` | `0.75rem` (12px) | 1rem | Captions, badges |
| `--mds-font-size-sm` | `0.875rem` (14px) | 1.25rem | Small body, labels |
| `--mds-font-size-base` | `1rem` (16px) | 1.5rem | Body text |
| `--mds-font-size-lg` | `1.125rem` (18px) | 1.75rem | Large body, subheadings |
| `--mds-font-size-xl` | `1.25rem` (20px) | 1.75rem | Section headings |
| `--mds-font-size-2xl` | `1.5rem` (24px) | 2rem | Page headings |
| `--mds-font-size-3xl` | `1.875rem` (30px) | 2.25rem | Large headings |
| `--mds-font-size-4xl` | `2.25rem` (36px) | 2.5rem | Hero headings |
| `--mds-font-size-5xl` | `3rem` (48px) | 1 | Display headings |

### Font Weights

| Token | Value | Usage |
|-------|-------|-------|
| `--mds-font-weight-normal` | `400` | Body text |
| `--mds-font-weight-medium` | `500` | Labels, emphasis |
| `--mds-font-weight-semibold` | `600` | Subheadings, buttons |
| `--mds-font-weight-bold` | `700` | Headings |

---

## Spacing Tokens (4px base unit)

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| `--mds-space-0` | `0` | `p-0` | Reset |
| `--mds-space-1` | `0.25rem` (4px) | `p-1` | Tight padding |
| `--mds-space-2` | `0.5rem` (8px) | `p-2` | Compact padding |
| `--mds-space-3` | `0.75rem` (12px) | `p-3` | Default small gap |
| `--mds-space-4` | `1rem` (16px) | `p-4` | Default padding |
| `--mds-space-5` | `1.25rem` (20px) | `p-5` | Comfortable padding |
| `--mds-space-6` | `1.5rem` (24px) | `p-6` | Card padding |
| `--mds-space-8` | `2rem` (32px) | `p-8` | Large card padding |
| `--mds-space-10` | `2.5rem` (40px) | `p-10` | Section spacing |
| `--mds-space-12` | `3rem` (48px) | `p-12` | Large section spacing |
| `--mds-space-16` | `4rem` (64px) | `p-16` | Page section spacing |
| `--mds-space-20` | `5rem` (80px) | `p-20` | Hero spacing |

---

## Shadow Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--mds-shadow-sm` | `0 1px 2px rgba(0, 0, 0, 0.3)` | Subtle elevation |
| `--mds-shadow-md` | `0 4px 6px rgba(0, 0, 0, 0.3)` | Cards, dropdowns |
| `--mds-shadow-lg` | `0 10px 15px rgba(0, 0, 0, 0.4)` | Modals, popovers |
| `--mds-shadow-xl` | `0 20px 25px rgba(0, 0, 0, 0.5)` | Elevated dialogs |
| `--mds-shadow-glow-gold` | `0 0 20px rgba(212, 175, 55, 0.15)` | Gold accent glow |
| `--mds-shadow-glow-blue` | `0 0 20px rgba(59, 130, 246, 0.15)` | Blue accent glow |

---

## Border Radius Tokens

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| `--mds-radius-sm` | `0.375rem` (6px) | `rounded-md` | Buttons, inputs |
| `--mds-radius-md` | `0.5rem` (8px) | `rounded-lg` | Small cards |
| `--mds-radius-lg` | `0.75rem` (12px) | `rounded-xl` | Cards, panels |
| `--mds-radius-xl` | `1rem` (16px) | `rounded-2xl` | Large cards, modals |
| `--mds-radius-full` | `9999px` | `rounded-full` | Pills, avatars |

---

## Motion Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--mds-duration-fast` | `150ms` | Hover states, toggles |
| `--mds-duration-normal` | `200ms` | Micro-interactions |
| `--mds-duration-slow` | `300ms` | Page transitions, modals |
| `--mds-duration-slower` | `500ms` | Complex animations |
| `--mds-ease-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | General purpose |
| `--mds-ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Exit animations |
| `--mds-ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Entrance animations |
| `--mds-ease-bounce` | `cubic-bezier(0.16, 1, 0.3, 1)` | Playful entrances |
