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


def infer_system_labels(record: dict[str, str]) -> list[str]:
    primary = normalized(" ".join((
        record["bug_summary"], record["title"], record["steps"], record["expected"],
        record["actual"], record["test_data"], record["remarks"],
    )))
    text = primary or normalized(record["component"])
    labels: list[str] = []
    if contains_marker(text, INFERENCE["crawling"]):
        if contains_marker(text, INFERENCE["crawling_adhoc"]):
            labels.append("sys-crawling-adhoc")
        elif contains_marker(text, INFERENCE["crawling_manual"]):
            labels.append("sys-crawling-manual")
        else:
            labels.append("sys-crawling-auto")
    for label, markers in INFERENCE["system"].items():
        if contains_marker(text, markers):
            labels.append(label)
    return dedupe(labels)


def infer_flow_labels(record: dict[str, str]) -> list[str]:
    text = normalized(" ".join((record["bug_summary"], record["title"], record["steps"], record["actual"], record["remarks"])))
    return [label for label, markers in INFERENCE["flow"].items() if contains_marker(text, markers)]


def classify_team_labels(
    record: dict[str, str],
    provided_labels: list[str],
    source_kind: str,
    prefix_test_type: str = "",
) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    warnings: list[dict[str, Any]] = []

    def warn(code: str, message: str, blocking: bool) -> None:
        warnings.append({"code": code, "message": message, "blocking": blocking})

    raw_labels = dedupe([*provided_labels, *split_labels(record["jira_labels"])])
    explicit_values = dedupe([
        *raw_labels, *split_labels(record["root_cause_label"]),
        *split_labels(record["system_labels"]), *split_labels(record["flow_labels"]),
    ])
    root_values = dedupe([*split_labels(record["root_cause_label"]), *(label for label in raw_labels if label.startswith("rc-"))])
    system_values = dedupe([*split_labels(record["system_labels"]), *(label for label in raw_labels if label.startswith("sys-"))])
    flow_values = dedupe([*split_labels(record["flow_labels"]), *(label for label in raw_labels if label.startswith("flow-"))])
    test_values = dedupe([*(label for label in raw_labels if label.startswith("test-")), prefix_test_type])
    lifecycle_values = dedupe(label for label in raw_labels if label.startswith("lc-"))

    invalid_root = [label for label in root_values if label not in ROOT_CAUSE_LABELS]
    roots = [label for label in root_values if label in ROOT_CAUSE_LABELS]
    if invalid_root:
        warn("invalid_root_cause_label", f"Root Cause label không thuộc taxonomy: {', '.join(invalid_root)}", True)
    if len(roots) > 1:
        warn("multiple_root_cause_labels", "Mỗi bug chỉ được có đúng một Root Cause label", True)
        roots = []
    if not roots and not invalid_root and len(root_values) <= 1:
        warn("root_cause_pending", "Chưa xác định Root Cause; cập nhật trước khi đóng bug", False)

    invalid_system = [label for label in system_values if label not in SYSTEM_LABELS]
    systems = [label for label in system_values if label in SYSTEM_LABELS]
    if invalid_system:
        warn("invalid_system_label", f"System label không thuộc taxonomy: {', '.join(invalid_system)}", True)
    if not system_values:
        systems = infer_system_labels(record)
    if not systems:
        warn("missing_system_label", "Không xác định được System label từ hành vi bug", source_kind != "chat")

    invalid_flow = [label for label in flow_values if label not in FLOW_LABELS]
    flows = [label for label in flow_values if label in FLOW_LABELS]
    if invalid_flow:
        warn("invalid_flow_label", f"Flow label không thuộc taxonomy: {', '.join(invalid_flow)}", True)
    if not flow_values:
        flows = infer_flow_labels(record)

    invalid_test = [label for label in test_values if label not in TEST_TYPE_LABELS]
    tests = [label for label in test_values if label in TEST_TYPE_LABELS]
    if invalid_test:
        warn("invalid_test_type_label", f"Test Type label không thuộc taxonomy: {', '.join(invalid_test)}", True)
    source_test_type = normalized(record["test_type"])
    if source_test_type:
        if source_test_type in TEST_TYPE_MAP:
            tests.append(TEST_TYPE_MAP[source_test_type])
        elif clean_label(record["test_type"]) in TEST_TYPE_LABELS:
            tests.append(clean_label(record["test_type"]))
        elif not test_values:
            warn("unmapped_test_type", f"Không map được TEST TYPE nguồn: {record['test_type']}", True)
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
    if normalized(record["bug_status"]) in {"reopen", "reopened", "mo lai"}:
        lifecycle.append("lc-reopen")
    lifecycle = dedupe(lifecycle)

    invalid_jira_labels = [label for label in raw_labels if label not in ALLOWED_JIRA_LABELS]
    if invalid_jira_labels:
        warn("invalid_jira_label", "Label không thuộc danh sách label của team: " + ", ".join(invalid_jira_labels), True)
    operational = [label for label in raw_labels if label in DETECTION_SOURCE_LABELS]
    if not explicit_values:
        operational = [DEFAULT_JIRA_LABEL]
        warn("default_label_applied", f"Nguồn không cung cấp label; dùng mặc định {DEFAULT_JIRA_LABEL}", False)

    found_in_environment = map_found_in_environment(record["environment"]) if record["environment"] else DEFAULT_FOUND_IN_ENVIRONMENT
    if record["environment"] and not found_in_environment:
        warn("unmapped_found_in_environment", "Môi trường không map được sang Testing, Staging hoặc Production", True)

    return {
        "found_in_environment": found_in_environment,
        "root_cause": roots,
        "system": dedupe(systems),
        "test_type": tests,
        "flow": dedupe(flows),
        "lifecycle": lifecycle,
        "operational": operational,
    }, warnings


