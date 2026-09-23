from __future__ import annotations

import sys
import unittest
from pathlib import Path


SKILL_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SKILL_ROOT / "scripts"))

from jira_bug_skill.comparison import analyze_actual_expected  # noqa: E402
from jira_bug_skill.identity import build_duplicate_fingerprint  # noqa: E402
from jira_bug_skill.presentation import compact_preview  # noqa: E402
from jira_bug_skill.workflow import build_preview  # noqa: E402


def preview(row, *, source_kind="chat", labels=None):
    return build_preview(
        rows=[row],
        project="YNMPECA",
        issue_type="Bug",
        include_statuses={"bug", "failed", "error"},
        labels=labels or [],
        field_map={},
        extra_fields={},
        selection_mode="all",
        source_kind=source_kind,
        related_task_key="YNMPECA-9361",
        related_task_input="YNMPECA-9361",
    )


def chat_row(**extra):
    row = {
        "Testname": "Không lưu được cấu hình",
        "Step": "1. Nhấn Save",
        "Actual Result": "Dữ liệu không được lưu vào database",
        "Expected Result": "Dữ liệu được lưu vào database",
    }
    row.update(extra)
    return row


class RuntimeAutomationTests(unittest.TestCase):
    def test_python_applies_environment_priority_and_label_defaults(self):
        draft = preview(chat_row())["drafts"][0]
        self.assertEqual(draft["found_in_environment"], "Testing")
        self.assertEqual(draft["resolved_priority"], "Major")
        self.assertIn("found-in-qc", draft["payload"]["fields"]["labels"])

    def test_python_rejects_label_outside_allowlist(self):
        draft = preview(chat_row(), labels=["invented-label"])["drafts"][0]
        self.assertNotIn("invented-label", draft["payload"]["fields"].get("labels", []))
        self.assertIn("invalid_jira_label", {item["code"] for item in draft["quality_warnings"]})
        self.assertEqual(draft["creation_state"], "needs_clarification")

    def test_python_exposes_actual_expected_check(self):
        draft = preview(chat_row())["drafts"][0]
        self.assertEqual(draft["actual_expected_check"]["state"], "difference_detected")
        self.assertEqual(draft["actual_expected_check"]["reason"], "negation_differs")

    def test_equal_actual_expected_blocks_creation(self):
        result = preview(chat_row(**{
            "Actual Result": "Dữ liệu được lưu thành công",
            "Expected Result": "Dữ liệu được lưu thành công",
        }))
        draft = result["drafts"][0]
        self.assertEqual(draft["actual_expected_check"]["state"], "conflict")
        self.assertIn("expected_equals_actual", {item["code"] for item in draft["quality_warnings"]})
        self.assertEqual(draft["creation_state"], "needs_clarification")

    def test_high_overlap_actual_expected_requests_review_without_blocking(self):
        check = analyze_actual_expected(
            "Dữ liệu được lưu thành công ở database chính",
            "Dữ liệu được lưu thành công ở database",
        )
        self.assertEqual(check["state"], "review")
        self.assertEqual(check["reason"], "high_text_overlap")

    def test_duplicate_fingerprint_is_stable_and_content_sensitive(self):
        first = build_duplicate_fingerprint("Backend", "API trả lỗi 500", "Không lưu được dữ liệu")
        same = build_duplicate_fingerprint(" backend ", "api trả lỗi 500", "không lưu được dữ liệu")
        changed = build_duplicate_fingerprint("Backend", "API trả lỗi 500", "Không đọc được dữ liệu")
        self.assertEqual(first, same)
        self.assertNotEqual(first, changed)

    def test_quality_warnings_are_generated_and_compacted_by_python(self):
        result = preview(chat_row(**{"Actual Result": "Bị lỗi"}))
        compact = compact_preview(result, candidate_limit=5)
        warning = next(item for item in compact["candidates"][0]["warnings"] if item["code"] == "actual_too_vague")
        self.assertTrue(warning["blocking"])
        self.assertIn("message", warning)


if __name__ == "__main__":
    unittest.main()
