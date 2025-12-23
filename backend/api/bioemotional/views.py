from django.db.models import Q
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
    BioEmotionalObservation,
    BioEmotionalHypothesis,
)
from .serializers import (
    BioEmotionalDictionaryReadSerializer,
    GenealogyPersonSerializer,
    GenealogyEventSerializer,
    GenealogyOverviewSerializer,
    BioTransgenerationalHypothesisSerializer,
    BioEmotionalObservationSerializer,
    BioEmotionalHypothesisSerializer,
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
