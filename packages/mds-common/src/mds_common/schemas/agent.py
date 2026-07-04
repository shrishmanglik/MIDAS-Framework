"""Agent specification schemas."""

from pydantic import BaseModel, Field

from mds_common.types.enums import AgentType, ModelTier


class AgentPersona(BaseModel):
    """Agent personality and expertise profile."""

    backstory: str = Field(..., description="Agent's expertise narrative")
    communication_style: str = Field(..., description="How agent communicates")
    expertise_areas: list[str] = Field(default_factory=list)


class AgentSpec(BaseModel):
    """Full specification for a MIDAS agent loaded from YAML."""

    id: str = Field(..., pattern=r"^[a-z][a-z0-9-]*$")
    name: str
    role: str
    type: AgentType = AgentType.WORKER
    persona: AgentPersona
    capabilities: list[str] = Field(default_factory=list)
    constraints: list[str] = Field(default_factory=list)
    model_preference: ModelTier = ModelTier.SONNET
    fallback_model: ModelTier = ModelTier.HAIKU
    tools: list[str] = Field(default_factory=list)
    quality_gates: list[str] = Field(default_factory=list)
    cost_limit_per_task: float = Field(default=0.05, ge=0)
    escalation_rules: list[str] = Field(default_factory=list)
