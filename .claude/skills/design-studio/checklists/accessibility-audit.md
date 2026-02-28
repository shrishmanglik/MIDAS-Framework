# Accessibility Audit Checklist

WCAG 2.1 Level AA compliance audit. Run on every component and page before release.

---

## Perceivable

### Color & Contrast

- [ ] Text on background meets 4.5:1 contrast ratio (normal text)
- [ ] Large text (18px+ bold or 24px+ regular) meets 3:1 contrast ratio
- [ ] UI components and graphical objects meet 3:1 contrast ratio against adjacent colors
- [ ] Color is not the sole means of conveying information (use icons, patterns, or text alongside)
- [ ] Focus indicators have 3:1 contrast ratio against adjacent colors
- [ ] Links are distinguishable from surrounding text (underline or 3:1 contrast difference)

### MDS Dark Theme Specific Checks

| Combination | Foreground | Background | Min Ratio | Typical Ratio |
|------------|-----------|------------|-----------|---------------|
| Primary text on page bg | `#f1f5f9` | `#0A1628` | 4.5:1 | 13.8:1 Pass |
| Secondary text on page bg | `#94a3b8` | `#0A1628` | 4.5:1 | 6.2:1 Pass |
| Gold accent on page bg | `#D4AF37` | `#0A1628` | 4.5:1 | 7.1:1 Pass |
| Muted text on page bg | `#475569` | `#0A1628` | 4.5:1 | 2.8:1 FAIL — use for decorative only |
| Primary text on card bg | `#f1f5f9` | `#0f172a` | 4.5:1 | 12.1:1 Pass |
| Gold on card bg | `#D4AF37` | `#0f172a` | 4.5:1 | 6.2:1 Pass |

### Images & Media

- [ ] All informative images have descriptive `alt` text
- [ ] Decorative images use `alt=""` or `role="presentation"`
- [ ] Complex images (charts, diagrams) have extended descriptions
- [ ] Video has captions
- [ ] Audio has transcripts
- [ ] No content relies solely on sensory characteristics (shape, color, size, location, sound)

### Text

- [ ] Text can be resized up to 200% without loss of content or functionality
- [ ] No images of text (unless logo or essential)
- [ ] Line height is at least 1.5x the font size for body text
- [ ] Paragraph spacing is at least 2x the font size
- [ ] Letter spacing is at least 0.12x the font size

---

## Operable

### Keyboard

- [ ] All functionality is accessible via keyboard alone
- [ ] Tab order follows a logical reading order (left-to-right, top-to-bottom)
- [ ] Focus indicator is visible on every interactive element
- [ ] No keyboard traps — user can always Tab away from any element
- [ ] Skip-to-main-content link exists and works
- [ ] Modal dialogs trap focus correctly (Tab cycles within modal)
- [ ] Escape key closes modals, dropdowns, and overlays
- [ ] Enter/Space activates buttons and links
- [ ] Arrow keys navigate within composite widgets (tabs, menus, radio groups)

### Navigation

- [ ] Page has a clear `<h1>` heading
- [ ] Heading hierarchy is logical (h1 > h2 > h3, no skipped levels)
- [ ] Landmark regions are defined (`<main>`, `<nav>`, `<aside>`, `<header>`, `<footer>`)
- [ ] Breadcrumb navigation is present for nested pages
- [ ] Current page/section is indicated in navigation (`aria-current="page"`)
- [ ] Multiple ways to reach any page (navigation, search, sitemap)

### Timing

- [ ] No time limits on user actions (or user can extend/disable)
- [ ] Auto-updating content can be paused, stopped, or hidden
- [ ] No content flashes more than 3 times per second

### Touch & Pointer

- [ ] Touch targets are at least 44x44 CSS pixels
- [ ] Adequate spacing between touch targets (at least 8px gap)
- [ ] Drag operations have alternative single-pointer actions
- [ ] Complex gestures (pinch, multi-finger) have single-finger alternatives

---

## Understandable

### Readability

- [ ] Page language is set (`<html lang="en">`)
- [ ] Unusual words or abbreviations are defined on first use
- [ ] Reading level is appropriate for the target audience

### Predictability

- [ ] Navigation is consistent across pages
- [ ] Components that have the same function look and behave the same
- [ ] No unexpected context changes on focus or input

### Input Assistance

- [ ] Form inputs have associated `<label>` elements
- [ ] Required fields are indicated (visually and with `aria-required="true"`)
- [ ] Input format requirements are shown before the user enters data
- [ ] Error messages identify the field with the error
- [ ] Error messages describe the error in text (not just color)
- [ ] Error messages suggest how to fix the error
- [ ] Form submissions can be reviewed and corrected before final submit

---

## Robust

### Compatibility

- [ ] Valid HTML (no duplicate IDs, proper nesting)
- [ ] ARIA roles are used correctly (`role`, `aria-label`, `aria-describedby`, etc.)
- [ ] Custom components have appropriate ARIA roles and states
- [ ] Status messages use `role="status"` or `aria-live="polite"`
- [ ] Error messages use `role="alert"` or `aria-live="assertive"`
- [ ] Dynamic content updates are announced to screen readers

---

## Testing Tools

| Tool | Purpose | How to Run |
|------|---------|-----------|
| axe DevTools | Automated WCAG testing | Browser extension scan |
| Lighthouse | Accessibility score | Chrome DevTools > Lighthouse |
| NVDA / VoiceOver | Screen reader testing | Manual walkthrough |
| Keyboard only | Tab navigation test | Unplug mouse, navigate with keyboard |
| Color contrast analyzer | Ratio verification | WebAIM contrast checker |
| Zoom 200% | Reflow testing | Browser zoom to 200% |

---

## Severity Ratings

| Severity | Definition | Action |
|----------|-----------|--------|
| Critical | Blocks access for entire user group | Must fix before release |
| High | Major functionality inaccessible | Must fix before release |
| Medium | Inconvenient but has workaround | Fix within next sprint |
| Low | Minor issue, cosmetic | Fix when capacity allows |

---

## Audit Results

| Component | Issues Found | Severity | Status |
|-----------|-------------|----------|--------|
| [component] | [description] | [Critical/High/Medium/Low] | [Open/Fixed] |
