# Quality Standards — 9-Gate Specification

Every artifact produced by MIDAS passes through applicable quality gates.

## Gate 1: Schema Compliance
**Applies to:** All structured outputs (JSON, YAML, code files)
**Check:** Output matches the declared schema exactly
**Pass:** All required fields present, types correct, no extra fields
**Fail action:** Return to generating agent with schema violation list

## Gate 2: Completeness
**Applies to:** All outputs
**Check:** All required sections/fields are populated with meaningful content
**Pass:** No empty sections, no placeholder text, no TODO markers
**Fail action:** Return to generating agent with list of missing elements

## Gate 3: Consistency
**Applies to:** All outputs, especially cross-agent outputs
**Check:** No contradictions within the artifact or with related artifacts
**Pass:** Names match across files, types align, references resolve
**Fail action:** Flag specific contradictions, return to orchestrator for resolution

## Gate 4: Security
**Applies to:** All code, configuration, and deployment artifacts
**Checks:**
- No hardcoded secrets, API keys, or credentials
- No SQL injection vectors (parameterized queries only)
- No XSS vectors (output encoding applied)
- No command injection (input sanitization applied)
- No insecure dependencies (known CVEs)
- Authentication/authorization properly implemented
- CORS configured appropriately
**Pass:** Zero CRITICAL or HIGH security findings
**Fail action:** HALT deployment. Return to dev agent with mandatory fixes.

## Gate 5: Budget
**Applies to:** Every phase transition
**Check:** Phase cost within allocated budget
**Pass:** actual_cost ≤ estimated_cost × 1.5
**Warning:** actual_cost > estimated_cost (log and continue)
**Fail action:** HALT, report to department head

## Gate 6: Brand Voice
**Applies to:** All user-facing content (copy, UI text, documentation)
**Checks:**
- Tone matches brand-studio guidelines
- No prohibited phrases or words
- Consistent terminology with shared glossary
- Appropriate formality level for audience
**Pass:** Voice compliance score ≥ 85%
**Fail action:** Return to content agent with specific violations

## Gate 7: Accessibility
**Applies to:** All UI outputs (components, pages, design specs)
**Checks:**
- Color contrast ratio ≥ 4.5:1 (AA) for normal text
- Color contrast ratio ≥ 3:1 (AA) for large text
- All images have alt text
- Keyboard navigation works for all interactive elements
- ARIA labels present where needed
- Focus indicators visible
**Pass:** Zero WCAG 2.1 AA violations
**Fail action:** Return to design/frontend agent with violation list

## Gate 8: Test Coverage
**Applies to:** All code artifacts
**Checks:**
- Unit tests exist for all public functions
- Integration tests exist for all API endpoints
- Edge cases covered (empty input, max input, invalid input)
- Error paths tested
- Auth/permission tests present
**Pass:** Coverage > 80% lines, 100% critical paths
**Fail action:** Return to QA agent with coverage gaps

## Gate 9: Knowledge Capture
**Applies to:** End of every substantial task
**Checks:**
- At least one learning captured per substantial task
- Learning follows knowledge-entry-schema
- Appropriate taxonomy tag applied
- Failure patterns ALWAYS captured (never skipped)
**Pass:** Learning entry written to _shared/knowledge/
**Fail action:** Force knowledge extraction before marking task complete

## Gate Application Matrix

| Output Type | Gates Applied |
|------------|---------------|
| Architecture spec | 1, 2, 3, 5, 9 |
| Backend code | 1, 2, 3, 4, 5, 8, 9 |
| Frontend code | 1, 2, 3, 4, 5, 7, 8, 9 |
| API spec | 1, 2, 3, 4, 5, 9 |
| Content/copy | 2, 3, 5, 6, 9 |
| Design spec | 1, 2, 3, 5, 7, 9 |
| Deployment config | 1, 2, 4, 5, 9 |
| Database schema | 1, 2, 3, 4, 5, 9 |
| Test suite | 1, 2, 5, 9 |
| Research report | 2, 3, 5, 9 |
