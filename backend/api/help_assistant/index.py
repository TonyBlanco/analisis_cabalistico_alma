"""Lightweight local docs index for the help assistant."""

from __future__ import annotations

import math
import re
import unicodedata
from collections import Counter, defaultdict
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Iterable, List, Sequence

from .catalog import HelpDocSource, get_docs_root, iter_doc_sources

STOPWORDS = {
    'a', 'al', 'algo', 'como', 'con', 'de', 'del', 'el', 'en', 'es', 'la', 'las',
    'lo', 'los', 'mi', 'mismo', 'muy', 'no', 'o', 'para', 'por', 'que', 'se',
    'si', 'sin', 'sobre', 'su', 'sus', 'un', 'una', 'unas', 'unos', 'y', 'ya',
    'usar', 'uso', 'app', 'aplicacion', 'aplicacion', 'aplicacion', 'plataforma',
    'ayuda', 'hacer', 'hago', 'hace', 'funciona', 'funcionar', 'pantalla',
}


@dataclass(frozen=True)
class HelpChunk:
    source: HelpDocSource
    heading: str
    text: str
    normalized_text: str
    normalized_heading: str
    tokens: tuple[str, ...]


@dataclass(frozen=True)
class HelpSearchResult:
    title: str
    path: str
    excerpt: str
    score: float
    heading: str


def _slugify_text(text: str) -> str:
    normalized = unicodedata.normalize('NFKD', text or '').encode('ascii', 'ignore').decode('ascii')
    return re.sub(r'[^a-z0-9]+', ' ', normalized.lower()).strip()


def _tokenize(text: str) -> List[str]:
    raw = _slugify_text(text).split()
    return [token for token in raw if token and token not in STOPWORDS and len(token) > 1]


def _read_doc_text(path: Path) -> str:
    return path.read_text(encoding='utf-8')


def _split_sections(text: str) -> Iterable[tuple[str, str]]:
    lines = text.splitlines()
    current_heading = ''
    buffer: List[str] = []

    def flush() -> Iterable[tuple[str, str]]:
        body = '\n'.join(buffer).strip()
        if body:
            yield current_heading or 'Resumen'
            yield body

    for line in lines:
        if re.match(r'^#{1,3}\s+', line):
            if buffer:
                body = '\n'.join(buffer).strip()
                if body:
                    yield current_heading or 'Resumen'
                    yield body
                buffer = []
            current_heading = re.sub(r'^#{1,3}\s+', '', line).strip()
        else:
            buffer.append(line)

    if buffer:
        body = '\n'.join(buffer).strip()
        if body:
            yield current_heading or 'Resumen'
            yield body


def _excerpt(text: str, limit: int = 260) -> str:
    compact = re.sub(r'\s+', ' ', text or '').strip()
    if len(compact) <= limit:
        return compact
    return compact[: limit - 1].rstrip() + '…'


def _doc_title_from_path(path: str) -> str:
    return Path(path).stem.replace('_', ' ').strip().title()


@lru_cache(maxsize=1)
def build_help_index() -> tuple[HelpChunk, ...]:
    docs_root = get_docs_root()
    chunks: List[HelpChunk] = []

    for source in iter_doc_sources():
        file_path = docs_root / Path(source.path).relative_to('docs')
        if not file_path.exists():
            continue
        text = _read_doc_text(file_path)
        sections = list(_split_sections(text))
        if not sections:
            sections = [('Resumen', text)]

        for heading, body in zip(sections[0::2], sections[1::2]):
            combined = f'{heading}\n{body}'
            norm_text = _slugify_text(combined)
            chunks.append(
                HelpChunk(
                    source=source,
                    heading=heading or source.title or _doc_title_from_path(source.path),
                    text=body,
                    normalized_text=norm_text,
                    normalized_heading=_slugify_text(heading),
                    tokens=tuple(_tokenize(combined)),
                )
            )

    return tuple(chunks)


def _document_frequencies(chunks: Sequence[HelpChunk]) -> Counter[str]:
    df: Counter[str] = Counter()
    for chunk in chunks:
        df.update(set(chunk.tokens))
    return df


def search_help_docs(
    query: str,
    *,
    route: str = '',
    screen: str = '',
    limit: int = 3,
) -> List[HelpSearchResult]:
    chunks = build_help_index()
    if not chunks:
        return []

    query_terms = _tokenize(f'{query} {route} {screen}')
    if not query_terms:
        query_terms = _tokenize(query)

    if not query_terms:
        first = chunks[0]
        return [
            HelpSearchResult(
                title=first.source.title,
                path=first.source.path,
                excerpt=_excerpt(first.text),
                score=0.0,
                heading=first.heading,
            )
        ]

    df = _document_frequencies(chunks)
    total_chunks = len(chunks)
    ranked: List[HelpSearchResult] = []

    for chunk in chunks:
        score = 0.0
        for term in query_terms:
            freq = chunk.tokens.count(term)
            if not freq:
                continue
            idf = math.log((1 + total_chunks) / (1 + df[term])) + 1.0
            score += (1.0 + math.log(1 + freq)) * idf
            if term in chunk.normalized_heading:
                score += 1.25
        if query_terms:
            phrase = ' '.join(query_terms[:3])
            if phrase and phrase in chunk.normalized_text:
                score += 1.5
        if route:
            route_tokens = _tokenize(route)
            score += 0.2 * sum(1 for term in route_tokens if term in chunk.tokens)
        if screen:
            screen_tokens = _tokenize(screen)
            score += 0.15 * sum(1 for term in screen_tokens if term in chunk.tokens)

        if score > 0:
            ranked.append(
                HelpSearchResult(
                    title=chunk.source.title,
                    path=chunk.source.path,
                    excerpt=_excerpt(chunk.text),
                    score=score,
                    heading=chunk.heading,
                )
            )

    if not ranked:
        ranked = [
            HelpSearchResult(
                title=chunk.source.title,
                path=chunk.source.path,
                excerpt=_excerpt(chunk.text),
                score=0.0,
                heading=chunk.heading,
            )
            for chunk in chunks[:limit]
        ]

    ranked.sort(key=lambda item: item.score, reverse=True)
    return ranked[:limit]


def best_fallback_guide(query: str, *, route: str = '', screen: str = '') -> HelpSearchResult | None:
    results = search_help_docs(query, route=route, screen=screen, limit=1)
    return results[0] if results else None

