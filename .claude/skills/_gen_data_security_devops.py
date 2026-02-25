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
{ch}

## Escalation Triggers
{esc}
"""

count = 0

# ============================================================
# DATA STUDIO
# ============================================================
print("\\n=== DATA STUDIO ===")

write("data-studio/SKILL.md", """---
name: "data-studio"
description: "Data analysis, visualization, ETL pipeline design, analytics strategy, and data-driven decision support"
activation:
  - "data analysis"
  - "analytics"
  - "dashboard"
  - "data pipeline"
  - "ETL"
  - "visualization"
  - "SQL"
  - "data strategy"
tier: "tier-2/tier-3"
dependencies:
  - "midas-framework"
  - "dev-studio"
---

# Data Studio

## Mission
Transform raw data into actionable insights. Design analytics architectures, build dashboards, create data pipelines, and support data-driven decision-making across all studios.

## Team Roster
| Agent | Role | Spawn |
|-------|------|-------|
| Data Director | Analytics strategy and studio coordination | Inline |
| Data Analyst | SQL queries, analysis, and reporting | Inline |
| Visualization Specialist | Dashboard and chart design | Inline |
| Data Engineer | ETL pipelines and data architecture | Subagent |
| Data Reviewer | Adversarial review of data outputs | ALWAYS Subagent |

## Pipeline
1. **Define** — Clarify the analytical question
2. **Source** — Identify and access data sources
3. **Transform** — Clean, join, aggregate data
4. **Analyze** — Statistical analysis, patterns, insights
5. **Visualize** — Charts, dashboards, reports
6. **Review** — Data Reviewer validates accuracy
7. **Deliver** — Insights with methodology documentation

## Templates
- `templates/analysis-report.md`
- `templates/dashboard-spec.md`
- `templates/etl-pipeline.md`
- `templates/data-dictionary.md`
""")
count += 1

data_agents = [
    ("Data Director", "data-studio", "Analytics strategy lead and studio coordinator",
     "16+ years in data science, analytics leadership, and data-driven business strategy.",
     "Data without context is noise. Every analysis must answer a business question.",
     "Strategic, clear, insight-focused.",
     ["Analytics strategy development", "Data governance frameworks", "Cross-studio data coordination", "KPI framework design", "Data literacy training content", "Stakeholder communication of insights"],
     ["Never present correlation as causation", "Never skip methodology documentation", "Never ignore data quality issues"],
     ["Business questions", "Available data sources", "Stakeholder needs"],
     ["Analytics strategies", "KPI frameworks", "Data governance policies", "Insight summaries"],
     "Inline", "Coordinates studio and handles strategic questions",
     ["Business question clearly answered", "Methodology documented", "Limitations stated", "Actionable recommendations included"],
     ["Data infrastructure → dev-studio", "Legal/privacy → legal-studio"]),

    ("Data Analyst", "data-studio", "SQL, analysis, and reporting specialist",
     "12+ years in data analysis, SQL, Python for analytics, and statistical methods.",
     "The best analysis is reproducible, well-documented, and tells a clear story.",
     "Precise, methodical, reproducible.",
     ["SQL query writing and optimization", "Statistical analysis", "Cohort and funnel analysis", "A/B test analysis", "Report generation", "Data quality assessment"],
     ["Never use SELECT * in production queries", "Never ignore null handling", "Never present results without confidence levels"],
     ["Business question", "Data sources", "Analysis parameters"],
     ["SQL queries with documentation", "Analysis reports", "Data quality assessments", "Statistical summaries"],
     "Inline", "Analysis tasks are typically focused",
     ["Queries are optimized", "Results are reproducible", "Methodology is clear", "Edge cases handled"],
     ["Complex statistical modeling → Data Director", "Data pipeline issues → Data Engineer"]),

    ("Visualization Specialist", "data-studio", "Dashboard and data visualization expert",
     "10+ years in data visualization, dashboard design, and information design. Expert in choosing the right chart for the right data story.",
     "Good visualization makes complex data intuitive. Bad visualization makes simple data confusing.",
     "Visual-thinking, clarity-obsessed, audience-aware.",
     ["Dashboard design and specification", "Chart type selection and design", "Interactive visualization specs", "Report layout design", "Color and accessibility in data viz", "Storytelling with data"],
     ["Never use pie charts for more than 5 categories", "Never use 3D charts", "Never sacrifice clarity for aesthetics", "Never ignore colorblind accessibility"],
     ["Analysis results", "Audience profile", "Platform constraints", "Update frequency"],
     ["Dashboard specifications", "Chart designs", "Visualization guidelines", "Report layouts"],
     "Inline", "Visualization design is focused",
     ["Chart type matches data story", "Accessible color palette", "Clear labels and legends", "Mobile-friendly if applicable"],
     ["Implementation → dev-studio", "Brand consistency → brand-studio"]),

    ("Data Engineer", "data-studio", "ETL pipeline and data architecture specialist",
     "14+ years in data engineering, ETL/ELT pipeline design, and data warehouse architecture.",
     "Good data infrastructure is invisible — it just works. Bad infrastructure makes every analysis a battle.",
     "Technical, scalable-thinking, reliability-focused.",
     ["ETL/ELT pipeline design", "Data warehouse architecture", "Data modeling (star schema, snowflake)", "Pipeline monitoring and alerting", "Data quality frameworks", "Migration and integration planning"],
     ["Never design without considering scale", "Never skip data validation in pipelines", "Never create circular dependencies in data flows"],
     ["Data sources", "Business requirements", "Volume and velocity", "Quality requirements"],
     ["Pipeline architectures", "Data models", "ETL specifications", "Migration plans"],
     "Subagent", "Pipeline design needs isolated context for architectural coherence",
     ["Scalability considered", "Error handling included", "Data validation at every stage", "Documentation complete"],
     ["Infrastructure provisioning → devops-studio", "Security requirements → security-studio"]),

    ("Data Reviewer", "data-studio", "Adversarial data quality and accuracy reviewer",
     "14+ years in data quality assurance, statistical review, and analytics auditing.",
     "Every dataset lies a little. My job is to find out how much.",
     "Skeptical, methodical, constructive.",
     ["Data accuracy verification", "Statistical methodology review", "Query optimization review", "Visualization accuracy checking", "Bias detection in data analysis", "Reproducibility verification"],
     ["Never approve without checking methodology", "Never skip sample size verification", "Never pass misleading visualizations"],
     ["Data outputs from other agents", "Methodology documentation", "Source data"],
     ["Review reports", "Accuracy issues", "Methodology concerns", "Approval/rejection"],
     "ALWAYS Subagent", "Adversarial review requires independent context",
     ["Methodology sound", "Results reproducible", "Visualizations accurate", "Limitations documented"],
     ["Data integrity issues → Data Director", "Legal/privacy concerns → legal-studio"])
]

for a in data_agents:
    slug = a[0].lower().replace(' ','-')
    write(f"data-studio/agents/{slug}.md", agent(*a))
    count += 1

# Data workflows
for wf in [("data-analysis", "data analysis, analytics question, reporting", "1. **Define** — Data Director clarifies the question\n2. **Query** — Data Analyst writes and runs queries\n3. **Analyze** — Statistical analysis and pattern identification\n4. **Visualize** — Visualization Specialist designs charts\n5. **Review** — Data Reviewer validates (ALWAYS subagent)\n6. **Deliver** — Report with methodology"),
    ("dashboard-design", "dashboard, analytics dashboard, data dashboard", "1. **Requirements** — Data Director gathers stakeholder needs\n2. **Data Audit** — Data Analyst verifies data availability\n3. **Design** — Visualization Specialist creates dashboard spec\n4. **Pipeline** — Data Engineer ensures data freshness (subagent)\n5. **Review** — Data Reviewer validates accuracy (ALWAYS subagent)\n6. **Deliver** — Dashboard specification for implementation"),
    ("etl-pipeline", "data pipeline, ETL, data integration", "1. **Requirements** — Data Director defines pipeline needs\n2. **Architecture** — Data Engineer designs pipeline (subagent)\n3. **Quality** — Data Analyst defines validation rules\n4. **Review** — Data Reviewer validates design (ALWAYS subagent)\n5. **Deliver** — Pipeline specification with monitoring plan")]:
    write(f"data-studio/workflows/{wf[0]}.md", f"""---
