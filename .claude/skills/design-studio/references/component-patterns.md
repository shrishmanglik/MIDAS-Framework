# Component Patterns Reference

Common UI component patterns used across MDS products. All patterns use MDS design tokens and Tailwind CSS.

---

## Navigation Patterns

### Top Navigation Bar

```tsx
<nav className="fixed top-0 z-50 w-full h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50">
  <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4 lg:px-6">
    {/* Logo */}
    <div className="flex items-center gap-2">
      <Logo className="h-8 w-8 text-amber-500" />
      <span className="text-lg font-semibold text-white">ProductName</span>
    </div>

    {/* Desktop Nav Links */}
    <div className="hidden lg:flex items-center gap-1">
      <NavLink active>Dashboard</NavLink>
      <NavLink>Charts</NavLink>
      <NavLink>Predictions</NavLink>
      <NavLink>Settings</NavLink>
    </div>

    {/* Right Section */}
    <div className="flex items-center gap-3">
      <Button variant="ghost" size="icon"><BellIcon /></Button>
      <Avatar />
      <Button className="lg:hidden" variant="ghost" size="icon"><MenuIcon /></Button>
    </div>
  </div>
</nav>
```

**NavLink states**:
- Default: `text-sm font-medium text-slate-400 hover:text-slate-100 px-3 py-2 rounded-lg hover:bg-slate-800/50 transition-colors`
- Active: `text-sm font-medium text-amber-400 bg-amber-500/10 px-3 py-2 rounded-lg`

### Sidebar Navigation

```tsx
<aside className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-slate-950 border-r border-slate-700/50 overflow-y-auto py-4">
  <nav className="space-y-1 px-3">
    <SidebarItem icon={HomeIcon} active>Overview</SidebarItem>
    <SidebarItem icon={ChartIcon}>Birth Chart</SidebarItem>
    <SidebarItem icon={StarIcon}>Predictions</SidebarItem>
    <SidebarSection title="Analysis">
      <SidebarItem icon={HeartIcon}>Compatibility</SidebarItem>
      <SidebarItem icon={CalendarIcon}>Transits</SidebarItem>
    </SidebarSection>
  </nav>
</aside>
```

**SidebarItem states**:
- Default: `flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 rounded-lg hover:bg-slate-800/50 hover:text-slate-200 transition-colors`
- Active: `flex items-center gap-3 px-3 py-2 text-sm font-medium text-amber-400 bg-amber-500/10 rounded-lg`

### Bottom Navigation (Mobile)

```tsx
<nav className="fixed bottom-0 z-50 w-full h-16 bg-slate-900/90 backdrop-blur-md border-t border-slate-700/50 lg:hidden">
  <div className="grid grid-cols-4 h-full">
    <BottomNavItem icon={HomeIcon} label="Home" active />
    <BottomNavItem icon={ChartIcon} label="Charts" />
    <BottomNavItem icon={StarIcon} label="Predict" />
    <BottomNavItem icon={UserIcon} label="Profile" />
  </div>
</nav>
```

---

## Card Patterns

### Data Card

```tsx
<div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-sm p-6 hover:border-slate-600 transition-colors">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-sm font-medium text-slate-400">Total Revenue</h3>
    <TrendUpIcon className="h-4 w-4 text-green-400" />
  </div>
  <p className="text-3xl font-bold text-white">$45,231</p>
  <p className="mt-1 text-sm text-green-400">+12.5% from last month</p>
</div>
```

### Feature Card (with icon)

```tsx
<div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6 group hover:border-amber-500/30 transition-all duration-200">
  <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4 group-hover:bg-amber-500/20 transition-colors">
    <StarIcon className="h-5 w-5 text-amber-500" />
  </div>
  <h3 className="text-lg font-semibold text-slate-100 mb-2">Feature Title</h3>
  <p className="text-sm text-slate-400 leading-relaxed">Description of the feature goes here with enough detail to be useful.</p>
</div>
```

### List Card (expandable)

