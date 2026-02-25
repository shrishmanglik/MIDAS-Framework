"""Headline Analyzer — scores headlines for effectiveness."""

POWER_WORDS = {"free", "new", "proven", "secret", "instant", "guaranteed", "discover",
               "ultimate", "essential", "complete", "simple", "easy", "fast", "best",
               "top", "how", "why", "what", "guide", "tips", "ways", "steps"}

EMOTIONAL_WORDS = {"amazing", "incredible", "shocking", "surprising", "brilliant",
                   "powerful", "stunning", "remarkable", "extraordinary", "devastating"}

def analyze(headline):
    """Score a headline for effectiveness."""
    words = headline.lower().split()
    word_count = len(words)
    char_count = len(headline)

    power_count = sum(1 for w in words if w in POWER_WORDS)
    emotional_count = sum(1 for w in words if w in EMOTIONAL_WORDS)
    has_number = any(c.isdigit() for c in headline)

    score = 50  # base
    if 6 <= word_count <= 12: score += 15
    elif word_count < 6: score -= 10
    if char_count <= 60: score += 10
    if power_count > 0: score += min(power_count * 10, 20)
    if has_number: score += 10
    if headline.endswith("?"): score += 5

    return {
        "headline": headline,
        "word_count": word_count,
        "char_count": char_count,
        "power_words": power_count,
        "has_number": has_number,
        "score": min(100, score),
    }

if __name__ == "__main__":
    headlines = [
        "7 Proven Ways to Build a FastAPI App Fast",
        "Introduction to Our Product",
        "How to Double Your Revenue in 30 Days",
    ]
    for h in headlines:
        result = analyze(h)
        print(f"  Score: {result['score']}/100 — {h}")
