"""
URLs for Transgeneracional Profundo SWM.

All routes under /api/swm/transgenerational/
"""

from django.urls import path
from swm.transgenerational.views import (
    TransgenerationalSessionListView,
    TransgenerationalSessionCreateView,
    TransgenerationalSessionDetailView,
    TransgenerationalSessionUpdateView,
    TransgenerationalSessionStartView,
    TransgenerationalSessionCloseView,
    GenogramView,
    FamilyMemberListView,
    FamilyMemberCreateView,
    FamilyMemberUpdateView,
    FamilyMemberDeleteView,
    FamilyRelationshipListView,
    FamilyRelationshipCreateView,
    PatternListView,
    PatternCreateView,
    PatternUpdateView,
    SyndromeMarkListView,
    SyndromeMarkCreateView,
    SnapshotListView,
    SnapshotCreateView,
    TransgenerationalChoicesView,
)

app_name = 'swm_transgenerational'

urlpatterns = [
    # Session management
    path('sessions/', TransgenerationalSessionListView.as_view(), name='session_list'),
    path('sessions/create/', TransgenerationalSessionCreateView.as_view(), name='session_create'),
    path('sessions/<uuid:session_id>/', TransgenerationalSessionDetailView.as_view(), name='session_detail'),
    path('sessions/<uuid:session_id>/update/', TransgenerationalSessionUpdateView.as_view(), name='session_update'),
    path('sessions/<uuid:session_id>/start/', TransgenerationalSessionStartView.as_view(), name='session_start'),
    path('sessions/<uuid:session_id>/close/', TransgenerationalSessionCloseView.as_view(), name='session_close'),
    
    # Genogram
    path('genogram/<uuid:session_id>/', GenogramView.as_view(), name='genogram'),
    
    # Family members
    path('members/<uuid:session_id>/', FamilyMemberListView.as_view(), name='members_list'),
    path('members/', FamilyMemberCreateView.as_view(), name='members_create'),
    path('members/<uuid:member_id>/update/', FamilyMemberUpdateView.as_view(), name='members_update'),
    path('members/<uuid:member_id>/delete/', FamilyMemberDeleteView.as_view(), name='members_delete'),
    
    # Family relationships
    path('relationships/<uuid:session_id>/', FamilyRelationshipListView.as_view(), name='relationships_list'),
    path('relationships/', FamilyRelationshipCreateView.as_view(), name='relationships_create'),
    
    # Patterns
    path('patterns/<uuid:session_id>/', PatternListView.as_view(), name='patterns_list'),
    path('patterns/', PatternCreateView.as_view(), name='patterns_create'),
    path('patterns/<uuid:pattern_id>/update/', PatternUpdateView.as_view(), name='patterns_update'),
    
    # Syndrome marks
    path('syndromes/<uuid:session_id>/', SyndromeMarkListView.as_view(), name='syndromes_list'),
    path('syndromes/', SyndromeMarkCreateView.as_view(), name='syndromes_create'),
    
    # Snapshots
    path('sessions/<uuid:session_id>/snapshots/', SnapshotListView.as_view(), name='snapshots_list'),
    path('sessions/<uuid:session_id>/snapshots/create/', SnapshotCreateView.as_view(), name='snapshots_create'),
    
    # Metadata
    path('choices/', TransgenerationalChoicesView.as_view(), name='choices'),
]
