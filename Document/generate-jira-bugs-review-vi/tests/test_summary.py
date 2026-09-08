from __future__ import annotations

import sys
import unittest
from pathlib import Path


SKILL_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SKILL_ROOT / "scripts"))

from jira_bug_skill.workflow import build_preview  # noqa: E402


def preview(row):
    return build_preview(
        rows=[row],
        project="YNMPECA",
        issue_type="Bug",
        include_statuses={"bug", "failed", "error"},
        labels=[],
        field_map={},
        extra_fields={},
        selection_mode="all",
        source_kind="sheet",
        related_task_key="YNMPECA-9361",
        related_task_input="YNMPECA-9361",
    )["drafts"][0]


def sheet_row(**extra):
    row = {
        "TEST CASE ID": "TC-SUMMARY-001",
        "TEST NAME": "[Medium] [Positive] Kiểm tra dữ liệu ngày",
        "MODULE/FEATURE": "Airflow Variable",
        "TEST STEPS": "1. Truyền ngày không hợp lệ\n2. Chạy DAG",
        "EXPECTED RESULT": "Hệ thống từ chối ngày không hợp lệ",
        "ACTUAL RESULT": "Hiện tại ngày không hợp lệ, ví dụ như truyền ngày 20222-01-011 Thì vẫn chấp nhận",
    }
    row.update(extra)
    return row


class SummaryProposalTests(unittest.TestCase):
    def test_actual_is_condensed_into_observed_behavior(self):
        draft = preview(sheet_row())
        self.assertEqual(
            draft["payload"]["fields"]["summary"],
            "[Airflow Variable] Vẫn chấp nhận ngày không hợp lệ khi truyền ngày 20222-01-011",
        )
        proposal = draft["summary_proposal"]
        self.assertEqual(proposal["source"], "actual_result")
        self.assertTrue(proposal["review_required"])
        self.assertIn("removed_generic_opener", proposal["transformations"])
        self.assertIn("condensed_example", proposal["transformations"])
        self.assertIn("added_component", proposal["transformations"])

    def test_when_then_is_reordered_and_technical_terms_keep_casing(self):
        draft = preview(sheet_row(**{
            "MODULE/FEATURE": "DAG Structure",
            "ACTUAL RESULT": "Khi chạy airflow thì luồng aws vẫn còn trên airflow",
        }))
        self.assertEqual(
            draft["payload"]["fields"]["summary"],
            "[DAG Structure] Luồng AWS vẫn còn trên Airflow khi chạy Airflow",
        )
        transformations = draft["summary_proposal"]["transformations"]
        self.assertIn("moved_outcome_before_trigger", transformations)
        self.assertIn("normalized_technical_terms", transformations)

    def test_explicit_bug_summary_has_priority_over_actual(self):
        draft = preview(sheet_row(**{
            "BUG SUMMARY": "api trả lỗi 500 khi lưu cấu hình",
            "ACTUAL RESULT": "Hiện tại dữ liệu không được lưu",
            "MODULE/FEATURE": "Backend",
        }))
        self.assertEqual(
            draft["payload"]["fields"]["summary"],
            "[Backend] API trả lỗi 500 khi lưu cấu hình",
        )
        self.assertEqual(draft["summary_proposal"]["source"], "explicit_bug_summary")

    def test_test_intent_bug_summary_falls_back_to_actual(self):
        draft = preview(sheet_row(**{
            "BUG SUMMARY": "Kiểm tra API khi lưu cấu hình",
            "ACTUAL RESULT": "Hiện tại API trả lỗi 500 khi lưu cấu hình",
            "MODULE/FEATURE": "Backend",
        }))
        self.assertEqual(
            draft["payload"]["fields"]["summary"],
            "[Backend] API trả lỗi 500 khi lưu cấu hình",
        )
        self.assertEqual(draft["summary_proposal"]["source"], "actual_result")

    def test_summary_is_truncated_to_jira_limit(self):
        draft = preview(sheet_row(**{
            "MODULE/FEATURE": "",
            "ACTUAL RESULT": "A" * 300,
        }))
        summary = draft["payload"]["fields"]["summary"]
        self.assertEqual(len(summary), 255)
        self.assertTrue(summary.endswith("..."))
        self.assertIn("truncated_to_jira_limit", draft["summary_proposal"]["transformations"])


if __name__ == "__main__":
    unittest.main()
