"""YAML loader with !include support and variable resolution."""

from pathlib import Path
from typing import Any

import yaml


class YAMLLoader(yaml.SafeLoader):
    """Custom YAML loader with !include support."""


def _include_constructor(loader: YAMLLoader, node: yaml.Node) -> Any:
    """Handle !include directives by loading the referenced file."""
    filepath = Path(loader.name).parent / loader.construct_scalar(node)  # type: ignore[arg-type]
    with open(filepath) as f:
        return yaml.load(f, YAMLLoader)  # noqa: S506


YAMLLoader.add_constructor("!include", _include_constructor)


def load_yaml(path: Path) -> dict[str, Any]:
    """Load YAML file with !include support."""
    with open(path) as f:
        return yaml.load(f, YAMLLoader) or {}  # noqa: S506


def load_yaml_with_vars(
    path: Path, variables: dict[str, str] | None = None
) -> dict[str, Any]:
    """Load YAML and resolve ${VAR} references."""
    content = path.read_text()
    for key, value in (variables or {}).items():
        content = content.replace(f"${{{key}}}", value)
    return yaml.safe_load(content) or {}
