from rest_framework import serializers

from .models import (
    BioEmotionalDictionaryEntry,
    GenealogyPerson,
    GenealogyEvent,
    BioTransgenerationalHypothesis,
    BioEmotionalObservation,
    BioEmotionalHypothesis,
    BioEmotionalSynthesis,
    BioEmotionalAssistedDiagnosis,
)
from .dictionary_loader import load_bioemotional_dictionary, BioEmotionalDictionaryError


class BioEmotionalDictionaryEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = BioEmotionalDictionaryEntry
        fields = [
            "id",
            "slug",
            "title",
            "category",
            "description",
            "tags",
        ]
        read_only_fields = fields


class BioEmotionalDictionaryReadSerializer(serializers.Serializer):
    """Serializer READ-ONLY alineado con el schema lógico del diccionario.

    Se usa para exponer las entradas validadas (transformadas) con campos
    como `termino`, `definicion`, `fuente`, etc.
    """

    termino = serializers.CharField()
    definicion = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    marco_tecnico = serializers.DictField(required=False)
    sentido_biologico = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    conflictos_emocionales = serializers.ListField(child=serializers.DictField(), required=False)
    referencias_cruzadas = serializers.ListField(child=serializers.CharField(), required=False)
    fuente = serializers.DictField(required=False)


class GenealogyPersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = GenealogyPerson
        fields = [
            "id",
            "patient",
            "generation",
            "relation",
            "name",
            "birth_year",
            "death_year",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "patient", "created_at", "updated_at"]


class GenealogyEventSerializer(serializers.ModelSerializer):
    linked_people = serializers.PrimaryKeyRelatedField(
        many=True,
        read_only=False,
        queryset=GenealogyPerson.objects.all(),
        required=False,
    )

    class Meta:
        model = GenealogyEvent
        fields = [
            "id",
            "patient",
            "title",
            "year",
            "description",
            "linked_people",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "patient", "created_at", "updated_at"]


class GenealogyOverviewSerializer(serializers.Serializer):
    """Vista combinada de árbol genealógico y eventos para un paciente."""

    people = GenealogyPersonSerializer(many=True)
    events = GenealogyEventSerializer(many=True)


class BioTransgenerationalHypothesisSerializer(serializers.ModelSerializer):
    """Contrato clínico editable para hipótesis transgeneracionales.

    Expone exactamente los campos acordados a frontend, manteniendo cualquier
    detalle adicional (como source_refs) encapsulado en el modelo.
    """

    # Exponemos patient_id como UUID/PK lógico de solo lectura; el valor viene
    # de la relación Patient en el modelo y se valida vía permisos existentes.
    patient_id = serializers.UUIDField(source="patient.id", read_only=True)

    # created_by: se expone como therapist_id (int/UUID según PK del User),
    # nunca como relación fuerte en el contrato externo.
    created_by = serializers.IntegerField(source="therapist.id", read_only=True)

    class Meta:
        model = BioTransgenerationalHypothesis
        fields = [
            "id",
            "patient_id",
            "termino_bioemocional",
            "hypothesis_type",
            "description",
            "status",
            "created_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "patient_id", "created_by", "created_at", "updated_at"]

    def _get_dictionary_terms(self) -> set[str]:
        """Devuelve el conjunto de términos válidos del diccionario READ-ONLY."""
        try:
            entries = load_bioemotional_dictionary()
        except BioEmotionalDictionaryError as exc:
            raise serializers.ValidationError(
                {"termino_bioemocional": f"El diccionario bio-emocional no está disponible: {exc}"}
            )

        terms = {str(e.get("termino", "")).strip().lower() for e in entries}
        return {t for t in terms if t}

    def validate_termino_bioemocional(self, value: str) -> str:
        """Exige que el término exista en el diccionario READ-ONLY.

        No se copia texto del diccionario; solo se valida la referencia por nombre.
        """
        term = (value or "").strip()
        if not term:
            raise serializers.ValidationError("El campo 'termino_bioemocional' es obligatorio.")

        valid_terms = self._get_dictionary_terms()
        if term.lower() not in valid_terms:
            raise serializers.ValidationError(
                "El término bio-emocional indicado no existe en el diccionario de referencia."
            )
        return term

    def validate_status(self, value: str) -> str:
        allowed = {"open", "in_review", "discarded"}
        if value not in allowed:
            raise serializers.ValidationError("Estado inválido para hipótesis bio-transgeneracional.")
        return value

    def validate_hypothesis_type(self, value: str) -> str:
        allowed = {
            "lealtad_invisible",
            "repeticion",
            "aniversario",
            "proyecto_sentido",
            "otro",
        }
        if value not in allowed:
            raise serializers.ValidationError("Tipo de hipótesis transgeneracional inválido.")
        return value


class BioEmotionalObservationSerializer(serializers.ModelSerializer):
    therapist_id = serializers.IntegerField(source="therapist.id", read_only=True)
    patient_id = serializers.IntegerField(source="patient.id", read_only=True)

    class Meta:
        model = BioEmotionalObservation
        fields = [
            "id",
            "therapist_id",
            "patient_id",
            "region_id",
            "dictionary_term_slug",
            "note_text",
            "created_at",
        ]
        read_only_fields = ["id", "therapist_id", "patient_id", "created_at"]


class BioEmotionalHypothesisSerializer(serializers.ModelSerializer):
    therapist_id = serializers.IntegerField(source="therapist.id", read_only=True)
    patient_id = serializers.IntegerField(source="patient.id", read_only=True)

    class Meta:
        model = BioEmotionalHypothesis
        fields = [
            "id",
            "therapist_id",
            "patient_id",
            "title",
            "description",
            "related_region_id",
            "related_dictionary_term",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "therapist_id", "patient_id", "created_at", "updated_at"]

    def validate_status(self, value: str) -> str:
        allowed = {"open", "in_review", "discarded"}
        if value not in allowed:
            raise serializers.ValidationError("Estado inv lido para hip¢tesis bio-emocional.")
        return value


class BioEmotionalSynthesisSerializer(serializers.ModelSerializer):
    therapist_id = serializers.IntegerField(source="therapist.id", read_only=True)
    patient_id = serializers.IntegerField(source="patient.id", read_only=True)

    class Meta:
        model = BioEmotionalSynthesis
        fields = [
            "id",
            "therapist_id",
            "patient_id",
            "text",
            "created_at",
            "is_closed",
        ]
        read_only_fields = ["id", "therapist_id", "patient_id", "created_at", "is_closed"]


class BioEmotionalAssistedDiagnosisSerializer(serializers.ModelSerializer):
    therapist_id = serializers.IntegerField(source="therapist.id", read_only=True)
    patient_id = serializers.IntegerField(source="patient.id", read_only=True)

    class Meta:
        model = BioEmotionalAssistedDiagnosis
        fields = [
            "id",
            "therapist_id",
            "patient_id",
            "content",
            "based_on",
            "prompt_version",
            "is_validated",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "therapist_id", "patient_id", "is_validated", "created_at", "updated_at"]

    def validate_based_on(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("based_on debe ser una lista.")
        for idx, item in enumerate(value):
            if not isinstance(item, dict):
                raise serializers.ValidationError(f"based_on[{idx}] debe ser un objeto.")
            item_type = item.get("type")
            item_id = item.get("id")
            if item_type not in {"observation", "hypothesis", "synthesis", "dictionary_quote"}:
                raise serializers.ValidationError(f"based_on[{idx}].type invalido.")
            if item_id is None or item_id == "":
                raise serializers.ValidationError(f"based_on[{idx}].id es obligatorio.")
        return value
