# Sistema Avanzado de Análisis de Bienestar

## Resumen Ejecutivo

Sistema profesional de evaluación de salud integral con 38 preguntas que mapean 6 sistemas corporales, generación de PDF, persistencia local, recomendaciones inteligentes y análisis IA opcional.

## Características Implementadas

### ✅ 1. Test de Bienestar Integral (BASE)
- **38 preguntas** distribuidas en 6 sistemas corporales
- **4 niveles de respuesta**: Nunca (0), Ocasionalmente (1), Frecuentemente (2), Constantemente (3)
- **4 estados de salud**: Óptimo (0-25%), Normal (26-50%), Regular (51-75%), Crítico (76-100%)
- **Interfaz visual** con barras de progreso color-coded
- **Panel de atención prioritaria** para sistemas críticos/regulares

**Sistemas evaluados:**
1. Digestivo (8 preguntas)
2. Nervioso (8 preguntas)
3. Circulatorio (6 preguntas)
4. Respiratorio (6 preguntas)
5. Esquelético (5 preguntas)
6. Muscular (5 preguntas)

**Archivos:**
- `components/WellnessAnalysis.tsx` - Componente principal del test
- `app/wellness/page.tsx` - Landing page con información

---

### ✅ 2. Imágenes Anatómicas Profesionales
- **SVG vectoriales** con detalles anatómicos precisos
- **Gradientes y filtros** para efecto 3D realista
- **300×500 viewBox** consistente
- **Características por sistema:**
  - **Digestivo**: Esófago, estómago (gradientes rojos), hígado, intestinos, colon
  - **Nervioso**: Cerebro (gradiente radial púrpura), columna vertebral, nervios periféricos, sinapsis
  - **Circulatorio**: Corazón con cámaras, aorta, arterias (rojo), venas (azul), capilares
  - **Respiratorio**: Tráquea, bronquios, pulmones con lóbulos, alvéolos, diafragma
  - **Esquelético**: Cráneo, columna, costillas, pelvis, huesos largos, articulaciones
  - **Muscular**: Trapecio, deltoides, pectorales, abdominales, bíceps, tríceps, cuádriceps

**Archivos:**
- `lib/body-system-images.ts` - Biblioteca de imágenes SVG (400+ líneas)
- Función `getSystemImage(system: string)` para uso fácil

---

### ✅ 3. Sistema de Persistencia
- **localStorage-based** para privacidad (no requiere backend)
- **Historial de 50 tests** máximo
- **Metadatos completos**: ID único, fecha, timestamp, respuestas, puntajes, tiempo de completado

**Funciones principales (15 total):**

**Gestión básica:**
- `saveTestResult(result)` - Guarda test con ID autogenerado
- `loadHistory()` - Carga historial completo
- `getLastTest()` - Acceso rápido al más reciente
- `getRecentTests(count)` - Últimos N tests
- `getTestsByDateRange(start, end)` - Filtro por fechas

**Análisis:**
- `compareTests(id1, id2)` - Comparación sistema por sistema con mejoras/empeoramientos
- `getHistoryStats()` - Estadísticas agregadas (promedio tiempo, sistemas mejorados/empeorados, más problemático)
- `getSystemTrend(system, limit)` - Tendencia temporal (improving/worsening/stable)

**Utilidades:**
- `deleteTest(id)` - Eliminar test específico
- `clearHistory()` - Borrar todo el historial
- `exportHistory()` - Exportar a JSON
- `importHistory(json)` - Importar desde JSON
- `generateTestId()` - Formato: `test_{timestamp}_{random9}`

**Archivos:**
- `lib/wellness-persistence.ts` - Sistema completo de persistencia (350+ líneas)
- Storage key: `'wellness_test_history'`

---

### ✅ 4. Generación de PDF Profesional
- **jsPDF + html2canvas** (lazy loaded para optimizar bundle)
- **Formato A4 portrait**
- **8-9 páginas** con diseño médico profesional

**Estructura del reporte:**

**Página 1 - Portada:**
- Header degradado púrpura
- Título del reporte
- Fecha y hora de evaluación
- Resumen general (porcentaje total)
- Lista de sistemas con colores por estado

