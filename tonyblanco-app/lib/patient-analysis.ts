// Sistema de Análisis Comparativo y Correlaciones

import type { PatientTestResult, PatientComparison } from '@/types/patient';
import { getPatientTests, getTestsByDateRange } from './patient-storage';

export interface TemporalComparison {
  period: string; // "última semana", "último mes", etc.
  previousTest: PatientTestResult;
  currentTest: PatientTestResult;
  changes: {
    system: string;
    previousScore: number;
    currentScore: number;
    change: number;
    changePercentage: number;
    trend: 'improving' | 'stable' | 'declining';
    significance: 'high' | 'medium' | 'low';
  }[];
  summary: string;
}

export interface KabbalisticCorrelation {
  kabbalisticFinding: {
    type: 'weakness' | 'strength' | 'challenge';
    description: string;
    bodyArea?: string;
  };
  wellnessFindings: {
    system: string;
    status: string;
    percentage: number;
  }[];
  correlation: 'strong' | 'moderate' | 'weak' | 'none';
  confidence: number; // 0-100
  explanation: string;
  recommendations: string[];
}

/**
 * Compara dos tests del mismo paciente
 */
export function compareTests(test1: PatientTestResult, test2: PatientTestResult): TemporalComparison {
  const changes = [];
  
  // Comparar cada sistema
  if (test1.wellnessData && test2.wellnessData) {
    const systems1 = test1.wellnessData.systemScores;
    const systems2 = test2.wellnessData.systemScores;
    
    for (let i = 0; i < systems1.length; i++) {
      const sys1 = systems1[i];
      const sys2 = systems2.find(s => s.system === sys1.system);
      
      if (sys2) {
        const change = sys2.percentage - sys1.percentage;
        const changePercentage = ((change / sys1.percentage) * 100);
        
        let trend: 'improving' | 'stable' | 'declining';
        if (change < -5) trend = 'improving'; // Menos síntomas = mejor
        else if (change > 5) trend = 'declining';
        else trend = 'stable';
        
        let significance: 'high' | 'medium' | 'low';
        if (Math.abs(change) > 20) significance = 'high';
        else if (Math.abs(change) > 10) significance = 'medium';
        else significance = 'low';
        
        changes.push({
          system: sys1.system,
          previousScore: sys1.percentage,
          currentScore: sys2.percentage,
          change,
          changePercentage,
          trend,
          significance,
        });
      }
    }
  }
  
  const summary = generateComparisonSummary(changes);
  const daysDiff = Math.floor((test2.timestamp - test1.timestamp) / (1000 * 60 * 60 * 24));
  
  return {
    period: daysDiff <= 7 ? 'última semana' : daysDiff <= 30 ? 'último mes' : `últimos ${daysDiff} días`,
    previousTest: test1,
    currentTest: test2,
    changes,
    summary,
  };
}

/**
 * Obtiene comparación temporal automática (último test vs anterior)
 */
export function getLatestComparison(patientId: string): TemporalComparison | null {
  const tests = getPatientTests(patientId);
  
  if (tests.length < 2) return null;
  
  return compareTests(tests[1], tests[0]); // Anterior vs Más reciente
}

/**
 * Analiza tendencias a largo plazo
 */
export function analyzeLongTermTrends(patientId: string, months: number = 3): PatientComparison {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  
  const tests = getTestsByDateRange(
    patientId,
    startDate.toISOString(),
    endDate.toISOString()
  );
  
  const trends = [];
  
  if (tests.length >= 2) {
    const firstTest = tests[tests.length - 1];
    const lastTest = tests[0];
    
    if (firstTest.wellnessData && lastTest.wellnessData) {
      firstTest.wellnessData.systemScores.forEach(sys1 => {
        const sys2 = lastTest.wellnessData!.systemScores.find(s => s.system === sys1.system);
        
        if (sys2) {
          const change = sys2.percentage - sys1.percentage;
          
          let direction: 'improving' | 'stable' | 'declining';
          if (change < -5) direction = 'improving';
          else if (change > 5) direction = 'declining';
          else direction = 'stable';
          
          trends.push({
            system: sys1.system,
            direction,
            changePercentage: change,
          });
        }
      });
    }
  }
  
  return {
    patientId,
    tests,
    timeRange: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    },
    trends,
  };
}

/**
 * Correlaciona hallazgos cabalísticos con resultados de wellness
 */
