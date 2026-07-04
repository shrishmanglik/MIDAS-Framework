"""Custom Jinja2 filters for MIDAS templates."""

import re

import jinja2


def snake_case(value: str) -> str:
    """Convert string to snake_case."""
    s1 = re.sub(r"(.)([A-Z][a-z]+)", r"\1_\2", value)
    return re.sub(r"([a-z0-9])([A-Z])", r"\1_\2", s1).lower().replace(" ", "_").replace("-", "_")


def camel_case(value: str) -> str:
    """Convert string to camelCase."""
    parts = re.split(r"[_\- ]+", value)
    return parts[0].lower() + "".join(p.capitalize() for p in parts[1:])


def pascal_case(value: str) -> str:
    """Convert string to PascalCase."""
    return "".join(p.capitalize() for p in re.split(r"[_\- ]+", value))


def kebab_case(value: str) -> str:
    """Convert string to kebab-case."""
    return snake_case(value).replace("_", "-")


def pluralize(value: str) -> str:
    """Naively pluralize an English word."""
    if value.endswith("y") and not value.endswith(("ay", "ey", "oy", "uy")):
        return value[:-1] + "ies"
    if value.endswith(("s", "x", "z", "sh", "ch")):
        return value + "es"
    return value + "s"


def register_filters(env: jinja2.Environment) -> None:
    """Register all custom filters on a Jinja2 environment."""
    env.filters["snake_case"] = snake_case
    env.filters["camel_case"] = camel_case
    env.filters["pascal_case"] = pascal_case
    env.filters["kebab_case"] = kebab_case
    env.filters["pluralize"] = pluralize
