# Accessibility Guide Reference

WCAG 2.1 Level AA requirements and implementation techniques for MDS products.

---

## Color Contrast Requirements

### Minimum Ratios

| Content Type | Minimum Ratio | Rule |
|-------------|---------------|------|
| Normal text (< 18px or < 14px bold) | 4.5:1 | WCAG 1.4.3 |
| Large text (>= 18px or >= 14px bold) | 3:1 | WCAG 1.4.3 |
| UI components and graphical objects | 3:1 | WCAG 1.4.11 |
| Focus indicators | 3:1 against adjacent | WCAG 2.4.7 |

### MDS Dark Theme Verified Combinations

| Foreground | Background | Ratio | Passes |
|-----------|------------|-------|--------|
| `#ffffff` on `#0A1628` | White on cosmic | 16.3:1 | AA, AAA |
| `#f1f5f9` on `#0A1628` | Slate-100 on cosmic | 13.8:1 | AA, AAA |
| `#94a3b8` on `#0A1628` | Slate-400 on cosmic | 6.2:1 | AA |
| `#D4AF37` on `#0A1628` | Gold on cosmic | 7.1:1 | AA |
| `#f1f5f9` on `#0f172a` | Slate-100 on surface | 12.1:1 | AA, AAA |
| `#94a3b8` on `#0f172a` | Slate-400 on surface | 5.4:1 | AA |
| `#D4AF37` on `#0f172a` | Gold on surface | 6.2:1 | AA |
| `#4ade80` on `#0A1628` | Green-400 on cosmic | 8.2:1 | AA, AAA |
| `#f87171` on `#0A1628` | Red-400 on cosmic | 5.4:1 | AA |
| `#fbbf24` on `#0A1628` | Amber-400 on cosmic | 9.6:1 | AA, AAA |
| `#60a5fa` on `#0A1628` | Blue-400 on cosmic | 5.1:1 | AA |
| `#475569` on `#0A1628` | Slate-600 on cosmic | 2.8:1 | FAIL for text |

### Problematic Combinations to Avoid

- `text-slate-600` on dark backgrounds (< 3:1) — use for decorative borders only, never for readable text
- `text-slate-700` on any background — too low contrast for any text purpose
- Gold accent on `bg-amber-500/10` background — low internal contrast, rely on surrounding context

---

## Keyboard Navigation

### Focus Management

```css
/* Global focus style — apply to all interactive elements */
*:focus-visible {
  outline: 2px solid rgba(212, 175, 55, 0.7);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Tailwind equivalent */
.focus-ring {
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900;
}
```

### Tab Order Rules

1. Follow the visual reading order: left-to-right, top-to-bottom
2. Skip navigation link should be the first focusable element
3. Modal dialogs must trap focus (Tab cycles within the modal)
4. Focus should never move to invisible or off-screen elements
5. After closing a modal, return focus to the element that opened it
6. After deleting an item, move focus to the previous or next item

### Keyboard Shortcuts by Component

| Component | Key | Action |
|-----------|-----|--------|
| Button | `Enter`, `Space` | Activate |
| Link | `Enter` | Navigate |
| Checkbox | `Space` | Toggle |
| Radio Group | `Arrow Up/Down` | Select previous/next |
| Tabs | `Arrow Left/Right` | Select previous/next tab |
| Menu | `Arrow Up/Down` | Navigate items |
| Menu | `Enter` | Activate item |
| Menu | `Escape` | Close menu |
| Modal | `Escape` | Close modal |
| Combobox | `Arrow Down` | Open dropdown |
| Combobox | `Escape` | Close dropdown |

---

## ARIA Patterns

### Landmark Regions

```html
<body>
  <header role="banner">
    <nav aria-label="Main navigation">...</nav>
  </header>
  <a href="#main-content" class="sr-only focus:not-sr-only">Skip to main content</a>
  <main id="main-content" role="main">
    <nav aria-label="Breadcrumb">...</nav>
    <article>...</article>
    <aside aria-label="Related content">...</aside>
  </main>
  <footer role="contentinfo">...</footer>
</body>
```

