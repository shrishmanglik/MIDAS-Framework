# MDS Design System Reference

The Million Dollar AI Studio (MDS) design system defines the visual language for all MIDAS products. It is built on a dark cosmic theme with gold accents, clean minimalism, and systematic spacing.

---

## Design Principles

1. **Dark-First**: All interfaces use dark backgrounds. There is no light mode. Dark reduces eye strain for extended use, conveys premium quality, and makes data visualizations pop.
2. **Cosmic Depth**: Backgrounds use layered dark blues to create depth. Surfaces closer to the user are lighter. This creates a natural spatial hierarchy.
3. **Gold Accents with Restraint**: Gold (#D4AF37) is the primary accent color. It signals action, importance, and premium quality. Use sparingly — if everything is gold, nothing is.
4. **Clean Minimalism**: Every element must earn its screen space. Prefer whitespace over decoration. Use typography hierarchy to guide the eye instead of visual clutter.
5. **Systematic Tokens**: Every visual value maps to a design token. No hardcoded values in components. This ensures consistency and enables theming.

---

## Color System

### Background Layers (darkest to lightest)

| Layer | Token | Value | Usage |
|-------|-------|-------|-------|
| Page | `bg-primary` | `#0A1628` | Page background, lowest layer |
| Surface | `bg-secondary` | `#0f172a` | Cards, panels, sidebars |
| Elevated | `bg-tertiary` | `#111d35` | Nested containers, table rows |
| Overlay | `bg-elevated` | `#1a2a4a` | Modals, dropdowns, popovers |

### Text Hierarchy

| Level | Token | Value | Tailwind | Usage |
|-------|-------|-------|----------|-------|
| Emphasis | `text-emphasis` | `#ffffff` | `text-white` | Hero text, critical values |
| Primary | `text-primary` | `#f1f5f9` | `text-slate-100` | Headings, labels |
| Secondary | `text-secondary` | `#94a3b8` | `text-slate-400` | Body text, descriptions |
| Muted | `text-muted` | `#475569` | `text-slate-600` | Placeholders, disabled |

### Accent Colors

| Name | Value | Tailwind | Usage |
|------|-------|----------|-------|
| Gold Primary | `#D4AF37` | `text-amber-500` (custom) | CTAs, active states, icons |
| Gold Light | `#E5C04B` | `text-amber-400` | Hover states |
| Gold Dark | `#B8962E` | `text-amber-600` | Pressed states |
| Gold Tint | `rgba(212,175,55,0.1)` | `bg-amber-500/10` | Background highlights |
| Gold Border | `rgba(212,175,55,0.3)` | `border-amber-500/30` | Accent borders |

### Border Colors

| Name | Value | Tailwind | Usage |
|------|-------|----------|-------|
| Default | `#334155` at 50% | `border-slate-700/50` | Standard borders |
| Subtle | `#1e293b` at 50% | `border-slate-800/50` | Very subtle dividers |
| Accent | Gold at 30% | `border-amber-500/30` | Featured/active borders |
| Focus | Gold at 50% | `ring-amber-500/50` | Focus ring |

### Status Colors

| Status | Color | Tailwind | Usage |
|--------|-------|----------|-------|
| Success | `#4ade80` | `text-green-400` | Positive, confirmed, complete |
| Warning | `#fbbf24` | `text-amber-400` | Caution, attention needed |
| Error | `#f87171` | `text-red-400` | Error, failure, destructive |
| Info | `#60a5fa` | `text-blue-400` | Informational, neutral |

---

## Typography

### Font Stack

- **Primary**: Inter (sans-serif) — all UI text
- **Monospace**: JetBrains Mono — code, data values, IDs
- **Display**: Cal Sans (optional) — hero headings only

### Type Scale

| Name | Size | Weight | Line Height | Tailwind | Usage |
|------|------|--------|-------------|----------|-------|
| Display | 48px | Bold | 1.0 | `text-5xl font-bold` | Landing page heroes |
| H1 | 36px | Bold | 1.1 | `text-4xl font-bold` | Page titles |
| H2 | 30px | Bold | 1.2 | `text-3xl font-bold` | Section headings |
| H3 | 24px | Semibold | 1.3 | `text-2xl font-semibold` | Subsection headings |
| H4 | 20px | Semibold | 1.4 | `text-xl font-semibold` | Card titles |
| Large | 18px | Normal | 1.5 | `text-lg` | Large body, intro text |
| Base | 16px | Normal | 1.5 | `text-base` | Standard body text |
| Small | 14px | Normal | 1.4 | `text-sm` | Secondary text, labels |
| XSmall | 12px | Medium | 1.3 | `text-xs font-medium` | Captions, badges, tags |

---

## Spacing System

Base unit: 4px. All spacing values are multiples of 4.

| Token | Value | Tailwind | Common Usage |
|-------|-------|----------|-------------|
| 1 | 4px | `gap-1`, `p-1` | Icon-to-text gap |
| 2 | 8px | `gap-2`, `p-2` | Inline element gaps |
| 3 | 12px | `gap-3`, `p-3` | Compact component padding |
| 4 | 16px | `gap-4`, `p-4` | Standard padding, mobile page padding |
| 5 | 20px | `gap-5`, `p-5` | Comfortable padding |
| 6 | 24px | `gap-6`, `p-6` | Card padding, desktop grid gap |
| 8 | 32px | `gap-8`, `p-8` | Large card padding |
| 10 | 40px | `gap-10` | Section vertical spacing |
| 12 | 48px | `gap-12` | Major section breaks |
| 16 | 64px | `py-16` | Page section padding |
| 20 | 80px | `py-20` | Hero section padding |
| 24 | 96px | `py-24` | Large hero padding |

---

## Component Patterns

### Cards

```
Default: rounded-2xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-sm p-6
Hover:   hover:border-slate-600 hover:-translate-y-0.5 transition-all duration-200
Active:  ring-2 ring-amber-500/50 shadow-lg shadow-amber-500/10
```

### Buttons

```
Primary:   bg-amber-500 text-slate-900 hover:bg-amber-400 font-semibold rounded-lg px-4 py-2
Secondary: border border-slate-600 text-slate-200 hover:bg-slate-800 font-medium rounded-lg px-4 py-2
Ghost:     text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 font-medium rounded-lg px-4 py-2
Danger:    bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 font-medium rounded-lg px-4 py-2
```

### Inputs

```
Default:  w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50
Error:    border-red-500 focus:border-red-500 focus:ring-red-500/50
Disabled: opacity-50 cursor-not-allowed
```

### Badges

```
Default:  inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
Gold:     bg-amber-500/10 text-amber-400 border border-amber-500/30
Blue:     bg-blue-500/10 text-blue-400 border border-blue-500/30
Green:    bg-green-500/10 text-green-400 border border-green-500/30
Red:      bg-red-500/10 text-red-400 border border-red-500/30
```

---

## Effects

### Glassmorphism

```
backdrop-blur-sm bg-slate-900/60 border border-slate-700/50
```

Used on cards and overlays to create depth through transparency and blur.

### Gold Glow

```
shadow-lg shadow-amber-500/10
```

Used sparingly on featured/active elements to draw attention.

### Gradient Accents

```
bg-gradient-to-r from-amber-500 to-amber-600   (button fills)
bg-gradient-to-b from-slate-900 to-[#0A1628]   (page backgrounds)
bg-gradient-to-r from-amber-500/20 to-transparent (accent lines)
```

---

## Layout

### Breakpoints

| Name | Min Width | Tailwind | Content Width |
|------|-----------|----------|---------------|
| Mobile | 0px | default | Full width, `px-4` |
| Tablet | 640px | `sm:` | Full width, `px-4` |
| Desktop | 1024px | `lg:` | `max-w-7xl`, `px-6` |
| Wide | 1280px | `xl:` | `max-w-7xl`, `px-6` |

### Z-Index Scale

| Layer | Z-Index | Usage |
|-------|---------|-------|
| Base | 0 | Page content |
| Sticky | 10 | Sticky headers, floating buttons |
| Dropdown | 20 | Dropdown menus, popovers |
| Overlay | 30 | Modal backdrop |
| Modal | 40 | Modal dialogs |
| Toast | 50 | Toast notifications |
| Tooltip | 60 | Tooltips |
