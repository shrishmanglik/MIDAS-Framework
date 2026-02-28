# Yoga Definitions Reference

A yoga in Vedic astrology is a specific combination of planetary placements that produces a distinct effect. The word "yoga" means "union" or "combination." This reference contains formation rules, required conditions, and interpretive guidelines for the major yogas.

**Important**: Yogas operate on a spectrum. A yoga's strength depends on the dignity, house placement, and aspects of the forming planets. A yoga can be "present but weak" or "present and strong."

---

## Pancha Mahapurusha Yogas (Five Great Person Yogas)

These five yogas are formed when Mars, Mercury, Jupiter, Venus, or Saturn are in their **own sign or exaltation sign** AND simultaneously placed in a **kendra (houses 1, 4, 7, or 10)** from the Ascendant.

### 1. Ruchaka Yoga (Mars)

- **Forming Planet**: Mars
- **Condition**: Mars in Aries, Scorpio (own signs) or Capricorn (exaltation) AND in houses 1, 4, 7, or 10 from Lagna
- **Effects**: Courage, physical strength, leadership ability, military or athletic prowess, commanding presence, competitive success
- **Strength Modifiers**: Strongest when Mars is in Capricorn (exalted) in the 10th house. Weakened if Mars is aspected by Saturn or is combust.

### 2. Bhadra Yoga (Mercury)

- **Forming Planet**: Mercury
- **Condition**: Mercury in Gemini, Virgo (own signs) or Virgo (exaltation) AND in houses 1, 4, 7, or 10 from Lagna
- **Effects**: Intellectual brilliance, eloquence, skill in communication and commerce, youthful appearance, talent in mathematics and writing
- **Strength Modifiers**: Strongest when Mercury is in Virgo 1st or 10th house. Cancelled if Mercury is combust (within 14 degrees of Sun).

### 3. Hamsa Yoga (Jupiter)

- **Forming Planet**: Jupiter
- **Condition**: Jupiter in Sagittarius, Pisces (own signs) or Cancer (exaltation) AND in houses 1, 4, 7, or 10 from Lagna
- **Effects**: Wisdom, spirituality, good fortune, respected in society, knowledge of scriptures, ethical conduct, teaching ability
- **Strength Modifiers**: Strongest when Jupiter is in Cancer (exalted) in the 1st or 4th house. Weakened if aspected by Rahu or Saturn.

### 4. Malavya Yoga (Venus)

- **Forming Planet**: Venus
- **Condition**: Venus in Taurus, Libra (own signs) or Pisces (exaltation) AND in houses 1, 4, 7, or 10 from Lagna
- **Effects**: Beauty, artistic talent, wealth through luxury goods or arts, happy marriage, refined taste, comfort and material pleasures
- **Strength Modifiers**: Strongest when Venus is in Pisces (exalted) in the 4th or 7th house. Weakened if Venus is combust.

### 5. Shasha Yoga (Saturn)

- **Forming Planet**: Saturn
- **Condition**: Saturn in Capricorn, Aquarius (own signs) or Libra (exaltation) AND in houses 1, 4, 7, or 10 from Lagna
- **Effects**: Authority, discipline, longevity, organizational power, success through perseverance, political ability, command over workers
- **Strength Modifiers**: Strongest when Saturn is in Libra (exalted) in the 1st or 10th house. Effects delayed until after age 35.

**Detection logic for all Pancha Mahapurusha**:
```
function isPanchaMahapurusha(planet, sign, house):
    is_strong_sign = (sign in planet.own_signs) or (sign == planet.exaltation_sign)
    is_kendra = house in [1, 4, 7, 10]
    return is_strong_sign and is_kendra
```

---

## Dhana Yogas (Wealth Combinations)

### 6. Basic Dhana Yoga

- **Condition**: Lord of the 2nd house and lord of the 11th house are in mutual aspect, conjunction, or exchange (parivartana)
- **Additional forms**: Lord of 1st connected with lord of 2nd or 11th; lord of 5th connected with lord of 9th
- **Effects**: Wealth accumulation, financial stability, ability to earn and retain money
- **Strength Modifiers**: Stronger if the involved lords are in good dignity. Strongest when involving benefics (Jupiter, Venus).

### 7. Lakshmi Yoga

- **Condition**: Lord of the 9th house is strong (in own sign, exaltation, or kendra) AND Venus is in own sign or exaltation AND in a kendra or trikona (houses 1, 4, 5, 7, 9, 10)
- **Effects**: Great wealth, luxury, fortune through righteousness, blessings of goddess Lakshmi
- **Strength Modifiers**: The 9th lord's strength is the primary determinant. Venus must also be unafflicted.

### 8. Chandra-Mangal Yoga (Moon-Mars)

