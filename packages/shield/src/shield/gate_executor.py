"""Gate executor — runs quality gates sequentially."""

from __future__ import annotations

import asyncio
from collections.abc import Callable
from dataclasses import dataclass, field
from typing import Any

import structlog
from mds_common.exceptions.base import QualityGateError
from mds_common.types.enums import QualityGateSeverity

logger = structlog.get_logger()

# Type alias for gate check functions
GateCheckFn = Callable[[dict[str, Any]], Any]


@dataclass
class GateResult:
    """Result from a quality gate check."""

    gate_name: str
    passed: bool
    severity: QualityGateSeverity = QualityGateSeverity.INFO
    message: str = ""
    details: dict[str, Any] = field(default_factory=dict)


class GateExecutor:
    """Runs quality gates sequentially. Halts on first critical failure."""

    def __init__(self) -> None:
        self._gates: list[tuple[str, GateCheckFn]] = []

    def register(self, name: str, check_fn: GateCheckFn) -> None:
        """Register a quality gate check function."""
        self._gates.append((name, check_fn))

    async def run_all(self, artifact: dict[str, Any]) -> list[GateResult]:
        """Run all registered gates against an artifact."""
        results: list[GateResult] = []
        for name, check_fn in self._gates:
            try:
                if asyncio.iscoroutinefunction(check_fn):
                    result = await check_fn(artifact)
                else:
                    result = check_fn(artifact)
                results.append(result)
                logger.info(
                    "gate_result",
                    gate=name,
                    passed=result.passed,
                    severity=result.severity.value,
                )
                if not result.passed and result.severity == QualityGateSeverity.CRITICAL:
                    logger.error(
                        "gate_critical_failure", gate=name, message=result.message
                    )
                    raise QualityGateError(
                        f"Critical gate failure: {name} — {result.message}"
                    )
            except QualityGateError:
                raise
            except Exception as e:
                results.append(
                    GateResult(
                        name,
                        False,
                        QualityGateSeverity.CRITICAL,
                        f"Gate crashed: {e}",
                    )
                )
                raise QualityGateError(f"Gate '{name}' crashed: {e}") from e
        return results
