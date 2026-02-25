"""Basic SEO Checker — validates on-page SEO elements."""

def check_meta(title, description, keyword):
    """Check meta tag compliance."""
    issues = []
    if len(title) > 60:
        issues.append(f"Title too long: {len(title)} chars (max 60)")
    if len(title) < 30:
        issues.append(f"Title too short: {len(title)} chars (min 30)")
    if keyword.lower() not in title.lower():
        issues.append(f"Primary keyword '{keyword}' not in title")
    if len(description) > 155:
        issues.append(f"Description too long: {len(description)} chars (max 155)")
    if keyword.lower() not in description.lower():
        issues.append(f"Primary keyword '{keyword}' not in description")
    return {"passed": len(issues) == 0, "issues": issues}

if __name__ == "__main__":
    result = check_meta(
        "How to Build a FastAPI Application in 10 Minutes",
        "Learn how to build a production-ready FastAPI application with authentication, database, and Docker deployment.",
        "FastAPI"
    )
    print(f"Passed: {result['passed']}")
    for issue in result["issues"]:
        print(f"  - {issue}")
