"""Recipe composer — executes multi-template recipes to produce code artifacts."""

from pathlib import Path
from typing import Any

import structlog
from mds_common.templates.engine import MidasTemplateEngine
from mds_common.utils.file_ops import safe_write
from mds_common.utils.yaml_loader import load_yaml

logger = structlog.get_logger()


class RecipeComposer:
    """Executes multi-template recipes to produce complete code artifacts."""

    def __init__(self, engine: MidasTemplateEngine) -> None:
        self._engine = engine

    def execute_recipe(
        self,
        recipe_path: Path,
        variables: dict[str, Any],
        output_dir: Path,
    ) -> list[Path]:
        """Execute a recipe YAML, rendering all templates in order."""
        recipe = load_yaml(recipe_path)
        shared_vars: dict[str, Any] = {**recipe.get("vars", {}), **variables}
        created_files: list[Path] = []

        for step in recipe.get("steps", []):
            template_name: str = step["template"]
            output_name: str = step["output"]
            step_vars: dict[str, Any] = {**shared_vars, **step.get("vars", {})}

            rendered_output = output_name.format(**step_vars)
            output_path = output_dir / rendered_output

            content = self._engine.render(template_name, step_vars)
            safe_write(output_path, content)
            created_files.append(output_path)
            logger.debug(
                "recipe_step_rendered",
                template=template_name,
                output=str(output_path),
            )

        logger.info(
            "recipe_executed",
            recipe=str(recipe_path),
            files_created=len(created_files),
        )
        return created_files
