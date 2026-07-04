# Chem Studio -- The Education Engine

> "The important thing in science is not so much to obtain new facts as to discover new ways of thinking about them." -- William Lawrence Bragg

Chemistry education content generation engine supporting multiple international curricula (CBSE, ICSE, IB, Ontario). Produces curriculum-aligned questions, study materials, exam papers, and concept explanations calibrated to student grade level, cognitive complexity (Bloom's taxonomy), and exam format requirements.

---

## Activation Triggers

- User requests chemistry question generation for a specific curriculum/grade
- User needs a complete exam paper with marking scheme
- User requests study material or concept explanation for a chemistry topic
- User needs curriculum alignment mapping across boards
- System needs to populate a chemistry question bank
- User asks about common chemistry misconceptions for a topic

---

## Methodology

### Phase 1: INPUT -- Curriculum Map
- Identify target curriculum (CBSE, ICSE, IB, Ontario)
- Identify grade level (9-12 / SL-HL)
- Identify topic and subtopic from curriculum reference
- Determine content type: questions, study material, exam paper, concept explanation
- Determine difficulty level (1-5) and Bloom's taxonomy level

### Phase 2: GENERATE -- Content Creation
- Map topic to curriculum-specific learning objectives
- Generate content aligned to the requested type and level
- Apply question schema for structured question output
- Cross-reference misconception database for targeted distractors (MCQ)
- Include worked examples with step-by-step solutions

### Phase 3: VALIDATE -- Quality Check
- Verify scientific accuracy of all content
- Confirm curriculum alignment (topic is taught at the stated grade/level)
- Check Bloom's taxonomy alignment (question complexity matches stated level)
- Validate numerical answers with unit analysis and significant figures
- Review mark allocation for proportionality

### Phase 4: FORMAT -- Output Structuring
- Structure output according to the target format (JSON question bank, formatted exam paper, study notes)
- Apply curriculum-specific formatting conventions (CBSE section structure, IB rubric language)
- Include answer keys, marking schemes, and examiner notes where applicable

### Phase 5: GATE -- Distribution Quality Gate
- Final review against quality checklist
- Verify no copyrighted exam content is reproduced
- Confirm all chemical equations are balanced
- Validate IUPAC nomenclature usage
- Check that diagrams/visual cues are described adequately for rendering

---

## Team Roster

| Agent | Role | Input | Output |
|-------|------|-------|--------|
| `curriculum-mapper` | Curriculum Alignment Specialist | topic + curriculum IDs | alignment matrix |
| `question-generator` | Chemistry Question Engineer | topic + level + type | structured question JSON |
| `study-material-writer` | Study Content Author | topic + grade + curriculum | formatted study notes |
| `exam-paper-architect` | Exam Paper Designer | curriculum + topics + constraints | complete exam paper + marking scheme |

---

## Quality Gates

| Gate | Check | Pass Criteria |
|------|-------|---------------|
| G1: Scientific Accuracy | All facts, equations, data | Zero factual errors; all equations balanced |
| G2: Curriculum Alignment | Topic coverage | Topic appears in stated curriculum at stated grade |
| G3: Bloom's Alignment | Cognitive complexity | Question complexity matches stated Bloom's level |
| G4: Numerical Accuracy | Calculations and units | All numerical answers correct with proper units and sig figs |
| G5: Marking Fairness | Mark allocation | Marks proportional to cognitive demand and time required |
| G6: Misconception Targeting | Distractor quality (MCQ) | At least 1 distractor based on documented misconception |
| G7: Originality | Content uniqueness | No reproduction of copyrighted past exam questions |
| G8: IUPAC Compliance | Nomenclature | All chemical names follow current IUPAC conventions |

---

## References Available

| Reference | Contents | Used By |
|-----------|----------|---------|
| `cbse-curriculum.md` | CBSE Class 11-12 Chemistry syllabus with topics and subtopics | All agents |
| `icse-curriculum.md` | ISC Class 11-12 Chemistry syllabus | All agents |
| `ib-curriculum.md` | IB Chemistry SL and HL topics | All agents |
| `ontario-curriculum.md` | Ontario SCH3U and SCH4U curriculum | All agents |
| `question-schema.md` | JSON schema for structured question objects | question-generator |
| `misconception-database.md` | Common chemistry misconceptions with corrections | question-generator, study-material-writer |

---

## Integration Points

| System | Direction | Data |
|--------|-----------|------|
| Question Bank Database | Output | Structured questions in JSON format |
| Exam Paper Renderer | Output | Formatted exam paper content |
| Student Analytics Engine | Input | Student performance data for adaptive question selection |
| LMS (Learning Management System) | Bidirectional | Content import/export in standard formats |
| Diagram Renderer | Output | Chemical structure descriptions for SVG generation |

---

## Anti-Patterns

| Anti-Pattern | Why It Fails | Correct Approach |
|-------------|-------------|-----------------|
| Using same difficulty for all Bloom's levels | Remember and Create require different complexity | Scale difficulty with Bloom's level explicitly |
| Generating MCQ distractors randomly | Students see through implausible distractors | Base at least one distractor on a documented misconception |
| Ignoring significant figures | Chemistry answers depend on sig fig conventions | Always state sig fig expectations and follow them |
| Mixing curricula without mapping | CBSE "Chemical Kinetics" differs from IB "Kinetics" in scope | Always map to specific curriculum subtopics before generating |
| Reproducing past exam questions | Copyright infringement, reduces exam validity | Generate original questions inspired by learning objectives |
| Assigning marks without rationale | Arbitrary marks confuse students and teachers | Follow mark-per-skill-point model (1 mark per recall, 2 per application, 3 per analysis) |
