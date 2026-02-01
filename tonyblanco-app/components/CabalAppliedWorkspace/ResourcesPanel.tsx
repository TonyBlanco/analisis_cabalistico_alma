/**
 * ResourcesPanel.tsx - Panel de Recursos Educativos de Cábala Aplicada
 * 
 * Material consultivo, guías, referencias y herramientas para terapeutas
 */

'use client';

import { useState } from 'react';
import { 
  BookOpen, 
  Hash, 
  TreePine, 
  HelpCircle, 
  FileText, 
  Download,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Info,
  BookMarked,
  Lightbulb,
  Shield,
  Heart
} from 'lucide-react';

interface ResourceItem {
  id: string;
  title: string;
  icon: typeof BookOpen;
  description: string;
  type: 'guide' | 'reference' | 'faq' | 'ethical';
  content?: string;
  downloadUrl?: string;
  externalUrl?: string;
}

const RESOURCES: ResourceItem[] = [
  {
    id: 'manual-cabala',
    title: 'Manual de Cábala Aplicada',
    icon: BookOpen,
    description: 'Guía completa de uso del workspace simbólico para contextos terapéuticos.',
    type: 'guide',
    content: `
# Manual de Cábala Aplicada - Workspace Simbólico

## 🎯 Propósito
Este workspace es una **herramienta de exploración simbólica** que integra numerología cabalística, gematría hebrea y el Árbol de la Vida para apoyo terapéutico.

## ⚠️ Advertencias Éticas
- **NO es diagnóstico clínico**: Todas las interpretaciones son simbólicas y educativas
- **Soberanía del terapeuta**: Solo el profesional puede integrar esta información en el proceso terapéutico
- **Consentimiento informado**: El consultante debe comprender la naturaleza simbólica del análisis

## 📚 Módulos Base
- **Árbol de la Vida**: Visualización de sefirot y senderos, mapeo de resonancias
- **Gematría**: Cálculo de valores numéricos (Pitágoras, Gematría Standard, Katan, etc.)
- **Mapa del Alma**: Distribución sefiótica del nombre y fecha de nacimiento
- **Ciclos Tikún**: Línea temporal de ciclos evolutivos de 9 años
- **Notarikón**: Análisis de acrónimos y síntesis de conceptos
- **Trabajo de Sombras**: Exploración de Qliphoth (polaridades negativas)

## 🔬 Módulos Avanzados
- **Radar Sefirot**: Integración de tests clínicos (MCMI-4, AQ) con sefirot
- **Multi-Sistema**: Integración Cábala + Tarot + Astrología + BioEmocional
- **Lab Nombres**: Gematría relacional de nombres familiares

## ✨ Innovaciones Terapéuticas
- **Sincronías**: Detector de coincidencias biográficas (números repetidos en fechas)
- **Alertas Preventivas**: Avisos éticos basados en patrones de historia clínica
- **Exportación Narrativa**: Generación de documentos hermosos (Carta del Alma)
- **Calendario Cósmico**: Ciclos lunares y sefiróticos en tiempo real
- **Meditaciones**: Prácticas personalizadas por sefirá
- **Árbol Vivo**: Visualización dinámica que crece con el progreso terapéutico

## 🛠️ Workflow Recomendado
1. **Inicio**: Seleccionar consultante activo
2. **Exploración básica**: Árbol + Mapa del Alma
3. **Profundización**: Gematría (varios métodos) + Ciclos
4. **Integración clínica**: Radar Sefirot (si hay tests disponibles)
5. **Síntesis narrativa**: Notas humanas + IA Asistida (opcional)
6. **Exportación**: Generar Carta del Alma o documento PDF

## 💡 Buenas Prácticas
- **Exploración iterativa**: No hay camino único, cada consultante es diferente
- **Sin automatización**: Este workspace es observacional, no genera diagnósticos
- **Integración humana**: La IA solo asiste, el terapeuta interpreta
- **Registro reflexivo**: Usar sección de Síntesis para notas integradas
`
  },
  {
    id: 'gematria-dict',
    title: 'Diccionario de Gematría',
    icon: Hash,
    description: 'Valores numéricos, métodos y correspondencias sefiróticas.',
    type: 'reference',
    content: `
# Diccionario de Gematría

## 🔢 Métodos Principales

### 1. Pitágoras (Numerología Occidental)
- **A-I**: 1, 2, 3, 4, 5, 6, 7, 8, 9
- **J-R**: 1, 2, 3, 4, 5, 6, 7, 8, 9
- **S-Z**: 1, 2, 3, 4, 5, 6, 7, 8
- **Reducción**: Sumar hasta obtener un solo dígito (excepto 11, 22, 33)

### 2. Gematría Standard (Hebreo)
- **א (Alef)**: 1
- **ב (Bet)**: 2
- **ג (Gimel)**: 3
- **ד (Dalet)**: 4
- **ה (He)**: 5
- **ו (Vav)**: 6
- **ז (Zayin)**: 7
- **ח (Jet)**: 8
- **ט (Tet)**: 9
- **י (Yod)**: 10
- **כ (Kaf)**: 20
- **ל (Lamed)**: 30
- **מ (Mem)**: 40
- **נ (Nun)**: 50
- **ס (Samej)**: 60
- **ע (Ayin)**: 70
- **פ (Pe)**: 80
- **צ (Tsade)**: 90
- **ק (Qof)**: 100
- **ר (Resh)**: 200
- **ש (Shin)**: 300
- **ת (Tav)**: 400

### 3. Gematría Katan (Reducción)
- Cada letra se reduce a su dígito base (1-9)
- **Ejemplo**: כ (20) → 2, מ (40) → 4

### 4. Mispar Gadol (Valores Extendidos)
- Letras finales tienen valores especiales:
  - **ך (Kaf final)**: 500
  - **ם (Mem final)**: 600
  - **ן (Nun final)**: 700
  - **ף (Pe final)**: 800
  - **ץ (Tsade final)**: 900

### 5. Atbash (Sustitución Inversa)
- א ↔ ת, ב ↔ ש, ג ↔ ר, etc.
- **Alef** se convierte en **Tav**, **Bet** en **Shin**

## 🌳 Correspondencias Sefiróticas

| Número | Sefirá | Significado | Arcano Tarot |
|--------|--------|-------------|--------------|
| 1 | Keter | Corona, Unidad | El Mago |
| 2 | Jojmá | Sabiduría | La Sacerdotisa |
| 3 | Biná | Entendimiento | La Emperatriz |
| 4 | Jesed | Misericordia | El Emperador |
| 5 | Gueburá | Severidad | El Hierofante |
| 6 | Tiféret | Belleza | Los Enamorados |
| 7 | Netzaj | Victoria | El Carro |
| 8 | Hod | Esplendor | La Justicia |
| 9 | Yesod | Fundamento | El Ermitaño |
| 10 | Maljut | Reino | La Rueda |

## 📖 Palabras Sagradas Comunes

- **YHVH (יהוה)**: 10+5+6+5 = 26 (Nombre de Dios)
- **Ejad (אחד)**: 1+8+4 = 13 (Unidad)
- **Ahava (אהבה)**: 1+5+2+5 = 13 (Amor)
- **Jojmá (חכמה)**: 8+20+40+5 = 73 (Sabiduría)
- **Shalom (שלום)**: 300+30+6+40 = 376 (Paz)

## 💡 Interpretación Terapéutica
- **No es predictivo**: Los números ofrecen simbolismo, no destino
- **Resonancia personal**: Cada consultante resuena diferente con su mapa numérico
- **Herramienta de diálogo**: Útil para abrir conversaciones sobre identidad y propósito
`
  },
  {
    id: 'tree-reference',
    title: 'Árbol de la Vida - Referencia',
    icon: TreePine,
    description: 'Sefirot, senderos, atributos y correspondencias completas.',
    type: 'reference',
    content: `
# Árbol de la Vida - Referencia Completa

## 🌳 Estructura del Árbol

El Árbol de la Vida (Etz Jaim) consta de 10 Sefirot (emanaciones divinas) y 22 senderos que las conectan.

## 🔮 Las 10 Sefirot

### 1. Keter (Corona) כתר
- **Posición**: Cúspide del árbol
- **Significado**: La Unidad, la Voluntad Primordial
- **Mundo**: Atzilut (Emanación)
- **Color**: Blanco brillante
- **Arcano**: 0 - El Loco, 1 - El Mago
- **Experiencia espiritual**: Unión con Dios
- **Virtud**: Realización de la Gran Obra
- **Terapéutico**: Propósito de vida, conexión con lo trascendente

### 2. Jojmá (Sabiduría) חכמה
- **Posición**: Pilar derecho, superior
- **Significado**: Sabiduría divina, chispa creativa
- **Mundo**: Atzilut
- **Color**: Gris perla
- **Arcano**: 2 - La Sacerdotisa
- **Virtud**: Devoción
- **Terapéutico**: Inspiración, intuición, visión espiritual

### 3. Biná (Entendimiento) בינה
- **Posición**: Pilar izquierdo, superior
- **Significado**: Entendimiento, estructuración
- **Mundo**: Atzilut
- **Color**: Negro
- **Arcano**: 3 - La Emperatriz
- **Virtud**: Silencio
- **Terapéutico**: Madurez emocional, introspección, contenedor

### 4. Jesed (Misericordia) חסד
- **Posición**: Pilar derecho, medio
- **Significado**: Amor, abundancia, expansión
- **Mundo**: Beria (Creación)
- **Color**: Azul
- **Arcano**: 4 - El Emperador
- **Virtud**: Obediencia
- **Terapéutico**: Generosidad, apertura, fluir con la vida

### 5. Gueburá (Severidad) גבורה
- **Posición**: Pilar izquierdo, medio
- **Significado**: Fuerza, disciplina, límites
- **Mundo**: Beria
- **Color**: Rojo
- **Arcano**: 5 - El Hierofante
- **Virtud**: Coraje
- **Terapéutico**: Límites sanos, autoafirmación, justicia personal

### 6. Tiféret (Belleza) תפארת
- **Posición**: Pilar central, corazón
- **Significado**: Armonía, equilibrio, el Yo Superior
- **Mundo**: Yetzirah (Formación)
- **Color**: Amarillo dorado
- **Arcano**: 6 - Los Enamorados
- **Virtud**: Devoción a la Gran Obra
- **Terapéutico**: Integración, identidad auténtica, centro del ser

### 7. Netzaj (Victoria) נצח
- **Posición**: Pilar derecho, inferior
- **Significado**: Victoria, emociones, instintos
- **Mundo**: Yetzirah
- **Color**: Verde
- **Arcano**: 7 - El Carro
- **Virtud**: Generosidad
- **Terapéutico**: Deseos, creatividad, pasión

### 8. Hod (Esplendor) הוד
- **Posición**: Pilar izquierdo, inferior
- **Significado**: Esplendor intelectual, comunicación
- **Mundo**: Yetzirah
- **Color**: Naranja
- **Arcano**: 8 - La Justicia
- **Virtud**: Veracidad
- **Terapéutico**: Mente racional, análisis, expresión verbal

### 9. Yesod (Fundamento) יסוד
- **Posición**: Pilar central, bajo
- **Significado**: Fundamento, inconsciente, puente alma-cuerpo
- **Mundo**: Assiah (Acción)
- **Color**: Violeta/Púrpura
- **Arcano**: 9 - El Ermitaño
- **Virtud**: Independencia
- **Terapéutico**: Sueños, sexualidad, arquetipos inconscientes

### 10. Maljut (Reino) מלכות
- **Posición**: Base del árbol
- **Significado**: Reino material, manifestación física
- **Mundo**: Assiah
- **Color**: Amarillo, ocre, oliva, negro
- **Arcano**: 10 - La Rueda de la Fortuna
- **Virtud**: Discriminación
- **Terapéutico**: Encarnación, vida cotidiana, anclaje terrenal

## 🌀 Los Tres Pilares

### Pilar Izquierdo (Femenino, Forma)
- Biná, Gueburá, Hod
- **Cualidades**: Restrictivo, contenedor, límites
- **Terapéutico**: Estructura, disciplina, contención emocional

### Pilar Derecho (Masculino, Fuerza)
- Jojmá, Jesed, Netzaj
- **Cualidades**: Expansivo, creativo, generoso
- **Terapéutico**: Apertura, flujo, creatividad

### Pilar Central (Equilibrio)
- Keter, Tiféret, Yesod, Maljut
- **Cualidades**: Balance, armonía, integración
- **Terapéutico**: Centro, identidad, equilibrio psíquico

## 🎭 Qliphot (Sombras)

Cada Sefirá tiene su reverso negativo:

| Sefirá | Qliphá | Manifestación Sombra |
|--------|--------|---------------------|
| Keter | Thaumiel | Dualidad, confusión existencial |
| Jojmá | Ghagiel | Sabiduría corrompida, arrogancia |
| Biná | Satariel | Ocultamiento excesivo, depresión |
| Jesed | Gha'agsheblah | Codicia, indulgencia sin límites |
| Gueburá | Golachab | Crueldad, violencia descontrolada |
| Tiféret | Tageriron | Vanidad, falso yo |
| Netzaj | Gharab Tzerek | Lujuria destructiva, caos emocional |
| Hod | Samael | Mentira, manipulación |
| Yesod | Gamaliel | Adicciones, perversiones |
| Maljut | Lilith | Materialismo, desconexión espiritual |

## 💡 Uso Terapéutico
- **Mapeo psicológico**: Cada sefirá representa un aspecto del self
- **Desequilibrios**: Exceso o carencia en alguna sefirá indica trabajo terapéutico
- **Integración**: El objetivo es equilibrar y ascender conscientemente
`
  },
  {
    id: 'faq',
    title: 'Preguntas Frecuentes',
    icon: HelpCircle,
    description: 'FAQ sobre el uso terapéutico y ético del workspace.',
    type: 'faq',
    content: `
# Preguntas Frecuentes - Cábala Aplicada

## 🔍 General

### ¿Qué es la Cábala Aplicada en contexto terapéutico?
Es el uso de simbolismo cabalístico (Árbol de la Vida, gematría, sefirot) como **herramienta de exploración psicológica y espiritual**, NO como sistema diagnóstico ni predictivo. Similar al uso terapéutico del Tarot o la Astrología humanística.

### ¿Es esto religioso?
No necesariamente. Si bien la Cábala tiene raíces en la mística judía, en contexto terapéutico se usa como **sistema simbólico universal**, similar a Jung con los arquetipos. El consultante no necesita creencias religiosas específicas.

### ¿Esto sustituye la psicoterapia tradicional?
**Absolutamente NO**. Es una herramienta complementaria para terapeutas formados. Nunca debe reemplazar evaluación clínica, diagnóstico formal ni tratamiento basado en evidencia.

## 🛠️ Uso del Workspace

### ¿Qué información necesito del consultante?
Mínimo:
- **Nombre completo** (para gematría)
- **Fecha de nacimiento** (para ciclos y mapeo sefiótico)

Opcional pero útil:
- Tests clínicos (MCMI-4, AQ) para integración simbólica
- Nombres de familiares (para Lab Nombres)
- Eventos biográficos clave (para Sincronías)

### ¿Debo usar todos los módulos en cada sesión?
**No**. Cada terapeuta usa lo que resuena con su metodología. Algunos solo usan el Árbol de la Vida como mapa visual, otros profundizan en gematría. Es una herramienta flexible.

### ¿Puedo guardar y exportar resultados?
Sí. El workspace permite:
- **Snapshots**: Guardar estado actual del análisis
- **PDFs**: Exportar visualizaciones del Árbol
- **Exportación Narrativa**: Generar documentos hermosos (Carta del Alma, Mapa del Viaje)

## 🤖 IA Asistida

### ¿Qué hace la IA en este workspace?
La IA ofrece **interpretaciones simbólicas textuales** basadas en los datos numéricos y sefiróticos generados. Ejemplo: "Tu número de expresión 7 resuena con Netzaj, sugiriendo...". 

**NUNCA** da diagnósticos, predicciones ni consejos clínicos.

### ¿Es obligatorio usar la IA?
**No**. Muchos terapeutas prefieren interpretar manualmente. La IA es **opcional** y solo asiste.

### ¿Qué validaciones éticas tiene la IA?
5 capas de seguridad:
1. **Prompt templating**: Instrucciones éticas estrictas
2. **Blacklist terms**: 14 palabras prohibidas (diagnóstico, trastorno, etc.)
3. **Draft mode**: Todas las interpretaciones son borradores
4. **Therapist sovereignty**: El terapeuta siempre aprueba antes de mostrar al consultante
5. **Audit trail**: Todas las generaciones se registran

## ⚖️ Ética y Consentimiento

### ¿Debo informar al consultante sobre este análisis?
**SÍ, siempre**. Consentimiento informado es obligatorio:
- Explicar que es **exploración simbólica**, no ciencia exacta
- Aclarar que **no sustituye diagnóstico clínico**
- Obtener autorización explícita

### ¿Puedo mostrarle el workspace al consultante?
Depende de tu criterio terapéutico. Algunos prefieren compartir solo interpretaciones narrativas (Carta del Alma), otros exploran el árbol juntos. **Nunca** mostrar datos crudos sin contexto.

### ¿Qué hago si el consultante cree que esto es "verdad absoluta"?
**Psicoeducación inmediata**. Reforzar:
- Es una **herramienta de autoconocimiento**, no predicción
- Los números son **símbolos**, no destino
- El poder está en la **reflexión personal**, no en el número en sí

## 🔬 Integración con Tests Clínicos

### ¿Cómo se integra con MCMI-4?
El módulo **Radar Sefirot** mapea escalas clínicas a sefirot:
- **Escalas Clínicas**: Eje Salud-Patología (por ejemplo, "Depresivo" resuena con Biná)
- **NO sustituye interpretación clínica**: Solo ofrece una vista simbólica alternativa

### ¿Es válido clínicamente?
**No es validado científicamente**. Es una **metáfora terapéutica**. Si un consultante puntúa alto en "Narcisista" y resuena con Tiféret (ego), es una observación simbólica, NO diagnóstico.

## 📚 Aprendizaje y Formación

### ¿Dónde puedo aprender más sobre Cábala terapéutica?
Recursos recomendados:
- **"El Árbol de la Vida" - Israel Regardie**: Referencia clásica
- **"La Cábala Mística" - Dion Fortune**: Enfoque psicológico
- **"Psicología Junguiana y Cábala" - Sanford L. Drob**: Integración con psicología profunda

### ¿Necesito formación específica en Cábala?
**No obligatorio**, pero recomendado. Muchos terapeutas usan el Árbol de la Vida intuitivamente. Conocimiento profundo de simbolismo ayuda, pero la herramienta es usable sin ser experto.

## 🚨 Casos Problemáticos

### ¿Qué hago si un consultante tiene creencias mágicas extremas?
**No reforzar pensamiento mágico**. Redirigir a:
- Uso metafórico: "Los números representan aspectos de tu psique"
- Empoderamiento personal: "Tú eres quien crea tu realidad, no los números"
- **Derivar** si hay indicios de delirio místico o psicosis

### ¿Puedo usar esto con menores de edad?
**Con precaución extrema**. Requiere:
- Consentimiento de tutores legales
- Lenguaje adaptado a edad
- Evitar interpretaciones que generen ansiedad o confusión identitaria

## 💡 Mejores Prácticas

### Checklist Ético
- [ ] Consentimiento informado obtenido
- [ ] Aclarar naturaleza simbólica (no diagnóstica)
- [ ] Supervisar interpretaciones de IA antes de compartir
- [ ] Documentar exploraciones en historia clínica
- [ ] Integrar con plan terapéutico general (no aislado)
- [ ] Evaluar continuamente: ¿Esto beneficia al consultante?
`
  },
  {
    id: 'ethical-framework',
    title: 'Marco Ético de Uso',
    icon: Shield,
    description: 'Lineamientos de responsabilidad profesional y uso seguro.',
    type: 'ethical',
    content: `
# Marco Ético de Uso - Cábala Aplicada

## 🛡️ Principios Fundamentales

### 1. Primum Non Nocere (Primero, No Dañar)
- **Prohibido**: Generar dependencia en interpretaciones simbólicas
- **Prohibido**: Reforzar pensamiento mágico o delirios místicos
- **Prohibido**: Usar para manipulación emocional o control
- **Obligatorio**: Priorizar bienestar del consultante sobre "revelaciones" simbólicas

### 2. Autonomía del Consultante
- **El consultante decide**: Participar o no en exploración cabalística
- **Sin presión**: Nunca imponer esta herramienta como "necesaria"
- **Revocable**: Puede solicitar cesar uso en cualquier momento

### 3. Transparencia Radical
- **Comunicar claramente**: Esto NO es ciencia, es simbolismo
- **Sin secretos**: No ocultar metodología o limitaciones
- **Datos accesibles**: El consultante puede revisar cálculos y fuentes

### 4. Integración Clínica
- **Complemento, no sustituto**: Nunca reemplaza diagnóstico formal
- **Contexto terapéutico**: Usar solo dentro de relación terapéutica establecida
- **Supervisión**: Consultar con pares en casos complejos

## ⚠️ Prohibiciones Absolutas

### 🚫 NUNCA Usar Para:
1. **Diagnóstico psiquiátrico**: "Tu número 5 indica trastorno de ansiedad" ❌
2. **Predicción de eventos**: "En 2027 tendrás una crisis según tu ciclo" ❌
3. **Consejos legales/médicos**: "Tu Gueburá dice que no tomes ese medicamento" ❌
4. **Compatibilidad de parejas**: "Sus números no son compatibles" ❌
5. **Decisiones vitales**: "Tu destino 7 dice que no te cases" ❌
6. **Evaluación forense**: NO usar en peritajes, custodias, etc. ❌

### 🚫 NUNCA Decir:
- "El Árbol de la Vida revela tu verdadero yo"
- "Esto explica por qué tienes [síntoma]"
- "Debes trabajar esta sefirá o tendrás problemas"
- "Tu gematría dice que eres [etiqueta]"

## ✅ Usos Apropiados

### ✔️ SÍ Usar Para:
1. **Autoexploración guiada**: "¿Qué resuena en ti de esta descripción de Tiféret?"
2. **Metáforas terapéuticas**: "Tu proceso se asemeja a este sendero del Árbol"
3. **Narrativa de integración**: "Veamos tu historia a través de estos símbolos"
4. **Diálogo creativo**: "Si tu sombra fuera una Qliphá, ¿cuál sería?"
5. **Psicoeducación simbólica**: "El Árbol de la Vida es un mapa de la psique"

## 📋 Checklist de Consentimiento Informado

Antes de usar Cábala Aplicada, asegurar que el consultante entiende:

### Explicar:
- [ ] "Esto es una **herramienta simbólica**, no un test psicológico"
- [ ] "Los números representan **arquetipos**, no diagnósticos"
- [ ] "No tiene validación científica formal"
- [ ] "Es complemento a tu proceso terapéutico, no diagnóstico"
- [ ] "Puedes pedir pausar o detener en cualquier momento"
- [ ] "Interpretaciones de IA son borradores, no verdades"

### Preguntar:
- [ ] "¿Entiendes que esto no predice tu futuro?"
- [ ] "¿Te sientes cómodo/a explorando simbolismo espiritual?"
- [ ] "¿Tienes dudas sobre cómo usaremos esta información?"

### Documentar:
- [ ] Consentimiento verbal/escrito registrado en historia clínica
- [ ] Fecha y contexto de uso
- [ ] Reacciones del consultante durante exploración

## 🔒 Seguridad de Datos

### Información Sensible
- **Gematría de nombres**: Puede revelar identidad
- **Fechas de nacimiento**: Dato personal protegido
- **Tests clínicos integrados**: Altamente confidenciales

### Obligaciones:
- [ ] Nunca compartir cálculos fuera de contexto terapéutico
- [ ] Anonimizar si se usa para supervisión/enseñanza
- [ ] Eliminar datos si consultante solicita (derecho al olvido)
- [ ] Cifrado en almacenamiento

## 🧠 Indicadores de Mal Uso

### 🚨 Señales de Alerta (Terapeuta):
- Consultante pide cálculos de familiares sin consentimiento de ellos
- Consultas obsesivas: "¿Qué dice mi número HOY?"
- Evita trabajo clínico real, se refugia en simbolismo
- Interpretaciones cada vez más fantásticas o desconectadas

**Acción**: Pausar uso, psicoeducación, evaluar dependencia

### 🚨 Señales de Alerta (Consultante):
- Terapeuta impone uso sin explicación
- Interpretaciones presentadas como "verdad absoluta"
- No permite cuestionar resultados
- Usa para justificar decisiones del terapeuta

**Acción**: Derecho a rechazar herramienta, considerar cambio de terapeuta

## 💡 Dilemas Éticos Comunes

### Caso 1: Consultante encuentra "verdad reveladora"
**Escenario**: "¡Mi número 8 explica TODO! Por eso soy controlador"

**Respuesta ética**:
- ✅ "Interesante que resuena contigo. ¿Qué te dice esto sobre tu autoconocimiento?"
- ❌ "Exacto, tu 8 es la causa de tu control"

### Caso 2: Familiar exige saber "su número"
**Escenario**: Pareja del consultante pide su gematría sin sesión propia

**Respuesta ética**:
- ✅ "Requiere su consentimiento y contexto terapéutico propio"
- ❌ Calcular y compartir "porque no hay problema"

### Caso 3: IA genera interpretación alarmante
**Escenario**: IA sugiere "tu Qliphá dominante indica sombra destructiva"

**Respuesta ética**:
- ✅ Descartar interpretación, reformular con lenguaje neutro
- ❌ Compartir tal cual "para no censurar"

## 📖 Formación Continua

### Competencias Requeridas:
- **Formación clínica base**: Psicología, psiquiatría, counseling
- **Conocimiento simbólico**: Cábala, Tarot, o sistema equivalente
- **Ética profesional**: Código deontológico vigente
- **Pensamiento crítico**: No caer en pensamiento mágico propio

### Supervisión Recomendada:
- **Revisar casos**: Con supervisor/a que conozca herramientas simbólicas
- **Peer review**: Con colegas que usen métodos similares
- **Actualización**: Nuevos hallazgos en psicología simbólica

## 🌟 Compromiso Profesional

> "Uso esta herramienta con humildad, sabiendo que es un **espejo simbólico**, no un mapa literal del alma. Mi compromiso es con el **bienestar del consultante**, no con la perfección de la interpretación. Si en algún momento esta herramienta causa confusión, dependencia o daño, cesaré su uso de inmediato."

---

**Última revisión**: Febrero 2026
**Fuente**: Lineamientos de Antigravedad Agents + Ética profesional estándar
`
  }
];

