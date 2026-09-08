from __future__ import annotations

import tempfile
import sys
import unittest
from pathlib import Path
from unittest.mock import patch


SKILL_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SKILL_ROOT / "scripts"))

from jira_bug_skill.common import InputError, JiraError  # noqa: E402
from jira_bug_skill.config import JIRA_API_VERSION, JIRA_DEPLOYMENT, JIRA_DESCRIPTION_FORMAT  # noqa: E402
from jira_bug_skill.description_renderer import render_adf, render_wiki  # noqa: E402
from jira_bug_skill.duplicates import accept_duplicate_risk, attach_duplicate_results, classify_duplicate_issues  # noqa: E402
from jira_bug_skill.jira_adapter import JiraAdapter  # noqa: E402
from jira_bug_skill.jira_client import check_auth, create_issues, get_issue_context, search_duplicate_issues  # noqa: E402
from jira_bug_skill.manifest import RunManifest  # noqa: E402
from jira_bug_skill.sheet_adapter import build_writeback_plan, validate_writeback_snapshot  # noqa: E402
from jira_bug_skill.workflow import build_preview  # noqa: E402


def preview(rows, *, source_kind="chat", source_url="", source_sheet_name=""):
    return build_preview(
        rows=rows,
        project="YNMPECA",
        issue_type="Bug",
        include_statuses={"bug", "failed", "error"},
        labels=[],
        field_map={},
        extra_fields={},
        selection_mode="all",
        source_kind=source_kind,
        source_url=source_url,
        source_sheet_name=source_sheet_name,
        related_task_key="YNMPECA-9361",
        related_task_input="YNMPECA-9361",
    )


def chat_row(**extra):
    row = {
        "Testname": "Scale pod báo lỗi khi đang chạy test",
        "Step": "1. Chạy loader\n2. Vào k8s để scale pod",
        "Actual Result": 'Khi scale pod, hệ thống báo lỗi "Cant scale this pod"',
        "Expected Result": "Pod scale thành công",
    }
    row.update(extra)
    return row


class TargetAndEvidenceTests(unittest.TestCase):
    def test_k8s_is_mapped_to_sys_infra(self):
        draft = preview([chat_row()])["drafts"][0]
        self.assertIn("sys-infra", draft["payload"]["fields"]["labels"])

    def test_targets_and_multiple_evidence_are_structured(self):
        result = preview([chat_row(**{
            "Environment": "Testing",
            "Branch": ["feat/a", "release/b"],
            "Domain": "VN, TH",
            "Target URL": "https://testing.example.com",
            "Evidence": [
                {"name": "Screenshot", "url": "https://drive.google.com/file/d/1"},
                "Log: https://drive.google.com/file/d/2",
            ],
        })])
        draft = result["drafts"][0]
        self.assertEqual(draft["target_metadata"]["branches"], ["feat/a", "release/b"])
        self.assertEqual(draft["target_metadata"]["domains"], ["VN", "TH"])
        self.assertEqual(len(draft["evidence_items"]), 2)
        description = draft["payload"]["fields"]["description"]
        self.assertIsInstance(description, str)
        self.assertIn("h3. Affected targets", description)
        self.assertIn("h3. Evidence", description)

    def test_sensitive_evidence_url_blocks_creation(self):
        draft = preview([chat_row(Evidence="https://example.com/log?access_token=secret")])["drafts"][0]
        self.assertEqual(draft["creation_state"], "needs_clarification")
        self.assertIn("sensitive_evidence_url", {item["code"] for item in draft["quality_warnings"]})

    def test_multiple_environments_require_clarification(self):
        draft = preview([chat_row(Environment="Testing, Staging")])["drafts"][0]
        self.assertEqual(draft["creation_state"], "needs_clarification")
        self.assertIn("unmapped_found_in_environment", {item["code"] for item in draft["quality_warnings"]})


