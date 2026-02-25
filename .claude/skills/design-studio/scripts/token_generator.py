"""Generate CSS Custom Properties from token specification."""

def generate_css(tokens):
    """Convert token dict to CSS custom properties."""
    lines = [":root {"]
    for category, values in tokens.items():
        lines.append(f"  /* {category} */")
        for name, value in values.items():
            lines.append(f"  --{category}-{name}: {value};")
        lines.append("")
    lines.append("}")
    return "\n".join(lines)

EXAMPLE_TOKENS = {
    "color": {
        "primary": "#2563EB",
        "secondary": "#7C3AED",
        "surface": "#FFFFFF",
        "background": "#F8FAFC",
        "text-primary": "#0F172A",
        "text-secondary": "#64748B",
        "error": "#DC2626",
        "success": "#16A34A",
        "warning": "#D97706",
    },
    "space": {
        "1": "0.25rem",
        "2": "0.5rem",
        "3": "0.75rem",
        "4": "1rem",
        "6": "1.5rem",
        "8": "2rem",
        "12": "3rem",
    },
    "font-size": {
        "xs": "0.75rem",
        "sm": "0.875rem",
        "base": "1rem",
        "lg": "1.125rem",
        "xl": "1.5rem",
        "2xl": "2rem",
        "3xl": "2.5rem",
    },
}

if __name__ == "__main__":
    print(generate_css(EXAMPLE_TOKENS))
