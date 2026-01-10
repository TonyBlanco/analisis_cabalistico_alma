# 🔍 AUDITORÍA: Endpoint Kerykeion
## POST /api/therapist/patients/<id>/astrology-kerykeion/

---

## A) LOCALIZACIÓN DEL CÓDIGO

### Archivos involucrados:
1. **View**: `backend/api/cabalistic_views.py` (líneas 227-312)
2. **URL**: `backend/api/urls.py` (línea 118)
3. **Service**: `backend/api/astrology_kerykeion/service.py` (líneas 11-157)
4. **Schemas**: `backend/api/astrology_kerykeion/schemas.py` (líneas 19-67)
5. **Mapper**: `backend/api/astrology_kerykeion/mapper_cabala.py` (líneas 130-158)

---

## B) EVALUACIÓN POR SECCIONES

### 1. RUTA Y MÉTODO ✅
**Archivo**: `backend/api/urls.py:118`
- ✅ Método: POST correcto
- ✅ Path: `/api/therapist/patients/<int:id>/astrology-kerykeion/` sin colisiones
- ✅ Nombre único: `kerykeion_analysis`

### 2. AUTENTICACIÓN Y PERMISOS ⚠️
**Archivo**: `backend/api/cabalistic_views.py:233`

**Hallazgo 1**: Solo usa `IsAuthenticated`, no verifica que sea terapeuta
- **Línea**: 233
- **Problema**: Cualquier usuario autenticado puede acceder
- **Riesgo**: Usuario personal podría crear análisis para usuarios ajenos
- **Solución**: Agregar `IsTherapist` permission class

**Hallazgo 2**: Verificación de ownership del usuario es correcta
- **Línea**: 247-250
- ✅ Filtra por `therapist=request.user` antes de `get_object_or_404`
- ✅ Protege contra acceso a pacientes de otros terapeutas

### 3. VALIDACIÓN DE INPUT ⚠️
**Archivo**: `backend/api/cabalistic_views.py:252-259`

**Hallazgo 3**: Excepción genérica captura errores de Pydantic
- **Línea**: 253-259
- **Problema**: `str(e)` puede exponer detalles internos de Pydantic
- **Riesgo**: Stacktrace parcial en respuesta al cliente
- **Solución**: Capturar `ValidationError` específicamente y formatear mensajes

**Hallazgo 4**: Validación de fecha/hora del usuario no se usa
- **Línea**: 262-266
- **Problema**: Verifica `patient.birth_date` pero no la usa en el cálculo
- **Riesgo**: Inconsistencia entre datos del usuario y input del request
- **Solución**: Opcionalmente validar que coincidan o usar datos del paciente como fallback

**Hallazgo 5**: Validación de coordenadas geográficas en schema
- **Archivo**: `schemas.py:14-15`
- ✅ Valida lat (-90 a 90) y lng (-180 a 180)
- ✅ Valida sistemas de casas y zodiacales

### 4. LLAMADA AL SERVICIO KERYKEION ✅
**Archivo**: `backend/api/astrology_kerykeion/service.py`

**Hallazgo 6**: Usa Kerykeion real correctamente
- **Línea**: 28-41
- ✅ `AstrologicalSubject` creado con parámetros reales
- ✅ `KerykeionChartSVG` genera SVG real
- ✅ Extrae datos reales de `subject.planets`, `subject.houses`, `subject.aspects`

**Hallazgo 7**: Manejo de versión de Kerykeion
- **Línea**: 143-147
- ⚠️ `except:` sin especificar excepción (poco específico)
- **Solución**: `except (ImportError, AttributeError):`

**Hallazgo 8**: Mapeo de signos inglés → español
- **Línea**: 48-61
- ✅ Correcto, pero podría fallar si Kerykeion devuelve signo no mapeado
- **Solución**: Agregar validación o usar `.get(sign, sign)` (ya está implementado)

### 5. PERSISTENCIA EN CABALISTICANALYSIS ✅
**Archivo**: `backend/api/cabalistic_views.py:284-292`

**Hallazgo 9**: Guardado correcto
- ✅ `analysis_type='astrology-kerykeion'` correcto
- ✅ `input_data` y `result_data` como JSON
- ✅ `chart_svg` incluido en `result_data`
- ✅ No guarda narrativa

**Hallazgo 10**: Extracción de summary puede fallar
- **Línea**: 279-282
- **Problema**: Si `result_dict.get('houses', {})` está vacío, `.get('1', {})` puede fallar
- **Riesgo**: `KeyError` si estructura no es la esperada
- **Solución**: Usar `.get('1', {}).get('sign', 'N/A')` con valores por defecto anidados

### 6. RESPUESTA ESTABLE ⚠️
**Archivo**: `backend/api/cabalistic_views.py:294-300`

