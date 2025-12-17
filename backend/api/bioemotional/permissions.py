from rest_framework.permissions import BasePermission

from api.models import Patient


class IsTherapistAndOwnsPatient(BasePermission):
    """Permite acceso solo a terapeutas que son dueños del paciente objetivo.

    Este permiso asume que el usuario ya está autenticado. No introduce roles
    nuevos; reutiliza `User.profile.user_type` para verificar que es terapeuta
    y comprueba ownership sobre `Patient`.

    Además, bloquea autoevaluación si el terapeuta coincide con el usuario
    asociado al paciente (therapist no puede ser su propio paciente).
    """

    message = "Solo el terapeuta responsable del paciente puede acceder a estos recursos."

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        # Verificar rol terapeuta usando el perfil existente
        if not hasattr(user, "profile") or user.profile.user_type != "therapist":
            return False

        # Algunas vistas operan solo con patient_id en la URL
        patient_id = view.kwargs.get("patient_id")
        if patient_id is None:
            # Para vistas de detalle (por id de objeto) delegamos en has_object_permission
            return True

        try:
            patient = Patient.objects.get(pk=patient_id, therapist=user)
        except Patient.DoesNotExist:
            return False

        # Bloquear autoevaluación: si el paciente está vinculado al mismo usuario
        # que el terapeuta (caso raro pero posible), se rechaza el acceso.
        if patient.user_id and patient.user_id == user.id:
            return False

        # Guardar en el view para reutilizar en get_queryset / perform_create
        setattr(view, "_bioemotional_patient", patient)
        return True

    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if not hasattr(user, "profile") or user.profile.user_type != "therapist":
            return False

        # Compatibilidad con los diferentes modelos del dominio
        patient = None
        if hasattr(obj, "patient"):
            patient = obj.patient
        elif hasattr(obj, "case") and hasattr(obj.case, "patient"):
            patient = obj.case.patient

        if patient is None:
            return False

        # Bloquear autoevaluación también a nivel de objeto
        if patient.user_id and patient.user_id == user.id:
            return False

        return patient.therapist_id == user.id