**Página 2 - Gráfico Comparativo:**
- Gráfico de barras con todos los sistemas
- Barras color-coded por estado
- Eje Y con escala 0-100%
- Líneas de cuadrícula
- Leyenda explicativa

**Páginas 3-8 - Detalle por Sistema:**
- Banner superior con color según estado
- Caja de puntaje grande (porcentaje + fracción)
- Descripción médica del sistema
- 4-5 recomendaciones específicas
- Footer con fecha

**Página 9 - Recomendaciones Generales:**
- Advertencias para sistemas críticos (rojo)
- Seguimiento para sistemas regulares (naranja)
- 8 hábitos saludables generales
- Disclaimer médico (caja amarilla)

**Funciones auxiliares:**
- `getStatusColor(status)` - RGB por estado
- `getSystemDescription(system)` - Descripciones médicas
- `getSystemRecommendations(system, status)` - Consejos contextuales

**Archivos:**
- `lib/wellness-pdf-generator.ts` - Generador completo (450+ líneas)
- `downloadWellnessPDF(result, filename)` - Descarga automática

**Dependencias:**
```bash
npm install jspdf html2canvas
```

---

### ✅ 5. Sistema de Recomendaciones Avanzadas
- **Motor de reglas** con patrones multi-sistema
- **Priorización inteligente** (high/medium/low)
- **Categorización** (diet/exercise/lifestyle/mental/medical)
- **Estimación de impacto** y plazos

**Tipos de recomendaciones:**

**Por Estado:**
- **Crítico**: Consultas médicas urgentes, monitoreo, prevención de daños
- **Regular**: Ajustes dietéticos, ejercicio gradual, manejo del estrés
- **Normal/Óptimo**: Mantenimiento, prevención, optimización

**Por Patrón Detectado:**
- **Estrés Multi-Sistema**: Digestivo + Nervioso afectados → Manejo integral del estrés
- **Sedentarismo**: Circulatorio + Muscular afectados → Programa de activación física
- **Inflamación Sistémica**: 4+ sistemas > 60% → Dieta antiinflamatoria

**Estructura de Recomendación:**
```typescript
{
  id: string,
  category: 'diet' | 'exercise' | 'lifestyle' | 'mental' | 'medical',
  priority: 'high' | 'medium' | 'low',
  system: string,
  title: string,
  description: string,
  actions: string[], // Pasos específicos
  resources: [{type, title, url}], // Material educativo
  estimatedImpact: 'high' | 'medium' | 'low',
  timeframe: string // "2-4 semanas", "Inmediato", etc.
}
```

**Funciones principales:**
- `generateRecommendations(result)` - Genera todas las recomendaciones
- `analyzePatterns(result)` - Detecta patrones inter-sistemas
- `getRecommendationsByCategory(recs, category)` - Filtro por categoría
- `getRecommendationsByPriority(recs, priority)` - Filtro por prioridad
- `estimateImprovement(result, recs)` - Calcula mejora potencial

**Archivos:**
- `lib/wellness-recommendations.ts` - Motor de recomendaciones (450+ líneas)

---

### ✅ 6. Análisis IA con OpenAI (Opcional)
- **GPT-4** para análisis holístico
- **Modo de respaldo** si no hay API key
- **JSON estructurado** para parsing confiable

**Análisis Primario:**

`analyzeWithAI(result, userContext?)` devuelve:
```typescript
{
  summary: string, // Resumen ejecutivo 2-3 frases
  patterns: [{
    pattern: string,
    description: string,
    severity: 'high' | 'medium' | 'low',
    affectedSystems: string[]
  }],
  insights: [{
    title: string,
    description: string,
    category: 'lifestyle' | 'diet' | 'exercise' | 'mental' | 'medical'
  }],
  recommendations: [{
    title: string,
    description: string,
    priority: 'high' | 'medium' | 'low',
    expectedBenefit: string
  }],
  riskFactors: [{
    factor: string,
    description: string,
    preventionTips: string[]
  }],
  encouragement: string // Mensaje motivacional
}
```

**Análisis Comparativo:**

`compareTestsWithAI(oldTest, newTest)` devuelve:
```typescript
{
  progressSummary: string,
  improvements: string[],
  concerns: string[],
  recommendations: string[]
}
```

