# Utilidades para Tests Psicológicos

Este módulo contiene las utilidades para el procesamiento de tests psicológicos con análisis clínico y cabalístico.

## Archivos

- `clinical_scorer.py`: Motor de calificación clínica con baremos estandarizados
- `test_mappings.py`: Mapeos cabalísticos (Sefirot, Ángeles, Conceptos) para cada test

## Uso en Views de Django

### Importación

```python
from api.utils import ClinicalScorer, TEST_LINKS
```

### Ejemplo de uso en una View

```python
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.utils import ClinicalScorer, TEST_LINKS

class ProcessTestView(APIView):
    def post(self, request):
        test_id = request.data.get('test_id')
        answers = request.data.get('answers', [])
        
        # Calcular score clínico
        scorer = ClinicalScorer()
        clinical_result = scorer.calcular_score(test_id, answers)
        
        # Obtener mapeo cabalístico
        if test_id in TEST_LINKS:
            kabbalah_mapping = TEST_LINKS[test_id]
            
            return Response({
                'clinical': clinical_result,
                'kabbalah': {
                    'sefira': kabbalah_mapping['sefira_id'],
                    'organo': kabbalah_mapping['organo_ref_id'],
                    'concepto': kabbalah_mapping['concepto_clave_id'],
                    'angel_idx': kabbalah_mapping['angel_remedio_idx'],
                    'bio_desc': kabbalah_mapping['bio_desc']
                }
            })
        
        return Response({'error': 'Test no encontrado'}, status=status.HTTP_404_NOT_FOUND)
```

## Tests Disponibles

El sistema soporta los siguientes tests:

- `phq-9`: Depresión (PHQ-9)
- `gad-7`: Ansiedad (GAD-7)
- `bdi-ii`: Depresión de Beck (BDI-II)
- `bai`: Ansiedad de Beck (BAI)
- `ptsd`: Estrés Postraumático (PTSD)
- `ocd`: Obsesivo-Compulsivo (OCD)
- `insomnia`: Índice de Insomnio
- `scl-90-r`: SCL-90-R (Psicopatología)
- `stai`: STAI (Ansiedad Estado-Rasgo)
- `pai`: Evaluación Personalidad (PAI)
- `scid-5-rv`: Entrevista Estructurada (SCID-5)
- `adhd`: Screening TDAH Adultos
- `substance`: Screening Sustancias
- `eating`: Screening Trastornos Alimentarios
- `ptsd-pcl5`: Evaluación Clínica PTSD (PCL-5)

## Estructura de Respuesta

### ClinicalScorer.calcular_score()

```python
{
    "score_bruto": 18,  # int o float
    "diagnostico_clinico": "Depresión Moderadamente Severa"  # str
}
```

### TEST_LINKS[test_id]

```python
{
    "test_name": "Depresión (PHQ-9)",
    "sefira_id": "sef_127",
    "organo_ref_id": "cue_1",
    "concepto_clave_id": "con_160",
    "angel_remedio_idx": 42,
    "bio_desc": "Sensación de vacío y falta de luz reflejada."
}
```

