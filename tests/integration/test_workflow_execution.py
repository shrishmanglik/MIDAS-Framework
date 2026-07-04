"""Integration test for workflow execution with mocked LLM provider."""

from __future__ import annotations

from pathlib import Path

from mds_common.schemas.workflow import WorkflowSpec
from mds_common.types.enums import StepStatus
from mds_common.utils.yaml_loader import load_yaml
from midas_core.agents.prompt_builder import PromptBuilder
from midas_core.agents.registry import AgentRegistry
from midas_core.agents.runtime import AgentRuntime
from midas_core.models.router import ModelRouter
from midas_core.state.manager import StateManager
from midas_core.state.persistence import InMemoryStateStore
from pulse.cost_tracker import CostTracker

from tests.conftest import MockLLMProvider  # noqa: TCH001

STUDIO_DIR = Path(__file__).resolve().parent.parent.parent / "studios" / "dev-studio"


class TestWorkflowExecution:
    async def test_plan_workflow(self, mock_provider: MockLLMProvider) -> None:
        """Test the plan workflow (architecture + schema design)."""
        workflow = WorkflowSpec(**load_yaml(STUDIO_DIR / "workflows" / "plan.yaml"))
        store = InMemoryStateStore()
        manager = StateManager(store, workflow)
        registry = AgentRegistry()
        registry.load_from_directory(STUDIO_DIR / "agents")

        router = ModelRouter()
        tracker = CostTracker(total_budget=0.50, run_id="plan-test")
        prompt_builder = PromptBuilder()
        runtime = AgentRuntime(
            provider=mock_provider, router=router, prompt_builder=prompt_builder,
        )

        await manager.initialize_run("plan-test")

        # Step 1: design-architecture (no deps)
        assert manager.get_ready_steps() == ["design-architecture"]
        await manager.transition("design-architecture", StepStatus.RUNNING)

        agent = registry.get("systems-architect")
        content, cost = await runtime.execute(
            agent=agent,
            task_description="Design architecture",
            run_id="plan-test",
            step_name="design-architecture",
        )
        tracker.record(cost)
        await manager.transition("design-architecture", StepStatus.COMPLETED)

        # Step 2: design-schema (depends on architecture)
        assert manager.get_ready_steps() == ["design-schema"]
        await manager.transition("design-schema", StepStatus.RUNNING)

        agent = registry.get("database-engineer")
        content, cost = await runtime.execute(
            agent=agent,
            task_description="Design database schema",
            run_id="plan-test",
            step_name="design-schema",
            upstream_outputs={"design-architecture": content},
        )
        tracker.record(cost)
        await manager.transition("design-schema", StepStatus.COMPLETED)

        assert manager.is_complete()
        assert mock_provider.call_count == 2

    async def test_build_workflow_parallel_steps(
        self, mock_provider: MockLLMProvider,
    ) -> None:
        """Test build workflow with parallel backend/frontend steps."""
        workflow = WorkflowSpec(**load_yaml(STUDIO_DIR / "workflows" / "build.yaml"))
        store = InMemoryStateStore()
        manager = StateManager(store, workflow)
        registry = AgentRegistry()
        registry.load_from_directory(STUDIO_DIR / "agents")

        router = ModelRouter()
        tracker = CostTracker(total_budget=0.50, run_id="build-test")
        prompt_builder = PromptBuilder()
        runtime = AgentRuntime(
            provider=mock_provider, router=router, prompt_builder=prompt_builder,
        )

        await manager.initialize_run("build-test")

        # Both steps should be ready simultaneously (no deps)
        ready = manager.get_ready_steps()
        assert len(ready) == 2
        assert "generate-backend" in ready
        assert "generate-frontend" in ready

        # Execute both
        for step_name in ready:
            step_spec = next(s for s in workflow.steps if s.name == step_name)
            await manager.transition(step_name, StepStatus.RUNNING)
            agent = registry.get(step_spec.agent or "backend-developer")
            _, cost = await runtime.execute(
                agent=agent,
                task_description=step_spec.description or step_name,
                run_id="build-test",
                step_name=step_name,
            )
            tracker.record(cost)
            await manager.transition(step_name, StepStatus.COMPLETED)

        assert manager.is_complete()
        assert mock_provider.call_count == 2