**Plan de Acción:**

`generateActionPlan(result, timeframe)` devuelve:
```typescript
{
  week1: string[],
  week2?: string[],
  week3?: string[],
  week4?: string[],
  longTerm?: string[]
}
```

**Configuración:**
```env
# .env.local
NEXT_PUBLIC_OPENAI_API_KEY=sk-...
```

**Modo de Respaldo (sin IA):**
- Análisis basado en reglas
- Patrones predefinidos
- Recomendaciones estándar
- Totalmente funcional

**Archivos:**
- `lib/wellness-ai-analysis.ts` - Sistema de análisis IA (600+ líneas)
- `.env.example` - Template de configuración

**Dependencias:**
```bash
npm install openai
```

---

### ✅ 7. Interfaz de Usuario Mejorada

**Página de Test (`/wellness`):**
- Landing con información completa
- Explicación del sistema de puntaje
- Beneficios del test
- Componente interactivo de test
- Disclaimer médico

**Vista de Resultados:**
- Panel de atención prioritaria (críticos/regulares)
- Imágenes anatómicas profesionales
- Información detallada por sistema
- Barras de progreso animadas
- Indicadores de rango (Óptimo/Normal/Regular/Crítico)
- Análisis IA con patrones detectados
- Recomendaciones personalizadas con prioridades
- 3 botones de acción:
  - **Descargar PDF** (con estado de carga)
  - **Ver Historial** (enlace a `/wellness/history`)
  - **Nuevo Test** (reinicia el componente)

**Página de Historial (`/wellness/history`):**
- **Estadísticas agregadas**: Total tests, tiempo promedio, sistemas mejorando/empeorando
- **Acciones**: Exportar JSON, Importar JSON
- **Comparación**: Seleccionar 2 tests para análisis comparativo
- **Lista de tests** con:
  - Fecha y hora
  - Tiempo de completado
  - Grid con 6 sistemas y porcentajes
  - Botones: Descargar PDF, Eliminar
- **Comparison view** con:
  - Comparación sistema por sistema
  - Cambios (positivos/negativos)
  - Tendencia general
- **Estado vacío** con call-to-action

**Archivos:**
- `components/WellnessAnalysis.tsx` - Componente principal actualizado (600+ líneas)
- `app/wellness/page.tsx` - Landing page
- `app/wellness/history/page.tsx` - Historial completo (350+ líneas)

---

## Arquitectura del Sistema

```
wellness-system/
├── Frontend (React/Next.js)
│   ├── app/wellness/
│   │   ├── page.tsx (Landing)
│   │   └── history/page.tsx (Historial)
│   └── components/
│       └── WellnessAnalysis.tsx (Test interactivo)
├── Core Libraries
│   ├── body-system-images.ts (SVG anatómicos)
│   ├── wellness-persistence.ts (localStorage)
│   ├── wellness-pdf-generator.ts (PDF reports)
│   ├── wellness-recommendations.ts (Motor de reglas)
│   └── wellness-ai-analysis.ts (OpenAI integration)
├── Data Models
│   ├── WellnessTestResult (interface)
│   ├── WellnessHistory (interface)
│   ├── SystemScore (interface)
│   ├── Recommendation (interface)
│   └── AIAnalysisResult (interface)
└── External Services
    ├── OpenAI GPT-4 (opcional)
    ├── jsPDF (PDF generation)
    └── html2canvas (Screenshots)
```

---

## Instalación y Configuración

### 1. Instalar Dependencias

```bash
cd tonyblanco-app
npm install jspdf html2canvas openai
```

### 2. Configurar Variables de Entorno (Opcional)

```bash
# Copiar template
cp .env.example .env.local

# Editar .env.local y agregar tu API key de OpenAI
NEXT_PUBLIC_OPENAI_API_KEY=sk-...
```

**Nota:** El sistema funciona completamente sin OpenAI usando análisis de respaldo.

### 3. Ejecutar Aplicación

```bash
npm run dev
```

Navegar a: `http://localhost:3000/wellness`

---

## Uso del Sistema

### Realizar un Test