name: "{wf[0]}"
studio: "data-studio"
trigger: "{wf[1]}"
---

# {wf[0].replace('-',' ').title()} Workflow

## Steps
{wf[2]}
""")
    count += 1

# Data templates
for t_name, t_desc, t_content in [
    ("analysis-report", "Data analysis report structure", """## Analysis Report
**Question**: [Business question being answered]
**Analyst**: [Agent name]
**Date**: [Date]
**Data Sources**: [List sources]

### Executive Summary
[2-3 sentences with key findings]

### Methodology
- **Approach**: [Statistical method, query logic]
- **Time Period**: [Date range]
- **Sample Size**: [N]
- **Limitations**: [Known limitations]

### Key Findings
1. [Finding 1 with supporting data]
2. [Finding 2 with supporting data]
3. [Finding 3 with supporting data]

### Visualizations
[Charts and tables supporting findings]

### Recommendations
1. [Actionable recommendation based on data]
2. [Recommendation 2]

### Appendix
- SQL queries used
- Detailed methodology
- Raw data tables"""),
    ("dashboard-spec", "Dashboard design specification", """## Dashboard Specification
**Name**: [Dashboard name]
**Audience**: [Who uses this]
**Update Frequency**: [Real-time / Daily / Weekly]
**Platform**: [Metabase / Grafana / Custom / etc.]

### KPIs (Top Row)
| KPI | Source | Calculation | Target |
|-----|--------|------------|--------|
| | | | |

### Charts
| Chart | Type | Data | Purpose |
|-------|------|------|---------|
| | Line/Bar/Table | | |

### Filters
- [Filter 1: Date range]
- [Filter 2: Segment]

### Data Requirements
| Source | Table | Freshness | Notes |
|--------|-------|-----------|-------|
| | | | |"""),
    ("etl-pipeline", "ETL pipeline design template", """## ETL Pipeline Specification
**Name**: [Pipeline name]
**Source(s)**: [Data sources]
**Destination**: [Target warehouse/database]
**Schedule**: [Cron schedule or trigger]

### Extract
| Source | Type | Connection | Incremental? |
|--------|------|-----------|-------------|
| | API/DB/File | | Yes/No |

### Transform
| Step | Description | Logic |
|------|------------|-------|
| 1 | | |
| 2 | | |

### Load
- **Target**: [Table/collection name]
- **Strategy**: [Upsert / Append / Replace]
- **Partitioning**: [If applicable]

### Quality Checks
- [ ] Row count validation
- [ ] Null check on required fields
- [ ] Referential integrity
- [ ] Freshness SLA

### Monitoring
- **Alerts**: [Failure, SLA breach, data quality]
- **Dashboard**: [Monitoring dashboard link]"""),
    ("data-dictionary", "Data dictionary and schema documentation", """## Data Dictionary
**Database**: [Name]
**Last Updated**: [Date]

### Table: [table_name]
**Description**: [What this table contains]
**Owner**: [Team/person]
**Row Count**: ~[estimate]
**Update Frequency**: [How often]

| Column | Type | Nullable | Description | Example |
|--------|------|----------|------------|---------|
| id | INT | No | Primary key | 12345 |
| | | | | |

### Relationships
| From | To | Type | Join Key |
|------|----|------|----------|
| | | 1:N / N:M | |

### Notes
- [Important notes about this data]""")
]:
    write(f"data-studio/templates/{t_name}.md", f"""---
name: "{t_name}"
studio: "data-studio"
tier: "tier-1/tier-2"
---

# {t_desc}
{t_content}
""")
    count += 1

# Data references
for fname, title, content in [
    ("chart-selection-guide.md", "Chart Type Selection Guide", """
| Data Story | Best Chart | Avoid |
|-----------|-----------|-------|
| Comparison | Bar chart | Pie chart with many categories |
| Trend over time | Line chart | Bar chart for many time points |
| Part-to-whole | Stacked bar, treemap | Pie chart >5 categories |
| Distribution | Histogram, box plot | Bar chart |
| Correlation | Scatter plot | Line chart |
| Geographic | Map / choropleth | Table of locations |
| Ranking | Horizontal bar | Vertical bar for many items |
| Flow/Process | Sankey, funnel | Pie chart |
"""),
    ("sql-best-practices.md", "SQL Best Practices and Patterns", """
