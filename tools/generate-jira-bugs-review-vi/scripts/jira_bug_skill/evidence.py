from __future__ import annotations

import re
import urllib.parse
from typing import Any

from .common import clean, dedupe


URL_PATTERN = re.compile(r"https?://[^\s<>]+", re.IGNORECASE)
SENSITIVE_QUERY_KEYS = {"token", "access_token", "api_key", "apikey", "cookie", "session", "sessionid", "password"}


def _kind(label: str, url: str) -> str:
    text = f"{label} {urllib.parse.urlparse(url).path}".casefold()
    if any(marker in text for marker in ("screenshot", "image", ".png", ".jpg", ".jpeg", ".gif", ".webp")):
        return "image"
    if any(marker in text for marker in ("video", ".mp4", ".mov", ".webm")):
        return "video"
    if any(marker in text for marker in ("log", ".txt", ".log")):
        return "log"
    return "link"


def parse_evidence_items(value: Any) -> list[dict[str, str]]:
    if isinstance(value, list):
        raw_items = value
    else:
        raw_items = re.split(r"[;\n]+", clean(value))
    items: list[dict[str, str]] = []
    seen: set[str] = set()
    for raw in raw_items:
        if isinstance(raw, dict):
            label = clean(raw.get("name") or raw.get("label") or raw.get("type"))
            url = clean(raw.get("url"))
            display = clean(raw.get("display") or f"{label}: {url}".strip(": "))
        else:
            display = clean(raw)
            match = URL_PATTERN.search(display)
            url = match.group(0).rstrip(".,)") if match else ""
            label = display[: match.start()].rstrip(" :-") if match else ""
        if not display:
            continue
        key = url.casefold() if url else display.casefold()
        if key in seen:
            continue
        seen.add(key)
        items.append({
            "type": _kind(label, url) if url else "text",
            "name": label or (urllib.parse.urlparse(url).path.rsplit("/", 1)[-1] if url else "Evidence"),
            "url": url,
            "display": display,
        })
    return items


def evidence_warnings(items: list[dict[str, str]]) -> list[dict[str, Any]]:
    warnings: list[dict[str, Any]] = []
    for item in items:
        url = item.get("url", "")
        if not url:
            continue
        query_keys = {key.casefold() for key, _ in urllib.parse.parse_qsl(urllib.parse.urlparse(url).query)}
        if query_keys.intersection(SENSITIVE_QUERY_KEYS):
            warnings.append({
                "code": "sensitive_evidence_url",
                "message": "Evidence URL có query parameter nhạy cảm; hãy dùng link chia sẻ không chứa token/session",
                "blocking": True,
            })
            break
    return warnings


def evidence_description_lines(items: list[dict[str, str]]) -> list[str]:
    return dedupe(item["display"] for item in items)
