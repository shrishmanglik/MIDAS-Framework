"""Base exception hierarchy for all MIDAS errors."""


class MidasError(Exception):
    """Base exception for all MIDAS errors."""

    def __init__(self, message: str, context: dict[str, object] | None = None) -> None:
        self.context = context or {}
        super().__init__(message)


class ConfigurationError(MidasError):
    """Invalid or missing configuration."""


class SchemaValidationError(MidasError):
    """Pydantic schema validation failed."""


class TemplateError(MidasError):
    """Template rendering failed."""


class StateTransitionError(MidasError):
    """Invalid state transition attempted."""


class BudgetExceededError(MidasError):
    """Cost exceeded allocated budget. HARD HALT."""


class AgentError(MidasError):
    """Agent execution failed."""


class QualityGateError(MidasError):
    """Quality gate check failed."""


class KnowledgeStoreError(MidasError):
    """Knowledge store operation failed."""
