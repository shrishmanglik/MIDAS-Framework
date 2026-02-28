# Responsive Design Check

Verify that every page and component works correctly across all target breakpoints. Test at exact pixel widths AND between breakpoints.

---

## Target Breakpoints

| Name | Width | Tailwind Prefix | Device Examples |
|------|-------|-----------------|-----------------|
| Mobile S | 320px | (default) | iPhone SE, Galaxy S8 |
| Mobile M | 375px | (default) | iPhone 12/13/14, Pixel 5 |
| Mobile L | 428px | (default) | iPhone 14 Pro Max, Galaxy S22 Ultra |
| Tablet | 768px | `md:` | iPad Mini, iPad Air |
| Tablet L | 1024px | `lg:` | iPad Pro 11" |
| Desktop | 1280px | `xl:` | Standard laptops |
| Desktop L | 1440px | `2xl:` | External monitors |
| Ultra-wide | 1920px+ | `2xl:` | Large monitors |

---

## Layout Checks

### Navigation

- [ ] **Mobile**: Hamburger menu visible, bottom nav present
- [ ] **Mobile**: Hamburger menu opens/closes correctly, doesn't push content
- [ ] **Mobile**: Bottom nav items are evenly spaced with 44px+ touch targets
- [ ] **Tablet**: Navigation adapts (hamburger or condensed horizontal nav)
- [ ] **Desktop**: Full horizontal nav visible, sidebar present if applicable
- [ ] **All**: Active navigation item is clearly indicated
- [ ] **All**: Navigation doesn't overlap content at any width

### Content Grid

- [ ] **Mobile (< 640px)**: Single column layout (`grid-cols-1`)
- [ ] **Tablet (640-1024px)**: Two column layout (`grid-cols-2`)
- [ ] **Desktop (> 1024px)**: Three column layout (`grid-cols-3`)
- [ ] **All**: Grid gap scales appropriately (`gap-4` mobile, `gap-6` desktop)
- [ ] **All**: No horizontal overflow at any breakpoint
- [ ] **Ultra-wide**: Content is constrained by `max-w-7xl`, centered

### Sidebar

- [ ] **Mobile**: Sidebar is hidden, accessible via hamburger
- [ ] **Tablet**: Sidebar is hidden or collapsible
- [ ] **Desktop**: Sidebar is visible and fixed
- [ ] **All**: Main content area adjusts its width when sidebar state changes

---

## Component Checks

### Cards

- [ ] **Mobile**: Cards stack vertically, full width
- [ ] **Tablet**: Cards in 2-column grid
- [ ] **Desktop**: Cards in 3-column grid
- [ ] **All**: Card padding scales (`p-4` mobile, `p-6` desktop)
- [ ] **All**: Card content doesn't overflow at minimum width
- [ ] **All**: Card height is consistent within a row (if grid) or auto (if stack)

### Typography

- [ ] **Mobile**: Headings scale down (`text-2xl` instead of `text-4xl`)
- [ ] **All**: Body text remains `text-sm` or `text-base` at all widths
- [ ] **All**: Line length stays between 45-75 characters for readability
- [ ] **All**: Text doesn't get clipped or overflow containers
- [ ] **All**: Long words/URLs break correctly (`break-words` or `truncate`)

### Forms

- [ ] **Mobile**: Form inputs are full width
- [ ] **Mobile**: Labels are above inputs (not inline)
- [ ] **Tablet+**: Form can use multi-column layout for related fields
- [ ] **All**: Input touch targets are at least 44px height on mobile
- [ ] **All**: Form buttons are easily reachable (bottom of form, full width on mobile)
- [ ] **All**: Validation messages are visible without scrolling

### Tables

- [ ] **Mobile**: Table has horizontal scroll wrapper, or cards replace table rows
- [ ] **Mobile**: Essential columns remain visible, secondary columns hidden or in expandable row
- [ ] **Tablet**: Most columns visible, less critical ones hidden
- [ ] **Desktop**: All columns visible
- [ ] **All**: Table header remains sticky on vertical scroll

### Modals & Overlays

- [ ] **Mobile**: Modal takes full screen or near-full screen (`max-w-full` or sheet)
- [ ] **Tablet**: Modal is centered with reasonable max-width (`max-w-lg`)
- [ ] **Desktop**: Modal is centered with appropriate max-width (`max-w-xl`)
- [ ] **All**: Modal content scrolls internally if taller than viewport
- [ ] **All**: Close button/gesture is accessible at every size

### Images & Media

- [ ] **All**: Images use `object-fit: cover` or `contain` to prevent distortion
- [ ] **All**: Images scale proportionally within their containers
- [ ] **Mobile**: Large images reduce to single column width
- [ ] **All**: Aspect ratios are maintained

---

## Interaction Checks

- [ ] **Mobile**: Touch targets are at least 44x44px
- [ ] **Mobile**: Adequate spacing between interactive elements (8px+ gap)
- [ ] **Mobile**: Swipe gestures work where expected (carousels, sheets)
- [ ] **Desktop**: Hover states are visible and responsive
- [ ] **All**: Focus states are visible on keyboard navigation
- [ ] **All**: Scrolling is smooth and doesn't interfere with fixed elements

---

## Performance Checks

- [ ] **Mobile**: Page loads within 3 seconds on 3G
- [ ] **Mobile**: Images are appropriately sized (not loading desktop-size on mobile)
- [ ] **All**: No layout shift during loading (CLS < 0.1)
- [ ] **All**: Animations run at 60fps at all breakpoints
- [ ] **All**: No content reflow when switching orientation (portrait/landscape)

---

## Testing Procedure

1. Open Chrome DevTools Device Toolbar
2. Test at each exact breakpoint width listed above
3. Slowly drag the viewport from 320px to 1920px watching for layout breaks
4. Test both portrait and landscape on tablet sizes
5. Check with real content (not placeholders) to verify text wrapping
6. Verify with very long content and very short content
7. Test with browser zoom at 100%, 150%, and 200%

---

## Results

| Component/Page | 320px | 375px | 768px | 1024px | 1280px | 1440px | Issues |
|---------------|-------|-------|-------|--------|--------|--------|--------|
| [name] | Pass/Fail | Pass/Fail | Pass/Fail | Pass/Fail | Pass/Fail | Pass/Fail | [description] |
