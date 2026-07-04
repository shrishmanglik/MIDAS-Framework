# Analytics KPIs Reference

Key metrics, definitions, benchmarks, and measurement approaches for marketing analytics.

---

## Core Business Metrics

| Metric | Formula | What It Means | Good Benchmark (SaaS) |
|--------|---------|--------------|----------------------|
| **MRR** (Monthly Recurring Revenue) | Sum of all active subscriptions | Total predictable monthly revenue | Growing 10-15% MoM early stage |
| **ARR** (Annual Recurring Revenue) | MRR x 12 | Annualized revenue run rate | — |
| **ARPU** (Avg Revenue Per User) | MRR / Active paying users | How much each customer pays | Depends on pricing ($10-100 typical) |
| **LTV** (Lifetime Value) | ARPU / Monthly churn rate | Total revenue from a customer over their lifetime | > 3x CAC |
| **CAC** (Customer Acquisition Cost) | Total marketing spend / New customers | Cost to acquire one paying customer | LTV:CAC ratio > 3:1 |
| **LTV:CAC Ratio** | LTV / CAC | Marketing efficiency | 3:1 minimum, 5:1+ ideal |
| **Payback Period** | CAC / Monthly ARPU | Months to recoup acquisition cost | < 12 months |
| **Churn Rate** (Monthly) | Churned users / Start-of-month users | Percentage of users who cancel per month | < 5% for B2C SaaS |
| **NRR** (Net Revenue Retention) | (Start MRR + Expansion - Contraction - Churn) / Start MRR | Revenue retention including upgrades | > 100% (indicates growth from existing customers) |

---

## Acquisition Metrics

| Metric | Formula | What It Means | Good Benchmark |
|--------|---------|--------------|---------------|
| **Website Traffic** | Unique visitors per period | Audience reach | Growing MoM |
| **Traffic by Source** | Visitors segmented by channel | Channel contribution | Diversified (no single source > 60%) |
| **CTR** (Click-Through Rate) | Clicks / Impressions x 100 | Ad or listing engagement | Google Ads: 3-5%, Meta: 1-2% |
| **CPC** (Cost Per Click) | Ad spend / Clicks | Cost of each ad click | Google: $1-5, Meta: $0.50-3 |
| **CPA** (Cost Per Acquisition) | Ad spend / Conversions | Cost of each signup/purchase | Depends on LTV target |
| **ROAS** (Return on Ad Spend) | Revenue from ads / Ad spend | Ad profitability | > 3:1 for profitable ads |
| **Organic Traffic %** | Organic visitors / Total visitors | SEO effectiveness | Growing over time; 40%+ is healthy |

---

## Activation Metrics

| Metric | Formula | What It Means | Good Benchmark |
|--------|---------|--------------|---------------|
| **Signup Rate** | Signups / Visitors x 100 | Landing page conversion | 5-15% for targeted traffic |
| **Activation Rate** | Users who completed key action / Total signups x 100 | Product adoption | 40-60% in first 7 days |
| **Time to Value** | Time from signup to first key action | How fast users see value | < 5 minutes ideal |
| **Onboarding Completion** | Users who finished onboarding / Total signups x 100 | Onboarding effectiveness | > 70% |
| **Free-to-Paid Conversion** | Paid users / Free users x 100 | Monetization efficiency | 2-5% for freemium, 10-15% for free trial |

---

## Engagement Metrics

| Metric | Formula | What It Means | Good Benchmark |
|--------|---------|--------------|---------------|
| **DAU/MAU Ratio** | Daily Active Users / Monthly Active Users | Product stickiness | > 20% is good; > 50% is exceptional |
| **Session Duration** | Average time per session | Engagement depth | Depends on product; 3-10 min typical |
| **Pages per Session** | Total page views / Sessions | Content engagement | > 2 for content sites |
| **Feature Adoption** | Users using feature X / Total active users | Feature value | Varies; core features should be > 50% |
| **Retention Rate (D7)** | Users returning on day 7 / Cohort size | Early retention | > 20% for consumer apps |
| **Retention Rate (D30)** | Users returning on day 30 / Cohort size | Sustained engagement | > 10% for consumer apps |

---

## Email Metrics

