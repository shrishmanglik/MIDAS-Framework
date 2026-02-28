# Design Review Checklist

Run this checklist before handing off any design to development. Every item must pass or have a documented exception.

---

## Visual Consistency

- [ ] All colors reference MDS design tokens — no hardcoded hex values
- [ ] Typography uses only MDS type scale (xs through 5xl)
- [ ] Font weights use only: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)
- [ ] Spacing follows the 4px grid system (MDS spacing tokens)
- [ ] Border radius uses MDS radius tokens (sm, md, lg, xl, full)
- [ ] Shadows use MDS shadow tokens (sm, md, lg, xl, glow variants)
- [ ] Icons are consistent in size, weight, and style (Lucide icon set)
- [ ] Dark theme is the primary design — no light-theme-only elements

## Layout & Structure

- [ ] Page uses the correct layout template (full-width, sidebar, dashboard, centered)
- [ ] Content width does not exceed `max-w-7xl` (80rem)
- [ ] Grid system is consistent: `grid-cols-1` (mobile), `grid-cols-2` (tablet), `grid-cols-3` (desktop)
- [ ] Vertical spacing rhythm is consistent within the page
- [ ] Navigation patterns match existing app navigation
- [ ] Scroll behavior is defined (sticky headers, infinite scroll, pagination)
- [ ] Empty states are designed for all content areas

## Component Quality

- [ ] Every interactive element has all states: default, hover, active, focus, disabled
- [ ] Loading states defined (skeleton, spinner, or progress indicator)
- [ ] Error states designed with clear messaging and recovery actions
- [ ] Empty states designed with helpful guidance
- [ ] Component anatomy is documented (parts labeled)
- [ ] Component props/variants are defined
- [ ] Component matches or extends existing MDS components

## Interaction Design

- [ ] Click targets are at least 44x44px (mobile) or 32x32px (desktop)
- [ ] Hover states provide visual feedback within 100ms
- [ ] Form inputs have labels, placeholders, validation messages
- [ ] Destructive actions have confirmation dialogs
- [ ] Success actions have confirmation feedback (toast, checkmark, redirect)
- [ ] Multi-step processes show progress indication
- [ ] Back/undo is available where appropriate

## Content & Copy

- [ ] Headings follow a clear hierarchy (h1 > h2 > h3)
- [ ] Button labels are action-oriented verbs ("Get Started", not "Submit")
- [ ] Error messages tell the user what went wrong AND what to do
- [ ] Empty state copy guides the user to take action
- [ ] No lorem ipsum — all text is real or realistic placeholder
- [ ] Dates, numbers, and currencies use consistent formatting

## Handoff Quality

- [ ] Every visual property has an exact Tailwind class specified
- [ ] Component code skeleton provided (TSX structure)
- [ ] All breakpoint-specific changes documented
- [ ] Animation specs include duration, easing, and Framer Motion code
- [ ] Data requirements documented (what API data the component needs)
- [ ] Edge cases documented (long text, missing data, many items, zero items)

---

## Sign-Off

| Reviewer | Role | Status | Date |
|----------|------|--------|------|
| [Name] | UI Designer | Pass / Fail | [YYYY-MM-DD] |
| [Name] | Design System Architect | Pass / Fail | [YYYY-MM-DD] |
| [Name] | Frontend Developer | Pass / Fail | [YYYY-MM-DD] |

### Exceptions

| Item | Exception Reason | Approved By |
|------|-----------------|-------------|
| [Checklist item] | [Why it's acceptable to skip] | [Who approved] |
