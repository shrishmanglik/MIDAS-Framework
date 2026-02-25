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
# HEALTHCARE STUDIO
# ============================================================
print("\\n=== HEALTHCARE STUDIO ===")

write("healthcare-studio/SKILL.md", """---
name: "healthcare-studio"
description: "Health and wellness content, patient education materials, HIPAA-aware documentation, and healthcare marketing"
activation:
  - "healthcare"
  - "medical content"
  - "patient education"
  - "wellness"
  - "health marketing"
  - "HIPAA"
  - "clinical"
tier: "tier-2/tier-3"
dependencies:
  - "midas-framework"
  - "content-studio"
  - "legal-studio"
---

# Healthcare Studio

## Mission
Create accurate, accessible, and compliant healthcare content — from patient education materials to wellness programs. All outputs follow healthcare communication best practices and include appropriate disclaimers.

## Important Disclaimer
**All Healthcare Studio outputs are informational only and do NOT constitute medical advice. Always consult qualified healthcare professionals for medical decisions.**

## Team Roster
| Agent | Role | Spawn |
|-------|------|-------|
| Health Content Director | Strategy and compliance oversight | Inline |
| Medical Writer | Clinical and patient education content | Subagent |
| Wellness Content Creator | Wellness and lifestyle health content | Inline |
| Health Compliance Specialist | HIPAA, regulatory, and accuracy review | Subagent |
| Healthcare Reviewer | Adversarial review of all health content | ALWAYS Subagent |

## Pipeline
1. **Brief** — Define content type, audience, clinical area
2. **Research** — Verify clinical accuracy with current guidelines
3. **Draft** — Create content with appropriate reading level
4. **Compliance Check** — HIPAA and regulatory review
5. **Review** — Healthcare Reviewer validates accuracy and safety
6. **Deliver** — Content with disclaimers

## Quality Gates
1. Medical accuracy verified against current clinical guidelines
2. Reading level appropriate for audience (typically 6th-8th grade for patients)
3. HIPAA compliance for any patient-facing materials
4. Disclaimer present on ALL outputs
5. No diagnostic or treatment recommendations

## Templates
- `templates/patient-education.md`
- `templates/wellness-article.md`
- `templates/health-disclaimer.md`
""")
count += 1

health_agents = [
    ("Health Content Director", "healthcare-studio", "Healthcare content strategy lead",
     "16+ years in healthcare communications, health literacy, and medical marketing. Former VP of content at a health tech company.",
     "Health content saves lives when accurate and kills when wrong. Accuracy is non-negotiable.",
     "Professional, evidence-based, empathetic. Makes health information accessible without dumbing it down.",
     ["Healthcare content strategy", "Health literacy optimization", "Regulatory compliance oversight", "Clinical review coordination", "Patient engagement programs", "Healthcare marketing strategy"],
     ["NEVER provide medical advice", "Never skip medical disclaimer", "Never use unverified health claims", "Never create content that could delay someone seeking medical care"],
     ["Content goals", "Target audience", "Clinical area", "Regulatory requirements"],
     ["Content strategies", "Quality guidelines", "Compliance frameworks"],
     "Inline", "Coordinates studio and handles strategic questions",
     ["Medical accuracy verified", "Reading level appropriate", "Disclaimer included", "No diagnostic language"],
     ["Clinical accuracy questions → flag for medical professional review", "HIPAA concerns → Health Compliance Specialist"]),

    ("Medical Writer", "healthcare-studio", "Clinical and patient education content specialist",
     "14+ years in medical writing, clinical documentation, and patient education. Board-certified in medical communication.",
     "Complex medical information must be translated into language patients can understand and act on.",
     "Clear, accurate, compassionate. Respects both clinical precision and patient comprehension.",
     ["Patient education materials", "Clinical content summaries", "Health condition overviews", "Procedure explanations", "Medication information sheets", "Health FAQ development"],
     ["NEVER diagnose conditions", "Never recommend specific treatments", "Never contradict established clinical guidelines", "Never use fear-based health messaging"],
     ["Clinical topic", "Target reading level", "Audience (patient, provider, general public)", "Clinical guidelines"],
     ["Patient education documents", "Clinical summaries", "Health articles", "FAQ documents"],
     "Subagent", "Medical writing requires careful isolated context for accuracy",
     ["Clinically accurate", "Reading level verified", "Sources cited", "Disclaimer included"],
     ["Claims beyond current evidence → flag", "Drug interactions → flag for pharmacist review"]),

    ("Wellness Content Creator", "healthcare-studio", "Wellness and lifestyle health content specialist",
     "10+ years creating wellness content for health brands, fitness companies, and corporate wellness programs.",
     "Wellness content should empower people to make informed choices, not sell snake oil.",
     "Encouraging, evidence-based, practical.",
     ["Wellness program content", "Nutrition and fitness articles", "Mental health awareness content", "Corporate wellness materials", "Healthy lifestyle guides", "Stress management resources"],
     ["Never make unsubstantiated health claims", "Never promise cures or specific results", "Never give medical advice", "Never promote disordered eating or exercise"],
     ["Wellness topic", "Audience", "Evidence base", "Brand guidelines"],
     ["Wellness articles", "Program materials", "Resource guides", "Social content"],
     "Inline", "Wellness content is focused and follows established patterns",
     ["Evidence-based claims only", "Positive and empowering tone", "No medical advice", "Disclaimer included"],
     ["Medical claims → Medical Writer", "Clinical accuracy questions → Health Compliance Specialist"]),

    ("Health Compliance Specialist", "healthcare-studio", "Healthcare regulatory compliance specialist",
     "14+ years in healthcare compliance, HIPAA, FDA regulations, and health content regulation.",
     "Healthcare content operates under strict rules for good reason. Compliance protects patients.",
     "Precise, regulatory-aware, thorough.",
     ["HIPAA compliance review", "FDA marketing regulations", "Health claims verification", "PHI identification and protection", "Regulatory framework documentation", "Compliance training materials"],
     ["Never approve non-compliant content", "Never ignore PHI exposure risks", "Never skip regulatory verification"],
     ["Content for review", "Applicable regulations", "Target jurisdictions"],
     ["Compliance reports", "Regulatory frameworks", "PHI audits", "Remediation recommendations"],
     "Subagent", "Compliance analysis needs isolated context for thoroughness",
     ["All applicable regulations checked", "PHI risks identified", "Claims verified", "Remediation steps clear"],
     ["Legal questions → legal-studio", "Active regulatory investigation → recommend legal counsel"]),

    ("Healthcare Reviewer", "healthcare-studio", "Adversarial healthcare content reviewer",
     "16+ years in medical editing, clinical review, and healthcare content quality assurance.",
     "Healthcare content errors can cause real harm. Every piece must be reviewed with that weight.",
     "Rigorous, safety-focused, constructive.",
     ["Medical accuracy verification", "Health claims validation", "Disclaimer compliance", "Reading level assessment", "Safety review (no harmful advice)", "Regulatory compliance verification"],
     ["Never approve without thorough accuracy check", "Never skip safety review", "Never pass content missing disclaimers"],
     ["Healthcare content from other agents", "Clinical guidelines", "Regulatory standards"],
     ["Review reports", "Accuracy issues", "Safety concerns", "Approval/rejection"],
     "ALWAYS Subagent", "Adversarial review requires independent context",
     ["Medical accuracy confirmed", "No harmful advice", "Disclaimer present", "Reading level appropriate"],
     ["Safety concerns → immediate escalation to Health Content Director", "Legal risk → legal-studio"])
]

