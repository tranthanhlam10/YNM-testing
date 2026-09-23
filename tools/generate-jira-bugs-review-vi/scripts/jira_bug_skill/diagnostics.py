from __future__ import annotations

import json
import re
from typing import Any

from .common import clean
from .config import (
    DIAGNOSTIC_ALLOWED_TYPES,
    DIAGNOSTIC_MAX_ITEM_CHARS,
    DIAGNOSTIC_MAX_ITEMS,
    DIAGNOSTIC_MAX_TOTAL_CHARS,
    DIAGNOSTIC_PREVIEW_MAX_CHARS,
    DIAGNOSTIC_SENSITIVE_KEYS,
)


FENCED_BLOCK_PATTERN = re.compile(
    r"```(?P<markdown_language>[^\n`]*)\n(?P<markdown_content>.*?)```"
    r"|\{code(?::(?P<jira_attributes>[^}]+))?\}(?P<jira_content>.*?)\{code\}",
    re.IGNORECASE | re.DOTALL,
)
PRIVATE_KEY_PATTERN = re.compile(
    r"-----BEGIN [^-\n]*PRIVATE KEY-----.*?-----END [^-\n]*PRIVATE KEY-----",
    re.IGNORECASE | re.DOTALL,
)
AUTHORIZATION_PATTERN = re.compile(
    r"(?im)^(?P<prefix>\s*authorization\s*[:=]\s*)(?:bearer|basic)\s+[^\s]+.*$"
)
COOKIE_HEADER_PATTERN = re.compile(r"(?im)^(?P<prefix>\s*(?:set-cookie|cookie)\s*:\s*).*$")
JWT_PATTERN = re.compile(r"\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b")
SAFE_LANGUAGE_PATTERN = re.compile(r"[^a-z0-9_+.-]+")


def _sensitive_assignment_pattern() -> re.Pattern[str]:
    keys = "|".join(
        sorted((re.escape(value) for value in DIAGNOSTIC_SENSITIVE_KEYS), key=len, reverse=True)
    )
    return re.compile(
        rf"(?ix)(?P<prefix>[\"']?(?:{keys})[\"']?\s*[:=]\s*)"
        rf"(?![\"']?\[REDACTED(?:\s+(?:PRIVATE\s+KEY|JWT))?\][\"']?)"
        rf"(?:(?P<quote>[\"'])(?P<quoted>.*?)(?P=quote)|(?P<bare>[^\s,;&}}\]]+))"
    )


SENSITIVE_ASSIGNMENT_PATTERN = _sensitive_assignment_pattern()


TYPE_ALIASES = {
    "shell": "command",
    "bash": "command",
    "cmd": "command",
    "sql": "query",
    "solr": "query",
    "solr query": "query",
    "stack trace": "stacktrace",
    "traceback": "stacktrace",
    "payload": "json",
}

DEFAULT_NAMES = {
    "log": "Application log",
    "json": "JSON payload",
    "query": "Query",
    "command": "Command",
    "code": "Code snippet",
    "request": "Request",
    "response": "Response",
    "stacktrace": "Stack trace",
    "text": "Diagnostic notes",
}

TRUNCATION_SUFFIX = "\n...[TRUNCATED]"


def _json_text(value: Any) -> str:
    if isinstance(value, (dict, list)):
        return json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True)
    return clean(value)


def _language_from_jira_attributes(value: str) -> str:
    text = clean(value)
    if not text:
        return ""
    match = re.search(r"(?:^|\|)language=([^|]+)", text, re.IGNORECASE)
    if match:
        return clean(match.group(1))
    return text.split("|", 1)[0] if "=" not in text.split("|", 1)[0] else ""


def _normalize_language(value: Any) -> str:
    return SAFE_LANGUAGE_PATTERN.sub("", clean(value).casefold())[:30]


