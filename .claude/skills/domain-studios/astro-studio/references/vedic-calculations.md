# Vedic Calculations Reference

## Ayanamsa Calculation

The ayanamsa is the angular difference between the tropical and sidereal zodiacs. Vedic astrology uses the sidereal zodiac.

### Lahiri Ayanamsa (Chitrapaksha)

The official Indian government standard (Indian Astronomical Ephemeris).

**Base value**: 23 degrees 51 minutes 0.54 seconds on January 1, 2024 (23.8502 degrees)

**Annual precession rate**: approximately 50.2882 arcseconds per year (0.01397 degrees/year)

**Calculation formula**:
```
ayanamsa(year) = 23.8502 + (year - 2024) * 0.013971
```

**Precise calculation from Julian Day**:
```
T = (JD - 2451545.0) / 36525.0    // Julian centuries from J2000.0
ayanamsa = 23.8502 + T * 1.3971 - 0.00006 * T^2
```

**Reference values**:
| Year | Lahiri Ayanamsa |
|------|----------------|
| 1950 | 23d 09m 34s |
| 1960 | 23d 17m 54s |
| 1970 | 23d 26m 14s |
| 1980 | 23d 34m 32s |
| 1990 | 23d 42m 50s |
| 2000 | 23d 51m 11s |
| 2010 | 23d 59m 30s |
| 2020 | 24d 07m 37s |
| 2024 | 24d 10m 41s |
| 2030 | 24d 15m 40s |

**Other ayanamsa systems** (for reference, not default):
- **Raman**: approximately 2 degrees less than Lahiri
- **Krishnamurti (KP)**: approximately 6 arcminutes less than Lahiri
- **Yukteswar**: based on the Great Year cycle, significantly different

---

## Sidereal vs. Tropical Conversion

```
sidereal_longitude = tropical_longitude - ayanamsa

if sidereal_longitude < 0:
    sidereal_longitude += 360.0

if sidereal_longitude >= 360:
    sidereal_longitude -= 360.0
```

**Why it matters**: A planet at 15 degrees Aries tropical (March/April birth) would be at approximately 21 degrees Pisces sidereal -- a completely different sign, nakshatra, and interpretation.

---

## Rashi (Sign) Determination

Each of the 12 rashis spans exactly 30 degrees of the ecliptic.

```
rashi_number = floor(sidereal_longitude / 30) + 1    // 1-indexed
degree_in_sign = sidereal_longitude mod 30
```

| Number | Sanskrit | English | Symbol | Element | Quality | Lord |
|--------|----------|---------|--------|---------|---------|------|
| 1 | Mesha | Aries | Ram | Fire | Movable (Chara) | Mars |
| 2 | Vrishabha | Taurus | Bull | Earth | Fixed (Sthira) | Venus |
| 3 | Mithuna | Gemini | Twins | Air | Dual (Dvisvabhava) | Mercury |
| 4 | Karka | Cancer | Crab | Water | Movable | Moon |
| 5 | Simha | Leo | Lion | Fire | Fixed | Sun |
| 6 | Kanya | Virgo | Maiden | Earth | Dual | Mercury |
| 7 | Tula | Libra | Scales | Air | Movable | Venus |
| 8 | Vrischika | Scorpio | Scorpion | Water | Fixed | Mars |
| 9 | Dhanu | Sagittarius | Archer | Fire | Dual | Jupiter |
| 10 | Makara | Capricorn | Crocodile | Earth | Movable | Saturn |
| 11 | Kumba | Aquarius | Pot | Air | Fixed | Saturn |
| 12 | Meena | Pisces | Fish | Water | Dual | Jupiter |

---

## House Calculation Methods

### Whole Sign Houses (Recommended Default)

The simplest and oldest house system in Vedic astrology.

```
1st house = entire sign containing the Ascendant
2nd house = next sign
... and so on for all 12 houses
```

Example: If Ascendant is at 15 degrees Leo, then:
- 1st house = all of Leo (0-30 degrees Leo)
- 2nd house = all of Virgo
- 3rd house = all of Libra
- ... etc.

### Equal House System

Each house spans exactly 30 degrees, starting from the Ascendant degree.

```
house_cusp(n) = ascendant_degree + (n - 1) * 30
if house_cusp(n) >= 360: house_cusp(n) -= 360
```

### Placidus House System

Based on trisection of diurnal and nocturnal arcs. Requires birth latitude.

```
Semi-arc calculation:
H = arccos(-tan(latitude) * tan(declination))
Diurnal semi-arc = H (in degrees of Right Ascension)
Nocturnal semi-arc = 180 - H

Houses 11, 12 = trisect diurnal semi-arc above horizon
Houses 2, 3 = trisect nocturnal semi-arc below horizon
```

**Note**: Placidus breaks down at extreme latitudes (above 66 degrees N/S). Use Whole Sign for polar locations.

---

## Planetary Dignity Rules

### Exaltation (Uchcha) -- Maximum Strength

