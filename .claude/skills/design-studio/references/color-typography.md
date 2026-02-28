# Color & Typography Reference

Complete color palette and typography scale for the MDS design system.

---

## Color Palette

### Core Background Colors

| Name | Hex | RGB | HSL | Tailwind | Usage |
|------|-----|-----|-----|----------|-------|
| Cosmic Deep | `#020617` | 2, 6, 23 | 222, 84%, 5% | `bg-slate-950` | Deepest background |
| Cosmic Blue | `#0A1628` | 10, 22, 40 | 216, 60%, 10% | Custom `bg-cosmic` | Page background |
| Cosmic Surface | `#0f172a` | 15, 23, 42 | 222, 47%, 11% | `bg-slate-900` | Card surface |
| Cosmic Elevated | `#111d35` | 17, 29, 53 | 220, 51%, 14% | Custom | Nested surfaces |
| Cosmic Overlay | `#1a2a4a` | 26, 42, 74 | 220, 48%, 20% | Custom | Modals, dropdowns |

### Slate Gray Scale (UI elements)

| Name | Hex | Tailwind | Usage |
|------|-----|----------|-------|
| Slate 800 | `#1e293b` | `slate-800` | Subtle backgrounds, input fills |
| Slate 700 | `#334155` | `slate-700` | Borders, dividers |
| Slate 600 | `#475569` | `slate-600` | Muted elements (decorative only) |
| Slate 500 | `#64748b` | `slate-500` | Placeholder text |
| Slate 400 | `#94a3b8` | `slate-400` | Secondary body text |
| Slate 300 | `#cbd5e1` | `slate-300` | Strong body text |
| Slate 200 | `#e2e8f0` | `slate-200` | Labels, semi-emphasis |
| Slate 100 | `#f1f5f9` | `slate-100` | Headings, primary text |

### Gold Accent Scale

| Name | Hex | Tailwind | Usage |
|------|-----|----------|-------|
| Gold 700 | `#92751F` | Custom | Darkest gold (borders on hover) |
| Gold 600 | `#B8962E` | `amber-600` approx | Pressed/active states |
| Gold 500 | `#D4AF37` | Custom `gold` | Primary accent — CTAs, active indicators |
| Gold 400 | `#E5C04B` | `amber-400` approx | Hover states |
| Gold 300 | `#F0D56A` | Custom | Light gold (rarely used) |
| Gold Tint 10 | `rgba(212,175,55,0.1)` | `amber-500/10` | Background highlight |
| Gold Tint 20 | `rgba(212,175,55,0.2)` | `amber-500/20` | Stronger highlight |
| Gold Tint 30 | `rgba(212,175,55,0.3)` | `amber-500/30` | Accent borders |
| Gold Tint 50 | `rgba(212,175,55,0.5)` | `amber-500/50` | Focus rings |

### Status Colors

| Status | Color | Hex | Tailwind | Background Tint |
|--------|-------|-----|----------|-----------------|
| Success | Green 400 | `#4ade80` | `text-green-400` | `bg-green-500/10` |
| Warning | Amber 400 | `#fbbf24` | `text-amber-400` | `bg-amber-500/10` |
| Error | Red 400 | `#f87171` | `text-red-400` | `bg-red-500/10` |
| Info | Blue 400 | `#60a5fa` | `text-blue-400` | `bg-blue-500/10` |

### Gradient Presets

| Name | CSS | Usage |
|------|-----|-------|
| Gold Button | `linear-gradient(135deg, #D4AF37, #B8962E)` | Primary CTA buttons |
| Page Fade | `linear-gradient(180deg, #0f172a, #0A1628)` | Page top-to-bottom |
| Card Shine | `linear-gradient(135deg, rgba(212,175,55,0.05), transparent)` | Subtle card accent |
| Hero Radial | `radial-gradient(ellipse at top, #1a2a4a, #0A1628)` | Hero section backgrounds |
| Accent Line | `linear-gradient(90deg, #D4AF37, transparent)` | Decorative horizontal rule |

---

## Typography

### Font Loading