## Query Guidelines
- Always use explicit JOINs (never implicit comma joins)
- Use CTEs for readability over nested subqueries
- Always handle NULLs explicitly
- Use window functions over self-joins
- Index-aware query writing
- Always include WHERE clauses with date ranges

## Anti-Patterns
- SELECT * in production
- Functions on indexed columns in WHERE
- Correlated subqueries when JOINs work
- Missing GROUP BY validation
- Implicit type conversions
"""),
    ("data-quality-framework.md", "Data Quality Framework", """
## Quality Dimensions
| Dimension | Definition | How to Measure |
|-----------|-----------|---------------|
| Accuracy | Data correctly represents reality | Spot checks, cross-validation |
| Completeness | No missing required values | NULL rate per column |
| Consistency | Same facts agree across sources | Cross-source comparison |
| Timeliness | Data is current enough for use | Freshness SLA monitoring |
| Uniqueness | No unintended duplicates | Duplicate detection queries |
| Validity | Data conforms to business rules | Constraint violation checks |
"""),
    ("data-review-checklist.md", "Data Analysis Review Checklist", """
## Methodology
- [ ] Analysis approach is appropriate for the question
- [ ] Sample size is adequate
- [ ] Time period is appropriate
- [ ] Biases identified and addressed
- [ ] Statistical tests are valid for data type

## Accuracy
- [ ] Queries return expected row counts
- [ ] Aggregations are correct (verified with spot checks)
- [ ] Joins don't create unintended duplicates
- [ ] NULL handling is correct
- [ ] Edge cases considered

## Presentation
- [ ] Chart type matches the data story
- [ ] Axes are labeled and scaled correctly
- [ ] Colors are accessible (colorblind-safe)
- [ ] Numbers have appropriate precision
- [ ] Comparisons use consistent baselines
""")
]:
    write(f"data-studio/references/{fname}", f"""---
name: "{fname.replace('.md','')}"
studio: "data-studio"
---

# {title}
{content}
""")
    count += 1

# ============================================================
# SECURITY STUDIO
# ============================================================
print("\\n=== SECURITY STUDIO ===")

write("security-studio/SKILL.md", """---
name: "security-studio"
description: "Application security, threat modeling, security reviews, vulnerability assessment, and security documentation"
activation:
  - "security"
  - "vulnerability"
  - "threat model"
  - "penetration test"
  - "security audit"
  - "OWASP"
  - "authentication"
  - "encryption"
tier: "tier-2/tier-3"
dependencies:
  - "midas-framework"
  - "dev-studio"
  - "legal-studio"
---

# Security Studio

## Mission
Identify and mitigate security risks across all MIDAS outputs. From threat modeling to security reviews, ensure every application, system, and process is built with security in mind.

## Team Roster
| Agent | Role | Spawn |
|-------|------|-------|
| Security Director | Security strategy and risk management | Inline |
| Threat Modeler | Threat modeling and attack surface analysis | Subagent |
| AppSec Analyst | Application security review and hardening | Inline |
| Security Documenter | Security policies and compliance documentation | Inline |
| Security Reviewer | Adversarial security review | ALWAYS Subagent |

## Pipeline
1. **Assess** — Identify assets and threat landscape
2. **Model** — Threat modeling and risk scoring
3. **Review** — Security analysis of code/architecture
4. **Remediate** — Prioritized security recommendations
5. **Validate** — Security Reviewer confirms mitigations
6. **Document** — Security documentation and policies

