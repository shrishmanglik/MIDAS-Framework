# SEC EDGAR Access Patterns Reference

## Overview

SEC EDGAR (Electronic Data Gathering, Analysis, and Retrieval) is the primary source for US public company financial filings. All public companies, mutual funds, and other entities regulated by the SEC must file documents electronically through EDGAR.

**Base URL**: `https://www.sec.gov/cgi-bin/browse-edgar`
**EDGAR Full-Text Search**: `https://efts.sec.gov/LATEST/search-index`
**EDGAR API (JSON)**: `https://data.sec.gov/`

---

## Filing Types

### Annual and Quarterly Filings

| Filing Type | Description | Frequency | Deadline |
|------------|-------------|-----------|----------|
| 10-K | Annual report with audited financial statements | Annual | 60 days (large accelerated), 75 days (accelerated), 90 days (non-accelerated) after fiscal year end |
| 10-Q | Quarterly report with unaudited financial statements | Quarterly (Q1, Q2, Q3) | 40 days (large accelerated/accelerated), 45 days (non-accelerated) after quarter end |
| 20-F | Annual report for foreign private issuers | Annual | 4 months after fiscal year end |

### Current and Event-Driven Filings

| Filing Type | Description | Deadline |
|------------|-------------|----------|
| 8-K | Report of unscheduled material events | 4 business days after event |
| 6-K | Report of foreign private issuer (interim) | Promptly after publication |
| SC 13D/G | Beneficial ownership report (>5% stake) | 10 days (13D) / 45 days (13G) after trigger |

### Proxy and Registration

| Filing Type | Description |
|------------|-------------|
| DEF 14A | Definitive proxy statement |
| S-1 | Registration statement for IPO |
| S-3 | Shelf registration |
| 424B | Prospectus filed under Rule 424(b) |

### Insider and Ownership

| Filing Type | Description | Deadline |
|------------|-------------|----------|
| Form 3 | Initial beneficial ownership statement | 10 days after becoming insider |
| Form 4 | Changes in beneficial ownership | 2 business days after transaction |
| Form 5 | Annual report of ownership changes | 45 days after fiscal year end |

### XBRL-Specific

| Filing Type | Description |
|------------|-------------|
| XBRL Instance Document | Tagged financial data (`.xml` or `.htm` with inline XBRL) |
| XBRL Taxonomy Extension | Company-specific taxonomy elements |
| XBRL Calculation Linkbase | Mathematical relationships between elements |
| XBRL Presentation Linkbase | Display order of elements |

---

## EDGAR API Endpoints

### Company Search

```
GET https://efts.sec.gov/LATEST/search-index?q={query}&dateRange=custom&startdt={date}&enddt={date}&forms={form_type}
```

### Company Filings by CIK

```
GET https://data.sec.gov/submissions/CIK{10-digit-padded}.json

Response includes:
- company name, CIK, SIC code, fiscal year end
- recent filings (up to 40)
- filing history references
```

### Full Filing Index

```
GET https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK={cik}&type={form_type}&dateb=&owner=include&count=40
```

### XBRL Filing Data (Company Facts)

```
GET https://data.sec.gov/api/xbrl/companyfacts/CIK{10-digit-padded}.json

Response includes all XBRL-tagged facts across all filings:
- Organized by taxonomy (us-gaap, dei, ifrs-full)
- Each concept has units, value, period, filing reference
```

### Specific Concept Data (Company Concept)

```
GET https://data.sec.gov/api/xbrl/companyconcept/CIK{cik}/{taxonomy}/{concept}.json

Example:
GET https://data.sec.gov/api/xbrl/companyconcept/CIK0000320193/us-gaap/Revenues.json

Returns all values of that concept across all filings.
```

### Frames (Cross-Company Data)

```
GET https://data.sec.gov/api/xbrl/frames/{taxonomy}/{concept}/{unit}/{period}.json

Example:
GET https://data.sec.gov/api/xbrl/frames/us-gaap/Revenues/USD/CY2023Q1I.json

Returns the specified concept for ALL companies for a given period.
Period format: CY{year}Q{quarter}I (instant) or CY{year}Q{quarter} (duration)
```

---

