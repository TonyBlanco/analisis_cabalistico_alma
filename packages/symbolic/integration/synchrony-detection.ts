/**
 * Transgenerational Synchrony Detection
 * 
 * Detecta patrones cíclicos repetidos entre generaciones
 * usando ciclos cabalísticos de 7 y 9 años
 */

import type { TransgenerationalSynchrony, TransgenerationalReading, CabalaReading } from './types';

// ============================================================================
// CABALISTIC CYCLES
// ============================================================================

export const CABALA_CYCLES = {
  // Ciclo de 7 años (Sefirot inferiores)
  SEVEN_YEAR: {
    duration: 7,
    sefirot: ['malkuth', 'yesod', 'hod', 'netzach', 'tiferet', 'gevurah', 'chesed', 'binah', 'chokmah', 'keter'],
  },
  // Ciclo de 9 años (números pitagóricos)
  NINE_YEAR: {
    duration: 9,
    meanings: {
      1: 'Nuevos comienzos',
      2: 'Asociaciones',
      3: 'Expresión creativa',
      4: 'Construcción',
      5: 'Cambios',
      6: 'Responsabilidad',
      7: 'Introspección',
      8: 'Poder',
      9: 'Culminación',
    },
  },
};

export function calculateCabalisticCycle(age: number): { 
  cycleNumber: number; 
  yearInCycle: number; 
  sefira: string;
  theme: string;
} {
  const cycleNumber = Math.floor(age / 7) + 1;
  const yearInCycle = age % 7;
  const sefiraIndex = (cycleNumber - 1) % CABALA_CYCLES.SEVEN_YEAR.sefirot.length;
  const sefira = CABALA_CYCLES.SEVEN_YEAR.sefirot[sefiraIndex];
  
  const sefirotThemes: Record<string, string> = {
    malkuth: 'Manifestación material, arraigo',
    yesod: 'Fundamentos, identidad, sueños',
    hod: 'Comunicación, intelecto, estructura',
    netzach: 'Emociones, creatividad, victoria',
    tiferet: 'Equilibrio, belleza, centro',
    gevurah: 'Límites, fuerza, discernimiento',
    chesed: 'Expansión, amor, generosidad',
    binah: 'Comprensión, forma, contención',
    chokmah: 'Sabiduría, inspiración, chispa',
    keter: 'Corona, unidad, propósito superior',
  };
  
  return {
    cycleNumber,
    yearInCycle,
    sefira,
    theme: sefirotThemes[sefira] || 'Transición',
  };
}

// ============================================================================
// SYNCHRONY DETECTION
// ============================================================================

interface AncestorEvent {
  relation: string;
  name?: string;
  age: number;
  event: string;
  theme: string;
}

