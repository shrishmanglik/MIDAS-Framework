# Dasha Rules Reference -- Vimshottari Dasha System

The Vimshottari Dasha system is the most widely used timing technique in Vedic astrology. It assigns planetary periods (dashas) based on the Moon's nakshatra at birth, cycling through all nine planets over a 120-year span.

---

## Planet Order and Period Lengths

The nine planets follow this fixed sequence, repeating in a cycle:

| Order | Planet | Sanskrit | Period (Years) | Period (Days) |
|-------|--------|----------|---------------|--------------|
| 1 | Ketu | Ketu | 7 | 2,556.75 |
| 2 | Venus | Shukra | 20 | 7,305.00 |
| 3 | Sun | Surya | 6 | 2,191.50 |
| 4 | Moon | Chandra | 10 | 3,652.50 |
| 5 | Mars | Mangala | 7 | 2,556.75 |
| 6 | Rahu | Rahu | 18 | 6,574.50 |
| 7 | Jupiter | Guru | 16 | 5,844.00 |
| 8 | Saturn | Shani | 19 | 6,939.75 |
| 9 | Mercury | Budha | 17 | 6,209.25 |
| **Total** | | | **120** | **43,830.00** |

---

## Determining the Starting Dasha

The Mahadasha at birth is determined by the nakshatra the Moon occupies at the moment of birth. Each nakshatra is ruled by one of the nine planets (see `vedic-calculations.md` for the full table).

### Step 1: Find Moon's Nakshatra

```
nakshatra_index = floor(moon_sidereal_longitude / 13.3333)
```

### Step 2: Map Nakshatra to Dasha Lord

| Nakshatra Lord | Nakshatras (by index) |
|---------------|----------------------|
| Ketu | 0 (Ashwini), 9 (Magha), 18 (Moola) |
| Venus | 1 (Bharani), 10 (Purva Phalguni), 19 (Purva Ashadha) |
| Sun | 2 (Krittika), 11 (Uttara Phalguni), 20 (Uttara Ashadha) |
| Moon | 3 (Rohini), 12 (Hasta), 21 (Shravana) |
| Mars | 4 (Mrigashira), 13 (Chitra), 22 (Dhanishta) |
| Rahu | 5 (Ardra), 14 (Swati), 23 (Shatabhisha) |
| Jupiter | 6 (Punarvasu), 15 (Vishakha), 24 (Purva Bhadrapada) |
| Saturn | 7 (Pushya), 16 (Anuradha), 25 (Uttara Bhadrapada) |
| Mercury | 8 (Ashlesha), 17 (Jyeshtha), 26 (Revati) |

### Step 3: Calculate Balance of Dasha at Birth

The Moon is partway through the nakshatra at birth. The remaining portion of the nakshatra determines how much of the first Mahadasha remains.

```
degree_within_nakshatra = moon_sidereal_longitude mod 13.3333
fraction_traversed = degree_within_nakshatra / 13.3333
fraction_remaining = 1.0 - fraction_traversed

balance_of_dasha_years = dasha_lord_total_years * fraction_remaining
balance_of_dasha_days = balance_of_dasha_years * 365.25
```

**Example**: Moon at 45.61 degrees sidereal (in Rohini nakshatra, lord = Moon)
```
degree_within_nakshatra = 45.61 mod 13.3333 = 5.61 degrees
fraction_traversed = 5.61 / 13.3333 = 0.4208
fraction_remaining = 1.0 - 0.4208 = 0.5792
balance_of_Moon_dasha = 10 * 0.5792 = 5.792 years = 5 years 9 months 16 days
```

### Step 4: Sequence Subsequent Dashas

After the first (balance) dasha ends, the next dasha follows the fixed planet order:

```
starting_planet = Moon (from example)
next sequence: Mars -> Rahu -> Jupiter -> Saturn -> Mercury -> Ketu -> Venus -> Sun -> Moon (repeats)
```

Each planet gets its full period length from the table above.

---

## Sub-Period (Bhukti/Antardasha) Calculation

Each Mahadasha is divided into 9 sub-periods (bhuktis or antardashas), one for each planet in the same cyclic order, starting with the Mahadasha lord itself.

### Bhukti Duration Formula

```
bhukti_duration_years = (mahadasha_lord_years * bhukti_lord_years) / 120
bhukti_duration_days = bhukti_duration_years * 365.25
```

