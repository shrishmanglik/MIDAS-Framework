# Nestiq — Clone Spec

**Product:** Canadian rental intelligence. Helps newcomers and renters compare listings, score neighbourhoods (transit, safety, grocery, schools), and detect rent vs. market mispricing across major Canadian cities.

**Live URL (reference):** https://nestiq.milliondollarstudio.ai

> ⚠️ At capture time this subdomain returned `ECONNREFUSED`. Re-take screenshots once the live site is reachable; until then this spec is derived from the task brief and standard rental-platform UX.

## Screenshots to Upload (when available)

- `landing-desktop.png`, `landing-mobile.png`
- `search-results-grid.png` — listings with map
- `listing-detail.png` — single unit page with neighbourhood score
- `neighbourhood-score-breakdown.png`
- `rent-vs-market.png` — fair-price indicator
- `alerts-page.png`
- `pricing-desktop.png`

---

## ✂️ PASTE EVERYTHING BELOW INTO GOOGLE AI STUDIO ✂️

Build a React app called **Nestiq — Canadian Rental Intelligence**. Tagline: *"Find a fair-priced rental — with neighbourhood scores you can trust."*

The product helps Canadian renters (especially newcomers from India) avoid scams and overpriced listings. Core innovation: every listing has a `Fair Price Indicator` (overpriced / market / underpriced) and a `Neighbourhood Score` based on transit, walkability, safety, grocery access, and schools.

Match the visual style of uploaded screenshots: clean rental-marketplace look — emerald `#10b981` primary, slate text, white background, generous photo treatment. Inter font. Tailwind. Mobile-first.

### Top banner
`🏡 Built with Google AI Studio in 26 minutes — View source on GitHub →`. Slate bg, white text.

### Header / Nav
Logo `Nestiq` (with house+leaf glyph). Nav: `Search`, `Map`, `Neighbourhoods`, `Alerts`, `Pricing`. Right: `Saved (3)`, `Sign in`. Mobile hamburger.

### Routes
1. `/` — Landing
2. `/search` — Listings grid + filter sidebar + map toggle
3. `/listing/:id` — Single listing detail
4. `/neighbourhoods` — Browse + compare neighbourhoods
5. `/alerts` — Set up new-listing alerts
6. `/pricing`

### Landing page
- Hero H1: *"Find a fair-priced rental in Canada."* · Subhead: *"Every listing comes with a Fair Price score and a Neighbourhood report — not just photos. New to Canada? Start here."* · CTA: a search bar with `City` autocomplete (Toronto, Vancouver, Montréal, Calgary, Ottawa, Edmonton, Mississauga, Brampton, Surrey, Halifax) + `Beds` dropdown + `Max rent` slider + big `Search →` button.
- 3-feature row:
  - **Fair Price Score** — *"We compare every listing against the last 90 days of market data on the same street and beds."*
  - **Neighbourhood Report** — *"Transit, walkability, safety, grocery, schools — one number, full breakdown."*
  - **Newcomer Mode** — *"Filters for short leases, no-credit-history-needed listings, and proximity to settlement services."*
- City spotlight cards (4): Toronto, Vancouver, Brampton, Calgary. Each shows: average 1BR rent, MoM trend arrow, total active listings.
- Footer.

### `/search` — Listings page

Layout: left sidebar filters · right grid of listing cards · top-right toggle `Grid | Map`.

**Filters (sidebar):**
- City (multi-select)
- Beds (Studio, 1, 2, 3, 4+)
- Max rent slider (CAD 800 – 5,000)
- Move-in date (date picker)
- Newcomer-friendly toggle (filters: short lease, no credit check, furnished)
- Pets allowed (checkbox)
- Parking (checkbox)
- Fair Price Score: `Underpriced` / `Market` / `Overpriced` chips

**Listing cards** (use these 12 hard-coded mock listings — realistic Canadian addresses, plausible rents for May 2026):

