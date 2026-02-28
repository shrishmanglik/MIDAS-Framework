# Midjourney Prompt Guide

## What This Is
Technical reference for Midjourney image generation. Contains all parameters, style keywords, quality settings, and prompt architecture for the Midjourney Prompt Engineer agent.

---

## Midjourney Parameters Reference

### Core Parameters

| Parameter | Syntax | Range | Default | Description |
|-----------|--------|-------|---------|-------------|
| Aspect Ratio | `--ar X:Y` | Any ratio | 1:1 | Output image dimensions |
| Version | `--v X` | 5.2, 6.0, 6.1 | Latest | Model version |
| Stylize | `--s X` | 0-1000 | 100 | How much artistic interpretation to apply |
| Chaos | `--c X` | 0-100 | 0 | How varied the results are across the 4-grid |
| Quality | `--q X` | 0.25, 0.5, 1, 2 | 1 | Generation quality/detail level |
| No | `--no X` | Text items | None | Elements to exclude from the image |
| Seed | `--seed X` | 0-4294967295 | Random | Reproduce similar results |
| Tile | `--tile` | On/off | Off | Generate seamless tileable patterns |
| Weird | `--weird X` | 0-3000 | 0 | Unconventional aesthetic qualities |
| Stop | `--stop X` | 10-100 | 100 | Stop generation at a percentage (more abstract at lower values) |

### Aspect Ratio Quick Reference

| Use Case | Ratio | Parameter |
|----------|-------|-----------|
| LinkedIn/Instagram square | 1:1 | `--ar 1:1` |
| Blog hero / YouTube thumbnail | 16:9 | `--ar 16:9` |
| Instagram story / Reels | 9:16 | `--ar 9:16` |
| Presentation slide | 16:9 | `--ar 16:9` |
| Book cover | 2:3 | `--ar 2:3` |
| Pinterest | 2:3 | `--ar 2:3` |
| Twitter header | 3:1 | `--ar 3:1` |
| Ultrawide banner | 21:9 | `--ar 21:9` |

### Stylize (--s) Guide

| Range | Effect | Best For |
|-------|--------|----------|
| 0-50 | Very literal prompt adherence, minimal artistic interpretation | Technical diagrams, specific compositions, UI mockups |
| 50-150 | Balanced — follows prompt closely with subtle artistic touches | Most commercial and professional work |
| 150-350 | Noticeable artistic interpretation, more beautiful but less literal | Marketing imagery, hero shots, social media |
| 350-750 | Strong artistic style, prompt is a suggestion more than an instruction | Creative projects, artistic content, mood-driven images |
| 750-1000 | Maximum artistic freedom, may diverge significantly from prompt | Experimental, artistic exploration, inspiration |

### Chaos (--c) Guide

| Range | Effect | Best For |
|-------|--------|----------|
| 0 | All 4 grid images are similar | When you know exactly what you want |
| 1-15 | Slight variation between grid images | Standard exploration, finding the best version |
| 15-50 | Notable variation, different compositions and interpretations | Creative exploration, finding unexpected approaches |
| 50-100 | Wild variation, each image may interpret the prompt differently | Breaking creative blocks, maximum exploration |

---

## Medium Keywords

The medium keyword dramatically changes the output style. Place it early in the prompt.

| Medium | Effect | Example Prompt Fragment |
|--------|--------|----------------------|
| Photography | Photorealistic output, camera-like rendering | "editorial photography of..." |
| Digital art | Clean digital illustration, vibrant colors | "digital art illustration of..." |
| Oil painting | Textured, painterly look with visible brushstrokes | "oil painting of..." |
| Watercolor | Soft, translucent, flowing color | "watercolor painting of..." |
| 3D render | Clean CGI-style output, smooth surfaces | "3D render of..." |
| Vector illustration | Flat, clean lines, scalable aesthetic | "vector illustration of..." |
| Pencil sketch | Hand-drawn look, graphite textures | "detailed pencil sketch of..." |
| Cinematic still | Movie-quality frame, dramatic lighting | "cinematic still of..." |
| Product photography | Clean, commercial, studio-lit | "product photography of..." |
| Editorial photography | Magazine-quality, styled, professional | "editorial photograph of..." |
| Architectural rendering | Building visualization, precise geometry | "architectural visualization of..." |
| Concept art | Imaginative, detailed, entertainment-industry style | "concept art of..." |
| Isometric | 30-degree angle, clean geometry, flat perspective | "isometric illustration of..." |
| Pixel art | Retro, grid-based, low-resolution aesthetic | "pixel art of..." |
| Collage | Mixed media, layered, textural | "mixed media collage of..." |

---

## Lighting Keywords

