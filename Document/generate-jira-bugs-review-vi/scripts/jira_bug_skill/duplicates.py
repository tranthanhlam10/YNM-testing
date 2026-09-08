from __future__ import annotations

import re
from typing import Any

from .common import clean, normalized
from .config import DUPLICATE_POSSIBLE_SCORE, DUPLICATE_STRONG_SCORE


STOP_WORDS = {
    "khong", "duoc", "dang", "chay", "hien", "tai", "khi", "trong", "the", "this", "that",
    "with", "from", "bug", "loi", "result", "feature", "configuration",
}


def summary_terms(summary: str, limit: int = 5) -> list[str]:
    terms: list[str] = []
    for token in normalized(summary).split():
        if len(token) < 4 or token in STOP_WORDS or token in terms:
            continue
        terms.append(token)
        if len(terms) == limit:
            break
    return terms


def build_duplicate_jql(project: str, summary: str, test_case_id: str = "") -> str:
    conditions: list[str] = []
    if test_case_id:
        safe_id = re.sub(r'[^A-Za-z0-9_.-]+', " ", test_case_id).strip()
        if safe_id:
            conditions.append(f'text ~ "{safe_id}"')
    conditions.extend(f'summary ~ "{term}"' for term in summary_terms(summary))
    search = " OR ".join(conditions) or 'summary is not EMPTY'
    safe_project = re.sub(r"[^A-Za-z0-9_]", "", project).upper()
    return f'project = "{safe_project}" AND issuetype = Bug AND ({search}) ORDER BY updated DESC'


def _linked_keys(fields: dict[str, Any]) -> set[str]:
    keys: set[str] = set()
    for link in fields.get("issuelinks") or []:
        for side in ("inwardIssue", "outwardIssue"):
            key = clean((link.get(side) or {}).get("key")).upper()
            if key:
                keys.add(key)
    return keys


def score_issue(draft: dict[str, Any], issue: dict[str, Any], related_task: str) -> dict[str, Any]:
    fields = issue.get("fields") or {}
    candidate_summary = draft["payload"]["fields"]["summary"]
    issue_summary = clean(fields.get("summary"))
    candidate_tokens = set(normalized(candidate_summary).split())
    issue_tokens = set(normalized(issue_summary).split())
    union = candidate_tokens | issue_tokens
    similarity = len(candidate_tokens & issue_tokens) / len(union) if union else 0.0
    score = round(similarity * 40)
    reasons: list[str] = []
    if normalized(candidate_summary) == normalized(issue_summary) and candidate_summary:
        score += 35
        reasons.append("same_summary")
    if similarity >= 0.5:
        reasons.append("similar_summary")
    test_case_id = clean(draft.get("test_case_id"))
    searchable = normalized(str(fields))
    if test_case_id and normalized(test_case_id) in searchable:
        score += 35
        reasons.append("same_test_case_id")
    if related_task.upper() in _linked_keys(fields):
        score += 20
        reasons.append("same_related_task")
    score = min(score, 100)
    state = "strong" if score >= DUPLICATE_STRONG_SCORE else "possible" if score >= DUPLICATE_POSSIBLE_SCORE else "unlikely"
    return {
        "key": clean(issue.get("key")),
        "summary": issue_summary,
        "status": clean((fields.get("status") or {}).get("name")),
        "score": score,
        "state": state,
        "reasons": reasons,
    }


def classify_duplicate_issues(draft: dict[str, Any], issues: list[dict[str, Any]], related_task: str) -> list[dict[str, Any]]:
    matches = [score_issue(draft, issue, related_task) for issue in issues]
    return sorted((item for item in matches if item["state"] != "unlikely"), key=lambda item: (-item["score"], item["key"]))


def attach_duplicate_results(preview: dict[str, Any], results: dict[str, list[dict[str, Any]]]) -> None:
    possible = 0
    for draft in preview["drafts"]:
        matches = results.get(draft["candidate_id"], [])
        draft["duplicate_search"] = {"checked": True, "matches": matches}
        if not matches:
            draft["duplicate_state"] = "none"
            continue
        possible += 1
        draft["duplicate_state"] = matches[0]["state"]
        warning = {
            "code": "possible_duplicate",
            "message": f"Có {len(matches)} Jira bug có khả năng trùng; cần tester review trước khi tạo",
            "blocking": True,
        }
        draft["quality_warnings"].append(warning)
        draft["creation_state"] = "needs_clarification"
        preview["quality_warnings"].append({
            "source_row": draft["source_row"],
            "test_case_id": draft["test_case_id"],
            **warning,
        })
    preview["duplicate_search"] = {"checked": True, "candidates_with_matches": possible}
    preview["stats"]["possible_duplicates"] = possible
    preview["stats"]["quality_warnings"] = len(preview["quality_warnings"])
    preview["stats"]["create_ready"] = sum(1 for item in preview["drafts"] if item["creation_state"] == "create_ready")
    preview["stats"]["ready"] = preview["stats"]["create_ready"]
    preview["stats"]["needs_clarification"] = sum(1 for item in preview["drafts"] if item["creation_state"] == "needs_clarification")


def accept_duplicate_risk(preview: dict[str, Any]) -> None:
    for draft in preview["drafts"]:
        if draft.get("duplicate_state") not in {"possible", "strong"}:
            continue
        for warning in draft["quality_warnings"]:
            if warning.get("code") == "possible_duplicate":
                warning["blocking"] = False
                warning["accepted"] = True
        draft["duplicate_decision"] = "create_new_confirmed"
        draft["creation_state"] = "needs_clarification" if any(
            warning.get("blocking") for warning in draft["quality_warnings"]
        ) else "create_ready"
    for warning in preview["quality_warnings"]:
        if warning.get("code") == "possible_duplicate":
            warning["blocking"] = False
            warning["accepted"] = True
    preview["stats"]["create_ready"] = sum(1 for item in preview["drafts"] if item["creation_state"] == "create_ready")
    preview["stats"]["ready"] = preview["stats"]["create_ready"]
    preview["stats"]["needs_clarification"] = sum(1 for item in preview["drafts"] if item["creation_state"] == "needs_clarification")