**Hallazgo 11**: Formato correcto pero inconsistente con otros endpoints
- **Línea**: 296-299
- ✅ Retorna `{analysis_id, status}` como se requiere
- ⚠️ Otros endpoints retornan más información (ej: `created_at`)
- **Nota**: Si es intencional, está bien

### 7. MANEJO DE ERRORES ⚠️
**Archivo**: `backend/api/cabalistic_views.py:303-312`

**Hallazgo 12**: Excepción genérica expone detalles al cliente
- **Línea**: 308-312
- **Problema**: `'details': str(e)` puede exponer stacktrace
- **Riesgo**: Información sensible en respuesta HTTP
- **Solución**: Loggear error completo, retornar mensaje genérico

**Hallazgo 13**: No hay logging de errores
- **Problema**: Errores no se registran para debugging
- **Riesgo**: Imposible diagnosticar problemas en producción
- **Solución**: Agregar `import logging` y `logger.error()`

**Hallazgo 14**: `Patient.DoesNotExist` nunca se lanza
- **Línea**: 303-307
- **Problema**: `get_object_or_404` lanza `Http404`, no `DoesNotExist`
- **Riesgo**: Código muerto, nunca se ejecuta
- **Solución**: Eliminar o cambiar a capturar `Http404`

---

## C) HALLAZGOS (Lista Numerada)

1. **`cabalistic_views.py:233`**: Falta permiso `IsTherapist` - cualquier usuario autenticado puede acceder
2. **`cabalistic_views.py:255-259`**: Excepción genérica puede exponer detalles de Pydantic al cliente
3. **`cabalistic_views.py:262-266`**: Verifica `patient.birth_date` pero no la usa (validación redundante o falta usar)
4. **`cabalistic_views.py:279-282`**: Extracción de summary puede fallar si estructura JSON cambia
5. **`cabalistic_views.py:303-307`**: `Patient.DoesNotExist` nunca se lanza (usa `get_object_or_404`)
6. **`cabalistic_views.py:308-312`**: Excepción genérica expone `str(e)` al cliente (riesgo de seguridad)
7. **`cabalistic_views.py`**: No hay logging de errores para debugging
8. **`service.py:143-147`**: `except:` sin especificar excepción (poco específico)
9. **`service.py:71`**: Cálculo de `degree = position % 30` puede fallar si `position` es None

---

## D) RIESGOS

### Seguridad 🔴
- **Riesgo Alto**: Usuario personal puede crear análisis para pacientes (falta `IsTherapist`)
- **Riesgo Medio**: Stacktrace parcial expuesto en errores de validación
- **Riesgo Medio**: Detalles de excepciones internas expuestos al cliente

### Datos ⚠️
- **Riesgo Bajo**: Inconsistencia entre `patient.birth_date` e `input_data.birth_date`
- **Riesgo Bajo**: Si estructura JSON cambia, extracción de summary puede fallar

### Consistencia ⚠️
- **Riesgo Bajo**: Formato de respuesta diferente a otros endpoints (puede ser intencional)
- **Riesgo Bajo**: Manejo de errores inconsistente con otros endpoints del sistema

---

## E) PATCH MÍNIMO PROPUESTO

### Patch 1: Permisos y Logging
```python
# backend/api/cabalistic_views.py (líneas 1-15)
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.shortcuts import get_object_or_404
from django.http import Http404
import logging
from .models import Patient, CabalisticAnalysis
from .utils.tarot_service import analyze_archetype_vs_clinical
from .astrology_kerykeion.service import execute_kerykeion
from .astrology_kerykeion.schemas import KerykeionInputSchema
from .permissions import IsTherapist

logger = logging.getLogger(__name__)
```

