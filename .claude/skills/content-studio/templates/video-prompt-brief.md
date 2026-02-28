# Video Prompt Brief Template

## Description
A handoff document from content writers to prompt engineers. When a script or content piece needs AI-generated video, this brief provides the prompt engineer with everything they need to create the generation prompt. This is the bridge between "what the video should convey" and "what the AI should generate."

## When to Use
- When a YouTube script includes B-roll that should be AI-generated
- When social content needs video backgrounds or clips from Sora/Veo
- When a product demo needs generated footage
- When marketing content requires video assets that don't exist yet

## Template Structure

```yaml
# Video Prompt Brief
# Brief ID: {VPB_ID}
# Parent Content: {PARENT_BRIEF_ID — link to the content brief this supports}

## Context
content_type: "{CONTENT_TYPE — what this video supports: YouTube video, LinkedIn post, landing page, ad}"
script_reference: "{SCRIPT_SECTION — which part of the script this video appears in}"
purpose: "{PURPOSE — what this video clip should communicate or evoke}"

## Scene Description
scene_summary: "{SUMMARY — 1-2 sentences describing what should happen in this video}"
subjects:
  - "{SUBJECT_1 — what's in the frame: person, object, environment, abstract concept}"
  - "{SUBJECT_2}"
action: "{ACTION — what happens during the clip: movement, transformation, reveal}"
environment: "{ENVIRONMENT — where this takes place: office, space, nature, abstract, studio}"

## Visual Style
style: "{STYLE — photorealistic | cinematic | stylized | documentary | commercial | abstract}"
mood: "{MOOD — specific emotional tone: mysterious, energetic, calm, premium, technical}"
color_palette: "{COLORS — dominant colors or color relationships}"
lighting: "{LIGHTING — lighting setup: golden hour, studio, neon, natural, dramatic}"
reference_images: "{REFERENCES — description of reference visuals or links to mood board}"

## Technical Requirements
platform: "{PLATFORM — where this video will be displayed}"
aspect_ratio: "{RATIO — 16:9 | 9:16 | 1:1 | 4:3}"
duration: "{DURATION — how many seconds}"
generation_tool: "{TOOL — sora | veo | both (let prompt engineer decide)}"
resolution_needs: "{RESOLUTION — hero quality | standard | draft}"

## Constraints
must_include: ["{ELEMENT_1 — non-negotiable visual elements}"]
must_avoid: ["{AVOID_1 — things that should NOT appear}"]
text_in_video: "{TEXT — any text that needs to appear, or 'none'}"
brand_compliance: "{BRAND — any brand guidelines to follow}"

## Integration Notes
edit_point: "{EDIT — where this clip fits in the final edit: intro, B-roll at 3:15, background loop}"
audio_sync: "{AUDIO — any audio it needs to sync with: voiceover timing, music beat}"
transition: "{TRANSITION — how it connects to surrounding content: cut, dissolve, continuous}"

## Assignment
assigned_to: "{PROMPT_ENGINEER — sora-prompt-engineer | veo-prompt-engineer}"
priority: "{PRIORITY — high | medium | low}"
deadline: "{DEADLINE — YYYY-MM-DD}"
```

## Variable Definitions

| Variable | Description | Constraints |
|----------|-------------|-------------|
| `{CONTENT_TYPE}` | What the video supports | YouTube, LinkedIn, landing page, ad, etc. |
| `{SCENE_SUMMARY}` | What the viewer sees | 1-2 sentences, concrete description |
| `{SUBJECTS}` | Things in the frame | List of visible elements |
| `{ACTION}` | What happens | Movements, changes, reveals |
| `{STYLE}` | Visual treatment | Must match one of the generation tool's strengths |
| `{MOOD}` | Emotional tone | Specific descriptors, not just "good" |
| `{DURATION}` | Clip length in seconds | Must be within the tool's supported range |
| `{GENERATION_TOOL}` | Which AI to use | sora, veo, or let engineer decide |
| `{MUST_INCLUDE}` | Required elements | Non-negotiable visual features |
| `{MUST_AVOID}` | Excluded elements | Things that would hurt the content |
| `{EDIT_POINT}` | Timeline position | Where in the final edit this clip appears |

## Completed Example

```yaml
# Video Prompt Brief
# Brief ID: VPB-2026-0018
# Parent Content: CB-2026-0042 (AstroAI Architecture YouTube Video)

## Context
content_type: "YouTube video B-roll"
script_reference: "Cold Open (0:00-0:08) — background visual behind the opening hook"
purpose: "Create a premium, visually striking cosmic scene that immediately communicates 'this is about AI + astrology' without being cheesy. Sets the tone for the entire video."

## Scene Description
scene_summary: "A cosmic landscape with golden constellation lines tracing themselves across deep space, creating geometric Vedic astronomical chart patterns. Premium, mysterious, and technical."
subjects:
  - "Deep space star field as background"
  - "Thin golden lines forming constellation/chart patterns"
  - "Translucent orbital rings at different depths"
  - "Tiny golden particles drifting through the scene"
action: "Camera dollies slowly forward through layered orbital rings while golden constellation lines trace themselves across the frame. Particles drift gently."
environment: "Deep space — vast, dark, with stars and nebulae in the far background"

## Visual Style
style: "cinematic"
mood: "Reverent, premium, mystical but not new-age — think ancient observatory meets deep space"
color_palette: "Deep black background, warm gold accents, cool blue-white starlight, touches of deep purple nebula"
lighting: "Dark space with warm gold volumetric light catching particles. Cool blue-white star points. No single dominant light source — ambient and atmospheric."
reference_images: "Think: the opening of Interstellar meets a premium watch commercial. Precise, beautiful, vast."

## Technical Requirements
platform: "YouTube (also clipped for LinkedIn header video)"
aspect_ratio: "16:9"
duration: "10 seconds (will be trimmed to 8s for cold open, full 10s for intro background)"
generation_tool: "sora (preferred for the smooth dolly and particle effects) or veo (if more environmental realism is needed)"
resolution_needs: "hero quality — this is the opening shot of the video"

## Constraints
must_include:
  - "Golden geometric lines (constellation/chart patterns)"
  - "Star field background"
  - "Sense of depth and layers"
must_avoid:
  - "Cheesy astrology imagery (no zodiacs signs, no crystal balls, no tarot)"
  - "Readable text (no words or numbers in the scene)"
  - "Bright or saturated colors (this should feel dark and premium)"
  - "Human figures"
text_in_video: "none"
brand_compliance: "AstroAI brand colors: gold (#D4AF37) and deep space black (#0D0D0D). Premium and technical, never mystical-kitsch."

## Integration Notes
edit_point: "0:00-0:08 primary use. Extended version (full 10s) used as background behind intro section 0:08-0:18 with talking head overlay."
audio_sync: "Voiceover begins at 0:00. The visual should have a subtle 'arrival' or 'reveal' moment around 0:03-0:04 to coincide with the first key stat in the voiceover."
transition: "Dissolve to talking head at 0:08. The end of the clip should have a natural fade-to-dark-possible area for the dissolve."

## Assignment
assigned_to: "sora-prompt-engineer"
priority: "high"
deadline: "2026-03-01"
```