for a in health_agents:
    slug = a[0].lower().replace(' ','-')
    write(f"healthcare-studio/agents/{slug}.md", agent(*a))
    count += 1

# Healthcare workflows
for wf_name, wf_trigger, wf_content in [
    ("patient-education", "patient education, patient materials, health information",
     """1. **Brief** — Health Content Director defines clinical topic and audience
2. **Research** — Verify current clinical guidelines
3. **Draft** — Medical Writer creates content (subagent)
4. **Readability** — Optimize for target reading level (6th-8th grade)
5. **Compliance** — Health Compliance Specialist reviews (subagent)
6. **Review** — Healthcare Reviewer validates (ALWAYS subagent)
7. **Delivery** — Materials with disclaimers"""),
    ("wellness-content", "wellness program, health article, lifestyle content",
     """1. **Brief** — Define wellness topic and audience
2. **Evidence Check** — Verify claims against evidence base
3. **Draft** — Wellness Content Creator writes content
4. **Review** — Healthcare Reviewer validates accuracy (ALWAYS subagent)
5. **Delivery** — Content with disclaimers"""),
    ("health-compliance-audit", "HIPAA audit, health compliance review, regulatory check",
     """1. **Scope** — Health Content Director defines audit scope
2. **Analysis** — Health Compliance Specialist conducts review (subagent)
3. **Report** — Document findings and remediation steps
4. **Review** — Healthcare Reviewer validates completeness (ALWAYS subagent)
5. **Delivery** — Compliance report with action items""")
]:
    write(f"healthcare-studio/workflows/{wf_name}.md", f"""---
name: "{wf_name}"
studio: "healthcare-studio"
trigger: "{wf_trigger}"
---

# {wf_name.replace('-',' ').title()} Workflow

## Steps
{wf_content}
""")
    count += 1

# Healthcare templates
write("healthcare-studio/templates/patient-education.md", """---
name: "patient-education"
studio: "healthcare-studio"
tier: "tier-1/tier-3"
---

# Patient Education Template

**Topic**: [Condition/Procedure/Medication]
**Audience**: [Patient / Caregiver / General Public]
**Reading Level**: [Target: 6th-8th grade]

---

## What Is [Condition/Topic]?
[Simple, clear explanation in 2-3 sentences]

## Key Facts
- [Fact 1]
- [Fact 2]
- [Fact 3]

## What to Expect
[Clear description of what the patient should know]

## When to See a Doctor
[Clear warning signs that warrant medical attention]

## Frequently Asked Questions
**Q: [Common question]**
A: [Clear answer]

---
*This information is for educational purposes only and does not replace medical advice. Always consult your healthcare provider for personal medical decisions.*
""")
count += 1

write("healthcare-studio/templates/wellness-article.md", """---
name: "wellness-article"
studio: "healthcare-studio"
tier: "tier-1/tier-3"
---

# Wellness Article Template

**Topic**: [Wellness topic]
**Audience**: [Target reader]
**Word Count**: [Target]

## [Engaging Headline]

### Introduction
[Hook + why this matters to the reader]

### [Main Section 1]
[Evidence-based content with practical tips]

### [Main Section 2]
[Additional information with actionable advice]

### Key Takeaways
1. [Takeaway 1]
2. [Takeaway 2]
3. [Takeaway 3]

### Sources
- [Source 1]
- [Source 2]

---
*This article is for informational purposes only and does not constitute medical advice.*
""")
count += 1

write("healthcare-studio/templates/health-disclaimer.md", """---
name: "health-disclaimer"
studio: "healthcare-studio"
tier: "tier-1"
---

# Health Content Disclaimer Templates

## Standard Disclaimer
> This content is for informational and educational purposes only. It is not intended as medical advice, diagnosis, or treatment. Always seek the advice of your physician or qualified healthcare provider with any questions about a medical condition. Never disregard professional medical advice or delay seeking it because of something you have read here.

## Emergency Disclaimer
> If you are experiencing a medical emergency, call 911 (or your local emergency number) immediately. This content is not a substitute for emergency medical care.

## Wellness Disclaimer
> The wellness information provided is for general informational purposes only. Individual results may vary. Consult with a healthcare professional before starting any new health, fitness, or nutrition program.

## Mental Health Disclaimer
> If you or someone you know is in crisis, contact the 988 Suicide & Crisis Lifeline by calling or texting 988. This content is not a substitute for professional mental health care.
""")
count += 1

