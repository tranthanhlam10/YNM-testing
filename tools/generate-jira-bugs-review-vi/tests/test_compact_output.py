from __future__ import annotations

import json
import os
import subprocess
import sys
import unittest
from pathlib import Path


SKILL_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SKILL_ROOT / "scripts"))

from jira_bug_skill.presentation import compact_preview  # noqa: E402
from jira_bug_skill.workflow import build_preview  # noqa: E402


def full_preview():
    return build_preview(
        rows=[{
            "Testname": "Scale pod báo lỗi khi đang chạy test",
            "Step": "1. Chạy pod loader\n2. Vào K8s để scale",
            "Actual Result": 'Khi scale pod, hệ thống báo lỗi "Cant scale this pod"',
            "Expected Result": "Pod được scale thành công",
        }],
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


class CompactOutputTests(unittest.TestCase):
    def test_compact_output_keeps_review_fields_without_jira_payload(self):
        result = compact_preview(full_preview(), candidate_limit=5)
        candidate = result["candidates"][0]
        self.assertEqual(result["schema"], "ynm-qc-compact-preview/v1")
        self.assertEqual(candidate["summary"], "Scale pod báo lỗi khi đang chạy test")
        self.assertEqual(candidate["description"]["actual_result"], 'Khi scale pod, hệ thống báo lỗi "Cant scale this pod"')
        self.assertEqual(candidate["description"]["expected_result"], "Pod được scale thành công")
        self.assertNotIn("payload", candidate)

    def test_compact_output_is_materially_smaller_than_full_preview(self):
        preview = full_preview()
        full_size = len(json.dumps(preview, ensure_ascii=False))
        compact_size = len(json.dumps(compact_preview(preview, candidate_limit=5), ensure_ascii=False))
        self.assertLess(compact_size, full_size * 0.6)

    def test_compact_output_reports_candidate_truncation(self):
        preview = full_preview()
        preview["drafts"] = [*preview["drafts"], *preview["drafts"]]
        result = compact_preview(preview, candidate_limit=1)
        self.assertEqual(result["display"]["shown_candidates"], 1)
        self.assertEqual(result["display"]["total_candidates"], 2)
        self.assertTrue(result["display"]["truncated"])

    def test_cli_preview_defaults_to_compact_output(self):
        result = self._run_cli()
        self.assertEqual(result["schema"], "ynm-qc-compact-preview/v1")
        self.assertIn("candidates", result)
        self.assertNotIn("drafts", result)

    def test_cli_full_output_remains_available(self):
        result = self._run_cli("full")
        self.assertEqual(result["schema"], "ynm-qc-bug-candidate/v2")
        self.assertIn("drafts", result)

    def _run_cli(self, output_format: str = ""):
        command = [
            sys.executable,
            str(SKILL_ROOT / "scripts" / "jira_bug_generator.py"),
            "--input", "-",
            "--source-kind", "chat",
            "--selection-mode", "all",
            "--related-task", "YNMPECA-9361",
        ]
        if output_format:
            command.extend(["--output-format", output_format])
        completed = subprocess.run(
            command,
            input=json.dumps([{
                "Testname": "Scale pod báo lỗi khi đang chạy test",
                "Step": "1. Chạy loader\n2. Scale pod",
                "Actual Result": "Khi scale pod, hệ thống báo lỗi",
                "Expected Result": "Pod được scale thành công",
            }]),
            text=True,
            capture_output=True,
            check=True,
            cwd=SKILL_ROOT,
            env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"},
        )
        return json.loads(completed.stdout)


if __name__ == "__main__":
    unittest.main()
