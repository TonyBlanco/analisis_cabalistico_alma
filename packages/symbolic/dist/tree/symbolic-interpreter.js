/**
 * Symbolic Interpreter — AI-Assisted Symbolic Reading Module
 *
 * SAFETY-FIRST ARCHITECTURE:
 * - Reads ONLY TreeStructuralState (immutable)
 * - NO access to personal data
 * - NO clinical conclusions
 * - Content filtering for prohibited terms
 * - Educational and formative language only
 */
import { SYMBOLIC_INTERPRETER_META } from './symbolic-interpreter.types';
/**
 * Validates that content does not contain prohibited terms
 */
function validateSafetyContent(content) {
    const warnings = [];
    const lowercaseContent = content.toLowerCase();
    for (const term of SYMBOLIC_INTERPRETER_META.prohibitedTerms) {
        if (lowercaseContent.includes(term.toLowerCase())) {
            warnings.push(`Prohibited term detected: "${term}"`);
        }
    }
    return {
        passed: warnings.length === 0,
        warnings,
    };
}
/**
 * Generates prompt for AI symbolic interpretation
 * CRITICAL: Prompt must enforce safety rules
 */
function generateSymbolicPrompt(treeState, safetyLevel) {
    const { source, sefirot, flows, notes } = treeState;
    // Serialize structural data (NO personal info)
    const sefiraData = sefirot.map(s => ({
        id: s.id,
        role: s.role,
        activation: s.activation,
    }));
    const flowData = flows.map(f => ({
        from: f.from,
        to: f.to,
        polarity: f.polarity,
        intensity: f.intensity,
    }));
    const prompt = `# ROLE: Symbolic Structural Analyst (Kabbalistic)
# MODE: NON-CLINICAL / PROFESSIONAL / EDUCATIONAL

You receive a TreeStructuralState v0.1.
You DO NOT receive personal data.
You DO NOT diagnose.
You DO NOT give advice.

Your task is to produce a SYMBOLIC STRUCTURAL READING
useful for trainers and professional practitioners of Kabbalah.

---

## STRICT LIMITS (CRITICAL SAFETY RULES)
- NO diagnosis
- NO advice
- NO determinism
- NO personal labels
- NO psychological terms
- Symbolic-structural language ONLY

---

## INPUT DATA (TreeStructuralState v0.1)

**Method Applied**: ${source.method}

**SEFIROT** (${sefirot.length} elements):
${sefiraData.map(s => `- ${s.id}: role=${s.role}, activation=${s.activation.toFixed(2)}`).join('\n')}

**FLOWS** (${flows.length} connections):
${flowData.map(f => `- ${f.from}→${f.to}: polarity=${f.polarity}, intensity=${f.intensity.toFixed(2)}`).join('\n')}

---

## OUTPUT STRUCTURE (MANDATORY)

Generate 4 observations following this EXACT structure:

### Observation 1: Structural Panorama
**Type**: "structural-analysis"
**Title**: Brief title about overall structure
**Content**: Describe:
- Overall density of the structure
- Vertical vs horizontal emphasis
- Central vs lateral dominance
- Concentration across triads (Supernal/Ethical/Astral)

Use neutral, symbolic language. 2-3 sentences.

### Observation 2: Sefirotic Dynamics
**Type**: "pattern-recognition"
**Title**: Brief title about sefirotic relationships
**Content**: Identify:
- Significant relationships between sefirot
- Harmonic, integrative and tensional patterns
- Structural balances or imbalances

DO NOT personalize. DO NOT psychologize. 2-3 sentences.

### Observation 3: Methodological Context
**Type**: "educational-context"
**Title**: Brief title about method influence
**Content**: Explain:
- What the applied method emphasizes
- What the method does NOT capture
- How this conditions the observed structure

This is educational context. 2-3 sentences.

### Observation 4: Professional Keys
**Type**: "symbolic-comparison"
**Title**: Brief title about observational cues
**Content**: Provide:
- Observational cues for practitioners
- Questions worth exploring
- Structural themes worth attention

DO NOT give conclusions. DO NOT suggest actions. 2-3 sentences.

---

## RESPONSE FORMAT (JSON ONLY)

Return ONLY this JSON structure, no additional text:

{
  "observations": [
    {
      "type": "structural-analysis",
      "title": "...",
      "content": "..."
    },
    {
      "type": "pattern-recognition",
      "title": "...",
      "content": "..."
    },
    {
      "type": "educational-context",
      "title": "...",
      "content": "..."
    },
    {
      "type": "symbolic-comparison",
      "title": "...",
      "content": "..."
    }
  ]
}`;
    return prompt;
}
/**
 * Parses AI response and validates safety
 */
