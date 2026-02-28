# Veo Prompt Guide

## What This Is
Technical reference for Google's Veo video generation model. Contains supported features, unique strengths, known limitations, and prompt optimization strategies for the Veo Prompt Engineer agent.

---

## Veo Overview

Google Veo generates video from text prompts with a strong bias toward photorealistic output. It excels at environmental realism, natural lighting, and organic motion (water, wind, clouds, foliage). Veo is optimized for high-fidelity, physically plausible scenes that look like they were captured by a real camera.

---

## Supported Parameters

| Parameter | Options | Notes |
|-----------|---------|-------|
| Duration | 4s, 8s, 16s+ | Longer durations available with simpler scenes |
| Aspect ratio | 16:9 (landscape), 9:16 (portrait), 1:1 (square) | Match to target platform |
| Resolution | Up to 4K output | Higher resolution available for select tiers |
| Frame rate | 24fps standard | Smooth, cinematic output |

---

## Veo Strengths (Lean Into These)

| Strength | Details | Prompt Strategy |
|----------|---------|-----------------|
| Photorealistic environments | Landscapes, nature, urban scenes render with near-photographic quality | Lead with detailed environment descriptions |
| Natural lighting | Sunrise, sunset, overcast, dappled light — all rendered with high fidelity | Specify lighting conditions using real-world references |
| Fluid environmental motion | Water (rivers, ocean, rain), wind (grass, trees, fabric), clouds | Include organic motion elements for life and realism |
| Textured surfaces | Stone, wood, metal, fabric, vegetation — fine detail rendering | Describe material textures specifically |
| Atmospheric depth | Fog, mist, haze, aerial perspective over distance | Use atmospheric effects for depth and mood |
| Camera stability | Smooth, controlled camera movements that feel physically plausible | Describe camera movement as if guiding a drone or gimbal operator |
| Environmental continuity | Consistent scene elements over longer durations | Good for establishing shots and slow reveals |
| Reflective water | Lakes, puddles, wet surfaces — reflections rendered beautifully | Include reflective water elements when appropriate |
| Vegetation detail | Forests, gardens, individual plants — high-fidelity rendering | Describe vegetation types specifically |
| Sky and cloud rendering | Dynamic sky with realistic cloud formations and movement | Include sky descriptions in environment |

---

## Veo Limitations (Work Around These)

| Limitation | Details | Workaround |
|-----------|---------|------------|
| Text in scene | Cannot render readable text reliably | Avoid text entirely; add in post-production |
| Human faces | Close-ups may lack fidelity, especially with direct eye contact | Keep human figures in medium or wide shots. Use silhouettes or backs-to-camera. |
| Complex hand interactions | Detailed hand movements may render incorrectly | Minimize visible hands. Frame to avoid detailed finger work. |
| Rapid action sequences | Fast-moving subjects may blur or have artifacts | Describe motion as slow and measured. Avoid chase scenes or rapid movement. |
| Interior realism | Indoor scenes are less consistent than outdoor environments | For interiors, describe specific materials and lighting meticulously. Favor daytime interiors with window light. |
| Branded or specific objects | Cannot reproduce specific products, logos, or branded items | Describe generic objects with desired characteristics instead |
| Fantasy / physics-breaking | Less suited for physically impossible scenarios than some competitors | Stay grounded in physical reality. Veo's realism engine works against fantasy. |
| Precise subject count | May not generate exact numbers of specified elements | Use "several" or "a group of" instead of "exactly 7" |

---

## Prompt Structure for Veo

### Optimal Order (Environment-First)
Veo generates the best output when the environment is described first and in the most detail. The world comes first, then what happens in it.

1. **Environment / Setting** (most important — describe in detail)
2. **Atmospheric conditions** (weather, time of day, natural effects)
3. **Environmental motion** (what moves in the environment naturally)
4. **Subject / focal element** (what the camera focuses on)
5. **Subject action** (what the focal element does — keep it simple)
6. **Camera movement** (smooth, slow, measured)
7. **Lighting specifics** (direction, quality, color temperature)
8. **Mood** (overall emotional tone)

### Environment Description Depth
Veo rewards environmental detail. Instead of "a forest," describe:
- **Type of forest:** "A dense old-growth Pacific Northwest forest with towering Douglas fir and Western red cedar"
- **Ground cover:** "The forest floor is carpeted with bright green moss and scattered ferns"
- **Atmospheric detail:** "Morning mist hangs between the trunks at waist height, slowly drifting"
- **Light interaction:** "Shafts of early sunlight break through the canopy, creating dappled pools of warm light on the mossy ground"

---

## Camera Movement Vocabulary for Veo

Veo handles smooth, measured camera movements best. Avoid rapid or jerky descriptions.

