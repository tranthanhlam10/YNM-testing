from __future__ import annotations

import json
import sys
import unittest
from pathlib import Path


SKILL_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SKILL_ROOT / "scripts"))

from jira_bug_skill.common import InputError, map_found_in_environment, normalized  # noqa: E402
from jira_bug_skill.config import (  # noqa: E402
    ALLOWED_JIRA_LABELS,
    DEFAULT_FOUND_IN_ENVIRONMENT,
    DEFAULT_JIRA_LABEL,
    DEFAULT_PRIORITY,
    MAX_CREATE_BATCH,
    MAX_PREVIEW_CANDIDATES,
    SCHEMA,
    SUMMARY,
    validate_runtime_config,
)
from jira_bug_skill.workflow import build_preview  # noqa: E402
from jira_bug_skill.sources import read_rows  # noqa: E402


FIXTURES = Path(__file__).parent / "fixtures"


def fixture(name: str):
    return json.loads((FIXTURES / name).read_text(encoding="utf-8"))


def preview(rows, *, overrides=None, labels=None, source_kind="chat"):
    return build_preview(
        rows=rows,
        project="YNMPECA",
        issue_type="Bug",
        include_statuses={"bug", "failed", "error"},
        labels=labels or [],
        field_map={},
        extra_fields={},
        row_overrides=overrides or {},
        selection_mode="all",
        source_kind=source_kind,
        related_task_key="YNMPECA-9361",
        related_task_input="YNMPECA-9361",
    )


class ConfigTests(unittest.TestCase):
    def test_defaults_and_allowlist_come_from_config(self):
        self.assertEqual(DEFAULT_FOUND_IN_ENVIRONMENT, "Testing")
        self.assertEqual(DEFAULT_PRIORITY, "Major")
        self.assertEqual(DEFAULT_JIRA_LABEL, "found-in-qc")
        self.assertEqual(MAX_CREATE_BATCH, 10)
        self.assertEqual(MAX_PREVIEW_CANDIDATES, 5)
        self.assertEqual(SUMMARY["max_length"], 255)
        self.assertEqual(SUMMARY["technical_terms"]["rabbitmq"], "RabbitMQ")
        self.assertIn("found-in-qc", ALLOWED_JIRA_LABELS)
        self.assertIn("sys-api", ALLOWED_JIRA_LABELS)

    def test_canonical_schema_exposes_override_fields(self):
        self.assertIn("actual", SCHEMA["properties"])
        self.assertIn("branch", SCHEMA["properties"])
        self.assertIn("domain", SCHEMA["properties"])
        self.assertIn("target_url", SCHEMA["properties"])
        self.assertIn("actual", SCHEMA["x-row-override-fields"])
        self.assertNotIn("bug_id", SCHEMA["x-row-override-fields"])

    def test_runtime_config_is_internally_consistent(self):
        self.assertIsNone(validate_runtime_config())


