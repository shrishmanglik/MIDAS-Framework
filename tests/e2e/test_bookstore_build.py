"""E2E acceptance test — full bookstore build with mocked LLM.

This test chains fixture responses through the full-build workflow:
1. Product Manager parses requirements
2. Systems Architect designs architecture
3. Database Engineer designs schema
4. Backend Developer generates code
5. Frontend Developer generates code
6. QA Engineer generates tests
7. DevOps Engineer generates deployment configs

All LLM calls use MockLLMProvider returning canned fixture responses.
"""

from __future__ import annotations

from pathlib import Path

import pytest
from mds_common.schemas.workflow import WorkflowSpec
from mds_common.types.enums import StepStatus
from mds_common.utils.yaml_loader import load_yaml
from midas_core.agents.prompt_builder import PromptBuilder
from midas_core.agents.registry import AgentRegistry
from midas_core.agents.runtime import AgentRuntime
from midas_core.models.router import ModelRouter
from midas_core.state.manager import StateManager
from midas_core.state.persistence import InMemoryStateStore
from pulse.budget_enforcer import BudgetEnforcer
from pulse.cost_tracker import CostTracker

from tests.conftest import MockLLMProvider  # noqa: TCH001

STUDIO_DIR = Path(__file__).resolve().parent.parent.parent / "studios" / "dev-studio"


@pytest.fixture()
def bookstore_brief() -> str:
    """A simple bookstore project brief for E2E testing."""
    return (
        "Build a web-based bookstore application that allows users to browse, "
        "search, and purchase books online. The application should have a FastAPI "
        "backend with PostgreSQL database and a Next.js frontend. Include user "
        "authentication, shopping cart, and admin panel for managing inventory."
    )


