from django.urls import path



from .views import (

    BioEmotionalDictionarySearchView,

    GenealogyOverviewView,

    GenealogyPersonCreateView,

    GenealogyEventCreateView,

    GenealogyPersonDetailView,

    GenealogyEventDetailView,

    BioEmotionalObservationListCreateView,

    BioEmotionalHypothesisListCreateView,

    BioEmotionalHypothesisUpdateView,

    BioEmotionalSynthesisCreateView,

    BioEmotionalSynthesisCloseView,

    BioEmotionalAssistedDiagnosisListCreateView,

    BioEmotionalAssistedDiagnosisValidateView,

    BioEmotionalPatientBriefListCreateView,

    BioEmotionalPatientBriefPublishView,

    BioEmotionalPatientBriefMyListView,

    BioTransgenerationalHypothesisListCreateView,

    BioTransgenerationalHypothesisDetailView,

    BioEmotionalSessionListCreateView,

    BioEmotionalSessionDetailView,

    BioEmotionalSessionActiveView,

    BioEmotionalSessionCloseView,

    BioEmotionalSessionPatientInputView,

    BioEmotionalSessionPatientListView,

    # SWM Analytics Integration

    BioEmotionalExportView,

    MSHEImportBioEmotionalView,

    SCID5CorrelateBioEmotionalView,

)





app_name = "bioemotional"



urlpatterns = [

    # Diccionario bio-emocional (solo lectura)

    # GET /api/bioemotional/dictionary/?q=ABASIA

    path("dictionary/", BioEmotionalDictionarySearchView.as_view(), name="dictionary_search"),



    # Árbol genealógico y eventos asociados a un paciente

    path(

        "genealogy/<int:patient_id>/",

        GenealogyOverviewView.as_view(),

        name="genealogy_overview",

    ),

    path(

        "genealogy/<int:patient_id>/person",

        GenealogyPersonCreateView.as_view(),

        name="genealogy_person_create",

    ),

    path(

        "genealogy/<int:patient_id>/event",

        GenealogyEventCreateView.as_view(),

        name="genealogy_event_create",

    ),



    # Detalle / edición / borrado de personas y eventos

    path(

        "genealogy/persons/<uuid:id>/",

        GenealogyPersonDetailView.as_view(),

        name="genealogy_person_detail",

    ),

    path(

        "genealogy/events/<uuid:id>/",

        GenealogyEventDetailView.as_view(),

        name="genealogy_event_detail",

    ),




    # Observaciones bio-emocionales
    # POST /api/bioemotional/observations/
    # GET  /api/bioemotional/observations/?patient_id=
    path(
        "observations/",
        BioEmotionalObservationListCreateView.as_view(),
        name="observation_list_create",
    ),

    # Sintesis clinica
    # POST /api/bioemotional/synthesis/
    # PATCH /api/bioemotional/synthesis/{id}/close/
    path(
        "synthesis/",
        BioEmotionalSynthesisCreateView.as_view(),
        name="synthesis_create",
    ),
    path(
        "synthesis/<uuid:id>/close/",
        BioEmotionalSynthesisCloseView.as_view(),
        name="synthesis_close",
    ),

    # Lectura asistida
    # POST /api/bioemotional/assisted-diagnosis/
    # GET  /api/bioemotional/assisted-diagnosis/?patient_id=
    # PATCH /api/bioemotional/assisted-diagnosis/{id}/validate/
    path(
        "assisted-diagnosis/",
        BioEmotionalAssistedDiagnosisListCreateView.as_view(),
        name="assisted_diagnosis_list_create",
    ),
    path(
        "assisted-diagnosis/<uuid:id>/validate/",
        BioEmotionalAssistedDiagnosisValidateView.as_view(),
        name="assisted_diagnosis_validate",
    ),

    # Resumen para paciente
    # POST /api/bioemotional/patient-brief/
    # GET  /api/bioemotional/patient-brief/?patient_id=
    # PATCH /api/bioemotional/patient-brief/{id}/publish/
    path(
        "patient-brief/",
        BioEmotionalPatientBriefListCreateView.as_view(),
        name="patient_brief_list_create",
    ),
    path(
        "patient-brief/<uuid:id>/publish/",
        BioEmotionalPatientBriefPublishView.as_view(),
        name="patient_brief_publish",
    ),
    # Resumenes del paciente autenticado
    # GET /api/bioemotional/my-briefs/
    path(
        "my-briefs/",
        BioEmotionalPatientBriefMyListView.as_view(),
        name="patient_brief_my_list",
    ),

    # Hipótesis bio-transgeneracionales
    # POST /api/bioemotional/hypotheses/
    # GET  /api/bioemotional/hypotheses/?patient_id=
    # PATCH /api/bioemotional/hypotheses/{id}/
    # PATCH /api/bioemotional/hypotheses/{id}/
    path(
        "hypotheses/",
        BioEmotionalHypothesisListCreateView.as_view(),
        name="hypothesis_list_create",
    ),
    path(
        "hypotheses/<uuid:id>/",
        BioEmotionalHypothesisUpdateView.as_view(),
        name="hypothesis_detail",
    ),

    # ==========================================================================
    # Sesiones BioEmotionales - Simbiosis Consultante ↔ Terapeuta
    # ==========================================================================

    # Sesiones para terapeuta (CRUD completo)
    # GET  /api/bioemotional/sessions/?patient_id=<id>
    # POST /api/bioemotional/sessions/
    path(
        "sessions/",
        BioEmotionalSessionListCreateView.as_view(),
        name="session_list_create",
    ),
    # GET/PATCH/DELETE /api/bioemotional/sessions/{id}/
    path(
        "sessions/<uuid:id>/",
        BioEmotionalSessionDetailView.as_view(),
        name="session_detail",
    ),
    # GET /api/bioemotional/sessions/active/{patient_id}/
    path(
        "sessions/active/<int:patient_id>/",
        BioEmotionalSessionActiveView.as_view(),
        name="session_active",
    ),
    # PATCH /api/bioemotional/sessions/{id}/close/
    path(
        "sessions/<uuid:id>/close/",
        BioEmotionalSessionCloseView.as_view(),
        name="session_close",
    ),

    # Sesiones para consultante (solo su propia sesión)
    # GET/PATCH /api/bioemotional/sessions/my/current/
    path(
        "sessions/my/current/",
        BioEmotionalSessionPatientInputView.as_view(),
        name="session_patient_input",
    ),
    # GET /api/bioemotional/sessions/my/
    path(
        "sessions/my/",
        BioEmotionalSessionPatientListView.as_view(),
        name="session_patient_list",
    ),

    # ==========================================================================
    # SWM Analytics Integration - Export & Correlation Endpoints
    # ==========================================================================

    # GET /api/bioemotional/export/{patient_id}/
    # Exporta datos BioEmotional agregados para integración con SWM Analytics
    path(
        "export/<int:patient_id>/",
        BioEmotionalExportView.as_view(),
        name="export_for_swm",
    ),

    # POST /api/bioemotional/mshe-import/
    # Importa snapshot BioEmotional para integración con MSHE
    path(
        "mshe-import/",
        MSHEImportBioEmotionalView.as_view(),
        name="mshe_import",
    ),

    # POST /api/bioemotional/scid5-correlate/
    # Correlaciona datos BioEmotional con secciones SCID-5
    path(
        "scid5-correlate/",
        SCID5CorrelateBioEmotionalView.as_view(),
        name="scid5_correlate",
    ),

]

