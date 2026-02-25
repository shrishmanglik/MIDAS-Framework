import os
BASE = r"F:\Million Dollar AI Studio\Framework\.claude\skills"

def write(path, content):
    full = os.path.join(BASE, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"  Created: {path}")

def agent(name, studio, role, exp, philosophy, tone, caps, forbidden, inputs, outputs, spawn_method, spawn_reason, checks, escalation):
    c = "\n".join(f"- {x}" for x in caps)
    f = "\n".join(f"- {x}" for x in forbidden)
    i = "\n".join(f"- {x}" for x in inputs)
    o = "\n".join(f"- {x}" for x in outputs)
    ch = "\n".join(f"{j+1}. {x}" for j,x in enumerate(checks))
    esc = "\n".join(f"- {x}" for x in escalation)
    return f"""---
name: "{name}"
studio: "{studio}"
role: "{role}"
tier: "tier-3"
model_routing:
  simple_queries: "haiku"
  standard_work: "sonnet"
  complex_analysis: "opus"
---

# {name}

## Identity
You are **{name}**, {role} in the MIDAS {studio}. {exp}

## Communication Style
- **Philosophy**: {philosophy}
- **Tone**: {tone}
- Cite sources and data for every claim
- Flag assumptions explicitly
- Present options with trade-offs, not single answers

## Capabilities
{c}

## Forbidden Actions
{f}

## Inputs
{i}

## Outputs
{o}

## Spawning Rule
- **Method**: {spawn_method}
- **Reason**: {spawn_reason}

## Quality Self-Check
Before delivering any output:
{ch}

## Escalation Triggers
{esc}
"""

count = 0

# ============================================================
# EDTECH STUDIO
# ============================================================
print("\\n=== EDTECH STUDIO ===")

write("edtech-studio/SKILL.md", """---
name: "edtech-studio"
description: "Educational content, course design, curriculum development, learning management, and assessment creation"
activation:
  - "course"
  - "curriculum"
  - "lesson plan"
  - "educational content"
  - "training"
  - "assessment"
  - "learning path"
  - "LMS"
tier: "tier-2/tier-3"
dependencies:
  - "midas-framework"
  - "content-studio"
  - "design-studio"
---

# EdTech Studio

## Mission
Design and build world-class educational experiences — from course curricula to interactive assessments. Combine instructional design principles with modern technology to make learning effective, engaging, and accessible.

## Team Roster
| Agent | Role | Spawn |
|-------|------|-------|
| Learning Director | EdTech strategy and studio coordination | Inline |
| Curriculum Designer | Course structure and learning path design | Subagent |
| Instructional Writer | Lesson content and educational materials | Inline |
| Assessment Architect | Quiz, test, and evaluation design | Inline |
| LMS Specialist | Learning management system configuration | Inline |
| Accessibility Expert | Educational accessibility compliance | Inline |
| EdTech Reviewer | Adversarial review of all educational outputs | ALWAYS Subagent |

## Pipeline
1. **Learning Analysis** — Define learning objectives and audience
2. **Curriculum Design** — Structure courses, modules, lessons
3. **Content Creation** — Write lessons, exercises, examples
4. **Assessment Design** — Create evaluations aligned to objectives
5. **Platform Setup** — Configure LMS or delivery platform
6. **Review** — EdTech Reviewer validates pedagogy and accessibility
7. **Deliver** — Complete course package

## Spawning Rules
- EdTech Reviewer: ALWAYS spawned as subagent (adversarial)
- Curriculum Designer: Subagent for multi-course programs
- All others: Inline for focused tasks

## Budget Guardrails
- Use templates for lesson plans, quiz formats (Tier 1)
- Use rules for Bloom's taxonomy alignment (Tier 2)
- Reserve LLM for custom content creation, adaptive learning (Tier 3)

## Quality Gates
1. All content aligned to stated learning objectives
2. Bloom's taxonomy levels appropriate for audience
3. Assessments measure stated objectives
4. Accessibility standards met (WCAG for digital, UDL for pedagogy)
5. EdTech Reviewer approval required

## Integration Points
- **content-studio** → Written content support
- **design-studio** → Visual and UX design for learning interfaces
- **dev-studio** → Custom learning platform development
- **brand-studio** → Consistent branding in educational materials

## Templates
- `templates/course-outline.md` — Course structure template
- `templates/lesson-plan.md` — Individual lesson template
- `templates/assessment-design.md` — Quiz and test framework
- `templates/rubric.md` — Grading rubric template
""")
count += 1

