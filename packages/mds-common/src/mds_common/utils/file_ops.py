"""Safe file operations with atomic writes."""

import json
from pathlib import Path
from typing import Any


def safe_write(path: Path, content: str) -> None:
    """Atomically write content to a file."""
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(".tmp")
    tmp.write_text(content, encoding="utf-8")
    tmp.replace(path)


def safe_write_json(path: Path, data: Any) -> None:
    """Atomically write JSON data to a file."""
    safe_write(path, json.dumps(data, indent=2, default=str))


def safe_read(path: Path) -> str:
    """Read a file's text content."""
    return path.read_text(encoding="utf-8")
