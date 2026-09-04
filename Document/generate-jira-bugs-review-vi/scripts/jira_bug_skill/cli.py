from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path
from typing import Any

from .common import InputError, JiraError, clean, clean_label, normalized, parse_related_task, project_from_issue_key
from .config import (
    DEFAULT_BUG_STATUSES, DEFAULT_ISSUE_LINK_TYPE, DEFAULT_ISSUE_TYPE,
    DEFAULT_READY_VALUES, DEFAULT_SELECTION_MODE, MAX_CREATE_BATCH,
    MAX_PREVIEW_CANDIDATES, SELECTION_MODES,
)
from .duplicates import accept_duplicate_risk, attach_duplicate_results
from .jira_client import check_auth, create_issues, get_issue_context, search_duplicate_issues
from .manifest import RunManifest
from .presentation import compact_preview
from .sheet_adapter import build_writeback_plan
from .sources import load_object, read_json_stdin, read_rows
from .workflow import build_preview


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Xem trước hoặc tạo bug Jira từ Sheet, file hay chat")
    parser.add_argument("--input", help="CSV, TSV, JSON, XLSX; dùng - cho JSON stdin")
    parser.add_argument("--related-task", help="Jira task key hoặc URL bắt buộc")
    parser.add_argument("--project", help="Project tùy chọn để đối chiếu với related task")
    parser.add_argument("--issue-type", default=DEFAULT_ISSUE_TYPE)
    parser.add_argument("--sheet", help="Worksheet XLSX; mặc định worksheet active")
    parser.add_argument("--include-status", default=",".join(sorted(DEFAULT_BUG_STATUSES)))
    parser.add_argument("--selection-mode", choices=sorted(SELECTION_MODES), default=DEFAULT_SELECTION_MODE)
    parser.add_argument("--ready-values", default=",".join(sorted(DEFAULT_READY_VALUES)))
    parser.add_argument("--source-kind", choices=("auto", "sheet", "file", "chat"), default="auto")
    parser.add_argument("--labels", default="", help="Label thuộc allowlist, phân cách bằng dấu phẩy")
    parser.add_argument("--field-map", help="JSON map canonical field sang header nguồn")
    parser.add_argument("--overrides", help="JSON override theo defaults, source row hoặc test-case ID")
    parser.add_argument("--extra-fields", help="JSON chứa Jira custom fields bổ sung")
    parser.add_argument(
        "--found-in-environment-field",
        default=os.environ.get("JIRA_FOUND_IN_ENVIRONMENT_FIELD", ""),
        help="Custom field ID cho Found In Environment",
    )
    parser.add_argument("--source-url", default="")
    parser.add_argument("--source-sheet-name", default="", help="Tên tab Google Sheet đã resolve từ gid")
    parser.add_argument("--batch-limit", type=int, default=MAX_CREATE_BATCH, help=f"Giới hạn lần chạy; policy tối đa {MAX_CREATE_BATCH}")
    parser.add_argument(
        "--preview-limit",
        type=int,
        default=MAX_PREVIEW_CANDIDATES,
        help=f"Số candidate tối đa trong compact preview; mặc định {MAX_PREVIEW_CANDIDATES}",
    )
    parser.add_argument("--search-duplicates", action="store_true", help="Tìm Jira bug có khả năng trùng trong preview")
    parser.add_argument("--allow-possible-duplicates", action="store_true", help="Xác nhận vẫn tạo bug mới sau khi đã review duplicate")
    parser.add_argument("--manifest", help="Run manifest JSON bắt buộc khi tạo thật để resume an toàn")
    parser.add_argument("--output", help="Ghi JSON output vào file")
    parser.add_argument(
        "--output-format",
        choices=("auto", "compact", "full"),
        default="auto",
        help="auto: compact khi preview, full khi tạo; dùng full để xem toàn bộ Jira payload",
    )
    parser.add_argument("--create", action="store_true")
    parser.add_argument("--yes", action="store_true")
    parser.add_argument("--allow-quality-warnings", action="store_true", help="Tạo cả draft needs_clarification sau xác nhận rõ")
    parser.add_argument("--check-auth", action="store_true")
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
        related_task_input = clean(args.related_task)
        related_task_key = parse_related_task(related_task_input)
        project = project_from_issue_key(related_task_key)
        if args.project:
            supplied_project = args.project.strip().upper()
            if not re.fullmatch(r"[A-Za-z][A-Za-z0-9_]*", supplied_project):
                raise InputError("--project phải là Jira project key hợp lệ")
            if supplied_project != project:
                raise InputError(f"Project {supplied_project} không khớp task {related_task_key}: {project}")
        if args.create and not args.yes:
            raise InputError("Tạo issue thật cần đồng thời --create và --yes")
        if args.batch_limit < 1 or args.batch_limit > MAX_CREATE_BATCH:
            raise InputError(f"--batch-limit phải từ 1 đến policy max {MAX_CREATE_BATCH}")
        if args.preview_limit < 1 or args.preview_limit > MAX_CREATE_BATCH:
            raise InputError(f"--preview-limit phải từ 1 đến policy max {MAX_CREATE_BATCH}")
        if args.found_in_environment_field and not re.fullmatch(r"customfield_[0-9]+", args.found_in_environment_field):
            raise InputError("--found-in-environment-field phải có dạng customfield_<số>")
        if args.create and not args.found_in_environment_field:
            raise InputError("Tạo issue thật cần custom field Found In Environment")
        if args.create and not args.manifest:
            raise InputError("Tạo issue thật cần --manifest để chống tạo lại sau lỗi một phần")
        if args.allow_possible_duplicates and not args.create:
            raise InputError("--allow-possible-duplicates chỉ dùng khi tạo thật sau xác nhận")

        if args.input == "-":
            rows = read_json_stdin()
            input_label = "stdin"
        else:
            path = Path(args.input).expanduser().resolve()
            rows = read_rows(path, args.sheet)
            input_label = str(path)
        field_map = load_object(args.field_map, "field map")
        row_overrides = load_object(args.overrides, "row overrides")
        extra_fields = load_object(args.extra_fields, "extra fields")
        statuses = {normalized(value) for value in args.include_status.split(",") if normalized(value)}
        ready_values = {normalized(value) for value in args.ready_values.split(",") if normalized(value)}
        labels = [clean_label(value) for value in args.labels.split(",") if clean_label(value)]
        if not statuses:
            raise InputError("--include-status phải có ít nhất một giá trị")
        if not ready_values:
            raise InputError("--ready-values phải có ít nhất một giá trị")
        source_kind = args.source_kind
        if source_kind == "auto":
            source_kind = "sheet" if args.source_url else ("chat" if args.input == "-" else "file")

        preview = build_preview(
            rows=rows, project=project, issue_type=args.issue_type,
            include_statuses=statuses, labels=labels, field_map=field_map,
            extra_fields=extra_fields, row_overrides=row_overrides,
            source_url=args.source_url, selection_mode=args.selection_mode,
            ready_values=ready_values, source_kind=source_kind,
            found_in_environment_field=args.found_in_environment_field,
            related_task_key=related_task_key, related_task_input=related_task_input,
            issue_link_type=DEFAULT_ISSUE_LINK_TYPE,
            source_sheet_name=args.source_sheet_name,
        )
        preview["input_file"] = input_label
        preview["batch_limit"] = args.batch_limit

        if args.search_duplicates or args.create:
            duplicate_results = search_duplicate_issues(preview["drafts"], related_task_key)
            attach_duplicate_results(preview, duplicate_results)
            if args.allow_possible_duplicates:
                accept_duplicate_risk(preview)

        if args.create:
            if args.selection_mode == "candidates":
                raise InputError("Selection mode candidates chỉ dùng để preview")
            create_ready = [item for item in preview["drafts"] if item["creation_state"] == "create_ready"]
            blocked = [item for item in preview["drafts"] if item["creation_state"] == "needs_clarification"]
            overrideable_blocked = [
                item for item in blocked
                if not any(warning.get("code") == "possible_duplicate" for warning in item["quality_warnings"])
            ]
            drafts_to_create = create_ready + overrideable_blocked if args.allow_quality_warnings else create_ready
            if not drafts_to_create:
                raise InputError("Không có draft CREATE_READY để tạo")
            if len(drafts_to_create) > args.batch_limit:
                raise InputError(f"Lần chạy này chỉ được tạo tối đa {args.batch_limit} issue")
            task_context = get_issue_context(related_task_key)
            if task_context["project"] != project:
                raise InputError(f"Project thực tế của task là {task_context['project']}, không khớp {project}")
            preview["related_task"].update(task_context)
            preview["related_task"]["verified"] = True
            manifest = RunManifest(Path(args.manifest), related_task_key, project)
            selected_candidate_ids = {item["candidate_id"] for item in drafts_to_create}
            preview["creation_skipped"] = [
                {
                    "source_row": item["source_row"], "test_case_id": item["test_case_id"],
                    "summary": item["payload"]["fields"]["summary"],
                    "review_state": item["review_state"], "creation_state": item["creation_state"],
                    "reason": "needs_clarification",
                }
                for item in blocked if item["candidate_id"] not in selected_candidate_ids
            ]
            preview["creation_results"] = create_issues(
                drafts_to_create, related_task_key, DEFAULT_ISSUE_LINK_TYPE, manifest=manifest,
            )
            preview["run_manifest"] = str(manifest.path)
            preview["writeback_plan"] = build_writeback_plan(preview, preview["creation_results"])
            preview["stats"].update({
                "created": sum(1 for item in preview["creation_results"] if item.get("created")),
                "linked": sum(1 for item in preview["creation_results"] if item.get("linked")),
                "create_failed": sum(1 for item in preview["creation_results"] if not item.get("created")),
                "link_failed": sum(1 for item in preview["creation_results"] if item.get("created") and not item.get("linked")),
                "skipped_needs_clarification": len(preview["creation_skipped"]),
            })
        output_format = "full" if args.output_format == "full" or (args.output_format == "auto" and args.create) else "compact"
        write_result(preview if output_format == "full" else compact_preview(preview, args.preview_limit), args.output)
        if not args.create:
            return 0
        return 0 if preview["stats"]["create_failed"] == 0 and preview["stats"]["link_failed"] == 0 else 2
    except (InputError, JiraError) as exc:
        print(f"Lỗi: {exc}", file=sys.stderr)
        return 2