edtech_agents = [
    ("Learning Director", "edtech-studio", "EdTech strategy lead and studio coordinator",
     "18+ years in educational technology, instructional design leadership, and learning science. Led course development at top EdTech platforms.",
     "Learning is a journey, not an event. Great educational design makes the complex accessible and the boring fascinating.",
     "Inspiring, pedagogically rigorous, learner-centered.",
     ["Learning strategy development", "Course program architecture", "Learning analytics frameworks", "EdTech vendor evaluation", "Instructional design oversight", "Cross-studio educational coordination"],
     ["Never compromise on learning objective alignment", "Never sacrifice accessibility for aesthetics", "Never create content without clear learning outcomes"],
     ["Learning goals and audience profile", "Subject matter expertise", "Platform constraints", "Budget and timeline"],
     ["Learning strategies", "Program architectures", "Quality frameworks", "Coordination plans"],
     "Inline", "Coordinates studio and handles strategic questions",
     ["Clear learning objectives defined", "Audience analysis complete", "Pedagogical approach justified", "Measurable outcomes specified"],
     ["Custom platform development → dev-studio", "Brand consistency → brand-studio"]),

    ("Curriculum Designer", "edtech-studio", "Course structure and learning path architect",
     "15+ years designing curricula for universities, corporate training, and online platforms. Expert in backward design, competency-based education, and microlearning.",
     "Start with what learners should be able to DO, then work backward to design the path there.",
     "Structured, learner-focused, evidence-based.",
     ["Course and program structure design", "Learning path sequencing", "Competency framework development", "Prerequisite mapping", "Module and lesson architecture", "Backward design implementation"],
     ["Never design without learning objectives first", "Never create linear-only paths when branching improves outcomes", "Never skip prerequisite analysis"],
     ["Learning objectives", "Audience skill levels", "Time constraints", "Subject matter content"],
     ["Course outlines with learning paths", "Module structures", "Competency maps", "Prerequisite chains"],
     "Subagent", "Multi-course program design needs isolated context for coherent structure",
     ["Learning objectives drive structure", "Scaffolding is appropriate", "Time estimates realistic", "Prerequisites mapped"],
     ["Content depth beyond expertise → research-studio", "Visual learning design → design-studio"]),

    ("Instructional Writer", "edtech-studio", "Educational content and lesson material writer",
     "12+ years writing educational content for diverse audiences — K-12, higher ed, corporate, and self-directed learners. Expert in scaffolded instruction and active learning.",
     "Great instructional writing is invisible — the learner focuses on understanding, not decoding the text.",
     "Clear, engaging, appropriately challenging. Adapts complexity to audience.",
     ["Lesson content writing", "Tutorial and how-to guides", "Case study development", "Worked examples and practice problems", "Glossary and reference material creation", "Interactive exercise design"],
     ["Never assume prior knowledge without stating it", "Never use jargon without definition", "Never write walls of text without breaks or activities"],
     ["Course outline and objectives", "Audience profile", "Subject matter content", "Style guidelines"],
     ["Lesson content", "Practice exercises", "Reference materials", "Instructor guides"],
     "Inline", "Lesson writing is typically focused and contained",
     ["Content matches learning objectives", "Reading level appropriate for audience", "Active learning elements included", "Examples are relevant and diverse"],
     ["Subject matter accuracy → research-studio", "Visual content needed → design-studio"]),

    ("Assessment Architect", "edtech-studio", "Assessment design and evaluation specialist",
     "14+ years in educational assessment, psychometrics, and evaluation design. Expert in formative and summative assessment strategies.",
     "Assessments should help learners learn, not just prove they learned. Design for growth, not gotchas.",
     "Fair, rigorous, constructive. Assessments that teach while they test.",
     ["Formative assessment design (practice, self-check)", "Summative assessment creation (exams, projects)", "Rubric development", "Question bank generation", "Bloom's taxonomy alignment", "Assessment analytics design"],
     ["Never test content not covered in instruction", "Never use trick questions", "Never rely solely on recall-level questions"],
     ["Learning objectives", "Lesson content", "Bloom's taxonomy levels", "Assessment constraints"],
     ["Assessments aligned to objectives", "Rubrics with clear criteria", "Answer keys with explanations", "Assessment analytics specs"],
     "Inline", "Assessment design is focused and structured",
     ["Every question maps to a learning objective", "Bloom's levels appropriate", "Rubrics are specific and actionable", "No bias in question design"],
     ["High-stakes assessment validation → EdTech Reviewer", "Psychometric analysis → escalate to domain expert"]),

    ("LMS Specialist", "edtech-studio", "Learning management system configuration and optimization specialist",
     "10+ years configuring and optimizing LMS platforms (Moodle, Canvas, Teachable, Thinkific, custom). Expert in SCORM, xAPI, and learning platform architecture.",
     "The platform should serve the pedagogy, not constrain it.",
     "Technical, practical, platform-aware.",
     ["LMS configuration and setup", "SCORM/xAPI package creation", "Course enrollment and access design", "Learning analytics dashboard design", "Platform integration planning", "Migration between LMS platforms"],
     ["Never lock learners into a single platform without export options", "Never skip SCORM/xAPI compliance for trackable content", "Never ignore platform accessibility features"],
     ["Course structure", "Platform requirements", "Integration needs", "User roles"],
     ["LMS configuration specs", "SCORM/xAPI packages", "Platform setup guides", "Analytics dashboards"],
     "Inline", "LMS configuration is technical but contained",
     ["Platform requirements met", "Content is portable (SCORM/xAPI)", "Accessibility features enabled", "Analytics tracking configured"],
     ["Custom platform development → dev-studio", "Complex integrations → dev-studio"]),

    ("Accessibility Expert", "edtech-studio", "Educational accessibility and inclusive design specialist",
     "12+ years in accessible education design, UDL (Universal Design for Learning), and Section 508/WCAG compliance for educational content.",
     "Accessible education benefits ALL learners, not just those with disabilities.",
     "Inclusive, practical, standards-aware.",
     ["WCAG compliance for digital learning", "UDL framework implementation", "Alternative format creation (captions, transcripts, alt text)", "Assistive technology compatibility", "Cognitive load analysis", "Multilingual and cultural accessibility"],
     ["Never treat accessibility as an afterthought", "Never assume one-size-fits-all learning", "Never skip alt text, captions, or transcripts"],
     ["Educational content and platform", "Audience diversity profile", "Compliance requirements"],
     ["Accessibility audit reports", "UDL recommendations", "Alternative format specifications", "Remediation guides"],
     "Inline", "Accessibility review is focused and standards-based",
     ["WCAG standards met", "UDL principles applied", "Multiple modalities available", "Assistive technology compatible"],
     ["Complex remediation → design-studio", "Platform accessibility issues → dev-studio"]),

    ("EdTech Reviewer", "edtech-studio", "Adversarial educational quality reviewer",
     "16+ years in educational quality assurance, curriculum review, and pedagogical evaluation. Expert at identifying gaps in learning design.",
     "Good education looks easy. My job is to ensure it actually IS effective, not just looks polished.",
     "Critical, constructive, learner-advocating.",
     ["Pedagogical effectiveness review", "Learning objective alignment verification", "Assessment validity checking", "Accessibility compliance audit", "Content accuracy verification", "Engagement and retention analysis"],
     ["Never approve without checking objective alignment", "Never skip accessibility review", "Never rubber-stamp peer work"],
     ["Educational outputs from other studio agents", "Learning objectives", "Accessibility standards"],
     ["Review report with findings", "Pedagogical issues list", "Accessibility gaps", "Approval or rejection"],
     "ALWAYS Subagent", "Adversarial review requires independent context",
     ["Objectives alignment verified", "Bloom's taxonomy appropriate", "Accessibility checked", "Content accuracy confirmed"],
     ["Subject matter errors → research-studio", "Systemic design issues → Learning Director"])
]

for a in edtech_agents:
    slug = a[0].lower().replace(' ','-')
    write(f"edtech-studio/agents/{slug}.md", agent(*a))
    count += 1

# EdTech workflows
write("edtech-studio/workflows/course-creation.md", """---
name: "course-creation"
studio: "edtech-studio"
trigger: "create course, build curriculum, design training"
---

# Course Creation Workflow

## Steps
1. **Learning Analysis** — Learning Director defines objectives, audience, constraints
2. **Curriculum Design** — Curriculum Designer builds course structure (subagent)
3. **Content Writing** — Instructional Writer creates lesson materials
4. **Assessment Design** — Assessment Architect builds evaluations
5. **Accessibility Review** — Accessibility Expert audits all materials
6. **Platform Setup** — LMS Specialist configures delivery
7. **Final Review** — EdTech Reviewer validates entire course (ALWAYS subagent)
8. **Delivery** — Complete course package

## Handoff Artifacts
- Learning objectives → Curriculum Designer
- Course structure → Instructional Writer + Assessment Architect
- Content + assessments → Accessibility Expert
- Accessible materials → LMS Specialist
- Complete course → EdTech Reviewer
""")
count += 1

write("edtech-studio/workflows/assessment-creation.md", """---
name: "assessment-creation"
studio: "edtech-studio"
trigger: "create assessment, design quiz, build exam"
---

# Assessment Creation Workflow

## Steps
1. **Objectives Mapping** — Map learning objectives to assessment items
2. **Question Design** — Assessment Architect creates questions at appropriate Bloom's levels
3. **Rubric Creation** — Design scoring criteria
4. **Accessibility Check** — Accessibility Expert reviews
5. **Review** — EdTech Reviewer validates alignment and fairness (ALWAYS subagent)
6. **Delivery** — Assessment package with answer key and rubrics
""")
count += 1

write("edtech-studio/workflows/learning-path-design.md", """---
name: "learning-path-design"
studio: "edtech-studio"
trigger: "learning path, skill development plan, training roadmap"
---

# Learning Path Design Workflow

## Steps
1. **Skill Analysis** — Learning Director maps target competencies
2. **Path Architecture** — Curriculum Designer creates learning path with prerequisites (subagent)
3. **Content Mapping** — Map existing and needed content to path
4. **Assessment Checkpoints** — Assessment Architect designs progress milestones
5. **Review** — EdTech Reviewer validates path coherence (ALWAYS subagent)
6. **Delivery** — Complete learning path with milestones
""")
count += 1

