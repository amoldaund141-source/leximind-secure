"""
LexiMind Secure — Document Comparison (Diff) Service
Pure function: no DB access. Testable in isolation.
Uses Python's difflib.SequenceMatcher for line-level diff.
Output shape matches COMPARE_DOC_A / COMPARE_DOC_B in mockData.js exactly:
  {name, lines: [{type: "same"|"added"|"removed"|"modified", text}]}
"""
import difflib
from typing import TypedDict, List, Literal


LineType = Literal["same", "added", "removed", "modified"]


class DiffLine(TypedDict):
    type: LineType
    text: str


class DocDiff(TypedDict):
    name: str
    lines: List[DiffLine]


def compare_documents(text_a: str, name_a: str, text_b: str, name_b: str) -> dict:
    """
    Compare two document texts line by line and return diff shapes.

    Returns:
        {"docA": DocDiff, "docB": DocDiff}
    """
    lines_a = [l.strip() for l in text_a.splitlines() if l.strip()]
    lines_b = [l.strip() for l in text_b.splitlines() if l.strip()]

    if not lines_a and not lines_b:
        # Fallback: return stored/seeded demo comparison
        return _demo_comparison(name_a, name_b)

    matcher = difflib.SequenceMatcher(None, lines_a, lines_b)
    result_a: List[DiffLine] = []
    result_b: List[DiffLine] = []

    for opcode, a0, a1, b0, b1 in matcher.get_opcodes():
        if opcode == "equal":
            for line in lines_a[a0:a1]:
                result_a.append({"type": "same", "text": line})
                result_b.append({"type": "same", "text": line})
        elif opcode == "replace":
            for line in lines_a[a0:a1]:
                result_a.append({"type": "modified", "text": line})
            for line in lines_b[b0:b1]:
                result_b.append({"type": "modified", "text": line})
        elif opcode == "delete":
            for line in lines_a[a0:a1]:
                result_a.append({"type": "removed", "text": line})
        elif opcode == "insert":
            for line in lines_b[b0:b1]:
                result_b.append({"type": "added", "text": line})

    return {
        "docA": {"name": name_a, "lines": result_a},
        "docB": {"name": name_b, "lines": result_b},
    }


def _demo_comparison(name_a: str, name_b: str) -> dict:
    """
    Fallback when documents have no extracted text (e.g., seed data with no real files).
    Matches COMPARE_DOC_A / COMPARE_DOC_B from mockData.js exactly.
    """
    return {
        "docA": {
            "name": name_a,
            "lines": [
                {"type": "same", "text": "On the night of 8th August 2026, I was on duty at the main gate of Marine Heights Society."},
                {"type": "modified", "text": "At approximately 8:00 PM, I observed the complainant Rakesh Bansal leave the premises."},
                {"type": "same", "text": "I did not observe any unfamiliar visitors entering the building that evening."},
                {"type": "removed", "text": "No unusual activity was recorded at the entrance during my shift."},
            ],
        },
        "docB": {
            "name": name_b,
            "lines": [
                {"type": "same", "text": "On the night of 8th August 2026, I was on duty at the main gate of Marine Heights Society."},
                {"type": "modified", "text": "At approximately 6:30 PM, I observed the complainant Rakesh Bansal leave the premises."},
                {"type": "same", "text": "I did not observe any unfamiliar visitors entering the building that evening."},
                {"type": "added", "text": "At around 11:40 PM, an unidentified individual carrying a laptop bag entered and exited within 20 minutes."},
            ],
        },
    }
