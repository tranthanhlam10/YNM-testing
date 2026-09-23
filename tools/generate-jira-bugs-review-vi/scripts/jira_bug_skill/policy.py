from __future__ import annotations

from typing import Any

from .common import clean_label, contains_marker, dedupe, map_found_in_environment, normalized, split_labels
from .comparison import analyze_actual_expected
from .config import (
    ALLOWED_JIRA_LABELS,
    DEFAULT_FOUND_IN_ENVIRONMENT,
    DEFAULT_JIRA_LABEL,
    DEFAULT_PRIORITY,
    DETECTION_SOURCE_LABELS,
    FLOW_LABELS,
    INFERENCE,
    LIFECYCLE_LABELS,
    PRIORITY_MAP,
    QUALITY,
    ROOT_CAUSE_LABELS,
    SYSTEM_LABELS,
    TEST_TYPE_LABELS,
    TEST_TYPE_MAP,
)


_INFERENCE_FIELDS = (
    "bug_summary", "title", "steps", "expected", "actual", "test_data", "remarks",
)
_PROVENANCE_PRIORITY = {
    "explicit_argument": 60,
    "source_field": 50,
    "prefix": 40,
    "keyword": 30,
    "derived": 20,
    "default": 10,
}


def _inference_sources(record: dict[str, Any], fields: tuple[str, ...]) -> list[tuple[str, str]]:
    sources = [(field, str(record.get(field) or "")) for field in fields if record.get(field)]
    if sources:
        return sources
    component = str(record.get("component") or "")
    return [("component", component)] if component else []


def _first_marker_match(
    record: dict[str, Any],
    markers: list[str],
    fields: tuple[str, ...] = _INFERENCE_FIELDS,
) -> dict[str, str] | None:
    for field, value in _inference_sources(record, fields):
        for marker in markers:
            if contains_marker(value, [marker]):
                return {"source_field": field, "matched_marker": marker}
    return None


def infer_system_labels_with_provenance(record: dict[str, Any]) -> list[dict[str, Any]]:
    results: list[dict[str, Any]] = []
    crawling = _first_marker_match(record, INFERENCE["crawling"])
    if crawling:
        adhoc = _first_marker_match(record, INFERENCE["crawling_adhoc"])
        manual = _first_marker_match(record, INFERENCE["crawling_manual"])
        selected = adhoc or manual or crawling
        label = "sys-crawling-adhoc" if adhoc else "sys-crawling-manual" if manual else "sys-crawling-auto"
        results.append({"label": label, "category": "system", "source": "keyword", **selected})
    for label, markers in INFERENCE["system"].items():
        match = _first_marker_match(record, markers)
        if match:
            results.append({"label": label, "category": "system", "source": "keyword", **match})
    return list({item["label"]: item for item in results}.values())


def infer_system_labels(record: dict[str, Any]) -> list[str]:
    return [item["label"] for item in infer_system_labels_with_provenance(record)]


def infer_flow_labels_with_provenance(record: dict[str, Any]) -> list[dict[str, Any]]:
    fields = ("bug_summary", "title", "steps", "actual", "remarks")
    results: list[dict[str, Any]] = []
    for label, markers in INFERENCE["flow"].items():
        match = _first_marker_match(record, markers, fields)
        if match:
            results.append({"label": label, "category": "flow", "source": "keyword", **match})
    return results


def infer_flow_labels(record: dict[str, Any]) -> list[str]:
    return [item["label"] for item in infer_flow_labels_with_provenance(record)]


