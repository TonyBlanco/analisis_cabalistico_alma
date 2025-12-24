# Sistema de Análisis de Bienestar - Guía Rápida

## 🎯 ¿Qué es?

Sistema profesional de evaluación de salud integral con:
- ✅ 38 preguntas sobre 6 sistemas corporales
- ✅ Imágenes anatómicas profesionales SVG
- ✅ Persistencia local (localStorage)
- ✅ Generación de PDF con reportes médicos
- ✅ Recomendaciones personalizadas basadas en reglas
- ✅ Análisis IA opcional con OpenAI GPT-4

## 🚀 Inicio Rápido

### 1. Instalar dependencias

```bash
cd tonyblanco-app
npm install jspdf html2canvas openai
```

### 2. Configurar OpenAI (Opcional)

```bash
# Crear .env.local
echo "NEXT_PUBLIC_OPENAI_API_KEY=sk-tu-key-aqui" > .env.local
```

**Nota:** El sistema funciona completamente sin OpenAI usando análisis de respaldo.

### 3. Ejecutar

```bash
npm run dev
```

Navegar a: **http://localhost:3000/wellness**

## 📁 Estructura de Archivos

```
lib/
├── body-system-images.ts          # SVG anatómicos (400 líneas)
├── wellness-persistence.ts         # localStorage (350 líneas)
├── wellness-pdf-generator.ts       # PDF reports (450 líneas)
├── wellness-recommendations.ts     # Motor de reglas (450 líneas)
└── wellness-ai-analysis.ts         # OpenAI integration (600 líneas)

components/
└── WellnessAnalysis.tsx            # Test interactivo (600 líneas)

app/wellness/
├── page.tsx                        # Landing page
└── history/page.tsx                # Historial completo (350 líneas)
```

## 🎨 Características Principales

### Test Interactivo
- 38 preguntas con 4 opciones cada una
- Barra de progreso en tiempo real
- Navegación adelante/atrás
- Tiempo de completado: 5-7 minutos

### Resultados Visuales
- Imágenes anatómicas de alta calidad
- Barras de progreso color-coded
- 4 niveles: Óptimo (verde), Normal (azul), Regular (naranja), Crítico (rojo)
- Panel de atención prioritaria

### Recomendaciones Inteligentes
- Basadas en estado de cada sistema
- Detección de patrones multi-sistema
- Priorización (alta/media/baja)
- Acciones específicas y plazos estimados

### Análisis IA (Opcional)
- Patrones de salud detectados
- Insights personalizados
- Factores de riesgo
- Mensaje motivacional

### Reportes PDF
- Portada con resumen
- Gráfico comparativo de todos los sistemas
- 6 páginas de detalle (una por sistema)
- Recomendaciones específicas
- Disclaimer médico

### Historial y Seguimiento
- Almacenamiento local ilimitado (hasta 50 tests)
- Estadísticas agregadas
- Comparación entre tests
- Análisis de tendencias
- Exportar/Importar JSON

## 📊 API Reference

### Persistencia

```typescript
import { 
  saveTestResult,
  loadHistory,
  getLastTest,
  compareTests,
  getHistoryStats,
  exportHistory,
  importHistory
} from '@/lib/wellness-persistence';

// Guardar nuevo test
saveTestResult(testResult);

// Cargar historial completo
const history = loadHistory();

// Último test
const last = getLastTest();

// Comparar dos tests
const comparison = compareTests('test_id_1', 'test_id_2');

// Estadísticas
const stats = getHistoryStats();
// { totalTests, averageCompletionTime, systemsImprovedCount, ... }

// Backup
const json = exportHistory();
importHistory(json);
```

### Recomendaciones

```typescript
import { 
  generateRecommendations,
  getRecommendationsByPriority,
  estimateImprovement
} from '@/lib/wellness-recommendations';

// Generar recomendaciones
const recommendations = generateRecommendations(testResult);

// Filtrar por prioridad
const highPriority = getRecommendationsByPriority(recommendations, 'high');

// Estimar mejora potencial
const improvements = estimateImprovement(testResult, recommendations);
```

