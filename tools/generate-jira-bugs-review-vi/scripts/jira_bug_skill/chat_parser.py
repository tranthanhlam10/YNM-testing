from __future__ import annotations

import re
from typing import Any

from .common import clean, map_found_in_environment, normalized
from .config import ALIASES


_URL_RE = re.compile(r"https?://[^\s<>()]+", re.IGNORECASE)
_FENCE_RE = re.compile(r"^\s*```([A-Za-z0-9_+.-]*)\s*$")
_INTRO_RE = re.compile(
    r"^\s*(?:nhờ\s+)?(?:bạn\s+)?(?:log|tạo|ghi)\s+(?:giúp\s+)?(?:mình\s+)?(?:một\s+)?bug\s*(?:là|:|-)?\s*",
    re.IGNORECASE,
)


def _heading_map() -> dict[str, str]:
    result: dict[str, str] = {}
    for field, aliases in ALIASES.items():
        for alias in (field, *aliases):
            key = normalized(alias)
            if key and key not in result:
                result[key] = field
    return result


_HEADINGS = _heading_map()


def _append(sections: dict[str, list[str]], field: str, value: str) -> None:
    value = value.rstrip()
    if value:
        sections.setdefault(field, []).append(value)


def _field_meta(source: str, confidence: str, **extra: Any) -> dict[str, Any]:
    return {"source": source, "confidence": confidence, **extra}


def _strip_intro(value: str) -> str:
    return _INTRO_RE.sub("", value, count=1).strip(" :-")


def _parse_heading(line: str) -> tuple[str, str, str] | None:
    inline = re.match(r"^\s*([^:]{1,60})\s*:\s*(.*)$", line)
    if inline:
        heading = inline.group(1).strip()
        field = _HEADINGS.get(normalized(heading))
        if field:
            return field, inline.group(2).strip(), heading
    heading = line.strip().rstrip(":").strip()
    field = _HEADINGS.get(normalized(heading))
    if field and (line.strip().endswith(":") or normalized(line) in _HEADINGS):
        return field, "", heading
    return None


def parse_chat_text(text: str) -> dict[str, Any]:
    """Parse raw tester chat deterministically without calling an AI model."""
    raw = clean(text)
    sections: dict[str, list[str]] = {}
    metadata: dict[str, dict[str, Any]] = {}
    free_lines: list[str] = []
    orphan_code: list[str] = []
    current_field = ""
    in_fence = False
    fence_lines: list[str] = []

    for line in raw.splitlines():
        fence = _FENCE_RE.match(line)
        if fence:
            if not in_fence:
                in_fence = True
                fence_lines = [line]
            else:
                fence_lines.append(line)
                block = "\n".join(fence_lines)
                if current_field == "diagnostic_data":
                    _append(sections, current_field, block)
                else:
                    orphan_code.append(block)
                in_fence = False
                fence_lines = []
            continue
        if in_fence:
            fence_lines.append(line)
            continue

        parsed = _parse_heading(line)
        if parsed:
            field, value, matched_heading = parsed
            # "Log" có URL là evidence; log kỹ thuật là diagnostic data.
            if normalized(matched_heading) == "log" and value and not _URL_RE.fullmatch(value):
                field = "diagnostic_data"
            current_field = field
            metadata.setdefault(
                field,
                _field_meta("heading", "high", matched_heading=matched_heading),
            )
            _append(sections, field, value)
            continue

        if current_field:
            _append(sections, current_field, line)
        elif line.strip():
            free_lines.append(line.strip())

    if in_fence and fence_lines:
        orphan_code.append("\n".join(fence_lines))
    if orphan_code:
        sections.setdefault("diagnostic_data", []).extend(orphan_code)
        metadata.setdefault(
            "diagnostic_data",
            _field_meta("code_fence", "high", matched_heading="fenced code"),
        )

    record: dict[str, Any] = {}
    for field, values in sections.items():
        record[field] = "\n".join(value for value in values if value).strip()

    free_lines = [line for line in free_lines if line]
    free_prose = "\n".join(free_lines)
    if not record.get("title") and not record.get("bug_summary") and free_lines:
        title = _strip_intro(free_lines.pop(0))
        if title:
            record["title"] = title
            metadata["title"] = _field_meta("free_text", "medium", matched_text=title[:160])
    if not record.get("actual") and free_lines:
        actual = "\n".join(free_lines).strip()
        if actual:
            record["actual"] = actual
            metadata["actual"] = _field_meta("free_text", "medium", matched_text=actual[:160])

    # Đây là câu môi trường tường minh trong chat, không phải prefix của Summary.
    if not record.get("environment"):
        environment = ""
        for prose_line in reversed(free_prose.splitlines()):
            environment = map_found_in_environment(prose_line)
            if environment:
                break
        if environment:
            record["environment"] = environment
            metadata["environment"] = _field_meta(
                "keyword", "medium", matched_text=f"explicit environment phrase -> {environment}"
            )

    required = {
        "summary": bool(record.get("title") or record.get("bug_summary")),
        "steps": bool(record.get("steps")),
        "expected": bool(record.get("expected")),
        "actual": bool(record.get("actual")),
    }
    record["__chat_extraction"] = {
        "parser": "deterministic/v1",
        "input_mode": "raw_chat",
        "fields": metadata,
        "missing_fields": [field for field, present in required.items() if not present],
        "needs_ai_fallback": not all(required.values()),
    }
    return record
