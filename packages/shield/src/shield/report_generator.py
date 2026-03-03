"""Report generator — formats gate results into human-readable reports."""

from shield.gate_executor import GateResult


def generate_report(results: list[GateResult], title: str = "Quality Gate Report") -> str:
    """Generate a human-readable report from gate results."""
    lines = [f"# {title}", ""]

    passed = sum(1 for r in results if r.passed)
    failed = len(results) - passed
    lines.append(f"**Results:** {passed} passed, {failed} failed, {len(results)} total")
    lines.append("")

    for r in results:
        status = "PASS" if r.passed else "FAIL"
        icon = "[+]" if r.passed else "[-]"
        lines.append(f"{icon} {status} | {r.gate_name} [{r.severity.value}]")
        if r.message:
            lines.append(f"    {r.message}")
        if r.details:
            for k, v in r.details.items():
                lines.append(f"    {k}: {v}")

    lines.append("")
    overall = "PASSED" if failed == 0 else "FAILED"
    lines.append(f"**Overall: {overall}**")

    return "\n".join(lines)