| Planet | Exaltation Sign | Exact Degree |
|--------|----------------|-------------|
| Sun | Aries (Mesha) | 10 degrees |
| Moon | Taurus (Vrishabha) | 3 degrees |
| Mars | Capricorn (Makara) | 28 degrees |
| Mercury | Virgo (Kanya) | 15 degrees |
| Jupiter | Cancer (Karka) | 5 degrees |
| Venus | Pisces (Meena) | 27 degrees |
| Saturn | Libra (Tula) | 20 degrees |
| Rahu | Taurus (Vrishabha) | -- |
| Ketu | Scorpio (Vrischika) | -- |

### Debilitation (Neecha) -- Minimum Strength

Always the sign exactly opposite (180 degrees) from exaltation:

| Planet | Debilitation Sign | Exact Degree |
|--------|------------------|-------------|
| Sun | Libra (Tula) | 10 degrees |
| Moon | Scorpio (Vrischika) | 3 degrees |
| Mars | Cancer (Karka) | 28 degrees |
| Mercury | Pisces (Meena) | 15 degrees |
| Jupiter | Capricorn (Makara) | 5 degrees |
| Venus | Virgo (Kanya) | 27 degrees |
| Saturn | Aries (Mesha) | 20 degrees |
| Rahu | Scorpio (Vrischika) | -- |
| Ketu | Taurus (Vrishabha) | -- |

### Own Sign (Swakshetra)

A planet in the sign it rules:

| Planet | Own Sign(s) |
|--------|------------|
| Sun | Leo |
| Moon | Cancer |
| Mars | Aries, Scorpio |
| Mercury | Gemini, Virgo |
| Jupiter | Sagittarius, Pisces |
| Venus | Taurus, Libra |
| Saturn | Capricorn, Aquarius |

### Moolatrikona

A special zone within one of the planet's own signs where it functions at near-exaltation strength:

| Planet | Moolatrikona Sign | Degree Range |
|--------|------------------|-------------|
| Sun | Leo | 0-20 degrees |
| Moon | Taurus | 3-30 degrees |
| Mars | Aries | 0-12 degrees |
| Mercury | Virgo | 15-20 degrees |
| Jupiter | Sagittarius | 0-10 degrees |
| Venus | Libra | 0-15 degrees |
| Saturn | Aquarius | 0-20 degrees |

### Friendly/Enemy Sign Classification

Natural friendships between planets:

| Planet | Friends | Enemies | Neutral |
|--------|---------|---------|---------|
| Sun | Moon, Mars, Jupiter | Venus, Saturn | Mercury |
| Moon | Sun, Mercury | -- | Mars, Jupiter, Venus, Saturn |
| Mars | Sun, Moon, Jupiter | Mercury | Venus, Saturn |
| Mercury | Sun, Venus | Moon | Mars, Jupiter, Saturn |
| Jupiter | Sun, Moon, Mars | Mercury, Venus | Saturn |
| Venus | Mercury, Saturn | Sun, Moon | Mars, Jupiter |
| Saturn | Mercury, Venus | Sun, Moon, Mars | Jupiter |

**Dignity hierarchy** (strongest to weakest):
1. Exaltation
2. Moolatrikona
3. Own Sign
4. Friend's Sign
5. Neutral Sign
6. Enemy's Sign
7. Debilitation

---

## Aspect Rules (Vedic Drishti)

In Vedic astrology, aspects are cast forward from a planet's position by sign/house count (not degree-based orbs like Western astrology).

### Universal Aspect

**All planets aspect the 7th house from their position** (the house directly opposite, 180 degrees away).

### Special Aspects (Vishesh Drishti)

| Planet | Special Aspects | Houses Aspected (including 7th) |
|--------|----------------|-------------------------------|
| Mars | 4th and 8th from its position | 4th, 7th, 8th |
| Jupiter | 5th and 9th from its position | 5th, 7th, 9th |
| Saturn | 3rd and 10th from its position | 3rd, 7th, 10th |

### Rahu and Ketu Aspects

Traditional texts assign Rahu and Ketu the same aspects as Saturn (3rd, 7th, 10th), though some schools use only the 7th aspect. **Default: use 7th aspect only for Rahu/Ketu.**

### Aspect Calculation

```
aspect_target_sign = (planet_sign + aspect_count - 1) mod 12
// Where signs are numbered 1-12

Example: Mars in sign 7 (Libra)
- 4th aspect: (7 + 4 - 1) mod 12 = 10 -> Capricorn
- 7th aspect: (7 + 7 - 1) mod 12 = 1 -> Aries
- 8th aspect: (7 + 8 - 1) mod 12 = 2 -> Taurus
```

**Note**: Vedic aspects are full-strength regardless of degree proximity. A planet aspects the entire sign, not a specific degree. There are no partial aspects or orb allowances in the classical system.

---

## Nakshatra Calculation

The 27 nakshatras divide the 360-degree zodiac into segments of 13 degrees 20 minutes (13.3333 degrees) each. Each nakshatra is further divided into 4 padas of 3 degrees 20 minutes (3.3333 degrees) each.

### Nakshatra Determination

```
nakshatra_index = floor(sidereal_longitude / 13.3333)    // 0-indexed (0-26)
pada = floor((sidereal_longitude mod 13.3333) / 3.3333) + 1    // 1-4
degree_within_nakshatra = sidereal_longitude mod 13.3333
```

