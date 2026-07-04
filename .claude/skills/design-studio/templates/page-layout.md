# Page Layout Template

Use this template to define the layout structure of any page. Every page must specify its grid system, content zones, and responsive behavior.

---

## Page: [Page Name]

### Meta

| Field | Value |
|-------|-------|
| **Route** | `/[path]` |
| **Title** | `[Page Title] — [Product]` |
| **Purpose** | [One sentence: what the user does on this page] |
| **Auth Required** | Yes / No |
| **Layout Type** | [full-width / sidebar / dashboard / centered / split] |

---

### Layout Structure

#### Desktop (> 1024px)

```
+--[ Top Nav: h-16 fixed ]------------------------------+
|  Logo    Nav Links              User Menu              |
+-------------------------------------------------------+
|        |                                               |
| Sidebar|  Main Content Area                            |
| w-64   |  max-w-7xl mx-auto px-6                      |
|        |                                               |
|  Nav   |  +--[ Page Header ]------------------------+  |
|  Items |  |  Breadcrumb                             |  |
|        |  |  Page Title          Action Buttons     |  |
|        |  +------------------------------------------+  |
|        |                                               |
|        |  +--[ Content Grid ]------------------------+  |
|        |  |  grid-cols-3 gap-6                       |  |
|        |  |  [Card]  [Card]  [Card]                  |  |
|        |  |  [Card]  [Card]  [Card]                  |  |
|        |  +------------------------------------------+  |
|        |                                               |
|        |  +--[ Secondary Section ]-------------------+  |
|        |  |  [Content]                               |  |
|        |  +------------------------------------------+  |
+-------------------------------------------------------+
```

#### Tablet (640-1024px)

```
+--[ Top Nav: h-16 fixed ]------------------------------+
|  Logo    Hamburger                    User Menu        |
+-------------------------------------------------------+
|                                                        |
|  Main Content Area                                     |
|  max-w-full px-4                                       |
|                                                        |
|  +--[ Page Header ]----------------------------------+ |
|  |  Breadcrumb                                       | |
|  |  Page Title                                       | |
|  |  Action Buttons (full width)                      | |
|  +---------------------------------------------------+ |
|                                                        |
|  +--[ Content Grid ]----------------------------------+|
|  |  grid-cols-2 gap-4                                 ||
|  |  [Card]  [Card]                                    ||
|  |  [Card]  [Card]                                    ||
|  |  [Card]  [Card]                                    ||
|  +----------------------------------------------------+|
+--------------------------------------------------------+
```

#### Mobile (< 640px)

```
+--[ Top Nav: h-14 fixed ]----------+
|  Logo    Hamburger     Avatar     |
+-----------------------------------+
|                                    |
|  Main Content Area                 |
|  px-4                              |
|                                    |
|  +--[ Page Header ]--------------+|
|  |  Page Title                   ||
|  |  Action Button (full width)   ||
|  +-------------------------------+|
|                                    |
|  +--[ Content Stack ]------------+|
|  |  flex-col gap-4               ||
|  |  [Card — full width]         ||
|  |  [Card — full width]         ||
|  |  [Card — full width]         ||
|  +-------------------------------+|
+-----------------------------------+
+--[ Bottom Nav: h-16 fixed ]-------+
|  Home  Charts  Predict  Profile   |
+-----------------------------------+
```

---

### Grid Specification

| Breakpoint | Grid | Gap | Container | Padding |
|-----------|------|-----|-----------|---------|
| Mobile (< 640px) | `grid-cols-1` | `gap-4` | `w-full` | `px-4` |
| Tablet (640-1024px) | `grid-cols-2` | `gap-4` | `max-w-4xl mx-auto` | `px-4` |
| Desktop (> 1024px) | `grid-cols-3` | `gap-6` | `max-w-7xl mx-auto` | `px-6` |

---

### Content Zones

| Zone | Purpose | Priority | Tailwind |
|------|---------|----------|----------|
| Top Nav | Navigation, branding, user menu | Required | `fixed top-0 z-50 h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50` |
| Sidebar | Section navigation (desktop only) | Optional | `fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-slate-950 border-r border-slate-700/50` |
| Page Header | Title, breadcrumbs, actions | Required | `mb-6 flex items-center justify-between` |
| Main Content | Primary page content | Required | `flex-1` |
| Secondary Content | Supporting information | Optional | `mt-8` |
| Bottom Nav | Mobile navigation | Mobile only | `fixed bottom-0 z-50 h-16 bg-slate-900/80 backdrop-blur-md border-t border-slate-700/50` |

---

### Spacing Rhythm

| Element | Margin/Padding | Token |
|---------|---------------|-------|
| Page top padding (below nav) | `pt-20` (nav height + space) | `--mds-space-20` |
| Section vertical gap | `mt-8` | `--mds-space-8` |
| Card internal padding | `p-6` | `--mds-space-6` |
| Card grid gap | `gap-6` (desktop) / `gap-4` (mobile) | `--mds-space-6` / `--mds-space-4` |
| Page header to content | `mb-6` | `--mds-space-6` |

---

### Tailwind Implementation

```tsx
export default function [PageName]Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0A1628]">
      {/* Top Nav */}
      <nav className="fixed top-0 z-50 w-full h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50">
        {/* nav content */}
      </nav>

      <div className="flex pt-16">
        {/* Sidebar — desktop only */}
        <aside className="hidden lg:block fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-slate-950 border-r border-slate-700/50 overflow-y-auto">
          {/* sidebar navigation */}
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
            {/* Page Header */}
            <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <nav className="text-sm text-slate-400 mb-1">{/* breadcrumbs */}</nav>
                <h1 className="text-2xl font-bold text-white">{/* title */}</h1>
              </div>
              <div className="flex gap-2">
                {/* action buttons */}
              </div>
            </header>

            {/* Content Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Bottom Nav — mobile only */}
      <nav className="lg:hidden fixed bottom-0 z-50 w-full h-16 bg-slate-900/80 backdrop-blur-md border-t border-slate-700/50">
        {/* mobile nav items */}
      </nav>
    </div>
  );
}
```

---

### Loading State

```
+--[ Skeleton Layout ]----------------------------------+
|  [Shimmer bar: w-32 h-4]    breadcrumb               |
|  [Shimmer bar: w-48 h-8]    title                    |
|                                                        |
|  [Shimmer card]  [Shimmer card]  [Shimmer card]       |
|  h-48 rounded-xl bg-slate-800/50 animate-pulse       |
+-------------------------------------------------------+
```

---

### Notes

- Sidebar collapses to hamburger menu below `lg` (1024px)
- Bottom nav appears only below `lg` (1024px) for mobile navigation
- All content areas use `backdrop-blur` effects for the glassmorphism aesthetic
- Page background is always `--mds-color-bg-primary` (#0A1628)
- Max content width is `max-w-7xl` (80rem) to prevent ultra-wide readability issues