| Keyword | Effect |
|---------|--------|
| `golden hour lighting` | Warm, directional, long shadows |
| `blue hour` | Cool, twilight ambiance |
| `Rembrandt lighting` | Dramatic portrait light with triangle shadow |
| `butterfly lighting` | Even face illumination with shadow under nose |
| `rim lighting` | Glowing edge light separating subject from background |
| `studio lighting` | Clean, professional, controlled |
| `neon lighting` | Colorful, urban, artificial |
| `natural light` | Soft, realistic, window or outdoor light |
| `dramatic lighting` | High contrast, strong shadows |
| `volumetric lighting` | Visible light rays through atmosphere |
| `soft diffused light` | Even, gentle, no harsh shadows |
| `backlit` | Subject lit from behind, creating glow or silhouette |
| `chiaroscuro` | Extreme light/dark contrast (Caravaggio style) |
| `candlelight` | Warm, flickering, intimate |
| `fluorescent` | Cool, slightly green-tinted, institutional |

---

## Composition Keywords

| Keyword | Effect |
|---------|--------|
| `rule of thirds` | Subject positioned at third-line intersections |
| `centered composition` | Subject directly in the center |
| `symmetrical` | Mirror-balanced composition |
| `negative space` | Large empty areas drawing focus to subject |
| `close-up` | Tight framing on subject |
| `wide shot` | Subject shown in full environment |
| `bird's eye view` | Directly overhead perspective |
| `worm's eye view` | Looking up from ground level |
| `dutch angle` | Tilted camera for tension |
| `shallow depth of field` | Subject sharp, background blurred |
| `deep depth of field` | Everything in focus |
| `leading lines` | Lines that guide the eye to the subject |
| `framing` | Subject framed by environmental elements |
| `minimalist` | Very few elements, maximum white/negative space |

---

## Color and Mood Keywords

| Keyword | Effect |
|---------|--------|
| `muted colors` | Desaturated, sophisticated palette |
| `vibrant colors` | Saturated, energetic palette |
| `monochromatic` | Single color family |
| `warm tones` | Reds, oranges, golds |
| `cool tones` | Blues, teals, silvers |
| `earth tones` | Browns, olives, terracotta |
| `pastel` | Light, soft, gentle colors |
| `dark and moody` | Low key, deep shadows, dramatic |
| `high contrast` | Strong light/dark differences |
| `cinematic color grading` | Film-like color treatment |
| `desaturated` | Reduced color intensity |
| `duotone` | Two-color palette |

---

## Quality and Style Keyword Combos

### Professional / Commercial
```
professional, clean, high quality, studio lighting, commercial photography, premium, polished
```

### Editorial / Magazine
```
editorial, sophisticated, curated, styled, magazine quality, editorial photography, fashion editorial
```

### Technical / Precision
```
detailed, precise, technical illustration, clean lines, accurate, sharp focus, technical rendering
```

### Cinematic / Dramatic
```
cinematic, dramatic lighting, film still, anamorphic, 35mm film, cinematic composition, movie scene
```

### Minimalist / Clean
```
minimal, clean, negative space, simple, uncluttered, white background, fewer elements
```

### Premium / Luxury
```
luxurious, premium, high-end, gold accents, elegant, sophisticated, refined
```

---

## Multi-Prompt Syntax

Use `::` to give different weight to different parts of the prompt:

```
golden circuit board pattern::2 deep space background::1 --ar 16:9
```

This gives the circuit board pattern twice the influence of the space background.

| Weight | Effect |
|--------|--------|
| `::1` | Standard weight (default) |
| `::2` | Double emphasis |
| `::3` | Triple emphasis |
| `::0.5` | Half weight |
| `::-0.5` | Negative weight (reduces this element) |

---

## Common Mistakes to Avoid

| Mistake | Problem | Fix |
|---------|---------|-----|
| No `--ar` parameter | Defaults to square, rarely ideal | Always set aspect ratio |
| Conflicting styles | "Photorealistic watercolor" confuses the model | Pick ONE medium |
| Too many details | Overcrowded prompt, model can't prioritize | Focus on 3-5 key elements |
| Naming living artists | Ethical/legal concerns | Describe the style characteristics instead |
| No `--no` for clean images | Unwanted elements (text, watermarks, borders) appear | Add `--no text watermark border` for clean output |
| Generic descriptions | "A beautiful scene" gives MJ too little direction | Be specific: materials, lighting, composition |
| `--s` too low for creative work | Literal interpretation may look plain | Use `--s 200-400` for marketing imagery |
| `--s` too high for specific needs | Model ignores your specifications | Use `--s 50-150` when prompt adherence matters |