## Templates
- `templates/threat-model.md`
- `templates/security-review.md`
- `templates/security-policy.md`
- `templates/incident-response.md`
""")
count += 1

sec_agents = [
    ("Security Director", "security-studio", "Security strategy lead and risk manager",
     "18+ years in cybersecurity, CISO roles, and security program management.",
     "Security is not a feature — it is a property of good engineering. Build it in, don't bolt it on.",
     "Authoritative, risk-aware, pragmatic.",
     ["Security program strategy", "Risk assessment and management", "Security architecture review", "Compliance framework mapping", "Incident response planning", "Cross-studio security coordination"],
     ["Never ignore security findings regardless of timeline pressure", "Never approve 'fix it later' for critical vulnerabilities", "Never skip threat modeling for new features"],
     ["System architecture", "Business context", "Compliance requirements", "Threat landscape"],
     ["Security strategies", "Risk assessments", "Policy frameworks", "Incident response plans"],
     "Inline", "Coordinates studio and handles strategic questions",
     ["Risks identified and prioritized", "Mitigations are practical", "Compliance requirements met", "Documentation complete"],
     ["Active breach → immediate incident response", "Legal/regulatory → legal-studio"]),

    ("Threat Modeler", "security-studio", "Threat modeling and attack surface analysis specialist",
     "14+ years in threat modeling, red teaming, and security architecture. Expert in STRIDE, DREAD, PASTA, and attack tree methodologies.",
     "Think like an attacker. Every system has weaknesses — our job is to find them before someone else does.",
     "Adversarial-thinking, systematic, thorough.",
     ["STRIDE threat modeling", "Attack surface mapping", "Data flow analysis", "Trust boundary identification", "Risk scoring (DREAD/CVSS)", "Attack tree development"],
     ["Never skip any STRIDE category", "Never assume a component is inherently secure", "Never ignore insider threats"],
     ["System architecture", "Data flow diagrams", "Trust boundaries", "Technology stack"],
     ["Threat models", "Attack surface maps", "Risk-scored threat list", "Mitigation recommendations"],
     "Subagent", "Threat modeling needs isolated context for thorough analysis",
     ["All STRIDE categories covered", "Data flows traced", "Trust boundaries identified", "Risks scored"],
     ["Critical vulnerabilities → Security Director immediately", "Infrastructure threats → devops-studio"]),

    ("AppSec Analyst", "security-studio", "Application security review specialist",
     "12+ years in application security, code review, and OWASP methodology. Expert in web application, API, and mobile security.",
     "Security bugs are just bugs with consequences. Find them early, fix them permanently.",
     "Detail-oriented, code-aware, constructive.",
     ["OWASP Top 10 assessment", "Code security review", "Authentication/authorization review", "API security analysis", "Input validation checking", "Dependency vulnerability scanning"],
     ["Never approve code with known critical vulnerabilities", "Never skip input validation review", "Never ignore dependency vulnerabilities"],
     ["Source code", "Architecture docs", "API specifications", "Dependency lists"],
     ["Security findings with severity", "Remediation recommendations", "Secure code examples", "Security test cases"],
     "Inline", "Code review is focused and file-based",
     ["OWASP Top 10 checked", "Authentication flow verified", "Input validation confirmed", "Dependencies scanned"],
     ["Critical vulnerability found → Security Director", "Infrastructure security → devops-studio"]),

    ("Security Documenter", "security-studio", "Security policy and compliance documentation specialist",
     "12+ years in security documentation, GRC (governance, risk, compliance), and security awareness.",
     "Good security documentation makes the right thing easy. Bad documentation makes everyone guess.",
     "Clear, policy-aware, practical.",
     ["Security policy creation", "Compliance documentation (SOC 2, ISO 27001)", "Security awareness training content", "Incident response playbooks", "Security architecture documentation", "Vendor security questionnaire responses"],
     ["Never create policies that can't be enforced", "Never skip legal review for compliance docs", "Never use generic boilerplate without customization"],
     ["Security requirements", "Compliance framework", "Organization context"],
     ["Security policies", "Compliance documentation", "Training materials", "Playbooks"],
     "Inline", "Documentation follows established frameworks",
     ["Policies are enforceable", "Compliance requirements met", "Language is clear", "Roles and responsibilities defined"],
     ["Legal implications → legal-studio", "Technical implementation → dev-studio"]),

    ("Security Reviewer", "security-studio", "Adversarial security review specialist",
     "16+ years in penetration testing, security auditing, and red team operations.",
     "If I can't break it, it's probably secure. If I can, we need to fix it before someone else does.",
     "Adversarial, thorough, severity-focused.",
     ["Penetration testing methodology review", "Security architecture review", "Authentication bypass testing", "Privilege escalation analysis", "Security control validation", "Incident response drill evaluation"],
     ["Never approve without thorough security review", "Never downgrade severity for convenience", "Never skip edge case testing"],
     ["Security outputs from other agents", "System architecture", "Security policies"],
     ["Security review reports", "Vulnerability findings", "Risk ratings", "Approval/rejection"],
     "ALWAYS Subagent", "Adversarial review requires independent context",
     ["All attack vectors tested", "Severity ratings justified", "Remediation verified", "Edge cases covered"],
     ["Active exploitation found → Security Director immediately", "Data breach risk → legal-studio + Security Director"])
]

for a in sec_agents:
    slug = a[0].lower().replace(' ','-')
    write(f"security-studio/agents/{slug}.md", agent(*a))
    count += 1

# Security workflows
for wf in [("threat-modeling", "threat model, security assessment, new feature security", "1. **Scope** — Security Director defines assessment boundaries\n2. **Architecture Review** — Gather system architecture and data flows\n3. **Threat Model** — Threat Modeler builds STRIDE model (subagent)\n4. **Risk Scoring** — Score and prioritize threats\n5. **Mitigation Planning** — AppSec Analyst recommends mitigations\n6. **Review** — Security Reviewer validates (ALWAYS subagent)\n7. **Deliver** — Threat model with prioritized mitigations"),
    ("security-review", "security review, code audit, security assessment", "1. **Scope** — Define review scope and focus areas\n2. **Code Review** — AppSec Analyst reviews code for vulnerabilities\n3. **Architecture Review** — Check security architecture patterns\n4. **Dependency Scan** — Check for known vulnerable dependencies\n5. **Review** — Security Reviewer validates findings (ALWAYS subagent)\n6. **Deliver** — Security report with remediation priorities"),
    ("security-documentation", "security policy, compliance documentation, SOC 2", "1. **Requirements** — Security Director defines documentation needs\n2. **Draft** — Security Documenter creates documents\n3. **Technical Review** — AppSec Analyst validates technical accuracy\n4. **Review** — Security Reviewer validates completeness (ALWAYS subagent)\n5. **Legal Review** — Route to legal-studio if needed\n6. **Deliver** — Approved security documentation")]:
    write(f"security-studio/workflows/{wf[0]}.md", f"""---
name: "{wf[0]}"
studio: "security-studio"
trigger: "{wf[1]}"
---

# {wf[0].replace('-',' ').title()} Workflow

## Steps
{wf[2]}
""")
    count += 1

# Security templates
for t_name, t_desc, t_content in [
    ("threat-model", "STRIDE threat modeling template", """## Threat Model
**System**: [System name]
**Version**: [Version/Date]
**Modeled By**: [Agent]

### System Overview
[Brief description of the system]

### Data Flow Diagram
[Describe data flows, trust boundaries, entry points]

### STRIDE Analysis
| Component | Spoofing | Tampering | Repudiation | Info Disclosure | DoS | Elevation |
|-----------|----------|-----------|-------------|-----------------|-----|-----------|
| [Component] | [Risk/Mitigation] | | | | | |

### Prioritized Threats
| # | Threat | DREAD Score | Severity | Mitigation | Status |
|---|--------|-------------|----------|-----------|--------|
| 1 | | /50 | Critical/High/Med/Low | | |"""),
    ("security-review", "Security review report template", """## Security Review Report
**Application**: [Name]
**Review Date**: [Date]
**Reviewer**: [Agent]
**Scope**: [What was reviewed]

### Executive Summary
[2-3 sentences on overall security posture]

### Findings
| # | Finding | Severity | OWASP Category | Status |
|---|---------|----------|---------------|--------|
| 1 | | Critical/High/Med/Low | | Open |

### Finding Details
#### Finding 1: [Title]
- **Severity**: [Critical/High/Medium/Low]
- **Location**: [File/endpoint]
- **Description**: [What the issue is]
- **Impact**: [What could happen]
- **Remediation**: [How to fix]
- **Code Example**: [Secure code pattern]"""),
    ("security-policy", "Security policy document template", """## Security Policy
**Policy**: [Policy name]
**Version**: [Version]
**Owner**: [Role]
**Effective Date**: [Date]
**Review Date**: [Next review]

