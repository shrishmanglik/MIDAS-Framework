"""Task matcher — matches task descriptions to templates using keyword scoring."""

import re
from pathlib import Path
from typing import Any

import structlog
import yaml

logger = structlog.get_logger()


class TaskMatcher:
    """Matches task descriptions to templates using keyword scoring."""

    def __init__(self) -> None:
        self._templates: dict[str, dict[str, Any]] = {}

    def load_templates(self, template_dir: Path) -> int:
        """Index all templates by parsing their frontmatter tags/keywords."""
        count = 0
        for j2_file in template_dir.rglob("*.j2"):
            frontmatter = self._extract_frontmatter(j2_file)
            if frontmatter:
                template_id = str(frontmatter.get("id", j2_file.stem))
                self._templates[template_id] = {
                    "path": str(j2_file),
                    "tags": frontmatter.get("tags", []),
                    "category": frontmatter.get("category", ""),
                    "description": frontmatter.get("description", ""),
                }
                count += 1
        logger.info("templates_indexed", count=count)
        return count

    def match(self, task_description: str, top_k: int = 3) -> list[dict[str, Any]]:
        """Score and rank templates against a task description."""
        task_words = set(task_description.lower().split())
        scored: list[dict[str, Any]] = []
        for tid, meta in self._templates.items():
            tag_words = set(
                w.lower() for t in meta["tags"] for w in str(t).split()
            )
            overlap = len(task_words & tag_words)
            if overlap > 0:
                scored.append({"template_id": tid, "score": overlap, **meta})
        scored.sort(key=lambda x: x["score"], reverse=True)
        return scored[:top_k]

    def _extract_frontmatter(self, path: Path) -> dict[str, Any] | None:
        """Extract YAML frontmatter from a Jinja2 template."""
        content = path.read_text()
        match = re.search(r"\{#---\s*\n(.*?)\n\s*---#\}", content, re.DOTALL)
        if match:
            result: dict[str, Any] | None = yaml.safe_load(match.group(1))
            return result
        return None