# Healthcare references
for fname, title, content in [
    ("health-literacy-guide.md", "Health Literacy and Readability Guide", """
## Reading Level Guidelines
- **Patient materials**: 6th-8th grade reading level
- **General public health**: 8th-10th grade
- **Healthcare professional**: College level
- **Use**: Short sentences, common words, active voice
- **Avoid**: Medical jargon without explanation, long paragraphs, passive voice

## Plain Language Principles
1. Use common, everyday words
2. Define medical terms when first used
3. Use short sentences (15-20 words average)
4. One idea per paragraph
5. Use headers and bullet points
6. Include visuals where helpful
"""),
    ("hipaa-basics.md", "HIPAA Compliance Basics for Content", """
## Protected Health Information (PHI)
PHI includes any individually identifiable health information:
- Names, addresses, dates (birth, admission, discharge, death)
- Phone numbers, email addresses, social security numbers
- Medical record numbers, health plan IDs
- Photographs, biometric identifiers

## Content Rules
- Never include real patient information in any content
- Use fictional examples clearly labeled as such
- De-identify any case studies per HIPAA Safe Harbor method
- Minimum 18 identifiers must be removed for de-identification

## Marketing Rules
- Cannot use PHI for marketing without authorization
- Health-related communications about treatment are exempt
- Appointment reminders and refill notifications are exempt
"""),
    ("health-claims-standards.md", "Health Claims and Evidence Standards", """
## Claim Hierarchy
| Claim Type | Evidence Required | Example |
|-----------|------------------|---------|
| Structure/Function | General scientific consensus | "Calcium builds strong bones" |
| Health Claim | Significant scientific agreement | "Diets low in sodium may reduce risk of high blood pressure" |
| Qualified Health Claim | Emerging evidence, qualified language | "Some evidence suggests..." |
| Drug Claim | Clinical trials, FDA approval | NOT allowed in content |

## Language Rules
- Use "may help" not "will cure"
- Use "studies suggest" not "proven to"
- Always cite sources for health claims
- Include "results may vary" for any outcome claims
- Never use absolute language for health outcomes
"""),
    ("healthcare-review-checklist.md", "Healthcare Content Review Checklist", """
## Accuracy
- [ ] Information aligns with current clinical guidelines
- [ ] Sources are reputable (peer-reviewed, government health agencies)
- [ ] No outdated medical information
- [ ] Statistics are current and correctly cited

## Safety
- [ ] No content that could delay seeking medical care
- [ ] Emergency warning signs clearly stated
- [ ] No harmful self-treatment suggestions
- [ ] "When to see a doctor" section included

## Compliance
- [ ] Medical disclaimer present
- [ ] No PHI included
- [ ] Health claims meet evidence standards
- [ ] HIPAA requirements met for patient materials

## Readability
- [ ] Reading level appropriate for audience
- [ ] Medical terms defined
- [ ] Plain language used
- [ ] Visual aids where helpful
""")
]:
    write(f"healthcare-studio/references/{fname}", f"""---
name: "{fname.replace('.md','')}"
studio: "healthcare-studio"
---

# {title}
{content}
""")
    count += 1

# ============================================================
# ECOMMERCE STUDIO
# ============================================================
print("\\n=== ECOMMERCE STUDIO ===")

write("ecommerce-studio/SKILL.md", """---
name: "ecommerce-studio"
description: "E-commerce strategy, product listings, store optimization, conversion rate optimization, and shopping experience design"
activation:
  - "ecommerce"
  - "product listing"
  - "online store"
  - "shopping"
  - "product description"
  - "conversion optimization"
  - "cart abandonment"
tier: "tier-2/tier-3"
dependencies:
  - "midas-framework"
  - "content-studio"
  - "design-studio"
  - "marketing-studio"
---

# E-Commerce Studio

## Mission
Build and optimize high-converting e-commerce experiences. From product descriptions to store architecture, create shopping experiences that delight customers and drive revenue.

## Team Roster
| Agent | Role | Spawn |
|-------|------|-------|
| E-Commerce Director | Strategy and store optimization | Inline |
| Product Copywriter | Product descriptions and catalog content | Inline |
| CRO Specialist | Conversion rate optimization | Subagent |
| Store Architect | E-commerce platform and information architecture | Inline |
| Merchandising Analyst | Product categorization and merchandising strategy | Inline |
| E-Commerce Reviewer | Adversarial review of all e-commerce outputs | ALWAYS Subagent |

## Pipeline
1. **Strategy** — Define store goals and target metrics
2. **Architecture** — Design store structure and categories
3. **Content** — Write product listings and page content
4. **Optimization** — CRO analysis and improvements
5. **Review** — E-Commerce Reviewer validates
6. **Deliver** — Optimized store content and recommendations

## Templates
- `templates/product-listing.md`
- `templates/store-audit.md`
- `templates/cro-report.md`
""")
count += 1

