# Interaction Specification

## Interaction: [Name]

### Trigger
[What initiates this interaction — click, hover, scroll, load]

### Animation
| Property | From | To | Duration | Easing |
|----------|------|----|----------|--------|
| opacity | 0 | 1 | 200ms | ease-out |
| transform | translateY(8px) | translateY(0) | 200ms | ease-out |

### Standard Timing
- Micro (instant feedback): 100-150ms
- Short (UI transitions): 200-300ms
- Medium (content transitions): 300-500ms
- Long (page transitions): 500-800ms

### Standard Easing
- ease-out: Elements entering (decelerate into rest)
- ease-in: Elements exiting (accelerate away)
- ease-in-out: Elements moving between positions

### Reduced Motion
When prefers-reduced-motion is active:
- Replace animations with instant state changes
- Keep opacity transitions (reduced to 100ms)
- Remove all transform animations