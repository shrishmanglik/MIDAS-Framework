# Knowledge Taxonomy

12 domain tags for classifying accumulated learnings.

## Tags

### ARCH — Architecture
System design decisions, API patterns, technology selection, component relationships.
**Write when:** Making or discovering architectural patterns, evaluating tech choices.
**Studios:** dev-studio, design-studio, devops-studio

### ORCH — Orchestration
Agent coordination, workflow sequencing, handoff effectiveness, parallelization strategies.
**Write when:** Discovering better coordination patterns, handoff improvements.
**Studios:** midas-framework (all studios benefit)

### PROM — Prompt Engineering
Prompt patterns, model behavior observations, output quality techniques.
**Write when:** Finding effective prompt patterns, model-specific behaviors.
**Studios:** All studios (universal skill)

### QUAL — Quality & Testing
Test patterns, review findings, quality metrics, validation approaches.
**Write when:** Test discoveries, review insights, quality improvements.
**Studios:** dev-studio, security-studio, qa agents in all studios

### COST — Cost Optimization
Model routing discoveries, caching wins, budget management insights.
**Write when:** Finding cheaper approaches, optimizing model usage.
**Studios:** midas-framework, all studios

### DPLY — Deployment
Docker patterns, CI/CD discoveries, infrastructure insights, monitoring wisdom.
**Write when:** Deployment issues, infrastructure optimizations, monitoring insights.
**Studios:** devops-studio, dev-studio

### PROD — Product Strategy
Requirements insights, user needs discoveries, feature prioritization learnings.
**Write when:** Requirement ambiguities resolved, user feedback incorporated.
**Studios:** research-studio, sales-studio, client-success-studio

### DSGN — Design & UX
UI patterns, accessibility discoveries, design system learnings, responsive insights.
**Write when:** Design decisions, accessibility fixes, responsive solutions.
**Studios:** design-studio, dev-studio (frontend)

### DATA — Data & Database
Schema design patterns, query optimization, data modeling, migration strategies.
**Write when:** Schema decisions, performance discoveries, migration insights.
**Studios:** data-studio, dev-studio, finance-studio

### FAIL — Failure Patterns
**HIGHEST PRIORITY.** What went wrong and why. Root cause analysis.
**Write when:** ALWAYS after any failure. Never skip for budget reasons.
**Studios:** All studios
**Special rule:** FAIL entries are mandatory. Budget for them upfront.

### FLOW — Workflow
Process improvements, pipeline optimizations, efficiency discoveries.
**Write when:** Workflow bottlenecks identified, process improvements found.
**Studios:** All studios

### SCALE — Scaling
Performance patterns, growth handling, resource management, capacity planning.
**Write when:** Scaling challenges encountered, performance optimizations found.
**Studios:** devops-studio, dev-studio, data-studio

## Aggregation Protocol

1. New entries → `_shared/knowledge/[TAG]/[TAG]-[NNN].md`
2. Entries accumulate per session
3. At 50 entries per tag → consolidate into summary document
4. FAIL entries are never consolidated (each failure is unique)
5. Cross-reference: if entry relates to 2+ tags, primary tag gets the file, secondary tags get a reference pointer
6. Before any task, agents check FAIL entries first, then domain-relevant tags