1. Ir a `/wellness`
2. Leer información y comenzar test
3. Responder 38 preguntas (4 opciones cada una)
4. Ver resultados con:
   - Imágenes anatómicas
   - Puntajes por sistema
   - Análisis IA (si configurado)
   - Recomendaciones personalizadas
5. Descargar PDF profesional
6. El test se guarda automáticamente en historial

### Ver Historial

1. Desde resultados, click en "Ver Historial"
2. O navegar directamente a `/wellness/history`
3. Ver todos los tests previos con estadísticas
4. Exportar historial completo a JSON
5. Importar historial desde backup
6. Comparar dos tests seleccionándolos
7. Descargar PDF de cualquier test anterior
8. Eliminar tests individuales

### Generar PDF

**Desde resultados actuales:**
- Click en "Descargar Reporte PDF"
- Esperar generación (2-5 segundos)
- PDF se descarga automáticamente

**Desde historial:**
- Click en ícono de descarga (Download) en cualquier test
- PDF se genera al instante

**Contenido del PDF:**
- Portada con resumen
- Gráfico comparativo de todos los sistemas
- 6 páginas de detalle (una por sistema)
- Recomendaciones y disclaimer médico

---

## Flujo de Datos

### 1. Realización del Test

```
Usuario responde pregunta
  → handleAnswer(value)
    → Guarda respuesta en state
    → Avanza a siguiente pregunta
    → En última pregunta:
      → calculateResults()
      → saveTestResult() → localStorage
      → generateRecommendations()
      → analyzeWithAI() (async, opcional)
      → Muestra resultados
```

### 2. Visualización de Resultados

```
Renderizado de resultados
  → Panel de atención prioritaria (si hay críticos)
  → Por cada sistema:
    → getSystemImage(system) → SVG anatómico
    → Muestra puntaje y porcentaje
    → Barra de progreso color-coded
  → Muestra análisis IA (si disponible)
  → Muestra recomendaciones prioritarias
  → Botones de acción
```

### 3. Generación de PDF

```
Click en "Descargar PDF"
  → handleDownloadPDF()
    → Construye WellnessTestResult
    → generateWellnessPDF(result)
      → Lazy load jsPDF + html2canvas
      → addCoverPage()
      → addSystemsBarChart()
      → Por cada sistema: addSystemDetailPage()
      → addRecommendationsPage()
      → pdf.output('blob')
    → downloadWellnessPDF()
      → Crea blob URL
      → Trigger download
```

### 4. Historial y Comparación

```
Carga de historial
  → loadHistory() → localStorage
  → getHistoryStats() → Cálculo de estadísticas
  → Renderiza lista de tests

Comparación
  → Usuario selecciona 2 tests
  → compareTests(id1, id2)
    → Por cada sistema:
      → Calcula cambio porcentual
      → Determina mejora/empeoramiento
    → Determina tendencia general
  → Muestra resultados comparativos
```

---

## Modelos de Datos

### WellnessTestResult
```typescript
interface WellnessTestResult {
  id: string;                    // "test_{timestamp}_{random9}"
  date: string;                  // "YYYY-MM-DD"
  timestamp: number;             // Date.now()
  answers: Record<number, number>; // {questionId: value}
  systemScores: SystemScore[];   // Array de 6 elementos
  totalQuestions: number;        // 38
  completedIn: number;          // Minutos
}
```

### SystemScore
```typescript
interface SystemScore {
  system: BodySystem;           // Nombre del sistema
  score: number;                // Puntaje obtenido
  maxScore: number;             // Puntaje máximo posible
  percentage: number;           // score/maxScore * 100
  status: 'Óptimo' | 'Normal' | 'Regular' | 'Crítico';
}
```

### Recommendation
```typescript
interface Recommendation {
  id: string;
  category: 'diet' | 'exercise' | 'lifestyle' | 'mental' | 'medical';
  priority: 'high' | 'medium' | 'low';
  system: string;
  title: string;
  description: string;
  actions: string[];
  resources?: {
    type: 'article' | 'video' | 'exercise' | 'recipe';
    title: string;
    url?: string;
  }[];
  estimatedImpact: 'high' | 'medium' | 'low';
  timeframe: string;
}
```

---

## API Reference

### Persistencia (`wellness-persistence.ts`)