- **Condition**: Moon and Mars in conjunction (same sign) or mutual aspect
- **Effects**: Wealth through real estate, property, agriculture, or bold financial ventures. Earnings through personal effort and courage.
- **Strength Modifiers**: Stronger in earth or water signs. Weakened if Moon is waning or in dusthana (6, 8, 12).

---

## Raja Yogas (Power/Authority Combinations)

### 9. Basic Raja Yoga

- **Condition**: Lord of a kendra (1, 4, 7, 10) is in conjunction, mutual aspect, or exchange with lord of a trikona (1, 5, 9)
- **Effects**: Authority, leadership positions, social prominence, political power
- **Strength Modifiers**: The more kendra-trikona connections present, the stronger the Raja Yoga. Strongest when involving the 1st lord (both kendra and trikona).

### 10. Dharma-Karmadhipati Yoga

- **Condition**: Lord of the 9th house (dharma) and lord of the 10th house (karma) are in conjunction, mutual aspect, or exchange
- **Effects**: One of the most powerful Raja Yogas. Success through righteous action, high position in life, fame, respect, authority
- **Strength Modifiers**: Extremely powerful if occurring in the 1st, 9th, or 10th house. The dignities of both lords matter.

### 11. Adhi Yoga

- **Condition**: Benefic planets (Mercury, Jupiter, Venus) occupy the 6th, 7th, and 8th houses from the Moon
- **Effects**: Polite, trustworthy, affluent, able to defeat opponents, leadership in community
- **Strength Modifiers**: All three benefics must be present (one in each house) for full Adhi Yoga. Partial Adhi Yoga if two are present.

---

## Lunar Yogas (Moon-based Combinations)

### 12. Gajakesari Yoga

- **Condition**: Jupiter in a kendra (1st, 4th, 7th, or 10th house) from the Moon
- **Effects**: Wisdom, lasting reputation, wealth that endures, good memory, respected by learned people, positions of influence
- **Strength Modifiers**: Strongest when both Moon and Jupiter are in good dignity. Weakened if Jupiter is combust or debilitated. Very common yoga -- strength matters more than mere presence.

**Detection logic**:
```
function isGajakesari(moon_house, jupiter_house):
    distance = (jupiter_house - moon_house) mod 12
    if distance < 0: distance += 12
    return distance in [0, 3, 6, 9]  // same house, 4th, 7th, or 10th from Moon
```

### 13. Sunaphaa Yoga

- **Condition**: Any planet (except Sun, Rahu, Ketu) in the 2nd house from Moon
- **Effects**: Self-earned wealth, intelligence, good reputation
- **Strength Modifiers**: Stronger with benefics (Jupiter, Venus, Mercury) in the 2nd from Moon.

### 14. Anaphaa Yoga

- **Condition**: Any planet (except Sun, Rahu, Ketu) in the 12th house from Moon
- **Effects**: Good physique, generous nature, mild temperament, fame
- **Strength Modifiers**: Stronger with benefics in the 12th from Moon.

### 15. Durudhara Yoga

- **Condition**: Planets (except Sun, Rahu, Ketu) in BOTH the 2nd and 12th houses from Moon (Sunaphaa + Anaphaa combined)
- **Effects**: Wealthy, generous, commanding, enjoys conveyances and comforts
- **Strength Modifiers**: Best when benefics flank the Moon on both sides.

---

## Solar Yogas

### 16. Budhaditya Yoga (Mercury-Sun)

- **Condition**: Sun and Mercury in conjunction (same sign)
- **Effects**: Intelligence, skill in communication, analytical ability, education, fame through intellect
- **Strength Modifiers**: Very common since Mercury is never more than 28 degrees from the Sun. **Truly effective only when**: Mercury is not combust (more than 14 degrees from Sun), both are in good houses (kendras/trikonas), and Mercury is in good dignity. If Mercury is combust, the yoga is technically present but significantly weakened.

**Detection logic**:
```
function isBudhaditya(sun_sign, mercury_sign, angular_distance):
    same_sign = (sun_sign == mercury_sign)
    not_combust = (angular_distance > 14)
    return same_sign  // present but flag combustion status separately
```

---

## Viparita (Reversal) Yogas

### 17. Viparita Raja Yoga

- **Condition**: Lords of dusthana houses (6th, 8th, 12th) are placed in OTHER dusthana houses, and are NOT in conjunction with or aspected by other planet lords
- **Three specific forms**:
  - **Harsha Yoga**: 6th lord in 8th or 12th
  - **Sarala Yoga**: 8th lord in 6th or 12th
  - **Vimala Yoga**: 12th lord in 6th or 8th
- **Effects**: Success through adversity, turning obstacles into opportunities, gains through others' losses, resilience
- **Strength Modifiers**: Strongest when the dusthana lord is alone in the other dusthana (no conjunctions). Weakened if the lord also rules a good house (dual lordship).

---

## Conjunction and Exchange Yogas

