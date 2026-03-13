"""Configuration loading using pydantic-settings."""

from pydantic_settings import BaseSettings


class MidasBaseConfig(BaseSettings):
    """Base configuration class for all MIDAS components."""

    log_level: str = "INFO"
    log_json: bool = True
    midas_env: str = "development"

    model_config = {"env_prefix": "MIDAS_", "case_sensitive": False}