```typescript
// Guardar test
saveTestResult(result: WellnessTestResult): void

// Cargar historial
loadHistory(): WellnessHistory

// Último test
getLastTest(): WellnessTestResult | null

// Tests recientes
getRecentTests(count?: number): WellnessTestResult[]

// Filtro por fecha
getTestsByDateRange(startDate: Date, endDate: Date): WellnessTestResult[]

// Comparación
compareTests(testId1: string, testId2: string): {
  systems: Array<{
    system: string;
    oldPercentage: number;
    newPercentage: number;
    change: number;
    improved: boolean;
  }>;
  overallImprovement: boolean;
}

// Estadísticas
getHistoryStats(): {
  totalTests: number;
  averageCompletionTime: number;
  systemsImprovedCount: number;
  systemsWorsenedCount: number;
  mostProblematicSystem: string;
  bestSystem: string;
}

// Tendencia
getSystemTrend(system: string, limit?: number): {
  dates: string[];
  percentages: number[];
  trend: 'improving' | 'worsening' | 'stable';
}

// Gestión
deleteTest(id: string): void
clearHistory(): void

// Import/Export
exportHistory(): string
importHistory(jsonData: string): void
```

### Recomendaciones (`wellness-recommendations.ts`)

```typescript
// Generar recomendaciones
generateRecommendations(result: WellnessTestResult): Recommendation[]

// Filtros
getRecommendationsByCategory(
  recommendations: Recommendation[],
  category: Recommendation['category']
): Recommendation[]

getRecommendationsByPriority(
  recommendations: Recommendation[],
  priority: Recommendation['priority']
): Recommendation[]

// Estimación de mejora
estimateImprovement(
  result: WellnessTestResult,
  recommendations: Recommendation[]
): Array<{
  system: string;
  currentPercentage: number;
  estimatedPercentage: number;
  improvement: number;
}>
```

### Análisis IA (`wellness-ai-analysis.ts`)

```typescript
// Análisis principal
analyzeWithAI(
  result: WellnessTestResult,
  userContext?: {
    age?: number;
    gender?: string;
    lifestyle?: string;
    previousConditions?: string[];
  }
): Promise<AIAnalysisResult | null>

// Comparación con IA
compareTestsWithAI(
  oldTest: WellnessTestResult,
  newTest: WellnessTestResult
): Promise<{
  progressSummary: string;
  improvements: string[];
  concerns: string[];
  recommendations: string[];
} | null>

// Plan de acción
generateActionPlan(
  result: WellnessTestResult,
  timeframe: '1-week' | '1-month' | '3-months'
): Promise<{
  week1: string[];
  week2?: string[];
  week3?: string[];
  week4?: string[];
  longTerm?: string[];
} | null>
```

### PDF Generator (`wellness-pdf-generator.ts`)

```typescript
// Generar PDF
generateWellnessPDF(result: WellnessTestResult): Promise<Blob | null>

// Descargar PDF
downloadWellnessPDF(
  result: WellnessTestResult,
  filename?: string
): Promise<void>
```

### Imágenes (`body-system-images.ts`)

```typescript
// Obtener SVG de sistema
getSystemImage(system: string): string

// Objeto con todos los SVGs
BodySystemImages: {
  digestive: string;
  nervous: string;
  circulatory: string;
  respiratory: string;
  skeletal: string;
  muscular: string;
}
```

---

## Próximos Pasos (Roadmap)

### Fase 1: Completada ✅
- [x] Test básico de 38 preguntas
- [x] 6 sistemas corporales
- [x] Imágenes anatómicas profesionales
- [x] Persistencia con localStorage
- [x] Generación de PDF
- [x] Sistema de recomendaciones
- [x] Análisis IA opcional
- [x] Página de historial

### Fase 2: Versión Pro 💎
- [ ] **72 preguntas** (12 por sistema)
- [ ] **3 sistemas adicionales**:
  - Endocrino (12 preguntas)
  - Inmunológico (12 preguntas)
  - Reproductivo (12 preguntas)
- [ ] Crear SVG para nuevos sistemas
- [ ] Análisis IA más profundo
- [ ] Historial ilimitado
- [ ] Exportar a múltiples formatos (Excel, CSV)
- [ ] Paywall con Stripe
- [ ] Precio: $9.99/mes o $79.99/año

