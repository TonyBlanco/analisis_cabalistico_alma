# Test de Bienestar Integral

## 📋 Descripción General

El **Test de Bienestar Integral** es una herramienta de evaluación holística diseñada para identificar desequilibrios en los principales sistemas corporales mediante 38 preguntas científicamente fundamentadas.

## 🎯 Características Principales

### 1. Evaluación Completa de 6 Sistemas Corporales

- **Sistema Digestivo** (8 preguntas)
  - Hinchazón, estreñimiento, acidez
  - Pesadez, gases, náuseas
  - Falta de apetito, dolor abdominal

- **Sistema Nervioso** (8 preguntas)
  - Ansiedad, dificultad de concentración
  - Insomnio, dolores de cabeza
  - Estrés, cambios de humor
  - Temblores, fatiga mental

- **Sistema Circulatorio** (6 preguntas)
  - Palpitaciones, extremidades frías
  - Presión arterial, varices
  - Mareos, dolor en el pecho

- **Sistema Respiratorio** (6 preguntas)
  - Dificultad para respirar
  - Tos crónica, congestión nasal
  - Alergias, falta de aire
  - Opresión en el pecho

- **Sistema Esquelético** (5 preguntas)
  - Dolor en articulaciones
  - Rigidez matinal
  - Dolor de espalda
  - Crujidos, problemas de postura

- **Sistema Muscular** (5 preguntas)
  - Calambres musculares
  - Tensión, contracturas
  - Debilidad muscular
  - Dolor post-ejercicio, fatiga

### 2. Sistema de Puntuación de 4 Niveles

Cada pregunta se responde con una escala de frecuencia:

- **0 puntos**: Nunca o Casi Nunca (No experimento este síntoma)
- **1 punto**: Ocasionalmente (Algunas veces al mes)
- **2 puntos**: Frecuentemente (Varias veces por semana)
- **3 puntos**: Constantemente (Todos los días)

### 3. Interpretación de Resultados

Los resultados se expresan en porcentaje por sistema:

| Porcentaje | Estado | Color | Interpretación |
|------------|--------|-------|----------------|
| 0-25% | Óptimo | Verde | Sistema funcionando perfectamente |
| 26-50% | Normal | Azul | Síntomas leves ocasionales |
| 51-75% | Regular | Naranja | Requiere atención y seguimiento |
| 76-100% | Crítico | Rojo | Atención prioritaria necesaria |

### 4. Visualización con Imágenes Anatómicas

Cada sistema incluye una **representación visual SVG** del área corporal afectada:

- **Digestivo**: Estómago, intestinos, hígado
- **Nervioso**: Cerebro, médula espinal, sistema nervioso periférico
- **Circulatorio**: Corazón, arterias, venas
- **Respiratorio**: Pulmones, tráquea, bronquios
- **Esquelético**: Huesos, articulaciones, columna vertebral
- **Muscular**: Grupos musculares principales

### 5. Panel de Atención Prioritaria

Los sistemas con puntuación **Regular (51-75%)** o **Crítica (76-100%)** se destacan automáticamente en un panel especial para:
- Identificación rápida de áreas problemáticas
- Priorización de atención médica
- Seguimiento específico de sistemas comprometidos

## 🎨 Diseño Visual

### Barras de Progreso Codificadas por Color
- Verde (Óptimo): 0-25%
- Azul (Normal): 26-50%
- Naranja (Regular): 51-75%
- Rojo (Crítico): 76-100%

### Indicadores de Estado
Cada sistema muestra:
- Barra de progreso animada
- Puntuación numérica (score/maxScore)
- Porcentaje calculado
- Estado textual (Óptimo/Normal/Regular/Crítico)
- Imagen anatómica del sistema
- 4 rangos visuales con highlight del rango actual

## 📊 Flujo de Usuario

1. **Introducción**: Información sobre el test y beneficios
2. **38 Preguntas**: Una por una con barra de progreso
3. **Navegación**: Posibilidad de volver a pregunta anterior
4. **Resultados Visuales**:
   - Panel de atención prioritaria (si aplica)
   - Resultado detallado por cada sistema con imagen
   - Botón para reiniciar el test

## 💡 Casos de Uso

### Para Usuarios Personales
- Autoconocimiento de su estado de salud
- Identificación temprana de desequilibrios
- Seguimiento periódico de su bienestar
- Preparación para consultas médicas

### Para Profesionales de la Salud
- Herramienta de screening inicial
- Seguimiento de pacientes entre consultas
- Documentación de evolución sintomática
- Base objetiva para recomendaciones

### Para Terapeutas Holísticos
- Evaluación integral del paciente
- Identificación de patrones sistémicos
- Priorización de tratamientos
- Seguimiento de efectividad de terapias

## 🔧 Implementación Técnica

### Componentes
- `WellnessAnalysis.tsx`: Componente principal del test
- `/app/wellness/page.tsx`: Página dedicada con información contextual

### Datos
```typescript
const QUESTIONS: Question[] = [
  { id: 1, text: '¿Pregunta?', system: 'Digestivo' },
  // ... 38 preguntas
];
```

### Lógica de Cálculo
```typescript
percentage = (totalScore / maxPossibleScore) * 100
maxPossibleScore = numberOfQuestions * 3
```

## ⚠️ Consideraciones Importantes

### Disclaimer Médico
**Este test NO sustituye el diagnóstico médico profesional.**
- Es una herramienta de autoconocimiento y orientación
- Los resultados son indicativos, no diagnósticos
- Síntomas graves o persistentes requieren consulta profesional
- No debe usarse para automedicación

### Privacidad
- Los resultados NO se almacenan en base de datos
- Todo el procesamiento es local en el navegador
- El usuario puede compartir resultados voluntariamente

## 🚀 Acceso

- **URL**: `/wellness`
- **Acceso**: Gratuito para todos los usuarios
- **Duración**: 5-7 minutos
- **Navegación**: Incluido en menú principal con ícono Activity (❤️)

## 📈 Mejoras Futuras

1. **Almacenamiento de Historial**: Seguimiento de resultados en el tiempo
2. **Exportación de Reportes**: PDF con resultados y gráficos
3. **Recomendaciones Personalizadas**: Según sistemas afectados
4. **Integración con Profesionales**: Compartir resultados con terapeuta
5. **Más Sistemas**: Endocrino, Inmunológico, Reproductivo
6. **Versión Extendida**: 72 preguntas para evaluación profunda
7. **Imágenes Reales**: Ilustraciones anatómicas profesionales
8. **Múltiples Idiomas**: Español, Inglés, Portugués

## 🎓 Base Científica

El test se basa en:
- Cuestionarios clínicos validados (PAI, MCMI-IV)
- Escalas de síntomas somáticos (SSS-8)
- Evaluaciones de sistemas corporales estándar
- Metodología de screening de salud integral

## 📞 Soporte

Para dudas o sugerencias sobre el Test de Bienestar Integral, contactar al equipo de desarrollo del proyecto Kabbalah Aplicada.

---

**Versión**: 1.0.0  
**Fecha de Creación**: Diciembre 9, 2024  
**Estado**: Producción  
**Acceso**: Gratuito
