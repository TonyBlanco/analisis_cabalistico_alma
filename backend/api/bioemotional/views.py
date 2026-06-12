from django.db.models import Q
from django.utils import timezone
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError, PermissionDenied

from api.models import Patient
from api.permissions import IsTherapist
from .models import (
    BioEmotionalDictionaryEntry,
    GenealogyPerson,
    GenealogyEvent,
    BioTransgenerationalHypothesis,
    BioEmotionalSynthesis,
    BioEmotionalAssistedDiagnosis,
    BioEmotionalPatientBrief,
    BioEmotionalObservation,
    BioEmotionalHypothesis,
    BioEmotionalSession,
)
from .serializers import (
    BioEmotionalDictionaryReadSerializer,
    GenealogyPersonSerializer,
    GenealogyEventSerializer,
    GenealogyOverviewSerializer,
    BioTransgenerationalHypothesisSerializer,
    BioEmotionalSynthesisSerializer,
    BioEmotionalAssistedDiagnosisSerializer,
    BioEmotionalPatientBriefSerializer,
    BioEmotionalPatientBriefReadSerializer,
    BioEmotionalObservationSerializer,
    BioEmotionalHypothesisSerializer,
    BioEmotionalSessionSerializer,
    BioEmotionalSessionListSerializer,
    BioEmotionalSessionPatientInputSerializer,
)
from .permissions import IsTherapistAndOwnsPatient
from .dictionary_loader import (
    load_bioemotional_dictionary,
    BioEmotionalDictionaryError,
)
from api.bioemotional.services.tree_of_life_adapter import consult_tree_of_life