def classify_team_labels(
    record: dict[str, Any],
    provided_labels: list[str],
    source_kind: str,
    prefix_test_type: str = "",
) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    warnings: list[dict[str, Any]] = []
    provenance_by_label: dict[str, dict[str, Any]] = {}

    def warn(code: str, message: str, blocking: bool) -> None:
        warnings.append({"code": code, "message": message, "blocking": blocking})

    def add_provenance(label: str, category: str, source: str, **extra: Any) -> None:
        if not label:
            return
        item = {"label": label, "category": category, "source": source, **extra}
        existing = provenance_by_label.get(label)
        if not existing or _PROVENANCE_PRIORITY[source] > _PROVENANCE_PRIORITY[existing["source"]]:
            provenance_by_label[label] = item

    argument_labels = dedupe(clean_label(label) for label in provided_labels)
    jira_field_labels = split_labels(record.get("jira_labels"))
    raw_labels = dedupe([*argument_labels, *jira_field_labels])
    root_field_values = split_labels(record.get("root_cause_label"))
    system_field_values = split_labels(record.get("system_labels"))
    flow_field_values = split_labels(record.get("flow_labels"))
    root_values = dedupe([*root_field_values, *(label for label in raw_labels if label.startswith("rc-"))])
    system_values = dedupe([*system_field_values, *(label for label in raw_labels if label.startswith("sys-"))])
    flow_values = dedupe([*flow_field_values, *(label for label in raw_labels if label.startswith("flow-"))])
    test_values = dedupe([*(label for label in raw_labels if label.startswith("test-")), prefix_test_type])
    lifecycle_values = dedupe(label for label in raw_labels if label.startswith("lc-"))

    def raw_source(label: str) -> tuple[str, dict[str, str]]:
        if label in argument_labels:
            return "explicit_argument", {"source_field": "--labels"}
        return "source_field", {"source_field": "jira_labels"}

    invalid_root = [label for label in root_values if label not in ROOT_CAUSE_LABELS]
    roots = [label for label in root_values if label in ROOT_CAUSE_LABELS]
    if invalid_root:
        warn("invalid_root_cause_label", f"Root Cause label không thuộc taxonomy: {', '.join(invalid_root)}", True)
    if len(roots) > 1:
        warn("multiple_root_cause_labels", "Mỗi bug chỉ được có đúng một Root Cause label", True)
        roots = []
    if not roots and not invalid_root and len(root_values) <= 1:
        warn("root_cause_pending", "Chưa xác định Root Cause; cập nhật trước khi đóng bug", False)
    for label in roots:
        if label in root_field_values:
            add_provenance(label, "root_cause", "source_field", source_field="root_cause_label")
        if label in raw_labels:
            source, extra = raw_source(label)
            add_provenance(label, "root_cause", source, **extra)

    invalid_system = [label for label in system_values if label not in SYSTEM_LABELS]
    systems = [label for label in system_values if label in SYSTEM_LABELS]
    if invalid_system:
        warn("invalid_system_label", f"System label không thuộc taxonomy: {', '.join(invalid_system)}", True)
    if not system_values:
        inferred_systems = infer_system_labels_with_provenance(record)
        systems = [item["label"] for item in inferred_systems]
        for item in inferred_systems:
            add_provenance(**item)
    else:
        for label in systems:
            if label in system_field_values:
                add_provenance(label, "system", "source_field", source_field="system_labels")
            if label in raw_labels:
                source, extra = raw_source(label)
                add_provenance(label, "system", source, **extra)
    if not systems:
        warn("missing_system_label", "Không xác định được System label từ hành vi bug", source_kind != "chat")

    invalid_flow = [label for label in flow_values if label not in FLOW_LABELS]
    flows = [label for label in flow_values if label in FLOW_LABELS]
    if invalid_flow:
        warn("invalid_flow_label", f"Flow label không thuộc taxonomy: {', '.join(invalid_flow)}", True)
    if not flow_values:
        inferred_flows = infer_flow_labels_with_provenance(record)
        flows = [item["label"] for item in inferred_flows]
        for item in inferred_flows:
            add_provenance(**item)
    else:
        for label in flows:
            if label in flow_field_values:
                add_provenance(label, "flow", "source_field", source_field="flow_labels")
            if label in raw_labels:
                source, extra = raw_source(label)
                add_provenance(label, "flow", source, **extra)

    invalid_test = [label for label in test_values if label not in TEST_TYPE_LABELS]
    tests = [label for label in test_values if label in TEST_TYPE_LABELS]
    if invalid_test:
        warn("invalid_test_type_label", f"Test Type label không thuộc taxonomy: {', '.join(invalid_test)}", True)
    for label in tests:
        if label in raw_labels:
            source, extra = raw_source(label)
            add_provenance(label, "test_type", source, **extra)
        if label == prefix_test_type:
            add_provenance(label, "test_type", "prefix", source_field="title")
    source_test_type = normalized(record.get("test_type"))
    if source_test_type:
        mapped_test_type = ""
        if source_test_type in TEST_TYPE_MAP:
            mapped_test_type = TEST_TYPE_MAP[source_test_type]
        elif clean_label(record.get("test_type")) in TEST_TYPE_LABELS:
            mapped_test_type = clean_label(record.get("test_type"))
        elif not test_values:
            warn("unmapped_test_type", f"Không map được TEST TYPE nguồn: {record.get('test_type')}", True)
        if mapped_test_type:
            tests.append(mapped_test_type)
            add_provenance(mapped_test_type, "test_type", "source_field", source_field="test_type")
    tests = dedupe(tests)
    if len(tests) > 1:
        warn("multiple_test_type_labels", "Mỗi bug chỉ được có đúng một Test Type label", True)
        tests = []
    elif not tests:
        warn("missing_test_type_label", "Chưa xác định được Test Type theo hoạt động test thực tế", False)

    invalid_lifecycle = [label for label in lifecycle_values if label not in LIFECYCLE_LABELS]
    lifecycle = [label for label in lifecycle_values if label in LIFECYCLE_LABELS]
    if invalid_lifecycle:
        warn("invalid_lifecycle_label", f"Lifecycle label không thuộc taxonomy: {', '.join(invalid_lifecycle)}", True)
    for label in lifecycle:
        source, extra = raw_source(label)
        add_provenance(label, "lifecycle", source, **extra)
    if normalized(record.get("bug_status")) in {"reopen", "reopened", "mo lai"}:
        lifecycle.append("lc-reopen")
        add_provenance("lc-reopen", "lifecycle", "derived", source_field="bug_status", matched_marker=str(record.get("bug_status")))
    lifecycle = dedupe(lifecycle)

    invalid_jira_labels = [label for label in raw_labels if label not in ALLOWED_JIRA_LABELS]
    if invalid_jira_labels:
        warn("invalid_jira_label", "Label không thuộc danh sách label của team: " + ", ".join(invalid_jira_labels), True)
    operational = [label for label in raw_labels if label in DETECTION_SOURCE_LABELS]
    if operational:
        for label in operational:
            source, extra = raw_source(label)
            add_provenance(label, "operational", source, **extra)
    else:
        operational = [DEFAULT_JIRA_LABEL]
        add_provenance(DEFAULT_JIRA_LABEL, "operational", "default", source_field="policies.defaults.jira_label")
        warn("default_label_applied", f"Nguồn không cung cấp Detection Source label; dùng mặc định {DEFAULT_JIRA_LABEL}", False)

    environment_value = record.get("environment")
    found_in_environment = map_found_in_environment(environment_value) if environment_value else DEFAULT_FOUND_IN_ENVIRONMENT
    environment_provenance = {
        "source": "source_field" if environment_value else "default",
        "source_field": "environment" if environment_value else "policies.defaults.found_in_environment",
    }
    if environment_value:
        environment_provenance["matched_text"] = str(environment_value)
    if environment_value and not found_in_environment:
        warn("unmapped_found_in_environment", "Môi trường không map được sang Testing, Staging hoặc Production", True)

    final_labels = set(dedupe([*operational, *roots, *systems, *tests, *flows, *lifecycle]))
    provenance = [item for label, item in provenance_by_label.items() if label in final_labels]
    return {
        "found_in_environment": found_in_environment,
        "found_in_environment_provenance": environment_provenance,
        "root_cause": roots,
        "system": dedupe(systems),
        "test_type": tests,
        "flow": dedupe(flows),
        "lifecycle": lifecycle,
        "operational": operational,
        "provenance": provenance,
    }, warnings