## Rate Limits and Access Rules

### SEC Fair Access Policy

**Rate limit**: Maximum 10 requests per second per user/IP.

**Required headers**:
```
User-Agent: CompanyName AdminEmail (e.g., "MIDASFramework admin@example.com")
Accept-Encoding: gzip, deflate
```

**SEC explicitly blocks**:
- Requests without a proper User-Agent header
- Requests exceeding 10/second
- Automated scraping that does not comply with `robots.txt`

### Best Practices

| Practice | Implementation |
|----------|---------------|
| Respect rate limits | Implement exponential backoff; sleep 100ms between requests |
| Cache responses | Cache filing documents locally; they do not change after filing |
| Use bulk data | For cross-company analysis, use the Frames API instead of per-company queries |
| Use JSON endpoints | `data.sec.gov` JSON endpoints are faster and more structured than HTML scraping |
| Identify yourself | Always include company name and contact email in User-Agent |
| Handle errors | 403 = rate limited (wait and retry); 404 = filing not found; 503 = EDGAR maintenance |

### Bulk Data Downloads

For large-scale analysis, SEC provides bulk data files:

| Resource | URL | Update Frequency |
|----------|-----|-----------------|
| Full-text search archive | `https://efts.sec.gov/LATEST/` | Daily |
| Company tickers | `https://www.sec.gov/files/company_tickers.json` | Daily |
| Mutual fund tickers | `https://www.sec.gov/files/company_tickers_mf.json` | Daily |
| XBRL taxonomy files | `https://www.sec.gov/info/edgar/edgarfm-vol2-v62.pdf` | Periodic |
| Financial statement datasets | `https://www.sec.gov/dera/data/financial-statement-data-sets` | Quarterly |

---

## Filing Document Structure

A typical 10-K filing package on EDGAR contains:

| File | Description | Format |
|------|-------------|--------|
| `*-20231231.htm` | Primary document (Inline XBRL) | HTML with embedded XBRL tags |
| `R1.htm` through `R*.htm` | Individual financial statement views | HTML |
| `*_cal.xml` | Calculation linkbase | XML |
| `*_def.xml` | Definition linkbase | XML |
| `*_lab.xml` | Label linkbase | XML |
| `*_pre.xml` | Presentation linkbase | XML |
| `*.xsd` | Taxonomy extension schema | XML Schema |
| `MetaLinks.json` | Metadata about the XBRL tagging | JSON |
| `Financial_Report.xlsx` | Financial data in spreadsheet format | Excel |

### Accessing Filing Documents

```
Filing index: https://www.sec.gov/Archives/edgar/data/{cik}/{accession_number_with_dashes}/
Example: https://www.sec.gov/Archives/edgar/data/320193/000032019323000106/

From the index, locate the primary document (usually the .htm file matching the filing type).
```

---

## CIK Lookup

### By Ticker Symbol

```
GET https://www.sec.gov/cgi-bin/browse-edgar?company=&CIK={ticker}&type=&dateb=&owner=include&count=40&search_text=&action=getcompany
```

### Common CIK Numbers (for reference)

| Company | Ticker | CIK |
|---------|--------|-----|
| Apple Inc. | AAPL | 0000320193 |
| Microsoft Corp. | MSFT | 0000789019 |
| Amazon.com Inc. | AMZN | 0001018724 |
| Alphabet Inc. | GOOGL | 0001652044 |
| Meta Platforms Inc. | META | 0001326801 |
| Tesla Inc. | TSLA | 0001318605 |
| Berkshire Hathaway | BRK-B | 0001067983 |

---

## Filer Categories and Deadlines

| Category | Public Float Threshold | 10-K Deadline | 10-Q Deadline |
|----------|----------------------|---------------|---------------|
| Large Accelerated Filer | >= $700 million | 60 days | 40 days |
| Accelerated Filer | $75-700 million | 75 days | 40 days |
| Non-Accelerated Filer | < $75 million | 90 days | 45 days |
| Smaller Reporting Company | < $250M float or < $100M revenue | 90 days | 45 days |
| Emerging Growth Company | < $1.235 billion revenue | Varies | Varies |

All deadlines are calendar days from the end of the fiscal period.