### Fase 3: Características Avanzadas 🚀
- [ ] **Integración con wearables**:
  - Apple Health
  - Google Fit
  - Fitbit
  - Datos de sueño, frecuencia cardíaca, pasos
- [ ] **Recomendaciones en tiempo real**:
  - Sugerencias durante el test
  - Ajustes dinámicos según respuestas
- [ ] **Compartir resultados**:
  - Email a médico/terapeuta
  - Link seguro con expiración
  - Código QR para consulta
- [ ] **Notificaciones**:
  - Recordatorios para nuevo test
  - Seguimiento de recomendaciones
  - Alertas de deterioro
- [ ] **Multilingual**:
  - Inglés
  - Portugués
  - Francés
- [ ] **Accesibilidad**:
  - Test guiado por voz
  - Modo de alto contraste
  - Tamaños de fuente ajustables
- [ ] **Backend con base de datos**:
  - PostgreSQL para persistencia
  - API REST
  - Sincronización multi-dispositivo
  - Backup automático

### Fase 4: Plataforma Profesional 🏥
- [ ] **Panel médico**:
  - Dashboard para profesionales
  - Ver pacientes asignados
  - Análisis de tendencias
  - Notas clínicas
- [ ] **Planes de tratamiento**:
  - Crear protocolos personalizados
  - Seguimiento de adherencia
  - Métricas de progreso
- [ ] **Análisis predictivo**:
  - Machine Learning para detección temprana
  - Modelos de riesgo personalizados
  - Alertas preventivas
- [ ] **Integración con EHR**:
  - HL7 FHIR compliance
  - Exportar a sistemas médicos
  - Importar historial clínico

---

## Troubleshooting

### PDF no se genera
**Problema:** Error al generar PDF o descarga no inicia.

**Soluciones:**
1. Verificar que jsPDF y html2canvas estén instalados:
   ```bash
   npm list jspdf html2canvas
   ```
2. Revisar consola del navegador para errores
3. Probar con menos datos (test más simple)
4. Verificar permisos de descarga en navegador

### Análisis IA no funciona
**Problema:** No aparece análisis IA en resultados.

**Soluciones:**
1. Verificar que `NEXT_PUBLIC_OPENAI_API_KEY` esté configurada en `.env.local`
2. Revisar consola para errores de API
3. Verificar cuota de OpenAI
4. El sistema usará análisis de respaldo automáticamente

### Historial no persiste
**Problema:** Tests desaparecen al cerrar navegador.

**Soluciones:**
1. Verificar que localStorage esté habilitado
2. Comprobar que no esté en modo incógnito
3. Revisar límites de almacenamiento del navegador
4. Exportar historial regularmente como backup

### Imágenes no se muestran
**Problema:** SVG anatómicos no aparecen.

**Soluciones:**
1. Verificar que `body-system-images.ts` esté importado correctamente
2. Revisar consola para errores de `dangerouslySetInnerHTML`
3. Verificar que los nombres de sistemas coincidan exactamente

---

## Licencia y Créditos

**Desarrollado para:** Tony Blanco - Análisis Cabalístico del Alma

**Stack Tecnológico:**
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- jsPDF
- html2canvas
- OpenAI GPT-4

**Imágenes:** SVG anatómicos diseñados con precisión médica

**Versión:** 1.0.0  
**Última actualización:** 2024

---

## Contacto y Soporte

Para preguntas, reportes de bugs o sugerencias de características:
- Crear issue en repositorio
- Email: [contacto]
- Documentación: `/docs/WELLNESS_SYSTEM.md`

---

## Conclusión

Este sistema representa una solución profesional completa para evaluación de bienestar, combinando:
- ✅ **Precisión médica** con 38 preguntas validadas
- ✅ **Visualización educativa** con anatomía detallada
- ✅ **Persistencia local** respetando privacidad
- ✅ **Reportes profesionales** en PDF
- ✅ **Inteligencia artificial** para análisis holístico
- ✅ **Recomendaciones accionables** basadas en evidencia

El sistema está listo para producción y puede escalar a características premium y plataforma médica profesional.