### Complete Nakshatra Table

| Index | Nakshatra | Start Degree | End Degree | Lord | Deity | Symbol |
|-------|-----------|-------------|-----------|------|-------|--------|
| 0 | Ashwini | 0d 00m | 13d 20m | Ketu | Ashwini Kumaras | Horse head |
| 1 | Bharani | 13d 20m | 26d 40m | Venus | Yama | Yoni |
| 2 | Krittika | 26d 40m | 40d 00m | Sun | Agni | Razor/flame |
| 3 | Rohini | 40d 00m | 53d 20m | Moon | Brahma | Chariot |
| 4 | Mrigashira | 53d 20m | 66d 40m | Mars | Soma | Deer head |
| 5 | Ardra | 66d 40m | 80d 00m | Rahu | Rudra | Teardrop |
| 6 | Punarvasu | 80d 00m | 93d 20m | Jupiter | Aditi | Bow/quiver |
| 7 | Pushya | 93d 20m | 106d 40m | Saturn | Brihaspati | Flower/circle |
| 8 | Ashlesha | 106d 40m | 120d 00m | Mercury | Nagas | Serpent |
| 9 | Magha | 120d 00m | 133d 20m | Ketu | Pitris | Throne |
| 10 | Purva Phalguni | 133d 20m | 146d 40m | Venus | Bhaga | Hammock |
| 11 | Uttara Phalguni | 146d 40m | 160d 00m | Sun | Aryaman | Bed |
| 12 | Hasta | 160d 00m | 173d 20m | Moon | Savitar | Hand |
| 13 | Chitra | 173d 20m | 186d 40m | Mars | Vishwakarma | Pearl |
| 14 | Swati | 186d 40m | 200d 00m | Rahu | Vayu | Coral/sapphire |
| 15 | Vishakha | 200d 00m | 213d 20m | Jupiter | Indra-Agni | Archway |
| 16 | Anuradha | 213d 20m | 226d 40m | Saturn | Mitra | Lotus |
| 17 | Jyeshtha | 226d 40m | 240d 00m | Mercury | Indra | Earring |
| 18 | Moola | 240d 00m | 253d 20m | Ketu | Nirriti | Roots |
| 19 | Purva Ashadha | 253d 20m | 266d 40m | Venus | Apas | Fan |
| 20 | Uttara Ashadha | 266d 40m | 280d 00m | Sun | Vishvedevas | Tusk |
| 21 | Shravana | 280d 00m | 293d 20m | Moon | Vishnu | Ear/footprints |
| 22 | Dhanishta | 293d 20m | 306d 40m | Mars | Vasus | Drum |
| 23 | Shatabhisha | 306d 40m | 320d 00m | Rahu | Varuna | Circle |
| 24 | Purva Bhadrapada | 320d 00m | 333d 20m | Jupiter | Ajaikapad | Sword |
| 25 | Uttara Bhadrapada | 333d 20m | 346d 40m | Saturn | Ahirbudhnya | Twins |
| 26 | Revati | 346d 40m | 360d 00m | Mercury | Pushan | Fish/drum |

### Nakshatra Lords and Dasha Sequence

The nakshatra lord determines the starting Mahadasha in the Vimshottari system. The lords cycle in this fixed order:

**Ketu -> Venus -> Sun -> Moon -> Mars -> Rahu -> Jupiter -> Saturn -> Mercury**

This 9-planet sequence maps across the 27 nakshatras (3 nakshatras per planet):

| Lord | Nakshatras | Dasha Years |
|------|-----------|-------------|
| Ketu | Ashwini, Magha, Moola | 7 |
| Venus | Bharani, Purva Phalguni, Purva Ashadha | 20 |
| Sun | Krittika, Uttara Phalguni, Uttara Ashadha | 6 |
| Moon | Rohini, Hasta, Shravana | 10 |
| Mars | Mrigashira, Chitra, Dhanishta | 7 |
| Rahu | Ardra, Swati, Shatabhisha | 18 |
| Jupiter | Punarvasu, Vishakha, Purva Bhadrapada | 16 |
| Saturn | Pushya, Anuradha, Uttara Bhadrapada | 19 |
| Mercury | Ashlesha, Jyeshtha, Revati | 17 |

---

## Combustion Rules

A planet too close to the Sun loses its independent signification. The Moon is exempt.

| Planet | Combustion Threshold (Direct) | Combustion Threshold (Retrograde) |
|--------|-------------------------------|----------------------------------|
| Mars | within 17 degrees | within 17 degrees |
| Mercury | within 14 degrees | within 12 degrees |
| Jupiter | within 11 degrees | within 11 degrees |
| Venus | within 10 degrees | within 8 degrees |
| Saturn | within 15 degrees | within 15 degrees |

**Calculation**: Measure the absolute angular difference between the planet's longitude and the Sun's longitude. If less than the threshold, the planet is combust.

```
angular_diff = abs(planet_longitude - sun_longitude)
if angular_diff > 180: angular_diff = 360 - angular_diff
is_combust = angular_diff < combustion_threshold
```
