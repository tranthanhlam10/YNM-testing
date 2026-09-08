from __future__ import annotations

import hashlib
import json
from typing import Any

from .common import normalized


def stable_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def hash_value(value: Any) -> str:
    return hashlib.sha256(stable_json(value).encode("utf-8")).hexdigest()


def build_candidate_id(
    *,
    project: str,
    related_task: str,
    source_kind: str,
    source_url: str,
    source_row: int,
    test_case_id: str,
    summary: str,
    target: dict[str, Any],
) -> str:
    source_identity: dict[str, Any]
    if test_case_id:
        source_identity = {
            "source_url": source_url,
            "source_row": source_row,
            "test_case_id": test_case_id,
        }
    else:
        source_identity = {"summary": summary}
    digest = hash_value({
        "project": project,
        "related_task": related_task,
        "source_kind": source_kind,
        "source_identity": source_identity,
        "target": target,
    })
    return f"bug-{digest[:24]}"


def build_duplicate_fingerprint(component: str, summary: str, actual: str) -> str:
    digest = hash_value({
        "component": normalized(component),
        "summary": normalized(summary),
        "actual": normalized(actual),
    })
    return f"dup-{digest[:24]}"


def payload_hash(payload: dict[str, Any]) -> str:
    return hash_value(payload)