class DuplicateTests(unittest.TestCase):
    def test_possible_duplicate_requires_explicit_decision(self):
        result = preview([chat_row()])
        draft = result["drafts"][0]
        issues = [{
            "key": "YNMPECA-9999",
            "fields": {
                "summary": draft["payload"]["fields"]["summary"],
                "status": {"name": "Open"},
                "description": "",
                "issuelinks": [{"outwardIssue": {"key": "YNMPECA-9361"}}],
            },
        }]
        matches = classify_duplicate_issues(draft, issues, "YNMPECA-9361")
        self.assertEqual(matches[0]["state"], "strong")
        attach_duplicate_results(result, {draft["candidate_id"]: matches})
        self.assertEqual(draft["creation_state"], "needs_clarification")
        accept_duplicate_risk(result)
        self.assertEqual(draft["creation_state"], "create_ready")
        self.assertEqual(draft["duplicate_decision"], "create_new_confirmed")

    def test_jira_duplicate_search_calls_search_endpoint(self):
        draft = preview([chat_row()])["drafts"][0]
        issue = {
            "key": "YNMPECA-9999",
            "fields": {
                "summary": draft["payload"]["fields"]["summary"],
                "status": {"name": "Open"},
                "issuelinks": [],
            },
        }
        with patch("jira_bug_skill.jira_client.jira_request", return_value=(200, {"issues": [issue]})) as request:
            results = search_duplicate_issues([draft], "YNMPECA-9361")
        self.assertTrue(results[draft["candidate_id"]])
        path = request.call_args.args[1]
        self.assertIn("/rest/api/2/search?", path)
        self.assertIn("jql=", path)


class JiraServerIntegrationTests(unittest.TestCase):
    def test_team_profile_uses_jira_server_v2_and_wiki(self):
        self.assertEqual(JIRA_DEPLOYMENT, "server")
        self.assertEqual(JIRA_API_VERSION, "2")
        self.assertEqual(JIRA_DESCRIPTION_FORMAT, "wiki")

    def test_server_and_cloud_adapters_build_correct_endpoints(self):
        server = JiraAdapter("server", "2", "wiki")
        cloud = JiraAdapter("cloud", "3", "adf")
        self.assertEqual(server.issue_path("YNMPECA-1"), "/rest/api/2/issue/YNMPECA-1")
        self.assertEqual(server.search_path(), "/rest/api/2/search")
        self.assertEqual(server.issue_link_path(), "/rest/api/2/issueLink")
        self.assertEqual(cloud.issue_path("YNMPECA-1"), "/rest/api/3/issue/YNMPECA-1")
        self.assertEqual(cloud.search_path(), "/rest/api/3/search/jql")

    def test_description_renderers_support_server_and_cloud(self):
        sections = [
            {"heading": "Actual result", "kind": "text", "value": "API trả lỗi 500"},
            {"heading": "Evidence", "kind": "bullets", "values": ["Log: https://example.com/log"]},
        ]
        wiki = render_wiki(sections)
        adf = render_adf(sections)
        self.assertIn("h3. Actual result", wiki)
        self.assertIn("* Log: https://example.com/log", wiki)
        self.assertEqual(adf["type"], "doc")
        self.assertEqual(adf["version"], 1)

    def test_wiki_compact_preview_keeps_user_bullets_as_text(self):
        draft = preview([chat_row(**{
            "Expected Result": "- Pod scale thành công\n- Loader tiếp tục chạy",
        })])["drafts"][0]
        from jira_bug_skill.presentation import compact_description

        compact = compact_description(draft["payload"]["fields"]["description"])
        self.assertEqual(
            compact["expected_result"],
            "- Pod scale thành công\n- Loader tiếp tục chạy",
        )

    def test_check_auth_reads_server_info_and_myself_over_v2(self):
        with patch(
            "jira_bug_skill.jira_client.jira_request",
            side_effect=[
                (200, {"deploymentType": "Server", "version": "9.12.2"}),
                (200, {"name": "lamtt", "displayName": "Lam Tran"}),
            ],
        ) as request:
            result = check_auth()
        self.assertTrue(result["ok"])
        self.assertEqual(result["jira"]["detected_version"], "9.12.2")
        self.assertEqual(result["username"], "lamtt")
        self.assertEqual(request.call_args_list[0].args[1], "/rest/api/2/serverInfo")
        self.assertEqual(request.call_args_list[1].args[1], "/rest/api/2/myself")

    def test_read_task_uses_server_v2_issue_endpoint(self):
        issue = {
            "key": "YNMPECA-9361",
            "fields": {
                "project": {"key": "YNMPECA"},
                "summary": "Task",
                "issuetype": {"name": "Task"},
                "status": {"name": "Open"},
            },
        }
        with patch("jira_bug_skill.jira_client.jira_request", return_value=(200, issue)) as request:
            result = get_issue_context("YNMPECA-9361")
        self.assertEqual(result["project"], "YNMPECA")
        self.assertIn("/rest/api/2/issue/YNMPECA-9361?", request.call_args.args[1])


