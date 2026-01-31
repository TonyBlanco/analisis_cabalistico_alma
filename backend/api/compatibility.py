"""
Legacy Patient to Consultante Compatibility Layer

Este módulo proporciona funciones de compatibilidad para la transición
del modelo Patient (clínico legacy) al modelo Consultante (unificado holístico).

IMPORTANTE: Este módulo es temporal y debe eliminarse cuando la migración 
esté completa y todos los sistemas usen directamente el modelo Consultante.

Ver: docs/UNIFIED_CONSULTANTE_ARCHITECTURE.md
Ver: docs/CONSULTANTE_TERMINOLOGY.md
"""

from typing import Optional, Union
from uuid import UUID

from django.contrib.auth.models import User
from django.db.models import Q

from .models import Consultante, Patient


class LegacyPatientAdapter:
    """
    Adapter para mantener compatibilidad con código legacy que usa Patient IDs.
    
    Convierte entre:
    - patient_id (integer) → consultante_uuid (UUID string)
    - Patient objects → Consultante objects
    
    MÉTODOS DISPONIBLES:
    - patient_id_to_uuid(patient_id) → UUID string
    - uuid_to_patient_id(uuid) → int (legacy Patient ID)
    - get_consultante_by_legacy_id(patient_id) → Consultante
    - migrate_patient_to_consultante(patient, therapist) → Consultante
    """
    
    @staticmethod
    def patient_id_to_uuid(patient_id: int, therapist: Optional[User] = None) -> Optional[str]:
        """
        Convertir ID de Patient legacy a UUID de Consultante.
        
        Args:
            patient_id: ID numérico del Patient legacy
            therapist: Usuario terapeuta (opcional, para filtrar por ownership)
            
        Returns:
            UUID string del Consultante correspondiente, o None si no existe
        """
        query = Q(legacy_patient_id=patient_id) | Q(user_account__id=patient_id)
        
        if therapist:
            query &= Q(therapist=therapist)
        
        consultante = Consultante.objects.filter(query).first()
        
        if consultante:
            return str(consultante.uuid)
        
        # Fallback: buscar Patient y luego Consultante por email
        try:
            filters = {'pk': patient_id}
            if therapist:
                filters['therapist'] = therapist
            patient = Patient.objects.get(**filters)
            
            consultante = Consultante.objects.filter(email=patient.email).first()
            if consultante:
                return str(consultante.uuid)
        except Patient.DoesNotExist:
            pass
        
        return None
    
    @staticmethod
    def uuid_to_patient_id(uuid: Union[str, UUID], therapist: Optional[User] = None) -> Optional[int]:
        """
        Convertir UUID de Consultante a ID legacy para compatibilidad.
        
        Args:
            uuid: UUID del Consultante
            therapist: Usuario terapeuta (opcional, para validación)
            
        Returns:
            Integer ID compatible con APIs legacy (user_account.id)
        """
        if isinstance(uuid, str):
            uuid = UUID(uuid)
        
        filters = {'uuid': uuid}
        if therapist:
            filters['therapist'] = therapist
        
        try:
            consultante = Consultante.objects.get(**filters)
            return consultante.user_id  # Retorna user_account.id
        except Consultante.DoesNotExist:
            return None
    
    @staticmethod
    def get_consultante_by_legacy_id(
        patient_id: int, 
        therapist: Optional[User] = None
    ) -> Optional[Consultante]:
        """
        Obtener Consultante usando un ID legacy de Patient.
        
        Args:
            patient_id: ID numérico del Patient legacy
            therapist: Usuario terapeuta (opcional, para validación de ownership)
            
        Returns:
            Objeto Consultante o None si no existe
        """
        query = Q(legacy_patient_id=patient_id) | Q(user_account__id=patient_id)
        
        if therapist:
            query &= Q(therapist=therapist)
        
        return Consultante.objects.filter(query).select_related(
            'user_account', 'therapist'
        ).first()
    
    @staticmethod
    def get_consultante_or_patient(
        id_or_uuid: Union[int, str, UUID],
        therapist: User
    ) -> Optional[Union[Consultante, Patient]]:
        """
        Buscar por UUID (Consultante) o ID numérico (Patient/Consultante legacy).
        
        Útil para endpoints que deben soportar ambos formatos durante la transición.
        
        Args:
            id_or_uuid: UUID string o integer ID
            therapist: Usuario terapeuta para validación
            
        Returns:
            Consultante o Patient object, priorizando Consultante
        """
        # Si es UUID string o UUID object, buscar Consultante directamente
        if isinstance(id_or_uuid, UUID):
            return Consultante.objects.filter(
                uuid=id_or_uuid, therapist=therapist
            ).first()
        
        if isinstance(id_or_uuid, str):
            # Intentar parsear como UUID
            try:
                uuid = UUID(id_or_uuid)
                return Consultante.objects.filter(
                    uuid=uuid, therapist=therapist
                ).first()
            except ValueError:
                pass
            
            # Intentar parsear como integer
            try:
                id_or_uuid = int(id_or_uuid)
            except ValueError:
                return None
        
        # Es un integer, buscar por legacy
        consultante = LegacyPatientAdapter.get_consultante_by_legacy_id(
            id_or_uuid, therapist
        )
        if consultante:
            return consultante
        
        # Último fallback: Patient legacy
        try:
            return Patient.objects.get(pk=id_or_uuid, therapist=therapist)
        except Patient.DoesNotExist:
            return None
    
    @staticmethod
    def to_legacy_format(consultante: Consultante) -> dict:
        """
        Convertir Consultante a formato legacy esperado por frontend antiguo.
        
        Args:
            consultante: Objeto Consultante
            
        Returns:
            Dictionary en formato Patient legacy
        """
        return {
            # IDs legacy
            'id': consultante.user_id,
            'pk': consultante.user_id,
            'patient_id': consultante.user_id,  # Para compatibilidad
            
            # Datos de usuario
            'user_id': consultante.user_id,
            'user': {
                'id': consultante.user_id,
                'username': consultante.user_account.username if consultante.user_account else None,
                'email': consultante.email,
            },
            
            # Datos personales (formato Patient)
            'first_name': consultante.full_name.split()[0] if consultante.full_name else '',
            'last_name': ' '.join(consultante.full_name.split()[1:]) if consultante.full_name else '',
            'full_name': consultante.full_name,
            'email': consultante.email,
            'phone': consultante.phone,
            
            # Datos de nacimiento
            'birth_date': consultante.birth_date.isoformat() if consultante.birth_date else None,
            'birth_time': consultante.birth_time.isoformat() if consultante.birth_time else None,
            'birth_place': consultante.birth_place,
            'birth_city': consultante.birth_city,
            'birth_country': consultante.birth_country,
            'birth_latitude': float(consultante.birth_latitude) if consultante.birth_latitude else None,
            'birth_longitude': float(consultante.birth_longitude) if consultante.birth_longitude else None,
            'birth_timezone': consultante.birth_timezone,
            
            # Identidad
            'biological_sex': consultante.biological_sex,
            'gender_identity': consultante.gender_identity,
            
            # Estado clínico
            'main_complaint': consultante.main_complaint,
            'clinical_history': consultante.clinical_history,
            'treatment_plan': consultante.treatment_plan,
            'therapy_level': consultante.therapy_level,
            'therapy_status': consultante.therapy_status,
            
            # Estado activo
            'is_active': consultante.is_active,
            
            # Metadatos
            'created_at': consultante.created_at.isoformat() if consultante.created_at else None,
            'updated_at': consultante.updated_at.isoformat() if consultante.updated_at else None,
            
            # Nuevos campos Consultante (para frontend que los soporte)
            'uuid': str(consultante.uuid),
            'consultante_uuid': str(consultante.uuid),
            'legacy_patient_id': consultante.legacy_patient_id,
        }
    
    @staticmethod
    def from_legacy_data(
        data: dict, 
        therapist: User,
        user_account: Optional[User] = None
    ) -> Consultante:
        """
        Crear Consultante desde datos en formato Patient legacy.
        
        Args:
            data: Dictionary con datos en formato Patient
            therapist: Usuario terapeuta
            user_account: Usuario para la cuenta (se crea si no se proporciona)
            
        Returns:
            Nuevo objeto Consultante (no guardado)
        """
        # Construir full_name desde first_name/last_name si no está
        full_name = data.get('full_name')
        if not full_name:
            first = data.get('first_name', '')
            last = data.get('last_name', '')
            full_name = f"{first} {last}".strip() or 'Sin nombre'
        
        consultante = Consultante(
            full_name=full_name,
            email=data.get('email'),
            phone=data.get('phone'),
            birth_date=data.get('birth_date'),
            birth_time=data.get('birth_time'),
            birth_place=data.get('birth_place'),
            birth_city=data.get('birth_city'),
            birth_country=data.get('birth_country'),
            birth_latitude=data.get('birth_latitude'),
            birth_longitude=data.get('birth_longitude'),
            birth_timezone=data.get('birth_timezone'),
            biological_sex=data.get('biological_sex', 'unknown'),
            gender_identity=data.get('gender_identity'),
            main_complaint=data.get('main_complaint'),
            clinical_history=data.get('clinical_history'),
            treatment_plan=data.get('treatment_plan'),
            therapy_level=data.get('therapy_level', 'exploratory'),
            therapist=therapist,
            user_account=user_account,
            legacy_patient_id=data.get('patient_id') or data.get('id'),
        )
        
        return consultante