# EdTech templates
write("edtech-studio/templates/course-outline.md", """---
name: "course-outline"
studio: "edtech-studio"
tier: "tier-1/tier-3"
description: "Course structure and module planning template"
---

# Course Outline Template

## Course Overview
- **Title**: [Course Title]
- **Duration**: [Total hours/weeks]
- **Level**: [Beginner / Intermediate / Advanced]
- **Prerequisites**: [List or "None"]
- **Target Audience**: [Description]

## Learning Objectives
By the end of this course, learners will be able to:
1. [Objective 1 — use action verbs from Bloom's taxonomy]
2. [Objective 2]
3. [Objective 3]
4. [Objective 4]

## Module Structure
### Module 1: [Title] (Week/Hours)
- **Objective**: [What learners will achieve]
- **Topics**: [List of topics]
- **Activities**: [Practice exercises, discussions, projects]
- **Assessment**: [How learning is measured]

### Module 2: [Title] (Week/Hours)
- **Objective**: [What learners will achieve]
- **Topics**: [List of topics]
- **Activities**: [Practice exercises, discussions, projects]
- **Assessment**: [How learning is measured]

## Assessment Strategy
| Assessment | Type | Weight | Objectives Measured |
|-----------|------|--------|-------------------|
| Quiz 1 | Formative | 10% | Obj 1, 2 |
| Project | Summative | 40% | Obj 1, 2, 3 |
| Final Exam | Summative | 30% | All |
| Participation | Formative | 20% | Obj 4 |

## Resources
- **Required**: [Textbooks, tools, accounts]
- **Recommended**: [Additional resources]
- **Provided**: [Materials included in course]
""")
count += 1

write("edtech-studio/templates/lesson-plan.md", """---
name: "lesson-plan"
studio: "edtech-studio"
tier: "tier-1/tier-2"
description: "Individual lesson structure template"
---

# Lesson Plan Template

## Lesson Overview
- **Title**: [Lesson Title]
- **Module**: [Parent Module]
- **Duration**: [Minutes/Hours]
- **Bloom's Level**: [Remember/Understand/Apply/Analyze/Evaluate/Create]

## Learning Objectives
After this lesson, learners will be able to:
1. [Specific, measurable objective]
2. [Specific, measurable objective]

## Lesson Flow
### 1. Hook / Warm-Up (5-10 min)
[Engaging opening — question, scenario, demo, story]

### 2. Instruction (15-20 min)
[Core content delivery — concepts, examples, demonstrations]
- Key Concept 1: [Explanation]
- Key Concept 2: [Explanation]
- Worked Example: [Step-by-step example]

### 3. Guided Practice (10-15 min)
[Scaffolded exercises with support]
- Exercise 1: [Description]
- Exercise 2: [Description]

### 4. Independent Practice (10-15 min)
[Learner works independently]
- Task: [Description]
- Success Criteria: [How to know they got it right]

### 5. Wrap-Up / Reflection (5 min)
- Key Takeaways: [3 bullet points]
- Self-Check: [Quick reflection question]
- Preview: [What's next]

## Materials Needed
- [Material 1]
- [Material 2]

## Differentiation
- **Struggling Learners**: [Support strategies]
- **Advanced Learners**: [Extension activities]

## Assessment
- **Formative**: [How you check understanding during lesson]
- **Summative**: [Connection to graded assessment]
""")
count += 1

write("edtech-studio/templates/assessment-design.md", """---
name: "assessment-design"
studio: "edtech-studio"
tier: "tier-1/tier-2"
description: "Assessment and quiz design framework"
---

# Assessment Design Template

## Assessment Overview
- **Title**: [Assessment Title]
- **Type**: [Formative / Summative]
- **Duration**: [Time limit]
- **Total Points**: [Points]
- **Passing Score**: [Threshold]

## Objective Alignment
| Question(s) | Objective | Bloom's Level | Points |
|------------|-----------|--------------|--------|
| 1-3 | Obj 1 | Remember/Understand | 15 |
| 4-6 | Obj 2 | Apply | 15 |
| 7-8 | Obj 3 | Analyze | 20 |
| 9-10 | Obj 4 | Evaluate/Create | 50 |

## Question Types
### Multiple Choice (Knowledge/Comprehension)
- **Q**: [Question stem — clear, no tricks]
- **A**: [Correct answer] *
- **B**: [Plausible distractor with explanation]
- **C**: [Plausible distractor with explanation]
- **D**: [Plausible distractor with explanation]
- **Explanation**: [Why A is correct]

### Short Answer (Application)
- **Q**: [Scenario or problem]
- **Expected Answer**: [Key points that should be included]
- **Rubric**: [Scoring criteria]

### Project/Performance (Analysis/Creation)
- **Task**: [Clear description of what to produce]
- **Rubric**: See attached rubric
- **Resources Allowed**: [What learners can reference]

## Rubric
| Criteria | Excellent (4) | Good (3) | Adequate (2) | Needs Work (1) |
|----------|-------------|---------|-------------|----------------|
| [Criteria 1] | | | | |
| [Criteria 2] | | | | |
| [Criteria 3] | | | | |
""")
count += 1

write("edtech-studio/templates/rubric.md", """---
name: "rubric"
studio: "edtech-studio"
tier: "tier-1"
description: "Grading rubric template for educational assessments"
---

# Rubric Template

## Assessment: [Title]
## Total Points: [Points]

| Criteria | Excellent (4) | Proficient (3) | Developing (2) | Beginning (1) | Weight |
|----------|-------------|---------------|----------------|---------------|--------|
| **[Criteria 1]** | [Detailed description of excellent performance] | [Detailed description of proficient performance] | [Detailed description of developing performance] | [Detailed description of beginning performance] | ×[multiplier] |
| **[Criteria 2]** | [Description] | [Description] | [Description] | [Description] | ×[multiplier] |
| **[Criteria 3]** | [Description] | [Description] | [Description] | [Description] | ×[multiplier] |
| **[Criteria 4]** | [Description] | [Description] | [Description] | [Description] | ×[multiplier] |

## Scoring Guide
- **Excellent (4)**: Exceeds expectations. Demonstrates mastery.
- **Proficient (3)**: Meets expectations. Solid understanding.
- **Developing (2)**: Approaching expectations. Some gaps.
- **Beginning (1)**: Below expectations. Significant gaps.

## Score Calculation
Total = Sum of (Rating × Weight) for each criteria
- **A**: 90-100%
- **B**: 80-89%
- **C**: 70-79%
- **D**: 60-69%
- **F**: Below 60%
""")
count += 1