class BioEmotionalDictionarySearchView(APIView):
    """Búsqueda READ-ONLY en el Diccionario Bio-Emocional 2016.

    GET /api/bioemotional/dictionary/?q=ABASIA

    - Solo lectura.
    - Solo terapeutas.
    - Dataset validado contra `schema_bioemocional.json`.
    - Sin efectos colaterales.
    """

    permission_classes = [IsAuthenticated, IsTherapist]

    def get_permissions(self):
        if self.request.method == "OPTIONS":
            return []
        return [permission() for permission in self.permission_classes]

    def get(self, request):
        try:
            entries = load_bioemotional_dictionary()
        except BioEmotionalDictionaryError as exc:
            return Response(
                {"detail": f"Error al cargar/validar diccionario bio-emocional: {exc}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        q = request.query_params.get("q", "").strip().lower()
        if q:
            filtered = []
            for entry in entries:
                termino = (entry.get("termino") or "").lower()
                definicion = (entry.get("definicion") or "").lower()
                if q in termino or q in definicion:
                    filtered.append(entry)
        else:
            filtered = entries

        serializer = BioEmotionalDictionaryReadSerializer(filtered, many=True)
        results = serializer.data
        with_tree = request.query_params.get("with_tree") == "1"
        response = {
            "results": results,
        }
        if with_tree and results:
            term = results[0].get("termino")
            tree = consult_tree_of_life(term)
            if tree:
                response["tree_of_life"] = tree
        return Response(response)


class GenealogyOverviewView(APIView):
    """Devuelve el árbol genealógico y eventos de un paciente.

    GET /bioemotional/genealogy/{patient_id}
    """

    permission_classes = [IsAuthenticated, IsTherapistAndOwnsPatient]

    def get(self, request, patient_id: int):
        # `IsTherapistAndOwnsPatient` ya ha validado ownership
        patient = getattr(self, "_bioemotional_patient", None)
        if patient is None:
            # Seguridad adicional
            try:
                patient = Patient.objects.get(pk=patient_id, therapist=request.user)
            except Patient.DoesNotExist:
                return Response({"detail": "Paciente no encontrado."}, status=status.HTTP_404_NOT_FOUND)

        people = GenealogyPerson.objects.filter(patient=patient).order_by("generation", "relation")
        events = GenealogyEvent.objects.filter(patient=patient).order_by("-year", "title")

        serializer = GenealogyOverviewSerializer({
            "people": people,
            "events": events,
        })
        return Response(serializer.data)


class GenealogyPersonCreateView(generics.CreateAPIView):
    """Crea una nueva persona en el árbol genealógico de un paciente.

    POST /bioemotional/genealogy/{patient_id}/person
    """

    serializer_class = GenealogyPersonSerializer
    permission_classes = [IsAuthenticated, IsTherapistAndOwnsPatient]

    def perform_create(self, serializer):
        patient = getattr(self, "_bioemotional_patient", None)
        if patient is None:
            raise ValueError("Paciente no resuelto en GenealogyPersonCreateView")
        serializer.save(patient=patient)


class GenealogyEventCreateView(generics.CreateAPIView):
    """Crea un evento transgeneracional para un paciente.

    POST /bioemotional/genealogy/{patient_id}/event
    """

    serializer_class = GenealogyEventSerializer
    permission_classes = [IsAuthenticated, IsTherapistAndOwnsPatient]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        patient = getattr(self, "_bioemotional_patient", None)
        if patient is not None:
            context["patient"] = patient
        return context

    def perform_create(self, serializer):
        patient = getattr(self, "_bioemotional_patient", None)
        if patient is None:
            raise ValueError("Paciente no resuelto en GenealogyEventCreateView")
        serializer.save(patient=patient)


class GenealogyPersonDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Detalle / edición / borrado de una persona del árbol.

    PATH sugerido: /bioemotional/genealogy/persons/{id}
    """

    serializer_class = GenealogyPersonSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "id"

    def get_queryset(self):
        # Solo terapeutas dueños del paciente asociado
        user = self.request.user
        if not hasattr(user, "profile") or user.profile.user_type != "therapist":
            return GenealogyPerson.objects.none()
        return GenealogyPerson.objects.filter(patient__therapist=user)


class GenealogyEventDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Detalle / edición / borrado de un evento transgeneracional.

    PATH sugerido: /bioemotional/genealogy/events/{id}
    """

    serializer_class = GenealogyEventSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "id"

    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, "profile") or user.profile.user_type != "therapist":
            return GenealogyEvent.objects.none()
        return GenealogyEvent.objects.filter(patient__therapist=user)


class BioEmotionalObservationListCreateView(generics.ListCreateAPIView):
    """Observaciones cl¡nicas bio-emocionales (solo terapeuta)."""

    serializer_class = BioEmotionalObservationSerializer
    permission_classes = [IsAuthenticated, IsTherapist]

    def _get_patient(self, patient_id):
        if not patient_id:
            raise ValidationError({"patient_id": "El campo patient_id es obligatorio."})
        try:
            patient_id_int = int(patient_id)
        except (TypeError, ValueError):
            raise ValidationError({"patient_id": "El patient_id debe ser un entero v lido."})

        user = self.request.user
        try:
            patient = Patient.objects.get(pk=patient_id_int, therapist=user)
        except Patient.DoesNotExist:
            raise PermissionDenied("Paciente no autorizado para este terapeuta.")

        if patient.user_id and patient.user_id == user.id:
            raise PermissionDenied("No se permite autoevaluaci¢n del terapeuta.")
        return patient

    def get_queryset(self):
        patient_id = self.request.query_params.get("patient_id")
        patient = self._get_patient(patient_id)
        return BioEmotionalObservation.objects.filter(patient=patient, therapist=self.request.user)

    def perform_create(self, serializer):
        patient_id = self.request.data.get("patient_id")
        patient = self._get_patient(patient_id)
        serializer.save(patient=patient, therapist=self.request.user)


class BioEmotionalHypothesisListCreateView(generics.ListCreateAPIView):
    """Hip¢tesis bio-emocionales (solo terapeuta)."""

    serializer_class = BioEmotionalHypothesisSerializer
    permission_classes = [IsAuthenticated, IsTherapist]

    def _get_patient(self, patient_id):
        if not patient_id:
            raise ValidationError({"patient_id": "El campo patient_id es obligatorio."})
        try:
            patient_id_int = int(patient_id)
        except (TypeError, ValueError):
            raise ValidationError({"patient_id": "El patient_id debe ser un entero v lido."})

        user = self.request.user
        try:
            patient = Patient.objects.get(pk=patient_id_int, therapist=user)
        except Patient.DoesNotExist:
            raise PermissionDenied("Paciente no autorizado para este terapeuta.")

        if patient.user_id and patient.user_id == user.id:
            raise PermissionDenied("No se permite autoevaluaci¢n del terapeuta.")
        return patient

    def get_queryset(self):
        patient_id = self.request.query_params.get("patient_id")
        patient = self._get_patient(patient_id)
        return BioEmotionalHypothesis.objects.filter(patient=patient, therapist=self.request.user)

    def perform_create(self, serializer):
        patient_id = self.request.data.get("patient_id")
        patient = self._get_patient(patient_id)
        serializer.save(patient=patient, therapist=self.request.user)


class BioEmotionalHypothesisUpdateView(generics.UpdateAPIView):
    """Actualiza hip¢tesis bio-emocionales por id."""

    serializer_class = BioEmotionalHypothesisSerializer
    permission_classes = [IsAuthenticated, IsTherapistAndOwnsPatient]
    queryset = BioEmotionalHypothesis.objects.all()
    http_method_names = ["patch", "options", "head"]


class BioEmotionalSynthesisCreateView(generics.CreateAPIView):
    """Sintesis clinica bio-emocional (solo terapeuta)."""

    serializer_class = BioEmotionalSynthesisSerializer
    permission_classes = [IsAuthenticated, IsTherapist]

    def _get_patient(self, patient_id):
        if not patient_id:
            raise ValidationError({"patient_id": "El campo patient_id es obligatorio."})
        try:
            patient_id_int = int(patient_id)
        except (TypeError, ValueError):
            raise ValidationError({"patient_id": "El patient_id debe ser un entero v lido."})

        user = self.request.user
        try:
            patient = Patient.objects.get(pk=patient_id_int, therapist=user)
        except Patient.DoesNotExist:
            raise PermissionDenied("Paciente no autorizado para este terapeuta.")

        if patient.user_id and patient.user_id == user.id:
            raise PermissionDenied("No se permite autoevaluaci¢n del terapeuta.")
        return patient

    def create(self, request, *args, **kwargs):
        patient_id = request.data.get("patient_id")
        patient = self._get_patient(patient_id)
        text_value = (request.data.get("text") or "").strip()
        if not text_value:
            raise ValidationError({"text": "La sintesis no puede estar vacia."})

        existing = BioEmotionalSynthesis.objects.filter(
            patient=patient, therapist=request.user, is_closed=False
        ).order_by("-created_at").first()

        if existing:
            existing.text = text_value
            existing.save(update_fields=["text"])
            serializer = self.get_serializer(existing)
            return Response(serializer.data, status=status.HTTP_200_OK)

        serializer = self.get_serializer(data={"text": text_value})
        serializer.is_valid(raise_exception=True)
        serializer.save(patient=patient, therapist=request.user)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class BioEmotionalSynthesisCloseView(generics.UpdateAPIView):
    """Cierra la sintesis clinica (solo terapeuta)."""

    serializer_class = BioEmotionalSynthesisSerializer
    permission_classes = [IsAuthenticated, IsTherapistAndOwnsPatient]
    queryset = BioEmotionalSynthesis.objects.all()
    http_method_names = ["patch", "options", "head"]

    def get_queryset(self):
        return BioEmotionalSynthesis.objects.filter(therapist=self.request.user)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.is_closed:
            serializer = self.get_serializer(instance)
            return Response(serializer.data, status=status.HTTP_200_OK)
        instance.is_closed = True
        instance.save(update_fields=["is_closed"])
        serializer = self.get_serializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)


