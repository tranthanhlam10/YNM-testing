from __future__ import annotations

import csv
import json
import sys
from pathlib import Path
from typing import Any

from .common import InputError, clean, normalized
from .config import ALIASES, CANONICAL_FIELDS, ROW_OVERRIDE_FIELDS


def parse_json_rows(data: Any) -> list[dict[str, Any]]:
    if isinstance(data, list):
        rows = data
    elif isinstance(data, dict):
        rows = next((data[key] for key in ("testCases", "test_cases", "cases", "rows", "data") if key in data), None)
        if rows is None:
            rows = [data]
    else:
        raise InputError("JSON input phải là array hoặc object")
    if not isinstance(rows, list) or not all(isinstance(row, dict) for row in rows):
        raise InputError("Danh sách test case phải chứa các JSON object")
    return rows


def read_json(path: Path) -> list[dict[str, Any]]:
    with path.open(encoding="utf-8-sig") as handle:
        return parse_json_rows(json.load(handle))


def read_json_stdin() -> list[dict[str, Any]]:
    try:
        return parse_json_rows(json.load(sys.stdin))
    except json.JSONDecodeError as exc:
        raise InputError(f"JSON stdin không hợp lệ: {exc}") from exc


def read_csv(path: Path) -> list[dict[str, Any]]:
    delimiter = "\t" if path.suffix.casefold() == ".tsv" else ","
    with path.open(encoding="utf-8-sig", newline="") as handle:
        return [dict(row) for row in csv.DictReader(handle, delimiter=delimiter)]


def read_xlsx(path: Path, sheet: str | None) -> list[dict[str, Any]]:
    try:
        import openpyxl
    except ImportError as exc:
        raise InputError("Đọc XLSX cần package openpyxl") from exc
    workbook = openpyxl.load_workbook(path, read_only=True, data_only=True)
    try:
        worksheet = workbook[sheet] if sheet else workbook.active
        values = worksheet.iter_rows(values_only=True)
        headers = None
        rows = []
        for raw in values:
            if headers is None:
                if not any(clean(value) for value in raw):
                    continue
                headers = [clean(value) or f"column_{index + 1}" for index, value in enumerate(raw)]
                continue
            if not any(clean(value) for value in raw):
                continue
            rows.append({headers[index]: value for index, value in enumerate(raw) if index < len(headers)})
        return rows
    finally:
        workbook.close()


def read_rows(path: Path, sheet: str | None) -> list[dict[str, Any]]:
    if not path.exists():
        raise InputError(f"Không tìm thấy input: {path}")
    suffix = path.suffix.casefold()
    if suffix == ".json":
        return read_json(path)
    if suffix in {".csv", ".tsv"}:
        return read_csv(path)
    if suffix == ".xlsx":
        return read_xlsx(path, sheet)
    raise InputError("Chỉ hỗ trợ CSV, TSV, JSON hoặc XLSX")


def load_object(path_text: str | None, label: str) -> dict[str, Any]:
    if not path_text:
        return {}
    path = Path(path_text).expanduser().resolve()
    try:
        with path.open(encoding="utf-8") as handle:
            data = json.load(handle)
    except (OSError, json.JSONDecodeError) as exc:
        raise InputError(f"Không đọc được {label}: {exc}") from exc
    if not isinstance(data, dict):
        raise InputError(f"{label} phải là JSON object")
    return data


def build_header_map(headers: Any, explicit: dict[str, Any]) -> dict[str, str]:
    header_lookup = {normalized(header): str(header) for header in headers if clean(header)}
    mapping: dict[str, str] = {}
    for field, aliases in ALIASES.items():
        for alias in [field, *aliases]:
            if normalized(alias) in header_lookup:
                mapping[field] = header_lookup[normalized(alias)]
                break
    for field, header in explicit.items():
        if field not in CANONICAL_FIELDS:
            raise InputError(f"Field map chứa field không hỗ trợ: {field}")
        if normalized(header) not in header_lookup:
            raise InputError(f"Field map trỏ tới header không tồn tại: {header}")
        mapping[field] = header_lookup[normalized(header)]
    return mapping


def _clean_canonical_value(field: str, value: Any) -> str:
    if isinstance(value, list) and field in {"evidence", "branch", "domain"}:
        rendered = []
        for item in value:
            if isinstance(item, dict):
                label = clean(item.get("name") or item.get("label") or item.get("type"))
                url = clean(item.get("url"))
                rendered.append(f"{label}: {url}".strip(": "))
            else:
                rendered.append(clean(item))
        return "\n".join(item for item in rendered if item)
    return clean(value)


def canonical_record(row: dict[str, Any], mapping: dict[str, str]) -> dict[str, str]:
    return {
        field: _clean_canonical_value(field, row.get(mapping[field], "")) if field in mapping else ""
        for field in ALIASES
    }


def validate_overrides(overrides: dict[str, Any]) -> None:
    allowed_sections = {"defaults", "rows", "test_case_ids"}
    unknown_sections = set(overrides) - allowed_sections
    if unknown_sections:
        raise InputError("Row overrides có section không hỗ trợ: " + ", ".join(sorted(unknown_sections)))
    for section in allowed_sections:
        value = overrides.get(section, {})
        if not isinstance(value, dict):
            raise InputError(f"Row overrides.{section} phải là JSON object")
        candidates = [value] if section == "defaults" else value.values()
        for patch in candidates:
            if not isinstance(patch, dict):
                raise InputError(f"Mỗi override trong {section} phải là JSON object")
            unknown_fields = set(patch) - ROW_OVERRIDE_FIELDS
            if unknown_fields:
                raise InputError("Override chứa field không được sửa: " + ", ".join(sorted(unknown_fields)))


def apply_row_overrides(record: dict[str, str], source_row: int, overrides: dict[str, Any]) -> tuple[dict[str, str], list[str]]:
    if not overrides:
        return record, []
    applied: list[str] = []
    result = dict(record)
    patches = [("defaults", overrides.get("defaults", {}))]
    test_case_id = clean(record.get("test_case_id"))
    if test_case_id and test_case_id in overrides.get("test_case_ids", {}):
        patches.append((f"test_case_id:{test_case_id}", overrides["test_case_ids"][test_case_id]))
    row_key = str(source_row)
    if row_key in overrides.get("rows", {}):
        patches.append((f"row:{row_key}", overrides["rows"][row_key]))
    for source, patch in patches:
        for field, value in patch.items():
            result[field] = clean(value)
        if patch:
            applied.append(source)
    return result, applied
