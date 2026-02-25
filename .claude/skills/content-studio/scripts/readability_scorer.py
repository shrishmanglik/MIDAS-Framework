"""Readability Scoring — Flesch-Kincaid and Flesch Reading Ease."""

def count_syllables(word):
    """Estimate syllable count for a word."""
    word = word.lower().rstrip("e")
    count = 0
    vowels = "aeiou"
    prev_vowel = False
    for char in word:
        is_vowel = char in vowels
        if is_vowel and not prev_vowel:
            count += 1
        prev_vowel = is_vowel
    return max(1, count)

def analyze(text):
    """Calculate readability scores."""
    sentences = [s.strip() for s in text.replace("!", ".").replace("?", ".").split(".") if s.strip()]
    words = text.split()
    total_sentences = len(sentences)
    total_words = len(words)
    total_syllables = sum(count_syllables(w) for w in words)

    if total_sentences == 0 or total_words == 0:
        return {"error": "Text too short"}

    avg_sentence_length = total_words / total_sentences
    avg_syllables_per_word = total_syllables / total_words

    fk_grade = 0.39 * avg_sentence_length + 11.8 * avg_syllables_per_word - 15.59
    fre = 206.835 - 1.015 * avg_sentence_length - 84.6 * avg_syllables_per_word

    return {
        "words": total_words,
        "sentences": total_sentences,
        "avg_sentence_length": round(avg_sentence_length, 1),
        "flesch_kincaid_grade": round(fk_grade, 1),
        "flesch_reading_ease": round(fre, 1),
    }

if __name__ == "__main__":
    sample = "This is a simple test. Short sentences are easy to read. Long words make text harder."
    print(analyze(sample))