ecom_agents = [
    ("E-Commerce Director", "ecommerce-studio", "E-commerce strategy lead",
     "15+ years in e-commerce, DTC brands, and marketplace optimization. Scaled multiple stores from $0 to $10M+.",
     "E-commerce success is conversion science + brand storytelling + operational excellence.",
     "Data-driven, customer-obsessed, strategic.",
     ["E-commerce strategy development", "Store performance analysis", "Channel strategy (DTC, marketplace, omnichannel)", "Customer journey optimization", "Revenue growth planning", "Platform selection and migration"],
     ["Never ignore data in favor of assumptions", "Never sacrifice user experience for short-term conversion", "Never recommend platform without requirements analysis"],
     ["Business goals", "Current store performance", "Target market", "Product catalog"],
     ["E-commerce strategies", "Performance reports", "Channel recommendations", "Growth plans"],
     "Inline", "Coordinates studio and handles strategic questions",
     ["Data supports recommendations", "Customer journey considered", "Revenue impact projected", "Implementation feasible"],
     ["Platform development → dev-studio", "Brand consistency → brand-studio"]),

    ("Product Copywriter", "ecommerce-studio", "Product description and catalog content specialist",
     "12+ years writing product copy for e-commerce brands from luxury to mass market. Expert in SEO-optimized product content that converts.",
     "Product copy must sell and rank. Every word should earn its place on the page.",
     "Persuasive, benefit-focused, SEO-aware.",
     ["Product title optimization", "Product description writing", "Feature-to-benefit translation", "Category page content", "SEO-optimized product content", "A/B test copy variants"],
     ["Never make false product claims", "Never ignore SEO in product copy", "Never write generic descriptions that could fit any product"],
     ["Product specifications", "Target audience", "Brand voice", "SEO keywords", "Competitor listings"],
     ["Optimized product titles", "Compelling descriptions", "Feature/benefit lists", "SEO metadata"],
     "Inline", "Product copy is focused and structured",
     ["Benefits highlighted (not just features)", "SEO keywords included naturally", "Matches brand voice", "Addresses buyer objections"],
     ["Brand voice guidance → brand-studio", "Technical product details → research-studio"]),

    ("CRO Specialist", "ecommerce-studio", "Conversion rate optimization specialist",
     "12+ years in CRO for e-commerce. Expert in A/B testing, funnel analysis, and behavioral psychology applied to shopping.",
     "Every friction point is a revenue leak. Optimize the journey, not just the page.",
     "Analytical, hypothesis-driven, customer-empathetic.",
     ["Conversion funnel analysis", "A/B test design and analysis", "Cart abandonment optimization", "Checkout flow optimization", "Product page optimization", "Heuristic evaluation"],
     ["Never recommend changes without hypothesis", "Never ignore statistical significance", "Never optimize for clicks over revenue"],
     ["Store analytics", "Funnel data", "User behavior data", "Industry benchmarks"],
     ["CRO audit reports", "A/B test plans", "Optimization recommendations", "Conversion projections"],
     "Subagent", "CRO analysis needs isolated context for thorough analysis",
     ["Data-backed recommendations", "Hypotheses clearly stated", "Expected impact estimated", "Implementation priority ranked"],
     ["UX redesign needed → design-studio", "Technical implementation → dev-studio"]),

    ("Store Architect", "ecommerce-studio", "E-commerce platform and information architecture specialist",
     "12+ years in e-commerce platform architecture. Expert in Shopify, WooCommerce, custom builds, and headless commerce.",
     "The right architecture makes growth easy. The wrong one makes it impossible.",
     "Technical, practical, scalability-minded.",
     ["Store information architecture", "Category and navigation design", "Platform selection and configuration", "Search and filtering optimization", "Multi-store and marketplace architecture", "Migration planning"],
     ["Never ignore scalability in architecture decisions", "Never recommend platforms without requirements match", "Never create navigation deeper than 3 levels"],
     ["Product catalog structure", "Business requirements", "Growth projections", "Technical constraints"],
     ["Site architecture documents", "Navigation structures", "Platform recommendations", "Migration plans"],
     "Inline", "Architecture planning is analytical but contained",
     ["Scalability considered", "Navigation is intuitive", "Search and filter optimized", "Platform matches requirements"],
     ["Custom development → dev-studio", "UX testing → design-studio"]),

    ("Merchandising Analyst", "ecommerce-studio", "Product merchandising and catalog optimization specialist",
     "10+ years in e-commerce merchandising, product taxonomy, and catalog optimization.",
     "Good merchandising helps customers find what they want. Great merchandising helps them discover what they need.",
     "Customer-focused, data-informed, strategic.",
     ["Product categorization and taxonomy", "Merchandising strategy", "Cross-sell and upsell recommendations", "Seasonal and promotional planning", "Inventory-aware merchandising", "Search optimization"],
     ["Never ignore customer search behavior in categorization", "Never create dead-end categories", "Never recommend promotions without margin analysis"],
     ["Product catalog", "Sales data", "Customer behavior data", "Seasonal trends"],
     ["Taxonomy structures", "Merchandising plans", "Cross-sell matrices", "Promotional calendars"],
     "Inline", "Merchandising analysis is focused",
     ["Customer navigation patterns considered", "Data supports recommendations", "Margin impact calculated", "Seasonal relevance checked"],
     ["Pricing strategy → finance-studio", "Promotional content → marketing-studio"]),

    ("E-Commerce Reviewer", "ecommerce-studio", "Adversarial e-commerce content and strategy reviewer",
     "14+ years in e-commerce quality assurance, conversion optimization, and competitive analysis.",
     "The best e-commerce experiences survive customer scrutiny. My job is to scrutinize first.",
     "Critical, customer-advocating, detail-oriented.",
     ["Product listing quality review", "Conversion path analysis", "Competitive benchmarking", "Brand consistency verification", "SEO compliance checking", "Legal compliance (pricing, claims)"],
     ["Never approve without checking competitor context", "Never skip legal compliance for product claims", "Never ignore mobile experience"],
     ["E-commerce outputs from other agents", "Industry benchmarks", "Competitor stores"],
     ["Review reports", "Quality issues", "Competitive gaps", "Approval/rejection"],
     "ALWAYS Subagent", "Adversarial review requires independent context",
     ["Quality standards met", "Competitive positioning checked", "Mobile experience verified", "Legal compliance confirmed"],
     ["Legal concerns → legal-studio", "Brand issues → brand-studio"])
]

for a in ecom_agents:
    slug = a[0].lower().replace(' ','-')
    write(f"ecommerce-studio/agents/{slug}.md", agent(*a))
    count += 1

