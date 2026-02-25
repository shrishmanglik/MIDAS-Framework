# Platform Design Conventions

## Web
- Navigation: top bar or left sidebar
- Actions: buttons on right, cancel on left
- Modals: centered overlay with backdrop

## iOS (HIG)
- Navigation: tab bar (bottom), nav bar (top)
- Actions: trailing edge, destructive in red
- Typography: SF Pro, Dynamic Type support

## Android (Material)
- Navigation: bottom navigation, drawer
- Actions: FAB for primary, top app bar for secondary
- Typography: Roboto, Material type scale

## Cross-Platform
- Respect platform conventions over consistency
- Use native components where possible
- Test on actual devices, not just emulators