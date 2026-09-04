from __future__ import annotations

import json
from pathlib import Path
from typing import Any


SKILL_ROOT = Path(__file__).resolve().parents[2]
CONFIG_DIR = SKILL_ROOT / "config"


def _load_json(name: str) -> dict[str, Any]:
    path = CONFIG_DIR / name
    with path.open(encoding="utf-8") as handle:
        data = json.load(handle)
    if not isinstance(data, dict):
        raise RuntimeError(f"Config {path} phải là JSON object")
    return data


SCHEMA = _load_json("bug-candidate.schema.json")
POLICIES = _load_json("policies.json")

PROPERTIES = SCHEMA["properties"]
ALIASES = {
    field: list(details.get("x-header-aliases", []))
    for field, details in PROPERTIES.items()
}
CANONICAL_FIELDS = set(PROPERTIES)
ROW_OVERRIDE_FIELDS = set(SCHEMA["x-row-override-fields"])

DEFAULTS = POLICIES["defaults"]
DEFAULT_FOUND_IN_ENVIRONMENT = DEFAULTS["found_in_environment"]
DEFAULT_PRIORITY = DEFAULTS["priority"]
DEFAULT_JIRA_LABEL = DEFAULTS["jira_label"]
DEFAULT_ISSUE_TYPE = DEFAULTS["issue_type"]
DEFAULT_ISSUE_LINK_TYPE = DEFAULTS["issue_link_type"]
DEFAULT_SELECTION_MODE = DEFAULTS["selection_mode"]
MAX_CREATE_BATCH = int(DEFAULTS["max_create_batch"])
MAX_PREVIEW_CANDIDATES = int(DEFAULTS["max_preview_candidates"])
DUPLICATE_MAX_RESULTS = int(DEFAULTS["duplicate_max_results"])
DUPLICATE_POSSIBLE_SCORE = int(DEFAULTS["duplicate_possible_score"])
DUPLICATE_STRONG_SCORE = int(DEFAULTS["duplicate_strong_score"])

SELECTION_MODES = set(POLICIES["selection"]["modes"])
DEFAULT_READY_VALUES = set(POLICIES["selection"]["ready_values"])
DEFAULT_BUG_STATUSES = set(POLICIES["selection"]["bug_statuses"])


def _reverse_map(groups: dict[str, list[str]]) -> dict[str, str]:
    return {alias: canonical for canonical, aliases in groups.items() for alias in aliases}


PRIORITY_MAP = _reverse_map(POLICIES["priorities"])
ENVIRONMENT_MAP = _reverse_map(POLICIES["environments"])
TEST_TYPE_MAP = _reverse_map(POLICIES["test_types"])

LABEL_GROUPS = POLICIES["labels"]
ROOT_CAUSE_LABELS = set(LABEL_GROUPS["root_cause"])
SYSTEM_LABELS = set(LABEL_GROUPS["system"])
TEST_TYPE_LABELS = set(POLICIES["test_types"])
FLOW_LABELS = set(LABEL_GROUPS["flow"])
LIFECYCLE_LABELS = set(LABEL_GROUPS["lifecycle"])
DETECTION_SOURCE_LABELS = set(LABEL_GROUPS["detection_source"])
ALLOWED_JIRA_LABELS = set().union(
    ROOT_CAUSE_LABELS,
    SYSTEM_LABELS,
    TEST_TYPE_LABELS,
    FLOW_LABELS,
    LIFECYCLE_LABELS,
    DETECTION_SOURCE_LABELS,
)

INFERENCE = POLICIES["inference"]
QUALITY = POLICIES["quality"]
SUMMARY = POLICIES["summary"]
PRIORITY_PREFIXES = set(POLICIES["title_prefixes"]["priority"])
TEST_METADATA_PREFIXES = set(POLICIES["title_prefixes"]["test_metadata"])

CORE_JIRA_FIELDS = {"project", "summary", "issuetype", "description", "labels"}


def validate_runtime_config() -> None:
    required_fields = {"bug_summary", "title", "steps", "expected", "actual"}
    missing_fields = required_fields - CANONICAL_FIELDS
    if missing_fields:
        raise RuntimeError("Canonical schema thiếu field: " + ", ".join(sorted(missing_fields)))
    if DEFAULT_FOUND_IN_ENVIRONMENT not in POLICIES["environments"]:
        raise RuntimeError("Default environment không tồn tại trong environment policy")
    if DEFAULT_PRIORITY not in POLICIES["priorities"]:
        raise RuntimeError("Default priority không tồn tại trong priority policy")
    if DEFAULT_JIRA_LABEL not in ALLOWED_JIRA_LABELS:
        raise RuntimeError("Default Jira label không nằm trong allowlist")
    if MAX_CREATE_BATCH < 1:
        raise RuntimeError("max_create_batch phải lớn hơn 0")
    if not 1 <= MAX_PREVIEW_CANDIDATES <= MAX_CREATE_BATCH:
        raise RuntimeError("max_preview_candidates phải từ 1 đến max_create_batch")
    if not 0 <= DUPLICATE_POSSIBLE_SCORE < DUPLICATE_STRONG_SCORE <= 100:
        raise RuntimeError("Ngưỡng duplicate phải tăng dần trong khoảng 0..100")
    if DUPLICATE_MAX_RESULTS < 1:
        raise RuntimeError("duplicate_max_results phải lớn hơn 0")
    if not 1 <= int(SUMMARY["max_length"]) <= 255:
        raise RuntimeError("summary.max_length phải nằm trong khoảng 1..255")
    if not isinstance(SUMMARY.get("generic_openers"), list) or not SUMMARY["generic_openers"]:
        raise RuntimeError("summary.generic_openers phải là danh sách không rỗng")
    if not isinstance(SUMMARY.get("technical_terms"), dict) or not SUMMARY["technical_terms"]:
        raise RuntimeError("summary.technical_terms phải là object không rỗng")
    if not isinstance(QUALITY.get("comparison_stop_words"), list):
        raise RuntimeError("quality.comparison_stop_words phải là danh sách")
    if not isinstance(QUALITY.get("negation_markers"), list) or not QUALITY["negation_markers"]:
        raise RuntimeError("quality.negation_markers phải là danh sách không rỗng")
    overlap_threshold = float(QUALITY.get("actual_expected_high_overlap_threshold", 0))
    if not 0 < overlap_threshold <= 1:
        raise RuntimeError("quality.actual_expected_high_overlap_threshold phải trong khoảng (0, 1]")
    unmapped_priority_prefixes = PRIORITY_PREFIXES - set(PRIORITY_MAP)
    if unmapped_priority_prefixes:
        raise RuntimeError("Priority prefix chưa map: " + ", ".join(sorted(unmapped_priority_prefixes)))


validate_runtime_config()
