"""Built-in quality gate validators — deterministic, no LLM needed."""

from pathlib import Path
from typing import Any

from mds_common.types.enums import QualityGateSeverity

from shield.gate_executor import GateResult


def file_exists_gate(artifact: dict[str, Any]) -> GateResult:
    """Gate: Check all expected output files exist."""
    missing = [
        f for f in artifact.get("expected_files", []) if not Path(f).exists()
    ]
    return GateResult(
        gate_name="file_exists",
        passed=len(missing) == 0,
        severity=QualityGateSeverity.CRITICAL,
        message=f"Missing files: {missing}" if missing else "All files present",
        details={"missing": missing},
    )


def no_todos_gate(artifact: dict[str, Any]) -> GateResult:
    """Gate: No TODO/FIXME/HACK in generated code."""
    issues: list[str] = []
    for filepath in artifact.get("generated_files", []):
        path = Path(filepath)
        if path.exists():
            content = path.read_text()
            for i, line in enumerate(content.splitlines(), 1):
                for marker in ("TODO", "FIXME", "HACK", "XXX"):
                    if marker in line:
                        issues.append(f"{filepath}:{i}: {marker}")
    return GateResult(
        gate_name="no_todos",
        passed=len(issues) == 0,
        severity=QualityGateSeverity.WARNING,
        message=f"{len(issues)} markers found" if issues else "Clean",
        details={"issues": issues},
    )


def schema_compliance_gate(artifact: dict[str, Any]) -> GateResult:
    """Gate: Output matches expected schema structure."""
    schema = artifact.get("expected_schema")
    output = artifact.get("output")
    if schema is None or output is None:
        return GateResult(
            gate_name="schema_compliance", passed=True, message="No schema to check"
        )
    try:
        schema.model_validate(output)
        return GateResult(
            gate_name="schema_compliance", passed=True, message="Schema valid"
        )
    except Exception as e:
        return GateResult(
            gate_name="schema_compliance",
            passed=False,
            severity=QualityGateSeverity.CRITICAL,
            message=f"Schema violation: {e}",
        )
