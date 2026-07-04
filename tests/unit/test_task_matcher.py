"""Tests for forge.task_matcher."""

from pathlib import Path

from forge.task_matcher import TaskMatcher

TEMPLATE_WITH_FRONTMATTER = """\
{#---
id: fastapi-main
category: fastapi
tags: [fastapi, main, entrypoint, api, server]
description: FastAPI main application entry point
---#}
from fastapi import FastAPI
app = FastAPI(title="{{ project_name }}")
"""


class TestTaskMatcher:
    def test_load_templates(self, tmp_path: Path) -> None:
        (tmp_path / "main.py.j2").write_text(TEMPLATE_WITH_FRONTMATTER)
        matcher = TaskMatcher()
        count = matcher.load_templates(tmp_path)
        assert count == 1

    def test_match_by_tags(self, tmp_path: Path) -> None:
        (tmp_path / "main.py.j2").write_text(TEMPLATE_WITH_FRONTMATTER)
        matcher = TaskMatcher()
        matcher.load_templates(tmp_path)
        results = matcher.match("build a fastapi server")
        assert len(results) > 0
        assert results[0]["template_id"] == "fastapi-main"

    def test_no_match(self, tmp_path: Path) -> None:
        (tmp_path / "main.py.j2").write_text(TEMPLATE_WITH_FRONTMATTER)
        matcher = TaskMatcher()
        matcher.load_templates(tmp_path)
        results = matcher.match("deploy kubernetes cluster")
        assert len(results) == 0

    def test_template_without_frontmatter(self, tmp_path: Path) -> None:
        (tmp_path / "plain.j2").write_text("{{ name }}")
        matcher = TaskMatcher()
        count = matcher.load_templates(tmp_path)
        assert count == 0

    def test_top_k_limit(self, tmp_path: Path) -> None:
        for i in range(5):
            t = tmp_path / f"t{i}.j2"
            t.write_text(
                f"{{#---\nid: t{i}\ntags: [common, shared]\n---#}}\ncontent"
            )
        matcher = TaskMatcher()
        matcher.load_templates(tmp_path)
        results = matcher.match("common shared template", top_k=2)
        assert len(results) == 2
