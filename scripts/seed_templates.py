#!/usr/bin/env python3
"""Seed script — validates all studio templates, agents, and workflows.

Run with: uv run python scripts/seed_templates.py
"""

from __future__ import annotations

import sys
from pathlib import Path

from mds_common.schemas.agent import AgentSpec
from mds_common.schemas.workflow import WorkflowSpec
from mds_common.templates.engine import MidasTemplateEngine
from mds_common.utils.yaml_loader import load_yaml


def main() -> int:
    """Validate and report on all studio assets."""
    studio_dir = Path("studios/dev-studio")
    errors: list[str] = []
    total = 0

    # Validate agents
    print("=== Agents ===")
    agents_dir = studio_dir / "agents"
    for f in sorted(agents_dir.glob("*.yaml")):
        try:
            spec = AgentSpec(**load_yaml(f))
            print(f"  OK: {spec.id} ({spec.name}) — {len(spec.capabilities)} capabilities")
            total += 1
        except Exception as e:
            errors.append(f"Agent {f.name}: {e}")
            print(f"  FAIL: {f.name}: {e}")

    # Validate workflows
    print("\n=== Workflows ===")
    wf_dir = studio_dir / "workflows"
    for f in sorted(wf_dir.glob("*.yaml")):
        try:
            spec = WorkflowSpec(**load_yaml(f))
            print(f"  OK: {spec.name} — {len(spec.steps)} steps")
            total += 1
        except Exception as e:
            errors.append(f"Workflow {f.name}: {e}")
            print(f"  FAIL: {f.name}: {e}")

    # Validate templates
    print("\n=== Templates ===")
    templates_dir = studio_dir / "templates"
    MidasTemplateEngine([templates_dir])  # validates templates load
    for f in sorted(templates_dir.rglob("*.j2")):
        try:
            rel = f.relative_to(templates_dir)
            f.read_text()  # verify readable
            print(f"  OK: {rel}")
            total += 1
        except Exception as e:
            errors.append(f"Template {f.name}: {e}")
            print(f"  FAIL: {f.name}: {e}")

    # Validate checklists
    print("\n=== Checklists ===")
    cl_dir = studio_dir / "checklists"
    for f in sorted(cl_dir.glob("*.yaml")):
        try:
            data = load_yaml(f)
            name = data.get("name", f.stem)
            gates = data.get("gates", [])
            print(f"  OK: {name} — {len(gates)} gates")
            total += 1
        except Exception as e:
            errors.append(f"Checklist {f.name}: {e}")
            print(f"  FAIL: {f.name}: {e}")

    # Validate recipes
    print("\n=== Recipes ===")
    recipes_dir = templates_dir / "recipes"
    for f in sorted(recipes_dir.glob("*.yaml")):
        try:
            data = load_yaml(f)
            name = data.get("name", f.stem)
            steps = data.get("steps", [])
            print(f"  OK: {name} — {len(steps)} steps")
            total += 1
        except Exception as e:
            errors.append(f"Recipe {f.name}: {e}")
            print(f"  FAIL: {f.name}: {e}")

    # Summary
    print("\n=== Summary ===")
    print(f"Total validated: {total}")
    print(f"Errors: {len(errors)}")
    if errors:
        print("\nFailed items:")
        for e in errors:
            print(f"  - {e}")
        return 1
    print("\nAll studio assets validated successfully!")
    return 0


if __name__ == "__main__":
    sys.exit(main())
