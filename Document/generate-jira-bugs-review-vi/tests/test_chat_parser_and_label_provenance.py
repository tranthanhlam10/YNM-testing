from __future__ import annotations

import io
import sys
import unittest
from pathlib import Path
from unittest.mock import patch


SKILL_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SKILL_ROOT / "scripts"))

from jira_bug_skill.chat_parser import parse_chat_text  # noqa: E402
from jira_bug_skill.cli import quality_warnings_are_overrideable  # noqa: E402
from jira_bug_skill.presentation import compact_preview  # noqa: E402
from jira_bug_skill.sources import read_stdin_rows  # noqa: E402
from jira_bug_skill.workflow import build_preview  # noqa: E402


def preview(rows, *, labels=None, source_kind="chat"):
    return build_preview(
        rows=rows,
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


class ChatParserTests(unittest.TestCase):
    def test_structured_raw_chat_maps_headings_without_ai(self):
        raw = """Name: Scale pod báo lỗi khi đang chạy test
Step:
1. Chạy loader
2. Vào K8s để scale pod
Actual Result: Hệ thống báo lỗi Cant scale this pod
Expected Result: Pod được scale thành công
Environment: Staging
Evidence: https://drive.google.com/file/d/1
"""
        row = parse_chat_text(raw)
        self.assertEqual(row["title"], "Scale pod báo lỗi khi đang chạy test")
        self.assertEqual(row["environment"], "Staging")
        self.assertEqual(row["__chat_extraction"]["parser"], "deterministic/v1")
        self.assertFalse(row["__chat_extraction"]["needs_ai_fallback"])
        draft = preview([row])["drafts"][0]
        self.assertEqual(draft["creation_state"], "create_ready")
        self.assertEqual(draft["chat_extraction"]["fields"]["steps"]["source"], "heading")

    def test_free_text_creates_reviewable_partial_draft_without_inventing_fields(self):
        row = parse_chat_text(
            "Log bug scale pod báo lỗi khi đang chạy test\n"
            "Khi scale pod ở staging, hệ thống báo Cant scale this pod"
        )
        self.assertEqual(row["title"], "scale pod báo lỗi khi đang chạy test")
        self.assertNotIn("steps", row)
        self.assertNotIn("expected", row)
        result = preview([row])
        draft = result["drafts"][0]
        self.assertEqual(result["stats"]["invalid"], 0)
        self.assertEqual(draft["creation_state"], "needs_clarification")
        self.assertEqual(draft["found_in_environment"], "Staging")
        codes = {warning["code"] for warning in draft["quality_warnings"]}
        self.assertIn("missing_steps", codes)
        self.assertIn("missing_chat_expected", codes)
        self.assertFalse(quality_warnings_are_overrideable(draft))

    def test_raw_chat_fenced_code_is_diagnostic_and_secret_is_redacted(self):
        row = parse_chat_text("""Name: API trả lỗi
Step: Gọi API
Actual: API trả lỗi 500
Expected: API trả 200
```log
Authorization: Bearer abc.def.ghi
request failed
```
""")
        draft = preview([row])["drafts"][0]
        rendered = str(draft["diagnostic_items"])
        self.assertIn("[REDACTED]", rendered)
        self.assertNotIn("abc.def.ghi", rendered)

    def test_log_url_is_evidence_but_log_text_is_diagnostic(self):
        evidence_row = parse_chat_text("Name: A\nStep: B\nActual: C lỗi rõ ràng\nExpected: D\nLog: https://example.com/log")
        diagnostic_row = parse_chat_text("Name: A\nStep: B\nActual: C lỗi rõ ràng\nExpected: D\nLog: request timeout")
        self.assertEqual(evidence_row["evidence"], "https://example.com/log")
        self.assertEqual(diagnostic_row["diagnostic_data"], "request timeout")

    def test_stdin_keeps_json_compatibility_and_accepts_raw_chat(self):
        with patch("sys.stdin", io.StringIO('{"Name":"A"}')):
            rows, mode = read_stdin_rows("chat")
        self.assertEqual(mode, "json")
        self.assertEqual(rows[0]["Name"], "A")
        with patch("sys.stdin", io.StringIO("Name: A\nActual: Có lỗi")):
            rows, mode = read_stdin_rows("chat")
        self.assertEqual(mode, "raw_chat")
        self.assertEqual(rows[0]["title"], "A")

    def test_summary_prefix_does_not_set_environment(self):
        row = parse_chat_text("Name: [Staging] API trả lỗi\nStep: Gọi API\nActual: API trả lỗi 500\nExpected: API trả 200")
        draft = preview([row])["drafts"][0]
        self.assertEqual(draft["found_in_environment"], "Testing")
        self.assertEqual(draft["payload"]["fields"]["summary"], "[Staging] API trả lỗi")


class LabelProvenanceTests(unittest.TestCase):
    def _row(self, **extra):
        row = {
            "Name": "Scale pod báo lỗi",
            "Step": "Vào K8s và scale pod",
            "Actual": "Hệ thống báo Cant scale this pod",
            "Expected": "Pod được scale thành công",
        }
        row.update(extra)
        return row

    def _provenance(self, draft):
        return {item["label"]: item for item in draft["label_classification"]["provenance"]}

    def test_keyword_and_default_provenance_are_visible(self):
        draft = preview([self._row()])["drafts"][0]
        provenance = self._provenance(draft)
        self.assertEqual(provenance["sys-infra"]["source"], "keyword")
        self.assertIn(provenance["sys-infra"]["source_field"], {"title", "steps"})
        self.assertIn(provenance["sys-infra"]["matched_marker"], {"k8s", "pod", "scale pod"})
        self.assertEqual(provenance["found-in-qc"]["source"], "default")
        self.assertEqual(set(draft["payload"]["fields"]["labels"]), set(provenance))
        compact = compact_preview(preview([self._row()]), 5)["candidates"][0]
        self.assertTrue(compact["label_provenance"])

    def test_explicit_prefix_and_source_field_provenance(self):
        row = self._row(
            Name="[Negative] Scale pod báo lỗi",
            **{"Root Cause": "rc-infra", "System Labels": "sys-infra"},
        )
        draft = preview([row], labels=["found-in-qc"])["drafts"][0]
        provenance = self._provenance(draft)
        self.assertEqual(provenance["found-in-qc"]["source"], "explicit_argument")
        self.assertEqual(provenance["rc-infra"]["source_field"], "root_cause_label")
        self.assertEqual(provenance["sys-infra"]["source_field"], "system_labels")
        self.assertEqual(provenance["test-negative"]["source"], "prefix")

    def test_explicit_argument_has_precedence_over_same_prefix_label(self):
        row = self._row(Name="[Negative] Scale pod báo lỗi")
        draft = preview([row], labels=["test-negative"])["drafts"][0]
        provenance = self._provenance(draft)
        self.assertEqual(provenance["test-negative"]["source"], "explicit_argument")

    def test_root_cause_is_never_inferred_from_keywords(self):
        draft = preview([self._row(Actual="Sai config khiến pod không scale")])["drafts"][0]
        self.assertNotIn("rc-config", draft["payload"]["fields"]["labels"])
        self.assertFalse(draft["label_classification"]["root_cause"])


if __name__ == "__main__":
    unittest.main()