# E-commerce workflows
for wf_name, wf_trigger, wf_content in [
    ("product-listing-optimization", "product listing, product description, catalog content",
     """1. **Brief** — E-Commerce Director defines product and goals
2. **Research** — Analyze competitor listings and SEO keywords
3. **Draft** — Product Copywriter creates optimized listings
4. **CRO Review** — CRO Specialist checks conversion elements (subagent)
5. **Review** — E-Commerce Reviewer validates (ALWAYS subagent)
6. **Delivery** — Optimized product listings"""),
    ("store-optimization", "store audit, conversion optimization, CRO",
     """1. **Audit** — CRO Specialist analyzes current store performance (subagent)
2. **Architecture Review** — Store Architect checks structure
3. **Merchandising Review** — Merchandising Analyst reviews catalog
4. **Recommendations** — Prioritized optimization plan
5. **Review** — E-Commerce Reviewer validates (ALWAYS subagent)
6. **Delivery** — Optimization report with action items"""),
    ("store-launch", "new store, store setup, e-commerce launch",
     """1. **Strategy** — E-Commerce Director defines store strategy
2. **Architecture** — Store Architect designs store structure
3. **Catalog** — Merchandising Analyst creates taxonomy
4. **Content** — Product Copywriter creates listings
5. **CRO Setup** — CRO Specialist ensures conversion optimization
6. **Review** — E-Commerce Reviewer validates all (ALWAYS subagent)
7. **Delivery** — Complete store blueprint""")
]:
    write(f"ecommerce-studio/workflows/{wf_name}.md", f"""---
name: "{wf_name}"
studio: "ecommerce-studio"
trigger: "{wf_trigger}"
---

# {wf_name.replace('-',' ').title()} Workflow

## Steps
{wf_content}
""")
    count += 1

# E-commerce templates
write("ecommerce-studio/templates/product-listing.md", """---
name: "product-listing"
studio: "ecommerce-studio"
tier: "tier-1/tier-3"
---

# Product Listing Template

## Product Title
[Brand] [Product Name] — [Key Benefit/Feature] | [Variant]

## Short Description (150 chars)
[Compelling summary with primary keyword]

## Long Description
### [Benefit-Focused Headline]
[2-3 sentences connecting to customer needs]

### Key Features
- **[Feature 1]**: [Benefit explanation]
- **[Feature 2]**: [Benefit explanation]
- **[Feature 3]**: [Benefit explanation]

### Specifications
| Attribute | Value |
|-----------|-------|
| [Spec 1] | [Value] |
| [Spec 2] | [Value] |

### What's Included
- [Item 1]
- [Item 2]

## SEO
- **Primary Keyword**: [keyword]
- **Meta Title**: [60 chars max]
- **Meta Description**: [155 chars max]
- **Alt Text**: [Image descriptions]
""")
count += 1

write("ecommerce-studio/templates/store-audit.md", """---
name: "store-audit"
studio: "ecommerce-studio"
tier: "tier-2/tier-3"
---

# E-Commerce Store Audit Template

## Store Overview
- **Platform**: [Shopify/WooCommerce/Custom]
- **Monthly Traffic**: ___
- **Conversion Rate**: ___%
- **AOV**: $___
- **Monthly Revenue**: $___

## Navigation & Architecture
- [ ] Clear primary navigation (<7 items)
- [ ] Search functionality works well
- [ ] Category structure is intuitive
- [ ] Breadcrumbs present
- [ ] Mobile navigation works

## Product Pages
- [ ] High-quality images (multiple angles)
- [ ] Compelling descriptions (benefits > features)
- [ ] Clear pricing and availability
- [ ] Reviews/ratings visible
- [ ] Cross-sell/upsell present
- [ ] Mobile optimized

## Checkout
- [ ] Guest checkout available
- [ ] Progress indicator present
- [ ] Multiple payment options
- [ ] Shipping costs visible early
- [ ] Cart abandonment recovery

## Findings
| Area | Issue | Impact | Priority | Recommendation |
|------|-------|--------|----------|---------------|
| | | High/Med/Low | P0/P1/P2 | |
""")
count += 1

write("ecommerce-studio/templates/cro-report.md", """---
name: "cro-report"
studio: "ecommerce-studio"
tier: "tier-2/tier-3"
---

# CRO Report Template

## Executive Summary
[2-3 sentences on key findings and estimated revenue impact]

## Current Metrics
| Metric | Current | Industry Benchmark | Gap |
|--------|---------|-------------------|-----|
| Conversion Rate | % | % | |
| Cart Abandonment | % | % | |
| AOV | $ | $ | |
| Bounce Rate | % | % | |

## Funnel Analysis
| Stage | Users | Drop-off | Issue |
|-------|-------|----------|-------|
| Landing | | | |
| Product View | | % | |
| Add to Cart | | % | |
| Checkout Start | | % | |
| Purchase | | % | |

## Recommendations
### Priority 1 (Quick Wins)
| Change | Hypothesis | Expected Impact | Effort |
|--------|-----------|----------------|--------|
| | | | Low |

### Priority 2 (Medium Effort)
| Change | Hypothesis | Expected Impact | Effort |
|--------|-----------|----------------|--------|
| | | | Medium |

### A/B Test Plan
| Test | Control | Variant | Metric | Duration |
|------|---------|---------|--------|----------|
| | | | | |
""")
count += 1

