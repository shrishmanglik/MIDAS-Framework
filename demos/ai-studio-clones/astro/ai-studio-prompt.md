# Astro AI Studio — Clone Spec

**Product:** Vedic astrology web app that generates a kundli (natal chart), daily horoscope, and partner compatibility from a date/time/place of birth.

**Live URL (reference):** https://astro.milliondollarstudio.ai

## Screenshots to Upload (drag into AI Studio first)

Upload every PNG in `astro/screenshots/`:
- `landing-desktop.png` — hero, value prop, feature grid
- `kundli-form-desktop.png` — DOB / time / place input form
- `kundli-result-desktop.png` — generated chart + planetary positions
- `horoscope-desktop.png` — daily horoscope by sign
- `compatibility-desktop.png` — two-person sync result
- `pricing-desktop.png` — tier cards
- `landing-mobile.png` — same hero on a 390 px viewport

---

## ✂️ PASTE EVERYTHING BELOW INTO GOOGLE AI STUDIO ✂️

Build a single-page React app called **Astro AI Studio** that clones a Vedic astrology product. Tagline: *"Authentic Vedic Astrology — kundli, horoscope, and compatibility in seconds."* Match the visual style of the uploaded screenshots: warm cosmic palette (deep indigo `#1a1147` background, saffron `#f59e0b` accent, cream `#fef3c7` text), serif headings (Cormorant Garamond), sans body (Inter). Use Tailwind CSS. Mobile-first responsive.

### Top banner (every page)
A 32 px strip across the top: `✨ Built with Google AI Studio in 14 minutes — View source on GitHub →`. Indigo background, cream text.

### Pages / Routes (use React Router)
1. `/` — Landing
2. `/kundli` — Birth chart generator
3. `/horoscope` — Daily horoscope by sign
4. `/compatibility` — Two-person match
5. `/pricing` — Plans

### Landing page
- Hero: H1 *"Authentic Vedic Astrology"*, subhead *"Trusted by 50,000+ seekers across India. Built on classical Parashara principles — not Western pop-astro."*, primary CTA `Generate My Kundli` (saffron) → `/kundli`, secondary CTA `See Today's Horoscope`.
- Below: 3-feature grid with icons (Kundli, Horoscope, Compatibility). Each card: title + 1-line desc + "Try free →".
- Testimonials row (3 cards) with realistic Indian names + cities:
  - *"Predictions for my Saturn return were spot on — switched career exactly when the chart said I would."* — **Priya Sharma, Bengaluru**
  - *"Used the compatibility report before my engagement. Family was impressed."* — **Aarav Mehta, Pune**
  - *"Daily horoscope feels personal, not generic. The Sade Sati alerts especially."* — **Kavya Iyer, Chennai**
- Footer: links, "© 2026 Astro AI Studio · Million Dollar AI Studio".

### `/kundli` — Birth chart
**Form** (left column on desktop, full-width on mobile):
- `Full Name` (text)
- `Date of Birth` (date picker, default 1995-08-15)
- `Time of Birth` (time picker, default 04:30)
- `Place of Birth` (text with autocomplete — preload these options: Mumbai, Delhi, Bengaluru, Chennai, Kolkata, Hyderabad, Pune, Ahmedabad, Jaipur, Lucknow)
- Submit button: `Generate Kundli` (saffron, full width on mobile)

**Result** (right column on desktop, below form on mobile) — shows AFTER submit. Use this hard-coded mock for any submission:
```ts
const mockKundli = {
  ascendant: "Cancer (Karka)",
  moonSign: "Leo (Simha) — Purva Phalguni Nakshatra",
  sunSign: "Leo (Simha)",
  planets: [
    { name: "Sun ☉",     sign: "Leo",       house: 2, degree: "28°14'" },
    { name: "Moon ☽",    sign: "Leo",       house: 2, degree: "12°47'" },
    { name: "Mars ♂",    sign: "Gemini",    house: 12, degree: "06°22'" },
    { name: "Mercury ☿", sign: "Cancer",    house: 1, degree: "22°08'" },
    { name: "Jupiter ♃", sign: "Sagittarius", house: 6, degree: "18°55'" },
    { name: "Venus ♀",   sign: "Cancer",    house: 1, degree: "14°31'" },
    { name: "Saturn ♄",  sign: "Aquarius",  house: 8, degree: "02°09'", retrograde: true },
    { name: "Rahu ☊",    sign: "Scorpio",   house: 5, degree: "11°44'" },
    { name: "Ketu ☋",    sign: "Taurus",    house: 11, degree: "11°44'" },
  ],
  dasha: { current: "Jupiter Mahadasha", until: "2029-03-12", next: "Saturn Mahadasha" },
  yogas: ["Gajakesari Yoga (Moon-Jupiter)", "Budhaditya Yoga (Sun-Mercury in 1st)"],
  reading: "Cancer ascendant gives you emotional intelligence and a nurturing presence. With Sun and Moon both in Leo in the 2nd house of wealth and family, expect prominence through creative or leadership work — and strong attachments to family wealth or values. Jupiter in the 6th brings wisdom through service or healing professions. Saturn retrograde in the 8th can mean late-blooming gains and karmic lessons through partnerships."
};
```
Render the chart as a **classic North Indian square chart** (CSS grid, 4×4 with diamond cuts) showing house numbers + planet abbreviations in each house. Below: planetary table, Mahadasha card, Yogas chips, Reading paragraph. Add a `Download PDF` button (non-functional — opens demo modal: *"PDF export available in production app"*).

### `/horoscope` — Daily horoscope
- 12-sign grid (Aries → Pisces), each card has Sanskrit name (Mesha, Vrishabha, …), symbol, and a `View today` button.
- On click, show a modal with hard-coded text (real one-paragraph horoscopes per sign — write authentic-sounding ones, e.g. for Leo: *"Today rewards bold ideas, Simha. Mercury's transit through your communication sector means a conversation you've been postponing finally lands well. Avoid signing financial documents after sunset. Lucky colour: deep red. Lucky number: 5."*).

### `/compatibility` — Two-person sync
- Two side-by-side forms (Name, DOB, Time, Place). Submit button `Calculate Sync`.
- Result: a single big number (`Guna Milan: 28 / 36`), an emerald progress bar, and a 3-paragraph reading. Hard-code one mock result regardless of inputs.

### `/pricing` — Plans
Three tiers as cards:
- **Free** — ₹0 — *Daily horoscope, basic kundli view*
- **Seeker** — ₹299/month — *Full kundli with dashas, unlimited compatibility, PDF export* — **Most Popular** badge
- **Acharya** — ₹999/month — *Everything in Seeker + monthly 1:1 with a Vedic astrologer*

Every "Subscribe" button opens a modal: *"This is a Google AI Studio demo. Live payments at astro.milliondollarstudio.ai."*

### What to SKIP
- Real ephemeris calculations (use the mock above for every input).
- Real auth — `Sign in` button just opens the demo modal.
- Real payment integration.
- Real PDF export.

### What MUST work
- Routing between all 5 pages.
- Form submission renders the mock result deterministically.
- Mobile breakpoint: hamburger menu, single-column layouts, no horizontal scroll at 390 px.
- The "Built with Google AI Studio" banner persists across all pages.

Generate the full React + Tailwind project. Single-file App if possible, otherwise standard Vite layout.
