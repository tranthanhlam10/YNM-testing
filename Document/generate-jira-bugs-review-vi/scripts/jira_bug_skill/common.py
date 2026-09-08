from __future__ import annotations

import re
import unicodedata
from collections.abc import Iterable
from typing import Any

from .config import ENVIRONMENT_MAP


ISSUE_KEY_PATTERN = re.compile(r"\b([A-Za-z][A-Za-z0-9_]*-[0-9]+)\b")


class InputError(ValueError):
    pass


class JiraError(RuntimeError):
    pass


def parse_related_task(value: Any) -> str:
    text = clean(value)
    if not text:
        raise InputError("Thiếu Jira task liên quan; không preview hoặc log bug")
    match = ISSUE_KEY_PATTERN.search(text)
    if not match:
        raise InputError("Related task phải là Jira issue key hoặc URL chứa issue key")
    return match.group(1).upper()


def project_from_issue_key(issue_key: str) -> str:
    return issue_key.rsplit("-", 1)[0].upper()


def normalized(value: Any) -> str:
    text = clean(value).replace("đ", "d").replace("Đ", "D")
    text = unicodedata.normalize("NFKD", text)
    text = "".join(character for character in text if not unicodedata.combining(character))
    return re.sub(r"[^a-z0-9]+", " ", text.casefold()).strip()


def clean(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, bool):
        return "true" if value else "false"
    text = str(value).replace("\r\n", "\n").replace("\r", "\n")
    return "\n".join(line.rstrip() for line in text.strip().splitlines())


def dedupe(values: Iterable[str]) -> list[str]:
    return list(dict.fromkeys(value for value in values if value))


def clean_label(value: Any) -> str:
    return clean(value).strip().casefold()


def split_labels(value: Any) -> list[str]:
    if isinstance(value, list):
        return dedupe(clean_label(item) for item in value)
    return dedupe(clean_label(item) for item in re.split(r"[,;\n]+", clean(value)))


def contains_marker(text: str, markers: Iterable[str]) -> bool:
    normalized_text = normalized(text)
    return any(
        re.search(rf"(?:^|\s){re.escape(normalized(marker))}(?:$|\s)", normalized_text)
        for marker in markers
        if normalized(marker)
    )


def map_found_in_environment(value: str) -> str:
    text = normalized(value)
    if not text:
        return ""
    normalized_map = {normalized(alias): canonical for alias, canonical in ENVIRONMENT_MAP.items()}
    if text in normalized_map:
        return normalized_map[text]
    matches = {
        canonical
        for alias, canonical in normalized_map.items()
        if re.search(rf"(?:^|\s){re.escape(alias)}(?:$|\s)", text)
    }
    return matches.pop() if len(matches) == 1 else ""
