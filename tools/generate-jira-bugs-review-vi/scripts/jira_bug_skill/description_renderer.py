from __future__ import annotations

import re
from typing import Any


DescriptionSection = dict[str, Any]


def text_section(heading: str, value: str) -> DescriptionSection | None:
    if not value:
        return None
    return {"heading": heading, "kind": "text", "value": value}


def bullet_section(heading: str, values: list[str]) -> DescriptionSection | None:
    filtered = [str(value).strip() for value in values if str(value).strip()]
    if not filtered:
        return None
    return {"heading": heading, "kind": "bullets", "values": filtered}


def code_section(heading: str, items: list[dict[str, Any]]) -> DescriptionSection | None:
    if not items:
        return None
    return {"heading": heading, "kind": "code", "items": items}


def _adf_text(text: str) -> dict[str, Any]:
    return {"type": "text", "text": text}


def _adf_paragraph(text: str) -> dict[str, Any]:
    return {"type": "paragraph", "content": [_adf_text(text)]}


def render_adf(sections: list[DescriptionSection]) -> dict[str, Any]:
    content: list[dict[str, Any]] = []
    for section in sections:
        content.append({
            "type": "heading",
            "attrs": {"level": 3},
            "content": [_adf_text(section["heading"])],
        })
        if section["kind"] == "bullets":
            content.append({
                "type": "bulletList",
                "content": [
                    {"type": "listItem", "content": [_adf_paragraph(value)]}
                    for value in section["values"]
                ],
            })
        elif section["kind"] == "code":
            for item in section["items"]:
                content.append({
                    "type": "heading",
                    "attrs": {"level": 4},
                    "content": [_adf_text(item["name"])],
                })
                attrs = {"language": item["language"]} if item.get("language") else {}
                content.append({
                    "type": "codeBlock",
                    "attrs": attrs,
                    "content": [_adf_text(item["content"])],
                })
        else:
            for line in section["value"].splitlines() or [section["value"]]:
                content.append(_adf_paragraph(line or " "))
    return {"type": "doc", "version": 1, "content": content}


def render_wiki(sections: list[DescriptionSection]) -> str:
    blocks: list[str] = []
    for section in sections:
        lines = [f"h3. {section['heading']}"]
        if section["kind"] == "bullets":
            lines.extend(f"* {value}" for value in section["values"])
        elif section["kind"] == "code":
            for item in section["items"]:
                name = re.sub(r"[\r\n]+", " ", str(item["name"])).strip()[:100]
                language = re.sub(r"[^a-z0-9_+.-]+", "", str(item.get("language", "text")).casefold()) or "text"
                code = re.sub(r"(?i)\{code(?::[^}]*)?\}", lambda match: "\\" + match.group(0), item["content"])
                lines.extend((f"h4. {name}", f"{{code:{language}}}", code, "{code}"))
        else:
            lines.append(section["value"])
        blocks.append("\n".join(lines))
    return "\n\n".join(blocks).strip()


def render_description(
    sections: list[DescriptionSection],
    description_format: str,
) -> str | dict[str, Any]:
    if description_format == "wiki":
        return render_wiki(sections)
    if description_format == "adf":
        return render_adf(sections)
    raise ValueError(f"Description format không hỗ trợ: {description_format}")
