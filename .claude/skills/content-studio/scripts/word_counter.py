"""Word Counter — analyzes content length and structure."""

def analyze(text):
    """Analyze text structure and word count."""
    lines = text.split("\n")
    words = text.split()
    headers = [l for l in lines if l.startswith("#")]
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip() and not p.strip().startswith("#")]

    return {
        "total_words": len(words),
        "total_lines": len(lines),
        "headers": len(headers),
        "paragraphs": len(paragraphs),
        "avg_paragraph_words": round(len(words) / max(1, len(paragraphs)), 1),
        "estimated_read_time_min": round(len(words) / 250, 1),
    }

if __name__ == "__main__":
    sample = """# Test Article\n\nThis is the first paragraph with some words.\n\n## Section Two\n\nAnother paragraph here with different content."""
    print(analyze(sample))