### Complete Bhukti Table for Each Mahadasha

**Ketu Mahadasha (7 years)**:
| Bhukti Lord | Duration (Y-M-D) | Duration (Days) |
|------------|-------------------|-----------------|
| Ketu | 0-4-27 | 148.75 |
| Venus | 1-2-0 | 426.00 |
| Sun | 0-4-6 | 127.75 |
| Moon | 0-7-0 | 213.00 |
| Mars | 0-4-27 | 148.75 |
| Rahu | 1-0-18 | 383.25 |
| Jupiter | 0-11-6 | 340.67 |
| Saturn | 1-1-9 | 404.83 |
| Mercury | 0-11-27 | 362.08 |

**Venus Mahadasha (20 years)**:
| Bhukti Lord | Duration (Y-M-D) | Duration (Days) |
|------------|-------------------|-----------------|
| Venus | 3-4-0 | 1,217.50 |
| Sun | 1-0-0 | 365.25 |
| Moon | 1-8-0 | 608.75 |
| Mars | 1-2-0 | 426.00 |
| Rahu | 3-0-0 | 1,095.75 |
| Jupiter | 2-8-0 | 974.00 |
| Saturn | 3-2-0 | 1,156.50 |
| Mercury | 2-10-0 | 1,034.75 |
| Ketu | 1-2-0 | 426.00 |

**Sun Mahadasha (6 years)**:
| Bhukti Lord | Duration (Y-M-D) | Duration (Days) |
|------------|-------------------|-----------------|
| Sun | 0-3-18 | 109.58 |
| Moon | 0-6-0 | 182.63 |
| Mars | 0-4-6 | 127.75 |
| Rahu | 0-10-24 | 328.73 |
| Jupiter | 0-9-18 | 292.20 |
| Saturn | 0-11-12 | 346.99 |
| Mercury | 0-10-6 | 310.46 |
| Ketu | 0-4-6 | 127.75 |
| Venus | 1-0-0 | 365.25 |

**Moon Mahadasha (10 years)**:
| Bhukti Lord | Duration (Y-M-D) | Duration (Days) |
|------------|-------------------|-----------------|
| Moon | 0-10-0 | 304.38 |
| Mars | 0-7-0 | 213.00 |
| Rahu | 1-6-0 | 547.88 |
| Jupiter | 1-4-0 | 487.00 |
| Saturn | 1-7-0 | 578.42 |
| Mercury | 1-5-0 | 517.44 |
| Ketu | 0-7-0 | 213.00 |
| Venus | 1-8-0 | 608.75 |
| Sun | 0-6-0 | 182.63 |

**Mars Mahadasha (7 years)**:
| Bhukti Lord | Duration (Y-M-D) | Duration (Days) |
|------------|-------------------|-----------------|
| Mars | 0-4-27 | 148.75 |
| Rahu | 1-0-18 | 383.25 |
| Jupiter | 0-11-6 | 340.67 |
| Saturn | 1-1-9 | 404.83 |
| Mercury | 0-11-27 | 362.08 |
| Ketu | 0-4-27 | 148.75 |
| Venus | 1-2-0 | 426.00 |
| Sun | 0-4-6 | 127.75 |
| Moon | 0-7-0 | 213.00 |

**Rahu Mahadasha (18 years)**:
| Bhukti Lord | Duration (Y-M-D) | Duration (Days) |
|------------|-------------------|-----------------|
| Rahu | 2-8-12 | 985.50 |
| Jupiter | 2-4-24 | 876.00 |
| Saturn | 2-10-6 | 1,040.33 |
| Mercury | 2-6-18 | 930.83 |
| Ketu | 1-0-18 | 383.25 |
| Venus | 3-0-0 | 1,095.75 |
| Sun | 0-10-24 | 328.73 |
| Moon | 1-6-0 | 547.88 |
| Mars | 1-0-18 | 383.25 |

**Jupiter Mahadasha (16 years)**:
| Bhukti Lord | Duration (Y-M-D) | Duration (Days) |
|------------|-------------------|-----------------|
| Jupiter | 2-1-18 | 779.33 |
| Saturn | 2-6-12 | 924.67 |
| Mercury | 2-3-6 | 827.00 |
| Ketu | 0-11-6 | 340.67 |
| Venus | 2-8-0 | 974.00 |
| Sun | 0-9-18 | 292.20 |
| Moon | 1-4-0 | 487.00 |
| Mars | 0-11-6 | 340.67 |
| Rahu | 2-4-24 | 876.00 |

