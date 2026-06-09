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
import { getCorrespondenceSystem } from '../correspondences/system';
import { resolvePartzuf } from '../kabbalah-traditional/resolve';
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
function formatHermeticSefirahLine(data) {
    const element = data.element ?? 'none';
    return `- ${data.id}: planet=${data.planet} element=${element} kingScaleColor=${data.kingScaleColor}`;
}
function formatTraditionalSefirahLine(data) {
    const partzuf = resolvePartzuf(data.id);
    return `- ${data.id}: divineName=${data.divineNameTranslit} archangel=${data.archangel} choir=${data.angelicChoir} olam=${data.olam} partzuf=${partzuf ?? 'n/a'}`;
}
function formatHermeticPathLine(data) {
    const planet = data.planet ?? 'none';
    const element = data.element ?? 'none';
    const zodiac = data.zodiacSign ?? 'none';
    return `- ${data.id}: letter=${data.hebrewLetter} pathNumber=${data.pathNumber} planet=${planet} element=${element} zodiac=${zodiac}`;
}
function formatTraditionalPathLine(data) {
    return `- ${data.pathId}: letter=${data.hebrewLetter} class=${data.letterClass} attribution=${data.attribution}`;
}
function formatCorrespondenceReferenceSection(treeState, systemId) {
    const activeSefirot = treeState.sefirot.filter((s) => s.role !== 'latent');
    const activePaths = treeState.flows
        .map((f) => f.pathId)
        .filter((pathId) => typeof pathId === 'string');
    const sefirahLines = systemId === 'jewish-traditional'
        ? activeSefirot
            .map((s) => {
            const data = getCorrespondenceSystem('jewish-traditional').sefirah(s.id);
            return data ? formatTraditionalSefirahLine(data) : null;
        })
            .filter((line) => line !== null)
        : activeSefirot
            .map((s) => {
            const data = getCorrespondenceSystem('hermetic-golden-dawn').sefirah(s.id);
            return data ? formatHermeticSefirahLine(data) : null;
        })
            .filter((line) => line !== null);
    const pathLines = systemId === 'jewish-traditional'
        ? [...new Set(activePaths)]
            .map((pathId) => {
            const data = getCorrespondenceSystem('jewish-traditional').path(pathId);
            return data ? formatTraditionalPathLine(data) : null;
        })
            .filter((line) => line !== null)
        : [...new Set(activePaths)]
            .map((pathId) => {
            const data = getCorrespondenceSystem('hermetic-golden-dawn').path(pathId);
            return data ? formatHermeticPathLine(data) : null;
        })
            .filter((line) => line !== null);
    const section = `
## CORRESPONDENCE REFERENCE (${systemId} — read-only tables, not interpretive)

**Sefirot in current structure** (${sefirahLines.length}):
${sefirahLines.join('\n')}

**Paths in current structure** (${pathLines.length}):
${pathLines.length > 0 ? pathLines.join('\n') : '- none with pathId'}
`.trim();
    const safety = validateSafetyContent(section);
    if (!safety.passed) {
        return '';
    }
    return section;
}
function formatAnalysisSection(analysis) {
    const pb = analysis.pillarBalance;
    const ta = analysis.triadActivation;
    const pd = analysis.polarityDistribution;
    const g = analysis.graph;
    return `
## STRUCTURAL ANALYSIS (v${analysis.sourceVersion} — deterministic metrics, read-only)

**Pillar balance** (fraction of total activation):
  severity=${pb.severity.toFixed(3)}  mercy=${pb.mercy.toFixed(3)}  equilibrium=${pb.equilibrium.toFixed(3)}

**Triad activation** (average activation per triad):
  supernal=${ta.supernal.toFixed(3)}  ethical=${ta.ethical.toFixed(3)}  astral=${ta.astral.toFixed(3)}  receptacle=${ta.receptacle.toFixed(3)}

**Polarity distribution** (fraction of flows):
  harmonic=${pd.harmonic.toFixed(3)}  integrative=${pd.integrative.toFixed(3)}  tensional=${pd.tensional.toFixed(3)}

**Graph**: activeNodes=${g.activeNodes.length}  activePaths=${g.activePaths.length}  components=${g.connectedComponents}  longestPath=${g.longestActivePath.length} nodes

**Ranking** (top 3 by activation):
${analysis.ranking.slice(0, 3).map((r, i) => `  ${i + 1}. ${r.id} activation=${r.activation.toFixed(3)} role=${r.role}`).join('\n')}
`.trim();
}
function generateSymbolicPrompt(treeState, safetyLevel, analysis, correspondenceSystem) {
    const { source, sefirot, flows } = treeState;
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

## INPUT DATA (TreeStructuralState v0.2)

**Method Applied**: ${source.method}

**SEFIROT** (${sefirot.length} elements):
${sefiraData.map(s => `- ${s.id}: role=${s.role}, activation=${s.activation.toFixed(2)}`).join('\n')}

**FLOWS** (${flows.length} connections):
${flowData.map(f => `- ${f.from}→${f.to}: polarity=${f.polarity}, intensity=${f.intensity.toFixed(2)}`).join('\n')}

${analysis ? formatAnalysisSection(analysis) : ''}

${correspondenceSystem ? formatCorrespondenceReferenceSection(treeState, correspondenceSystem) : ''}

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
    const { treeState, safetyLevel, structuralAnalysis, correspondenceSystem } = request;
    const prompt = generateSymbolicPrompt(treeState, safetyLevel, structuralAnalysis, correspondenceSystem);
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
    const harmonicFlows = treeState.flows.filter(f => f.polarity === 'harmonic');
    const integrativeFlows = treeState.flows.filter(f => f.polarity === 'integrative');
    const tensionalFlows = treeState.flows.filter(f => f.polarity === 'tensional');
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
    const fallbackObservations = [
        {
            type: 'structural-analysis',
            title: 'Panorama Estructural',
            content: `La estructura presenta ${dominantSefirot.length} sefirot dominantes y ${presentSefirot.length} presentes, con ${treeState.flows.length} conexiones activas. ${verticalFlows.length > treeState.flows.length / 2 ? 'Énfasis vertical predominante' : 'Distribución equilibrada entre ejes'}. La densidad estructural indica un patrón ${treeState.flows.length > 15 ? 'complejo' : treeState.flows.length > 10 ? 'moderado' : 'concentrado'}.`,
        },
        {
            type: 'pattern-recognition',
            title: 'Dinámica Sefirática',
            content: `Los flujos se distribuyen en ${harmonicFlows.length} armónicos, ${integrativeFlows.length} integrativos y ${tensionalFlows.length} tensionales. ${harmonicFlows.length > tensionalFlows.length ? 'Predominancia de patrones armónicos' : 'Balance entre polaridades'}. Las sefirot dominantes establecen centros de concentración estructural que definen el patrón relacional.`,
        },
        {
            type: 'educational-context',
            title: 'Contexto Metodológico',
            content: `Método aplicado: ${treeState.source.method}. Este método enfatiza la reducción numerológica y el mapeo directo sefirático. No captura dinámicas astrológicas ni simbología tarótica. La estructura observada refleja exclusivamente el modelo matemático-cabalístico del método.`,
        },
        {
            type: 'symbolic-comparison',
            title: 'Claves de Observación Profesional',
            content: `Para análisis profundo, considerar: ¿Qué sefirot dominantes establecen polaridades estructurales? ¿Cómo se distribuye la energía entre triadas (Supernal/Ética/Astral)? ¿Qué ausencias latentes podrían ser significativas? La observación sistemática de flujos tensionales puede revelar zonas de potencial transformación estructural.`,
        },
    ];
    return {
        sourceState: treeState,
        timestamp: new Date().toISOString(),
        safetyLevel: 'educational',
        observations: fallbackObservations,
        educationalContext: 'Interpretación generada sin asistencia de IA (modo fallback) — Análisis estructural algorítmico basado en conteo de patrones',
        safetyValidation: {
            passed: true,
            warnings: [],
        },
    };
}
