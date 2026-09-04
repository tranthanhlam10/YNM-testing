from __future__ import annotations

import re
from typing import Any

from .common import clean, dedupe


def split_target_values(value: Any) -> list[str]:
    return dedupe(clean(item) for item in re.split(r"[,;\n]+", clean(value)) if clean(item))


def build_target_metadata(record: dict[str, str], found_in_environment: str) -> dict[str, Any]:
    return {
        "environment_input": clean(record.get("environment")),
        "found_in_environment": found_in_environment,
        "branches": split_target_values(record.get("branch")),
        "domains": split_target_values(record.get("domain")),
        "url": clean(record.get("target_url")),
    }


def target_description_lines(target: dict[str, Any]) -> list[str]:
    lines = [f"Environment: {target['environment_input'] or target['found_in_environment']}"]
    if target["branches"]:
        lines.append("Branch: " + ", ".join(target["branches"]))
    if target["domains"]:
        lines.append("Domain: " + ", ".join(target["domains"]))
    if target["url"]:
        lines.append("URL: " + target["url"])
    return lines
