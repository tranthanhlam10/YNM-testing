from __future__ import annotations

import re
import urllib.parse
from typing import Any

from .common import InputError, clean
from .identity import hash_value


def parse_google_sheet_url(source_url: str) -> dict[str, str]:
    text = clean(source_url)
    if not text:
        return {"spreadsheet_id": "", "sheet_gid": ""}
    match = re.search(r"/spreadsheets/d/([A-Za-z0-9_-]+)", text)
    if not match:
        raise InputError("Source URL không phải Google Sheets URL hợp lệ")
    parsed = urllib.parse.urlparse(text)
    query = urllib.parse.parse_qs(parsed.query)
    fragment = urllib.parse.parse_qs(parsed.fragment)
    gid = (query.get("gid") or fragment.get("gid") or [""])[0]
    return {"spreadsheet_id": match.group(1), "sheet_gid": gid}


def column_letter(index: int) -> str:
    if index < 1:
        raise InputError("Column index phải lớn hơn 0")
    result = ""
    while index:
        index, remainder = divmod(index - 1, 26)
        result = chr(65 + remainder) + result
    return result


def build_source_locator(
    *, source_url: str, source_row: int, row: dict[str, Any], mapping: dict[str, str], sheet_name: str = "",
) -> dict[str, Any]:
    sheet = parse_google_sheet_url(source_url) if source_url else {"spreadsheet_id": "", "sheet_gid": ""}
    bug_header = mapping.get("bug_id", "")
    headers = list(row)
    bug_column = column_letter(headers.index(bug_header) + 1) if bug_header in headers else ""
    return {
        **sheet,
        "sheet_name": clean(sheet_name),
        "source_row": source_row,
        "bug_id_header": bug_header,
        "bug_id_column": bug_column,
        "bug_id_cell": f"{bug_column}{source_row}" if bug_column else "",
        "expected_bug_id": clean(row.get(bug_header)) if bug_header else "",
        "source_fingerprint": hash_value(row),
    }


def build_writeback_plan(preview: dict[str, Any], creation_results: list[dict[str, Any]]) -> dict[str, Any]:
    by_candidate = {item.get("candidate_id"): item for item in creation_results}
    operations: list[dict[str, Any]] = []
    skipped: list[dict[str, Any]] = []
    for draft in preview.get("drafts", []):
        result = by_candidate.get(draft.get("candidate_id"))
        if not result or not result.get("created") or not result.get("linked"):
            continue
        locator = draft.get("source_locator") or {}
        if not locator.get("bug_id_cell"):
            skipped.append({"candidate_id": draft.get("candidate_id"), "reason": "missing_bug_id_column"})
            continue
        if locator.get("expected_bug_id"):
            skipped.append({"candidate_id": draft.get("candidate_id"), "reason": "bug_id_not_empty"})
            continue
        operations.append({
            "candidate_id": draft["candidate_id"],
            "test_case_id": draft.get("test_case_id", ""),
            "spreadsheet_id": locator.get("spreadsheet_id", ""),
            "sheet_gid": locator.get("sheet_gid", ""),
            "sheet_name": locator.get("sheet_name", ""),
            "cell": locator["bug_id_cell"],
            "expected_current_value": "",
            "source_fingerprint": locator.get("source_fingerprint", ""),
            "value": result.get("url") or result.get("key"),
            "state": "pending_confirmation",
        })
    return {
        "requires_separate_confirmation": True,
        "operations": operations,
        "skipped": skipped,
    }


def validate_writeback_snapshot(expected_value: Any, current_value: Any, expected_fingerprint: str, current_row: Any) -> None:
    if clean(current_value) != clean(expected_value):
        raise InputError("WRITEBACK_CONFLICT: ô BUG ID đã thay đổi")
    if hash_value(current_row) != expected_fingerprint:
        raise InputError("WRITEBACK_CONFLICT: dòng nguồn đã thay đổi sau preview")
