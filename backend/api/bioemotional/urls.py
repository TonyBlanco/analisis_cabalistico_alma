from django.urls import path



from .views import (

    BioEmotionalDictionarySearchView,

    GenealogyOverviewView,

    GenealogyPersonCreateView,

    GenealogyEventCreateView,

    GenealogyPersonDetailView,

    GenealogyEventDetailView,

    BioTransgenerationalHypothesisListCreateView,

    BioTransgenerationalHypothesisDetailView,

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



    # Hipótesis bio-transgeneracionales
    # POST /api/bioemotional/hypotheses/
    # GET  /api/bioemotional/hypotheses/?patient_id=UUID
    # GET  /api/bioemotional/hypotheses/{id}/
    # PATCH/DELETE /api/bioemotional/hypotheses/{id}/
    path(
        "hypotheses/",
        BioTransgenerationalHypothesisListCreateView.as_view(),
        name="hypothesis_list_create",
    ),
    path(
        "hypotheses/<uuid:id>/",
        BioTransgenerationalHypothesisDetailView.as_view(),
        name="hypothesis_detail",
    ),

]

