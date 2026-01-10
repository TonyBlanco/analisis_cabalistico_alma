/**
 * Pitagoras → TreeStructuralState Adapter
 * 
 * ÚNICO PROPÓSITO: traducir resultado de Pitágoras a TreeStructuralState v0.1
 * 
 * REGLAS:
 * - NO interpretación textual
 * - NO diagnóstico
 * - Solo mapeo estructural: números → sefirot activas + flujos
 * - Determinista: mismo input → mismo TreeStructuralState
 */

import type { PitagorasSymbolicState } from '../methods/pitagoras/pitagoras.types';
import type {
  TreeStructuralState,
  TreeSefirah,
  TreeFlow,
  SefiraId,
  SefiraRole,
  FlowPolarity,
  FlowDirection,
} from './tree-structural-state.types';
import { TREE_STRUCTURAL_STATE_META } from './tree-structural-state.types';

/**
 * Mapeo canónico: Número (1-9) → Sefirá primaria
 * 
 * Basado en correspondencias tradicionales del Árbol de la Vida:
 * - 1 = Keter (Corona, unidad)
 * - 2 = Chokmah (Sabiduría, expansión)
 * - 3 = Binah (Comprensión, forma)
 * - 4 = Chesed (Misericordia, abundancia)
 * - 5 = Gevurah (Rigor, límite)
 * - 6 = Tiferet (Belleza, balance)
 * - 7 = Netzach (Victoria, persistencia)
 * - 8 = Hod (Esplendor, comunicación)
 * - 9 = Yesod (Fundamento, inconsciente)
 * 
 * Malchut (10/Reino) se activa por manifestación total (múltiples dominantes)
 */
const NUMBER_TO_SEFIRAH: Record<number, SefiraId> = {
  1: 'keter',
  2: 'chokmah',
  3: 'binah',
  4: 'chesed',
  5: 'gevurah',
  6: 'tiferet',
  7: 'netzach',
  8: 'hod',
  9: 'yesod',
};

/**
 * Determinar rol de una Sefirá según su peso de activación
 */
function determineRole(activation: number): SefiraRole {
  if (activation >= 0.7) return 'dominant';
  if (activation >= 0.4) return 'present';
  return 'latent';
}

/**
 * Calcular intensidad de flujo entre dos números (0..1)
 */
function calculateFlowIntensity(fromWeight: number, toWeight: number): number {
  // Intensidad = promedio de pesos, normalizado
  return (fromWeight + toWeight) / 2;
}

/**
 * Determinar polaridad de flujo según diferencia de pesos y posiciones en el Árbol
 */
function determineFlowPolarity(
  fromNum: number,
  toNum: number,
  fromWeight: number,
  toWeight: number
): FlowPolarity {
  const diff = Math.abs(fromWeight - toWeight);
  
  // Si los pesos son similares (diferencia < 0.2) → harmonic
  if (diff < 0.2) return 'harmonic';
  
  // Si hay gran diferencia (> 0.4) y va de número bajo a alto → tensional
  if (diff > 0.4 && fromNum < toNum) return 'tensional';
  
  // Si hay diferencia moderada → integrative
  if (diff >= 0.2 && diff <= 0.4) return 'integrative';
  
  // Por defecto (diferencia alta, sentido inverso) → integrative
  return 'integrative';
}

/**
 * Determinar dirección de flujo entre Sefirot
 */
function determineFlowDirection(fromNum: number, toNum: number): FlowDirection {
  // En el Árbol, números bajos están arriba (Keter=1) y altos abajo (Yesod=9)
  if (fromNum < toNum) return 'down'; // Descenso (de corona a fundamento)
  if (fromNum > toNum) return 'up';   // Ascenso (de fundamento a corona)
  return 'lateral'; // Mismo nivel (raro, pero posible en análisis compuesto)
}

/**
 * Adaptar estado pitagórico a TreeStructuralState
 * 
 * MAPEO:
 * 1. Números principales → Sefirot activas (con activation y role)
 * 2. Números dominantes (alta frecuencia en inclusión) → Sefirot con mayor activation
 * 3. Tensiones entre números → Flujos con polaridad
 * 4. Si 3+ números dominantes → Malchut se activa (manifestación completa)
 * 
 * @param pitagorasState - Estado simbólico de Pitágoras
 * @returns TreeStructuralState v0.1
 */