### Análisis IA

```typescript
import { 
  analyzeWithAI,
  compareTestsWithAI,
  generateActionPlan
} from '@/lib/wellness-ai-analysis';

// Análisis principal
const analysis = await analyzeWithAI(testResult, {
  age: 35,
  gender: 'M',
  lifestyle: 'sedentary'
});

// Comparación con IA
const progress = await compareTestsWithAI(oldTest, newTest);

// Plan de acción
const plan = await generateActionPlan(testResult, '1-month');
```

### PDF

```typescript
import { 
  generateWellnessPDF,
  downloadWellnessPDF
} from '@/lib/wellness-pdf-generator';

// Generar blob
const pdfBlob = await generateWellnessPDF(testResult);

// Descargar directamente
await downloadWellnessPDF(testResult, 'mi-reporte.pdf');
```

### Imágenes

```typescript
import { getSystemImage } from '@/lib/body-system-images';

// Obtener SVG
const svg = getSystemImage('Digestivo');

// Renderizar en React
<div dangerouslySetInnerHTML={{ __html: svg }} />
```

## 🎯 Casos de Uso

### 1. Uso Personal
- Auto-evaluación de salud
- Seguimiento a lo largo del tiempo
- Identificación de áreas problemáticas
- Compartir PDF con médico

### 2. Práctica Profesional
- Evaluación inicial de pacientes
- Seguimiento de progreso terapéutico
- Reportes para historial clínico
- Análisis de tendencias

### 3. Investigación
- Recolección de datos longitudinales
- Análisis de patrones poblacionales
- Validación de intervenciones
- Exportación a formato analítico

## 🔧 Troubleshooting

### PDF no se descarga
```bash
# Verificar instalación
npm list jspdf html2canvas

# Reinstalar si es necesario
npm install --force jspdf html2canvas
```

### Análisis IA no funciona
```bash
# Verificar variable de entorno
echo $NEXT_PUBLIC_OPENAI_API_KEY

# El sistema usará análisis de respaldo automáticamente
```

### Historial desaparece
- Verificar que no esté en modo incógnito
- Exportar regularmente como backup
- Considerar implementar backend para sincronización

## 📈 Roadmap

### Versión Pro (Próximamente)
- [ ] 72 preguntas (12 por sistema)
- [ ] 3 sistemas adicionales (Endocrino, Inmunológico, Reproductivo)
- [ ] Análisis IA más profundo
- [ ] Historial ilimitado
- [ ] $9.99/mes o $79.99/año

### Características Avanzadas
- [ ] Integración con wearables (Apple Health, Fitbit)
- [ ] Notificaciones y recordatorios
- [ ] Compartir resultados con profesionales
- [ ] Multilingual (EN, PT, FR)
- [ ] Backend con PostgreSQL

## 📝 Notas Importantes

1. **Privacidad**: Los datos se almacenan localmente en el navegador, no se envían a servidores
2. **Disclaimer**: Este no es un diagnóstico médico, siempre consultar profesionales
3. **OpenAI**: Es opcional, el sistema funciona completamente sin ella
4. **Backup**: Exportar historial regularmente para prevenir pérdida de datos

## 📚 Documentación Completa

Ver `docs/WELLNESS_SYSTEM_ADVANCED.md` para documentación exhaustiva con:
- Arquitectura detallada
- API completa
- Flujos de datos
- Modelos de datos
- Ejemplos de código

## ✨ Créditos

**Desarrollado para:** Tony Blanco - Análisis Cabalístico del Alma  
**Stack:** Next.js 14 + TypeScript + Tailwind + jsPDF + OpenAI  
**Versión:** 1.0.0

---

**¿Preguntas o problemas?** Consulta la documentación completa o abre un issue.