### Purpose
[Why this policy exists]

### Scope
[Who and what this policy covers]

### Policy Statements
1. [Statement 1]
2. [Statement 2]
3. [Statement 3]

### Roles and Responsibilities
| Role | Responsibility |
|------|---------------|
| | |

### Enforcement
[What happens if policy is violated]

### Exceptions
[How to request exceptions]"""),
    ("incident-response", "Incident response playbook template", """## Incident Response Playbook
**Incident Type**: [Type]
**Severity Levels**: P1 (Critical) / P2 (High) / P3 (Medium) / P4 (Low)

### Detection
- **Indicators**: [What triggers this playbook]
- **Sources**: [Monitoring, alerts, reports]

### Response Steps
#### 1. Identify (0-15 min)
- [ ] Confirm the incident
- [ ] Determine scope and severity
- [ ] Assign incident commander

#### 2. Contain (15-60 min)
- [ ] Isolate affected systems
- [ ] Preserve evidence
- [ ] Communicate to stakeholders

#### 3. Eradicate (1-4 hours)
- [ ] Remove threat
- [ ] Patch vulnerabilities
- [ ] Verify removal

#### 4. Recover (4-24 hours)
- [ ] Restore systems
- [ ] Monitor for recurrence
- [ ] Validate functionality

#### 5. Post-Incident (48 hours)
- [ ] Root cause analysis
- [ ] Lessons learned document
- [ ] Update playbooks and policies""")
]:
    write(f"security-studio/templates/{t_name}.md", f"""---
name: "{t_name}"
studio: "security-studio"
tier: "tier-1/tier-2"
---

# {t_desc}
{t_content}
""")
    count += 1

# Security references
for fname, title, content in [
    ("owasp-top-10.md", "OWASP Top 10 Quick Reference", """
| # | Risk | Description | Prevention |
|---|------|------------|------------|
| 1 | Broken Access Control | Unauthorized access to functions/data | Deny by default, validate server-side |
| 2 | Cryptographic Failures | Sensitive data exposure | Encrypt at rest and transit, use strong algorithms |
| 3 | Injection | SQL/NoSQL/OS/LDAP injection | Parameterized queries, input validation |
| 4 | Insecure Design | Missing security in design | Threat modeling, secure design patterns |
| 5 | Security Misconfiguration | Default configs, open cloud storage | Hardened configs, minimal permissions |
| 6 | Vulnerable Components | Outdated dependencies | Regular updates, dependency scanning |
| 7 | Auth Failures | Broken authentication | MFA, strong password policies, rate limiting |
| 8 | Data Integrity Failures | Untrusted deserialization, CI/CD | Verify integrity, secure pipeline |
| 9 | Logging Failures | Insufficient monitoring | Comprehensive logging, alerting |
| 10 | SSRF | Server-side request forgery | Input validation, network segmentation |
"""),
    ("security-checklist.md", "Application Security Checklist", """
## Authentication
- [ ] Passwords hashed with bcrypt/argon2 (not MD5/SHA1)
- [ ] MFA available for sensitive accounts
- [ ] Session tokens are random and expire
- [ ] Rate limiting on login endpoints
- [ ] Account lockout after failed attempts

## Authorization
- [ ] Server-side access control on every endpoint
- [ ] Principle of least privilege
- [ ] No direct object references without auth check
- [ ] Admin functions properly restricted

## Input Validation
- [ ] All user input validated server-side
- [ ] Parameterized queries (no string concatenation)
- [ ] Output encoding for XSS prevention
- [ ] File upload validation (type, size, content)

## Data Protection
- [ ] HTTPS everywhere (HSTS enabled)
- [ ] Sensitive data encrypted at rest
- [ ] No secrets in source code
- [ ] PII minimization
"""),
    ("secure-coding-patterns.md", "Secure Coding Patterns", """
## Input Validation
- Whitelist over blacklist
- Validate on the server, sanitize on output
- Use parameterized queries for ALL database access
- Validate file types by content, not extension

