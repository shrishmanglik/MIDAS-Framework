"""WCAG Contrast Ratio Checker"""

def relative_luminance(r, g, b):
    """Calculate relative luminance per WCAG 2.1."""
    def linearize(c):
        c = c / 255.0
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b)

def contrast_ratio(color1, color2):
    """Calculate contrast ratio between two RGB tuples."""
    l1 = relative_luminance(*color1)
    l2 = relative_luminance(*color2)
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)

def check_wcag(fg, bg):
    """Check WCAG 2.1 AA compliance."""
    ratio = contrast_ratio(fg, bg)
    return {
        "ratio": round(ratio, 2),
        "aa_normal": ratio >= 4.5,
        "aa_large": ratio >= 3.0,
        "aaa_normal": ratio >= 7.0,
        "aaa_large": ratio >= 4.5,
    }

def hex_to_rgb(hex_color):
    """Convert hex color to RGB tuple."""
    hex_color = hex_color.lstrip("#")
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

if __name__ == "__main__":
    import sys
    if len(sys.argv) == 3:
        fg = hex_to_rgb(sys.argv[1])
        bg = hex_to_rgb(sys.argv[2])
        result = check_wcag(fg, bg)
        print(f"Contrast ratio: {result['ratio']}:1")
        print(f"AA Normal text: {'PASS' if result['aa_normal'] else 'FAIL'}")
        print(f"AA Large text:  {'PASS' if result['aa_large'] else 'FAIL'}")
    else:
        print("Usage: python contrast_checker.py #foreground #background")
