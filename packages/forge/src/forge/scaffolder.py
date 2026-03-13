"""Scaffolder — orchestrates template matching, recipe selection, and generation."""

from pathlib import Path
from typing import Any

import structlog
from mds_common.templates.engine import MidasTemplateEngine

from forge.recipe_composer import RecipeComposer
from forge.task_matcher import TaskMatcher

logger = structlog.get_logger()


class Scaffolder:
    """Orchestrates template matching and code generation from recipes."""

    def __init__(self, template_dirs: list[Path], recipe_dir: Path) -> None:
        self._engine = MidasTemplateEngine(template_dirs)
        self._matcher = TaskMatcher()
        self._composer = RecipeComposer(self._engine)
        self._recipe_dir = recipe_dir

        for td in template_dirs:
            self._matcher.load_templates(td)

    def scaffold(
        self,
        task_description: str,
        variables: dict[str, Any],
        output_dir: Path,
    ) -> list[Path]:
        """Match a task to a recipe and generate output files."""
        matches = self._matcher.match(task_description, top_k=1)
        if not matches:
            logger.warning("no_template_match", task=task_description)
            return []

        best = matches[0]
        category = best.get("category", "")
        recipe_file = self._recipe_dir / f"{category}.yaml"

        if not recipe_file.exists():
            logger.warning("recipe_not_found", recipe=str(recipe_file))
            return []

        return self._composer.execute_recipe(recipe_file, variables, output_dir)