class BioEmotionalAssistedDiagnosisListCreateView(generics.ListCreateAPIView):
    """Lecturas asistidas bio-emocionales (solo terapeuta)."""

    serializer_class = BioEmotionalAssistedDiagnosisSerializer
    permission_classes = [IsAuthenticated, IsTherapist]

    def _get_patient(self, patient_id):
        if not patient_id:
            raise ValidationError({"patient_id": "El campo patient_id es obligatorio."})
        try:
            patient_id_int = int(patient_id)
        except (TypeError, ValueError):
            raise ValidationError({"patient_id": "El patient_id debe ser un entero v lido."})

        user = self.request.user
        try:
            patient = Patient.objects.get(pk=patient_id_int, therapist=user)
        except Patient.DoesNotExist:
            raise PermissionDenied("Paciente no autorizado para este terapeuta.")

        if patient.user_id and patient.user_id == user.id:
            raise PermissionDenied("No se permite autoevaluaci¢n del terapeuta.")
        return patient

    def get_queryset(self):
        patient_id = self.request.query_params.get("patient_id")
        patient = self._get_patient(patient_id)
        return BioEmotionalAssistedDiagnosis.objects.filter(patient=patient, therapist=self.request.user)

    def perform_create(self, serializer):
        patient_id = self.request.data.get("patient_id")
        patient = self._get_patient(patient_id)
        content_value = (self.request.data.get("content") or "").strip()
        if not content_value:
            raise ValidationError({"content": "El contenido no puede estar vacio."})
        prompt_version = (self.request.data.get("prompt_version") or "").strip()
        if not prompt_version:
            raise ValidationError({"prompt_version": "prompt_version es obligatorio."})
        serializer.save(
            patient=patient,
            therapist=self.request.user,
            content=content_value,
            prompt_version=prompt_version,
        )