# EdTech references
edtech_refs = [
    ("blooms-taxonomy.md", "Bloom's Taxonomy Reference for Educational Design", """
## Bloom's Taxonomy Levels (Revised)

### Level 1: Remember
- **Definition**: Recall facts and basic concepts
- **Verbs**: Define, list, name, recall, identify, state, match
- **Assessment**: Multiple choice, fill-in-blank, matching

### Level 2: Understand
- **Definition**: Explain ideas or concepts
- **Verbs**: Describe, explain, summarize, paraphrase, classify, compare
- **Assessment**: Short answer, explain in own words

### Level 3: Apply
- **Definition**: Use information in new situations
- **Verbs**: Execute, implement, solve, use, demonstrate, apply
- **Assessment**: Problem-solving, exercises, simulations

### Level 4: Analyze
- **Definition**: Draw connections among ideas
- **Verbs**: Differentiate, organize, relate, compare, contrast, examine
- **Assessment**: Case studies, analysis papers, comparisons

### Level 5: Evaluate
- **Definition**: Justify a decision or course of action
- **Verbs**: Check, critique, judge, evaluate, assess, argue
- **Assessment**: Reviews, critiques, debates

### Level 6: Create
- **Definition**: Produce new or original work
- **Verbs**: Design, construct, develop, formulate, create, compose
- **Assessment**: Projects, portfolios, original work
"""),
    ("instructional-design-models.md", "Instructional Design Models Reference", """
## ADDIE Model
1. **Analyze** — Identify learning needs, audience, constraints
2. **Design** — Define objectives, structure, assessments
3. **Develop** — Create content and materials
4. **Implement** — Deploy the learning experience
5. **Evaluate** — Measure effectiveness, iterate

## Backward Design (Understanding by Design)
1. **Identify Desired Results** — What should learners know/do?
2. **Determine Acceptable Evidence** — How will you know they learned?
3. **Plan Learning Experiences** — What activities support learning?

## SAM (Successive Approximation Model)
- Iterative, agile approach to instructional design
- Rapid prototyping with frequent feedback loops
- 3 phases: Preparation, Iterative Design, Iterative Development

## Gagné's Nine Events of Instruction
1. Gain attention
2. Inform learners of objectives
3. Stimulate recall of prior learning
4. Present content
5. Provide learning guidance
6. Elicit performance (practice)
7. Provide feedback
8. Assess performance
9. Enhance retention and transfer

## Microlearning Principles
- Content chunks: 3-7 minutes
- Single objective per chunk
- Immediately applicable
- Mobile-friendly delivery
- Spaced repetition for retention
"""),
    ("udl-framework.md", "Universal Design for Learning (UDL) Framework", """
## Three UDL Principles

### 1. Multiple Means of Engagement (The WHY)
- Provide options for self-regulation
- Provide options for sustaining effort and persistence
- Provide options for recruiting interest
- **Examples**: Choice in topics, varied difficulty levels, collaborative options

### 2. Multiple Means of Representation (The WHAT)
- Provide options for comprehension
- Provide options for language and symbols
- Provide options for perception
- **Examples**: Text + video + audio, glossaries, visual organizers

### 3. Multiple Means of Action & Expression (The HOW)
- Provide options for executive functions
- Provide options for expression and communication
- Provide options for physical action
- **Examples**: Written/oral/visual submissions, planning tools, assistive tech support
"""),
    ("learning-analytics.md", "Learning Analytics Metrics and KPIs", """
## Engagement Metrics
| Metric | Description | Target |
|--------|------------|--------|
| Completion Rate | % who finish course | >70% |
| Active Time | Avg time actively engaged | Varies by course |
| Login Frequency | How often learners return | 3+ per week |
| Content Interactions | Clicks, views, downloads | Upward trend |
| Discussion Participation | Posts, replies, reactions | 80%+ participation |

## Performance Metrics
| Metric | Description | Target |
|--------|------------|--------|
| Assessment Scores | Average and distribution | >70% average |
| Objective Mastery | % meeting each objective | >80% per objective |
| Time to Mastery | How long to reach proficiency | Decreasing trend |
| Retry Rate | How often assessments are retaken | <30% |

## Satisfaction Metrics
| Metric | Description | Target |
|--------|------------|--------|
| NPS | Net Promoter Score | >50 |
| Course Rating | 1-5 star rating | >4.0 |
| Would Recommend | % who would recommend | >80% |
| Qualitative Feedback | Themes in open responses | Positive trends |

## Business Impact Metrics
| Metric | Description | Target |
|--------|------------|--------|
| Skill Application | Using new skills on job | >60% within 30 days |
| Performance Improvement | Measurable work outcomes | Defined per program |
| Certification Rate | % earning credentials | >70% |
| ROI | Training investment return | Positive within 6 months |
"""),
    ("educational-accessibility.md", "Educational Accessibility Standards", """
## WCAG 2.1 for Educational Content
### Perceivable
- Alt text for all images and diagrams
- Captions for all video content
- Transcripts for audio content
- Sufficient color contrast (4.5:1 for text)
- Content resizable to 200% without loss

### Operable
- Keyboard navigable (no mouse-only interactions)
- Sufficient time for timed activities
- No content that causes seizures
- Clear navigation and page structure

### Understandable
- Reading level appropriate for audience
- Consistent navigation patterns
- Input assistance for forms
- Error identification and suggestions

### Robust
- Compatible with assistive technologies
- Valid HTML markup
- ARIA labels where needed

## Section 508 Requirements
- All electronic content must be accessible
- Equivalent alternatives for multimedia
- Pages usable without scripts where possible
- Forms accessible with assistive tech

## Educational-Specific Accessibility
- Multiple formats for key content (text, audio, visual)
- Flexible assessment formats
- Extended time options for assessments
- Screen reader compatible math notation (MathML)
"""),
    ("edtech-review-checklist.md", "EdTech Quality Review Checklist", """
## Pedagogical Quality
- [ ] Clear, measurable learning objectives
- [ ] Bloom's taxonomy levels appropriate
- [ ] Content directly supports objectives
- [ ] Scaffolding from simple to complex
- [ ] Active learning opportunities throughout
- [ ] Formative checks woven into lessons

## Assessment Quality
- [ ] Every assessment item maps to an objective
- [ ] Mix of Bloom's levels in assessments
- [ ] Rubrics are specific and actionable
- [ ] No trick questions or ambiguous stems
- [ ] Answer keys include explanations
- [ ] Pass/fail thresholds are reasonable

## Content Quality
- [ ] Factually accurate and current
- [ ] Free of bias and stereotypes
- [ ] Diverse examples and perspectives
- [ ] Appropriate reading level
- [ ] Engaging and relevant examples
- [ ] Proper citations for all sources

## Accessibility
- [ ] WCAG 2.1 AA compliance
- [ ] UDL principles applied
- [ ] Multiple content formats available
- [ ] Captions and transcripts for media
- [ ] Alt text for all images
- [ ] Screen reader compatible

## Technical
- [ ] SCORM/xAPI compliant (if applicable)
- [ ] Mobile responsive
- [ ] Links and resources functional
- [ ] File sizes optimized
- [ ] Cross-browser compatible
"""),
    ("question-writing-guide.md", "Effective Question Writing Guide", """
## Multiple Choice Best Practices
- Clear, concise stems with one question per item
- All options grammatically consistent with stem
- Avoid "all of the above" and "none of the above"
- Distractors should be plausible and educational
- Randomize correct answer position
- Avoid negative stems ("Which is NOT...")

## Short Answer Best Practices
- Specify expected length and format
- Provide clear scoring criteria
- Allow for valid alternative responses
- Test application, not just recall

## Essay/Long Answer Best Practices
- Clear task with specific requirements
- Detailed rubric with concrete criteria
- Model answer or exemplar available
- Appropriate time allocation

## Common Mistakes to Avoid
- Testing trivial facts instead of understanding
- Using unnecessarily complex language
- Including irrelevant information as distractors
- Writing stems that give away answers
- Testing content not covered in instruction
- Creating all questions at the same Bloom's level
""")
]

for fname, title, content in edtech_refs:
    write(f"edtech-studio/references/{fname}", f"""---
name: "{fname.replace('.md','')}"
studio: "edtech-studio"
---

# {title}
{content}
""")
    count += 1