| Metric | Formula | What It Means | Good Benchmark |
|--------|---------|--------------|---------------|
| **Open Rate** | Opens / Delivered x 100 | Subject line effectiveness | 20-40% (varies by type) |
| **Click Rate** | Clicks / Delivered x 100 | Content + CTA effectiveness | 2-5% |
| **Click-to-Open Rate (CTOR)** | Clicks / Opens x 100 | Content relevance for openers | 10-20% |
| **Unsubscribe Rate** | Unsubscribes / Delivered x 100 | Content-audience fit | < 0.5% per email |
| **Bounce Rate** | Bounces / Sent x 100 | List quality | < 2% |
| **Spam Complaint Rate** | Complaints / Delivered x 100 | Sender reputation risk | < 0.1% |

### Email Benchmarks by Type

| Email Type | Open Rate | Click Rate |
|-----------|-----------|------------|
| Welcome email | 50-70% | 15-30% |
| Onboarding sequence | 30-50% | 5-15% |
| Newsletter | 20-35% | 2-5% |
| Promotional | 15-25% | 1-3% |
| Transactional (receipt, confirmation) | 60-80% | 10-20% |
| Re-engagement | 10-20% | 1-3% |

---

## Advertising Metrics

| Metric | Formula | What It Means | Good Benchmark |
|--------|---------|--------------|---------------|
| **Impressions** | Number of times ad was shown | Reach | Context-dependent |
| **Reach** | Unique users who saw the ad | Audience coverage | Context-dependent |
| **Frequency** | Impressions / Reach | How often each person sees the ad | 2-5x for awareness; watch for fatigue > 7x |
| **CTR** | Clicks / Impressions x 100 | Ad engagement | Google: 3-5%, Meta: 1-2%, LinkedIn: 0.5-1% |
| **CPC** | Spend / Clicks | Cost efficiency | Varies by platform and audience |
| **CPM** | (Spend / Impressions) x 1000 | Cost per 1,000 impressions | Google: $2-10, Meta: $5-15, LinkedIn: $25-50 |
| **CPA** | Spend / Conversions | Acquisition cost | Must be < target CAC |
| **Conversion Rate** | Conversions / Clicks x 100 | Landing page + offer quality | 5-15% for targeted campaigns |
| **Quality Score** (Google) | Google's ad relevance score | Ad + landing page quality | 7+ out of 10 |

---

## Cohort Analysis Guide

### How to Read a Cohort Retention Table

```
         Week 0  Week 1  Week 2  Week 3  Week 4
Jan Cohort  100%    32%     22%     18%     16%
Feb Cohort  100%    35%     25%     20%     —
Mar Cohort  100%    38%     —       —       —
```

**What to look for**:
- **Vertical improvement**: Are newer cohorts retaining better? (Feb > Jan > Dec = product improving)
- **Horizontal curve shape**: Does retention flatten or keep dropping? (Flattening = finding product-market fit)
- **The "elbow"**: Where does the steepest drop happen? (Week 0-1 is typical; fix onboarding)

### Key Questions for Cohort Analysis

1. **Are newer cohorts retaining better than older ones?** (Product improvement signal)
2. **Where is the biggest drop-off?** (Where to focus optimization)
3. **Does the curve flatten?** (If yes, you have a retained user base)
4. **How do segments differ?** (Organic vs. paid, mobile vs. desktop, plan tier)

---

## Attribution Models

| Model | How It Works | Best For |
|-------|-------------|---------|
| **Last Click** | 100% credit to the last touchpoint before conversion | Simple measurement, direct response |
| **First Click** | 100% credit to the first touchpoint | Understanding awareness channels |
| **Linear** | Equal credit to all touchpoints | Balanced view of the journey |
| **Time Decay** | More credit to recent touchpoints | Longer sales cycles |
| **Position-Based (U-Shaped)** | 40% first, 40% last, 20% split among middle | Balanced awareness + conversion credit |
| **Data-Driven** | Algorithmic based on actual conversion paths | Large datasets (1000+ conversions) |

### Attribution Best Practices

- Use **UTM parameters** on every link: `?utm_source=&utm_medium=&utm_campaign=&utm_content=`
- Start with **last-click** attribution (simplest, most actionable)
- Graduate to **position-based** when you have multi-touch data
- Always compare at least 2 models to understand the full picture
- Remember: no attribution model is perfect — they are all approximations

---

## Reporting Cadence

| Report | Frequency | Audience | Focus |
|--------|-----------|---------|-------|
| Daily Dashboard | Daily | Marketing team | Traffic, signups, ad spend, anomalies |
| Weekly Performance | Weekly | Marketing + Product | Funnel metrics, A/B test progress, channel performance |
| Monthly Business Review | Monthly | Leadership | MRR, CAC, LTV, cohort retention, channel ROI |
| Quarterly Strategy Review | Quarterly | Full team | Channel mix evaluation, budget reallocation, goal setting |