class TestBookstoreBuild:
    async def test_full_build_pipeline(
        self,
        mock_provider: MockLLMProvider,
        bookstore_brief: str,
    ) -> None:
        """Test the complete full-build workflow with mocked LLM responses."""
        # 1. Load workflow
        workflow_path = STUDIO_DIR / "workflows" / "full-build.yaml"
        raw = load_yaml(workflow_path)
        workflow = WorkflowSpec(**raw)

        # 2. Initialize state store and manager
        store = InMemoryStateStore()
        manager = StateManager(store, workflow)

        # 3. Load agents
        registry = AgentRegistry()
        registry.load_from_directory(STUDIO_DIR / "agents")
        assert registry.count == 7

        # 4. Initialize components
        router = ModelRouter()
        tracker = CostTracker(total_budget=workflow.default_budget, run_id="e2e-bookstore")
        enforcer = BudgetEnforcer(tracker)
        prompt_builder = PromptBuilder()
        runtime = AgentRuntime(
            provider=mock_provider,
            router=router,
            prompt_builder=prompt_builder,
        )

        # 5. Initialize run
        await manager.initialize_run("e2e-bookstore")
        assert not manager.is_complete()

        outputs: dict[str, str] = {}
        steps_executed = 0

        # 6. Execute workflow
        while not manager.is_complete():
            ready = manager.get_ready_steps()
            if not ready:
                break

            for step_name in ready:
                step_spec = next(
                    (s for s in workflow.steps if s.name == step_name), None
                )
                assert step_spec is not None

                # Budget check
                estimated = router.estimate_cost(step_spec.model_preference, 2000, 1000)
                enforcer.check_before(step_name, estimated)

                # Transition to running
                await manager.transition(step_name, StepStatus.RUNNING)

                # Execute via agent runtime
                agent = registry.get(step_spec.agent or "product-manager")
                content, cost_record = await runtime.execute(
                    agent=agent,
                    task_description=step_spec.description or step_name,
                    run_id="e2e-bookstore",
                    step_name=step_name,
                    upstream_outputs={
                        dep: outputs.get(dep, "")
                        for dep in step_spec.depends_on
                    } or None,
                )

                tracker.record(cost_record)
                enforcer.check_after(step_name)

                outputs[step_name] = content
                steps_executed += 1

                await manager.transition(
                    step_name, StepStatus.COMPLETED,
                    outputs={step_name: content[:200]},
                )

        # 7. Assertions
        assert manager.is_complete(), "Workflow should be complete"
        assert steps_executed == 7, f"Expected 7 steps, got {steps_executed}"
        assert mock_provider.call_count == 7

        # Verify budget tracking
        snapshot = tracker.get_snapshot()
        assert snapshot.total_spent > 0
        assert not snapshot.is_exceeded
        assert len(snapshot.step_costs) == 7

        # Verify outputs contain expected content
        assert "parse-requirements" in outputs
        assert "design-architecture" in outputs
        assert "generate-backend" in outputs
        assert len(outputs) == 7

    async def test_init_phase_only(
        self,
        mock_provider: MockLLMProvider,
        bookstore_brief: str,
    ) -> None:
        """Test just the init phase (requirements parsing)."""
        workflow_path = STUDIO_DIR / "workflows" / "init.yaml"
        workflow = WorkflowSpec(**load_yaml(workflow_path))

        store = InMemoryStateStore()
        manager = StateManager(store, workflow)
        registry = AgentRegistry()
        registry.load_from_directory(STUDIO_DIR / "agents")

        router = ModelRouter()
        tracker = CostTracker(total_budget=0.50, run_id="e2e-init")
        prompt_builder = PromptBuilder()
        runtime = AgentRuntime(
            provider=mock_provider, router=router, prompt_builder=prompt_builder,
        )

        await manager.initialize_run("e2e-init")
        assert manager.get_ready_steps() == ["parse-requirements"]

        step_spec = workflow.steps[0]
        await manager.transition("parse-requirements", StepStatus.RUNNING)

        agent = registry.get("product-manager")
        content, cost_record = await runtime.execute(
            agent=agent,
            task_description=step_spec.description or "Parse requirements",
            run_id="e2e-init",
            step_name="parse-requirements",
        )
        tracker.record(cost_record)

        await manager.transition("parse-requirements", StepStatus.COMPLETED)
        assert manager.is_complete()
        assert "Requirements" in content or "requirements" in content
        assert mock_provider.call_count == 1

    async def test_budget_enforcement_during_build(
        self,
        mock_provider: MockLLMProvider,
        bookstore_brief: str,
    ) -> None:
        """Test that budget enforcement works during the build pipeline."""
        workflow_path = STUDIO_DIR / "workflows" / "init.yaml"
        workflow = WorkflowSpec(**load_yaml(workflow_path))

        store = InMemoryStateStore()
        manager = StateManager(store, workflow)
        registry = AgentRegistry()
        registry.load_from_directory(STUDIO_DIR / "agents")

        router = ModelRouter()
        # Set a very tight budget
        tracker = CostTracker(total_budget=0.001, run_id="e2e-budget")
        enforcer = BudgetEnforcer(tracker)
        prompt_builder = PromptBuilder()
        runtime = AgentRuntime(
            provider=mock_provider, router=router, prompt_builder=prompt_builder,
        )

        await manager.initialize_run("e2e-budget")

        # Budget check should still pass before execution (estimated cost < remaining)
        # but after execution, if cost exceeds budget, check_after should catch it
        await manager.transition("parse-requirements", StepStatus.RUNNING)

        agent = registry.get("product-manager")
        content, cost_record = await runtime.execute(
            agent=agent,
            task_description="Parse requirements",
            run_id="e2e-budget",
            step_name="parse-requirements",
        )
        tracker.record(cost_record)

        # The mock returns cost=0.0035 for PM, which exceeds budget of 0.001
        from mds_common.exceptions.base import BudgetExceededError
        with pytest.raises(BudgetExceededError):
            enforcer.check_after("parse-requirements")
