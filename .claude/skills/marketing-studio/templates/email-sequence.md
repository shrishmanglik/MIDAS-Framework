# Email Sequence Template

Use this template to design a complete email lifecycle sequence.

---

## Sequence: [Sequence Name]

### Sequence Meta
- **Type**: [onboarding / nurture / conversion / retention / win-back / announcement]
- **Trigger**: [What event starts this sequence]
- **Audience**: [Who receives these emails]
- **Goal**: [Measurable outcome — e.g., "60% chart generation rate"]
- **Duration**: [Total days from first to last email]
- **Total Emails**: [count]
- **From Name**: [sender name]
- **From Email**: [sender@domain.com]
- **Reply-To**: [reply email, ideally monitored]

### Exit Conditions
- [Condition 1: e.g., "User completes target action"]
- [Condition 2: e.g., "User unsubscribes"]
- [Condition 3: e.g., "User upgrades to paid"]

---

## Sequence Timeline

| # | Day | Email Name | Goal | Send Condition |
|---|-----|-----------|------|---------------|
| 1 | 0 | [name] | [what this email should accomplish] | [trigger/condition] |
| 2 | [X] | [name] | [goal] | [condition — e.g., "has NOT done X"] |
| 3 | [X] | [name] | [goal] | [condition] |
| 4 | [X] | [name] | [goal] | [condition] |
| 5 | [X] | [name] | [goal] | [condition] |

---

## Email 1: [Name]

### Metadata
- **Send**: [Day X / immediately / conditional]
- **Subject**: `[subject line]` ([X] chars)
- **Preview Text**: `[preview text]` ([X] chars)
- **Skip If**: [condition to skip this email]

### Subject Line A/B Test
- **A**: `[variation A]`
- **B**: `[variation B]`

### Body

```
[Complete email body]

[Use {first_name} for personalization]
[Use {product_name} for product references]
[Keep under 200 words for action-oriented emails]
[Can be longer for educational/nurture emails]
```

### CTA
- **Primary**: `[Button text]` → [URL]
- **Secondary** (optional): `[Link text]` → [URL]

### Design Notes
- [HTML template or plain text]
- [Single column width: 600px max]
- [CTA button: prominent color, 44px+ height]

---

## Email 2: [Name]

(Same structure as Email 1)

---

## Email 3: [Name]

(Same structure as Email 1)

---

## Email 4: [Name]

(Same structure as Email 1)

---

## Email 5: [Name]

(Same structure as Email 1)

---

## Personalization Variables

| Variable | Source | Fallback |
|----------|--------|----------|
| `{first_name}` | User profile | "there" |
| `{product_name}` | Config | "[Product]" |
| `{signup_date}` | Database | — |
| `{plan_name}` | Subscription | "free" |
| `{custom_variable}` | [source] | [fallback] |

---

## Segmentation Rules

| Segment | Criteria | Content Variation |
|---------|----------|------------------|
| [Segment A] | [criteria] | [how email differs for this segment] |
| [Segment B] | [criteria] | [how email differs] |

---

## Metrics & Targets

| Metric | Target | Industry Benchmark |
|--------|--------|-------------------|
| Open Rate (Email 1) | > [X]% | [benchmark]% |
| Open Rate (Emails 2-N) | > [X]% | [benchmark]% |
| Click Rate (Email 1) | > [X]% | [benchmark]% |
| Click Rate (Emails 2-N) | > [X]% | [benchmark]% |
| Sequence Conversion | > [X]% | [benchmark]% |
| Unsubscribe Rate | < [X]% per email | < 0.5% |

---

## Deliverability Checklist

- [ ] Subject lines avoid spam triggers (ALL CAPS, "FREE!!!", "Act Now")
- [ ] Text-to-image ratio is at least 60:40
- [ ] Unsubscribe link present in every email
- [ ] Physical mailing address included (CAN-SPAM compliance)
- [ ] SPF, DKIM, and DMARC configured for sending domain
- [ ] Reply-to address is monitored
- [ ] List hygiene: remove bounced/invalid addresses

---

## Post-Sequence Logic

| Outcome | Next Action |
|---------|-------------|
| User completed goal | Enter [next sequence name] |
| User opened but didn't convert | Enter [re-engagement sequence] |
| User never opened | Add to [cold re-engagement list] |
| User unsubscribed | Remove from all sequences |
