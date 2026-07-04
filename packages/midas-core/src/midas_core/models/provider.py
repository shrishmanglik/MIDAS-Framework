"""LLM provider abstraction — the mock boundary for testing."""

from __future__ import annotations

from typing import Any, Protocol


class LLMProvider(Protocol):
    """Protocol for LLM providers. This is the mock boundary."""

    async def complete(
        self,
        model: str,
        system_prompt: str,
        user_prompt: str,
    ) -> dict[str, Any]:
        """Send a prompt to the LLM and return response dict.

        Returns:
            Dict with keys: content, input_tokens, output_tokens, cost
        """
        ...


class LiteLLMProvider:
    """Production LLM provider using litellm."""

    async def complete(
        self,
        model: str,
        system_prompt: str,
        user_prompt: str,
    ) -> dict[str, Any]:
        """Send a prompt via litellm."""
        import litellm

        response = await litellm.acompletion(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )

        content = response.choices[0].message.content or ""
        usage = response.usage
        input_tokens = usage.prompt_tokens if usage else 0
        output_tokens = usage.completion_tokens if usage else 0

        # litellm tracks cost via response._hidden_params
        cost = getattr(response, "_hidden_params", {}).get(
            "response_cost", 0.0
        )

        return {
            "content": content,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "cost": cost,
        }