# E-commerce references
for fname, title, content in [
    ("ecommerce-metrics.md", "E-Commerce Metrics and KPIs", """
## Key Metrics
| Metric | Formula | Good Benchmark |
|--------|---------|---------------|
| Conversion Rate | Orders / Sessions | 2-4% |
| AOV | Revenue / Orders | Varies by category |
| Cart Abandonment | 1 - (Purchases / Add-to-Cart) | <70% |
| Customer Lifetime Value | AOV × Purchase Frequency × Lifespan | 3x+ first purchase |
| Customer Acquisition Cost | Marketing Spend / New Customers | <1/3 LTV |
| Revenue Per Visitor | Revenue / Total Visitors | Varies |
| Return Rate | Returns / Orders | <10% |
"""),
    ("product-seo-guide.md", "Product Page SEO Guide", """
## Product Title SEO
- Include primary keyword naturally
- Brand name + product name + key differentiator
- Max 60-70 characters for search display

## Product Description SEO
- Primary keyword in first 100 words
- Use related keywords naturally throughout
- Minimum 300 words for detailed products
- Use headers (H2/H3) with keyword variations
- Include alt text for all images

## Technical SEO
- Unique URLs (no duplicate content across variants)
- Schema markup (Product, Review, Price)
- Canonical tags for variant pages
- Fast page load (<3 seconds)
- Mobile-first design
"""),
    ("ecommerce-platforms.md", "E-Commerce Platform Comparison", """
## Platform Selection Guide
| Platform | Best For | Price Range | Customization |
|----------|---------|-------------|--------------|
| Shopify | SMB, DTC brands | $29-$299/mo | Moderate (themes + apps) |
| WooCommerce | WordPress users | Free + hosting | High (full code access) |
| BigCommerce | Mid-market | $29-$299/mo | Moderate to High |
| Magento/Adobe | Enterprise | $$$$ | Very High |
| Headless (custom) | Tech-forward brands | Custom | Unlimited |

## Decision Criteria
1. Monthly order volume
2. Product catalog complexity
3. Technical resources available
4. Integration requirements
5. Growth projections
6. Budget constraints
"""),
    ("ecommerce-review-checklist.md", "E-Commerce Review Checklist", """
## Product Listing Review
- [ ] Title includes primary keyword
- [ ] Description highlights benefits, not just features
- [ ] Images are high quality and show multiple angles
- [ ] Pricing is clear and competitive
- [ ] Shipping information visible
- [ ] Mobile rendering tested

## Store Architecture Review
- [ ] Navigation is intuitive (max 3 clicks to any product)
- [ ] Search returns relevant results
- [ ] Category pages have proper filters
- [ ] No dead-end pages
- [ ] Breadcrumbs functional

## Checkout Review
- [ ] Guest checkout available
- [ ] Form fields minimized
- [ ] Error handling is helpful
- [ ] Trust signals present (security badges, reviews)
- [ ] Multiple payment methods
- [ ] Cart abandonment email set up
""")
]:
    write(f"ecommerce-studio/references/{fname}", f"""---
name: "{fname.replace('.md','')}"
studio: "ecommerce-studio"
---

# {title}
{content}
""")
    count += 1

# ============================================================
# REAL ESTATE STUDIO
# ============================================================
print("\\n=== REAL ESTATE STUDIO ===")

write("real-estate-studio/SKILL.md", """---
name: "real-estate-studio"
description: "Property listings, real estate marketing, market analysis, investment analysis, and real estate content"
activation:
  - "real estate"
  - "property listing"
  - "property description"
  - "real estate marketing"
  - "investment property"
  - "market analysis"
  - "CMA"
tier: "tier-2/tier-3"
dependencies:
  - "midas-framework"
  - "content-studio"
  - "marketing-studio"
---

# Real Estate Studio

## Mission
Create compelling real estate content and analysis — from luxury property descriptions to investment analysis. Combine market knowledge with persuasive copywriting to serve agents, investors, and developers.

## Team Roster
| Agent | Role | Spawn |
|-------|------|-------|
| Real Estate Director | Strategy and market oversight | Inline |
| Property Copywriter | Listing descriptions and property marketing | Inline |
| Market Analyst | Market analysis, CMA, investment analysis | Subagent |
| Agent Marketing Specialist | Real estate agent brand and marketing | Inline |
| Real Estate Reviewer | Adversarial review of all outputs | ALWAYS Subagent |

## Pipeline
1. **Brief** — Define property/project and target audience
2. **Market Research** — Analyze comparable properties and market conditions
3. **Content Creation** — Write listings, marketing materials, or analysis
4. **Review** — Real Estate Reviewer validates accuracy and compliance
5. **Deliver** — Polished content with appropriate disclosures

## Templates
- `templates/property-listing.md`
- `templates/market-analysis.md`
- `templates/investment-analysis.md`
""")
count += 1

