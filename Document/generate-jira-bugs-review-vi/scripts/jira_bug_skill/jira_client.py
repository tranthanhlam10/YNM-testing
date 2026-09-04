from __future__ import annotations

import base64
import json
import os
import urllib.error
import urllib.parse
import urllib.request
from typing import Any

from .common import InputError, JiraError, clean
from .config import DUPLICATE_MAX_RESULTS
from .duplicates import build_duplicate_jql, classify_duplicate_issues
from .manifest import RunManifest


def jira_credentials() -> tuple[str, str, str]:
    base_url = os.environ.get("JIRA_BASE_URL", "").strip().rstrip("/")
    email = os.environ.get("JIRA_EMAIL", "").strip()
    token = os.environ.get("JIRA_API_TOKEN", "").strip()
    missing = [name for name, value in (("JIRA_BASE_URL", base_url), ("JIRA_EMAIL", email), ("JIRA_API_TOKEN", token)) if not value]
    if missing:
        raise InputError(f"Thiếu biến môi trường Jira: {', '.join(missing)}")
    if not base_url.startswith("https://"):
        raise InputError("JIRA_BASE_URL phải bắt đầu bằng https://")
    return base_url, email, token


def jira_request(method: str, path: str, payload: dict[str, Any] | None = None) -> tuple[int, dict[str, Any]]:
    base_url, email, token = jira_credentials()
    credentials = base64.b64encode(f"{email}:{token}".encode()).decode("ascii")
    body = json.dumps(payload).encode("utf-8") if payload is not None else None
    request = urllib.request.Request(
        f"{base_url}{path}", data=body, method=method,
        headers={
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": f"Basic {credentials}",
            "User-Agent": "ynm-qc-jira-bugs-skill/2.4",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            raw = response.read().decode("utf-8")
            return response.status, json.loads(raw) if raw else {}
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8", errors="replace")
        try:
            details = json.loads(raw)
        except json.JSONDecodeError:
            details = {"message": raw[:2000]}
        raise JiraError(f"Jira trả về HTTP {exc.code}: {json.dumps(details, ensure_ascii=False)}") from exc
    except urllib.error.URLError as exc:
        raise JiraError(f"Không thể kết nối Jira: {exc.reason}") from exc


def check_auth() -> dict[str, Any]:
    _, profile = jira_request("GET", "/rest/api/3/myself")
    return {
        "ok": True,
        "account_id": profile.get("accountId"),
        "display_name": profile.get("displayName"),
        "email": profile.get("emailAddress"),
    }


def get_issue_context(issue_key: str) -> dict[str, Any]:
    encoded_key = urllib.parse.quote(issue_key, safe="")
    _, issue = jira_request("GET", f"/rest/api/3/issue/{encoded_key}?fields=project,summary,issuetype,status")
    fields = issue.get("fields") or {}
    project_key = clean((fields.get("project") or {}).get("key")).upper()
    if not project_key:
        raise JiraError(f"Không đọc được project của related task {issue_key}")
    return {
        "key": clean(issue.get("key")) or issue_key,
        "project": project_key,
        "summary": clean(fields.get("summary")),
        "issue_type": clean((fields.get("issuetype") or {}).get("name")),
        "status": clean((fields.get("status") or {}).get("name")),
    }


def link_related_issue(bug_key: str, task_key: str, issue_link_type: str) -> bool:
    status, _ = jira_request("POST", "/rest/api/3/issueLink", {
        "type": {"name": issue_link_type},
        "inwardIssue": {"key": bug_key},
        "outwardIssue": {"key": task_key},
    })
    return status in {200, 201, 204}


def issue_has_link(issue_key: str, target_key: str) -> bool:
    encoded_key = urllib.parse.quote(issue_key, safe="")
    _, issue = jira_request("GET", f"/rest/api/3/issue/{encoded_key}?fields=issuelinks")
    fields = issue.get("fields") or {}
    linked_keys: set[str] = set()
    for link in fields.get("issuelinks") or []:
        for side in ("inwardIssue", "outwardIssue"):
            key = clean((link.get(side) or {}).get("key")).upper()
            if key:
                linked_keys.add(key)
    return target_key.upper() in linked_keys


def search_duplicate_issues(drafts: list[dict[str, Any]], related_task_key: str) -> dict[str, list[dict[str, Any]]]:
    results: dict[str, list[dict[str, Any]]] = {}
    for draft in drafts:
        fields = draft["payload"]["fields"]
        jql = build_duplicate_jql(
            clean((fields.get("project") or {}).get("key")),
            clean(fields.get("summary")),
            clean(draft.get("test_case_id")),
        )
        query = urllib.parse.urlencode({
            "jql": jql,
            "fields": "summary,status,description,issuelinks,labels",
            "maxResults": DUPLICATE_MAX_RESULTS,
        })
        _, data = jira_request("GET", f"/rest/api/3/search/jql?{query}")
        results[draft["candidate_id"]] = classify_duplicate_issues(
            draft, data.get("issues") or [], related_task_key,
        )
    return results


def create_issues(
    drafts: list[dict[str, Any]],
    related_task_key: str,
    issue_link_type: str,
    manifest: RunManifest | None = None,
) -> list[dict[str, Any]]:
    base_url, _, _ = jira_credentials()
    results: list[dict[str, Any]] = []
    for draft in drafts:
        summary = draft["payload"]["fields"]["summary"]
        candidate_id = draft["candidate_id"]
        manifest_entry = None
        try:
            if manifest:
                manifest_entry = manifest.ensure_candidate(candidate_id, draft["payload_hash"], {
                    "test_case_id": draft["test_case_id"],
                    "source_row": draft["source_row"],
                    "summary": summary,
                })
            key = clean((manifest_entry or {}).get("jira_key"))
            created_now = False
            if not key:
                if manifest:
                    manifest.update(candidate_id, state="creating", last_error="")
                status, data = jira_request("POST", "/rest/api/3/issue", draft["payload"])
                key = clean(data.get("key"))
                if status != 201 or not key:
                    if manifest:
                        manifest.update(candidate_id, state="failed", last_error="Jira không trả về issue key")
                    results.append({"ok": False, "created": False, "linked": False, "candidate_id": candidate_id, "test_case_id": draft["test_case_id"], "summary": summary, "error": "Jira không trả về issue key"})
                    continue
                created_now = True
                if manifest:
                    manifest.update(candidate_id, state="created", created=True, jira_key=key, last_error="")
            result = {
                "ok": False, "created": True, "linked": False,
                "created_now": created_now, "resumed": not created_now,
                "candidate_id": candidate_id,
                "test_case_id": draft["test_case_id"], "summary": summary,
                "key": key, "url": f"{base_url}/browse/{key}",
                "related_task_key": related_task_key,
                "related_task_url": f"{base_url}/browse/{related_task_key}",
                "link_type": issue_link_type,
            }
            if manifest_entry and manifest_entry.get("linked"):
                result["linked"] = True
                result["ok"] = True
                results.append(result)
                continue
            try:
                if not created_now and issue_has_link(key, related_task_key):
                    result["linked"] = True
                    result["ok"] = True
                    if manifest:
                        manifest.update(candidate_id, state="linked", linked=True, last_error="")
                    results.append(result)
                    continue
                result["linked"] = link_related_issue(key, related_task_key, issue_link_type)
                result["ok"] = result["linked"]
                if not result["linked"]:
                    result["error"] = "Bug đã tạo nhưng Jira không xác nhận issue link"
                    if manifest:
                        manifest.update(candidate_id, state="created", last_error=result["error"])
                elif manifest:
                    manifest.update(candidate_id, state="linked", linked=True, last_error="")
            except (JiraError, InputError) as exc:
                result["error"] = f"Bug đã tạo nhưng link related task thất bại: {exc}"
                if manifest:
                    manifest.update(candidate_id, state="created", last_error=result["error"])
            results.append(result)
        except (JiraError, InputError) as exc:
            if manifest and manifest_entry:
                manifest.update(candidate_id, state="failed" if not manifest_entry.get("created") else "created", last_error=str(exc))
            results.append({"ok": False, "created": bool((manifest_entry or {}).get("created")), "linked": False, "candidate_id": candidate_id, "test_case_id": draft["test_case_id"], "summary": summary, "error": str(exc)})
    return results
