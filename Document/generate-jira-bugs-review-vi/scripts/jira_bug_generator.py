#!/usr/bin/env python3
"""Xem trước hoặc tạo bug Jira Cloud từ file test case hay JSON stdin."""

from __future__ import annotations

import argparse
import base64
import csv
import io
import json
import os
import re
import sys
import unicodedata
import urllib.error
import urllib.request
from collections.abc import Iterable
from pathlib import Path
from typing import Any

ALIASES = {
    "test_case_id": ["test case id", "case id", "tc id", "test id", "id", "testcase id", "ma testcase", "ma test case"],
    "title": ["test case", "test case name", "test name", "name", "title", "scenario", "testcase", "ten testcase", "ten test case", "ten chuc nang", "kich ban"],
    "status": ["status", "result", "execution status", "test result", "execution result", "ket qua chay", "ket qua test", "trang thai"],
    "steps": ["steps", "test steps", "reproduction steps", "steps to reproduce", "procedure", "cac buoc thuc hien", "buoc thuc hien"],
    "expected": ["expected", "expected result", "expected outcome", "expected behavior", "ket qua mong doi", "mong doi"],
    "actual": ["actual", "actual result", "actual outcome", "observed result", "actual behavior", "ket qua thuc te", "thuc te"],
    "environment": ["environment", "env", "test environment", "platform", "moi truong", "moi truong test"],
    "preconditions": ["preconditions", "pre conditions", "pre condition", "prerequisites", "precondition", "dieu kien tien quyet", "dieu kien truoc"],
    "severity": ["severity", "priority", "impact", "muc do", "do uu tien"],
    "evidence": ["evidence", "attachment", "attachments", "screenshot", "log", "video", "bang chung", "tep dinh kem"],
    "component": ["component", "module", "module feature", "feature", "area", "chuc nang", "phan he"],
    "test_data": ["test data", "data", "du lieu test", "du lieu kiem thu"],
    "remarks": ["remarks", "remark", "notes", "note", "ghi chu"],
    "test_type": ["test type", "type", "loai test", "loai kiem thu"],
    "assigned_to": ["assigned to", "tester", "owner", "nguoi thuc hien", "nguoi phu trach"],
    "bug_id": ["bug id", "jira id", "jira key", "issue key", "ma bug"],
    "bug_status": ["bug status", "jira status", "issue status", "trang thai bug"],
    "bug_summary": ["bug summary", "bug title", "jira summary", "defect title", "tieu de bug"],
}

PRIORITY_MAP = {
    "blocker": "Highest",
    "critical": "Highest",
    "highest": "Highest",
    "high": "High",
    "major": "High",
    "medium": "Medium",
    "normal": "Medium",
    "minor": "Low",
    "low": "Low",
    "lowest": "Lowest",
    "trivial": "Lowest",
    "nghiem trong": "Highest",
    "rat cao": "Highest",
    "cao": "High",
    "trung binh": "Medium",
    "thap": "Low",
}

CORE_JIRA_FIELDS = {"project", "summary", "issuetype", "description"}
CANONICAL_FIELDS = set(ALIASES)
MAX_CREATE_BATCH = 10
AMBIGUOUS_ACTUAL_MARKERS = (
    "can confirm",
    "chua check",
    "cho kiem tra",
    "cho confirm",
    "can kiem tra lai",
    "khong ro",
    "co ve",
    "tbc",
)
CONTRADICTORY_ACTUAL_MARKERS = (
    "da dung yeu cau",
    "hoat dong binh thuong",
    "dung nhu mong doi",
)


class InputError(ValueError):
    """Lỗi khi không thể diễn giải input một cách an toàn."""


class JiraError(RuntimeError):
    """Lỗi khi lời gọi HTTP tới Jira thất bại."""