export function detectTransgenerationalSynchronies(
  transgenerationalReading: TransgenerationalReading,
  consultantBirthDate: Date,
  currentDate: Date = new Date()
): TransgenerationalSynchrony[] {
  const synchronies: TransgenerationalSynchrony[] = [];
  const consultantAge = Math.floor(
    (currentDate.getTime() - consultantBirthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );
  
  // Collect all ancestor events with ages
  const ancestorEvents: AncestorEvent[] = [];
  
  const processLine = (line: TransgenerationalReading['data']['paternalLine']) => {
    line?.forEach(ancestor => {
      ancestor.keyEvents?.forEach(event => {
        ancestorEvents.push({
          relation: ancestor.relation,
          name: ancestor.name,
          age: event.age,
          event: event.event,
          theme: event.theme,
        });
      });
    });
  };
  
  processLine(transgenerationalReading.data.paternalLine);
  processLine(transgenerationalReading.data.maternalLine);
  
  // Group events by age (with 2-year tolerance)
  const ageGroups: Map<number, AncestorEvent[]> = new Map();
  
  ancestorEvents.forEach(event => {
    // Round to nearest multiple of 7 or use exact age
    const baseAges = [event.age, Math.round(event.age / 7) * 7, Math.round(event.age / 9) * 9];
    
    baseAges.forEach(baseAge => {
      if (baseAge > 0) {
        const existing = ageGroups.get(baseAge) || [];
        if (!existing.some(e => e.relation === event.relation && e.event === event.event)) {
          existing.push(event);
          ageGroups.set(baseAge, existing);
        }
      }
    });
  });
  
  // Find ages with multiple ancestors having events
  ageGroups.forEach((events, age) => {
    // Only consider if 2+ ancestors had events at similar age
    if (events.length >= 2) {
      const cycle = calculateCabalisticCycle(age);
      const yearsToPattern = age - consultantAge;
      
      let alertLevel: TransgenerationalSynchrony['alertLevel'] = 'info';
      if (yearsToPattern > 0 && yearsToPattern <= 2) {
        alertLevel = 'urgent';
      } else if (yearsToPattern > 0 && yearsToPattern <= 5) {
        alertLevel = 'attention';
      }
      
      // Generate working suggestion
      let workingSuggestion = '';
      const themes = [...new Set(events.map(e => e.theme.toLowerCase()))];
      
      if (themes.some(t => t.includes('muerte') || t.includes('pérdida'))) {
        workingSuggestion = `Trabajo preventivo de duelo y cierre de ciclos antes de los ${age} años.`;
      } else if (themes.some(t => t.includes('crisis') || t.includes('enfermedad'))) {
        workingSuggestion = `Atención especial a la salud y equilibrio emocional cerca de los ${age} años.`;
      } else if (themes.some(t => t.includes('separación') || t.includes('divorcio'))) {
        workingSuggestion = `Revisar patrones de relación y compromiso antes de los ${age} años.`;
      } else {
        workingSuggestion = `Observar conscientemente este ciclo de ${age} años para romper el patrón heredado.`;
      }
      
      synchronies.push({
        id: `sync_${age}_${Date.now()}`,
        age,
        cycle: {
          number: cycle.cycleNumber,
          sefira: cycle.sefira,
        },
        ancestors: events.map(e => ({
          relation: e.relation,
          event: e.event,
          age: e.age,
        })),
        consultantAge,
        yearsToPattern,
        alertLevel,
        workingSuggestion,
      });
    }
  });
  
  // Sort by urgency and proximity
  return synchronies.sort((a, b) => {
    const alertOrder = { urgent: 0, attention: 1, info: 2 };
    if (alertOrder[a.alertLevel] !== alertOrder[b.alertLevel]) {
      return alertOrder[a.alertLevel] - alertOrder[b.alertLevel];
    }
    return Math.abs(a.yearsToPattern) - Math.abs(b.yearsToPattern);
  });
}

// ============================================================================
// CYCLIC PATTERN ANALYSIS
// ============================================================================

export function analyzeCyclicPatterns(consultantAge: number, events: AncestorEvent[]): {
  sevenYearPatterns: Array<{ cycle: number; events: AncestorEvent[] }>;
  nineYearPatterns: Array<{ cycle: number; events: AncestorEvent[] }>;
  upcomingCriticalAges: number[];
} {
  const sevenYearPatterns: Map<number, AncestorEvent[]> = new Map();
  const nineYearPatterns: Map<number, AncestorEvent[]> = new Map();
  
  events.forEach(event => {
    const sevenCycle = Math.ceil(event.age / 7);
    const nineCycle = Math.ceil(event.age / 9);
    
    const existing7 = sevenYearPatterns.get(sevenCycle) || [];
    existing7.push(event);
    sevenYearPatterns.set(sevenCycle, existing7);
    
    const existing9 = nineYearPatterns.get(nineCycle) || [];
    existing9.push(event);
    nineYearPatterns.set(nineCycle, existing9);
  });
  
  // Find critical ages (where multiple events occurred)
  const criticalCycles7 = Array.from(sevenYearPatterns.entries())
    .filter(([_, evts]) => evts.length >= 2)
    .map(([cycle, _]) => cycle);
    
  const upcomingCriticalAges: number[] = [];
  criticalCycles7.forEach(cycle => {
    const criticalAge = cycle * 7;
    if (criticalAge > consultantAge && criticalAge < consultantAge + 20) {
      upcomingCriticalAges.push(criticalAge);
    }
  });
  
  return {
    sevenYearPatterns: Array.from(sevenYearPatterns.entries())
      .filter(([_, events]) => events.length >= 2)
      .map(([cycle, events]) => ({ cycle, events })),
    nineYearPatterns: Array.from(nineYearPatterns.entries())
      .filter(([_, events]) => events.length >= 2)
      .map(([cycle, events]) => ({ cycle, events })),
    upcomingCriticalAges: [...new Set(upcomingCriticalAges)].sort((a, b) => a - b),
  };
}