### Common ARIA Patterns

**Button with loading state:**
```tsx
<button aria-busy={isLoading} aria-disabled={isLoading}>
  {isLoading ? "Saving..." : "Save"}
</button>
```

**Toggle button:**
```tsx
<button aria-pressed={isActive} onClick={toggle}>
  {isActive ? "Active" : "Inactive"}
</button>
```

**Expandable section:**
```tsx
<button aria-expanded={isOpen} aria-controls="panel-1">Details</button>
<div id="panel-1" role="region" aria-labelledby="heading-1" hidden={!isOpen}>
  ...
</div>
```

**Live region for dynamic updates:**
```tsx
<div role="status" aria-live="polite" className="sr-only">
  {statusMessage}
</div>
```

**Error announcements:**
```tsx
<div role="alert" aria-live="assertive">
  {errorMessage}
</div>
```

**Data table:**
```tsx
<table role="table" aria-label="User predictions">
  <thead>
    <tr>
      <th scope="col" aria-sort={sortDir}>Name</th>
      <th scope="col">Date</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>...</td>
      <td>...</td>
    </tr>
  </tbody>
</table>
```

---

## Screen Reader Best Practices

### Visually Hidden Text (for screen readers only)

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

Tailwind: `sr-only` / `not-sr-only`

### Icon Buttons

```tsx
{/* Icon-only button — MUST have aria-label */}
<button aria-label="Close dialog">
  <XIcon className="h-5 w-5" aria-hidden="true" />
</button>

{/* Icon + text button — icon is decorative */}
<button>
  <PlusIcon className="h-4 w-4 mr-2" aria-hidden="true" />
  Add Chart
</button>
```

### Images

```tsx
{/* Informative image */}
<img src="chart.png" alt="Birth chart showing Sun in Aries in the 10th house" />

{/* Decorative image */}
<img src="pattern.svg" alt="" role="presentation" />

{/* Complex image */}
<figure>
  <img src="chart.png" alt="Birth chart analysis" aria-describedby="chart-desc" />
  <figcaption id="chart-desc">
    Detailed description of the chart data...
  </figcaption>
</figure>
```

---

## Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Tailwind utility: `motion-safe:` and `motion-reduce:` prefixes.

```tsx
{/* Only animate when user allows motion */}
<div className="motion-safe:animate-fadeIn motion-reduce:opacity-100">
  Content
</div>
```

---

## Form Accessibility

### Required Fields

```tsx
<div className="space-y-2">
  <label htmlFor="name" className="text-sm font-medium text-slate-200">
    Full Name <span className="text-red-400" aria-hidden="true">*</span>
  </label>
  <input id="name" required aria-required="true" />
</div>
```

### Field Descriptions

```tsx
<div className="space-y-2">
  <label htmlFor="birth-time">Birth Time</label>
  <input id="birth-time" aria-describedby="birth-time-hint" />
  <p id="birth-time-hint" className="text-xs text-slate-500">
    Enter in 24-hour format (e.g., 14:30). If unknown, select "Approximate."
  </p>
</div>
```

### Error Association

```tsx
<div className="space-y-2">
  <label htmlFor="email">Email</label>
  <input
    id="email"
    aria-invalid={hasError}
    aria-describedby={hasError ? "email-error" : undefined}
  />
  {hasError && (
    <p id="email-error" role="alert" className="text-xs text-red-400">
      Please enter a valid email address (e.g., name@example.com).
    </p>
  )}
</div>
```

---

## Testing Checklist

| Test | Tool | Pass Criteria |
|------|------|---------------|
| Automated scan | axe DevTools | Zero critical/serious violations |
| Keyboard navigation | Manual (no mouse) | All functionality accessible, logical tab order |
| Screen reader | NVDA or VoiceOver | All content announced correctly, no confusing announcements |
| Zoom 200% | Browser zoom | No content loss, no horizontal scroll |
| Color only | Greyscale filter | Information still conveyed without color |
| Focus visible | Tab through page | Every interactive element has visible focus indicator |
| Touch targets | Mobile device | All targets at least 44x44px |