def _normalize_type(value: Any, content: str, language: str, name: str) -> str:
    requested = clean(value).casefold().replace("_", " ").replace("-", " ")
    candidate = TYPE_ALIASES.get(requested, requested.replace(" ", ""))
    if candidate in DIAGNOSTIC_ALLOWED_TYPES:
        return candidate
    language_type = TYPE_ALIASES.get(language, language)
    if language_type in DIAGNOSTIC_ALLOWED_TYPES and language_type != "text":
        return language_type
    context = f"{name} {content[:500]}".casefold()
    stripped = content.lstrip()
    if language == "json" or stripped.startswith(("{", "[")):
        try:
            json.loads(content)
            return "json"
        except (json.JSONDecodeError, TypeError):
            pass
    if any(marker in context for marker in ("traceback", "stack trace", "exception at", "caused by:")):
        return "stacktrace"
    if any(marker in context for marker in ("solr query", "select ", "update ", "delete from ", "where ")):
        return "query"
    if re.search(r"(?m)^\s*(?:\$\s*)?(?:curl|kubectl|docker|python|java|npm|yarn|make)\b", content):
        return "command"
    if any(marker in context for marker in ("request", "response")):
        return "request" if "request" in context else "response"
    if any(marker in context for marker in ("error", "warn", "info", "debug", " log")):
        return "log"
    return "text"


def _default_language(item_type: str, requested: Any) -> str:
    language = _normalize_language(requested)
    if language:
        return language
    return {
        "json": "json",
        "command": "bash",
        "query": "text",
        "code": "text",
        "request": "text",
        "response": "text",
        "stacktrace": "text",
        "log": "text",
        "text": "text",
    }[item_type]


def _expand_structured(value: Any) -> list[Any]:
    if isinstance(value, list):
        return value
    if isinstance(value, dict):
        if isinstance(value.get("items"), list):
            return value["items"]
        if any(key in value for key in ("content", "value", "data")):
            return [value]
        return [
            {"name": clean(key), "content": item}
            for key, item in value.items()
        ]
    return [value] if clean(value) else []


def _plain_item(value: str, name: str = "") -> dict[str, Any]:
    return {"name": name, "content": value}


def _extract_fenced_items(value: str) -> list[dict[str, Any]]:
    matches = list(FENCED_BLOCK_PATTERN.finditer(value))
    if not matches:
        return [_plain_item(value)] if clean(value) else []
    items: list[dict[str, Any]] = []
    cursor = 0
    for match in matches:
        prefix = clean(value[cursor:match.start()])
        name = ""
        if prefix:
            prefix_lines = prefix.splitlines()
            possible_name = prefix_lines[-1].rstrip(":").strip()
            if len(prefix_lines) == 1 and len(possible_name) <= 100:
                name = possible_name
            else:
                items.append(_plain_item(prefix))
        language = clean(match.group("markdown_language")) or _language_from_jira_attributes(
            match.group("jira_attributes") or ""
        )
        content = match.group("markdown_content")
        if content is None:
            content = match.group("jira_content") or ""
        items.append({"name": name, "language": language, "content": clean(content), "type": "code"})
        cursor = match.end()
    suffix = clean(value[cursor:])
    if suffix:
        items.append(_plain_item(suffix))
    return items


def _redact_sensitive(value: str) -> tuple[str, int]:
    total = 0

    def replace_private(_: re.Match[str]) -> str:
        return "[REDACTED PRIVATE KEY]"

    def replace_header(match: re.Match[str]) -> str:
        return f"{match.group('prefix')}[REDACTED]"

    def replace_assignment(match: re.Match[str]) -> str:
        quote = match.group("quote") or ""
        return f"{match.group('prefix')}{quote}[REDACTED]{quote}"

    value, count = PRIVATE_KEY_PATTERN.subn(replace_private, value)
    total += count
    value, count = AUTHORIZATION_PATTERN.subn(replace_header, value)
    total += count
    value, count = COOKIE_HEADER_PATTERN.subn(replace_header, value)
    total += count
    value, count = SENSITIVE_ASSIGNMENT_PATTERN.subn(replace_assignment, value)
    total += count
    value, count = JWT_PATTERN.subn("[REDACTED JWT]", value)
    total += count
    return value, total