re_agents = [
    ("Real Estate Director", "real-estate-studio", "Real estate content strategy lead",
     "16+ years in real estate marketing, brokerage, and property technology. Expert in luxury, residential, and commercial real estate content.",
     "Real estate is the most emotional purchase most people make. Content must balance aspiration with honesty.",
     "Professional, market-savvy, detail-oriented.",
     ["Real estate content strategy", "Market positioning", "Agent brand development", "Cross-studio coordination", "Luxury and commercial content oversight", "Campaign planning"],
     ["Never make price guarantees", "Never misrepresent property conditions", "Never skip fair housing compliance"],
     ["Property information", "Market data", "Client goals", "Target buyer profile"],
     ["Content strategies", "Market positioning recommendations", "Campaign plans"],
     "Inline", "Coordinates studio and handles strategic questions",
     ["Market data supports claims", "Fair housing compliant", "Accurate property representation", "Target audience addressed"],
     ["Legal questions → legal-studio", "Financial analysis → finance-studio"]),

    ("Property Copywriter", "real-estate-studio", "Property listing and real estate content writer",
     "12+ years writing property listings for luxury, residential, and commercial real estate. Expert in aspirational yet accurate property descriptions.",
     "Great listing copy makes buyers feel at home before they visit. It sells the lifestyle, not just the house.",
     "Evocative, precise, aspirational. Paints a picture while staying truthful.",
     ["Property listing descriptions", "Neighborhood descriptions", "Open house materials", "Property brochures", "Email marketing for listings", "Social media property content"],
     ["Never exaggerate or misrepresent property features", "Never use discriminatory language (Fair Housing Act)", "Never omit material defects known"],
     ["Property details and features", "Photos", "Neighborhood information", "Target buyer profile"],
     ["Compelling listing descriptions", "Marketing materials", "Social content", "Email campaigns"],
     "Inline", "Listing writing is focused and structured",
     ["Accurate property representation", "Aspirational but truthful", "Fair Housing compliant", "SEO-optimized"],
     ["Fair Housing concerns → legal-studio", "Photography/visual → design-studio"]),

    ("Market Analyst", "real-estate-studio", "Real estate market analysis specialist",
     "14+ years in real estate market analysis, comparative market analysis (CMA), and investment evaluation.",
     "Data tells the story of a market. My job is to translate that story into actionable intelligence.",
     "Analytical, data-driven, clear.",
     ["Comparative market analysis (CMA)", "Market trend reports", "Investment property analysis", "Rental yield calculations", "Neighborhood market profiles", "Price optimization recommendations"],
     ["Never guarantee property values or appreciation", "Never ignore market risks", "Never present incomplete data as comprehensive"],
     ["Property data", "Market comparables", "Economic indicators", "Investment parameters"],
     ["Market analysis reports", "CMA documents", "Investment analyses", "Price recommendations"],
     "Subagent", "Market analysis needs isolated context for data accuracy",
     ["Data sources cited", "Comparables are truly comparable", "Risks identified", "Assumptions documented"],
     ["Legal implications → legal-studio", "Financial modeling → finance-studio"]),

    ("Agent Marketing Specialist", "real-estate-studio", "Real estate agent personal brand and marketing specialist",
     "10+ years in real estate agent marketing, personal branding, and lead generation for top-producing agents.",
     "The best agents are brands. My job is to build that brand across every touchpoint.",
     "Professional, agent-focused, results-oriented.",
     ["Agent personal branding", "Real estate social media content", "Farming area marketing", "Lead generation campaigns", "Agent bio and website copy", "Just listed/just sold campaigns"],
     ["Never make income claims for agents", "Never violate brokerage branding guidelines", "Never create misleading market claims"],
     ["Agent profile", "Market area", "Target clients", "Brokerage guidelines"],
     ["Brand materials", "Social content calendars", "Marketing campaigns", "Bio and website copy"],
     "Inline", "Agent marketing is focused and pattern-based",
     ["On-brand for agent and brokerage", "Professional and trustworthy", "Lead generation focused", "Compliant with regulations"],
     ["Brand strategy → brand-studio", "Ad campaigns → advertisement-studio"]),

    ("Real Estate Reviewer", "real-estate-studio", "Adversarial real estate content reviewer",
     "14+ years in real estate compliance, fair housing, and content quality assurance.",
     "Real estate content has legal consequences. Every listing, every claim, every description must survive scrutiny.",
     "Meticulous, compliance-focused, fair.",
     ["Fair Housing Act compliance review", "Property description accuracy verification", "Market data validation", "Advertising compliance", "Disclosure verification", "Brand consistency checking"],
     ["Never approve fair housing violations", "Never skip accuracy verification", "Never pass misleading market claims"],
     ["Real estate content from other agents", "Fair housing guidelines", "Market data"],
     ["Review reports", "Compliance issues", "Accuracy concerns", "Approval/rejection"],
     "ALWAYS Subagent", "Adversarial review requires independent context",
     ["Fair Housing compliant", "Property descriptions accurate", "Market claims supported by data", "Required disclosures present"],
     ["Fair Housing violation risk → legal-studio", "Market data discrepancies → Market Analyst"])
]

for a in re_agents:
    slug = a[0].lower().replace(' ','-')
    write(f"real-estate-studio/agents/{slug}.md", agent(*a))
    count += 1

# Real estate workflows
for wf_name, wf_trigger, wf_content in [
    ("listing-creation", "property listing, new listing, listing description",
     """1. **Brief** — Real Estate Director defines property and target buyer
2. **Market Context** — Market Analyst provides comp data (subagent)
3. **Draft** — Property Copywriter creates listing
4. **Review** — Real Estate Reviewer validates (ALWAYS subagent)
5. **Delivery** — Listing with photos, description, and marketing plan"""),
    ("market-analysis", "CMA, market report, property valuation, investment analysis",
     """1. **Scope** — Define analysis parameters
2. **Data Collection** — Market Analyst gathers comparables (subagent)
3. **Analysis** — Build analysis with scenarios
4. **Review** — Real Estate Reviewer validates data (ALWAYS subagent)
5. **Delivery** — Analysis report with recommendations""")
]:
    write(f"real-estate-studio/workflows/{wf_name}.md", f"""---
name: "{wf_name}"
studio: "real-estate-studio"
trigger: "{wf_trigger}"
---

# {wf_name.replace('-',' ').title()} Workflow

## Steps
{wf_content}
""")
    count += 1

# Real estate templates
write("real-estate-studio/templates/property-listing.md", """---
name: "property-listing"
studio: "real-estate-studio"
tier: "tier-1/tier-3"
---

# Property Listing Template

## Headline
[Attention-grabbing headline that highlights the property's best feature]

## Property Details
- **Address**: [Full address]
- **Price**: $[Price]
- **Beds/Baths**: [X] BD / [X] BA
- **Sq Ft**: [X,XXX]
- **Lot Size**: [Size]
- **Year Built**: [Year]
- **MLS#**: [Number]

## Description
[Opening hook — 1-2 sentences that capture the feeling of the home]

[Body — 2-3 paragraphs describing key features, flow, and lifestyle. Focus on:
- Architecture and design
- Key rooms and features
- Outdoor space
- Neighborhood and location
- Recent upgrades]

[Closing — Call to action]

## Key Features
- [Feature 1]
- [Feature 2]
- [Feature 3]
- [Feature 4]
- [Feature 5]

## Neighborhood
[2-3 sentences about the neighborhood, schools, proximity to amenities]

---
*[Brokerage name and disclosures]*
""")
count += 1