# ============================================================
# ASTRO STUDIO
# ============================================================
print("\\n=== ASTRO STUDIO ===")

write("astro-studio/SKILL.md", """---
name: "astro-studio"
description: "Astrology-based content, birth chart analysis, horoscope generation, and astrological brand integration"
activation:
  - "astrology"
  - "horoscope"
  - "birth chart"
  - "zodiac"
  - "natal chart"
  - "astrological"
  - "star sign"
tier: "tier-2/tier-3"
dependencies:
  - "midas-framework"
  - "content-studio"
---

# Astro Studio

## Mission
Create engaging, well-crafted astrological content — from daily horoscopes to detailed birth chart analyses. Blend traditional astrological knowledge with modern, accessible writing for entertainment and self-reflection.

## Important Disclaimer
**All Astro Studio outputs are for entertainment and self-reflection purposes only. Astrology is not a science and should not be used as the basis for important life decisions.**

## Team Roster
| Agent | Role | Spawn |
|-------|------|-------|
| Astro Director | Studio strategy and astrological oversight | Inline |
| Chart Analyst | Birth chart and transit analysis | Subagent |
| Horoscope Writer | Daily/weekly/monthly horoscope content | Inline |
| Compatibility Analyst | Synastry and relationship analysis | Inline |
| Astro Content Strategist | Content calendar and series planning | Inline |
| Astro Reviewer | Quality and accuracy review | ALWAYS Subagent |

## Pipeline
1. **Brief** — Define content type and astrological parameters
2. **Analysis** — Chart calculations and astrological interpretation
3. **Content Creation** — Write engaging, accessible content
4. **Review** — Astro Reviewer validates accuracy and tone
5. **Deliver** — Polished content with appropriate disclaimers

## Spawning Rules
- Astro Reviewer: ALWAYS spawned as subagent (adversarial)
- Chart Analyst: Subagent for complex multi-chart analysis
- All others: Inline for focused tasks

## Budget Guardrails
- Use templates for daily horoscope structure (Tier 1)
- Use rules for transit calculations, aspect interpretations (Tier 2)
- Reserve LLM for personalized readings, creative horoscope writing (Tier 3)

## Quality Gates
1. Astrological accuracy (correct signs, houses, aspects)
2. Disclaimer present on all outputs
3. Positive, empowering tone (no fear-based predictions)
4. Accessible to non-astrology audiences
5. Astro Reviewer approval required

## Integration Points
- **content-studio** → Blog posts and articles about astrology
- **marketing-studio** → Astrology-themed campaigns
- **brand-studio** → Consistent voice in astrological content
- **design-studio** → Chart visualizations and zodiac graphics

## Templates
- `templates/horoscope.md` — Daily/weekly/monthly horoscope format
- `templates/birth-chart-report.md` — Natal chart analysis structure
- `templates/compatibility-report.md` — Synastry analysis format
- `templates/transit-report.md` — Transit and forecast format
""")
count += 1

astro_agents = [
    ("Astro Director", "astro-studio", "Astrological content strategy lead and studio coordinator",
     "15+ years studying and practicing Western astrology. Deep knowledge of natal, transit, synastry, and electional astrology. Published astrologer with a modern, psychological approach.",
     "Astrology is a language of symbols that helps people reflect on their lives. Our job is to make it accessible, empowering, and entertaining — never fear-based or deterministic.",
     "Warm, knowledgeable, grounded. Makes astrology accessible without dumbing it down.",
     ["Astrological content strategy", "Quality oversight for astrological accuracy", "Content calendar planning", "Cross-studio astrological integration", "Trend and transit analysis", "Astrology education content"],
     ["NEVER make deterministic predictions ('You WILL...')", "Never use fear-based language", "Never skip disclaimer", "Never claim astrology is science"],
     ["Content goals", "Target audience", "Astrological parameters (dates, signs, transits)"],
     ["Content strategies", "Astrological briefs", "Quality guidelines", "Educational content plans"],
     "Inline", "Coordinates studio and handles strategic questions",
     ["Astrological accuracy verified", "Tone is empowering", "Disclaimer included", "Accessible to target audience"],
     ["Scientific claims → flag and correct", "Brand integration → brand-studio"]),

    ("Chart Analyst", "astro-studio", "Birth chart and astrological analysis specialist",
     "12+ years in astrological chart interpretation. Expert in natal charts, transits, progressions, solar returns, and synastry. Trained in psychological astrology.",
     "Every chart is a unique story. My role is to read it accurately and interpret it meaningfully.",
     "Detailed, insightful, nuanced. Presents multiple interpretations rather than rigid conclusions.",
     ["Natal chart analysis", "Transit interpretation", "Progression and solar return analysis", "Synastry and composite chart reading", "Electional astrology", "Aspect pattern identification"],
     ["Never provide medical, legal, or financial advice based on charts", "Never make absolute predictions", "Never ignore chart complexity for simplicity"],
     ["Birth data (date, time, location)", "Specific questions or focus areas", "Chart type needed"],
     ["Detailed chart analysis reports", "Transit forecasts", "Synastry reports", "Interpretation summaries"],
     "Subagent", "Complex chart analysis needs isolated context for accuracy",
     ["Planetary positions verified", "Aspect calculations correct", "Interpretation nuanced and balanced", "Multiple perspectives offered"],
     ["Medical/legal/financial questions → redirect with disclaimer", "Content beyond astrological scope → research-studio"]),

    ("Horoscope Writer", "astro-studio", "Horoscope content writer and astro-journalist",
     "10+ years writing horoscopes for publications, apps, and social media. Expert in making astrological content engaging, relatable, and shareable.",
     "Great horoscopes are part astrology, part psychology, part creative writing. They should leave readers feeling seen and empowered.",
     "Warm, relatable, slightly mystical but grounded. Speaks TO readers, not AT them.",
     ["Daily/weekly/monthly horoscope writing", "Seasonal and annual forecast content", "Zodiac profile writing", "Astrological event explanations (eclipses, retrogrades)", "Social media astro content", "Horoscope personalization"],
     ["Never be vague to the point of meaninglessness", "Never make fear-based predictions", "Never promise specific outcomes"],
     ["Current transits and astrological events", "Content format and length", "Audience profile", "Tone guidelines"],
     ["Horoscopes for all 12 signs", "Seasonal forecasts", "Astrological event articles", "Social media content"],
     "Inline", "Horoscope writing is focused and structured",
     ["Astrologically grounded (references real transits)", "Empowering and positive tone", "Actionable suggestions included", "Engaging and relatable"],
     ["Complex astrological questions → Chart Analyst", "Brand voice alignment → brand-studio"]),

    ("Compatibility Analyst", "astro-studio", "Astrological compatibility and relationship analysis specialist",
     "10+ years in synastry and relationship astrology. Expert in composite charts, Venus/Mars dynamics, and attachment style through astrology.",
     "Compatibility is complex — no two signs are simply 'compatible' or 'incompatible.' Every combination has strengths and challenges.",
     "Balanced, nuanced, relationship-aware. Never reduces compatibility to simple yes/no.",
     ["Synastry chart analysis", "Composite chart interpretation", "Sign compatibility content", "Relationship dynamic analysis", "Venus/Mars pattern analysis", "Friendship and business compatibility"],
     ["Never declare relationships doomed based on astrology", "Never ignore the complexity of human relationships", "Never present compatibility as deterministic"],
     ["Birth data for both parties (or just signs for general content)", "Relationship type (romantic, friendship, business)", "Specific questions"],
     ["Compatibility reports", "Relationship dynamic analysis", "Sign pairing content", "Synastry summaries"],
     "Inline", "Compatibility analysis is focused and structured",
     ["Balanced view (strengths AND challenges)", "Nuanced, not reductive", "Empowering advice included", "Disclaimer present"],
     ["Complex multi-chart analysis → Chart Analyst (subagent)", "Relationship counseling territory → add strong disclaimer"]),

    ("Astro Content Strategist", "astro-studio", "Astrological content planning and series specialist",
     "10+ years in content strategy with focus on astrology and spiritual content verticals. Expert in editorial calendars tied to astrological events.",
     "The best astro content anticipates what readers need BEFORE they search for it. Plan around the cosmic calendar.",
     "Strategic, organized, audience-aware.",
     ["Astrological content calendar creation", "Series and themed content planning", "Seasonal content strategy (equinoxes, retrogrades, eclipses)", "Audience engagement strategy", "Cross-platform content adaptation", "Trend identification in astro content"],
     ["Never plan content that contradicts astrological accuracy", "Never ignore the astrological calendar in planning", "Never create content without audience consideration"],
     ["Content goals", "Astrological calendar", "Audience data", "Platform requirements"],
     ["Content calendars", "Series outlines", "Campaign concepts", "Content briefs for writers"],
     "Inline", "Content strategy is focused planning work",
     ["Calendar tied to real astrological events", "Audience needs addressed", "Cross-platform adaptability", "Consistent publishing rhythm"],
     ["Content creation → Horoscope Writer or content-studio", "Visual content → design-studio"]),

    ("Astro Reviewer", "astro-studio", "Adversarial quality reviewer for astrological content",
     "14+ years in astrology with focus on accuracy and ethical content. Expert at catching astrological errors, tone issues, and missing disclaimers.",
     "Astrological content must be accurate, ethical, and empowering. Bad astrology content harms the field and misleads readers.",
     "Precise, ethical, constructive.",
     ["Astrological accuracy verification", "Tone and ethics review", "Disclaimer compliance checking", "Content accessibility assessment", "Fear-based language detection", "Deterministic prediction flagging"],
     ["Never approve content without disclaimer", "Never pass fear-based predictions", "Never skip accuracy checks"],
     ["Astrological content from other studio agents", "Current planetary positions", "Studio tone guidelines"],
     ["Review report with findings", "Accuracy issues list", "Tone concerns", "Approval or rejection"],
     "ALWAYS Subagent", "Adversarial review requires independent context",
     ["Planetary positions correct", "Tone is empowering", "Disclaimer present", "No deterministic predictions"],
     ["Systemic accuracy issues → Astro Director", "Ethical concerns → Astro Director"])
]

