"""Tests for mds_common.templates.engine and filters."""

from pathlib import Path

import pytest
from mds_common.exceptions.base import TemplateError
from mds_common.templates.engine import MidasTemplateEngine
from mds_common.templates.filters import (
    camel_case,
    kebab_case,
    pascal_case,
    pluralize,
    snake_case,
)


class TestFilters:
    def test_snake_case(self) -> None:
        assert snake_case("MyClass") == "my_class"
        assert snake_case("HTMLParser") == "html_parser"
        assert snake_case("my-component") == "my_component"
        assert snake_case("hello world") == "hello_world"

    def test_camel_case(self) -> None:
        assert camel_case("my_class") == "myClass"
        assert camel_case("hello-world") == "helloWorld"
        assert camel_case("one_two_three") == "oneTwoThree"

    def test_pascal_case(self) -> None:
        assert pascal_case("my_class") == "MyClass"
        assert pascal_case("hello-world") == "HelloWorld"

    def test_kebab_case(self) -> None:
        assert kebab_case("MyClass") == "my-class"
        assert kebab_case("hello_world") == "hello-world"

    def test_pluralize(self) -> None:
        assert pluralize("book") == "books"
        assert pluralize("category") == "categories"
        assert pluralize("bus") == "buses"
        assert pluralize("box") == "boxes"
        assert pluralize("church") == "churches"
        assert pluralize("day") == "days"
        assert pluralize("key") == "keys"


class TestMidasTemplateEngine:
    def test_render_basic(self, tmp_path: Path) -> None:
        template = tmp_path / "test.txt.j2"
        template.write_text("Hello {{ name }}!")
        engine = MidasTemplateEngine([tmp_path])
        result = engine.render("test.txt.j2", {"name": "World"})
        assert result == "Hello World!"

    def test_render_with_filters(self, tmp_path: Path) -> None:
        template = tmp_path / "test.py.j2"
        template.write_text("class {{ entity | pascal_case }}:\n    pass")
        engine = MidasTemplateEngine([tmp_path])
        result = engine.render("test.py.j2", {"entity": "my_model"})
        assert result == "class MyModel:\n    pass"

    def test_frontmatter_validation(self, tmp_path: Path) -> None:
        template = tmp_path / "strict.j2"
        template.write_text(
            "{#---\nvars:\n  required: [project_name, description]\n---#}\n"
            "# {{ project_name }}\n{{ description }}"
        )
        engine = MidasTemplateEngine([tmp_path])
        # Should fail with missing vars
        with pytest.raises(TemplateError, match="missing required vars"):
            engine.render("strict.j2", {"project_name": "test"})
        # Should succeed with all vars
        result = engine.render(
            "strict.j2",
            {"project_name": "test", "description": "A test project"},
        )
        assert "# test" in result

    def test_template_not_found(self, tmp_path: Path) -> None:
        engine = MidasTemplateEngine([tmp_path])
        with pytest.raises(TemplateError, match="Template not found"):
            engine.render("nonexistent.j2", {})

    def test_missing_variable(self, tmp_path: Path) -> None:
        template = tmp_path / "missing.j2"
        template.write_text("{{ undefined_var }}")
        engine = MidasTemplateEngine([tmp_path])
        with pytest.raises(TemplateError, match="Missing variable"):
            engine.render("missing.j2", {})

    def test_multiple_template_dirs(self, tmp_path: Path) -> None:
        dir1 = tmp_path / "dir1"
        dir2 = tmp_path / "dir2"
        dir1.mkdir()
        dir2.mkdir()
        (dir1 / "a.j2").write_text("from dir1: {{ x }}")
        (dir2 / "b.j2").write_text("from dir2: {{ y }}")
        engine = MidasTemplateEngine([dir1, dir2])
        assert engine.render("a.j2", {"x": "1"}) == "from dir1: 1"
        assert engine.render("b.j2", {"y": "2"}) == "from dir2: 2"