**Saturn Mahadasha (19 years)**:
| Bhukti Lord | Duration (Y-M-D) | Duration (Days) |
|------------|-------------------|-----------------|
| Saturn | 3-0-3 | 1,097.81 |
| Mercury | 2-8-9 | 983.44 |
| Ketu | 1-1-9 | 404.83 |
| Venus | 3-2-0 | 1,156.50 |
| Sun | 0-11-12 | 346.99 |
| Moon | 1-7-0 | 578.42 |
| Mars | 1-1-9 | 404.83 |
| Rahu | 2-10-6 | 1,040.33 |
| Jupiter | 2-6-12 | 924.67 |

**Mercury Mahadasha (17 years)**:
| Bhukti Lord | Duration (Y-M-D) | Duration (Days) |
|------------|-------------------|-----------------|
| Mercury | 2-4-27 | 879.08 |
| Ketu | 0-11-27 | 362.08 |
| Venus | 2-10-0 | 1,034.75 |
| Sun | 0-10-6 | 310.46 |
| Moon | 1-5-0 | 517.44 |
| Mars | 0-11-27 | 362.08 |
| Rahu | 2-6-18 | 930.83 |
| Jupiter | 2-3-6 | 827.00 |
| Saturn | 2-8-9 | 983.44 |

---

## Pratyantardasha (Sub-Sub-Period)

Each bhukti is further divided into pratyantardashas using the same proportional formula:

```
pratyantardasha_days = (bhukti_days * pratyantardasha_lord_years) / 120
```

This creates increasingly fine timing divisions. For practical purposes, most interpretations focus on Mahadasha and Bhukti levels.

---

## Interpretation Rules for Each Dasha Lord

### Ketu Mahadasha (7 years)
- **Theme**: Spiritual awakening, detachment, past-life karma resolution, sudden changes
- **Positive indicators**: Ketu in 3rd, 6th, 11th, or 12th house; Ketu in moksha houses with spiritual interest
- **Challenging indicators**: Ketu in 1st (identity confusion), 7th (relationship disruption), 10th (career instability)
- **Key principle**: Results depend heavily on the sign lord where Ketu sits and any conjunctions

### Venus Mahadasha (20 years)
- **Theme**: Relationships, marriage, comfort, luxury, artistic pursuits, material wealth
- **Positive indicators**: Venus in own/exaltation sign, in kendras/trikonas, Venus as yogakaraka
- **Challenging indicators**: Venus debilitated, combust, or lord of dusthana houses
- **Key principle**: The longest dasha -- sets the tone for a significant life chapter. Marriage often occurs during Venus dasha if age-appropriate.

### Sun Mahadasha (6 years)
- **Theme**: Authority, father, government, self-expression, health vitality, career recognition
- **Positive indicators**: Sun in own sign (Leo), exalted (Aries), or in 10th house
- **Challenging indicators**: Sun debilitated (Libra), in 6th/8th/12th, combust planets during this period lose signification
- **Key principle**: Short but intense. Government-related matters, father's influence, and personal authority are highlighted.

### Moon Mahadasha (10 years)
- **Theme**: Mind, emotions, mother, nurturing, public image, travel, liquids/water-related
- **Positive indicators**: Moon exalted (Taurus), bright Moon (waxing), Moon in kendras with benefic aspects
- **Challenging indicators**: Dark Moon (waning near Sun), Moon in 6th/8th/12th, Moon with malefics
- **Key principle**: Emotional life dominates. Mental health, mother's role, and public-facing activities intensify.

### Mars Mahadasha (7 years)
- **Theme**: Energy, courage, siblings, property, surgery, competition, technical skills
- **Positive indicators**: Mars in own/exaltation sign, Mars as yogakaraka (for Cancer/Leo ascendants), Mars in upachaya houses (3, 6, 10, 11)
- **Challenging indicators**: Mars debilitated (Cancer), Mars in 1st/4th/7th/8th (Mangal dosha considerations), Mars with malefics
- **Key principle**: Active, dynamic period. Property transactions, physical activities, and competitive situations are favored or forced.