def evaluate_quality(
    record: dict[str, Any],
    source_kind: str,
    has_priority_prefix: bool = False,
    actual_expected_check: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    warnings: list[dict[str, Any]] = []

    def warn(code: str, message: str, blocking: bool) -> None:
        warnings.append({"code": code, "message": message, "blocking": blocking})

    actual = normalized(record.get("actual"))
    bug_summary = normalized(record.get("bug_summary"))
    if any(marker in actual for marker in QUALITY["ambiguous_actual_markers"]):
        warn("actual_needs_confirmation", "ACTUAL RESULT chứa nội dung chưa được xác nhận rõ", True)
    if actual and (actual in set(QUALITY["vague_actuals"]) or len(actual) < int(QUALITY["minimum_actual_length"])):
        warn("actual_too_vague", "ACTUAL RESULT chưa mô tả đủ hành vi quan sát được", True)
    comparison = actual_expected_check or analyze_actual_expected(record.get("actual", ""), record.get("expected", ""))
    if comparison["state"] == "conflict":
        warn("expected_equals_actual", "EXPECTED RESULT và ACTUAL RESULT giống nhau", True)
    elif comparison["state"] == "review":
        warn("actual_expected_high_overlap", "ACTUAL RESULT và EXPECTED RESULT quá giống nhau; cần tester kiểm tra lại", False)
    if any(marker in actual for marker in QUALITY["contradictory_actual_markers"]):
        warn("candidate_actual_conflict", "ACTUAL RESULT cho biết hệ thống đang hoạt động đúng", True)
    if source_kind != "chat" and bug_summary.startswith(("kiem tra", "verify", "validate", "test ")):
        warn("bug_summary_is_test_intent", "BUG SUMMARY mô tả mục tiêu test; Summary sẽ được tạo từ Actual", False)
    if not record.get("steps"):
        warn("missing_steps", "Thiếu TEST STEPS hoặc bước tái hiện tương đương", True)
    if not record.get("environment"):
        warn("default_environment_applied", f"Thiếu môi trường; dùng mặc định {DEFAULT_FOUND_IN_ENVIRONMENT}", False)
    if not record.get("severity"):
        if has_priority_prefix:
            warn("priority_prefix_applied", "Thiếu priority field; dùng priority từ prefix Testname", False)
        else:
            warn("default_priority_applied", f"Thiếu priority; dùng mặc định {DEFAULT_PRIORITY}", False)
    elif normalized(record.get("severity")) not in PRIORITY_MAP:
        warn("unsupported_priority", "Priority/severity nguồn chưa map được sang Jira", True)
    if source_kind != "chat" and not record.get("evidence"):
        warn("missing_evidence", "Không có đường dẫn hoặc URL bằng chứng", False)
    return warnings