class ManifestTests(unittest.TestCase):
    def test_manifest_prevents_second_create_and_resumes(self):
        draft = preview([chat_row()])["drafts"][0]
        with tempfile.TemporaryDirectory() as directory:
            manifest = RunManifest(Path(directory) / "run.json", "YNMPECA-9361", "YNMPECA")
            with patch("jira_bug_skill.jira_client.jira_credentials", return_value=("https://jira.example.com", "qa@example.com", "token")), patch(
                "jira_bug_skill.jira_client.jira_request",
                side_effect=[(201, {"key": "YNMPECA-9999", "id": "1"}), (201, {})],
            ) as request:
                first = create_issues([draft], "YNMPECA-9361", "Relates", manifest)[0]
                self.assertTrue(first["created_now"])
                self.assertTrue(first["linked"])
                self.assertEqual(request.call_count, 2)
            with patch("jira_bug_skill.jira_client.jira_credentials", return_value=("https://jira.example.com", "qa@example.com", "token")), patch(
                "jira_bug_skill.jira_client.jira_request",
            ) as request:
                second = create_issues([draft], "YNMPECA-9361", "Relates", manifest)[0]
                self.assertTrue(second["resumed"])
                self.assertEqual(second["key"], "YNMPECA-9999")
                request.assert_not_called()

    def test_manifest_resumes_link_without_creating_second_issue(self):
        draft = preview([chat_row()])["drafts"][0]
        with tempfile.TemporaryDirectory() as directory:
            manifest = RunManifest(Path(directory) / "run.json", "YNMPECA-9361", "YNMPECA")
            with patch("jira_bug_skill.jira_client.jira_credentials", return_value=("https://jira.example.com", "qa@example.com", "token")), patch(
                "jira_bug_skill.jira_client.jira_request",
                side_effect=[(201, {"key": "YNMPECA-9999"}), JiraError("link timeout")],
            ):
                first = create_issues([draft], "YNMPECA-9361", "Relates", manifest)[0]
                self.assertTrue(first["created"])
                self.assertFalse(first["linked"])
            with patch("jira_bug_skill.jira_client.jira_credentials", return_value=("https://jira.example.com", "qa@example.com", "token")), patch(
                "jira_bug_skill.jira_client.jira_request",
                return_value=(200, {"fields": {"issuelinks": [{"outwardIssue": {"key": "YNMPECA-9361"}}]}}),
            ) as request:
                second = create_issues([draft], "YNMPECA-9361", "Relates", manifest)[0]
                self.assertTrue(second["resumed"])
                self.assertTrue(second["linked"])
                self.assertEqual(request.call_count, 1)

    def test_manifest_rejects_changed_payload(self):
        draft = preview([chat_row()])["drafts"][0]
        with tempfile.TemporaryDirectory() as directory:
            manifest = RunManifest(Path(directory) / "run.json", "YNMPECA-9361", "YNMPECA")
            manifest.ensure_candidate(draft["candidate_id"], draft["payload_hash"], {})
            with self.assertRaises(InputError):
                manifest.ensure_candidate(draft["candidate_id"], "changed", {})


class SheetWritebackTests(unittest.TestCase):
    def test_writeback_plan_uses_bug_id_cell_and_separate_confirmation(self):
        row = {
            "TEST CASE ID": "TC-001",
            "TEST NAME": "[High] [Positive] Kiểm tra loader",
            "TEST STEPS": "1. Chạy loader",
            "EXPECTED RESULT": "Loader thành công",
            "ACTUAL RESULT": "Loader trả về lỗi 500",
            "STATUS": "BUG",
            "BUG ID": "",
        }
        result = preview(
            [row], source_kind="sheet",
            source_url="https://docs.google.com/spreadsheets/d/sheet-id/edit?gid=123#gid=123",
            source_sheet_name="Test cases",
        )
        draft = result["drafts"][0]
        plan = build_writeback_plan(result, [{
            "candidate_id": draft["candidate_id"], "created": True, "linked": True,
            "key": "YNMPECA-9999", "url": "https://jira.example.com/browse/YNMPECA-9999",
        }])
        self.assertTrue(plan["requires_separate_confirmation"])
        self.assertEqual(plan["operations"][0]["cell"], "G2")
        self.assertEqual(plan["operations"][0]["sheet_gid"], "123")
        validate_writeback_snapshot(
            "", "", draft["source_locator"]["source_fingerprint"], row,
        )
        with self.assertRaises(InputError):
            validate_writeback_snapshot(
                "", "YNMPECA-1", draft["source_locator"]["source_fingerprint"], row,
            )


if __name__ == "__main__":
    unittest.main()