def _truncate(value: str, limit: int) -> tuple[str, bool]:
    if len(value) <= limit:
        return value, False
    prefix_limit = max(0, limit - len(TRUNCATION_SUFFIX))
    return value[:prefix_limit].rstrip() + TRUNCATION_SUFFIX, True


def _normalize_item(raw: Any) -> dict[str, Any] | None:
    if isinstance(raw, dict):
        content = _json_text(raw.get("content", raw.get("value", raw.get("data", ""))))
        name = clean(raw.get("name") or raw.get("label") or raw.get("title"))
        requested_type = raw.get("type", "")
        requested_language = raw.get("language", "")
    else:
        content = clean(raw)
        name = ""
        requested_type = ""
        requested_language = ""
    if not content:
        return None
    language = _normalize_language(requested_language)
    item_type = _normalize_type(requested_type, content, language, name)
    content, redaction_count = _redact_sensitive(content)
    content, truncated = _truncate(content, DIAGNOSTIC_MAX_ITEM_CHARS)
    return {
        "type": item_type,
        "name": name or DEFAULT_NAMES[item_type],
        "language": _default_language(item_type, requested_language),
        "content": content,
        "redacted": redaction_count > 0,
        "redaction_count": redaction_count,
        "truncated": truncated,
    }


def parse_diagnostic_items(value: Any) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    raw_items: list[Any] = []
    for raw in _expand_structured(value):
        if isinstance(raw, str):
            raw_items.extend(_extract_fenced_items(raw))
        else:
            raw_items.append(raw)

    items: list[dict[str, Any]] = []
    seen: set[tuple[str, str, str]] = set()
    total_chars = 0
    redacted = False
    truncated = len(raw_items) > DIAGNOSTIC_MAX_ITEMS
    ignored = False
    for raw in raw_items[:DIAGNOSTIC_MAX_ITEMS]:
        item = _normalize_item(raw)
        if not item:
            ignored = True
            continue
        remaining = DIAGNOSTIC_MAX_TOTAL_CHARS - total_chars
        if remaining <= 0:
            truncated = True
            break
        item["content"], total_truncated = _truncate(item["content"], remaining)
        if total_truncated:
            item["truncated"] = True
            truncated = True
        key = (item["type"], item["name"].casefold(), item["content"])
        if key in seen:
            continue
        seen.add(key)
        total_chars += len(item["content"])
        redacted = redacted or item["redacted"]
        truncated = truncated or item["truncated"]
        items.append(item)

    warnings: list[dict[str, Any]] = []
    if redacted:
        warnings.append({
            "code": "sensitive_diagnostic_redacted",
            "message": "Diagnostic data chứa secret; engine đã che trước khi dựng preview/payload Jira",
            "blocking": False,
        })
    if truncated:
        warnings.append({
            "code": "diagnostic_data_truncated",
            "message": "Diagnostic data vượt giới hạn cấu hình; payload chỉ giữ phần nằm trong giới hạn",
            "blocking": False,
        })
    if ignored:
        warnings.append({
            "code": "empty_diagnostic_item_ignored",
            "message": "Một diagnostic item không có content đã được bỏ qua",
            "blocking": False,
        })
    return items, warnings


def compact_diagnostic_items(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    compact: list[dict[str, Any]] = []
    for item in items:
        content = item["content"]
        preview_truncated = len(content) > DIAGNOSTIC_PREVIEW_MAX_CHARS
        if preview_truncated:
            content = content[:DIAGNOSTIC_PREVIEW_MAX_CHARS].rstrip() + "\n...[TRUNCATED IN PREVIEW]"
        compact.append({
            "type": item["type"],
            "name": item["name"],
            "language": item["language"],
            "content": content,
            "redacted": item["redacted"],
            "truncated": item["truncated"],
            "preview_truncated": preview_truncated,
        })
    return compact
