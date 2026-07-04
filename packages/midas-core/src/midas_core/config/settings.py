"""MIDAS runtime settings."""

from pydantic_settings import BaseSettings


class MidasSettings(BaseSettings):
    """Configuration for the MIDAS runtime."""

    # Database
    db_url: str = ""

    # API keys
    anthropic_api_key: str = ""

    # Logging
    log_level: str = "INFO"
    log_json: bool = True

    # Budget
    default_budget: float = 0.50

    # Environment
    midas_env: str = "development"

    # Paths
    studios_dir: str = "studios"
    knowledge_dir: str = "knowledge"

    model_config = {"env_prefix": "", "case_sensitive": False}