### Patch 2: Corregir View
```python
# backend/api/cabalistic_views.py (líneas 227-312)
@method_decorator(csrf_exempt, name='dispatch')
class KerykeionAnalysisView(APIView):
    """
    Endpoint para calcular y guardar análisis Kerykeion
    Ruta: POST /api/therapist/patients/<id>/astrology-kerykeion/
    """
    permission_classes = [IsAuthenticated, IsTherapist]  # ✅ Agregado IsTherapist
    
    def post(self, request, id):
        """
        Calcula carta natal técnica Kerykeion y la guarda en CabalisticAnalysis
        
        Flujo:
        1. Validar input
        2. Ejecutar Kerykeion
        3. Guardar en CabalisticAnalysis
        4. Retornar analysis_id
        """
        try:
            # Obtener el usuario (solo si es del terapeuta actual)
            try:
                patient = Patient.objects.get(
                    id=id,
                    therapist=request.user
                )
            except Patient.DoesNotExist:
                return Response(
                    {'error': 'Usuario no encontrado o no tienes acceso'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Validar datos de entrada
            try:
                input_schema = KerykeionInputSchema(**request.data)
            except Exception as e:
                # Loggear error completo internamente
                logger.error(f"Error validando input Kerykeion para usuario {id}: {str(e)}", exc_info=True)
                # Retornar mensaje genérico al cliente
                error_msg = 'Datos de entrada inválidos'
                if hasattr(e, 'errors'):
                    # Si es ValidationError de Pydantic, extraer mensajes
                    error_details = []
                    for field, errors in e.errors():
                        error_details.append(f"{field}: {', '.join(str(err) for err in errors)}")
                    error_msg = f"{error_msg}. {'; '.join(error_details)}"
                return Response(
                    {'error': error_msg},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Ejecutar Kerykeion
            try:
                result = execute_kerykeion(input_schema)
            except Exception as e:
                # Loggear error completo internamente
                logger.error(f"Error ejecutando Kerykeion para usuario {id}: {str(e)}", exc_info=True)
                # Retornar mensaje genérico al cliente
                return Response(
                    {'error': 'Error al calcular carta natal. Por favor, verifica los datos de entrada.'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Guardar en CabalisticAnalysis
            try:
                result_dict = result.dict()
                houses_dict = result_dict.get('houses', {})
                asc_sign = houses_dict.get('1', {}).get('sign', 'N/A') if houses_dict else 'N/A'
                mc_sign = houses_dict.get('10', {}).get('sign', 'N/A') if houses_dict else 'N/A'
                
                analysis = CabalisticAnalysis.objects.create(
                    therapist=request.user,
                    patient=patient,
                    analysis_type='astrology-kerykeion',
                    input_data=input_schema.dict(),
                    result_data=result_dict,
                    summary=f"Kerykeion {result.engine_version}: ASC {asc_sign} - MC {mc_sign}",
                    therapist_notes='Generado automáticamente por Módulo Kerykeion - Fuente técnica objetiva'
                )
                
                logger.info(f"Análisis Kerykeion creado: ID {analysis.id} para usuario {patient.id} por terapeuta {request.user.id}")
                
            except Exception as e:
                logger.error(f"Error guardando análisis Kerykeion para usuario {id}: {str(e)}", exc_info=True)
                return Response(
                    {'error': 'Error al guardar el análisis'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Retornar analysis_id (formato limpio)
            return Response(
                {
                    'analysis_id': analysis.id,
                    'status': 'ok'
                },
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            # Catch-all para errores inesperados
            logger.error(f"Error inesperado en KerykeionAnalysisView para usuario {id}: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Error interno del servidor'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
```

### Patch 3: Mejorar service.py
```python
# backend/api/astrology_kerykeion/service.py (líneas 143-147)
    # Obtener versión de Kerykeion
    try:
        import kerykeion
        engine_version = getattr(kerykeion, '__version__', input_data.engine_version or '1.0.0')
    except (ImportError, AttributeError):  # ✅ Especificar excepciones
        engine_version = input_data.engine_version or '1.0.0'
```

### Patch 4: Validar position en service.py
```python
# backend/api/astrology_kerykeion/service.py (líneas 65-76)
    # Extraer posiciones planetarias reales
    planets_data = {}
    for planet_name, planet_obj in subject.planets.items():
        # Kerykeion devuelve el signo y la posición (longitud eclíptica)
        position = planet_obj.position
        sign = planet_obj.sign
        
        # Validar que position no sea None
        if position is None:
            continue  # Saltar planetas sin posición válida
        
        # Calcular grado dentro del signo (0-29.99)
        degree = position % 30
        
        planets_data[planet_name] = {
            'sign': sign_map.get(sign, sign),
            'degree': round(degree, 2)
        }
```

---

## F) RESUMEN DE CORRECCIONES CRÍTICAS

### 🔴 CRÍTICO (Aplicar inmediatamente):
1. Agregar `IsTherapist` permission class
2. Eliminar exposición de stacktrace al cliente
3. Agregar logging de errores

### ⚠️ IMPORTANTE (Aplicar pronto):
4. Mejorar manejo de excepciones de Pydantic
5. Validar `position` no sea None en service
6. Corregir manejo de `Patient.DoesNotExist`

### ✅ OPCIONAL (Mejoras):
7. Validar consistencia entre `patient.birth_date` e `input_data.birth_date`
8. Mejorar extracción de summary con validación robusta

---

## G) VERIFICACIÓN FINAL

- ✅ No modifica modelos existentes
- ✅ No crea nuevas tablas
- ✅ No renombra analysis_type existentes
- ✅ Usa Kerykeion real (AstrologicalSubject + KerykeionChartSVG)
- ⚠️ Necesita correcciones de seguridad y logging