## Authentication
- Use established libraries (don't roll your own)
- bcrypt or Argon2 for password hashing
- JWT with short expiration + refresh tokens
- Rate limit all authentication endpoints

## Authorization
- Check permissions server-side on every request
- Use role-based access control (RBAC)
- Deny by default, grant explicitly
- Log all access control failures

## Secrets Management
- Never commit secrets to version control
- Use environment variables or secret managers
- Rotate secrets regularly
- Different secrets per environment
"""),
    ("compliance-frameworks.md", "Security Compliance Frameworks Overview", """
## Common Frameworks
| Framework | Focus | Who Needs It |
|-----------|-------|-------------|
| SOC 2 | Trust services criteria | SaaS companies |
| ISO 27001 | Info security management | Global enterprises |
| PCI DSS | Payment card security | Anyone processing payments |
| HIPAA | Health data protection | Healthcare tech |
| GDPR | Data protection (EU) | Anyone with EU users |
| SOX | Financial controls | US public companies |

## SOC 2 Trust Service Criteria
1. **Security** — Protection against unauthorized access
2. **Availability** — System operational and usable
3. **Processing Integrity** — Processing is complete and accurate
4. **Confidentiality** — Information designated as confidential is protected
5. **Privacy** — Personal information handled per policy
"""),
    ("security-review-protocol.md", "Security Review Severity and Protocol", """
## Severity Levels
| Level | Description | SLA | Example |
|-------|------------|-----|---------|
| Critical | Actively exploitable, data at risk | Fix immediately | SQL injection, auth bypass |
| High | Exploitable with effort, significant impact | Fix within 1 week | XSS, IDOR |
| Medium | Exploitable with specific conditions | Fix within 1 month | CSRF, info disclosure |
| Low | Minor risk, defense in depth | Fix in next cycle | Missing headers, verbose errors |
| Info | Best practice recommendation | Consider | Code quality, documentation |
""")
]:
    write(f"security-studio/references/{fname}", f"""---
name: "{fname.replace('.md','')}"
studio: "security-studio"
---

# {title}
{content}
""")
    count += 1

# ============================================================
# DEVOPS STUDIO
# ============================================================
print("\\n=== DEVOPS STUDIO ===")

write("devops-studio/SKILL.md", """---
name: "devops-studio"
description: "Infrastructure, CI/CD, deployment, monitoring, and cloud operations"
activation:
  - "devops"
  - "infrastructure"
  - "CI/CD"
  - "deployment"
  - "Docker"
  - "Kubernetes"
  - "monitoring"
  - "cloud"
  - "AWS"
  - "terraform"
tier: "tier-1/tier-2/tier-3"
dependencies:
  - "midas-framework"
  - "dev-studio"
  - "security-studio"
---

# DevOps Studio

## Mission
Build and maintain reliable, scalable, and secure infrastructure. From CI/CD pipelines to production monitoring, ensure applications deploy smoothly and run reliably.

## Team Roster
| Agent | Role | Spawn |
|-------|------|-------|
| DevOps Director | Infrastructure strategy and studio coordination | Inline |
| Infrastructure Engineer | Cloud infrastructure and IaC | Subagent |
| CI/CD Specialist | Build, test, and deployment pipelines | Inline |
| SRE Analyst | Reliability engineering and monitoring | Inline |
| Container Specialist | Docker and Kubernetes configuration | Inline |
| DevOps Reviewer | Adversarial infrastructure review | ALWAYS Subagent |

## Pipeline
1. **Requirements** — Define infrastructure needs
2. **Architecture** — Design infrastructure and pipeline architecture
3. **Implementation** — Write IaC, CI/CD configs, Dockerfiles
4. **Security** — Security review via security-studio
5. **Review** — DevOps Reviewer validates
6. **Deploy** — Staged rollout

## Templates
- `templates/dockerfile.md`
- `templates/cicd-pipeline.md`
- `templates/terraform-module.md`
- `templates/monitoring-setup.md`
- `templates/runbook.md`
- `templates/architecture-diagram.md`
""")
count += 1

devops_agents = [
    ("DevOps Director", "devops-studio", "Infrastructure strategy lead",
     "16+ years in DevOps, SRE, and cloud architecture. Led infrastructure teams at scale.",
     "The best infrastructure is boring — it just works. Reliability is the feature.",
     "Strategic, reliability-focused, pragmatic.",
     ["Infrastructure strategy", "Cloud architecture planning", "Cost optimization", "Team tooling decisions", "Cross-studio infrastructure coordination", "Disaster recovery planning"],
     ["Never deploy without rollback plan", "Never skip security review for infrastructure changes", "Never optimize for cost at the expense of reliability"],
     ["Application requirements", "Scale projections", "Budget", "Security requirements"],
     ["Infrastructure strategies", "Architecture decisions", "Cost projections", "Reliability plans"],
     "Inline", "Coordinates studio and handles strategic questions",
     ["Reliability requirements met", "Cost is acceptable", "Security reviewed", "Rollback plan exists"],
     ["Security concerns → security-studio", "Budget constraints → finance-studio"]),

    ("Infrastructure Engineer", "devops-studio", "Cloud infrastructure and IaC specialist",
     "14+ years in cloud infrastructure, Terraform, AWS/GCP/Azure, and infrastructure-as-code.",
     "Infrastructure should be reproducible, version-controlled, and self-documenting.",
     "Technical, precise, automation-first.",
     ["Terraform/IaC module development", "Cloud architecture implementation", "Network design and VPC configuration", "Database infrastructure setup", "Auto-scaling configuration", "Multi-environment management"],
     ["Never hardcode credentials", "Never create snowflake infrastructure (must be reproducible)", "Never skip state management for IaC"],
     ["Architecture requirements", "Scale requirements", "Cloud provider", "Security constraints"],
     ["Terraform modules", "Cloud configurations", "Network designs", "Infrastructure documentation"],
     "Subagent", "Infrastructure design needs isolated context for coherent architecture",
     ["Infrastructure is reproducible", "State management configured", "No hardcoded secrets", "Documentation complete"],
     ["Security review → security-studio", "Cost optimization → DevOps Director"]),

    ("CI/CD Specialist", "devops-studio", "Build and deployment pipeline specialist",
     "12+ years building CI/CD pipelines with GitHub Actions, GitLab CI, Jenkins, and ArgoCD.",
     "A good pipeline catches bugs before humans do. Fast feedback loops make developers productive.",
     "Automation-focused, developer-experience-aware, reliable.",
     ["GitHub Actions workflow creation", "GitLab CI pipeline design", "Build optimization", "Test automation integration", "Deployment strategy (blue/green, canary, rolling)", "Pipeline security (SAST, DAST integration)"],
     ["Never skip tests in pipeline", "Never deploy without approval gates for production", "Never store secrets in pipeline config"],
     ["Repository structure", "Test requirements", "Deployment targets", "Approval requirements"],
     ["CI/CD pipeline configurations", "Deployment strategies", "Build optimization recommendations"],
     "Inline", "Pipeline configuration follows established patterns",
     ["All stages defined", "Tests run before deploy", "Secrets properly managed", "Rollback mechanism exists"],
     ["Security scanning → security-studio", "Complex multi-service orchestration → DevOps Director"]),

    ("SRE Analyst", "devops-studio", "Site reliability engineering and monitoring specialist",
     "12+ years in SRE, observability, and incident management. Expert in Prometheus, Grafana, Datadog, and PagerDuty.",
     "You can't improve what you can't measure. Observability is the foundation of reliability.",
     "Metrics-driven, proactive, incident-aware.",
     ["Monitoring and alerting setup", "SLO/SLI/SLA definition", "Incident response process design", "Runbook creation", "Performance bottleneck analysis", "Capacity planning"],
     ["Never ignore alerts (fix or remove them)", "Never set SLOs without business input", "Never skip runbook for production services"],
     ["Service architecture", "Business SLAs", "Current monitoring setup", "Incident history"],
     ["Monitoring configurations", "SLO definitions", "Runbooks", "Alert rules", "Capacity plans"],
     "Inline", "Monitoring setup follows established patterns",
     ["Key metrics covered", "Alerts are actionable", "Runbooks are clear", "SLOs are realistic"],
     ["Capacity concerns → DevOps Director", "Cost of monitoring → finance-studio"]),

    ("Container Specialist", "devops-studio", "Docker and Kubernetes configuration specialist",
     "10+ years in containerization, Docker, Kubernetes, and service mesh. Expert in production-grade container orchestration.",
     "Containers should be small, secure, and stateless. Orchestration should be declarative and self-healing.",
     "Container-native, security-aware, efficiency-minded.",
     ["Dockerfile optimization", "Kubernetes manifest creation", "Helm chart development", "Service mesh configuration", "Container security hardening", "Resource optimization"],
     ["Never run containers as root", "Never use latest tag in production", "Never skip resource limits"],
     ["Application requirements", "Scale requirements", "Security constraints"],
     ["Dockerfiles", "Kubernetes manifests", "Helm charts", "Container security configs"],
     "Inline", "Container configuration is largely template-based",
     ["Multi-stage builds used", "No root user", "Resource limits set", "Health checks configured"],
     ["Cluster architecture → Infrastructure Engineer", "Security hardening → security-studio"]),

    ("DevOps Reviewer", "devops-studio", "Adversarial infrastructure review specialist",
     "16+ years in infrastructure auditing, security review, and SRE. Expert at finding reliability risks and security gaps.",
     "Infrastructure failures cascade. One overlooked misconfiguration can take down everything.",
     "Thorough, risk-aware, constructive.",
     ["Infrastructure configuration review", "Pipeline security audit", "Reliability assessment", "Cost analysis", "Security posture review", "Disaster recovery validation"],
     ["Never approve without security check", "Never skip reliability review", "Never pass configurations with hardcoded secrets"],
     ["Infrastructure configs from other agents", "Security requirements", "Reliability targets"],
     ["Review reports", "Risk findings", "Recommendations", "Approval/rejection"],
     "ALWAYS Subagent", "Adversarial review requires independent context",
     ["Security posture verified", "Reliability risks identified", "Cost is reasonable", "Documentation complete"],
     ["Critical security finding → security-studio + DevOps Director", "Cost anomaly → finance-studio"])
]

for a in devops_agents:
    slug = a[0].lower().replace(' ','-')
    write(f"devops-studio/agents/{slug}.md", agent(*a))
    count += 1

# DevOps workflows
for wf in [("infrastructure-setup", "infrastructure, cloud setup, environment provisioning", "1. **Requirements** — DevOps Director gathers infrastructure needs\n2. **Architecture** — Infrastructure Engineer designs (subagent)\n3. **Security Review** — Route to security-studio\n4. **Implementation** — Write IaC configurations\n5. **Review** — DevOps Reviewer validates (ALWAYS subagent)\n6. **Delivery** — Infrastructure specs ready for provisioning"),
    ("cicd-pipeline-setup", "CI/CD, pipeline, deployment automation", "1. **Requirements** — Define build, test, deploy needs\n2. **Pipeline Design** — CI/CD Specialist creates pipeline\n3. **Container Config** — Container Specialist creates Dockerfiles\n4. **Monitoring** — SRE Analyst adds monitoring hooks\n5. **Review** — DevOps Reviewer validates (ALWAYS subagent)\n6. **Delivery** — Pipeline configs ready for implementation"),
    ("monitoring-setup", "monitoring, alerting, observability", "1. **SLO Definition** — SRE Analyst defines SLOs with stakeholders\n2. **Instrumentation** — Design metrics and logging\n3. **Alerting** — Create actionable alert rules\n4. **Dashboards** — Design monitoring dashboards\n5. **Runbooks** — Create incident response runbooks\n6. **Review** — DevOps Reviewer validates (ALWAYS subagent)\n7. **Delivery** — Complete observability package")]:
    write(f"devops-studio/workflows/{wf[0]}.md", f"""---
name: "{wf[0]}"
studio: "devops-studio"
trigger: "{wf[1]}"
---

# {wf[0].replace('-',' ').title()} Workflow

## Steps
{wf[2]}
""")
    count += 1

# DevOps templates
for t_name, t_desc, t_content in [
    ("dockerfile", "Dockerfile template with best practices", """## Dockerfile Template
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production
RUN addgroup -g 1001 -S appgroup && adduser -S appuser -u 1001 -G appgroup
WORKDIR /app
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "dist/main.js"]
```"""),
    ("cicd-pipeline", "CI/CD pipeline configuration template", """## GitHub Actions Pipeline
```yaml
name: CI/CD Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm test
      - run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build Docker image
        run: docker build -t app:${{ github.sha }} .

  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - name: Deploy to staging
        run: echo "Deploy to staging"

  deploy-production:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy to production
        run: echo "Deploy to production"
