"""Timing utilities for performance measurement."""

import time
from collections.abc import Generator
from contextlib import contextmanager


@contextmanager
def timer() -> Generator[dict[str, float], None, None]:
    """Context manager that measures elapsed time in milliseconds."""
    result: dict[str, float] = {}
    start = time.perf_counter()
    try:
        yield result
    finally:
        result["elapsed_ms"] = (time.perf_counter() - start) * 1000
