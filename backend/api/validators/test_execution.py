"""
Test Execution Validators

Pure validation functions for test execution security.
These functions enforce the global immutable rules:

1. Only TWO execution modes: patient_self, therapist_clinical
2. therapist_clinical: ONLY by therapist, requires patient_id, patient must belong to therapist, therapist CANNOT evaluate himself
3. patient_self: Allowed for patient and personal
4. Admin: Can VIEW everything, can NEVER execute therapist_clinical

These validators raise exceptions and have NO side effects.
"""

from rest_framework.exceptions import PermissionDenied, ValidationError
from django.core.exceptions import ObjectDoesNotExist
from api.models import UserProfile, Patient
from api.test_models import TestModule


def validate_execution_mode(test_module: TestModule, execution_mode: str) -> None:
    """
    Validates that the execution_mode is one of the two allowed modes.
    
    Args:
        test_module: The TestModule instance
        execution_mode: The execution mode to validate ('patient_self' or 'therapist_clinical')
    
    Raises:
        ValidationError: If execution_mode is invalid or incompatible with test_module
    """
    if execution_mode not in ['patient_self', 'therapist_clinical']:
        raise ValidationError({
            'error': 'Modo de ejecución inválido',
            'message': f'El modo de ejecución debe ser "patient_self" o "therapist_clinical", se recibió: {execution_mode}',
            'execution_mode': execution_mode
        })
    
    # Validate compatibility with test_module configuration
    if execution_mode == 'therapist_clinical':
        if not test_module.available_for_therapists:
            raise ValidationError({
                'error': 'Test no disponible para ejecución clínica',
                'message': 'Este test no está configurado para ejecución en modo therapist_clinical',
                'test_code': test_module.code,
                'execution_mode': execution_mode
            })
    elif execution_mode == 'patient_self':
        if not test_module.available_for_personal:
            raise ValidationError({
                'error': 'Test no disponible para ejecución personal',
                'message': 'Este test no está configurado para ejecución en modo patient_self',
                'test_code': test_module.code,
                'execution_mode': execution_mode
            })


def validate_role_for_execution(user, execution_mode: str) -> None:
    """
    Validates that the user's role is allowed for the execution_mode.
    
    Rules:
    - therapist_clinical: ONLY therapist (admin explicitly blocked)
    - patient_self: patient or personal (therapist and admin blocked)
    
    Args:
        user: The Django User instance
        execution_mode: The execution mode ('patient_self' or 'therapist_clinical')
    
    Raises:
        PermissionDenied: If the user's role is not allowed for this execution mode
    """
    try:
        profile = user.profile
    except (AttributeError, UserProfile.DoesNotExist):
        raise PermissionDenied({
            'error': 'Perfil de usuario no encontrado',
            'message': 'El usuario no tiene un perfil válido'
        })
    
    user_type = profile.user_type
    is_admin = (
        profile.is_admin or 
        user.is_staff or 
        user.is_superuser
    )
    
    if execution_mode == 'therapist_clinical':
        # ONLY therapist can execute therapist_clinical
        # Admin is EXPLICITLY blocked
        if user_type != 'therapist':
            raise PermissionDenied({
                'error': 'No autorizado para ejecución clínica',
                'message': 'Solo los terapeutas pueden ejecutar tests en modo therapist_clinical',
                'execution_mode': execution_mode,
                'user_role': user_type
            })
        
        # Explicit admin check (even if somehow user_type was 'therapist' but is_admin=True)
        if is_admin:
            raise PermissionDenied({
                'error': 'Administradores no pueden ejecutar tests clínicos',
                'message': 'Los administradores pueden ver resultados pero no ejecutar tests en modo therapist_clinical',
                'execution_mode': execution_mode,
                'user_role': 'admin'
            })
    
    elif execution_mode == 'patient_self':
        # patient_self: Only patient and personal
        # Therapist and admin are blocked
        if user_type == 'therapist':
            raise PermissionDenied({
                'error': 'No autorizado para ejecución personal',
                'message': 'Los terapeutas no pueden ejecutar tests en modo patient_self',
                'execution_mode': execution_mode,
                'user_role': user_type
            })
        
        if is_admin:
            raise PermissionDenied({
                'error': 'No autorizado para ejecución personal',
                'message': 'Los administradores no pueden ejecutar tests en modo patient_self',
                'execution_mode': execution_mode,
                'user_role': 'admin'
            })


def validate_clinical_context(user, patient_id: int) -> None:
    """
    Validates that patient_id is provided for therapist_clinical execution.
    
    Args:
        user: The Django User instance (must be therapist)
        patient_id: The patient ID (must be provided and valid)
    
    Raises:
        ValidationError: If patient_id is missing or invalid
    """
    if not patient_id:
        raise ValidationError({
            'error': 'patient_id requerido',
            'message': 'patient_id es obligatorio para ejecución en modo therapist_clinical',
            'execution_mode': 'therapist_clinical'
        })
    
    if not isinstance(patient_id, int) and not (isinstance(patient_id, str) and patient_id.isdigit()):
        raise ValidationError({
            'error': 'patient_id inválido',
            'message': 'patient_id debe ser un número entero válido',
            'patient_id': patient_id
        })


def validate_patient_ownership(therapist_user, patient_id: int) -> Patient:
    """
    Validates that the patient belongs to the therapist and therapist is not evaluating himself.
    
    Rules:
    - Patient must exist
    - Patient must belong to therapist (Patient.therapist == therapist_user)
    - Therapist cannot evaluate himself (patient.user != therapist_user)
    
    Args:
        therapist_user: The therapist User instance
        patient_id: The patient ID to validate
    
    Returns:
        Patient: The validated Patient instance
    
    Raises:
        PermissionDenied: If patient doesn't exist, doesn't belong to therapist, or therapist is evaluating himself
    """
    try:
        patient = Patient.objects.get(id=patient_id, therapist=therapist_user)
    except Patient.DoesNotExist:
        raise PermissionDenied({
            'error': 'Paciente no encontrado o no autorizado',
            'message': f'El paciente con ID {patient_id} no existe o no pertenece a este terapeuta',
            'patient_id': patient_id
        })
    
    # Validate that therapist is not evaluating himself
    if patient.user == therapist_user:
        raise PermissionDenied({
            'error': 'Auto-evaluación no permitida',
            'message': 'Un terapeuta no puede ejecutar tests clínicos para sí mismo',
            'patient_id': patient_id
        })
    
    return patient


def validate_patient_self_context(patient_id: int = None) -> None:
    """
    Validates that patient_id is NOT provided for patient_self execution.
    
    Args:
        patient_id: The patient ID (must be None or not provided)
    
    Raises:
        ValidationError: If patient_id is provided in patient_self mode
    """
    if patient_id is not None:
        raise ValidationError({
            'error': 'patient_id no permitido en modo patient_self',
            'message': 'No se puede proporcionar patient_id cuando el modo de ejecución es patient_self',
            'execution_mode': 'patient_self',
            'patient_id': patient_id
        })

