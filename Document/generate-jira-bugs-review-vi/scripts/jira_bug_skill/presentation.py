from __future__ import annotations

import re
from typing import Any

from .diagnostics import compact_diagnostic_items


VISIBLE_DESCRIPTION_SECTIONS = {
    "Preconditions",
    "Steps to reproduce",
    "Actual result",
    "Expected result",
    "Test data",
    "Affected targets",
    "Evidence",
    "Notes",
}

BULLET_DESCRIPTION_SECTIONS = {
    "Affected targets",
    "Evidence",
    "Label classification",
    "Source information",
}


def _node_text(node: dict[str, Any]) -> str:
    return "".join(
        str(item.get("text", ""))
        for item in node.get("content") or []
        if item.get("type") == "text"
    ).strip()


def _section_key(heading: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", heading.casefold()).strip("_")


def _compact_adf_description(description: dict[str, Any]) -> dict[str, Any]:
    sections: dict[str, Any] = {}
    heading = ""
    paragraphs: list[str] = []
    bullets: list[str] = []

    def flush() -> None:
        nonlocal paragraphs, bullets
        if heading in VISIBLE_DESCRIPTION_SECTIONS:
            key = _section_key(heading)
            if bullets:
                sections[key] = bullets
            elif paragraphs:
                sections[key] = "\n".join(paragraphs)
        paragraphs = []
        bullets = []

    for node in description.get("content") or []:
        node_type = node.get("type")
        if node_type == "heading":
            flush()
            heading = _node_text(node)
        elif node_type == "paragraph" and heading:
            value = _node_text(node)
            if value:
                paragraphs.append(value)
        elif node_type == "bulletList" and heading:
            for item in node.get("content") or []:
                for child in item.get("content") or []:
                    value = _node_text(child)
                    if value:
                        bullets.append(value)
    flush()
    return sections


def _compact_wiki_description(description: str) -> dict[str, Any]:
    sections: dict[str, Any] = {}
    heading = ""
    paragraphs: list[str] = []
    bullets: list[str] = []

    def flush() -> None:
        nonlocal paragraphs, bullets
        if heading in VISIBLE_DESCRIPTION_SECTIONS:
            key = _section_key(heading)
            if bullets and not paragraphs:
                sections[key] = bullets
            elif paragraphs:
                sections[key] = "\n".join(paragraphs).strip()
        paragraphs = []
        bullets = []

    for line in description.splitlines():
        heading_match = re.match(r"^h[1-6]\.\s+(.+?)\s*$", line)
        if heading_match:
            flush()
            heading = heading_match.group(1)
            continue
        if not heading or not line.strip():
            continue
        if heading in BULLET_DESCRIPTION_SECTIONS and line.startswith("* "):
            bullets.append(line[2:].strip())
        else:
            paragraphs.append(line.rstrip())
    flush()
    return sections


def compact_description(description: str | dict[str, Any]) -> dict[str, Any]:
    if isinstance(description, str):
        return _compact_wiki_description(description)
    if isinstance(description, dict):
        return _compact_adf_description(description)
    return {}


def _compact_warning(warning: dict[str, Any]) -> dict[str, Any]:
    keys = ["code", "blocking", "accepted"]
    if warning.get("blocking"):
        keys.append("message")
    return {key: warning[key] for key in keys if key in warning}


def compact_preview(preview: dict[str, Any], candidate_limit: int) -> dict[str, Any]:
    candidates: list[dict[str, Any]] = []
    drafts = preview.get("drafts") or []
    for draft in drafts[:candidate_limit]:
        fields = (draft.get("payload") or {}).get("fields") or {}
        proposal = draft.get("summary_proposal") or {}
        duplicate = draft.get("duplicate_search") or {}
        candidates.append({
            "candidate_id": draft.get("candidate_id"),
            "source_row": draft.get("source_row"),
            "test_case_id": draft.get("test_case_id"),
            "summary": fields.get("summary"),
            "summary_source": proposal.get("source"),
            "summary_transformations": proposal.get("transformations") or [],
            "actual_expected_check": draft.get("actual_expected_check") or {},
            "review_state": draft.get("review_state"),
            "creation_state": draft.get("creation_state"),
            "priority": draft.get("resolved_priority"),
            "priority_source": draft.get("priority_source"),
            "found_in_environment": draft.get("found_in_environment"),
            "labels": fields.get("labels") or [],
            "description": compact_description(fields.get("description") or {}),
            "targets": draft.get("target_metadata") or {},
            "evidence": draft.get("evidence_items") or [],
            "diagnostics": compact_diagnostic_items(draft.get("diagnostic_items") or []),
            "chat_extraction": draft.get("chat_extraction") or {},
            "label_provenance": (draft.get("label_classification") or {}).get("provenance") or [],
            "warnings": [_compact_warning(item) for item in draft.get("quality_warnings") or []],
            "duplicate": {
                "state": draft.get("duplicate_state"),
                "checked": bool(duplicate.get("checked")),
                "matches": duplicate.get("matches") or [],
            },
        })

    stats = preview.get("stats") or {}
    compact_stats = {
        key: stats[key]
        for key in (
            "input_rows", "drafts", "ready_for_review", "create_ready",
            "needs_clarification", "invalid", "skip_existing",
            "skipped_by_selection", "created", "linked", "create_failed",
            "link_failed", "skipped_needs_clarification",
        )
        if key in stats
    }
    result: dict[str, Any] = {
        "schema": "ynm-qc-compact-preview/v1",
        "project": preview.get("project"),
        "issue_type": preview.get("issue_type"),
        "source_kind": preview.get("source_kind"),
        "selection_mode": preview.get("selection_mode"),
        "input_mode": preview.get("input_mode"),
        "related_task": preview.get("related_task") or {},
        "jira": preview.get("jira") or {},
        "stats": compact_stats,
        "display": {
            "shown_candidates": len(candidates),
            "total_candidates": len(drafts),
            "truncated": len(drafts) > candidate_limit,
        },
        "candidates": candidates,
        "errors": preview.get("errors") or [],
        "skipped": preview.get("skipped") or [],
    }
    for key in ("creation_results", "creation_skipped", "run_manifest", "writeback_plan"):
        if key in preview:
            result[key] = preview[key]
    return result
