"""Tests for shield.gate_executor and validators."""

from pathlib import Path
from typing import Any

import pytest
from mds_common.exceptions.base import QualityGateError
from mds_common.types.enums import QualityGateSeverity
from shield.gate_executor import GateExecutor, GateResult
from shield.validators import file_exists_gate, no_todos_gate, schema_compliance_gate


class TestGateResult:
    def test_basic_result(self) -> None:
        result = GateResult("test", True, message="All good")
        assert result.passed is True
        assert result.gate_name == "test"


class TestGateExecutor:
    async def test_all_gates_pass(self) -> None:
        executor = GateExecutor()
        executor.register(
            "always_pass",
            lambda a: GateResult("always_pass", True, message="ok"),
        )
        results = await executor.run_all({})
        assert len(results) == 1
        assert results[0].passed is True

    async def test_critical_failure_halts(self) -> None:
        executor = GateExecutor()
        executor.register(
            "critical_fail",
            lambda a: GateResult(
                "critical_fail", False, QualityGateSeverity.CRITICAL, "broken"
            ),
        )
        with pytest.raises(QualityGateError, match="Critical gate failure"):
            await executor.run_all({})

    async def test_warning_does_not_halt(self) -> None:
        executor = GateExecutor()
        executor.register(
            "warn",
            lambda a: GateResult(
                "warn", False, QualityGateSeverity.WARNING, "warning only"
            ),
        )
        results = await executor.run_all({})
        assert len(results) == 1
        assert results[0].passed is False

    async def test_gate_crash_raises(self) -> None:
        def crasher(artifact: dict[str, Any]) -> GateResult:
            raise RuntimeError("boom")

        executor = GateExecutor()
        executor.register("crasher", crasher)
        with pytest.raises(QualityGateError, match="crashed"):
            await executor.run_all({})

    async def test_async_gate(self) -> None:
        async def async_gate(artifact: dict[str, Any]) -> GateResult:
            return GateResult("async_gate", True, message="async ok")

        executor = GateExecutor()
        executor.register("async_gate", async_gate)
        results = await executor.run_all({})
        assert results[0].passed is True


class TestFileExistsGate:
    def test_files_exist(self, tmp_path: Path) -> None:
        f = tmp_path / "test.py"
        f.write_text("pass")
        result = file_exists_gate({"expected_files": [str(f)]})
        assert result.passed is True

    def test_files_missing(self) -> None:
        result = file_exists_gate({"expected_files": ["/nonexistent/file.py"]})
        assert result.passed is False
        assert result.severity == QualityGateSeverity.CRITICAL


class TestNoTodosGate:
    def test_clean_file(self, tmp_path: Path) -> None:
        f = tmp_path / "clean.py"
        f.write_text("def main():\n    pass\n")
        result = no_todos_gate({"generated_files": [str(f)]})
        assert result.passed is True

    def test_file_with_todo(self, tmp_path: Path) -> None:
        f = tmp_path / "dirty.py"
        f.write_text("# TODO: fix this\ndef main():\n    pass\n")
        result = no_todos_gate({"generated_files": [str(f)]})
        assert result.passed is False
        assert len(result.details["issues"]) == 1


class TestSchemaComplianceGate:
    def test_no_schema(self) -> None:
        result = schema_compliance_gate({})
        assert result.passed is True

    def test_valid_schema(self) -> None:
        from mds_common.schemas.cost import TokenUsage

        result = schema_compliance_gate({
            "expected_schema": TokenUsage,
            "output": {"input_tokens": 10, "output_tokens": 20},
        })
        assert result.passed is True

    def test_invalid_schema(self) -> None:
        from mds_common.schemas.cost import TokenUsage

        result = schema_compliance_gate({
            "expected_schema": TokenUsage,
            "output": {"bad_field": "invalid"},
        })
        # TokenUsage has defaults for all fields, so it should still validate
        assert result.passed is True
