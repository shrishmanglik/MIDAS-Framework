# XBRL Taxonomy Reference -- US-GAAP

## Overview

XBRL (eXtensible Business Reporting Language) is the standard format for SEC financial filings. The US-GAAP taxonomy provides standardized concept names for financial data elements. This reference covers the most commonly used concepts for financial analysis.

---

## Core Financial Statement Concepts

### Income Statement (Statement of Operations)

| XBRL Concept | Human Label | Typical Location |
|-------------|-------------|-----------------|
| `us-gaap:Revenues` | Total Revenue | Top line |
| `us-gaap:RevenueFromContractWithCustomerExcludingAssessedTax` | Net Revenue | Top line (ASC 606) |
| `us-gaap:CostOfRevenue` | Cost of Revenue/COGS | Below revenue |
| `us-gaap:CostOfGoodsAndServicesSold` | Cost of Goods Sold | Alternative to CostOfRevenue |
| `us-gaap:GrossProfit` | Gross Profit | Revenue - COGS |
| `us-gaap:OperatingExpenses` | Total Operating Expenses | SGA + R&D + Other |
| `us-gaap:SellingGeneralAndAdministrativeExpense` | SG&A Expense | Operating expense component |
| `us-gaap:ResearchAndDevelopmentExpense` | R&D Expense | Operating expense component |
| `us-gaap:OperatingIncomeLoss` | Operating Income (EBIT) | Gross Profit - OpEx |
| `us-gaap:InterestExpense` | Interest Expense | Non-operating |
| `us-gaap:InterestIncome` | Interest Income | Non-operating |
| `us-gaap:IncomeLossFromContinuingOperationsBeforeIncomeTaxesExtraordinaryItemsNoncontrollingInterest` | Pre-Tax Income | Before tax provision |
| `us-gaap:IncomeTaxExpenseBenefit` | Income Tax Expense | Tax provision |
| `us-gaap:NetIncomeLoss` | Net Income | Bottom line |
| `us-gaap:EarningsPerShareBasic` | Basic EPS | Per-share metric |
| `us-gaap:EarningsPerShareDiluted` | Diluted EPS | Per-share metric |
| `us-gaap:WeightedAverageNumberOfShareOutstandingBasic` | Weighted Avg Shares (Basic) | Share count |
| `us-gaap:WeightedAverageNumberOfDilutedSharesOutstanding` | Weighted Avg Shares (Diluted) | Share count |

### Balance Sheet (Statement of Financial Position)

| XBRL Concept | Human Label | Category |
|-------------|-------------|----------|
| `us-gaap:Assets` | Total Assets | Top-level |
| `us-gaap:AssetsCurrent` | Total Current Assets | Current |
| `us-gaap:CashAndCashEquivalentsAtCarryingValue` | Cash and Cash Equivalents | Current |
| `us-gaap:ShortTermInvestments` | Short-Term Investments | Current |
| `us-gaap:AccountsReceivableNetCurrent` | Accounts Receivable, Net | Current |
| `us-gaap:InventoryNet` | Inventory, Net | Current |
| `us-gaap:PrepaidExpenseAndOtherAssetsCurrent` | Prepaid Expenses | Current |
| `us-gaap:AssetsNoncurrent` | Total Non-Current Assets | Non-current |
| `us-gaap:PropertyPlantAndEquipmentNet` | PP&E, Net | Non-current |
| `us-gaap:Goodwill` | Goodwill | Non-current |
| `us-gaap:IntangibleAssetsNetExcludingGoodwill` | Intangible Assets, Net | Non-current |
| `us-gaap:Liabilities` | Total Liabilities | Top-level |
| `us-gaap:LiabilitiesCurrent` | Total Current Liabilities | Current |
| `us-gaap:AccountsPayableCurrent` | Accounts Payable | Current |
| `us-gaap:AccruedLiabilitiesCurrent` | Accrued Liabilities | Current |
| `us-gaap:ShortTermBorrowings` | Short-Term Debt | Current |
| `us-gaap:LongTermDebtCurrent` | Current Portion of Long-Term Debt | Current |
| `us-gaap:LiabilitiesNoncurrent` | Total Non-Current Liabilities | Non-current |
| `us-gaap:LongTermDebtNoncurrent` | Long-Term Debt | Non-current |
| `us-gaap:StockholdersEquity` | Total Shareholders' Equity | Equity |
| `us-gaap:CommonStockValue` | Common Stock | Equity |
| `us-gaap:AdditionalPaidInCapital` | Additional Paid-In Capital | Equity |
| `us-gaap:RetainedEarningsAccumulatedDeficit` | Retained Earnings | Equity |
| `us-gaap:TreasuryStockValue` | Treasury Stock | Equity (contra) |
| `us-gaap:AccumulatedOtherComprehensiveIncomeLossNetOfTax` | AOCI | Equity |

### Cash Flow Statement