export default function ResourcesPanel() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDownload = (resource: ResourceItem) => {
    if (resource.content) {
      // Create blob from markdown content
      const blob = new Blob([resource.content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resource.id}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const renderResourceCard = (resource: ResourceItem) => {
    const isExpanded = expandedId === resource.id;
    const Icon = resource.icon;

    return (
      <div
        key={resource.id}
        className="rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all"
      >
        {/* Header */}
        <button
          onClick={() => toggleExpand(resource.id)}
          className="w-full flex items-start gap-4 p-4 text-left hover:bg-gray-50 transition-colors rounded-t-lg"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
            <Icon className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              {resource.title}
            </h3>
            <p className="text-xs text-gray-500">
              {resource.description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {resource.content && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(resource);
                }}
                className="p-1.5 rounded-md hover:bg-indigo-100 text-gray-500 hover:text-indigo-600 transition-colors"
                title="Descargar como Markdown"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </button>

        {/* Expanded Content */}
        {isExpanded && resource.content && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="prose prose-sm prose-indigo max-w-none">
              <div 
                className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
              >
                {resource.content}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Group resources by type
  const guides = RESOURCES.filter(r => r.type === 'guide');
  const references = RESOURCES.filter(r => r.type === 'reference');
  const faqs = RESOURCES.filter(r => r.type === 'faq');
  const ethical = RESOURCES.filter(r => r.type === 'ethical');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">Recursos Educativos</h2>
          <p className="text-sm text-gray-500 mt-1">
            Material consultivo, guías de referencia y lineamientos éticos para uso terapéutico
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 flex gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900">
          <p className="font-medium mb-1">Material de apoyo profesional</p>
          <p className="text-blue-700">
            Estos recursos son para uso exclusivo de terapeutas. Puedes descargar contenido 
            haciendo clic en el ícono <Download className="w-3 h-3 inline" /> junto a cada recurso.
          </p>
        </div>
      </div>

      {/* Guides Section */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <BookMarked className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            Guías de Uso
          </h3>
        </div>
        <div className="space-y-3">
          {guides.map(renderResourceCard)}
        </div>
      </section>

      {/* References Section */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            Referencias Técnicas
          </h3>
        </div>
        <div className="space-y-3">
          {references.map(renderResourceCard)}
        </div>
      </section>

      {/* FAQ Section */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-amber-600" />
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            Preguntas Frecuentes
          </h3>
        </div>
        <div className="space-y-3">
          {faqs.map(renderResourceCard)}
        </div>
      </section>

      {/* Ethical Framework Section */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Heart className="w-4 h-4 text-rose-600" />
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            Marco Ético
          </h3>
        </div>
        <div className="space-y-3">
          {ethical.map(renderResourceCard)}
        </div>
      </section>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-500">
          <Shield className="w-3 h-3 inline mr-1" />
          Todos los recursos están bajo licencia profesional. Uso exclusivo terapéutico.
        </p>
        <p className="text-[10px] text-gray-400 mt-2">
          Última actualización: Febrero 2026 • Holística Aplicada v2.0
        </p>
      </div>
    </div>
  );
}