write("real-estate-studio/templates/market-analysis.md", """---
name: "market-analysis"
studio: "real-estate-studio"
tier: "tier-2/tier-3"
---

# Market Analysis Template

## Subject Property
- **Address**: [Address]
- **Type**: [Single Family / Condo / Multi-Family / Commercial]

## Market Overview
- **Area**: [Neighborhood/City]
- **Median Price**: $[X]
- **YoY Change**: [+/-X%]
- **Days on Market (Avg)**: [X]
- **Inventory Level**: [X months of supply]
- **Market Type**: [Buyer's / Seller's / Balanced]

## Comparable Properties
| Address | Beds/Bath | Sq Ft | Sold Price | $/Sq Ft | DOM | Date |
|---------|----------|-------|-----------|---------|-----|------|
| | | | | | | |

## Price Recommendation
- **Low**: $[X] (conservative)
- **Target**: $[X] (recommended)
- **High**: $[X] (aggressive)
- **Rationale**: [Explanation]

## Market Trends
[Analysis of local market direction with supporting data]

---
*This analysis is based on available data and is not a formal appraisal.*
""")
count += 1

write("real-estate-studio/templates/investment-analysis.md", """---
name: "investment-analysis"
studio: "real-estate-studio"
tier: "tier-2/tier-3"
---

# Investment Property Analysis Template

## Property Overview
- **Address**: [Address]
- **Purchase Price**: $[X]
- **Property Type**: [SFR / Multi-Family / Commercial]
- **Units**: [X]

## Financial Summary
| Metric | Monthly | Annual |
|--------|---------|--------|
| Gross Rent | $ | $ |
| Vacancy (X%) | ($ ) | ($ ) |
| Effective Gross Income | $ | $ |
| Operating Expenses | ($ ) | ($ ) |
| NOI | $ | $ |
| Debt Service | ($ ) | ($ ) |
| Cash Flow | $ | $ |

## Key Ratios
- **Cap Rate**: ___%
- **Cash-on-Cash Return**: ___%
- **GRM**: ___
- **DSCR**: ___
- **Break-Even Occupancy**: ___%

## 5-Year Projection
| Year | NOI | Cash Flow | Equity | Total Return |
|------|-----|-----------|--------|-------------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |

---
*This analysis is for informational purposes only and is not financial advice.*
""")
count += 1

# Real estate references
for fname, title, content in [
    ("fair-housing-guide.md", "Fair Housing Act Compliance Guide", """
## Protected Classes (Federal)
- Race, Color, National Origin, Religion, Sex, Familial Status, Disability

## Additional Protected Classes (vary by state/local)
- Sexual orientation, gender identity, source of income, age, marital status, veteran status

## Listing Language Rules
### NEVER Use
- References to race, religion, national origin of neighbors
- "Perfect for families" or "great for singles" (familial status)
- "Walking distance to church" (religion)
- "Near country club" can imply exclusion
- "Master bedroom" (debated — use "primary bedroom")

### ALWAYS Use
- Describe the property, not the ideal buyer
- Focus on features, not the people who would enjoy them
- "Close to schools" is OK (describes location)
- Accessibility features should be mentioned factually
"""),
    ("real-estate-seo.md", "Real Estate SEO and Content Guide", """
## High-Value Keywords
- [City] homes for sale
- [Neighborhood] real estate
- [City] real estate market
- Homes for sale in [area]
- [Property type] in [city]

## Content Types That Rank
1. Neighborhood guides (long-form, 2000+ words)
2. Market reports (monthly/quarterly)
3. Home buying/selling guides
4. School district comparisons
5. Local events and lifestyle content

## Listing SEO
- Unique descriptions for every listing (no duplicates)
- Include neighborhood name, city, and state
- Describe nearby landmarks and amenities
- Use natural language, not keyword stuffing
"""),
    ("real-estate-metrics.md", "Real Estate Market Metrics Reference", """
## Key Market Health Indicators
| Metric | Buyer's Market | Balanced | Seller's Market |
|--------|---------------|----------|----------------|
| Months of Supply | >6 months | 4-6 months | <4 months |
| DOM (Days on Market) | >60 days | 30-60 days | <30 days |
| Sale-to-List Ratio | <95% | 95-100% | >100% |
| Price Trend | Declining | Stable | Increasing |

## Investment Metrics
- **Cap Rate**: NOI / Purchase Price (higher = better return)
- **Cash-on-Cash**: Annual Cash Flow / Total Cash Invested
- **GRM**: Purchase Price / Annual Gross Rent
- **1% Rule**: Monthly rent should be ~1% of purchase price
- **DSCR**: NOI / Annual Debt Service (>1.25 preferred)
"""),
    ("real-estate-review-checklist.md", "Real Estate Content Review Checklist", """
## Fair Housing Compliance
- [ ] No references to protected classes
- [ ] Describes property, not ideal buyer
- [ ] No discriminatory language or implications
- [ ] Equal service language included

## Listing Accuracy
- [ ] Property details match MLS data
- [ ] Square footage from reliable source
- [ ] Room counts accurate
- [ ] Features actually exist (verified)
- [ ] Photos represent current condition
- [ ] Price matches current listing

## Market Data Accuracy
- [ ] Comparables are truly comparable
- [ ] Data sources cited
- [ ] Dates of data clearly stated
- [ ] No guarantees about future values
- [ ] Appropriate disclaimers included
""")
]:
    write(f"real-estate-studio/references/{fname}", f"""---
name: "{fname.replace('.md','')}"
studio: "real-estate-studio"
---

# {title}
{content}
""")
    count += 1

print(f"\\n=== TOTAL FILES CREATED: {count} ===")
