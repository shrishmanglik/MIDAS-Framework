"""Checklist runner — loads YAML checklists and runs them as gate sequences."""

from pathlib import Path
from typing import Any

import structlog
from mds_common.types.enums import QualityGateSeverity
from mds_common.utils.yaml_loader import load_yaml

from shield.gate_executor import GateResult

logger = structlog.get_logger()


class ChecklistRunner:
    """Loads and evaluates YAML-defined quality checklists."""

    def run_checklist(
        self, checklist_path: Path, artifact: dict[str, Any]
    ) -> list[GateResult]:
        """Run a YAML checklist against an artifact."""
        checklist = load_yaml(checklist_path)
        results: list[GateResult] = []

        for item in checklist.get("checks", []):
            name = item.get("name", "unnamed")
            check_type = item.get("type", "exists")
            target = item.get("target", "")
            severity_str = item.get("severity", "info")
            severity = QualityGateSeverity(severity_str)

            if check_type == "exists":
                passed = Path(target.format(**artifact)).exists() if target else False
            elif check_type == "not_empty":
                path = Path(target.format(**artifact)) if target else None
                passed = path is not None and path.exists() and path.stat().st_size > 0
            elif check_type == "contains":
                path = Path(target.format(**artifact)) if target else None
                keyword = item.get("keyword", "")
                passed = (
                    path is not None
                    and path.exists()
                    and keyword in path.read_text()
                )
            else:
                passed = False

            results.append(
                GateResult(
                    gate_name=name,
                    passed=passed,
                    severity=severity,
                    message=f"Check '{name}' {'passed' if passed else 'failed'}",
                )
            )
            logger.debug("checklist_item", name=name, passed=passed)

        return results
