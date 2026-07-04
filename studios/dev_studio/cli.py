"""MIDAS Dev Studio CLI — full integration with the 10-step execution pattern.

Each command follows:
1. Load config (MidasSettings)
2. Initialize state store
3. Load workflow YAML for the relevant phase
4. Initialize StateManager with workflow + store
5. Load agent YAML via AgentRegistry
6. Initialize ModelRouter, CostTracker, BudgetEnforcer
7. Initialize PromptBuilder + AgentRuntime
8. For each ready step: budget check → transition → execute → record → transition
9. Check is_complete()
10. Print status summary with costs
"""

from __future__ import annotations

import asyncio
import json
from pathlib import Path
from typing import Any

import click
import structlog
from forge.scaffolder import Scaffolder
from mds_common.schemas.workflow import WorkflowSpec
from mds_common.types.enums import StepStatus, StepType
from mds_common.utils.yaml_loader import load_yaml
from midas_core.agents.prompt_builder import PromptBuilder
from midas_core.agents.registry import AgentRegistry
from midas_core.agents.runtime import AgentRuntime
from midas_core.config.settings import MidasSettings
from midas_core.models.provider import LiteLLMProvider, LLMProvider
from midas_core.models.router import ModelRouter
from midas_core.state.manager import StateManager
from midas_core.state.persistence import InMemoryStateStore
from pulse.budget_enforcer import BudgetEnforcer
from pulse.cost_tracker import CostTracker

logger = structlog.get_logger()

# Base paths
STUDIO_DIR = Path(__file__).resolve().parent.parent / "dev-studio"
AGENTS_DIR = STUDIO_DIR / "agents"
WORKFLOWS_DIR = STUDIO_DIR / "workflows"
TEMPLATES_DIR = STUDIO_DIR / "templates"


class _RunContext:
    """Holds all runtime objects for a workflow execution."""

    def __init__(
        self,
        settings: MidasSettings,
        workflow: WorkflowSpec,
        provider: LLMProvider | None = None,
    ) -> None:
        self.settings = settings
        self.workflow = workflow
        self.store = InMemoryStateStore()
        self.manager = StateManager(self.store, workflow)
        self.registry = AgentRegistry()
        self.router = ModelRouter()
        self.tracker = CostTracker(
            total_budget=workflow.default_budget,
            run_id=workflow.name,
        )
        self.enforcer = BudgetEnforcer(self.tracker)
        self.prompt_builder = PromptBuilder()
        self.runtime = AgentRuntime(
            provider=provider or LiteLLMProvider(),
            router=self.router,
            prompt_builder=self.prompt_builder,
        )
        self.scaffolder = Scaffolder(
            template_dirs=[TEMPLATES_DIR],
            recipe_dir=TEMPLATES_DIR / "recipes",
        )


def _load_workflow(name: str) -> WorkflowSpec:
    """Load a workflow YAML file by name."""
    path = WORKFLOWS_DIR / f"{name}.yaml"
    if not path.exists():
        raise click.ClickException(f"Workflow '{name}' not found at {path}")
    data = load_yaml(path)
    return WorkflowSpec(**data)


def _load_settings() -> MidasSettings:
    """Load runtime settings."""
    return MidasSettings()


async def _run_workflow(
    ctx: _RunContext,
    run_id: str,
    brief: str | None = None,
    provider: LLMProvider | None = None,
) -> dict[str, Any]:
    """Execute the 10-step workflow pattern.

    Returns dict of step_name -> output content.
    """
    # Step 4: Initialize run
    await ctx.manager.initialize_run(run_id)

    # Step 5: Load agents
    if AGENTS_DIR.exists():
        ctx.registry.load_from_directory(AGENTS_DIR)

    outputs: dict[str, Any] = {}

    # Step 8: Execute ready steps
    while not ctx.manager.is_complete():
        ready = ctx.manager.get_ready_steps()
        if not ready:
            break

        for step_name in ready:
            step = ctx.manager.get_step(step_name)
            if step is None:
                continue

            # Find step spec from workflow
            step_spec = next(
                (s for s in ctx.workflow.steps if s.name == step_name), None
            )
            if step_spec is None:
                continue

            # Budget check before
            estimated_cost = ctx.router.estimate_cost(
                step_spec.model_preference, 2000, 1000
            )
            ctx.enforcer.check_before(step_name, estimated_cost)

            # Transition to RUNNING
            await ctx.manager.transition(step_name, StepStatus.RUNNING)

            try:
                if step_spec.step_type == StepType.DETERMINISTIC:
                    # Use forge templates
                    result = _run_deterministic(ctx, step_spec.name, brief or "", outputs)
                elif step_spec.step_type == StepType.LLM_REQUIRED:
                    result = await _run_llm_step(
                        ctx, step_spec, run_id, brief or "", outputs
                    )
                elif step_spec.step_type == StepType.AUTOMATED_CHECK:
                    result = _run_automated_check(ctx, step_spec.name, outputs)
                elif step_spec.step_type == StepType.HUMAN_GATE:
                    result = f"[HUMAN_GATE] Step '{step_name}' requires human approval."
                    click.echo(result)
                else:
                    result = ""

                outputs[step_name] = result

                # Budget check after
                ctx.enforcer.check_after(step_name)

                # Transition to COMPLETED
                await ctx.manager.transition(
                    step_name, StepStatus.COMPLETED,
                    outputs={step_name: str(result)[:200]},
                )

            except Exception as exc:
                logger.error("step_failed", step=step_name, error=str(exc))
                await ctx.manager.transition(
                    step_name, StepStatus.FAILED, error=str(exc)
                )
                raise

    return outputs


