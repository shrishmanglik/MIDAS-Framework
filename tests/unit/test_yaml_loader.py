"""Tests for mds_common.utils.yaml_loader."""

from pathlib import Path

from mds_common.utils.yaml_loader import load_yaml, load_yaml_with_vars


class TestLoadYaml:
    def test_basic_yaml(self, tmp_path: Path) -> None:
        yaml_file = tmp_path / "test.yaml"
        yaml_file.write_text("name: test\nvalue: 42\n")
        result = load_yaml(yaml_file)
        assert result == {"name": "test", "value": 42}

    def test_empty_yaml(self, tmp_path: Path) -> None:
        yaml_file = tmp_path / "empty.yaml"
        yaml_file.write_text("")
        result = load_yaml(yaml_file)
        assert result == {}

    def test_nested_yaml(self, tmp_path: Path) -> None:
        yaml_file = tmp_path / "nested.yaml"
        yaml_file.write_text("parent:\n  child: value\n  list:\n    - a\n    - b\n")
        result = load_yaml(yaml_file)
        assert result["parent"]["child"] == "value"
        assert result["parent"]["list"] == ["a", "b"]

    def test_include(self, tmp_path: Path) -> None:
        included = tmp_path / "included.yaml"
        included.write_text("key: included_value\n")
        main = tmp_path / "main.yaml"
        main.write_text("data: !include included.yaml\n")
        result = load_yaml(main)
        assert result["data"] == {"key": "included_value"}


class TestLoadYamlWithVars:
    def test_variable_substitution(self, tmp_path: Path) -> None:
        yaml_file = tmp_path / "vars.yaml"
        yaml_file.write_text("name: ${PROJECT_NAME}\nversion: ${VERSION}\n")
        result = load_yaml_with_vars(
            yaml_file,
            {"PROJECT_NAME": "bookstore", "VERSION": "1.0"},
        )
        assert result["name"] == "bookstore"
        assert result["version"] == 1.0  # YAML parses "1.0" as float

    def test_no_variables(self, tmp_path: Path) -> None:
        yaml_file = tmp_path / "novars.yaml"
        yaml_file.write_text("name: static\n")
        result = load_yaml_with_vars(yaml_file)
        assert result["name"] == "static"
