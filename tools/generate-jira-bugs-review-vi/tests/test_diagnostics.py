from __future__ import annotations

import json
import sys
import unittest
from pathlib import Path


SKILL_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SKILL_ROOT / "scripts"))

from jira_bug_skill.description_renderer import render_adf, render_wiki  # noqa: E402
from jira_bug_skill.config import DIAGNOSTIC_MAX_ITEM_CHARS  # noqa: E402
from jira_bug_skill.diagnostics import parse_diagnostic_items  # noqa: E402
from jira_bug_skill.presentation import compact_preview  # noqa: E402
from jira_bug_skill.workflow import build_preview  # noqa: E402


def preview(**extra):
    row = {
        "Testname": "Scale pod báo lỗi khi đang chạy test",
        "Step": "1. Chạy loader\n2. Scale pod",
        "Actual Result": "Hệ thống báo lỗi Cant scale this pod",
        "Expected Result": "Pod được scale thành công",
    }
    row.update(extra)
    return build_preview(
        rows=[row],
        project="YNMPECA",
        issue_type="Bug",
        include_statuses={"bug", "failed", "error"},
        labels=[],
        field_map={},
        extra_fields={},
        selection_mode="all",
        source_kind="chat",
        related_task_key="YNMPECA-9361",
        related_task_input="YNMPECA-9361",
    )


class DiagnosticParserTests(unittest.TestCase):
    def test_structured_items_keep_type_name_and_json(self):
        items, warnings = parse_diagnostic_items([
            {
                "type": "json",
                "name": "RabbitMQ message",
                "content": {"mode": "priority", "messageCount": 0},
            },
            {
                "type": "command",
                "name": "Scale command",
                "content": "kubectl scale deployment loader --replicas=2",
            },
        ])
        self.assertEqual([item["type"] for item in items], ["json", "command"])
        self.assertEqual(items[0]["name"], "RabbitMQ message")
        self.assertIn('"mode": "priority"', items[0]["content"])
        self.assertEqual(items[1]["language"], "bash")
        self.assertFalse(warnings)

    def test_markdown_and_jira_code_blocks_are_extracted(self):
        value = (
            "Solr query:\n```json\n{\"q\":\"mode:priority\"}\n```\n"
            "Loader log:\n{code:language=text}ERROR no message{code}"
        )
        items, _ = parse_diagnostic_items(value)
        self.assertEqual(len(items), 2)
        self.assertEqual(items[0]["name"], "Solr query")
        self.assertEqual(items[0]["language"], "json")
        self.assertEqual(items[1]["name"], "Loader log")
        self.assertEqual(items[1]["content"], "ERROR no message")

    def test_sensitive_values_are_redacted_before_output(self):
        secret = "this-must-never-reach-jira"
        items, warnings = parse_diagnostic_items({
            "name": "Loader log",
            "type": "log",
            "content": (
                f"Authorization: Bearer {secret}\n"
                f"password=\"{secret}\"\n"
                f"Cookie: session={secret}\n"
                f"https://example.com/log?access_token={secret}"
            ),
        })
        rendered = json.dumps(items, ensure_ascii=False)
        self.assertNotIn(secret, rendered)
        self.assertGreaterEqual(rendered.count("[REDACTED]"), 4)
        self.assertIn("sensitive_diagnostic_redacted", {item["code"] for item in warnings})

    def test_private_key_and_jwt_are_redacted(self):
        value = (
            "-----BEGIN PRIVATE KEY-----\nsecret-key\n-----END PRIVATE KEY-----\n"
            "eyJabcdefgh.ijklmnop.qrstuvwx"
        )
        items, _ = parse_diagnostic_items(value)
        self.assertIn("[REDACTED PRIVATE KEY]", items[0]["content"])
        self.assertIn("[REDACTED JWT]", items[0]["content"])
        self.assertNotIn("secret-key", items[0]["content"])

    def test_empty_item_is_ignored_with_warning(self):
        items, warnings = parse_diagnostic_items([{"name": "Empty", "content": ""}, "valid log"])
        self.assertEqual(len(items), 1)
        self.assertIn("empty_diagnostic_item_ignored", {item["code"] for item in warnings})

    def test_full_payload_item_respects_configured_character_limit(self):
        items, warnings = parse_diagnostic_items("x" * (DIAGNOSTIC_MAX_ITEM_CHARS + 500))
        self.assertLessEqual(len(items[0]["content"]), DIAGNOSTIC_MAX_ITEM_CHARS)
        self.assertTrue(items[0]["truncated"])
        self.assertIn("diagnostic_data_truncated", {item["code"] for item in warnings})


class DiagnosticWorkflowTests(unittest.TestCase):
    def test_diagnostics_are_separate_from_evidence_and_rendered_as_wiki_code(self):
        result = preview(**{
            "Evidence": "Screenshot: https://drive.google.com/file/d/example",
            "Diagnostic Data": [
                {"type": "query", "name": "Solr query", "content": "q=mode:normal"},
                {"type": "log", "name": "Loader log", "content": "INFO mode=normal"},
            ],
        })
        draft = result["drafts"][0]
        description = draft["payload"]["fields"]["description"]
        self.assertEqual(len(draft["evidence_items"]), 1)
        self.assertEqual(len(draft["diagnostic_items"]), 2)
        self.assertIn("h3. Diagnostic data", description)
        self.assertIn("h4. Solr query", description)
        self.assertIn("{code:text}\nq=mode:normal\n{code}", description)
        self.assertIn("h3. Evidence", description)

    def test_secret_is_absent_from_full_and_compact_preview(self):
        secret = "top-secret-value"
        result = preview(**{
            "Diagnostic Data": {
                "name": "Request",
                "type": "request",
                "content": f"api_key={secret}\nrequest failed",
            },
        })
        compact = compact_preview(result, candidate_limit=5)
        self.assertNotIn(secret, json.dumps(result, ensure_ascii=False))
        self.assertNotIn(secret, json.dumps(compact, ensure_ascii=False))
        diagnostic = compact["candidates"][0]["diagnostics"][0]
        self.assertTrue(diagnostic["redacted"])
        self.assertIn("[REDACTED]", diagnostic["content"])
        self.assertEqual(result["drafts"][0]["creation_state"], "create_ready")

    def test_compact_preview_truncates_long_diagnostic_only_for_display(self):
        content = "x" * 2000
        result = preview(**{"Diagnostic Data": {"type": "log", "content": content}})
        draft_item = result["drafts"][0]["diagnostic_items"][0]
        compact_item = compact_preview(result, candidate_limit=5)["candidates"][0]["diagnostics"][0]
        self.assertEqual(draft_item["content"], content)
        self.assertTrue(compact_item["preview_truncated"])
        self.assertLess(len(compact_item["content"]), len(content))

    def test_wiki_macro_in_user_content_cannot_close_code_block(self):
        sections = [{
            "heading": "Diagnostic data",
            "kind": "code",
            "items": [{"name": "Log", "language": "text", "content": "before {code} after"}],
        }]
        rendered = render_wiki(sections)
        self.assertIn(r"before \{code} after", rendered)

    def test_adf_fallback_uses_code_block_node(self):
        sections = [{
            "heading": "Diagnostic data",
            "kind": "code",
            "items": [{"name": "Payload", "language": "json", "content": "{}"}],
        }]
        rendered = render_adf(sections)
        code_node = next(node for node in rendered["content"] if node["type"] == "codeBlock")
        self.assertEqual(code_node["attrs"]["language"], "json")
        self.assertEqual(code_node["content"][0]["text"], "{}")


if __name__ == "__main__":
    unittest.main()