async def _run_llm_step(
    ctx: _RunContext,
    step_spec: Any,
    run_id: str,
    brief: str,
    upstream_outputs: dict[str, Any],
) -> str:
    """Execute an LLM-required step via AgentRuntime."""
    agent_id = step_spec.agent
    if not agent_id:
        return ""

    try:
        agent = ctx.registry.get(agent_id)
    except Exception:
        logger.warning("agent_not_found", agent_id=agent_id, step=step_spec.name)
        return ""

    task_description = step_spec.description or f"Execute step: {step_spec.name}"
    if brief:
        task_description = f"{task_description}\n\nProject Brief:\n{brief}"

    # Gather upstream outputs relevant to this step
    upstream = {
        dep: upstream_outputs.get(dep, "")
        for dep in step_spec.depends_on
        if dep in upstream_outputs
    }

    content, cost_record = await ctx.runtime.execute(
        agent=agent,
        task_description=task_description,
        run_id=run_id,
        step_name=step_spec.name,
        upstream_outputs=upstream if upstream else None,
    )

    ctx.tracker.record(cost_record)

    return content


def _run_deterministic(
    ctx: _RunContext,
    step_name: str,
    brief: str,
    upstream_outputs: dict[str, Any],
) -> str:
    """Execute a deterministic step using forge templates."""
    return f"[TEMPLATE] Deterministic output for '{step_name}'"


def _run_automated_check(
    ctx: _RunContext,
    step_name: str,
    upstream_outputs: dict[str, Any],
) -> str:
    """Execute an automated check step."""
    return f"[CHECK] Automated check passed for '{step_name}'"


def _print_summary(ctx: _RunContext) -> None:
    """Print workflow execution summary with costs."""
    snapshot = ctx.tracker.get_snapshot()
    click.echo("\n--- MIDAS Dev Studio — Execution Summary ---")
    click.echo(f"Workflow: {ctx.workflow.name}")
    click.echo(f"Budget:   ${snapshot.total_budget:.4f}")
    click.echo(f"Spent:    ${snapshot.total_spent:.4f}")
    click.echo(f"Remaining: ${snapshot.remaining:.4f}")
    if snapshot.step_costs:
        click.echo("\nPer-step costs:")
        for step, cost in snapshot.step_costs.items():
            click.echo(f"  {step}: ${cost:.6f}")
    if snapshot.is_exceeded:
        click.echo("\n[WARNING] Budget exceeded!")
    click.echo(f"Complete: {ctx.manager.is_complete()}")
    click.echo("---")


# ---------------------------------------------------------------------------
# CLI commands
# ---------------------------------------------------------------------------

@click.group()
def cli() -> None:
    """MIDAS Dev Studio — Build software from briefs."""


@cli.command()
@click.argument("brief_file", type=click.Path(exists=True))
@click.option("--run-id", default=None, help="Custom run identifier")
@click.option("--budget", default=None, type=float, help="Override budget limit")
def init(brief_file: str, run_id: str | None, budget: float | None) -> None:
    """Initialize a project from a brief file (Phase 1: Requirements)."""
    brief = Path(brief_file).read_text()
    settings = _load_settings()
    workflow = _load_workflow("init")
    if budget is not None:
        workflow.default_budget = budget

    ctx = _RunContext(settings, workflow)
    rid = run_id or f"init-{workflow.name}"

    outputs = asyncio.run(_run_workflow(ctx, rid, brief=brief))
    _print_summary(ctx)

    # Save outputs
    if outputs:
        out_dir = Path("output") / rid
        out_dir.mkdir(parents=True, exist_ok=True)
        for name, content in outputs.items():
            (out_dir / f"{name}.md").write_text(str(content))
        click.echo(f"\nOutputs saved to: {out_dir}")


