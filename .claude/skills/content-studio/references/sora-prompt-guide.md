# Sora Prompt Guide

## What This Is
Technical reference for OpenAI's Sora video generation model. Contains supported features, known limitations, prompt structure best practices, and parameter guidance for the Sora Prompt Engineer agent.

---

## Sora Overview

Sora generates video from text prompts. It excels at creating photorealistic environments, smooth camera movements, and atmospheric scenes. It understands cinematic language and responds well to detailed scene descriptions.

---

## Supported Parameters

| Parameter | Options | Notes |
|-----------|---------|-------|
| Duration | 5s, 10s, 15s, 20s | Longer durations require simpler scenes |
| Aspect ratio | 16:9 (landscape), 9:16 (portrait), 1:1 (square) | Match to target platform |
| Resolution | 480p, 720p, 1080p | Higher resolution = longer generation time |
| Style | Photorealistic, cinematic, animated, stylized | Specified in prompt text |

---

## Prompt Structure Best Practices

### Optimal Prompt Order
1. **Setting / Environment** — where the scene takes place
2. **Atmospheric conditions** — weather, time of day, ambient effects
3. **Subject / Characters** — who or what is in the frame
4. **Action / Motion** — what happens during the clip
5. **Camera Movement** — how the camera moves through the scene
6. **Lighting** — specific lighting setup and direction
7. **Mood / Tone** — emotional quality of the scene
8. **Technical details** — depth of field, color grading, film style

### Camera Movement Vocabulary
Sora responds well to cinematic camera terminology:

| Movement | Description | Use When |
|----------|-------------|----------|
| Dolly in/out | Camera moves toward/away from subject on a track | Revealing details or establishing scale |
| Pan left/right | Camera rotates horizontally on a fixed point | Surveying an environment |
| Tilt up/down | Camera rotates vertically on a fixed point | Revealing height or looking up/down |
| Crane/jib | Camera rises or descends vertically | Dramatic reveals, establishing shots |
| Tracking shot | Camera moves alongside a moving subject | Following action |
| Orbit | Camera circles around a central subject | Showcasing a product or character |
| Steadicam / gimbal | Smooth handheld following movement | Immersive, documentary feel |
| Static / locked off | Camera doesn't move | Tableaux shots, interviews, product photography |
| Dutch angle | Camera tilted on its axis | Tension, unease, creative shots |
| Zoom in/out | Focal length changes (no physical movement) | Drawing attention or revealing context |

### Lighting Vocabulary

| Lighting | Description | Mood |
|----------|-------------|------|
| Golden hour | Warm, directional sunlight low on the horizon | Warm, nostalgic, cinematic |
| Blue hour | Cool, diffused light just before sunrise / after sunset | Melancholy, serene, ethereal |
| Overcast | Even, diffused light, no harsh shadows | Neutral, documentary, soft |
| Harsh midday | High sun, strong shadows, high contrast | Raw, intense, realistic |
| Rim light | Light from behind the subject, creating a glowing edge | Dramatic, separation from background |
| Neon | Colorful artificial light sources | Urban, cyberpunk, nightlife |
| Candlelight | Warm, flickering, low-intensity point light | Intimate, historical, mysterious |
| Studio / softbox | Controlled, even, professional lighting | Commercial, product, clean |
| Volumetric | Visible light rays through atmosphere (fog, dust, haze) | Atmospheric, epic, mystical |
| Practical lights | Light sources visible in the frame (lamps, screens, fires) | Natural, lived-in, realistic |

---

## Sora Strengths (Lean Into These)

| Strength | Details |
|----------|---------|
| Photorealistic environments | Landscapes, cityscapes, interiors render beautifully |
| Smooth camera movements | Dollies, pans, and tracking shots are fluid and natural |
| Atmospheric effects | Fog, rain, snow, dust, smoke, volumetric light |
| Natural lighting | Golden hour, overcast, blue hour render with high fidelity |
| Reflective surfaces | Water, glass, metal, wet pavement |
| Particle effects | Snow, sparks, dust, floating particles |
| Depth and scale | Wide establishing shots with layered depth |
| Consistent motion | Smooth, predictable subject and camera movement |
| Texture detail | Fabric, stone, wood, metal surfaces render with fine detail |
| Color grading | Responds to color palette descriptions and film style references |

---

## Sora Limitations (Work Around These)