| Movement | Veo Quality | Tips |
|----------|-------------|------|
| Slow forward dolly | Excellent | Describe as "the camera moves slowly forward through..." |
| Slow pan (left/right) | Excellent | "The camera pans slowly across the landscape" |
| Aerial / drone push | Excellent | "An aerial view slowly pushing forward over the canopy" |
| Gentle tilt (up/down) | Very good | "The camera tilts slowly upward to reveal the sky" |
| Orbit (slow) | Good | "The camera slowly orbits around the central subject" |
| Tracking (following) | Good | Keep the tracked subject moving slowly |
| Static / locked | Excellent | "The camera holds perfectly still" — good for contemplative scenes |
| Fast movement | Poor | Avoid. Artifacts increase with camera speed. |
| Complex choreography | Poor | Avoid. One movement type per clip. |

---

## Lighting Guide for Veo

Veo renders natural light with exceptional quality. Use these descriptions for best results:

| Time of Day | Lighting Description | Mood |
|-------------|---------------------|------|
| Sunrise | "Early morning golden light at a low angle, long warm shadows stretching across the ground" | Hopeful, fresh, new beginning |
| Morning | "Bright clear morning light, slightly cool white, clean shadows" | Energetic, productive, clear |
| Midday | "High overhead sun, minimal shadows, bright even illumination" | Neutral, documentary, raw |
| Golden hour | "Late afternoon sun at 15 degrees above horizon, warm orange-gold directional light" | Warm, cinematic, beautiful |
| Blue hour | "Cool blue-violet ambient light, no direct sun, subtle pink along the horizon" | Contemplative, ethereal, quiet |
| Overcast | "Diffused white light through cloud cover, no harsh shadows, even illumination" | Neutral, soft, understated |
| Night | "Moonlight with cool blue tones, deep shadows, minimal ambient light" | Mysterious, calm, isolated |
| Storm | "Dark dramatic clouds, occasional breaks of light, moody shifting illumination" | Tense, dramatic, powerful |

---

## Duration Guidelines for Veo

| Duration | Scene Complexity |
|----------|-----------------|
| 4 seconds | One subject, one action, one camera movement. Maximum quality. |
| 8 seconds | Full scene with environment, subject, and camera work. Optimal balance. |
| 16 seconds | Simple environment, minimal subject action, slow camera. Quality may vary. |
| 16+ seconds | Very simple scenes only. Static or near-static subjects. Contemplative footage. |

**Rule:** 8 seconds is the sweet spot for Veo. Long enough for a complete scene, short enough for maximum quality.

---

## Common Veo Prompt Patterns

### Pattern 1: Nature Establishing Shot
```
A [WIDE/AERIAL] view of [SPECIFIC NATURAL ENVIRONMENT with details]. [TIME OF DAY] light [LIGHTING DESCRIPTION]. [NATURAL MOTION — wind through grass, water flowing, clouds moving]. The camera [SLOW SMOOTH MOVEMENT]. The atmosphere is [MOOD — serene, dramatic, vast, intimate].
```

### Pattern 2: Urban Environment
```
A [STREET-LEVEL/ELEVATED] view of [SPECIFIC URBAN SETTING with architectural details]. [TIME OF DAY] with [LIGHTING — streetlights, neon, golden hour on buildings]. [URBAN MOTION — pedestrians in distance, traffic lights changing, steam rising from vents]. The camera [SLOW MOVEMENT]. [ATMOSPHERIC CONDITIONS — rain, fog, clear]. [MOOD].
```

### Pattern 3: Object in Environment
```
[CLOSE/MEDIUM SHOT] of [OBJECT with material description] in [ENVIRONMENT]. [ENVIRONMENTAL DETAILS surrounding the object]. [NATURAL LIGHT interacting with the object — reflections, shadows, translucency]. [SUBTLE ENVIRONMENTAL MOTION around the object — breeze, water, light shifting]. The camera [STATIC or VERY SLOW MOVEMENT]. [MOOD].
```

### Pattern 4: Transition / Reveal
```
The camera begins on [STARTING FRAME — close-up or detail]. [SLOW CAMERA MOVEMENT — pull back, tilt up, crane out] gradually reveals [LARGER CONTEXT — environment, scale, surrounding scene]. [LIGHTING shifts subtly as the perspective changes]. [ATMOSPHERIC DETAILS visible at the wider angle]. [MOOD evolves from intimate to expansive].
```

---

## Quality Optimization Tips

1. **Front-load the environment.** Veo's best output comes from rich environmental context. Spend 60% of your prompt on the setting.
2. **Include organic motion.** Static scenes work, but scenes with wind, water, or atmospheric movement look significantly more alive and realistic.
3. **Describe lighting as you'd set it for a real shoot.** "Backlit by late afternoon sun" gives Veo more to work with than "good lighting."
4. **One camera movement per clip.** A slow dolly OR a gentle pan — not both. Combining movements reduces quality.
5. **8 seconds is your friend.** Use 8-second durations as the default. Only go shorter for simple B-roll or longer for very simple atmospheric shots.
6. **Describe materials and textures.** "Weathered gray stone" generates better than "stone wall." Texture descriptions help Veo render convincing surfaces.