```tsx
<div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 divide-y divide-slate-700/50">
  <div className="p-4 flex items-center justify-between">
    <h3 className="text-sm font-semibold text-slate-100">Recent Activity</h3>
    <Button variant="ghost" size="sm">View All</Button>
  </div>
  {items.map(item => (
    <div className="p-4 flex items-center gap-3 hover:bg-slate-800/30 transition-colors">
      <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center">
        <item.icon className="h-4 w-4 text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200 truncate">{item.title}</p>
        <p className="text-xs text-slate-500">{item.time}</p>
      </div>
    </div>
  ))}
</div>
```

---

## Form Patterns

### Standard Form Field

```tsx
<div className="space-y-2">
  <label htmlFor="email" className="text-sm font-medium text-slate-200">
    Email Address
  </label>
  <input
    id="email"
    type="email"
    placeholder="you@example.com"
    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 focus:outline-none transition-colors"
  />
  <p className="text-xs text-slate-500">We will never share your email.</p>
</div>
```

### Form Field with Error

```tsx
<div className="space-y-2">
  <label htmlFor="email" className="text-sm font-medium text-slate-200">
    Email Address
  </label>
  <input
    id="email"
    type="email"
    aria-invalid="true"
    aria-describedby="email-error"
    className="w-full rounded-lg border border-red-500 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 focus:border-red-500 focus:ring-1 focus:ring-red-500/50 focus:outline-none"
  />
  <p id="email-error" className="text-xs text-red-400" role="alert">
    Please enter a valid email address.
  </p>
</div>
```

### Search Input

```tsx
<div className="relative">
  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
  <input
    type="search"
    placeholder="Search..."
    className="w-full rounded-lg border border-slate-700 bg-slate-900 pl-10 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 focus:outline-none"
  />
</div>
```

---

## Dashboard Patterns

### Stats Grid

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <StatCard label="Charts Generated" value="1,234" trend="+8%" trendUp />
  <StatCard label="Active Users" value="567" trend="+23%" trendUp />
  <StatCard label="Predictions" value="8,901" trend="-2%" trendUp={false} />
  <StatCard label="Revenue" value="$12,345" trend="+15%" trendUp />
</div>
```

### Data Table

```tsx
<div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 overflow-hidden">
  <table className="w-full">
    <thead>
      <tr className="border-b border-slate-700/50">
        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Name</th>
        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
        <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Value</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-700/30">
      <tr className="hover:bg-slate-800/30 transition-colors">
        <td className="px-4 py-3 text-sm text-slate-200">Item Name</td>
        <td className="px-4 py-3"><Badge variant="success">Active</Badge></td>
        <td className="px-4 py-3 text-sm text-slate-200 text-right font-mono">$1,234</td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## Feedback Patterns

### Toast Notification

```tsx
<div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg border border-slate-700/50 bg-slate-900 px-4 py-3 shadow-lg">
  <CheckCircleIcon className="h-5 w-5 text-green-400 shrink-0" />
  <div>
    <p className="text-sm font-medium text-slate-100">Chart saved successfully</p>
    <p className="text-xs text-slate-400">Your birth chart has been saved to your profile.</p>
  </div>
  <button className="text-slate-500 hover:text-slate-300 ml-2">
    <XIcon className="h-4 w-4" />
  </button>
</div>
```

### Empty State

```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <div className="h-16 w-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
    <ChartIcon className="h-8 w-8 text-slate-600" />
  </div>
  <h3 className="text-lg font-semibold text-slate-200 mb-2">No charts yet</h3>
  <p className="text-sm text-slate-400 max-w-sm mb-6">
    Create your first birth chart to see personalized astrological insights.
  </p>
  <Button>
    <PlusIcon className="h-4 w-4 mr-2" />
    Create Birth Chart
  </Button>
</div>
```

### Loading Skeleton

```tsx
<div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6 space-y-4 animate-pulse">
  <div className="h-4 w-24 bg-slate-800 rounded" />
  <div className="h-8 w-32 bg-slate-800 rounded" />
  <div className="space-y-2">
    <div className="h-3 w-full bg-slate-800 rounded" />
    <div className="h-3 w-3/4 bg-slate-800 rounded" />
  </div>
</div>
```