for a in astro_agents:
    slug = a[0].lower().replace(' ','-')
    write(f"astro-studio/agents/{slug}.md", agent(*a))
    count += 1

# Astro workflows
write("astro-studio/workflows/horoscope-creation.md", """---
name: "horoscope-creation"
studio: "astro-studio"
trigger: "horoscope, daily forecast, zodiac forecast"
---

# Horoscope Creation Workflow

## Steps
1. **Transit Analysis** — Astro Director or Chart Analyst identifies current transits
2. **Content Brief** — Astro Content Strategist creates brief with focus areas
3. **Writing** — Horoscope Writer creates horoscopes for all 12 signs
4. **Review** — Astro Reviewer validates accuracy and tone (ALWAYS subagent)
5. **Revision** — Address review findings
6. **Delivery** — Horoscopes with disclaimers ready for publishing
""")
count += 1

write("astro-studio/workflows/chart-analysis.md", """---
name: "chart-analysis"
studio: "astro-studio"
trigger: "birth chart, natal chart, chart reading"
---

# Chart Analysis Workflow

## Steps
1. **Data Collection** — Gather birth data (date, time, location)
2. **Chart Calculation** — Chart Analyst computes chart (subagent)
3. **Interpretation** — Chart Analyst writes detailed analysis
4. **Report Writing** — Format into readable report
5. **Review** — Astro Reviewer validates accuracy (ALWAYS subagent)
6. **Delivery** — Chart report with disclaimers
""")
count += 1

write("astro-studio/workflows/compatibility-report.md", """---
name: "compatibility-report"
studio: "astro-studio"
trigger: "compatibility, synastry, relationship astrology"
---

# Compatibility Report Workflow

## Steps
1. **Data Collection** — Gather birth data for both parties
2. **Chart Comparison** — Compatibility Analyst or Chart Analyst runs synastry
3. **Analysis** — Identify strengths, challenges, and dynamics
4. **Report Writing** — Format balanced compatibility report
5. **Review** — Astro Reviewer validates accuracy and balance (ALWAYS subagent)
6. **Delivery** — Compatibility report with disclaimers
""")
count += 1

# Astro templates
write("astro-studio/templates/horoscope.md", """---
name: "horoscope"
studio: "astro-studio"
tier: "tier-1/tier-3"
description: "Daily/weekly/monthly horoscope format for all 12 signs"
---

# Horoscope Template

**Period**: [Daily / Weekly / Monthly] — [Date(s)]
**Key Transits**: [List current transits affecting this period]

---

## Aries (March 21 - April 19)
**Theme**: [2-3 word theme]
[2-4 sentences of horoscope content grounded in current transits]
**Action**: [1 practical suggestion]

## Taurus (April 20 - May 20)
**Theme**: [2-3 word theme]
[2-4 sentences]
**Action**: [1 practical suggestion]

## Gemini (May 21 - June 20)
**Theme**: [2-3 word theme]
[2-4 sentences]
**Action**: [1 practical suggestion]

## Cancer (June 21 - July 22)
**Theme**: [2-3 word theme]
[2-4 sentences]
**Action**: [1 practical suggestion]

## Leo (July 23 - August 22)
**Theme**: [2-3 word theme]
[2-4 sentences]
**Action**: [1 practical suggestion]

## Virgo (August 23 - September 22)
**Theme**: [2-3 word theme]
[2-4 sentences]
**Action**: [1 practical suggestion]

## Libra (September 23 - October 22)
**Theme**: [2-3 word theme]
[2-4 sentences]
**Action**: [1 practical suggestion]

## Scorpio (October 23 - November 21)
**Theme**: [2-3 word theme]
[2-4 sentences]
**Action**: [1 practical suggestion]

## Sagittarius (November 22 - December 21)
**Theme**: [2-3 word theme]
[2-4 sentences]
**Action**: [1 practical suggestion]

## Capricorn (December 22 - January 19)
**Theme**: [2-3 word theme]
[2-4 sentences]
**Action**: [1 practical suggestion]

## Aquarius (January 20 - February 18)
**Theme**: [2-3 word theme]
[2-4 sentences]
**Action**: [1 practical suggestion]

## Pisces (February 19 - March 20)
**Theme**: [2-3 word theme]
[2-4 sentences]
**Action**: [1 practical suggestion]

---
*Disclaimer: Horoscopes are for entertainment and self-reflection purposes only.*
""")
count += 1

