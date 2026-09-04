from __future__ import annotations

import re
from typing import Any

from .common import normalized
from .config import SUMMARY


MAX_SUMMARY_LENGTH = int(SUMMARY["max_length"])
GENERIC_OPENERS = list(SUMMARY["generic_openers"])
TECHNICAL_TERMS = dict(SUMMARY["technical_terms"])


def _compact(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip(" \t\n,;:-")


def _sentence_case(value: str) -> str:
    return value[:1].upper() + value[1:] if value else ""


def _remove_generic_opener(value: str) -> tuple[str, bool]:
    text = _compact(value)
    words = list(re.finditer(r"\S+", text))
    for opener in sorted(GENERIC_OPENERS, key=lambda item: len(normalized(item).split()), reverse=True):
        count = len(normalized(opener).split())
        if count > len(words):
            continue
        boundary = words[count - 1].end()
        if normalized(text[:boundary]) == normalized(opener):
            return text[boundary:].lstrip(" \t,;:-"), True
    return text, False


def _normalize_technical_terms(value: str) -> tuple[str, bool]:
    text = value
    changed = False
    for source, target in TECHNICAL_TERMS.items():
        pattern = rf"(?<![\w]){re.escape(source)}(?![\w])"
        updated = re.sub(pattern, target, text, flags=re.IGNORECASE)
        changed = changed or updated != text
        text = updated
    return text, changed


def _condense_example(value: str) -> tuple[str, bool]:
    pattern = re.compile(
        r"^(?P<context>.+?)[,;]?\s*(?:ví\s+dụ(?:\s+như)?|vi\s+du(?:\s+nhu)?)\s+"
        r"(?P<example>.+?)\s+(?:thì|thi)\s+(?P<result>.+)$",
        flags=re.IGNORECASE,
    )
    match = pattern.match(value)
    if not match:
        return value, False
    context = _compact(match.group("context"))
    example = _compact(match.group("example"))
    result = _compact(match.group("result"))
    if not all((context, example, result)):
        return value, False
    return _compact(f"{result} {context} khi {example}"), True


def _move_outcome_before_trigger(value: str) -> tuple[str, bool]:
    match = re.match(r"^(?:khi)\s+(?P<trigger>.+?)\s+(?:thì)\s+(?P<outcome>.+)$", value, flags=re.IGNORECASE)
    if not match:
        return value, False
    trigger = _compact(match.group("trigger"))
    outcome = _compact(match.group("outcome"))
    if not trigger or not outcome:
        return value, False
    return _compact(f"{outcome} khi {trigger}"), True


def _clean_actual_for_summary(value: str) -> tuple[str, list[str]]:
    transformations: list[str] = []
    text = _compact(value)
    if text != value.strip():
        transformations.append("normalized_whitespace")
    text, removed = _remove_generic_opener(text)
    if removed:
        transformations.append("removed_generic_opener")
    without_error_marker = re.sub(r"^(?:đang\s+)?(?:bị\s+)?(?:bug|lỗi)\s*[:\-]?\s*", "", text, flags=re.IGNORECASE)
    if without_error_marker != text:
        transformations.append("removed_generic_error_marker")
    text = without_error_marker
    text, condensed = _condense_example(text)
    if condensed:
        transformations.append("condensed_example")
    else:
        text, reordered = _move_outcome_before_trigger(text)
        if reordered:
            transformations.append("moved_outcome_before_trigger")
        text = re.sub(r"[,;]?\s*(?:ví\s+dụ(?:\s+như)?|vi\s+du(?:\s+nhu)?)\s+", " ", text, flags=re.IGNORECASE)
    text = _compact(text)
    text, technical_changed = _normalize_technical_terms(text)
    if technical_changed:
        transformations.append("normalized_technical_terms")
    return _sentence_case(text), transformations


def _truncate(value: str, transformations: list[str]) -> str:
    text = _compact(value)
    if len(text) <= MAX_SUMMARY_LENGTH:
        return text
    transformations.append("truncated_to_jira_limit")
    if MAX_SUMMARY_LENGTH <= 3:
        return text[:MAX_SUMMARY_LENGTH]
    return text[: MAX_SUMMARY_LENGTH - 3].rstrip() + "..."


def propose_summary(record: dict[str, str], source_kind: str, title_metadata: dict[str, Any]) -> dict[str, Any]:
    transformations: list[str] = []
    clean_title = title_metadata["clean_title"]
    supplied_summary = record["bug_summary"]

    if source_kind == "chat":
        source = "explicit_bug_summary" if supplied_summary else "chat_testname"
        body = clean_title or record["actual"] or "Hành vi lỗi cần làm rõ"
        body = _compact(body)
    elif supplied_summary and not normalized(supplied_summary).startswith(("kiem tra", "verify", "validate", "test ")):
        source = "explicit_bug_summary"
        body = _compact(clean_title)
        body, technical_changed = _normalize_technical_terms(body)
        if technical_changed:
            transformations.append("normalized_technical_terms")
    elif record["actual"]:
        source = "actual_result"
        body, actual_transformations = _clean_actual_for_summary(record["actual"])
        transformations.extend(actual_transformations)
    else:
        source = "testname_fallback"
        body = _compact(clean_title or "Hành vi lỗi cần làm rõ")

    component = _compact(record["component"])
    component = re.sub(r"^\[([^\]]+)\]\s*", r"\1 - ", component).strip(" -")
    if source_kind != "chat" and component and not body.startswith("["):
        body = f"[{component}] {body}"
        transformations.append("added_component")

    recommended = _truncate(body, transformations)
    return {
        "recommended": recommended,
        "source": source,
        "transformations": list(dict.fromkeys(transformations)),
        "review_required": True,
    }
