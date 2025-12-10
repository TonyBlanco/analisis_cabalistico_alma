// Sistema de persistencia para historial de tests de bienestar

export interface WellnessTestResult {
  id: string;
  date: string;
  timestamp: number;
  answers: Record<number, number>;
  systemScores: {
    system: string;
    score: number;
    maxScore: number;
    percentage: number;
    status: 'Óptimo' | 'Normal' | 'Regular' | 'Crítico';
  }[];
  totalQuestions: number;
  completedIn: number; // segundos
}

export interface WellnessHistory {
  tests: WellnessTestResult[];
  lastTest?: WellnessTestResult;
  totalTests: number;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'wellness_test_history';
const MAX_HISTORY_ITEMS = 50; // Máximo de tests almacenados

/**
 * Guarda un resultado de test en el historial
 */
export function saveTestResult(result: Omit<WellnessTestResult, 'id' | 'timestamp'>): void {
  try {
    const history = loadHistory();
    
    const newTest: WellnessTestResult = {
      ...result,
      id: generateTestId(),
      timestamp: Date.now(),
    };

    history.tests.unshift(newTest); // Agregar al inicio
    
    // Limitar el historial
    if (history.tests.length > MAX_HISTORY_ITEMS) {
      history.tests = history.tests.slice(0, MAX_HISTORY_ITEMS);
    }

    history.lastTest = newTest;
    history.totalTests = history.tests.length;
    history.updatedAt = new Date().toISOString();

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving test result:', error);
  }
}

/**
 * Carga el historial completo
 */
export function loadHistory(): WellnessHistory {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (stored) {
      return JSON.parse(stored);
    }

    // Inicializar historial vacío
    const emptyHistory: WellnessHistory = {
      tests: [],
      totalTests: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return emptyHistory;
  } catch (error) {
    console.error('Error loading history:', error);
    return {
      tests: [],
      totalTests: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

/**
 * Obtiene el último test realizado
 */
export function getLastTest(): WellnessTestResult | null {
  const history = loadHistory();
  return history.lastTest || null;
}

/**
 * Obtiene tests filtrados por rango de fechas
 */
export function getTestsByDateRange(startDate: Date, endDate: Date): WellnessTestResult[] {
  const history = loadHistory();
  const startTimestamp = startDate.getTime();
  const endTimestamp = endDate.getTime();

  return history.tests.filter(
    test => test.timestamp >= startTimestamp && test.timestamp <= endTimestamp
  );
}

/**
 * Obtiene los últimos N tests
 */
export function getRecentTests(count: number = 10): WellnessTestResult[] {
  const history = loadHistory();
  return history.tests.slice(0, count);
}

/**
 * Compara dos tests para ver evolución
 */
export function compareTests(testId1: string, testId2: string): {
  systems: {
    system: string;
    oldPercentage: number;
    newPercentage: number;
    change: number;
    improved: boolean;
  }[];
  overallImprovement: boolean;
} | null {
  const history = loadHistory();
  const test1 = history.tests.find(t => t.id === testId1);
  const test2 = history.tests.find(t => t.id === testId2);

  if (!test1 || !test2) return null;

  const systems = test1.systemScores.map((sys1) => {
    const sys2 = test2.systemScores.find(s => s.system === sys1.system);
    
    if (!sys2) {
      return {
        system: sys1.system,
        oldPercentage: sys1.percentage,
        newPercentage: sys1.percentage,
        change: 0,
        improved: false,
      };
    }

    const change = sys2.percentage - sys1.percentage;
    
    return {
      system: sys1.system,
      oldPercentage: sys1.percentage,
      newPercentage: sys2.percentage,
      change,
      improved: change < 0, // Menor porcentaje = mejora
    };
  });

  const totalOldPercentage = test1.systemScores.reduce((sum, s) => sum + s.percentage, 0) / test1.systemScores.length;
  const totalNewPercentage = test2.systemScores.reduce((sum, s) => sum + s.percentage, 0) / test2.systemScores.length;
  
  return {
    systems,
    overallImprovement: totalNewPercentage < totalOldPercentage,
  };
}

/**
 * Obtiene estadísticas del historial
 */
export function getHistoryStats(): {
  totalTests: number;
  averageCompletionTime: number;
  systemsImprovedCount: number;
  systemsWorsenedCount: number;
  mostProblematicSystem: string | null;
  bestSystem: string | null;
} {
  const history = loadHistory();

  if (history.tests.length === 0) {
    return {
      totalTests: 0,
      averageCompletionTime: 0,
      systemsImprovedCount: 0,
      systemsWorsenedCount: 0,
      mostProblematicSystem: null,
      bestSystem: null,
    };
  }

  const avgTime = history.tests.reduce((sum, t) => sum + t.completedIn, 0) / history.tests.length;

  // Calcular sistemas más problemáticos
  const systemAverages: Record<string, number[]> = {};
  
  history.tests.forEach(test => {
    test.systemScores.forEach(sys => {
      if (!systemAverages[sys.system]) {
        systemAverages[sys.system] = [];
      }
      systemAverages[sys.system].push(sys.percentage);
    });
  });

  const systemAvgScores = Object.entries(systemAverages).map(([system, scores]) => ({
    system,
    average: scores.reduce((a, b) => a + b, 0) / scores.length,
  }));

  systemAvgScores.sort((a, b) => b.average - a.average);

  const mostProblematic = systemAvgScores[0]?.system || null;
  const best = systemAvgScores[systemAvgScores.length - 1]?.system || null;

  // Contar mejoras/empeoramientos si hay al menos 2 tests
  let improved = 0;
  let worsened = 0;

  if (history.tests.length >= 2) {
    const latest = history.tests[0];
    const previous = history.tests[1];

    latest.systemScores.forEach(latestSys => {
      const prevSys = previous.systemScores.find(s => s.system === latestSys.system);
      if (prevSys) {
        if (latestSys.percentage < prevSys.percentage) improved++;
        if (latestSys.percentage > prevSys.percentage) worsened++;
      }
    });
  }

  return {
    totalTests: history.totalTests,
    averageCompletionTime: Math.round(avgTime),
    systemsImprovedCount: improved,
    systemsWorsenedCount: worsened,
    mostProblematicSystem: mostProblematic,
    bestSystem: best,
  };
}

/**
 * Elimina un test específico
 */
export function deleteTest(testId: string): boolean {
  try {
    const history = loadHistory();
    const initialLength = history.tests.length;
    
    history.tests = history.tests.filter(t => t.id !== testId);
    
    if (history.tests.length < initialLength) {
      history.totalTests = history.tests.length;
      history.lastTest = history.tests[0] || undefined;
      history.updatedAt = new Date().toISOString();
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error deleting test:', error);
    return false;
  }
}

/**
 * Limpia todo el historial
 */
export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing history:', error);
  }
}

/**
 * Exporta el historial como JSON
 */
export function exportHistory(): string {
  const history = loadHistory();
  return JSON.stringify(history, null, 2);
}

/**
 * Importa historial desde JSON
 */
export function importHistory(jsonData: string): boolean {
  try {
    const imported: WellnessHistory = JSON.parse(jsonData);
    
    // Validar estructura básica
    if (!imported.tests || !Array.isArray(imported.tests)) {
      throw new Error('Invalid history format');
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(imported));
    return true;
  } catch (error) {
    console.error('Error importing history:', error);
    return false;
  }
}

/**
 * Genera ID único para test
 */
function generateTestId(): string {
  return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Obtiene tendencias de un sistema específico
 */
export function getSystemTrend(systemName: string, limit: number = 10): {
  dates: string[];
  percentages: number[];
  trend: 'improving' | 'worsening' | 'stable';
} {
  const history = loadHistory();
  const recentTests = history.tests.slice(0, limit).reverse();

  const dates: string[] = [];
  const percentages: number[] = [];

  recentTests.forEach(test => {
    const systemScore = test.systemScores.find(s => s.system === systemName);
    if (systemScore) {
      dates.push(new Date(test.timestamp).toLocaleDateString('es-ES', { 
        month: 'short', 
        day: 'numeric' 
      }));
      percentages.push(systemScore.percentage);
    }
  });

  // Calcular tendencia
  let trend: 'improving' | 'worsening' | 'stable' = 'stable';
  
  if (percentages.length >= 2) {
    const firstHalf = percentages.slice(0, Math.floor(percentages.length / 2));
    const secondHalf = percentages.slice(Math.floor(percentages.length / 2));
    
    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const difference = avgSecond - avgFirst;
    
    if (difference < -5) trend = 'improving';
    else if (difference > 5) trend = 'worsening';
  }

  return { dates, percentages, trend };
}
