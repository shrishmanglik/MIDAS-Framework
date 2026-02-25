# Statistical Methods Reference

## Method Selection Guide

| Question | Method | When to Use |
|----------|--------|-------------|
| Is there a difference between groups? | t-test (2 groups), ANOVA (3+) | Comparing means |
| Are two variables related? | Correlation (Pearson/Spearman) | Measuring association |
| Does category affect outcome? | Chi-square test | Categorical data |
| What predicts an outcome? | Regression (linear/logistic) | Prediction modeling |
| What patterns exist in data? | Cluster analysis | Segmentation |
| Is a trend statistically significant? | Mann-Kendall test | Time series trends |

## Confidence Intervals
- **95% CI:** Standard for business decisions. Means: if repeated 100 times, 95 would contain true value.
- **90% CI:** Acceptable for exploratory research. Wider, less precise.
- **99% CI:** Required for critical decisions (financial, medical). Narrower, more conservative.

## Sample Size Guidelines
| Analysis Type | Minimum Sample | Recommended |
|---------------|---------------|-------------|
| Survey (descriptive) | 30 | 100-400 |
| A/B test | 100 per variant | 1000+ per variant |
| User interviews | 5 | 8-15 |
| Focus groups | 6 per group | 8-10 per group |
| Correlation analysis | 30 | 100+ |
| Regression | 10 per predictor | 50+ per predictor |

## Common Pitfalls
- **Simpson's Paradox:** Aggregate data shows opposite trend from disaggregated. Always check subgroups.
- **Survivorship Bias:** Analyzing only successes. Include failures in sample.
- **P-hacking:** Testing many hypotheses until one hits p<0.05. Pre-register hypotheses.
- **Ecological Fallacy:** Group-level findings applied to individuals. State level of analysis.
- **Regression to Mean:** Extreme values tend to moderate on retest. Use control groups.

## Reporting Standards
When reporting statistical results, always include:
1. Sample size (n)
2. Test used and why
3. Test statistic value
4. p-value or confidence interval
5. Effect size (not just significance)
6. Assumptions checked (normality, independence, homogeneity)
