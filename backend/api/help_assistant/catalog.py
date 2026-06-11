"""Curated docs sources for the help assistant RAG index."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List

from django.conf import settings


@dataclass(frozen=True)
class HelpDocSource:
    path: str
    title: str
    tags: tuple[str, ...] = ()


DOC_SOURCES: List[HelpDocSource] = [
    HelpDocSource(
        path='docs/01_PROJECT_STATE/README-STARTUP.md',
        title='Inicio y arranque del proyecto',
        tags=('inicio', 'setup', 'arranque', 'workspace'),
    ),
    HelpDocSource(
        path='docs/01_PROJECT_STATE/PROJECT_STATE_CURRENT.md',
        title='Estado actual del proyecto',
        tags=('estado', 'contexto', 'dashboard', 'version'),
    ),
    HelpDocSource(
        path='docs/01_PROJECT_STATE/MODO_HIBRIDO_GOVERNANCE.md',
        title='Gobernanza del Modo Hibrido',
        tags=('modo hibido', 'consentimiento', 'clinical', 'safety'),
    ),
    HelpDocSource(
        path='docs/01_PROJECT_STATE/AI_INTEGRATION_GUIDE.md',
        title='Guia de integracion AI',
        tags=('ia', 'asistente', 'help', 'llm'),
    ),
    HelpDocSource(
        path='docs/01_PROJECT_STATE/AI_USAGE_METERING_IMPLEMENTATION.md',
        title='Metering de uso de IA',
        tags=('metering', 'uso', 'coste', 'tokens'),
    ),
    HelpDocSource(
        path='docs/01_PROJECT_STATE/TEST_CATALOG_WIRING.md',
        title='Cableado de tests y rutas',
        tags=('tests', 'rutas', 'catalogo'),
    ),
    HelpDocSource(
        path='docs/02_CORE_WORKSPACES/B1_DASHBOARD_INVENTORY.md',
        title='Inventario del dashboard',
        tags=('dashboard', 'menu', 'workspace'),
    ),
    HelpDocSource(
        path='docs/architecture/UX_WORKSPACE_PRINCIPIOS.md',
        title='Principios UX del workspace',
        tags=('ux', 'sidebar', 'panel', 'learn'),
    ),
    HelpDocSource(
        path='docs/technical/README_AI.md',
        title='Guia tecnica AI',
        tags=('ai', 'bridge', 'groq', 'help'),
    ),
    HelpDocSource(
        path='docs/technical/IMPLEMENTACION_RUTAS_TESTS_COMPLETA.md',
        title='Implementacion de rutas y tests',
        tags=('rutas', 'frontend', 'tests'),
    ),
    HelpDocSource(
        path='docs/plans/PLAN-centro-aprendizaje-asistente-ia.md',
        title='Plan — Centro de Aprendizaje + Asistente IA de ayuda',
        tags=('aprender', 'learn', 'centro', 'asistente', 'guias'),
    ),
    HelpDocSource(
        path='docs/learning-center/index.md',
        title='Centro de Aprendizaje — indice',
        tags=('aprender', 'learn', 'centro', 'onboarding'),
    ),
    HelpDocSource(
        path='docs/learning-center/guides/primeros-pasos.md',
        title='Primeros pasos en la app del terapeuta',
        tags=('aprender', 'primeros pasos', 'onboarding', 'tour'),
    ),
    HelpDocSource(
        path='docs/learning-center/guides/workspaces-del-terapeuta.md',
        title='Workspaces del terapeuta',
        tags=('workspace', 'sidebar', 'panel', 'dashboard'),
    ),
    HelpDocSource(
        path='docs/learning-center/guides/modo-hibrido.md',
        title='Modo hibrido y consentimiento',
        tags=('modo hibido', 'consentimiento', 'swm'),
    ),
    HelpDocSource(
        path='docs/learning-center/faq.md',
        title='FAQ de uso del Centro de Aprendizaje',
        tags=('faq', 'preguntas', 'ayuda'),
    ),
]


def get_docs_root() -> Path:
    return Path(settings.BASE_DIR).parent / 'docs'


def iter_doc_sources() -> Iterable[HelpDocSource]:
    return tuple(DOC_SOURCES)

