from __future__ import annotations

from typing import Dict, List

from api.help_assistant.index import best_fallback_guide, search_help_docs


def retrieve_help_citations(
    *,
    query: str,
    screen: str = "",
    route: str = "",
    locale: str = "",
    top_k: int = 3,
) -> List[Dict[str, str]]:
    results = search_help_docs(query, route=route, screen=screen, limit=top_k)
    return [
        {
            "title": item.title,
            "path": item.path,
            "excerpt": item.excerpt,
        }
        for item in results
    ]


def choose_fallback_guide(
    *,
    query: str,
    screen: str = "",
    route: str = "",
    citations: List[Dict[str, str]] | None = None,
) -> Dict[str, str] | None:
    if citations:
        first = citations[0]
        return {"title": first["title"], "path": first["path"]}

    fallback = best_fallback_guide(query, route=route, screen=screen)
    if not fallback:
        return None
    return {"title": fallback.title, "path": fallback.path}