| Limitation | Details | Workaround |
|-----------|---------|------------|
| Text rendering | Cannot reliably produce readable text in the scene | Avoid text; add in post-production |
| Hand / finger detail | Human hands may have wrong number of fingers or unnatural poses | Avoid close-ups of hands. Frame shots to minimize hand visibility. |
| Face close-ups | Extreme close-ups of faces may fall into uncanny valley | Use medium shots or have subjects looking away. Avoid direct-to-camera eye contact. |
| Multi-person sync | Multiple people interacting in precise synchronization | Keep interactions simple. One person acting, others in background. |
| Physics violations | Cannot reliably generate physically impossible scenarios | Keep motion physics-compliant. Avoid anti-gravity or impossible transformations. |
| Counting / quantity | May not generate exact specified numbers of objects | Use "several" or "a few" instead of specific counts when precision isn't critical |
| Temporal consistency | Very long scenes may have subtle inconsistencies | Keep durations at 5-10 seconds for highest quality. 15-20s for simpler scenes. |
| Complex cause-effect | Domino-like chain reactions or Rube Goldberg machines | Avoid complex sequential causation. Keep cause-effect simple. |
| Brand logos | Cannot reproduce specific brand logos accurately | Don't include branded items. Add logos in post-production. |

---

## Prompt Length Guidelines

| Prompt Length | Best For |
|--------------|----------|
| 50-100 words | Simple scenes with one subject and one action |
| 100-200 words | Standard scenes with environment, subject, camera, and lighting |
| 200-350 words | Complex scenes with detailed atmosphere and specific technical direction |
| 350+ words | Diminishing returns — model may confuse priorities |

**Rule:** If your prompt is over 350 words, the scene is probably too complex for a single generation. Split into multiple clips.

---

## Duration Guidelines

| Duration | Complexity Budget |
|----------|------------------|
| 5 seconds | Can include: environment + subject + one camera movement + one action |
| 10 seconds | Can include: full scene with multiple elements, moderate camera choreography |
| 15 seconds | Must simplify: fewer subject actions, slower camera movement, simpler environment |
| 20 seconds | Most constrained: keep it very simple, one slow movement, minimal subject action |

**Rule:** The longer the duration, the simpler the scene should be. Complex action + long duration = artifacts.

---

## Common Prompt Patterns

### Pattern 1: Establishing Shot
```
A [wide/aerial] view of [ENVIRONMENT] during [TIME OF DAY]. [ATMOSPHERIC DETAILS]. The camera [SLOW MOVEMENT — pan, tilt, crane up]. [LIGHTING DESCRIPTION]. [MOOD DESCRIPTOR].
```

### Pattern 2: Product / Object Focus
```
[CLOSE-UP / MEDIUM SHOT] of [OBJECT] on/in [SURFACE/ENVIRONMENT]. [OBJECT DETAILS — material, color, texture]. The camera [SLOW ORBIT / DOLLY / STATIC]. [LIGHTING — usually studio or dramatic]. [MOOD — premium, clean, editorial].
```

### Pattern 3: Environmental Motion
```
[ENVIRONMENT DESCRIPTION with natural motion elements]. [MOTION DETAILS — water flowing, leaves rustling, clouds drifting, rain falling]. The camera [MOVEMENT]. [LIGHTING that enhances the motion]. [ATMOSPHERIC MOOD].
```

### Pattern 4: Abstract / Conceptual
```
[ABSTRACT DESCRIPTION of concept]. [VISUAL METAPHOR]. [MOTION — flowing, transforming, emerging, dissolving]. [LIGHTING — often dramatic or volumetric]. [COLOR PALETTE]. [MOOD — often dreamlike, ethereal, or cosmic].
```

---

## Quality Optimization Tips

1. **Be specific about one thing rather than vague about many.** "A golden retriever running through a wheat field at sunset" generates better than "a beautiful scene with a dog and nature."
2. **Describe what IS, not what ISN'T.** "Calm, still water" works better than "water without waves."
3. **Use "slow" and "smooth" for camera movements.** Fast or jerky camera movements are harder to generate cleanly.
4. **Specify the dominant color relationship.** "Warm gold and cool blue contrast" gives Sora a clear palette to work with.
5. **Include one focal element.** Every shot should have a clear subject — even in environmental shots, something draws the eye.