export function correlateKabbalisticFindings(
  kabbalisticProfile: any,
  wellnessTest: PatientTestResult
): KabbalisticCorrelation[] {
  const correlations: KabbalisticCorrelation[] = [];
  
  // Validar que wellnessTest tenga datos
  if (!wellnessTest.wellnessData) {
    return correlations;
  }
  
  // Validar que kabbalisticProfile tenga weaknesses y que sea un array
  if (!kabbalisticProfile || !kabbalisticProfile.weaknesses) {
    return correlations;
  }
  
  // Asegurar que weaknesses sea un array
  const weaknesses = Array.isArray(kabbalisticProfile.weaknesses) 
    ? kabbalisticProfile.weaknesses 
    : [];
  
  if (weaknesses.length === 0) {
    return correlations;
  }
  
  const weaknessMapping: Record<string, string[]> = {
    'espalda': ['Sistema Esquelético', 'Sistema Muscular'],
    'columna': ['Sistema Esquelético'],
    'digestión': ['Sistema Digestivo'],
    'estómago': ['Sistema Digestivo'],
    'intestino': ['Sistema Digestivo'],
    'nervios': ['Sistema Nervioso'],
    'ansiedad': ['Sistema Nervioso'],
    'estrés': ['Sistema Nervioso'],
    'corazón': ['Sistema Circulatorio'],
    'presión': ['Sistema Circulatorio'],
    'circulación': ['Sistema Circulatorio'],
    'respiración': ['Sistema Respiratorio'],
    'pulmones': ['Sistema Respiratorio'],
    'articulaciones': ['Sistema Esquelético'],
    'músculos': ['Sistema Muscular'],
  };
  
  weaknesses.forEach((weakness: any) => {
    // Validar que weakness sea un string válido
    if (!weakness || typeof weakness !== 'string') {
      return;
    }
    
    const lowerWeakness = weakness.toLowerCase();
    const relatedSystems: string[] = [];
    
    // Buscar sistemas relacionados
    Object.entries(weaknessMapping).forEach(([keyword, systems]) => {
      if (lowerWeakness.includes(keyword)) {
        relatedSystems.push(...systems);
      }
    });
    
    if (relatedSystems.length > 0) {
      // Buscar hallazgos en wellness test
      const wellnessFindings = wellnessTest.wellnessData.systemScores.filter(sys =>
        relatedSystems.includes(sys.system)
      );
      
      if (wellnessFindings.length > 0) {
        // Calcular correlación basada en severidad
        const avgPercentage = wellnessFindings.reduce((sum, f) => sum + f.percentage, 0) / wellnessFindings.length;
        
        let correlation: 'strong' | 'moderate' | 'weak' | 'none';
        let confidence: number;
        
        if (avgPercentage > 50) {
          correlation = 'strong';
          confidence = 85 + Math.min(avgPercentage - 50, 15);
        } else if (avgPercentage > 30) {
          correlation = 'moderate';
          confidence = 60 + (avgPercentage - 30);
        } else if (avgPercentage > 15) {
          correlation = 'weak';
          confidence = 40 + (avgPercentage - 15);
        } else {
          correlation = 'none';
          confidence = avgPercentage + 25;
        }
        
        correlations.push({
          kabbalisticFinding: {
            type: 'weakness',
            description: weakness,
            bodyArea: relatedSystems[0],
          },
          wellnessFindings,
          correlation,
          confidence,
          explanation: generateCorrelationExplanation(weakness, wellnessFindings, correlation),
          recommendations: generateCorrelationRecommendations(weakness, wellnessFindings),
        });
      }
    }
  });
  
  return correlations;
}

function generateComparisonSummary(changes: any[]): string {
  const improving = changes.filter(c => c.trend === 'improving').length;
  const declining = changes.filter(c => c.trend === 'declining').length;
  const stable = changes.filter(c => c.trend === 'stable').length;
  
  if (improving > declining) {
    return `Progreso positivo: ${improving} sistemas mejorando, ${stable} estables, ${declining} requieren atención.`;
  } else if (declining > improving) {
    return `Atención necesaria: ${declining} sistemas empeorando, ${stable} estables, ${improving} mejorando.`;
  } else {
    return `Condición estable: ${stable} sistemas estables, ${improving} mejorando, ${declining} declinando.`;
  }
}

function generateCorrelationExplanation(weakness: string, findings: any[], correlation: string): string {
  const systemNames = findings.map(f => f.system).join(' y ');
  
  switch (correlation) {
    case 'strong':
      return `La debilidad cabalística "${weakness}" muestra una correlación FUERTE con los hallazgos en ${systemNames}. Los resultados del test de wellness confirman esta predisposición.`;
    case 'moderate':
      return `La debilidad cabalística "${weakness}" tiene correlación MODERADA con ${systemNames}. Se observan algunos síntomas relacionados.`;
    case 'weak':
      return `La debilidad cabalística "${weakness}" muestra correlación DÉBIL con ${systemNames}. Los síntomas son leves en esta área.`;
    default:
      return `No se detecta correlación significativa entre "${weakness}" y ${systemNames} en este momento.`;
  }
}

function generateCorrelationRecommendations(weakness: string, findings: any[]): string[] {
  const recommendations: string[] = [];
  
  const avgPercentage = findings.reduce((sum, f) => sum + f.percentage, 0) / findings.length;
  
  if (avgPercentage > 50) {
    recommendations.push('Considerar terapia enfocada en esta área específica');
    recommendations.push('Monitoreo frecuente (cada 2 semanas) de la evolución');
    recommendations.push('Combinar tratamiento holístico con atención médica si es necesario');
  } else if (avgPercentage > 30) {
    recommendations.push('Implementar medidas preventivas inmediatas');
    recommendations.push('Revisión mensual del progreso');
  } else {
    recommendations.push('Mantener prácticas de autocuidado en esta área');
    recommendations.push('Monitoreo trimestral preventivo');
  }
  
  return recommendations;
}