class BioEmotionalAssistedDiagnosisValidateView(generics.UpdateAPIView):
    """Valida una lectura asistida (solo terapeuta)."""

    serializer_class = BioEmotionalAssistedDiagnosisSerializer
    permission_classes = [IsAuthenticated, IsTherapistAndOwnsPatient]
    queryset = BioEmotionalAssistedDiagnosis.objects.all()
    http_method_names = ["patch", "options", "head"]

    def get_queryset(self):
        return BioEmotionalAssistedDiagnosis.objects.filter(therapist=self.request.user)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.is_validated:
            serializer = self.get_serializer(instance)
            return Response(serializer.data, status=status.HTTP_200_OK)
        instance.is_validated = True
        instance.save(update_fields=["is_validated"])
        serializer = self.get_serializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)


class BioEmotionalPatientBriefListCreateView(generics.ListCreateAPIView):
    """Resúmenes para paciente (solo terapeuta)."""

    serializer_class = BioEmotionalPatientBriefSerializer
    permission_classes = [IsAuthenticated, IsTherapist]

    def _get_patient(self, patient_id):
        if not patient_id:
            raise ValidationError({"patient_id": "El campo patient_id es obligatorio."})
        try:
            patient_id_int = int(patient_id)
        except (TypeError, ValueError):
            raise ValidationError({"patient_id": "El patient_id debe ser un entero válido."})

        user = self.request.user
        try:
            patient = Patient.objects.get(pk=patient_id_int, therapist=user)
        except Patient.DoesNotExist:
            raise PermissionDenied("Paciente no autorizado para este terapeuta.")

        if patient.user_id and patient.user_id == user.id:
            raise PermissionDenied("No se permite autoevaluación del terapeuta.")
        return patient

    def get_queryset(self):
        patient_id = self.request.query_params.get("patient_id")
        patient = self._get_patient(patient_id)
        return BioEmotionalPatientBrief.objects.filter(patient=patient, therapist=self.request.user)

    def perform_create(self, serializer):
        patient_id = self.request.data.get("patient_id")
        patient = self._get_patient(patient_id)
        title_value = (self.request.data.get("title") or "").strip()
        content_value = (self.request.data.get("content") or "").strip()
        if not title_value:
            raise ValidationError({"title": "El titulo es obligatorio."})
        if not content_value:
            raise ValidationError({"content": "El contenido es obligatorio."})
        serializer.save(
            patient=patient,
            therapist=self.request.user,
            title=title_value,
            content=content_value,
        )


class BioEmotionalPatientBriefPublishView(generics.UpdateAPIView):
    """Publica un resumen para el paciente (solo terapeuta)."""

    serializer_class = BioEmotionalPatientBriefSerializer
    permission_classes = [IsAuthenticated, IsTherapistAndOwnsPatient]
    queryset = BioEmotionalPatientBrief.objects.all()
    http_method_names = ["patch", "options", "head"]

    def get_queryset(self):
        return BioEmotionalPatientBrief.objects.filter(therapist=self.request.user)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.is_published:
            serializer = self.get_serializer(instance)
            return Response(serializer.data, status=status.HTTP_200_OK)
        instance.is_published = True
        instance.published_at = timezone.now()
        instance.save(update_fields=["is_published", "published_at", "updated_at"])
        serializer = self.get_serializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)


class BioEmotionalPatientBriefMyListView(generics.ListAPIView):
    """Resúmenes publicados visibles para el paciente autenticado."""

    serializer_class = BioEmotionalPatientBriefReadSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        patient = Patient.objects.filter(user=user).first()
        if not patient:
            return BioEmotionalPatientBrief.objects.none()
        return BioEmotionalPatientBrief.objects.filter(patient=patient, is_published=True)


