from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List

"""
Frozen contract for POST /api/help/ask

Request:
  {
    "query": string,
    "screen"?: string,
    "route"?: string,
    "locale"?: string
  }

Response:
  {
    "success": boolean,
    "answer": string,
    "citations": Array<{ title: string, path: string, excerpt: string }>,
    "fallback_guide"?: { title: string, path: string },
    "grounding": "high" | "partial" | "none",
    "provider"?: string,
    "usage"?: { prompt_tokens: number, completion_tokens: number, total_tokens: number }
  }
"""


HELP_ENDPOINT = "/api/help/ask"
HELP_TASK_TYPE = "help.ask"
HELP_SCOPE_DECLINE = "out_of_scope"


@dataclass(frozen=True)
class HelpAssistantContext:
    route: str = ""
    screen: str = ""
    locale: str = ""

    def as_prompt_block(self) -> str:
        parts: List[str] = []
        if self.route:
            parts.append(f"route: {self.route}")
        if self.screen:
            parts.append(f"screen: {self.screen}")
        if self.locale:
            parts.append(f"locale: {self.locale}")
        return "\n".join(parts)


@dataclass(frozen=True)
class HelpAssistantCitation:
    title: str
    path: str
    excerpt: str

    def as_dict(self) -> Dict[str, Any]:
        return {
            "title": self.title,
            "path": self.path,
            "excerpt": self.excerpt,
        }


def freeze_help_ask_contract() -> Dict[str, Any]:
    return {
        "request": {
            "query": "string (required)",
            "screen": "string (optional)",
            "route": "string (optional)",
            "locale": "string (optional)",
        },
        "response": {
            "success": "boolean",
            "answer": "string",
            "citations": [
                {
                    "title": "string",
                    "path": "string",
                    "excerpt": "string",
                }
            ],
            "fallback_guide": {
                "title": "string",
                "path": "string",
            },
            "grounding": "high|partial|none",
            "provider": "string",
            "usage": {
                "prompt_tokens": "number",
                "completion_tokens": "number",
                "total_tokens": "number",
            },
        },
    }