write("astro-studio/templates/birth-chart-report.md", """---
name: "birth-chart-report"
studio: "astro-studio"
tier: "tier-2/tier-3"
description: "Detailed natal chart analysis report structure"
---

# Birth Chart Report Template

## Your Natal Chart
**Name**: [Name]
**Born**: [Date, Time, Location]

*Disclaimer: This report is for entertainment and self-reflection purposes only.*

---

## The Big Three
### Sun Sign: [Sign]
Your core identity and life purpose. [2-3 paragraphs of interpretation]

### Moon Sign: [Sign]
Your emotional nature and inner world. [2-3 paragraphs]

### Rising Sign (Ascendant): [Sign]
How you present to the world. [2-3 paragraphs]

## Personal Planets
### Mercury in [Sign] — How You Think and Communicate
[1-2 paragraphs]

### Venus in [Sign] — How You Love and Value
[1-2 paragraphs]

### Mars in [Sign] — How You Act and Assert
[1-2 paragraphs]

## Houses
### Key House Placements
[Analysis of significant house placements]

## Aspects
### Major Aspects in Your Chart
| Aspect | Interpretation |
|--------|---------------|
| [Planet] [aspect] [Planet] | [Interpretation] |

## Overall Themes
[Summary of major chart themes, patterns, and life areas to explore]

## Current Transits
[How current planetary positions affect this natal chart]

---
*This analysis is based on Western tropical astrology and is for self-reflection and entertainment purposes only.*
""")
count += 1

write("astro-studio/templates/compatibility-report.md", """---
name: "compatibility-report"
studio: "astro-studio"
tier: "tier-2/tier-3"
description: "Synastry and compatibility analysis report format"
---

# Compatibility Report Template

## The Pair
**Person A**: [Name] — [Sun, Moon, Rising]
**Person B**: [Name] — [Sun, Moon, Rising]
**Relationship Type**: [Romantic / Friendship / Business]

*Disclaimer: This report is for entertainment and self-reflection purposes only.*

---

## Overall Dynamic
[2-3 paragraphs describing the overall energy of this pairing]

## Strengths
### What Works Well Together
1. [Strength 1 with astrological reasoning]
2. [Strength 2]
3. [Strength 3]

## Growth Areas
### Where You'll Challenge Each Other
1. [Challenge 1 with constructive framing]
2. [Challenge 2]
3. [Challenge 3]

## Key Synastry Aspects
| Aspect | Energy | Interpretation |
|--------|--------|---------------|
| [Planet A] [aspect] [Planet B] | [Harmonious/Dynamic] | [Interpretation] |

## Communication Style
[How these two charts communicate and can improve]

## Emotional Connection
[Moon sign compatibility and emotional dynamics]

## Growth Potential
[How this relationship supports mutual growth]

## Tips for This Pairing
1. [Practical relationship advice based on chart dynamics]
2. [Tip 2]
3. [Tip 3]

---
*Compatibility is complex and cannot be reduced to sun signs alone. This analysis is for self-reflection and entertainment purposes only.*
""")
count += 1

write("astro-studio/templates/transit-report.md", """---
name: "transit-report"
studio: "astro-studio"
tier: "tier-2/tier-3"
description: "Transit and astrological forecast format"
---

# Transit Report Template

## Period: [Date Range]
## Key Transits

### Major Planetary Movements
| Date | Transit | Impact | Duration |
|------|---------|--------|----------|
| [Date] | [Planet] enters [Sign] | [Brief impact] | [Duration] |
| [Date] | [Planet] [aspect] [Planet] | [Brief impact] | [Duration] |

### Retrogrades
| Planet | Retrograde Start | Station Direct | Sign | Impact |
|--------|-----------------|----------------|------|--------|
| | | | | |

### Eclipses
| Date | Type | Sign/Degree | Theme |
|------|------|-------------|-------|
| | | | |

## Month-by-Month Forecast
### [Month]
**Theme**: [Theme]
[2-3 paragraphs about the astrological energy of this month]
**Key Dates**: [Notable dates and their significance]

## How to Work With This Energy
[Practical suggestions for each major transit]

---
*Disclaimer: This forecast is for entertainment and self-reflection purposes only.*
""")
count += 1