function parseAIResponse(rawResponse) {
    try {
        // Extract JSON from response (AI might add markdown)
        const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No JSON found in AI response');
        }
        const parsed = JSON.parse(jsonMatch[0]);
        if (!parsed.observations || !Array.isArray(parsed.observations)) {
            throw new Error('Invalid response structure: missing observations array');
        }
        // Validate each observation
        const validObservations = [];
        for (const obs of parsed.observations) {
            const validation = validateSafetyContent(obs.content);
            validObservations.push({
                type: obs.type,
                title: obs.title || 'Observación simbólica',
                content: obs.content,
                containsProhibitedContent: !validation.passed,
            });
        }
        return validObservations;
    }
    catch (error) {
        console.error('Error parsing AI response:', error);
        return [];
    }
}
/**
 * Main function: Generate AI-assisted symbolic interpretation
 *
 * @param request - Interpretation request with TreeStructuralState
 * @param aiCallback - Async function that calls AI API (injected)
 * @returns SymbolicInterpretation with observations
 */
export async function generateSymbolicInterpretation(request, aiCallback) {
    const { treeState, safetyLevel } = request;
    // Generate safe prompt
    const prompt = generateSymbolicPrompt(treeState, safetyLevel);
    // Call AI (external dependency)
    let rawResponse;
    try {
        rawResponse = await aiCallback(prompt);
    }
    catch (error) {
        console.error('AI callback error:', error);
        rawResponse = '{"observations": []}';
    }
    // Parse and validate response
    const observations = parseAIResponse(rawResponse);
    // Overall safety validation
    const allWarnings = [];
    for (const obs of observations) {
        if (obs.containsProhibitedContent) {
            const validation = validateSafetyContent(obs.content);
            allWarnings.push(...validation.warnings);
        }
    }
    const interpretation = {
        sourceState: treeState,
        timestamp: new Date().toISOString(),
        safetyLevel,
        observations: observations.filter(o => !o.containsProhibitedContent),
        safetyValidation: {
            passed: allWarnings.length === 0,
            warnings: allWarnings,
        },
    };
    return interpretation;
}
/**
 * Validates TreeStructuralState before interpretation
 * Ensures no personal data leakage
 */
export function validateTreeStateForInterpretation(treeState) {
    const errors = [];
    // Check that source only contains method info (no patient data)
    if (!treeState.source || !treeState.source.method) {
        errors.push('TreeStructuralState missing source metadata');
    }
    // Check sefirot array
    if (!Array.isArray(treeState.sefirot) || treeState.sefirot.length !== 10) {
        errors.push('TreeStructuralState must have exactly 10 sefirot');
    }
    // Check flows array
    if (!Array.isArray(treeState.flows)) {
        errors.push('TreeStructuralState missing flows array');
    }
    // Verify NO personal data in notes
    if (treeState.notes?.disclaimer && typeof treeState.notes.disclaimer === 'string') {
        const notesLower = treeState.notes.disclaimer.toLowerCase();
        const personalDataIndicators = ['nombre', 'name', 'fecha de nacimiento', 'birth date', 'edad', 'age'];
        for (const indicator of personalDataIndicators) {
            if (notesLower.includes(indicator)) {
                errors.push(`Personal data indicator detected in notes: "${indicator}"`);
            }
        }
    }
    return {
        valid: errors.length === 0,
        errors,
    };
}
/**
 * Creates a fallback interpretation when AI fails
 * Follows same 4-observation structure as AI-generated interpretations
 */
