"""Jinja2 template engine with YAML frontmatter and custom filters."""

import re
from pathlib import Path
from typing import Any

import jinja2
import yaml

from mds_common.exceptions.base import TemplateError
from mds_common.templates.filters import register_filters


class MidasTemplateEngine:
    """Jinja2 template engine with YAML frontmatter and custom filters."""

    FRONTMATTER_PATTERN = re.compile(r"\{#---\s*\n(.*?)\n\s*---#\}", re.DOTALL)

    def __init__(self, template_dirs: list[Path]) -> None:
        self.env = jinja2.Environment(
            loader=jinja2.FileSystemLoader([str(d) for d in template_dirs]),
            undefined=jinja2.StrictUndefined,
            trim_blocks=True,
            lstrip_blocks=True,
        )
        register_filters(self.env)

    def render(self, template_name: str, variables: dict[str, Any]) -> str:
        """Render a template with variables. Validates required vars from frontmatter."""
        try:
            template = self.env.get_template(template_name)
        except jinja2.TemplateNotFound as e:
            raise TemplateError(f"Template not found: {template_name}") from e

        source = self.env.loader.get_source(self.env, template_name)[0]  # type: ignore[union-attr]
        frontmatter = self._parse_frontmatter(source)
        self._validate_vars(frontmatter, variables, template_name)

        try:
            return template.render(**variables)
        except jinja2.UndefinedError as e:
            raise TemplateError(f"Missing variable in {template_name}: {e}") from e

    def _parse_frontmatter(self, source: str) -> dict[str, Any]:
        """Extract YAML frontmatter from a template source."""
        match = self.FRONTMATTER_PATTERN.search(source)
        if not match:
            return {}
        return yaml.safe_load(match.group(1)) or {}

    def _validate_vars(
        self,
        frontmatter: dict[str, Any],
        variables: dict[str, Any],
        template_name: str,
    ) -> None:
        """Validate that all required variables from frontmatter are present."""
        required: list[str] = frontmatter.get("vars", {}).get("required", [])
        missing = [v for v in required if v not in variables]
        if missing:
            raise TemplateError(
                f"Template '{template_name}' missing required vars: {missing}"
            )