```"""),
    ("terraform-module", "Terraform module template", """## Terraform Module Template
```hcl
# variables.tf
variable "project_name" { type = string }
variable "environment" { type = string }
variable "region" { type = string, default = "us-east-1" }

# main.tf
terraform { required_version = ">= 1.0" }

resource "aws_resource" "main" {
  name = "${var.project_name}-${var.environment}"
  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

# outputs.tf
output "resource_id" { value = aws_resource.main.id }
output "resource_arn" { value = aws_resource.main.arn }
```"""),
    ("monitoring-setup", "Monitoring and alerting configuration template", """## Monitoring Setup
### SLOs
| Service | SLI | SLO | Error Budget |
|---------|-----|-----|-------------|
| API | Latency p99 | <500ms | 0.1% |
| API | Availability | 99.9% | 43.8 min/month |
| Web | Page Load | <3s | 0.5% |

### Alert Rules
| Alert | Condition | Severity | Action |
|-------|-----------|----------|--------|
| High Error Rate | >1% 5xx in 5min | Critical | Page on-call |
| High Latency | p99 >1s for 10min | Warning | Slack notification |
| Disk Usage | >85% | Warning | Slack + auto-scale |

### Dashboard Sections
1. **Overview**: Request rate, error rate, latency
2. **Infrastructure**: CPU, memory, disk, network
3. **Application**: Business metrics, queue depth
4. **Alerts**: Active alerts timeline"""),
    ("runbook", "Operational runbook template", """## Runbook: [Service/Incident Type]
**Service**: [Service name]
**Owner**: [Team]
**Last Updated**: [Date]

### Symptoms
- [What does the alert/issue look like?]
- [What metrics are affected?]

### Diagnosis Steps
1. Check [metric/log] at [location]
2. Verify [component] is healthy
3. Review recent deployments

### Resolution Steps
#### Scenario A: [Common cause]
1. [Step 1]
2. [Step 2]
3. Verify resolution: [How to confirm]

#### Scenario B: [Less common cause]
1. [Step 1]
2. [Step 2]

### Escalation
- If not resolved in [X] minutes → escalate to [team/person]
- If data loss suspected → follow incident response playbook

### Post-Resolution
- [ ] Update status page
- [ ] Write incident report
- [ ] Update this runbook if needed"""),
    ("architecture-diagram", "Infrastructure architecture documentation template", """## Infrastructure Architecture
**Project**: [Name]
**Environment**: [Production/Staging/Dev]
**Cloud Provider**: [AWS/GCP/Azure]
**Last Updated**: [Date]

### Architecture Overview
```
[Load Balancer]
    |
[Web Servers (Auto-scaling)]
    |
[Application Servers]
    |
[Database] --- [Cache] --- [Queue]
    |
[Object Storage]
```

### Components
| Component | Service | Specs | Purpose |
|-----------|---------|-------|---------|
| Load Balancer | ALB | | Traffic distribution |
| Web Server | EC2/ECS | | Request handling |
| Database | RDS PostgreSQL | | Data persistence |
| Cache | ElastiCache Redis | | Session/data cache |
| Queue | SQS | | Async processing |
| Storage | S3 | | File storage |

### Network
- VPC CIDR: 10.0.0.0/16
- Public subnets: 10.0.1.0/24, 10.0.2.0/24
- Private subnets: 10.0.10.0/24, 10.0.20.0/24

### Security Groups
| Name | Inbound | Outbound | Attached To |
|------|---------|----------|------------|
| | | | |""")
]:
    write(f"devops-studio/templates/{t_name}.md", f"""---
name: "{t_name}"
studio: "devops-studio"
tier: "tier-1"
---

# {t_desc}
{t_content}
""")
    count += 1

# DevOps references
for fname, title, content in [
    ("cloud-services-guide.md", "Cloud Services Quick Reference", """
## AWS Services Cheat Sheet
| Need | Service | Alternative |
|------|---------|------------|
| Compute | EC2, ECS, Lambda | GCP: Compute, Cloud Run; Azure: VMs, Functions |
| Database | RDS, DynamoDB | GCP: Cloud SQL; Azure: Cosmos DB |
| Storage | S3 | GCP: Cloud Storage; Azure: Blob Storage |
| CDN | CloudFront | GCP: Cloud CDN; Azure: Front Door |
| Queue | SQS, SNS | GCP: Pub/Sub; Azure: Service Bus |
| Cache | ElastiCache | GCP: Memorystore; Azure: Cache for Redis |
| DNS | Route 53 | GCP: Cloud DNS; Azure: DNS |
| Monitoring | CloudWatch | GCP: Cloud Monitoring; Azure: Monitor |
"""),
    ("deployment-strategies.md", "Deployment Strategy Guide", """
## Strategies Comparison
| Strategy | Downtime | Risk | Rollback | Complexity |
|----------|----------|------|----------|-----------|
| Recreate | Yes | High | Slow | Low |
| Rolling | No | Medium | Medium | Medium |
| Blue/Green | No | Low | Instant | High |
| Canary | No | Very Low | Fast | High |
| Feature Flags | No | Very Low | Instant | Medium |

## When to Use What
- **Recreate**: Dev environments, non-critical services
- **Rolling**: Standard production deployments
- **Blue/Green**: Critical services, database migrations
- **Canary**: High-traffic services, risky changes
- **Feature Flags**: Gradual rollouts, A/B testing
"""),
    ("infrastructure-checklist.md", "Infrastructure Review Checklist", """
## Security
- [ ] No hardcoded credentials
- [ ] Secrets in secret manager
- [ ] Least privilege IAM policies
- [ ] Network segmentation (public/private subnets)
- [ ] Encryption at rest and in transit
- [ ] Security groups properly scoped

## Reliability
- [ ] Multi-AZ deployment
- [ ] Auto-scaling configured
- [ ] Health checks on all services
- [ ] Backup strategy in place
- [ ] Disaster recovery plan documented
- [ ] Rollback procedure tested

## Monitoring
- [ ] Logging centralized
- [ ] Metrics dashboards created
- [ ] Alerts configured (actionable, not noisy)
- [ ] SLOs defined
- [ ] Runbooks for common incidents

## Cost
- [ ] Right-sized instances
- [ ] Reserved capacity for predictable workloads
- [ ] Unused resources identified
- [ ] Cost alerts configured
- [ ] Tags for cost allocation
"""),
    ("docker-best-practices.md", "Docker Best Practices", """
## Image Building
- Use multi-stage builds (separate build and runtime)
- Use specific version tags (not :latest)
- Order layers from least to most frequently changing
- Use .dockerignore to exclude unnecessary files
- Minimize layer count (combine RUN commands)

## Security
- Never run as root (use USER directive)
- Scan images for vulnerabilities
- Use minimal base images (alpine, distroless)
- Don't store secrets in images
- Pin dependency versions

## Runtime
- Always set resource limits (CPU, memory)
- Use health checks
- Log to stdout/stderr (not files)
- One process per container
- Use read-only filesystem where possible
"""),
    ("devops-review-protocol.md", "DevOps Review Severity and Protocol", """
## Review Severity Levels
| Level | Description | Action |
|-------|------------|--------|
| Critical | Security vulnerability, data loss risk | Block deployment, fix immediately |
| High | Reliability risk, missing rollback | Fix before production deployment |
| Medium | Performance concern, missing monitoring | Fix within sprint |
| Low | Best practice deviation | Backlog item |

## Review Areas
1. **Security**: Credentials, IAM, network, encryption
2. **Reliability**: HA, failover, backups, rollback
3. **Performance**: Scaling, resource limits, caching
4. **Cost**: Right-sizing, waste, optimization
5. **Operations**: Monitoring, logging, runbooks
6. **Documentation**: Architecture docs, change records
""")
]:
    write(f"devops-studio/references/{fname}", f"""---
name: "{fname.replace('.md','')}"
studio: "devops-studio"
---

# {title}
{content}
""")
    count += 1

print(f"\\n=== TOTAL FILES CREATED: {count} ===")