export function createFallbackInterpretation(treeState) {
    const dominantSefirot = treeState.sefirot.filter(s => s.role === 'dominant');
    const presentSefirot = treeState.sefirot.filter(s => s.role === 'present');
    const latentSefirot = treeState.sefirot.filter(s => s.role === 'latent');
    const harmonicFlows = treeState.flows.filter(f => f.polarity === 'harmonic');
    const integrativeFlows = treeState.flows.filter(f => f.polarity === 'integrative');
    const tensionalFlows = treeState.flows.filter(f => f.polarity === 'tensional');
    // Sefira name mapping for display
    const SEFIRA_NAMES = {
        'keter': 'Keter (Corona)',
        'chokmah': 'Chokmah (Sabiduría)',
        'binah': 'Binah (Entendimiento)',
        'chesed': 'Chesed (Misericordia)',
        'gevurah': 'Gevurah (Rigor)',
        'tiferet': 'Tiferet (Belleza)',
        'netzach': 'Netzach (Victoria)',
        'hod': 'Hod (Gloria)',
        'yesod': 'Yesod (Fundamento)',
        'malchut': 'Malchut (Reino)',
    };
    // Calculate vertical emphasis (flows crossing triads)
    const verticalFlows = treeState.flows.filter(f => {
        const upperTriad = ['keter', 'chokmah', 'binah'];
        const middleTriad = ['chesed', 'gevurah', 'tiferet'];
        const lowerTriad = ['netzach', 'hod', 'yesod', 'malchut'];
        const fromUpper = upperTriad.includes(f.from);
        const fromMiddle = middleTriad.includes(f.from);
        const toMiddle = middleTriad.includes(f.to);
        const toLower = lowerTriad.includes(f.to);
        return (fromUpper && (toMiddle || toLower)) || (fromMiddle && toLower);
    });
    // Build dynamic content based on actual data
    const dominantNames = dominantSefirot.map(s => SEFIRA_NAMES[s.id] || s.id).join(', ');
    const presentNames = presentSefirot.map(s => SEFIRA_NAMES[s.id] || s.id).join(', ');
    // Get strongest flows for display
    const strongestFlows = [...treeState.flows]
        .sort((a, b) => b.intensity - a.intensity)
        .slice(0, 3)
        .map(f => `${SEFIRA_NAMES[f.from]?.split(' ')[0] || f.from} → ${SEFIRA_NAMES[f.to]?.split(' ')[0] || f.to}`)
        .join(', ');
    // Method-specific descriptions
    const methodDescriptions = {
        'pitagoras': 'el análisis numerológico pitagórico con reducción a dígitos maestros',
        'gematria-standard': 'la gematría hebrea estándar (Mispar Hechrachi)',
        'gematria-katan': 'la gematría katan (valores reducidos 1-9)',
        'mispar-gadol': 'el Mispar Gadol (valores finales extendidos)',
        'mispar-siduri': 'el Mispar Siduri (valor ordinal de letras)',
        'milui': 'el Milui (expansión de nombres de letras)',
        'atbash': 'la cifra Atbash (sustitución espejo)',
        'albam': 'la cifra Albam (sustitución por mitades)',
        'avgad': 'la cifra Avgad (desplazamiento adelante)',
        'temurah': 'la Temurah (permutación de letras)',
        'notarikon': 'el Notarikón (acrósticos y abreviaciones)',
    };
    const methodDesc = methodDescriptions[treeState.source.method] || 'el método seleccionado';
    const fallbackObservations = [
        {
            type: 'structural-analysis',
            title: 'Panorama Estructural',
            content: dominantSefirot.length > 0
                ? `Sefirot dominantes: ${dominantNames}. ${presentSefirot.length > 0 ? `Presentes: ${presentNames}.` : ''} La estructura muestra ${treeState.flows.length} conexiones activas con ${verticalFlows.length > treeState.flows.length / 2 ? 'énfasis vertical (descenso de luz)' : 'distribución equilibrada entre ejes'}.`
                : `No se detectaron sefirot dominantes en esta lectura. ${presentSefirot.length > 0 ? `Sefirot presentes: ${presentNames}.` : 'La estructura requiere más datos para manifestar patrones claros.'}`,
        },
        {
            type: 'pattern-recognition',
            title: 'Dinámica Sefirática',
            content: treeState.flows.length > 0
                ? `Flujos principales: ${strongestFlows || 'ninguno detectado'}. Distribución: ${harmonicFlows.length} armónicos, ${integrativeFlows.length} integrativos, ${tensionalFlows.length} tensionales. ${harmonicFlows.length > tensionalFlows.length ? 'Predominan patrones de flujo armónico (luz descendente estable).' : tensionalFlows.length > harmonicFlows.length ? 'Mayor presencia de tensiones (zonas de trabajo interior).' : 'Balance entre luz y sombra en el árbol.'}`
                : 'No se detectaron flujos activos. Esto puede indicar un patrón estático o la necesidad de mayor contexto numerológico.',
        },
        {
            type: 'educational-context',
            title: 'Contexto Metodológico',
            content: `Análisis basado en ${methodDesc}. Este método mapea valores numéricos a las sefirot del Árbol de la Vida según correspondencias tradicionales. La lectura es estructural y educativa, no diagnóstica ni predictiva.`,
        },
        {
            type: 'symbolic-comparison',
            title: 'Claves de Observación Profesional',
            content: dominantSefirot.length > 0
                ? `Observar: ¿Cómo interactúan ${dominantSefirot[0] ? SEFIRA_NAMES[dominantSefirot[0].id]?.split(' ')[0] : 'las sefirot'} con las energías circundantes? ${tensionalFlows.length > 0 ? 'Las tensiones detectadas sugieren áreas de potencial transformación.' : ''} ${latentSefirot.length > 0 ? `Ausencias notables pueden indicar áreas de desarrollo.` : ''}`
                : 'Considerar ejecutar métodos adicionales para obtener un panorama más completo del patrón simbólico.',
        },
    ];
    return {
        sourceState: treeState,
        timestamp: new Date().toISOString(),
        safetyLevel: 'educational',
        observations: fallbackObservations,
        educationalContext: `Interpretación algorítmica (sin IA) — Método: ${treeState.source.method} — ${new Date().toLocaleDateString('es-ES')}`,
        safetyValidation: {
            passed: true,
            warnings: [],
        },
    };
}
