from __future__ import annotations

import json
import os
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from .common import InputError


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


class RunManifest:
    def __init__(self, path: Path, related_task: str, project: str):
        self.path = path.expanduser().resolve()
        if self.path.exists():
            try:
                self.data = json.loads(self.path.read_text(encoding="utf-8"))
            except (OSError, json.JSONDecodeError) as exc:
                raise InputError(f"Không đọc được run manifest: {exc}") from exc
            if self.data.get("related_task") != related_task or self.data.get("project") != project:
                raise InputError("Run manifest không khớp project/related task của lần chạy")
        else:
            self.data = {
                "schema": "ynm-qc-jira-run/v1",
                "run_id": self.path.stem,
                "project": project,
                "related_task": related_task,
                "created_at": utc_now(),
                "updated_at": utc_now(),
                "candidates": {},
            }

    def save(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.data["updated_at"] = utc_now()
        handle = tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=self.path.parent, delete=False)
        temporary = Path(handle.name)
        try:
            with handle:
                json.dump(self.data, handle, ensure_ascii=False, indent=2, sort_keys=True)
                handle.write("\n")
                handle.flush()
                os.fsync(handle.fileno())
            os.replace(temporary, self.path)
        finally:
            if temporary.exists():
                temporary.unlink()

    def ensure_candidate(self, candidate_id: str, payload_hash: str, metadata: dict[str, Any]) -> dict[str, Any]:
        candidates = self.data["candidates"]
        entry = candidates.get(candidate_id)
        if entry:
            if entry.get("payload_hash") != payload_hash:
                raise InputError(f"Payload của {candidate_id} đã thay đổi so với run manifest")
            return entry
        entry = {
            "candidate_id": candidate_id,
            "payload_hash": payload_hash,
            "state": "planned",
            "jira_key": "",
            "created": False,
            "linked": False,
            "writeback": False,
            "metadata": metadata,
            "last_error": "",
        }
        candidates[candidate_id] = entry
        self.save()
        return entry

    def update(self, candidate_id: str, **changes: Any) -> dict[str, Any]:
        entry = self.data["candidates"].get(candidate_id)
        if not entry:
            raise InputError(f"Candidate chưa có trong manifest: {candidate_id}")
        entry.update(changes)
        self.save()
        return entry
