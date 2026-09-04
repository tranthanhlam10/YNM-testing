from __future__ import annotations

import re
from typing import Any

from .common import normalized
from .config import DEFAULT_PRIORITY, PRIORITY_MAP, PRIORITY_PREFIXES, TEST_METADATA_PREFIXES, TEST_TYPE_MAP
from .evidence import evidence_description_lines
from .targets import target_description_lines


def parse_title_metadata(value: str) -> dict[str, Any]:
    remaining = value.strip()
    prefixes: list[str] = []
    while True:
        match = re.match(r"^\s*\[([^\]]+)\]\s*", remaining)
        if not match:
            break
        prefixes.append(match.group(1).strip())
        remaining = remaining[match.end():]

    priority = ""
    test_type = ""
    removed: list[str] = []
    preserved: list[str] = []
    for prefix in prefixes:
        key = normalized(prefix)
        if key in PRIORITY_PREFIXES and key in PRIORITY_MAP:
            priority = priority or PRIORITY_MAP[key]
            removed.append(prefix)
        elif key in TEST_METADATA_PREFIXES:
            test_type = test_type or TEST_TYPE_MAP.get(key, "")
            removed.append(prefix)
        else:
            preserved.append(prefix)
    clean_title = " ".join([*(f"[{item}]" for item in preserved), remaining]).strip()
    return {
        "clean_title": clean_title or value.strip(),
        "priority": priority,
        "test_type": test_type,
        "removed_prefixes": removed,
        "preserved_prefixes": preserved,
    }


def resolve_priority(record: dict[str, str], title_metadata: dict[str, Any]) -> tuple[str, str]:
    if record["severity"]:
        return PRIORITY_MAP.get(normalized(record["severity"]), ""), "source_field"
    if title_metadata["priority"]:
        return title_metadata["priority"], "testname_prefix"
    return DEFAULT_PRIORITY, "default"


def adf_text(text: str) -> dict[str, Any]:
    return {"type": "text", "text": text}


def adf_paragraph(text: str) -> dict[str, Any]:
    return {"type": "paragraph", "content": [adf_text(text)]}


def add_section(content: list[dict[str, Any]], heading: str, value: str) -> None:
    if not value:
        return
    content.append({"type": "heading", "attrs": {"level": 3}, "content": [adf_text(heading)]})
    for line in value.splitlines() or [value]:
        content.append(adf_paragraph(line or " "))


def add_bullet_section(content: list[dict[str, Any]], heading: str, values: list[str]) -> None:
    if not values:
        return
    content.append({"type": "heading", "attrs": {"level": 3}, "content": [adf_text(heading)]})
    content.append({
        "type": "bulletList",
        "content": [
            {"type": "listItem", "content": [adf_paragraph(value)]}
            for value in values
        ],
    })


def build_description(
    record: dict[str, str],
    source_row: int,
    source_url: str,
    source_kind: str,
    selection_reason: str,
    label_classification: dict[str, Any],
    resolved_priority: str,
    priority_source: str,
    target_metadata: dict[str, Any],
    evidence_items: list[dict[str, str]],
) -> dict[str, Any]:
    content: list[dict[str, Any]] = []
    if source_kind == "chat":
        add_section(content, "Steps to reproduce", record["steps"])
        add_section(content, "Actual result", record["actual"])
        add_section(content, "Expected result", record["expected"])
        add_section(content, "Preconditions", record["preconditions"])
        add_section(content, "Test data", record["test_data"])
        if any((record["environment"], record["branch"], record["domain"], record["target_url"])):
            add_bullet_section(content, "Affected targets", target_description_lines(target_metadata))
        if evidence_items:
            add_bullet_section(content, "Evidence", evidence_description_lines(evidence_items))
        add_section(content, "Notes", record["remarks"])
        return {"type": "doc", "version": 1, "content": content}

    add_section(content, "Preconditions", record["preconditions"])
    add_section(content, "Steps to reproduce", record["steps"])
    add_section(content, "Actual result", record["actual"])
    add_section(content, "Expected result", record["expected"])
    add_section(content, "Test data", record["test_data"])
    add_bullet_section(content, "Affected targets", target_description_lines(target_metadata))
    label_lines = [
        f"Found In Environment: {label_classification['found_in_environment'] or 'Not determined'}",
        "Root Cause: " + (", ".join(label_classification["root_cause"]) or "Not determined — update before closing the bug"),
        "System: " + (", ".join(label_classification["system"]) or "Not determined"),
        "Test Type: " + (", ".join(label_classification["test_type"]) or "Not determined"),
    ]
    if label_classification["flow"]:
        label_lines.append("Flow: " + ", ".join(label_classification["flow"]))
    if label_classification["lifecycle"]:
        label_lines.append("Lifecycle: " + ", ".join(label_classification["lifecycle"]))
    if label_classification["operational"]:
        label_lines.append("Detection Source: " + ", ".join(label_classification["operational"]))
    add_bullet_section(content, "Label classification", label_lines)
    if evidence_items:
        add_bullet_section(content, "Evidence", evidence_description_lines(evidence_items))
    else:
        add_section(content, "Evidence", "No evidence was provided.")
    add_section(content, "Notes", record["remarks"])

    source_lines = [
        f"Input source: {record['source_type'] or source_kind}",
        f"Test case: {record['test_case_id'] or 'No linked test case'}",
    ]
    if record["title"]:
        source_lines.append(f"Test scenario: {record['title']}")
    if record["component"]:
        source_lines.append(f"Module/Feature: {record['component']}")
    source_lines.append(f"Source priority: {record['severity']}" if record["severity"] else "Source priority: Not provided")
    source_lines.append(f"Resolved priority: {resolved_priority or 'Not resolved'} ({priority_source})")
    if record["test_type"]:
        source_lines.append(f"Test type: {record['test_type']}")
    if record["assigned_to"]:
        source_lines.append(f"Source assignee: {record['assigned_to']}")
    source_lines.append(f"Selection reason: {record['selection_reason'] or selection_reason}")
    if (record["source_type"] or source_kind) != "chat":
        source_lines.append(f"Source row: {source_row}")
    if source_url:
        source_lines.append(f"Source URL: {source_url}")
    if record["bug_status"]:
        source_lines.append(f"Source bug status: {record['bug_status']}")
    if record["status"]:
        source_lines.append(f"Source test status: {record['status']}")
    add_bullet_section(content, "Source information", source_lines)
    return {"type": "doc", "version": 1, "content": content}