def normalized(value: Any) -> str:
    text = str(value or "").replace("đ", "d").replace("Đ", "D")
    text = unicodedata.normalize("NFKD", text)
    text = "".join(char for char in text if not unicodedata.combining(char))
    return re.sub(r"[^a-z0-9]+", " ", text.lower()).strip()


def clean(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    if isinstance(value, (dict, list)):
        return json.dumps(value, ensure_ascii=False)
    return str(value).strip()


def parse_json_rows(data: Any) -> list[dict[str, Any]]:
    if isinstance(data, dict):
        for key in ("testCases", "test_cases", "cases", "rows", "data"):
            if isinstance(data.get(key), list):
                data = data[key]
                break
    if not isinstance(data, list) or not all(isinstance(row, dict) for row in data):
        raise InputError("JSON phải là một mảng object hoặc chứa một array key được hỗ trợ")
    return data


def read_json(path: Path) -> list[dict[str, Any]]:
    try:
        data = json.loads(path.read_text(encoding="utf-8-sig"))
    except (OSError, json.JSONDecodeError) as exc:
        raise InputError(f"Không thể đọc JSON input: {exc}") from exc
    return parse_json_rows(data)


def read_json_stdin() -> list[dict[str, Any]]:
    try:
        return parse_json_rows(json.load(sys.stdin))
    except json.JSONDecodeError as exc:
        raise InputError(f"Không thể đọc JSON từ stdin: {exc}") from exc


def read_csv(path: Path) -> list[dict[str, Any]]:
    try:
        raw = path.read_text(encoding="utf-8-sig")
    except (OSError, UnicodeDecodeError) as exc:
        raise InputError(f"Không thể đọc CSV dưới dạng UTF-8: {exc}") from exc
    try:
        dialect = csv.Sniffer().sniff(raw[:8192], delimiters=",;\t|")
    except csv.Error:
        dialect = csv.excel
    rows = list(csv.DictReader(io.StringIO(raw), dialect=dialect))
    if not rows:
        raise InputError("CSV không có dòng dữ liệu")
    return rows


def read_xlsx(path: Path, sheet: str | None) -> list[dict[str, Any]]:
    try:
        from openpyxl import load_workbook
    except ImportError as exc:
        raise InputError("Đọc XLSX cần openpyxl: python3 -m pip install openpyxl") from exc
    try:
        workbook = load_workbook(path, read_only=True, data_only=True)
    except Exception as exc:
        raise InputError(f"Không thể đọc XLSX input: {exc}") from exc
    if sheet and sheet not in workbook.sheetnames:
        raise InputError(f"Không tìm thấy worksheet '{sheet}'. Hiện có: {', '.join(workbook.sheetnames)}")
    worksheet = workbook[sheet] if sheet else workbook.active
    values = list(worksheet.iter_rows(values_only=True))
    header_index = next((i for i, row in enumerate(values) if any(clean(v) for v in row)), None)
    if header_index is None:
        raise InputError("Worksheet XLSX đang trống")
    headers = [clean(value) for value in values[header_index]]
    if not any(headers):
        raise InputError("Dòng header XLSX đang trống")
    rows: list[dict[str, Any]] = []
    for values_row in values[header_index + 1 :]:
        if not any(clean(value) for value in values_row):
            continue
        rows.append({headers[i]: value for i, value in enumerate(values_row) if i < len(headers) and headers[i]})
    if not rows:
        raise InputError("Worksheet XLSX không có dữ liệu sau header")
    return rows


def read_rows(path: Path, sheet: str | None) -> list[dict[str, Any]]:
    if not path.exists() or not path.is_file():
        raise InputError(f"File input không tồn tại: {path}")
    suffix = path.suffix.lower()
    if suffix == ".json":
        return read_json(path)
    if suffix in {".csv", ".tsv"}:
        return read_csv(path)
    if suffix == ".xlsx":
        return read_xlsx(path, sheet)
    raise InputError("Định dạng input không được hỗ trợ. Hãy dùng .csv, .tsv, .json hoặc .xlsx")


def load_object(path_text: str | None, label: str) -> dict[str, Any]:
    if not path_text:
        return {}
    path = Path(path_text).expanduser().resolve()
    try:
        data = json.loads(path.read_text(encoding="utf-8-sig"))
    except (OSError, json.JSONDecodeError) as exc:
        raise InputError(f"Không thể đọc {label}: {exc}") from exc
    if not isinstance(data, dict):
        raise InputError(f"{label} phải chứa một JSON object")
    return data


def build_header_map(headers: Iterable[str], explicit: dict[str, Any]) -> dict[str, str]:
    header_lookup = {normalized(header): header for header in headers if clean(header)}
    mapping: dict[str, str] = {}
    unknown = sorted(set(explicit) - CANONICAL_FIELDS)
    if unknown:
        raise InputError(f"Field chuẩn không được hỗ trợ trong field map: {', '.join(unknown)}")
    for canonical, source in explicit.items():
        source_normalized = normalized(source)
        if source_normalized not in header_lookup:
            raise InputError(f"Không tìm thấy header nguồn được map cho {canonical}: {source}")
        mapping[canonical] = header_lookup[source_normalized]
    for canonical, aliases in ALIASES.items():
        if canonical in mapping:
            continue
        for alias in aliases:
            if normalized(alias) in header_lookup:
                mapping[canonical] = header_lookup[normalized(alias)]
                break
    return mapping


def adf_text(text: str) -> dict[str, Any]:
    return {"type": "text", "text": text}


def adf_paragraph(text: str) -> dict[str, Any]:
    content = [adf_text(text)] if text else []
    return {"type": "paragraph", "content": content}


def add_section(content: list[dict[str, Any]], heading: str, value: str) -> None:
    if not value:
        return
    content.append({"type": "heading", "attrs": {"level": 3}, "content": [adf_text(heading)]})
    lines = value.replace("\r\n", "\n").replace("\r", "\n").split("\n")
    for line in lines:
        content.append(adf_paragraph(line))


def add_bullet_section(content: list[dict[str, Any]], heading: str, values: list[str]) -> None:
    items = [value for value in values if value]
    if not items:
        return
    content.append({"type": "heading", "attrs": {"level": 3}, "content": [adf_text(heading)]})
    content.append({
        "type": "bulletList",
        "content": [
            {"type": "listItem", "content": [adf_paragraph(value)]}
            for value in items
        ],
    })


def build_description(record: dict[str, str], source_row: int, source_url: str) -> dict[str, Any]:
    content: list[dict[str, Any]] = []
    add_section(content, "Điều kiện tiên quyết", record["preconditions"])
    add_section(content, "Các bước tái hiện", record["steps"])
    add_section(content, "Kết quả thực tế", record["actual"])
    add_section(content, "Kết quả mong đợi", record["expected"])
    add_section(content, "Dữ liệu kiểm thử", record["test_data"])
    add_section(content, "Môi trường", record["environment"])
    add_section(content, "Bằng chứng", record["evidence"] or "Chưa có bằng chứng được cung cấp.")
    add_section(content, "Ghi chú", record["remarks"])

    source_lines = []
    if record["test_case_id"]:
        source_lines.append(f"Test case: {record['test_case_id']}")
    if record["title"]:
        source_lines.append(f"Kịch bản kiểm thử: {record['title']}")
    if record["component"]:
        source_lines.append(f"Module/Feature: {record['component']}")
    if record["severity"]:
        source_lines.append(f"Priority nguồn: {record['severity']}")
    if record["test_type"]:
        source_lines.append(f"Loại kiểm thử: {record['test_type']}")
    if record["assigned_to"]:
        source_lines.append(f"Người thực hiện nguồn: {record['assigned_to']}")
    source_lines.append(f"Dòng nguồn: {source_row}")
    if source_url:
        source_lines.append(f"URL nguồn: {source_url}")
    if record["bug_status"]:
        source_lines.append(f"Trạng thái bug nguồn: {record['bug_status']}")
    add_bullet_section(content, "Thông tin nguồn", source_lines)
    return {"type": "doc", "version": 1, "content": content}


def strip_generic_actual_prefix(value: str) -> str:
    text = re.sub(r"\s+", " ", value).strip()
    patterns = (
        r"^(?:hiện tại\s+)?(?:đang\s+)?(?:bị\s+)?(?:bug|lỗi)\s*[:\-]?\s*",
        r"^(?:actual(?: result)?|thực tế)\s*[:\-]\s*",
    )
    for pattern in patterns:
        text = re.sub(pattern, "", text, flags=re.IGNORECASE).strip()
    text = re.sub(r"\bredis\b", "Redis", text, flags=re.IGNORECASE)
    text = re.sub(r"\bapi\b", "API", text, flags=re.IGNORECASE)
    text = re.sub(r"\bui\b", "UI", text, flags=re.IGNORECASE)
    return text[:1].upper() + text[1:] if text else ""


def strip_test_title_tags(value: str) -> str:
    return re.sub(r"^(?:\s*\[[^\]]+\])+\s*", "", value).strip()


def derive_summary(record: dict[str, str]) -> str:
    supplied_summary = record["bug_summary"]
    supplied_normalized = normalized(supplied_summary)
    if supplied_normalized.startswith(("kiem tra", "verify", "validate", "test ")):
        supplied_summary = ""
    body = strip_generic_actual_prefix(supplied_summary or record["actual"])
    if not body:
        body = strip_test_title_tags(record["title"]) or "Hành vi lỗi cần làm rõ"
    component = record["component"].strip()
    if component and not body.startswith("["):
        body = f"[{component}] {body}"
    return body


def safe_summary(summary_text: str) -> str:
    summary = re.sub(r"\s+", " ", summary_text).strip()
    if len(summary) <= 255:
        return summary
    return summary[:252].rstrip() + "..."


def canonical_record(row: dict[str, Any], mapping: dict[str, str]) -> dict[str, str]:
    return {field: clean(row.get(mapping[field], "")) if field in mapping else "" for field in ALIASES}


def evaluate_quality(record: dict[str, str]) -> tuple[str, list[dict[str, Any]]]:
    warnings: list[dict[str, Any]] = []

    def add_warning(code: str, message: str, blocking: bool) -> None:
        warnings.append({"code": code, "message": message, "blocking": blocking})

    actual = normalized(record["actual"])
    expected = normalized(record["expected"])
    status = normalized(record["status"])
    bug_summary = normalized(record["bug_summary"])
    if any(marker in actual for marker in AMBIGUOUS_ACTUAL_MARKERS):
        add_warning("actual_needs_confirmation", "ACTUAL RESULT chứa nội dung chưa được xác nhận rõ", True)
    if actual in {"loi", "bi loi", "khong dung", "sai"} or len(actual) < 10:
        add_warning("actual_too_vague", "ACTUAL RESULT quá ngắn hoặc chưa mô tả hành vi quan sát được", True)
    if actual and expected and actual == expected:
        add_warning("expected_equals_actual", "EXPECTED RESULT và ACTUAL RESULT giống nhau", True)
    if status == "bug" and any(marker in actual for marker in CONTRADICTORY_ACTUAL_MARKERS):
        add_warning("status_actual_conflict", "STATUS=BUG nhưng ACTUAL RESULT cho biết hệ thống đang đúng", True)
    if bug_summary.startswith(("kiem tra", "verify", "validate", "test ")):
        add_warning("bug_summary_is_test_intent", "BUG SUMMARY đang mô tả mục tiêu kiểm thử; skill sẽ dùng ACTUAL RESULT thay thế", False)
    if not record["steps"]:
        add_warning("missing_steps", "Thiếu TEST STEPS hoặc bước tái hiện tương đương", True)
    if not record["severity"]:
        add_warning("missing_priority", "Không có priority nguồn; skill sẽ không tự suy đoán", False)
    if not record["evidence"]:
        add_warning("missing_evidence", "Không có đường dẫn hoặc URL bằng chứng", False)

    review_state = "needs_clarification" if any(item["blocking"] for item in warnings) else "ready"
    return review_state, warnings


def build_preview(
    rows: list[dict[str, Any]],
    project: str,
    issue_type: str,
    include_statuses: set[str],
    labels: list[str],
    field_map: dict[str, Any],
    extra_fields: dict[str, Any],
    source_url: str = "",
) -> dict[str, Any]:
    if not rows:
        raise InputError("Input không có dòng dữ liệu")
    mapping = build_header_map((key for row in rows for key in row), field_map)
    if "status" not in mapping:
        raise InputError("Không tìm thấy cột status/result; hãy cung cấp --field-map")
    forbidden = sorted(CORE_JIRA_FIELDS.intersection(extra_fields))
    if forbidden:
        raise InputError(f"Extra fields không được ghi đè field Jira cốt lõi: {', '.join(forbidden)}")

    drafts: list[dict[str, Any]] = []
    errors: list[dict[str, Any]] = []
    skipped: list[dict[str, Any]] = []
    all_quality_warnings: list[dict[str, Any]] = []
    seen_ids: set[str] = set()
    skipped_status = 0
    skipped_existing_bug_id = 0

    for source_row, row in enumerate(rows, start=2):
        record = canonical_record(row, mapping)
        status = normalized(record["status"])
        if status not in include_statuses:
            skipped_status += 1
            continue
        if record["bug_id"]:
            skipped_existing_bug_id += 1
            skipped.append({
                "source_row": source_row,
                "test_case_id": record["test_case_id"],
                "bug_id": record["bug_id"],
                "reason": "đã có BUG ID",
            })
            continue
        identity = normalized(record["test_case_id"])
        if identity and identity in seen_ids:
            errors.append({"source_row": source_row, "test_case_id": record["test_case_id"], "error": "trùng test-case ID"})
            continue
        missing = []
        if not record["test_case_id"] and not record["title"]:
            missing.append("test_case_id hoặc title")
        if not record["expected"]:
            missing.append("expected")
        if not record["actual"]:
            missing.append("actual")
        if missing:
            errors.append({"source_row": source_row, "test_case_id": record["test_case_id"], "error": f"thiếu dữ liệu bắt buộc: {', '.join(missing)}"})
            continue
        if identity:
            seen_ids.add(identity)

        review_state, quality_warnings = evaluate_quality(record)
        for warning in quality_warnings:
            all_quality_warnings.append({
                "source_row": source_row,
                "test_case_id": record["test_case_id"],
                **warning,
            })

        fields: dict[str, Any] = {
            "project": {"key": project},
            "summary": safe_summary(derive_summary(record)),
            "issuetype": {"name": issue_type},
            "description": build_description(record, source_row, source_url),
        }
        priority = PRIORITY_MAP.get(normalized(record["severity"]))
        if priority:
            fields["priority"] = {"name": priority}
        if labels:
            fields["labels"] = labels
        fields.update(extra_fields)
        drafts.append({
            "source_row": source_row,
            "test_case_id": record["test_case_id"],
            "source_status": record["status"],
            "source_severity": record["severity"],
            "source_bug_status": record["bug_status"],
            "review_state": review_state,
            "quality_warnings": quality_warnings,
            "payload": {"fields": fields},
        })

    return {
        "project": project,
        "issue_type": issue_type,
        "header_mapping": mapping,
        "drafts": drafts,
        "errors": errors,
        "skipped": skipped,
        "quality_warnings": all_quality_warnings,
        "source_url": source_url or None,
        "stats": {
            "input_rows": len(rows),
            "drafts": len(drafts),
            "validation_errors": len(errors),
            "skipped_by_status": skipped_status,
            "skipped_existing_bug_id": skipped_existing_bug_id,
            "quality_warnings": len(all_quality_warnings),
            "needs_clarification": sum(1 for item in drafts if item["review_state"] == "needs_clarification"),
        },
    }


def jira_credentials() -> tuple[str, str, str]:
    base_url = os.environ.get("JIRA_BASE_URL", "").strip().rstrip("/")
    email = os.environ.get("JIRA_EMAIL", "").strip()
    token = os.environ.get("JIRA_API_TOKEN", "").strip()
    missing = [name for name, value in (("JIRA_BASE_URL", base_url), ("JIRA_EMAIL", email), ("JIRA_API_TOKEN", token)) if not value]
    if missing:
        raise InputError(f"Thiếu biến môi trường Jira: {', '.join(missing)}")
    if not base_url.startswith("https://"):
        raise InputError("JIRA_BASE_URL phải bắt đầu bằng https://")
    return base_url, email, token


def jira_request(method: str, path: str, payload: dict[str, Any] | None = None) -> tuple[int, dict[str, Any]]:
    base_url, email, token = jira_credentials()
    credentials = base64.b64encode(f"{email}:{token}".encode()).decode("ascii")
    body = json.dumps(payload).encode("utf-8") if payload is not None else None
    request = urllib.request.Request(
        f"{base_url}{path}",
        data=body,
        method=method,
        headers={
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": f"Basic {credentials}",
            "User-Agent": "generate-jira-bugs-skill/1.0",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            raw = response.read().decode("utf-8")
            return response.status, json.loads(raw) if raw else {}
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8", errors="replace")
        try:
            details = json.loads(raw)
        except json.JSONDecodeError:
            details = {"message": raw[:2000]}
        raise JiraError(f"Jira trả về HTTP {exc.code}: {json.dumps(details, ensure_ascii=False)}") from exc
    except urllib.error.URLError as exc:
        raise JiraError(f"Không thể kết nối Jira: {exc.reason}") from exc


def check_auth() -> dict[str, Any]:
    _, profile = jira_request("GET", "/rest/api/3/myself")
    return {
        "ok": True,
        "account_id": profile.get("accountId"),
        "display_name": profile.get("displayName"),
        "email": profile.get("emailAddress"),
    }


def create_issues(preview: dict[str, Any]) -> list[dict[str, Any]]:
    base_url, _, _ = jira_credentials()
    results = []
    for draft in preview["drafts"]:
        summary = draft["payload"]["fields"]["summary"]
        try:
            status, data = jira_request("POST", "/rest/api/3/issue", draft["payload"])
            key = data.get("key")
            results.append({
                "ok": status == 201 and bool(key),
                "test_case_id": draft["test_case_id"],
                "summary": summary,
                "id": data.get("id"),
                "key": key,
                "url": f"{base_url}/browse/{key}" if key else None,
            })
        except (JiraError, InputError) as exc:
            results.append({
                "ok": False,
                "test_case_id": draft["test_case_id"],
                "summary": summary,
                "error": str(exc),
            })
    return results


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", help="Đường dẫn CSV, TSV, JSON hoặc XLSX; dùng - để đọc JSON stdin")
    parser.add_argument("--project", default=os.environ.get("JIRA_PROJECT_KEY"), help="Jira project key")
    parser.add_argument("--issue-type", default="Bug", help="Tên Jira issue type (mặc định: Bug)")
    parser.add_argument("--sheet", help="Tên worksheet XLSX; mặc định là worksheet active")
    parser.add_argument("--include-status", default="bug,failed,fail,error,errored,thất bại,lỗi", help="Các result được chọn, phân cách bằng dấu phẩy")
    parser.add_argument("--labels", default="generated-from-testcases", help="Các Jira label, phân cách bằng dấu phẩy")
    parser.add_argument("--field-map", help="File JSON map field chuẩn sang header nguồn")
    parser.add_argument("--extra-fields", help="JSON object chứa field Jira bổ sung")
    parser.add_argument("--source-url", default="", help="URL Google Sheet hoặc test run nguồn")
    parser.add_argument("--output", help="Ghi kết quả JSON vào đường dẫn này; mặc định in ra stdout")
    parser.add_argument("--create", action="store_true", help="Tạo issue sau khi đã preview và được duyệt")
    parser.add_argument("--yes", action="store_true", help="Xác nhận bắt buộc khi dùng --create")
    parser.add_argument("--allow-quality-warnings", action="store_true", help="Cho phép tạo draft có cảnh báo chặn sau khi người dùng duyệt rõ")
    parser.add_argument("--check-auth", action="store_true", help="Kiểm tra credentials Jira mà không tạo issue")
    return parser.parse_args()


def write_result(result: dict[str, Any], output: str | None) -> None:
    rendered = json.dumps(result, ensure_ascii=False, indent=2)
    if output:
        path = Path(output).expanduser().resolve()
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(rendered + "\n", encoding="utf-8")
        print(f"Đã ghi kết quả vào {path}", file=sys.stderr)
    else:
        print(rendered)


def main() -> int:
    args = parse_args()
    try:
        if args.check_auth:
            write_result(check_auth(), args.output)
            return 0
        if not args.input:
            raise InputError("Bắt buộc có --input, trừ khi dùng --check-auth")
        if not args.project or not re.fullmatch(r"[A-Za-z][A-Za-z0-9_]*", args.project.strip()):
            raise InputError("Hãy cung cấp Jira project key hợp lệ bằng --project hoặc JIRA_PROJECT_KEY")
        if args.create and not args.yes:
            raise InputError("Tạo issue thật cần đồng thời --create và --yes sau khi người dùng xác nhận rõ")

        if args.input == "-":
            rows = read_json_stdin()
            input_label = "stdin"
        else:
            path = Path(args.input).expanduser().resolve()
            rows = read_rows(path, args.sheet)
            input_label = str(path)
        field_map = load_object(args.field_map, "field map")
        extra_fields = load_object(args.extra_fields, "extra fields")
        statuses = {normalized(value) for value in args.include_status.split(",") if normalized(value)}
        if not statuses:
            raise InputError("--include-status phải có ít nhất một giá trị")
        labels = [value.strip() for value in args.labels.split(",") if value.strip()]
        preview = build_preview(rows, args.project.upper(), args.issue_type, statuses, labels, field_map, extra_fields, args.source_url)
        preview["input_file"] = input_label
        if args.create:
            if len(preview["drafts"]) > MAX_CREATE_BATCH:
                raise InputError(f"Một batch chỉ được tạo tối đa {MAX_CREATE_BATCH} issue; hãy chia nhỏ và xin duyệt từng batch")
            blocked = [item for item in preview["drafts"] if item["review_state"] == "needs_clarification"]
            if blocked and not args.allow_quality_warnings:
                ids = ", ".join(item["test_case_id"] or f"dòng {item['source_row']}" for item in blocked)
                raise InputError(f"Có draft NEEDS_CLARIFICATION ({ids}); sửa dữ liệu hoặc xác nhận rõ trước khi dùng --allow-quality-warnings")
            preview["creation_results"] = create_issues(preview)
            preview["stats"]["created"] = sum(1 for item in preview["creation_results"] if item["ok"])
            preview["stats"]["create_failed"] = sum(1 for item in preview["creation_results"] if not item["ok"])
        write_result(preview, args.output)
        return 0 if not args.create or preview["stats"]["create_failed"] == 0 else 2
    except (InputError, JiraError) as exc:
        print(f"Lỗi: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
