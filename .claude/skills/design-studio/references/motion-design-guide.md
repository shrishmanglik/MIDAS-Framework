# Motion Design Guide

## Animation Principles
1. **Duration:** UI transitions 200-500ms, decorative 500-1000ms
2. **Easing:** ease-out for enter, ease-in for exit, ease-in-out for move
3. **Purpose:** Every animation must guide attention or provide feedback
4. **Restraint:** Less is more — animate only what needs attention

## Reduced Motion
Always provide `prefers-reduced-motion` alternatives:
- Replace slide/scale with fade
- Reduce durations to 100ms
- Remove parallax and auto-play