### Rahu Mahadasha (18 years)
- **Theme**: Ambition, foreign connections, unconventional paths, material desire, technology, obsession
- **Positive indicators**: Rahu in 3rd, 6th, 10th, or 11th (upachaya houses), Rahu in friendly signs, Rahu with benefic lords
- **Challenging indicators**: Rahu in 1st/7th/8th, Rahu with malefic conjunctions, Rahu in enemy signs
- **Key principle**: Long and transformative. Rahu amplifies the significations of the house and sign it occupies. Foreign travel, unconventional careers, and intense desires emerge. Results depend on the dispositor (sign lord).

### Jupiter Mahadasha (16 years)
- **Theme**: Wisdom, expansion, children, teachers, spirituality, higher education, law, wealth
- **Positive indicators**: Jupiter in own/exaltation sign, Jupiter as benefic for the Ascendant, Jupiter in kendras/trikonas
- **Challenging indicators**: Jupiter debilitated (Capricorn), Jupiter as functional malefic (for some ascendants), Jupiter in dusthanas
- **Key principle**: Generally the most favorable dasha. Education, marriage, children, spiritual growth, and financial expansion occur. Even challenging Jupiter dashas bring lessons through growth.

### Saturn Mahadasha (19 years)
- **Theme**: Discipline, delays, hard work, karma, longevity, service, structure, chronic conditions
- **Positive indicators**: Saturn in own/exaltation sign, Saturn as yogakaraka (for Taurus/Libra ascendants), Saturn in 3rd/6th/10th/11th
- **Challenging indicators**: Saturn debilitated (Aries), Saturn in 1st/4th/7th/8th with malefic aspects
- **Key principle**: Long and demanding. Early years of Saturn dasha are often the hardest. Rewards come through persistent effort. Structure, discipline, and patience are the keys. The 2nd half is usually easier than the 1st.

### Mercury Mahadasha (17 years)
- **Theme**: Communication, intellect, business, education, siblings, nervous system, adaptability
- **Positive indicators**: Mercury in own/exaltation sign (Virgo), Mercury unafflicted, Mercury with benefics
- **Challenging indicators**: Mercury debilitated (Pisces), Mercury combust, Mercury with malefics
- **Key principle**: Intellectual and commercial activity intensifies. Business ventures, education, writing, and communication skills are highlighted. Mercury is neutral and takes on the color of its associations.

---

## Dasha Transition Effects

Transitions between Mahadashas are critical periods. The last bhukti of an ending dasha and the first bhukti of a new dasha create a "sandhi" (junction) period that can be turbulent.

**Transition rules**:
- The last 10% of a Mahadasha begins winding down the outgoing planet's themes
- The first 10% of the new Mahadasha introduces the incoming planet's themes gradually
- If the outgoing and incoming lords are natural enemies, the transition is more disruptive
- If they are friends, the transition is smoother

**Sandhi calculation**:
```
sandhi_period_days = mahadasha_total_days * 0.10
transition_start = mahadasha_end_date - sandhi_period_days
transition_end = mahadasha_end_date + next_mahadasha_total_days * 0.10
```

---

## Practical Dasha Calculation Example

**Given**: Moon at 45.61 degrees sidereal, born March 15, 1990

1. Nakshatra: Rohini (index 3, lord = Moon)
2. Balance of Moon Mahadasha: 5 years 9 months 16 days
3. Moon dasha ends: approximately December 1, 1995

**Dasha sequence from birth**:
| Dasha | Starts | Ends | Duration |
|-------|--------|------|----------|
| Moon (balance) | Mar 15, 1990 | Dec 1, 1995 | 5y 9m 16d |
| Mars | Dec 1, 1995 | Dec 1, 2002 | 7 years |
| Rahu | Dec 1, 2002 | Dec 1, 2020 | 18 years |
| Jupiter | Dec 1, 2020 | Dec 1, 2036 | 16 years |
| Saturn | Dec 1, 2036 | Dec 1, 2055 | 19 years |
| Mercury | Dec 1, 2055 | Dec 1, 2072 | 17 years |
| Ketu | Dec 1, 2072 | Dec 1, 2079 | 7 years |
| Venus | Dec 1, 2079 | Dec 1, 2099 | 20 years |
| Sun | Dec 1, 2099 | Dec 1, 2105 | 6 years |
| Moon | Dec 1, 2105 | Dec 1, 2115 | 10 years (full cycle restarts) |
