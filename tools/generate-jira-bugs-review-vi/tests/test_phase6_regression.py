from __future__ import annotations

import json
import sys
import unittest
from pathlib import Path


SKILL_ROOT = Path(__file__).resolve().parents[1]
FIXTURES = Path(__file__).parent / "fixtures"
sys.path.insert(0, str(SKILL_ROOT / "scripts"))

from jira_bug_skill.chat_parser import parse_chat_text  # noqa: E402
from jira_bug_skill.common import InputError  # noqa: E402
from jira_bug_skill.config import JIRA_API_VERSION, JIRA_DEPLOYMENT, JIRA_DESCRIPTION_FORMAT  # noqa: E402
from jira_bug_skill.jira_adapter import JiraAdapter  # noqa: E402
from jira_bug_skill.presentation import compact_preview  # noqa: E402
from jira_bug_skill.workflow import build_preview  # noqa: E402


def build(rows, *, related_task_key="YNMPECA-9361"):
    return build_preview(
        rows=rows,
        project="YNMPECA",
        issue_type="Bug",
        include_statuses={"bug", "failed", "error"},
        labels=[],
        field_map={},
        extra_fields={},
        selection_mode="all",
        source_kind="chat",
        related_task_key=related_task_key,
        related_task_input=related_task_key,
    )


class Phase6RegressionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.cases = json.loads(
            (FIXTURES / "phase6-chat-regression.json").read_text(encoding="utf-8")
        )

    def case(self, case_id):
        return next(item for item in self.cases if item["id"] == case_id)

    def test_jira_server_profile_and_endpoints_remain_v2_wiki(self):
        self.assertEqual((JIRA_DEPLOYMENT, JIRA_API_VERSION, JIRA_DESCRIPTION_FORMAT), ("server", "2", "wiki"))
        adapter = JiraAdapter(JIRA_DEPLOYMENT, JIRA_API_VERSION, JIRA_DESCRIPTION_FORMAT)
        self.assertEqual(adapter.issue_path("YNMPECA-9361"), "/rest/api/2/issue/YNMPECA-9361")
        self.assertEqual(adapter.search_path(), "/rest/api/2/search")
        self.assertEqual(adapter.issue_link_path(), "/rest/api/2/issueLink")

    def test_chat_missing_expected_is_reviewable_but_never_create_ready(self):
        case = self.case("chat_missing_expected")
        result = build([parse_chat_text(case["raw"])])
        draft = result["drafts"][0]
        self.assertEqual(draft["review_state"], "ready_for_review")
        self.assertEqual(draft["creation_state"], case["expected_creation_state"])
        self.assertIn(case["expected_warning"], {item["code"] for item in draft["quality_warnings"]})
        self.assertNotIn("expected_result", compact_preview(result, 5)["candidates"][0]["description"])

    def test_json_code_block_is_redacted_and_rendered_as_wiki_code(self):
        case = self.case("chat_json_log_with_secret")
        draft = build([parse_chat_text(case["raw"])])["drafts"][0]
        description = draft["payload"]["fields"]["description"]
        self.assertEqual(draft["creation_state"], case["expected_creation_state"])
        self.assertIn(case["expected_label"], draft["payload"]["fields"]["labels"])
        self.assertIn("{code:json}", description)
        self.assertIn("[REDACTED]", description)
        self.assertNotIn("fake.phase6.token", description)

    def test_all_generated_labels_have_reviewable_provenance(self):
        case = self.case("chat_label_provenance")
        result = build([parse_chat_text(case["raw"])])
        draft = result["drafts"][0]
        labels = set(draft["payload"]["fields"]["labels"])
        provenance = {
            item["label"]: item
            for item in draft["label_classification"]["provenance"]
        }
        self.assertTrue(set(case["expected_labels"]).issubset(labels))
        self.assertEqual(labels, set(provenance))
        for label in ("sys-crawling-auto", "sys-transform", "flow-transform"):
            self.assertEqual(provenance[label]["source"], "keyword")
            self.assertTrue(provenance[label]["source_field"])
            self.assertTrue(provenance[label]["matched_marker"])
        self.assertEqual(provenance["found-in-qc"]["source"], "default")

    def test_root_cause_is_not_inferred_by_regression_fixture(self):
        case = self.case("chat_label_provenance")
        draft = build([parse_chat_text(case["raw"])])["drafts"][0]
        self.assertFalse(draft["label_classification"]["root_cause"])
        self.assertFalse(any(label.startswith("rc-") for label in draft["payload"]["fields"]["labels"]))

    def test_related_task_remains_required(self):
        row = parse_chat_text(self.case("chat_label_provenance")["raw"])
        with self.assertRaisesRegex(InputError, "Thiếu Jira task liên quan"):
            build([row], related_task_key="")


if __name__ == "__main__":
    unittest.main()
