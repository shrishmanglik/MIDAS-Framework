# Skill-authoring gate checklist

Deterministic gates distilled from midas-writing-skills. Check against the
skill directory and its evidence record.

- [ ] The skill's originating failure mode is recorded with at least one real occurrence
- [ ] A RED baseline transcript (scenario run without the skill) exists and is kept with the skill's evidence
- [ ] The description states capability plus a "Use when" trigger and does not narrate the process
- [ ] The description carries a negative-scope clause ("Not for ...")
- [ ] Frontmatter declares name matching the directory, license, and only needed allowed-tools
- [ ] The body follows the house sections: Purpose, Process, Red Flags, Guardrails, Stop Conditions, Claim Ceiling
- [ ] Every Red Flags row pairs a recorded rationalization with a counter-rule
- [ ] The body is under 500 lines, with detail beyond ~300 lines moved to references/
- [ ] A paired checklist.md exists with 3-40 non-empty checkbox items, each a checkable fact
- [ ] A GREEN transcript shows the skill closing every loophole recorded in the RED baseline
- [ ] Skill-library validation passes on the library with the skill in place