class WorkflowTests(unittest.TestCase):
    def test_csv_fixture_and_ready_selection(self):
        rows = read_rows(FIXTURES / "sheet-ready.csv", None)
        result = build_preview(
            rows=rows,
            project="YNMPECA",
            issue_type="Bug",
            include_statuses={"bug", "failed", "error"},
            labels=[],
            field_map={},
            extra_fields={},
            selection_mode="ready",
            source_kind="sheet",
            related_task_key="YNMPECA-9361",
            related_task_input="YNMPECA-9361",
        )
        self.assertEqual(result["stats"]["drafts"], 1)
        self.assertEqual(result["stats"]["skipped_by_selection"], 1)
        self.assertEqual(result["drafts"][0]["resolved_priority"], "High")
        self.assertEqual(result["drafts"][0]["creation_state"], "create_ready")

    def test_prefix_normalizes_summary_priority_and_test_type(self):
        result = preview(fixture("chat-prefix.json"))
        draft = result["drafts"][0]
        self.assertEqual(draft["payload"]["fields"]["summary"], "Không lưu được cấu hình bộ lọc")
        self.assertEqual(draft["resolved_priority"], "Medium")
        self.assertEqual(draft["priority_source"], "testname_prefix")
        self.assertIn("test-functional", draft["payload"]["fields"]["labels"])
        self.assertEqual(draft["review_state"], "ready_for_review")
        self.assertEqual(draft["creation_state"], "create_ready")

    def test_unknown_prefix_is_preserved(self):
        rows = [{
            "Testname": "[Price Monitoring] Không lưu được cấu hình",
            "Step": "1. Nhấn Save",
            "Actual Result": "Giao diện báo thành công nhưng dữ liệu không được lưu",
            "Expected Result": "Dữ liệu được lưu",
        }]
        draft = preview(rows)["drafts"][0]
        self.assertEqual(draft["payload"]["fields"]["summary"], "[Price Monitoring] Không lưu được cấu hình")
        self.assertEqual(draft["resolved_priority"], "Major")

    def test_chat_explicit_summary_removes_known_metadata_prefixes(self):
        rows = [{
            "Bug Summary": "[High] [Negative] API trả lỗi 500",
            "Step": "1. Gửi request",
            "Actual Result": "API trả lỗi 500",
            "Expected Result": "API trả dữ liệu thành công",
        }]
        draft = preview(rows)["drafts"][0]
        self.assertEqual(draft["payload"]["fields"]["summary"], "API trả lỗi 500")
        self.assertEqual(draft["summary_proposal"]["source"], "explicit_bug_summary")
        self.assertEqual(draft["resolved_priority"], "High")

    def test_priority_field_wins_over_prefix(self):
        rows = fixture("chat-prefix.json")
        rows[0]["Priority"] = "High"
        draft = preview(rows)["drafts"][0]
        self.assertEqual(draft["resolved_priority"], "High")
        self.assertIn("priority_prefix_conflict", {item["code"] for item in draft["quality_warnings"]})

    def test_vague_actual_is_reviewable_but_not_create_ready(self):
        result = preview(fixture("chat-vague.json"))
        draft = result["drafts"][0]
        self.assertEqual(draft["review_state"], "ready_for_review")
        self.assertEqual(draft["creation_state"], "needs_clarification")
        self.assertIn("actual_too_vague", {item["code"] for item in draft["quality_warnings"]})

    def test_row_override_changes_only_selected_row(self):
        result = preview(fixture("chat-vague.json"), overrides=fixture("row-overrides.json"))
        draft = result["drafts"][0]
        self.assertEqual(draft["creation_state"], "create_ready")
        self.assertEqual(draft["resolved_priority"], "High")
        self.assertEqual(draft["applied_overrides"], ["defaults", "row:2"])

    def test_invalid_label_is_never_sent(self):
        result = preview(fixture("chat-prefix.json"), labels=["invented-label"])
        draft = result["drafts"][0]
        self.assertEqual(draft["creation_state"], "needs_clarification")
        self.assertNotIn("invented-label", draft["payload"]["fields"].get("labels", []))

    def test_missing_core_field_is_invalid(self):
        rows = [{"Testname": "Thiếu actual", "Step": "1. Test", "Expected Result": "Có dữ liệu"}]
        result = preview(rows)
        self.assertEqual(result["stats"]["invalid"], 1)
        self.assertEqual(result["stats"]["ready_for_review"], 0)

    def test_vietnamese_normalization_preserves_d(self):
        self.assertEqual(normalized("Hiện tại đang bị lỗi"), "hien tai dang bi loi")

    def test_environment_can_be_read_from_url_or_hyphenated_alias(self):
        self.assertEqual(map_found_in_environment("https://testing.example.com/feature"), "Testing")
        self.assertEqual(map_found_in_environment("pre-prod"), "Staging")

    def test_override_rejects_protected_field(self):
        with self.assertRaises(InputError):
            preview(fixture("chat-prefix.json"), overrides={"rows": {"2": {"bug_id": "X-1"}}})


if __name__ == "__main__":
    unittest.main()
