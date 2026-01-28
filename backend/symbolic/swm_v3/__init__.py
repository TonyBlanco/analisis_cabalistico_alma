"""
SWM v3 - Symbolic Workspace Module v3

Governed persistence for educational symbolic readings.
"""

default_app_config = 'symbolic.swm_v3.apps.SwmV3Config'

from .views import SwmV3SymbolicReadingCreateView, SwmV3SystemsListView

__all__ = [
    "SwmV3SymbolicReadingCreateView",
    "SwmV3SystemsListView",
]