| XBRL Concept | Human Label | Section |
|-------------|-------------|---------|
| `us-gaap:NetCashProvidedByUsedInOperatingActivities` | Operating Cash Flow | Operating |
| `us-gaap:NetCashProvidedByUsedInInvestingActivities` | Investing Cash Flow | Investing |
| `us-gaap:NetCashProvidedByUsedInFinancingActivities` | Financing Cash Flow | Financing |
| `us-gaap:DepreciationDepletionAndAmortization` | D&A | Operating (add-back) |
| `us-gaap:ShareBasedCompensation` | Stock-Based Compensation | Operating (add-back) |
| `us-gaap:PaymentsToAcquirePropertyPlantAndEquipment` | Capital Expenditures | Investing |
| `us-gaap:PaymentsToAcquireBusinessesNetOfCashAcquired` | Acquisitions | Investing |
| `us-gaap:PaymentsOfDividends` | Dividends Paid | Financing |
| `us-gaap:PaymentsForRepurchaseOfCommonStock` | Share Repurchases | Financing |
| `us-gaap:ProceedsFromIssuanceOfLongTermDebt` | Debt Issuance | Financing |
| `us-gaap:RepaymentsOfLongTermDebt` | Debt Repayment | Financing |

---

## Financial Ratio Formulas

### Liquidity Ratios

| Ratio | Formula | Healthy Range |
|-------|---------|--------------|
| Current Ratio | Current Assets / Current Liabilities | 1.5 - 3.0 |
| Quick Ratio | (Current Assets - Inventory) / Current Liabilities | 1.0 - 2.0 |
| Cash Ratio | Cash / Current Liabilities | 0.5 - 1.0 |

### Profitability Ratios

| Ratio | Formula | Notes |
|-------|---------|-------|
| Gross Margin | Gross Profit / Revenue | Industry-specific benchmarks |
| Operating Margin | Operating Income / Revenue | Measures operational efficiency |
| Net Margin | Net Income / Revenue | Bottom-line profitability |
| Return on Equity (ROE) | Net Income / Shareholders' Equity | > 15% generally strong |
| Return on Assets (ROA) | Net Income / Total Assets | > 5% generally adequate |
| Return on Invested Capital (ROIC) | NOPAT / (Total Debt + Equity) | Compared to WACC |

### Leverage Ratios

| Ratio | Formula | Risk Threshold |
|-------|---------|---------------|
| Debt-to-Equity | Total Debt / Shareholders' Equity | > 2.0 elevated risk |
| Total Leverage | Total Liabilities / Shareholders' Equity | > 3.0 high leverage |
| Interest Coverage | Operating Income / Interest Expense | < 3.0 is concerning |
| Debt-to-EBITDA | Total Debt / EBITDA | > 4.0 elevated risk |

### Efficiency Ratios

| Ratio | Formula | Notes |
|-------|---------|-------|
| Asset Turnover | Revenue / Total Assets | Higher = more efficient |
| Inventory Turnover | COGS / Average Inventory | Higher = faster inventory movement |
| Days Sales Outstanding | (Accounts Receivable / Revenue) * 365 | Lower = faster collection |
| Days Payable Outstanding | (Accounts Payable / COGS) * 365 | Industry-specific |

### Valuation Ratios (require market data)

| Ratio | Formula | Notes |
|-------|---------|-------|
| P/E Ratio | Market Price / EPS | Forward vs. trailing |
| P/B Ratio | Market Cap / Book Value | Below 1 may indicate undervaluation or distress |
| EV/EBITDA | Enterprise Value / EBITDA | Used for M&A comparisons |

---

## XBRL Context and Period Handling

### Context Types

- **Instant**: A point-in-time measurement (balance sheet items). Specified with a single date.
  ```xml
  <context id="i20231231">
    <period><instant>2023-12-31</instant></period>
  </context>
  ```

- **Duration**: A period measurement (income/cash flow items). Specified with start and end dates.
  ```xml
  <context id="d20230101-20231231">
    <period>
      <startDate>2023-01-01</startDate>
      <endDate>2023-12-31</endDate>
    </period>
  </context>
  ```

### Handling Multi-Period Data

XBRL filings typically contain:
- Current period data
- Prior period comparative data (1 year for annual, multiple quarters for quarterly)

When extracting data, always match the context period to ensure you are comparing equivalent periods. Compare annual-to-annual and quarterly-to-quarterly.

---

## Common XBRL Parsing Pitfalls

| Pitfall | Description | Solution |
|---------|-------------|---------|
| Duplicate concepts | Same metric tagged with different concepts across years | Build a mapping table of equivalent concepts |
| Sign conventions | Some concepts are reported as negatives (treasury stock, contra accounts) | Check the concept's balance attribute (debit/credit) |
| Dimensional data | Segment reporting uses XBRL dimensions | Parse dimensions to separate business segments |
| Unit mismatches | Some items in thousands, others in millions | Always check the unit element for each fact |
| Custom extensions | Companies create custom XBRL concepts | Map custom extensions to nearest standard concept |
| Amended filings | Companies may file amendments (10-K/A) | Always use the most recent amendment |
