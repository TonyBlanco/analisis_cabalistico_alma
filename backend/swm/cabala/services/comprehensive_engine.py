"""
Phoenix Backend Bridge - Comprehensive Report Service

Secure wrapper around legacy cabala_py engine.
Golden Rule: Do not modify cabala_py internals.
"""

from cabala_py.integracion_arbol import generar_mapa_cabalista_completo
import logging

logger = logging.getLogger(__name__)


class ComprehensiveReportService:
    """
    Service layer to generate comprehensive kabbalistic reports.
    
    Bridges modern Django architecture with legacy engine without refactoring it.
    """
    
    @staticmethod
    def generate_for_user(user):
        """
        Generate comprehensive kabbalistic report for a user.
        
        Args:
            user: Django User instance (must have profile with birth data)
            
        Returns:
            dict: Complete kabbalistic map from legacy engine
            
        Raises:
            ValueError: If required data is missing
            RuntimeError: If legacy engine fails
        """
        # Validate user has profile
        profile = getattr(user, 'profile', None)
        if not profile:
            raise ValueError(f"User {user.username} has no profile")
        
        # Extract legal name from profile
        legal_name = profile.full_name or profile.legal_full_name
        if not legal_name:
            raise ValueError(f"User {user.username} profile has no legal name (full_name or legal_full_name)")
        
        # Extract birth data from profile (UserProfile has birth_date directly)
        birth_date = profile.birth_date
        if not birth_date:
            raise ValueError(f"User {user.username} profile has no birth_date")
        
        # Extract day, month, year components
        dia = birth_date.day
        mes = birth_date.month
        anio = birth_date.year
        
        logger.info(
            f"Generating comprehensive report for user={user.username}, "
            f"name='{legal_name}', birth={dia}/{mes}/{anio}"
        )
        
        try:
            # Call legacy engine (Phoenix Pattern: don't modify it)
            report = generar_mapa_cabalista_completo(
                nombre_completo=legal_name,
                dia=dia,
                mes=mes,
                anio=anio,
                sistema="dshevastan"  # Default system
            )
            
            logger.info(f"Successfully generated report for user={user.username}")
            return report
            
        except Exception as e:
            logger.error(
                f"Legacy engine error for user={user.username}: {e}",
                exc_info=True
            )
            raise RuntimeError(f"Failed to generate comprehensive report: {str(e)}")
    
    @staticmethod
    def generate_for_patient(patient):
        """
        Generate comprehensive kabbalistic report for a Patient model instance.
        
        Args:
            patient: Patient model instance (must have birth_date and full_name)
            
        Returns:
            dict: Complete kabbalistic map from legacy engine
            
        Raises:
            ValueError: If required data is missing
            RuntimeError: If legacy engine fails
        """
        # Validate patient has required data
        if not patient.full_name:
            raise ValueError(f"Patient {patient.id} has no full_name")
        
        if not patient.birth_date:
            raise ValueError(f"Patient {patient.id} has no birth_date")
        
        # Extract birth data components
        dia = patient.birth_date.day
        mes = patient.birth_date.month
        anio = patient.birth_date.year
        
        logger.info(
            f"Generating comprehensive report for patient_id={patient.id}, "
            f"name='{patient.full_name}', birth={dia}/{mes}/{anio}"
        )
        
        try:
            # Call legacy engine (Phoenix Pattern: don't modify it)
            report = generar_mapa_cabalista_completo(
                nombre_completo=patient.full_name,
                dia=dia,
                mes=mes,
                anio=anio,
                sistema="dshevastan"  # Default system
            )
            
            logger.info(f"Successfully generated report for patient_id={patient.id}")
            return report
            
        except Exception as e:
            logger.error(
                f"Legacy engine error for patient_id={patient.id}: {e}",
                exc_info=True
            )
            raise RuntimeError(f"Failed to generate comprehensive report: {str(e)}")