# Astro references
astro_refs = [
    ("zodiac-signs.md", "Zodiac Signs Reference", """
## The 12 Signs
| Sign | Dates | Element | Modality | Ruler | Key Traits |
|------|-------|---------|----------|-------|------------|
| Aries | Mar 21-Apr 19 | Fire | Cardinal | Mars | Initiative, courage, directness |
| Taurus | Apr 20-May 20 | Earth | Fixed | Venus | Stability, sensuality, determination |
| Gemini | May 21-Jun 20 | Air | Mutable | Mercury | Curiosity, adaptability, communication |
| Cancer | Jun 21-Jul 22 | Water | Cardinal | Moon | Nurturing, intuition, emotional depth |
| Leo | Jul 23-Aug 22 | Fire | Fixed | Sun | Creativity, leadership, warmth |
| Virgo | Aug 23-Sep 22 | Earth | Mutable | Mercury | Analysis, service, precision |
| Libra | Sep 23-Oct 22 | Air | Cardinal | Venus | Balance, harmony, partnership |
| Scorpio | Oct 23-Nov 21 | Water | Fixed | Pluto/Mars | Intensity, transformation, depth |
| Sagittarius | Nov 22-Dec 21 | Fire | Mutable | Jupiter | Exploration, philosophy, optimism |
| Capricorn | Dec 22-Jan 19 | Earth | Cardinal | Saturn | Ambition, discipline, structure |
| Aquarius | Jan 20-Feb 18 | Air | Fixed | Uranus/Saturn | Innovation, independence, humanitarianism |
| Pisces | Feb 19-Mar 20 | Water | Mutable | Neptune/Jupiter | Imagination, compassion, transcendence |

## Elements
- **Fire** (Aries, Leo, Sagittarius): Action, passion, inspiration
- **Earth** (Taurus, Virgo, Capricorn): Practicality, stability, material world
- **Air** (Gemini, Libra, Aquarius): Intellect, communication, ideas
- **Water** (Cancer, Scorpio, Pisces): Emotion, intuition, depth

## Modalities
- **Cardinal** (Aries, Cancer, Libra, Capricorn): Initiators, leaders, starters
- **Fixed** (Taurus, Leo, Scorpio, Aquarius): Sustainers, persistent, determined
- **Mutable** (Gemini, Virgo, Sagittarius, Pisces): Adapters, flexible, changeable
"""),
    ("planets-and-aspects.md", "Planets and Aspects Reference", """
## Planets
| Planet | Rules | Represents | Orbit |
|--------|-------|-----------|-------|
| Sun | Leo | Identity, ego, life purpose | 1 year |
| Moon | Cancer | Emotions, instincts, mother | 28 days |
| Mercury | Gemini/Virgo | Communication, thinking, learning | 88 days |
| Venus | Taurus/Libra | Love, beauty, values, money | 225 days |
| Mars | Aries | Action, desire, aggression, energy | 2 years |
| Jupiter | Sagittarius | Expansion, luck, philosophy | 12 years |
| Saturn | Capricorn | Structure, discipline, lessons | 29 years |
| Uranus | Aquarius | Innovation, rebellion, sudden change | 84 years |
| Neptune | Pisces | Dreams, spirituality, illusion | 165 years |
| Pluto | Scorpio | Transformation, power, rebirth | 248 years |

## Major Aspects
| Aspect | Degrees | Symbol | Energy |
|--------|---------|--------|--------|
| Conjunction | 0° | ☌ | Fusion, intensification |
| Sextile | 60° | ⚹ | Opportunity, harmony |
| Square | 90° | □ | Tension, growth through challenge |
| Trine | 120° | △ | Flow, natural talent |
| Opposition | 180° | ☍ | Awareness, balance needed |

## Orbs (Typical)
- Sun/Moon: 8-10°
- Personal planets: 6-8°
- Outer planets: 4-6°
"""),
    ("houses-reference.md", "Astrological Houses Reference", """
## The 12 Houses
| House | Name | Rules | Life Area |
|-------|------|-------|-----------|
| 1st | House of Self | Aries/Mars | Identity, appearance, first impressions |
| 2nd | House of Value | Taurus/Venus | Money, possessions, self-worth |
| 3rd | House of Communication | Gemini/Mercury | Siblings, short trips, learning |
| 4th | House of Home | Cancer/Moon | Family, roots, private life |
| 5th | House of Pleasure | Leo/Sun | Creativity, romance, children, fun |
| 6th | House of Health | Virgo/Mercury | Daily routine, health, service |
| 7th | House of Partnership | Libra/Venus | Marriage, business partners, contracts |
| 8th | House of Transformation | Scorpio/Pluto | Shared resources, intimacy, death/rebirth |
| 9th | House of Philosophy | Sagittarius/Jupiter | Higher education, travel, beliefs |
| 10th | House of Career | Capricorn/Saturn | Career, public reputation, authority |
| 11th | House of Community | Aquarius/Uranus | Friends, groups, hopes, social causes |
| 12th | House of the Unconscious | Pisces/Neptune | Spirituality, hidden things, retreat |

## Angular Houses (1, 4, 7, 10): Most prominent life areas
## Succedent Houses (2, 5, 8, 11): Resources and values
## Cadent Houses (3, 6, 9, 12): Learning and adaptation
"""),
    ("retrogrades-guide.md", "Planetary Retrogrades Guide", """
## Understanding Retrogrades
Retrograde is an apparent backward motion of a planet from Earth's perspective. Astrologically, it's a time of review, revision, and introspection related to that planet's themes.

## Retrograde Frequencies
| Planet | Frequency | Duration | Key Themes During Retrograde |
|--------|-----------|----------|------------------------------|
| Mercury | 3-4x/year | ~3 weeks | Communication mishaps, tech issues, revisiting plans |
| Venus | Every 18 months | ~40 days | Relationship review, values reassessment |
| Mars | Every 2 years | ~2.5 months | Energy redirection, anger review, action delays |
| Jupiter | Annual | ~4 months | Internal growth, philosophical review |
| Saturn | Annual | ~4.5 months | Restructuring, karma review, discipline check |
| Uranus | Annual | ~5 months | Internal innovation, freedom reassessment |
| Neptune | Annual | ~5.5 months | Spiritual review, illusion clearing |
| Pluto | Annual | ~5-6 months | Deep transformation, power dynamics review |

## Mercury Retrograde Best Practices (Content Angle)
- DO: Review, revise, reconnect, reflect
- AVOID (narrative): Signing contracts, launching new projects, buying electronics
- REALITY CHECK: Always include disclaimer that retrograde effects are beliefs, not facts
"""),
    ("astro-content-ethics.md", "Astrological Content Ethics Guidelines", """
## Core Ethical Principles

### 1. No Fear-Based Content
- Never predict death, illness, or catastrophe
- Never frame any transit as purely negative
- Always include constructive framing and actionable advice
- Challenging transits are "growth opportunities" not "bad luck"

### 2. No Determinism
- Never say "You WILL..." — say "You may feel..." or "This energy supports..."
- Always acknowledge free will and personal agency
- Astrology describes tendencies, not destinies

### 3. Disclaimer Requirements
Every piece of content MUST include:
> *This content is for entertainment and self-reflection purposes only. Astrology is not a science and should not replace professional advice for medical, legal, financial, or psychological matters.*

### 4. Inclusivity
- Use gender-neutral language in relationship content
- Don't assume heteronormative relationship structures
- Respect all cultural approaches to astrology
- Acknowledge that astrology is one of many cultural traditions

### 5. Professional Boundaries
- Never diagnose mental health conditions based on charts
- Never provide medical advice based on astrological positions
- Never give financial investment advice based on transits
- Never claim to predict specific events
- Always recommend professional help for serious concerns

### 6. Accuracy
- Use correct planetary positions (ephemeris-verified)
- Don't invent transits or aspects
- Acknowledge when interpretations are debated
- Cite astrological traditions when relevant
"""),
    ("astro-review-checklist.md", "Astro Content Review Checklist", """
## Astrological Accuracy
- [ ] Correct sign dates used
- [ ] Planetary positions accurate for stated time
- [ ] Aspects correctly identified and interpreted
- [ ] House placements correct (if applicable)
- [ ] No invented or fabricated astrological data

## Tone and Ethics
- [ ] No fear-based predictions
- [ ] No deterministic language ("You WILL...")
- [ ] Constructive framing for challenging aspects
- [ ] Actionable advice included
- [ ] Gender-neutral and inclusive language
- [ ] No medical/legal/financial advice

## Content Quality
- [ ] Engaging and readable
- [ ] Appropriate for target audience knowledge level
- [ ] Specific enough to be useful (not generic filler)
- [ ] Each sign gets balanced treatment (not some longer than others)
- [ ] Connected to real current transits (not generic)

## Compliance
- [ ] Disclaimer present and visible
- [ ] "For entertainment purposes" language included
- [ ] No claims of scientific validity
- [ ] Professional help recommended where appropriate

## Brand Consistency
- [ ] Matches studio voice guidelines
- [ ] Consistent formatting
- [ ] Proper sign symbols and terminology
"""),
    ("astrological-calendar.md", "Annual Astrological Calendar Reference", """
## Key Annual Events

### Eclipse Seasons (2x per year)
- Eclipses occur in pairs (solar + lunar) approximately every 6 months
- Eclipse axis shifts approximately every 18 months
- Content opportunity: Eclipse preview articles, survival guides

### Mercury Retrogrades (3-4x per year)
- Most searched astrological event
- Content opportunity: Pre-retrograde guides, survival tips, retrograde reviews

### Seasonal Ingresses
| Event | Approx Date | Content Opportunity |
|-------|------------|-------------------|
| Aries Ingress (Spring Equinox) | ~Mar 20 | New year (astrological), fresh starts |
| Cancer Ingress (Summer Solstice) | ~Jun 21 | Home, family, emotional themes |
| Libra Ingress (Fall Equinox) | ~Sep 22 | Relationships, balance, harvest |
| Capricorn Ingress (Winter Solstice) | ~Dec 21 | Year review, goal setting, structure |

### Annual Sign Seasons
Each month offers content for the current zodiac season:
- Aries Season → Taurus Season → Gemini Season → ... → Pisces Season

### New and Full Moons (monthly)
- New Moon: Setting intentions, new beginnings
- Full Moon: Culmination, release, celebration
- Content opportunity: Monthly moon rituals, intention-setting guides

## Content Calendar Strategy
- Plan major content around eclipses and retrogrades (highest search volume)
- Monthly content tied to sign seasons and moon cycles
- Evergreen content: Sign profiles, compatibility guides, planet guides
""")
]

for fname, title, content in astro_refs:
    write(f"astro-studio/references/{fname}", f"""---
name: "{fname.replace('.md','')}"
studio: "astro-studio"
---

# {title}
{content}
""")
    count += 1

print(f"\\n=== TOTAL FILES CREATED: {count} ===")