```html
<!-- Primary: Inter — loaded via Google Fonts or self-hosted -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

<!-- Monospace: JetBrains Mono — for code and data -->
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Font Stack Configuration

```js
// tailwind.config.ts
{
  theme: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
    }
  }
}
```

### Complete Type Scale

| Level | Size | Weight | Line Height | Letter Spacing | Tailwind Classes | Usage |
|-------|------|--------|-------------|----------------|-----------------|-------|
| Display | 48px / 3rem | 700 | 1.0 (48px) | -0.02em | `text-5xl font-bold tracking-tight` | Landing hero |
| H1 | 36px / 2.25rem | 700 | 1.1 (40px) | -0.02em | `text-4xl font-bold tracking-tight` | Page title |
| H2 | 30px / 1.875rem | 700 | 1.2 (36px) | -0.01em | `text-3xl font-bold` | Section heading |
| H3 | 24px / 1.5rem | 600 | 1.33 (32px) | 0 | `text-2xl font-semibold` | Subsection heading |
| H4 | 20px / 1.25rem | 600 | 1.4 (28px) | 0 | `text-xl font-semibold` | Card heading |
| H5 | 18px / 1.125rem | 600 | 1.44 (26px) | 0 | `text-lg font-semibold` | Widget heading |
| Body LG | 18px / 1.125rem | 400 | 1.56 (28px) | 0 | `text-lg` | Intro paragraphs |
| Body | 16px / 1rem | 400 | 1.5 (24px) | 0 | `text-base` | Standard body |
| Body SM | 14px / 0.875rem | 400 | 1.43 (20px) | 0 | `text-sm` | Secondary text |
| Caption | 12px / 0.75rem | 500 | 1.33 (16px) | 0.01em | `text-xs font-medium` | Labels, badges |
| Overline | 11px / 0.6875rem | 600 | 1.45 (16px) | 0.05em | `text-[11px] font-semibold uppercase tracking-widest` | Section overlines |

### Text Color Pairing Guide

| Typography Level | Color Token | Tailwind | Rationale |
|-----------------|-------------|----------|-----------|
| Display, H1, H2 | White | `text-white` | Maximum prominence |
| H3, H4, H5 | Slate 100 | `text-slate-100` | High prominence, slightly softer |
| Body LG, Body | Slate 300-400 | `text-slate-300` or `text-slate-400` | Readable without dominating |
| Body SM | Slate 400 | `text-slate-400` | Secondary information |
| Caption | Slate 400-500 | `text-slate-400` | Supportive information |
| Overline | Slate 400 | `text-slate-400` | Structural label |
| Links | Gold 500 | `text-amber-500` (custom) | Interactive text |
| Code inline | Amber 300 on slate-800 | `text-amber-300 bg-slate-800 px-1.5 py-0.5 rounded` | Monospace highlight |

### Monospace Usage

| Context | Weight | Size | Color | Tailwind |
|---------|--------|------|-------|----------|
| Inline code | 400 | Same as surrounding | Amber 300 | `font-mono text-amber-300` |
| Code block | 400 | 14px | Slate 300 | `font-mono text-sm text-slate-300` |
| Data values | 400 | Same as label | Slate 100 | `font-mono text-slate-100` |
| IDs / hashes | 400 | 12px | Slate 400 | `font-mono text-xs text-slate-400` |
| Timestamps | 500 | 12px | Slate 400 | `font-mono text-xs font-medium text-slate-400` |

---

## Typography Do's and Don'ts

### Do
- Use the type scale consistently — never invent font sizes
- Use `tracking-tight` on headings 24px and above
- Use `leading-relaxed` for long-form body text
- Maintain the weight hierarchy: headings bold/semibold, body normal
- Use monospace for data values, code, IDs, and timestamps

### Don't
- Don't use more than 3 font weights on a single page
- Don't use `font-thin` or `font-light` on dark backgrounds (poor legibility)
- Don't set line height below 1.3 for any readable text
- Don't use ALL CAPS except for overlines and badges
- Don't mix Inter and JetBrains Mono in the same text block
- Don't use font sizes smaller than 11px for any content (even decorative)