def evaluate_quality(
    record: dict[str, str],
    source_kind: str,
    has_priority_prefix: bool = False,
    actual_expected_check: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    warnings: list[dict[str, Any]] = []

    def warn(code: str, message: str, blocking: bool) -> None:
        warnings.append({"code": code, "message": message, "blocking": blocking})

    actual = normalized(record["actual"])
    expected = normalized(record["expected"])
    bug_summary = normalized(record["bug_summary"])
    if any(marker in actual for marker in QUALITY["ambiguous_actual_markers"]):
        warn("actual_needs_confirmation", "ACTUAL RESULT chứa nội dung chưa được xác nhận rõ", True)
    if actual in set(QUALITY["vague_actuals"]) or len(actual) < int(QUALITY["minimum_actual_length"]):
        warn("actual_too_vague", "ACTUAL RESULT chưa mô tả đủ hành vi quan sát được", True)
    comparison = actual_expected_check or analyze_actual_expected(record["actual"], record["expected"])
    if comparison["state"] == "conflict":
        warn("expected_equals_actual", "EXPECTED RESULT và ACTUAL RESULT giống nhau", True)
    elif comparison["state"] == "review":
        warn("actual_expected_high_overlap", "ACTUAL RESULT và EXPECTED RESULT quá giống nhau; cần tester kiểm tra lại", False)
    if any(marker in actual for marker in QUALITY["contradictory_actual_markers"]):
        warn("candidate_actual_conflict", "ACTUAL RESULT cho biết hệ thống đang hoạt động đúng", True)
    if source_kind != "chat" and bug_summary.startswith(("kiem tra", "verify", "validate", "test ")):
        warn("bug_summary_is_test_intent", "BUG SUMMARY mô tả mục tiêu test; Summary sẽ được tạo từ Actual", False)
    if not record["steps"]:
        warn("missing_steps", "Thiếu TEST STEPS hoặc bước tái hiện tương đương", True)
    if not record["environment"]:
        warn("default_environment_applied", f"Thiếu môi trường; dùng mặc định {DEFAULT_FOUND_IN_ENVIRONMENT}", False)
    if not record["severity"]:
        if has_priority_prefix:
            warn("priority_prefix_applied", "Thiếu priority field; dùng priority từ prefix Testname", False)
        else:
            warn("default_priority_applied", f"Thiếu priority; dùng mặc định {DEFAULT_PRIORITY}", False)
    elif normalized(record["severity"]) not in PRIORITY_MAP:
        warn("unsupported_priority", "Priority/severity nguồn chưa map được sang Jira", True)
    if source_kind != "chat" and not record["evidence"]:
        warn("missing_evidence", "Không có đường dẫn hoặc URL bằng chứng", False)
    return warnings
