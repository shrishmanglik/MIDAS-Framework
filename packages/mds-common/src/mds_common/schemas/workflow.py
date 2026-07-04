"""Workflow and step specification schemas."""

from pydantic import BaseModel, Field, model_validator

from mds_common.types.enums import ModelTier, StepType


class StepSpec(BaseModel):
    """Specification for a single workflow step."""

    name: str = Field(..., pattern=r"^[a-z][a-z0-9-]*$")
    agent: str | None = None
    step_type: StepType
    model_preference: ModelTier = ModelTier.SONNET
    depends_on: list[str] = Field(default_factory=list)
    budget: float = Field(default=0.01, ge=0)
    outputs: list[str] = Field(default_factory=list)
    description: str = ""
    timeout_seconds: int = Field(default=300, ge=10)
    max_retries: int = Field(default=2, ge=0, le=5)


class WorkflowSpec(BaseModel):
    """Full workflow specification loaded from YAML."""

    name: str
    studio: str
    version: str = "1.0"
    default_budget: float = Field(default=0.50, ge=0)
    steps: list[StepSpec] = Field(..., min_length=1)

    @model_validator(mode="after")
    def validate_dependencies(self) -> "WorkflowSpec":
        """Ensure all step dependencies reference existing steps."""
        step_names = {s.name for s in self.steps}
        for step in self.steps:
            for dep in step.depends_on:
                if dep not in step_names:
                    raise ValueError(
                        f"Step '{step.name}' depends on '{dep}' which doesn't exist"
                    )
        return self

    @model_validator(mode="after")
    def validate_no_cycles(self) -> "WorkflowSpec":
        """Topological sort to detect cycles in step dependencies."""
        graph: dict[str, set[str]] = {s.name: set(s.depends_on) for s in self.steps}
        visited: set[str] = set()
        path: set[str] = set()

        def visit(node: str) -> None:
            if node in path:
                raise ValueError(f"Cycle detected involving step '{node}'")
            if node in visited:
                return
            path.add(node)
            for dep in graph.get(node, set()):
                visit(dep)
            path.remove(node)
            visited.add(node)

        for step_name in graph:
            visit(step_name)
        return self