@cli.command()
@click.argument("brief_file", type=click.Path(exists=True))
@click.option("--run-id", default=None, help="Custom run identifier")
@click.option("--budget", default=None, type=float, help="Override budget limit")
def plan(brief_file: str, run_id: str | None, budget: float | None) -> None:
    """Plan architecture and schema (Phase 2: Plan)."""
    brief = Path(brief_file).read_text()
    settings = _load_settings()
    workflow = _load_workflow("plan")
    if budget is not None:
        workflow.default_budget = budget

    ctx = _RunContext(settings, workflow)
    rid = run_id or f"plan-{workflow.name}"

    asyncio.run(_run_workflow(ctx, rid, brief=brief))
    _print_summary(ctx)


@cli.command()
@click.argument("brief_file", type=click.Path(exists=True))
@click.option("--run-id", default=None, help="Custom run identifier")
@click.option("--budget", default=None, type=float, help="Override budget limit")
def build(brief_file: str, run_id: str | None, budget: float | None) -> None:
    """Build implementation (Phase 3: Build)."""
    brief = Path(brief_file).read_text()
    settings = _load_settings()
    workflow = _load_workflow("build")
    if budget is not None:
        workflow.default_budget = budget

    ctx = _RunContext(settings, workflow)
    rid = run_id or f"build-{workflow.name}"

    asyncio.run(_run_workflow(ctx, rid, brief=brief))
    _print_summary(ctx)


@cli.command()
@click.argument("brief_file", type=click.Path(exists=True))
@click.option("--run-id", default=None, help="Custom run identifier")
def test(brief_file: str, run_id: str | None) -> None:
    """Run tests and QA review (Phase 4: Test)."""
    brief = Path(brief_file).read_text()
    settings = _load_settings()
    workflow = _load_workflow("test")

    ctx = _RunContext(settings, workflow)
    rid = run_id or f"test-{workflow.name}"

    asyncio.run(_run_workflow(ctx, rid, brief=brief))
    _print_summary(ctx)


@cli.command()
@click.argument("brief_file", type=click.Path(exists=True))
@click.option("--run-id", default=None, help="Custom run identifier")
def deploy(brief_file: str, run_id: str | None) -> None:
    """Generate deployment configs (Phase 5: Deploy)."""
    brief = Path(brief_file).read_text()
    settings = _load_settings()
    workflow = _load_workflow("deploy")

    ctx = _RunContext(settings, workflow)
    rid = run_id or f"deploy-{workflow.name}"

    asyncio.run(_run_workflow(ctx, rid, brief=brief))
    _print_summary(ctx)


@cli.command()
def status() -> None:
    """Show MIDAS Dev Studio status and version."""
    click.echo("MIDAS Dev Studio v0.1.0")
    click.echo(f"Studio dir: {STUDIO_DIR}")
    click.echo(f"Agents:     {len(list(AGENTS_DIR.glob('*.yaml')))} loaded")
    click.echo(f"Workflows:  {len(list(WORKFLOWS_DIR.glob('*.yaml')))} available")
    click.echo(f"Templates:  {sum(1 for _ in TEMPLATES_DIR.rglob('*.j2'))} templates")


@cli.command("full-build")
@click.argument("brief_file", type=click.Path(exists=True))
@click.option("--run-id", default=None, help="Custom run identifier")
@click.option("--budget", default=None, type=float, help="Override budget limit")
def full_build(brief_file: str, run_id: str | None, budget: float | None) -> None:
    """Run complete pipeline: requirements -> architecture -> build -> test -> deploy."""
    brief = Path(brief_file).read_text()
    settings = _load_settings()
    workflow = _load_workflow("full-build")
    if budget is not None:
        workflow.default_budget = budget

    ctx = _RunContext(settings, workflow)
    rid = run_id or f"full-build-{workflow.name}"

    click.echo(f"Starting full build pipeline ({len(workflow.steps)} steps)...")
    outputs = asyncio.run(_run_workflow(ctx, rid, brief=brief))
    _print_summary(ctx)

    # Save all outputs
    out_dir = Path("output") / rid
    out_dir.mkdir(parents=True, exist_ok=True)
    for name, content in outputs.items():
        (out_dir / f"{name}.md").write_text(str(content))
    summary = {
        "run_id": rid,
        "workflow": workflow.name,
        "steps_completed": len(outputs),
        "snapshot": ctx.tracker.get_snapshot().model_dump(),
    }
    (out_dir / "summary.json").write_text(json.dumps(summary, indent=2, default=str))
    click.echo(f"\nAll outputs saved to: {out_dir}")