class BioTransgenerationalHypothesisListCreateView(generics.ListCreateAPIView):
    """Lista y crea hipótesis bio-transgeneracionales para un terapeuta.

    ENDPOINTS:
    - GET  /api/bioemotional/hypotheses/?patient_id=UUID
    - POST /api/bioemotional/hypotheses/

    Reglas:
    - Rol requerido: therapist.
    - `patient_id` debe pertenecer al terapeuta autenticado.
    - `termino_bioemocional` debe existir en el diccionario READ-ONLY.
    """

    serializer_class = BioTransgenerationalHypothesisSerializer
    permission_classes = [IsAuthenticated, IsTherapist]

    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, "profile") or user.profile.user_type != "therapist":
            return BioTransgenerationalHypothesis.objects.none()

        qs = BioTransgenerationalHypothesis.objects.filter(therapist=user)

        patient_id = self.request.query_params.get("patient_id")
        if patient_id:
            qs = qs.filter(patient__id=patient_id)

        return qs

    def perform_create(self, serializer):
        user = self.request.user
        patient_id = self.request.data.get("patient_id")
        if not patient_id:
            raise Response(
                {"patient_id": "Este campo es obligatorio."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            patient = Patient.objects.get(id=patient_id, therapist=user)
        except Patient.DoesNotExist:
            return Response(
                {"patient_id": "Paciente no encontrado o no pertenece al terapeuta actual."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer.save(patient=patient, therapist=user)


class BioTransgenerationalHypothesisDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Detalle / actualización / borrado de una hipótesis bio-transgeneracional.

    ENDPOINTS:
    - GET    /api/bioemotional/hypotheses/{id}/
    - PATCH  /api/bioemotional/hypotheses/{id}/
    - DELETE /api/bioemotional/hypotheses/{id}/

    No hay efectos colaterales ni inferencias automáticas; el borrado es físico
    salvo que el proyecto añada posteriormente un soft delete estándar.
    """

    serializer_class = BioTransgenerationalHypothesisSerializer
    permission_classes = [IsAuthenticated, IsTherapist]
    lookup_field = "id"

    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, "profile") or user.profile.user_type != "therapist":
            return BioTransgenerationalHypothesis.objects.none()
        return BioTransgenerationalHypothesis.objects.filter(therapist=user)


# =============================================================================
# BioEmotional Session Views - Simbiosis Consultante ↔ Terapeuta
# =============================================================================


class BioEmotionalSessionListCreateView(generics.ListCreateAPIView):
    """Lista y crea sesiones BioEmotionales.

    ENDPOINTS:
    - GET  /api/bioemotional/sessions/?patient_id=<id>
    - POST /api/bioemotional/sessions/

    El terapeuta puede listar/crear sesiones para sus pacientes.
    Al crear una sesión, se asocia automáticamente el terapeuta actual.
    """

    permission_classes = [IsAuthenticated, IsTherapist]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return BioEmotionalSessionSerializer
        return BioEmotionalSessionListSerializer

    def _get_patient(self, patient_id):
        if not patient_id:
            raise ValidationError({"patient_id": "El campo patient_id es obligatorio."})
        try:
            patient_id_int = int(patient_id)
        except (TypeError, ValueError):
            raise ValidationError({"patient_id": "El patient_id debe ser un entero válido."})

        user = self.request.user
        try:
            patient = Patient.objects.get(pk=patient_id_int, therapist=user)
        except Patient.DoesNotExist:
            raise PermissionDenied("Paciente no autorizado para este terapeuta.")

        if patient.user_id and patient.user_id == user.id:
            raise PermissionDenied("No se permite autoevaluación del terapeuta.")
        return patient

    def get_queryset(self):
        user = self.request.user
        qs = BioEmotionalSession.objects.filter(
            Q(therapist=user) | Q(patient__therapist=user)
        ).select_related("patient").order_by("-date")

        patient_id = self.request.query_params.get("patient_id")
        if patient_id:
            try:
                patient = self._get_patient(patient_id)
                qs = qs.filter(patient=patient)
            except (ValidationError, PermissionDenied):
                return BioEmotionalSession.objects.none()

        return qs

    def perform_create(self, serializer):
        patient_id = self.request.data.get("patient_id")
        patient = self._get_patient(patient_id)
        serializer.save(patient=patient, therapist=self.request.user)


class BioEmotionalSessionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Detalle / actualización / borrado de una sesión BioEmotional.

    ENDPOINTS:
    - GET    /api/bioemotional/sessions/{id}/
    - PATCH  /api/bioemotional/sessions/{id}/
    - DELETE /api/bioemotional/sessions/{id}/

    Solo el terapeuta dueño del paciente puede acceder.
    """

    serializer_class = BioEmotionalSessionSerializer
    permission_classes = [IsAuthenticated, IsTherapist]
    lookup_field = "id"

    def get_queryset(self):
        user = self.request.user
        return BioEmotionalSession.objects.filter(
            Q(therapist=user) | Q(patient__therapist=user)
        ).select_related("patient")


class BioEmotionalSessionCloseView(generics.UpdateAPIView):
    """Cierra una sesión BioEmotional (solo terapeuta).

    ENDPOINT: PATCH /api/bioemotional/sessions/{id}/close/

    Al cerrar, se actualizan los contadores y se marca la sesión como cerrada.
    """

    serializer_class = BioEmotionalSessionSerializer
    permission_classes = [IsAuthenticated, IsTherapist]
    lookup_field = "id"
    http_method_names = ["patch", "options", "head"]

    def get_queryset(self):
        user = self.request.user
        return BioEmotionalSession.objects.filter(
            Q(therapist=user) | Q(patient__therapist=user),
            is_closed=False,
        ).select_related("patient")

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.is_closed:
            serializer = self.get_serializer(instance)
            return Response(serializer.data, status=status.HTTP_200_OK)

        instance.is_closed = True
        instance.closed_at = timezone.now()
        instance.update_counts()
        instance.save(update_fields=["is_closed", "closed_at", "updated_at"])
        serializer = self.get_serializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)


class BioEmotionalSessionPatientInputView(generics.UpdateAPIView):
    """Permite al consultante actualizar sus notas y síntomas pre-sesión.

    ENDPOINT: PATCH /api/bioemotional/sessions/my/current/

    El consultante autenticado puede actualizar la sesión abierta más reciente.
    Solo se actualizan los campos: patient_notes, patient_feeling_score,
    patient_discomfort_regions.
    """

    serializer_class = BioEmotionalSessionPatientInputSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["patch", "get", "options", "head"]

    def get_object(self):
        user = self.request.user
        # Buscar el paciente asociado al usuario
        patient = Patient.objects.filter(user=user).first()
        if not patient:
            raise PermissionDenied("No tiene un perfil de paciente asociado.")

        # Obtener la sesión abierta más reciente del paciente
        session = BioEmotionalSession.objects.filter(
            patient=patient,
            is_closed=False,
        ).order_by("-date").first()

        if not session:
            raise ValidationError(
                {"detail": "No hay una sesión abierta. Solicite a su terapeuta que inicie una sesión."}
            )
        return session

    def get(self, request, *args, **kwargs):
        """GET para leer la sesión actual del consultante."""
        instance = self.get_object()
        serializer = BioEmotionalSessionSerializer(instance)
        return Response(serializer.data)


class BioEmotionalSessionPatientListView(generics.ListAPIView):
    """Lista sesiones del consultante autenticado (solo lectura).

    ENDPOINT: GET /api/bioemotional/sessions/my/

    El consultante puede ver su historial de sesiones.
    """

    serializer_class = BioEmotionalSessionListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        patient = Patient.objects.filter(user=user).first()
        if not patient:
            return BioEmotionalSession.objects.none()
        return BioEmotionalSession.objects.filter(patient=patient).order_by("-date")

# =============================================================================
# SWM Analytics Integration - Export & Correlation Views
# =============================================================================


class BioEmotionalExportView(APIView):
    """Exporta datos BioEmotional agregados para integración con SWM Analytics.

    GET /api/bioemotional/export/{patient_id}/

    Proporciona un snapshot completo de:
    - Resumen de sesiones
    - Ranking de regiones más trabajadas
    - Tendencias emocionales
    - Mapa de calor agregado
    """

    permission_classes = [IsAuthenticated, IsTherapist]

    def get(self, request, patient_id: int):
        # Validar acceso al paciente
        try:
            patient = Patient.objects.get(pk=patient_id, therapist=request.user)
        except Patient.DoesNotExist:
            return Response(
                {"detail": "Paciente no encontrado o no autorizado."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Obtener sesiones
        sessions = BioEmotionalSession.objects.filter(
            patient=patient
        ).order_by("-date")

        # Obtener observaciones e hipótesis
        observations = BioEmotionalObservation.objects.filter(
            patient=patient
        )
        hypotheses = BioEmotionalHypothesis.objects.filter(
            patient=patient
        )

        # Calcular ranking de regiones
        from collections import Counter, defaultdict
        region_counts = Counter()
        region_intensities = defaultdict(list)
        
        for obs in observations:
            if obs.region_id:
                region_counts[obs.region_id] += 1
        
        for session in sessions:
            if session.heatmap_data:
                for region_id, intensity in session.heatmap_data.items():
                    region_intensities[region_id].append(intensity)

        top_regions = []
        for region_id, count in region_counts.most_common(10):
            intensities = region_intensities.get(region_id, [0])
            avg_intensity = sum(intensities) / len(intensities) if intensities else 0
            top_regions.append({
                "region_id": region_id,
                "observation_count": count,
                "avg_intensity": round(avg_intensity, 2),
                "dominant_emotion": None  # Podría calcularse si hay datos de tipo de emoción
            })

        # Calcular tendencias emocionales
        emotional_trends = [
            {
                "date": s.date,
                "state": s.emotional_state,
                "feeling_score": s.patient_feeling_score
            }
            for s in sessions[:20]  # Últimas 20 sesiones
        ]

        # Agregar heatmap
        heatmap_aggregate = defaultdict(list)
        for session in sessions:
            if session.heatmap_data:
                for region_id, intensity in session.heatmap_data.items():
                    heatmap_aggregate[region_id].append(intensity)
        
        heatmap_final = {
            region_id: round(sum(values) / len(values), 2)
            for region_id, values in heatmap_aggregate.items()
        }

        # Construir respuesta
        export_data = {
            "patient_id": patient.id,
            "patient_name": patient.full_name or f"{patient.first_name} {patient.last_name}".strip(),
            "sessions_summary": [
                {
                    "id": s.id,
                    "date": s.date,
                    "emotional_state": s.emotional_state,
                    "observations_count": s.observations_count,
                    "hypotheses_count": s.hypotheses_count,
                    "synthesis_completed": s.synthesis_completed,
                    "regions_observed": s.regions_observed or []
                }
                for s in sessions[:20]
            ],
            "top_regions": top_regions,
            "emotional_trends": emotional_trends,
            "heatmap_aggregate": heatmap_final,
            "total_sessions": sessions.count(),
            "total_observations": observations.count(),
            "total_hypotheses": hypotheses.count(),
            "export_timestamp": timezone.now()
        }

        from .serializers import BioEmotionalExportSerializer
        serializer = BioEmotionalExportSerializer(export_data)
        return Response(serializer.data)


class MSHEImportBioEmotionalView(APIView):
    """Importa snapshot BioEmotional para integración con MSHE.

    POST /api/bioemotional/mshe-import/

    Persiste el AnalysisRecord normalizado (kind='biodecoding') con scores
    derivados de las regiones observadas, para que el motor de síntesis
    holística (MSHE) lo consuma como fuente federada de solo lectura.
    """

    permission_classes = [IsAuthenticated, IsTherapist]

    def post(self, request):
        patient_id = request.data.get("patient_id")
        if not patient_id:
            return Response(
                {"detail": "patient_id es requerido."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            patient = Patient.objects.get(pk=patient_id, therapist=request.user)
        except Patient.DoesNotExist:
            return Response(
                {"detail": "Paciente no encontrado o no autorizado."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Obtener última sesión cerrada
        last_session = BioEmotionalSession.objects.filter(
            patient=patient,
            is_closed=True
        ).order_by("-closed_at").first()

        if not last_session:
            return Response(
                {"detail": "No hay sesiones cerradas para este paciente."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Persistir el artefacto normalizado que consume el MSHE.
        from api.services.holistic_records import (
            build_bioemotional_module_payload,
            record_module_synthesis,
        )

        module_payload = build_bioemotional_module_payload(patient, therapist=request.user)
        if module_payload is None:
            return Response(
                {"detail": "No hay datos BioEmotional suficientes para este paciente."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        record = record_module_synthesis(**module_payload)
        weight_contribution = module_payload["params"]["weight_contribution"]

        message = f"Datos BioEmotional integrados. Última sesión: {last_session.date.strftime('%Y-%m-%d')}"
        if record is None:
            message += " (advertencia: no se pudo persistir el registro para MSHE)"

        result = {
            "integrated": record is not None,
            "new_weight_contribution": weight_contribution,
            "bioemotional_snapshot_id": str(last_session.id),
            "message": message,
        }

        from .serializers import MSHEImportResultSerializer
        serializer = MSHEImportResultSerializer(result)
        return Response(serializer.data)


class SCID5CorrelateBioEmotionalView(APIView):
    """Correlaciona datos BioEmotional con secciones SCID-5.

    POST /api/bioemotional/scid5-correlate/

    Analiza correspondencia entre regiones corporales observadas
    y secciones de exploración SCID-5.
    """

    permission_classes = [IsAuthenticated, IsTherapist]

    # Mapeo de regiones corporales a secciones SCID-5
    REGION_TO_SCID5_MAP = {
        # Identidad y relaciones
        "head_front": "identity_relationships",
        "head_back": "identity_relationships",
        "neck_front": "identity_relationships",
        "neck_back": "identity_relationships",
        # Estado emocional y vitalidad
        "chest_center": "emotional_vitality",
        "heart_area": "emotional_vitality",
        "shoulder_left": "emotional_vitality",
        "shoulder_right": "emotional_vitality",
        # Ansiedad y calma
        "abdomen_upper": "anxiety_calm",
        "stomach": "anxiety_calm",
        "solar_plexus": "anxiety_calm",
        # Experiencia de realidad y significado
        "throat": "meaning_reality",
        "forehead": "meaning_reality",
        "crown": "meaning_reality",
        # Impacto y memoria
        "back_upper": "impact_memory",
        "back_lower": "impact_memory",
        "spine": "impact_memory",
        # Autorregulación
        "abdomen_lower": "self_regulation",
        "pelvis": "self_regulation",
        "legs": "self_regulation",
        "feet": "self_regulation",
    }

    SECTION_NAMES = {
        "emotional_vitality": "Estado emocional y vitalidad",
        "anxiety_calm": "Ansiedad, preocupación y calma interior",
        "meaning_reality": "Experiencia de realidad y significado",
        "impact_memory": "Experiencias de impacto, memoria y estrés",
        "self_regulation": "Autorregulación y conducta",
        "identity_relationships": "Patrones de identidad y relación",
    }

    def post(self, request):
        patient_id = request.data.get("patient_id")
        section_key = request.data.get("section_key")
        bioemotional_regions = request.data.get("bioemotional_regions", [])

        if not patient_id or not section_key:
            return Response(
                {"detail": "patient_id y section_key son requeridos."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if section_key not in self.SECTION_NAMES:
            return Response(
                {"detail": f"section_key inválido. Opciones: {list(self.SECTION_NAMES.keys())}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            patient = Patient.objects.get(pk=patient_id, therapist=request.user)
        except Patient.DoesNotExist:
            return Response(
                {"detail": "Paciente no encontrado o no autorizado."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Si no se proporcionan regiones, obtener de las últimas sesiones
        if not bioemotional_regions:
            recent_sessions = BioEmotionalSession.objects.filter(
                patient=patient
            ).order_by("-date")[:5]
            
            all_regions = set()
            for session in recent_sessions:
                if session.regions_observed:
                    all_regions.update(session.regions_observed)
            bioemotional_regions = list(all_regions)

        # Calcular correlación
        regions_matched = [
            region for region in bioemotional_regions
            if self.REGION_TO_SCID5_MAP.get(region) == section_key
        ]

        total_mapped_regions = sum(
            1 for region in self.REGION_TO_SCID5_MAP.values()
            if region == section_key
        )

        # Calcular fuerza de correlación
        if not regions_matched:
            correlation_strength = "low"
            confidence_score = 0.2
        elif len(regions_matched) >= total_mapped_regions * 0.5:
            correlation_strength = "high"
            confidence_score = 0.9
        else:
            correlation_strength = "medium"
            confidence_score = 0.6

        # Generar notas sugeridas
        section_name = self.SECTION_NAMES[section_key]
        if regions_matched:
            suggested_notes = (
                f"Se observaron {len(regions_matched)} región(es) corporal(es) "
                f"asociadas a '{section_name}': {', '.join(regions_matched)}. "
                f"Considerar explorar la relación entre manifestaciones corporales "
                f"y patrones experienciales en esta área."
            )
        else:
            suggested_notes = (
                f"No se identificaron regiones corporales directamente asociadas "
                f"a '{section_name}' en las sesiones recientes. "
                f"Puede ser útil explorar esta área con el consultante."
            )

        result = {
            "section_key": section_key,
            "correlation_strength": correlation_strength,
            "regions_matched": regions_matched,
            "suggested_notes": suggested_notes,
            "confidence_score": confidence_score
        }

        from .serializers import SCID5CorrelationResultSerializer
        serializer = SCID5CorrelationResultSerializer(result)
        return Response(serializer.data)
