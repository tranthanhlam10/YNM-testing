from __future__ import annotations

from typing import Any

from .common import contains_marker, normalized
from .config import QUALITY


COMPARISON_STOP_WORDS = {normalized(item) for item in QUALITY["comparison_stop_words"]}
NEGATION_MARKERS = list(QUALITY["negation_markers"])
HIGH_OVERLAP_THRESHOLD = float(QUALITY["actual_expected_high_overlap_threshold"])


def _meaningful_tokens(value: str) -> set[str]:
    return {
        token
        for token in normalized(value).split()
        if token not in COMPARISON_STOP_WORDS
    }


def analyze_actual_expected(actual: str, expected: str) -> dict[str, Any]:
    normalized_actual = normalized(actual)
    normalized_expected = normalized(expected)
    if not normalized_actual or not normalized_expected:
        return {
            "state": "not_checked",
            "reason": "missing_value",
            "similarity": 0.0,
            "containment": 0.0,
        }

    if normalized_actual == normalized_expected:
        return {
            "state": "conflict",
            "reason": "equal_after_normalization",
            "similarity": 1.0,
            "containment": 1.0,
        }

    actual_tokens = _meaningful_tokens(actual)
    expected_tokens = _meaningful_tokens(expected)
    intersection = actual_tokens & expected_tokens
    union = actual_tokens | expected_tokens
    similarity = len(intersection) / len(union) if union else 0.0
    smaller = min(len(actual_tokens), len(expected_tokens))
    containment = len(intersection) / smaller if smaller else 0.0
    actual_negated = contains_marker(actual, NEGATION_MARKERS)
    expected_negated = contains_marker(expected, NEGATION_MARKERS)

    if similarity >= HIGH_OVERLAP_THRESHOLD and actual_negated == expected_negated:
        state = "review"
        reason = "high_text_overlap"
    else:
        state = "difference_detected"
        reason = "negation_differs" if actual_negated != expected_negated else "text_differs"
    return {
        "state": state,
        "reason": reason,
        "similarity": round(similarity, 3),
        "containment": round(containment, 3),
    }