| ID | Address | City | Beds | Rent (CAD) | Fair Price | Neighbourhood | Hero photo |
|---|---|---|---|---|---|---|---|
| 1 | 89 Sumach St, Unit 312 | Toronto | 1 | 2,450 | Market | 81 (Cabbagetown) | brick mid-rise |
| 2 | 1188 Howe St, Unit 2105 | Vancouver | 1 | 2,890 | Underpriced –6% | 88 (Yaletown) | glass tower |
| 3 | 245 Dovercourt Rd | Toronto | 2 | 3,200 | Overpriced +9% | 76 (Trinity Bellwoods) | victorian house |
| 4 | 9450 Bonaventure Dr SE | Calgary | 2 | 1,950 | Market | 67 (Bonaventure) | suburban townhouse |
| 5 | 50 Charles St E, Unit 4011 | Toronto | Studio | 2,100 | Overpriced +12% | 85 (Yorkville) | luxury condo |
| 6 | 7355 Goreway Dr, Unit 1812 | Mississauga | 2 | 2,400 | Underpriced –4% | 72 (Malton) | concrete tower |
| 7 | 808 Boulevard René-Lévesque O | Montréal | 1 | 1,750 | Market | 79 (Centre-Ville) | art-deco walkup |
| 8 | 16 Yonge St, Unit 3210 | Toronto | 1 | 2,650 | Overpriced +7% | 90 (Harbourfront) | waterfront condo |
| 9 | 200 Avenue Rd, Unit 605 | Toronto | 2 | 4,100 | Overpriced +14% | 92 (Annex) | heritage low-rise |
| 10 | 8888 Odlin Cres, Unit 528 | Richmond | 2 | 2,300 | Underpriced –8% | 74 (Brighouse) | family-oriented complex |
| 11 | 1166 Bay St, Unit 1602 | Toronto | 1 | 2,750 | Market | 91 (Bay/Bloor) | full-service tower |
| 12 | 4815 Edenwood Dr, Unit 2 | Brampton | 3 | 2,800 | Underpriced –5% | 65 (Castlemore) | basement apt |

Each card: hero photo placeholder (use Tailwind colour blocks if no images), address, city, beds + baths + sq ft, rent, **Fair Price chip** (green/grey/red), **Neighbourhood Score circle** (0–100), `View details →`.

**Map toggle** view: render a basic map (use Leaflet with OpenStreetMap tiles — fully client-side, no API key needed). Drop pins for the 12 listings, colour-coded by Fair Price.

### `/listing/:id` — Listing detail
- Photo gallery (4 placeholder slots)
- Address, beds/baths/sqft, rent, available date
- Fair Price card with explanation: *"This 1BR is priced at $2,450/mo. The 90-day median for 1BRs within 500m on M5A is $2,420. This listing is 1.2% above market — fair."* Bar chart with their listing vs distribution.
- Neighbourhood Score breakdown (5 sub-scores out of 100):
  - Transit (TTC nearby) 87
  - Walkability 84
  - Safety 78
  - Grocery 72
  - Schools 64
  - Parks 81
- Amenities checklist (real ones: in-suite laundry, dishwasher, A/C, balcony, gym, concierge, etc.)
- Lease terms: 12-mo standard, sublet allowed, deposit policy
- Contact landlord button (opens demo modal: *"Demo build — landlord contact disabled"*)
- "Similar listings" row of 3 more cards.

### `/neighbourhoods` — Browse + compare
- Grid of 12 Canadian neighbourhood cards (real ones across cities):
  - Toronto: Annex, Cabbagetown, Yorkville, Harbourfront, Trinity Bellwoods, Bay/Bloor
  - Vancouver: Yaletown, Mount Pleasant, Kitsilano
  - Montréal: Plateau Mont-Royal, Centre-Ville
  - Calgary: Beltline
- Each card: name, city, score, median 1BR rent, 1-line vibe (e.g. *"Annex — leafy, café-dense, Bloor subway, U of T. Score 92."*).
- Compare drawer: select 2–4 neighbourhoods, see side-by-side bar chart of all 6 sub-scores. Use Recharts.

### `/alerts` — Saved searches
- List existing alerts (hard-code 3): *"Toronto, 1BR, ≤ $2,500, Annex/Cabbagetown — daily"*, *"Vancouver, 2BR, ≤ $3,200 — weekly"*, *"Brampton, 3BR, newcomer-friendly — daily"*.
- `+ New alert` button opens a form (city, beds, rent, frequency).
- "Recent matches" inline below each alert (use 1-2 of the 12 listings as examples).
- All Email/Save buttons open demo modal.

### `/pricing`
- **Free** — `$0` — *Browse + 3 saved alerts + basic neighbourhood scores*
- **Renter Pro** — `$9/month` — *Unlimited alerts + Fair Price detail + sub-score breakdown* — **Most Popular**
- **Newcomer** — `$0 for 60 days` — *Pro features + curated newcomer-friendly listings + chat with a settlement counsellor* (subsidised tier).

### What to SKIP
- Real listing scraping / RSS feeds.
- Real auth.
- Real payment.
- Real email alerts.

### What MUST work
- Filtering on the search page actually filters the 12 mock listings.
- Map view renders Leaflet with the 12 pins.
- Listing detail dynamically loads from the listing array by `:id`.
- Neighbourhood compare actually charts side-by-side (Recharts).
- Mobile: filter sidebar becomes a slide-up drawer; map and grid toggle is a tab bar at top.
- Top banner persists.

Generate the full React + Vite + Tailwind + Leaflet + Recharts project.
