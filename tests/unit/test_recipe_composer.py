"""Tests for forge.recipe_composer."""

from pathlib import Path

from forge.recipe_composer import RecipeComposer
from mds_common.templates.engine import MidasTemplateEngine


class TestRecipeComposer:
    def test_execute_recipe(self, tmp_path: Path) -> None:
        # Create template directory with templates
        tmpl_dir = tmp_path / "templates"
        tmpl_dir.mkdir()
        (tmpl_dir / "main.py.j2").write_text(
            'app = create_app("{{ project_name }}")'
        )
        (tmpl_dir / "config.py.j2").write_text(
            'DB_NAME = "{{ db_name }}"'
        )

        # Create recipe
        recipe_dir = tmp_path / "recipes"
        recipe_dir.mkdir()
        recipe_file = recipe_dir / "test-recipe.yaml"
        recipe_file.write_text(
            "vars:\n"
            "  db_name: testdb\n"
            "steps:\n"
            "  - template: main.py.j2\n"
            "    output: '{project_name}/main.py'\n"
            "  - template: config.py.j2\n"
            "    output: '{project_name}/config.py'\n"
        )

        # Execute
        engine = MidasTemplateEngine([tmpl_dir])
        composer = RecipeComposer(engine)
        output_dir = tmp_path / "output"
        output_dir.mkdir()

        files = composer.execute_recipe(
            recipe_file,
            {"project_name": "myapp"},
            output_dir,
        )

        assert len(files) == 2
        assert (output_dir / "myapp" / "main.py").exists()
        assert (output_dir / "myapp" / "config.py").exists()

        main_content = (output_dir / "myapp" / "main.py").read_text()
        assert 'create_app("myapp")' in main_content

        config_content = (output_dir / "myapp" / "config.py").read_text()
        assert 'DB_NAME = "testdb"' in config_content

    def test_recipe_with_step_vars(self, tmp_path: Path) -> None:
        tmpl_dir = tmp_path / "templates"
        tmpl_dir.mkdir()
        (tmpl_dir / "file.j2").write_text("value={{ custom_var }}")

        recipe_file = tmp_path / "recipe.yaml"
        recipe_file.write_text(
            "steps:\n"
            "  - template: file.j2\n"
            "    output: out.txt\n"
            "    vars:\n"
            "      custom_var: hello\n"
        )

        engine = MidasTemplateEngine([tmpl_dir])
        composer = RecipeComposer(engine)
        output_dir = tmp_path / "output"
        output_dir.mkdir()

        files = composer.execute_recipe(recipe_file, {}, output_dir)
        assert len(files) == 1
        assert (output_dir / "out.txt").read_text() == "value=hello"