### 18. Parivartana Yoga (Mutual Exchange)

- **Condition**: Two planets occupy each other's signs (Planet A in Planet B's sign, AND Planet B in Planet A's sign)
- **Three types**:
  - **Maha Yoga**: Exchange between lords of 1, 2, 4, 5, 7, 9, 10, 11
  - **Khala Yoga**: Exchange involving one lord of 3, 6, 8, or 12
  - **Dainya Yoga**: Exchange between two lords of 3, 6, 8, or 12
- **Effects**: The planets act as if they are in their own signs; creates a strong connection between the two houses involved
- **Strength Modifiers**: Maha Parivartana is highly positive. Khala is mixed. Dainya is challenging.

### 19. Neechabhanga Raja Yoga (Cancellation of Debilitation)

- **Condition**: A debilitated planet has its debilitation cancelled by one or more of:
  - The lord of the sign where the planet is debilitated is in a kendra from Lagna or Moon
  - The lord of the planet's exaltation sign is in a kendra from Lagna or Moon
  - The debilitated planet is aspected by the lord of the sign it occupies
  - The debilitated planet is in conjunction with an exalted planet
- **Effects**: The debilitated planet gains unexpected strength. Often produces better results than ordinary placement -- the native achieves success after overcoming early setbacks.
- **Strength Modifiers**: Stronger when multiple cancellation conditions are met.

### 20. Kemadruma Yoga (Inauspicious)

- **Condition**: No planet (except Sun, Rahu, Ketu) in the 2nd or 12th house from Moon AND no planet in a kendra from Moon or Lagna
- **Effects**: Loneliness, poverty, struggles, lack of support
- **Cancellation**: This yoga is cancelled if Moon is in a kendra, aspected by Jupiter, or if kendras from Moon are occupied. Check all cancellation conditions before declaring this yoga.
- **Note**: True Kemadruma is rare. Always check for cancellation.

---

## Additional Important Yogas

### 21. Saraswati Yoga

- **Condition**: Jupiter, Venus, and Mercury all in kendras, trikonas, or the 2nd house. Jupiter must be in its own or exaltation sign.
- **Effects**: Learning, wisdom, skill in arts and sciences, eloquence, fame through knowledge
- **Strength Modifiers**: All three planets must be well-placed. Jupiter's dignity is the key factor.

### 22. Amala Yoga

- **Condition**: A natural benefic (Moon, Mercury, Jupiter, Venus) in the 10th house from Lagna or Moon
- **Effects**: Spotless reputation, virtuous conduct, prosperity through ethical means, lasting fame
- **Strength Modifiers**: Strongest with Jupiter in the 10th. Moon counts only when waxing (bright Moon).

### 23. Veshi Yoga

- **Condition**: A planet (other than Moon, Rahu, Ketu) in the 2nd house from Sun
- **Effects**: Truthful, balanced, happy, brings auspicious qualities of the involved planet
- **Strength Modifiers**: Benefics produce better results than malefics.

### 24. Voshi Yoga

- **Condition**: A planet (other than Moon, Rahu, Ketu) in the 12th house from Sun
- **Effects**: Wise, charitable, skilled, strong memory
- **Strength Modifiers**: Similar to Veshi -- benefics are preferred.

### 25. Kahala Yoga

- **Condition**: Lords of the 4th and 9th houses in mutual kendras AND the Ascendant lord is strong
- **Effects**: Courageous, energetic, leads or commands armies/organizations, bold
- **Strength Modifiers**: Ascendant lord's strength is the critical factor.

---

## Yoga Detection Algorithm

```python
def detect_yogas(chart):
    yogas_found = []

    for planet in [Mars, Mercury, Jupiter, Venus, Saturn]:
        if is_pancha_mahapurusha(planet, chart):
            yogas_found.append({
                "name": f"{planet.mahapurusha_name} Yoga",
                "type": "pancha_mahapurusha",
                "forming_planets": [planet.name],
                "strength": assess_strength(planet, chart)
            })

    if is_gajakesari(chart.moon, chart.jupiter):
        yogas_found.append({
            "name": "Gajakesari Yoga",
            "type": "lunar",
            "forming_planets": ["Moon", "Jupiter"],
            "strength": assess_gajakesari_strength(chart)
        })

    # Check Raja Yogas
    for kendra_lord in get_house_lords(chart, [1, 4, 7, 10]):
        for trikona_lord in get_house_lords(chart, [1, 5, 9]):
            if are_connected(kendra_lord, trikona_lord, chart):
                yogas_found.append({
                    "name": "Raja Yoga",
                    "type": "raja",
                    "forming_planets": [kendra_lord.name, trikona_lord.name],
                    "strength": assess_raja_strength(kendra_lord, trikona_lord, chart)
                })

    # ... continue for all yoga types

    return yogas_found
```