# ==============================================================================
# FUNCIONES DE CONVENIENCIA
# ==============================================================================

def resolve_consultante_uuid(patient_id: int, therapist: User = None) -> Optional[str]:
    """
    Función de conveniencia para resolver patient_id → consultante_uuid.
    
    Uso típico:
        uuid = resolve_consultante_uuid(patient_id, request.user)
        if uuid:
            redirect(f'/api/consultantes/{uuid}/')
    """
    return LegacyPatientAdapter.patient_id_to_uuid(patient_id, therapist)


def get_subject_from_id_or_uuid(
    identifier: Union[int, str, UUID],
    therapist: User
) -> Optional[Consultante]:
    """
    Obtener el sujeto (Consultante) desde cualquier tipo de identificador.
    
    Uso típico en views:
        consultante = get_subject_from_id_or_uuid(request.data.get('subject'), request.user)
        if not consultante:
            return Response({'error': 'Consultante no encontrado'}, status=404)
    """
    result = LegacyPatientAdapter.get_consultante_or_patient(identifier, therapist)
    
    # Si es Patient, intentar obtener Consultante equivalente
    if isinstance(result, Patient):
        consultante = Consultante.objects.filter(
            email=result.email, 
            therapist=therapist
        ).first()
        return consultante
    
    return result


def consultante_to_legacy_response(consultante: Consultante) -> dict:
    """
    Convertir Consultante a respuesta API en formato legacy.
    
    Para uso en endpoints que deben mantener compatibilidad con frontend antiguo.
    """
    return LegacyPatientAdapter.to_legacy_format(consultante)