export function adaptPitagorasToTree(pitagorasState: PitagorasSymbolicState): TreeStructuralState {
  const sefirotMap: Record<SefiraId, number> = {} as Record<SefiraId, number>; // id → max activation

  // 1. Mapear números principales a Sefirot
  pitagorasState.primaryNumbers.forEach((num) => {
    const sefiraId = NUMBER_TO_SEFIRAH[num.value];
    if (!sefiraId) return; // Skip si número no tiene mapeo directo
    
    const currentActivation = sefirotMap[sefiraId] || 0;
    // Usar el peso como activation, acumulando si aparece múltiples veces
    sefirotMap[sefiraId] = Math.max(currentActivation, num.weight);
  });

  // 2. Activar Sefirot según números dominantes en inclusión
  for (const numStr in pitagorasState.inclusionMap) {
    if (!pitagorasState.inclusionMap.hasOwnProperty(numStr)) continue;
    const data = pitagorasState.inclusionMap[parseInt(numStr, 10)];
    const num = parseInt(numStr, 10);
    if (data.isDominant) {
      const sefiraId = NUMBER_TO_SEFIRAH[num];
      if (sefiraId) {
        const currentActivation = sefirotMap[sefiraId] || 0;
        // Dominancia en inclusión añade 0.3 extra de activation
        sefirotMap[sefiraId] = Math.min(1.0, currentActivation + 0.3);
      }
    }
  }

  // 3. Activar Malchut si hay múltiples dominantes (manifestación completa)
  const dominantCount = pitagorasState.primaryNumbers.filter((n) => n.weight >= 0.85).length;
  if (dominantCount >= 3) {
    const currentMalchut = sefirotMap['malchut'] || 0;
    sefirotMap['malchut'] = Math.max(currentMalchut, 0.75);
  }

  // 4. Construir array de Sefirot
  const sefirot: TreeSefirah[] = [];
  for (const id in sefirotMap) {
    if (!sefirotMap.hasOwnProperty(id)) continue;
    const activation = sefirotMap[id as SefiraId];
    sefirot.push({
      id: id as SefiraId,
      activation,
      role: determineRole(activation),
    });
  }

  // 5. Generar flujos entre Sefirot activas
  const flows: TreeFlow[] = [];
  const activeSefirot = pitagorasState.primaryNumbers
    .filter((n) => n.weight >= 0.4) // Solo números con peso significativo
    .sort((a, b) => b.weight - a.weight); // Ordenar por peso descendente

  // Crear flujos entre números principales consecutivos
  for (let i = 0; i < activeSefirot.length - 1; i++) {
    const fromNum = activeSefirot[i];
    const toNum = activeSefirot[i + 1];
    
    const fromSefira = NUMBER_TO_SEFIRAH[fromNum.value];
    const toSefira = NUMBER_TO_SEFIRAH[toNum.value];
    
    if (!fromSefira || !toSefira) continue;

    flows.push({
      from: fromSefira,
      to: toSefira,
      polarity: determineFlowPolarity(fromNum.value, toNum.value, fromNum.weight, toNum.weight),
      intensity: calculateFlowIntensity(fromNum.weight, toNum.weight),
      direction: determineFlowDirection(fromNum.value, toNum.value),
    });
  }

  // 6. Si Malchut está activa, crear flujos desde Sefirot dominantes hacia ella
  if (sefirotMap['malchut']) {
    const topSefirot = activeSefirot.slice(0, 2); // Top 2 números más fuertes
    topSefirot.forEach((num) => {
      const fromSefira = NUMBER_TO_SEFIRAH[num.value];
      if (fromSefira && fromSefira !== 'malchut') {
        flows.push({
          from: fromSefira,
          to: 'malchut',
          polarity: 'harmonic', // Flujo hacia manifestación siempre armónico
          intensity: num.weight * 0.8,
          direction: 'down',
        });
      }
    });
  }

  // 7. Retornar TreeStructuralState completo
  return {
    source: {
      method: 'pitagoras',
      mode: 'manual',
      timestamp: new Date().toISOString(),
    },
    sefirot,
    flows,
    notes: {
      scope: 'symbolic-structural',
      disclaimer: TREE_STRUCTURAL_STATE_META.disclaimer,
    },
  };
}
