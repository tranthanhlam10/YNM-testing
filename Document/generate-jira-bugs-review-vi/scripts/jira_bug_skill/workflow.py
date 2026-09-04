from __future__ import annotations

from typing import Any

from .common import InputError, normalized, project_from_issue_key
from .comparison import analyze_actual_expected
from .config import CORE_JIRA_FIELDS, DEFAULT_ISSUE_LINK_TYPE, DEFAULT_READY_VALUES, DEFAULT_SELECTION_MODE, SELECTION_MODES
from .content import build_description, parse_title_metadata, resolve_priority
from .evidence import evidence_warnings, parse_evidence_items
from .identity import build_candidate_id, build_duplicate_fingerprint, payload_hash as compute_payload_hash
from .policy import classify_team_labels, evaluate_quality
from .sheet_adapter import build_source_locator
from .sources import apply_row_overrides, build_header_map, canonical_record, validate_overrides
from .summary import propose_summary
from .targets import build_target_metadata


def build_preview(
    rows: list[dict[str, Any]],
    project: str,
    issue_type: str,
    include_statuses: set[str],
    labels: list[str],
    field_map: dict[str, Any],
    extra_fields: dict[str, Any],
    row_overrides: dict[str, Any] | None = None,
    source_url: str = "",
    selection_mode: str = DEFAULT_SELECTION_MODE,
    ready_values: set[str] | None = None,
    source_kind: str = "file",
    found_in_environment_field: str = "",
    related_task_key: str = "",
    related_task_input: str = "",
    issue_link_type: str = DEFAULT_ISSUE_LINK_TYPE,
    source_sheet_name: str = "",
) -> dict[str, Any]:
    if not rows:
        raise InputError("Input không có dòng dữ liệu")
    if not related_task_key:
        raise InputError("Thiếu Jira task liên quan; không log bug")
    task_project = project_from_issue_key(related_task_key)
    if project.upper() != task_project:
        raise InputError(f"Project bug {project.upper()} không khớp project của task {related_task_key}: {task_project}")
    mapping = build_header_map((key for row in rows for key in row), field_map)
    if selection_mode not in SELECTION_MODES:
        raise InputError(f"Selection mode không hợp lệ: {selection_mode}")
    if selection_mode == "status" and "status" not in mapping:
        raise InputError("Selection mode status cần cột status/result")
    if selection_mode == "ready" and "ready_to_jira" not in mapping:
        raise InputError("Selection mode ready cần cột READY TO JIRA/Ready to Push")
    forbidden = sorted(CORE_JIRA_FIELDS.intersection(extra_fields))
    if forbidden:
        raise InputError(f"Extra fields không được ghi đè field Jira cốt lõi: {', '.join(forbidden)}")
    row_overrides = row_overrides or {}
    validate_overrides(row_overrides)

    drafts: list[dict[str, Any]] = []
    errors: list[dict[str, Any]] = []
    skipped: list[dict[str, Any]] = []
    all_warnings: list[dict[str, Any]] = []
    seen_ids: set[str] = set()
    seen_fingerprints: set[str] = set()
    skipped_selection = 0
    skipped_existing = 0
    effective_ready_values = ready_values or DEFAULT_READY_VALUES

    for source_row, row in enumerate(rows, start=2):
        record = canonical_record(row, mapping)
        record, applied_overrides = apply_row_overrides(record, source_row, row_overrides)
        status = normalized(record["status"])
        ready_value = normalized(record["ready_to_jira"])
        if selection_mode == "status":
            selected = status in include_statuses
            computed_reason = f"status:{record['status']}"
        elif selection_mode == "ready":
            selected = ready_value in effective_ready_values
            computed_reason = f"ready:{record['ready_to_jira']}"
        else:
            selected = True
            computed_reason = "chưa có tín hiệu chọn - chỉ preview" if selection_mode == "candidates" else "chat hoặc dòng đã được chọn trước"
        if not selected:
            skipped_selection += 1
            continue
        if record["bug_id"]:
            skipped_existing += 1
            skipped.append({"source_row": source_row, "test_case_id": record["test_case_id"], "bug_id": record["bug_id"], "review_state": "skip_existing", "creation_state": "skip_existing", "reason": "đã có BUG ID"})
            continue

        missing = []
        if not record["title"] and not record["bug_summary"]:
            missing.append("Testname hoặc Summary")
        for field in ("steps", "expected", "actual"):
            if not record[field]:
                missing.append(field)
        if missing:
            errors.append({"source_row": source_row, "test_case_id": record["test_case_id"], "review_state": "invalid", "creation_state": "invalid", "error": f"thiếu dữ liệu bắt buộc: {', '.join(missing)}"})
            continue

        identity = normalized(record["test_case_id"])
        if identity and identity in seen_ids:
            errors.append({"source_row": source_row, "test_case_id": record["test_case_id"], "review_state": "invalid", "creation_state": "invalid", "error": "trùng test-case ID"})
            continue
        if identity:
            seen_ids.add(identity)

        title_metadata = parse_title_metadata(record["bug_summary"] or record["title"])
        if record["bug_summary"] and record["title"]:
            testname_metadata = parse_title_metadata(record["title"])
            title_metadata["priority"] = title_metadata["priority"] or testname_metadata["priority"]
            title_metadata["test_type"] = title_metadata["test_type"] or testname_metadata["test_type"]
            title_metadata["removed_prefixes"] = list(dict.fromkeys([*title_metadata["removed_prefixes"], *testname_metadata["removed_prefixes"]]))
        summary_proposal = propose_summary(record, source_kind, title_metadata)
        summary = summary_proposal["recommended"]
        fingerprint = build_duplicate_fingerprint(record["component"], summary, record["actual"])
        if fingerprint and fingerprint in seen_fingerprints:
            errors.append({"source_row": source_row, "test_case_id": record["test_case_id"], "review_state": "invalid", "creation_state": "invalid", "error": "trùng nội dung bug trong cùng input"})
            continue
        seen_fingerprints.add(fingerprint)

        actual_expected_check = analyze_actual_expected(record["actual"], record["expected"])
        warnings = evaluate_quality(
            record,
            source_kind,
            bool(title_metadata["priority"]),
            actual_expected_check,
        )
        label_classification, label_warnings = classify_team_labels(record, labels, source_kind, title_metadata["test_type"])
        warnings.extend(label_warnings)
        evidence_items = parse_evidence_items(record["evidence"])
        warnings.extend(evidence_warnings(evidence_items))
        priority, priority_source = resolve_priority(record, title_metadata)
        if record["severity"] and title_metadata["priority"] and priority and title_metadata["priority"] != priority:
            warnings.append({"code": "priority_prefix_conflict", "message": f"Priority trong field ({priority}) khác prefix Testname ({title_metadata['priority']}); ưu tiên field", "blocking": False})
        creation_state = "needs_clarification" if any(item["blocking"] for item in warnings) else "create_ready"
        for warning in warnings:
            all_warnings.append({"source_row": source_row, "test_case_id": record["test_case_id"], **warning})

        target_metadata = build_target_metadata(record, label_classification["found_in_environment"])
        fields: dict[str, Any] = {
            "project": {"key": project},
            "summary": summary,
            "issuetype": {"name": issue_type},
            "description": build_description(
                record, source_row, source_url, source_kind, computed_reason,
                label_classification, priority, priority_source, target_metadata, evidence_items,
            ),
        }
        if priority:
            fields["priority"] = {"name": priority}
        if found_in_environment_field and label_classification["found_in_environment"]:
            fields[found_in_environment_field] = {"value": label_classification["found_in_environment"]}
        issue_labels = list(dict.fromkeys([
            *label_classification["operational"], *label_classification["root_cause"],
            *label_classification["system"], *label_classification["test_type"],
            *label_classification["flow"], *label_classification["lifecycle"],
        ]))
        if issue_labels:
            fields["labels"] = issue_labels
        fields.update(extra_fields)
        source_locator = build_source_locator(
            source_url=source_url,
            source_row=source_row,
            row=row,
            mapping=mapping,
            sheet_name=source_sheet_name,
        ) if source_kind == "sheet" else {}
        candidate_id = build_candidate_id(
            project=project,
            related_task=related_task_key,
            source_kind=source_kind,
            source_url=source_url,
            source_row=source_row,
            test_case_id=record["test_case_id"],
            summary=summary,
            target=target_metadata,
        )
        payload = {"fields": fields}
        drafts.append({
            "candidate_id": candidate_id,
            "payload_hash": compute_payload_hash(payload),
            "duplicate_fingerprint": fingerprint,
            "source_row": source_row,
            "test_case_id": record["test_case_id"],
            "source_status": record["status"],
            "source_severity": record["severity"],
            "source_bug_status": record["bug_status"],
            "source_type": record["source_type"] or source_kind,
            "selection_reason": record["selection_reason"] or computed_reason,
            "review_state": "ready_for_review",
            "creation_state": creation_state,
            "resolved_priority": priority,
            "priority_source": priority_source,
            "title_metadata": title_metadata,
            "summary_proposal": summary_proposal,
            "actual_expected_check": actual_expected_check,
            "applied_overrides": applied_overrides,
            "found_in_environment": label_classification["found_in_environment"],
            "target_metadata": target_metadata,
            "evidence_items": evidence_items,
            "source_locator": source_locator,
            "label_classification": label_classification,
            "quality_warnings": warnings,
            "duplicate_state": "not_checked",
            "duplicate_search": {"checked": False, "matches": []},
            "related_task": {"key": related_task_key, "input": related_task_input, "project": project, "link_type": issue_link_type},
            "payload": payload,
        })

    create_ready = sum(1 for item in drafts if item["creation_state"] == "create_ready")
    needs_clarification = sum(1 for item in drafts if item["creation_state"] == "needs_clarification")
    return {
        "schema": "ynm-qc-bug-candidate/v2",
        "project": project,
        "issue_type": issue_type,
        "selection_mode": selection_mode,
        "source_kind": source_kind,
        "header_mapping": mapping,
        "drafts": drafts,
        "errors": errors,
        "skipped": skipped,
        "quality_warnings": all_warnings,
        "source_url": source_url or None,
        "found_in_environment_field": found_in_environment_field or None,
        "related_task": {"key": related_task_key, "input": related_task_input, "project": project, "link_type": issue_link_type, "verified": False},
        "duplicate_search": {"checked": False, "candidates_with_matches": 0},
        "stats": {
            "input_rows": len(rows), "drafts": len(drafts), "validation_errors": len(errors),
            "skipped_by_selection": skipped_selection,
            "skipped_by_status": skipped_selection if selection_mode == "status" else 0,
            "skipped_existing_bug_id": skipped_existing,
            "quality_warnings": len(all_warnings),
            "ready_for_review": len(drafts), "create_ready": create_ready,
            "ready": create_ready,
            "needs_clarification": needs_clarification,
            "invalid": len(errors), "skip_existing": skipped_existing,
        },
    }
