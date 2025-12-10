// Generador de PDF para reportes de bienestar
// Usa jsPDF y html2canvas para crear reportes visuales profesionales

import type { WellnessTestResult } from './wellness-persistence';

/**
 * Genera un PDF completo con los resultados del test
 */
export async function generateWellnessPDF(result: WellnessTestResult): Promise<Blob | null> {
  try {
    // Lazy load de las bibliotecas para reducir bundle size
    const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
      import('jspdf'),
      import('html2canvas')
    ]);

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Página 1: Portada y resumen general
    addCoverPage(pdf, result, pageWidth, pageHeight);

    // Página 2: Gráfico de barras de sistemas
    pdf.addPage();
    await addSystemsBarChart(pdf, result, pageWidth, pageHeight);

    // Página 3+: Detalles por sistema
    for (let i = 0; i < result.systemScores.length; i++) {
      const system = result.systemScores[i];
      pdf.addPage();
      addSystemDetailPage(pdf, system, pageWidth, pageHeight);
    }

    // Última página: Recomendaciones
    pdf.addPage();
    addRecommendationsPage(pdf, result, pageWidth, pageHeight);

    return pdf.output('blob');
  } catch (error) {
    console.error('Error generating PDF:', error);
    return null;
  }
}

/**
 * Página de portada
 */
function addCoverPage(pdf: any, result: WellnessTestResult, width: number, height: number): void {
  const centerX = width / 2;

  // Fondo decorativo
  pdf.setFillColor(139, 92, 246); // Purple
  pdf.rect(0, 0, width, 60, 'F');

  // Título
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Reporte de Bienestar Integral', centerX, 30, { align: 'center' });

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Análisis Completo de Sistemas Corporales', centerX, 45, { align: 'center' });

  // Fecha y hora
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(12);
  const date = new Date(result.timestamp);
  const formattedDate = date.toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const formattedTime = date.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  pdf.text(`Fecha: ${formattedDate}`, centerX, 80, { align: 'center' });
  pdf.text(`Hora: ${formattedTime}`, centerX, 90, { align: 'center' });

  // Resumen general
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Resumen General', 20, 110);

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  
  const totalPercentage = result.systemScores.reduce((sum, s) => sum + s.percentage, 0) / result.systemScores.length;
  const criticalSystems = result.systemScores.filter(s => s.status === 'Crítico').length;
  const regularSystems = result.systemScores.filter(s => s.status === 'Regular').length;
  const normalSystems = result.systemScores.filter(s => s.status === 'Normal').length;
  const optimalSystems = result.systemScores.filter(s => s.status === 'Óptimo').length;

  let yPos = 125;

  pdf.text(`• Preguntas respondidas: ${result.totalQuestions}`, 25, yPos);
  yPos += 10;
  pdf.text(`• Tiempo de completado: ${Math.floor(result.completedIn / 60)}m ${result.completedIn % 60}s`, 25, yPos);
  yPos += 10;
  pdf.text(`• Puntuación promedio: ${totalPercentage.toFixed(1)}%`, 25, yPos);
  yPos += 15;

  // Estado de sistemas
  pdf.setFont('helvetica', 'bold');
  pdf.text('Estado de Sistemas Evaluados:', 25, yPos);
  yPos += 10;
  pdf.setFont('helvetica', 'normal');

  // Óptimo - Verde
  pdf.setTextColor(34, 197, 94);
  pdf.text(`✓ Sistemas Óptimos: ${optimalSystems}`, 30, yPos);
  yPos += 10;

  // Normal - Azul
  pdf.setTextColor(59, 130, 246);
  pdf.text(`ℹ Sistemas Normales: ${normalSystems}`, 30, yPos);
  yPos += 10;

  // Regular - Naranja
  pdf.setTextColor(249, 115, 22);
  pdf.text(`⚠ Sistemas Regulares: ${regularSystems}`, 30, yPos);
  yPos += 10;

  // Crítico - Rojo
  pdf.setTextColor(239, 68, 68);
  pdf.text(`✖ Sistemas Críticos: ${criticalSystems}`, 30, yPos);
  
  // Reset color
  pdf.setTextColor(0, 0, 0);

  // Lista de sistemas evaluados
  yPos += 20;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Sistemas Evaluados:', 25, yPos);
  yPos += 10;
  pdf.setFont('helvetica', 'normal');

  result.systemScores.forEach(sys => {
    const color = getStatusColor(sys.status);
    pdf.setTextColor(color.r, color.g, color.b);
    pdf.text(`• ${sys.system}: ${sys.percentage}% - ${sys.status}`, 30, yPos);
    yPos += 8;
  });

  // Footer
  pdf.setTextColor(128, 128, 128);
  pdf.setFontSize(9);
  pdf.text('Kabbalah Aplicada & Psicoterapias del Alma', centerX, height - 15, { align: 'center' });
  pdf.text('Este reporte es confidencial y de uso personal', centerX, height - 10, { align: 'center' });
}

/**
 * Página con gráfico de barras
 */
async function addSystemsBarChart(pdf: any, result: WellnessTestResult, width: number, height: number): Promise<void> {
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Gráfico Comparativo de Sistemas', 20, 20);

  const chartStartY = 40;
  const chartHeight = 150;
  const barWidth = 25;
  const barSpacing = 10;
  const startX = 20;

  // Dibujar ejes
  pdf.setLineWidth(0.5);
  pdf.line(startX, chartStartY, startX, chartStartY + chartHeight);
  pdf.line(startX, chartStartY + chartHeight, width - 20, chartStartY + chartHeight);

  // Etiquetas del eje Y
  pdf.setFontSize(9);
  for (let i = 0; i <= 100; i += 25) {
    const y = chartStartY + chartHeight - (i / 100 * chartHeight);
    pdf.text(`${i}%`, startX - 15, y + 2);
    pdf.setDrawColor(200, 200, 200);
    pdf.line(startX, y, width - 20, y);
  }

  // Dibujar barras
  result.systemScores.forEach((sys, index) => {
    const x = startX + 30 + (index * (barWidth + barSpacing));
    const barHeight = (sys.percentage / 100) * chartHeight;
    const y = chartStartY + chartHeight - barHeight;

    const color = getStatusColor(sys.status);
    pdf.setFillColor(color.r, color.g, color.b);
    pdf.rect(x, y, barWidth, barHeight, 'F');

    // Valor sobre la barra
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.text(`${sys.percentage}%`, x + barWidth / 2, y - 5, { align: 'center' });

    // Etiqueta debajo
    pdf.setFontSize(8);
    const systemName = sys.system.length > 10 ? sys.system.substring(0, 9) + '.' : sys.system;
    pdf.text(systemName, x + barWidth / 2, chartStartY + chartHeight + 8, { 
      align: 'center',
      angle: 45,
      maxWidth: barWidth 
    });
  });

  // Leyenda
  const legendY = chartStartY + chartHeight + 50;
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Interpretación:', 20, legendY);

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  let legendYPos = legendY + 10;

  const statuses = [
    { name: 'Óptimo', range: '0-25%', color: { r: 34, g: 197, b: 94 } },
    { name: 'Normal', range: '26-50%', color: { r: 59, g: 130, b: 246 } },
    { name: 'Regular', range: '51-75%', color: { r: 249, g: 115, b: 22 } },
    { name: 'Crítico', range: '76-100%', color: { r: 239, g: 68, b: 68 } },
  ];

  statuses.forEach(status => {
    pdf.setFillColor(status.color.r, status.color.g, status.color.b);
    pdf.rect(25, legendYPos - 3, 8, 5, 'F');
    pdf.setTextColor(0, 0, 0);
    pdf.text(`${status.name} (${status.range})`, 40, legendYPos);
    legendYPos += 10;
  });
}

/**
 * Página de detalle por sistema
 */
function addSystemDetailPage(pdf: any, system: any, width: number, height: number): void {
  const color = getStatusColor(system.status);

  // Banner de color según estado
  pdf.setFillColor(color.r, color.g, color.b);
  pdf.rect(0, 0, width, 40, 'F');

  // Título del sistema
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Sistema ${system.system}`, width / 2, 25, { align: 'center' });

  // Resetear color
  pdf.setTextColor(0, 0, 0);

  // Información principal
  let yPos = 60;

  // Score box
  pdf.setFillColor(240, 240, 240);
  pdf.rect(20, yPos, width - 40, 50, 'F');
  
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Puntuación', width / 2, yPos + 15, { align: 'center' });

  pdf.setFontSize(32);
  pdf.setTextColor(color.r, color.g, color.b);
  pdf.text(`${system.percentage}%`, width / 2, yPos + 35, { align: 'center' });

  pdf.setFontSize(14);
  pdf.setTextColor(0, 0, 0);
  pdf.text(`(${system.score} de ${system.maxScore} puntos)`, width / 2, yPos + 45, { align: 'center' });

  yPos += 70;

  // Estado
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Estado:', 25, yPos);
  
  pdf.setTextColor(color.r, color.g, color.b);
  pdf.text(system.status, 50, yPos);
  
  pdf.setTextColor(0, 0, 0);
  yPos += 15;

  // Descripción del sistema
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Descripción:', 25, yPos);
  yPos += 10;

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  const description = getSystemDescription(system.system);
  const descLines = pdf.splitTextToSize(description, width - 50);
  pdf.text(descLines, 25, yPos);
  yPos += descLines.length * 7 + 10;

  // Recomendaciones específicas
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Recomendaciones:', 25, yPos);
  yPos += 10;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const recommendations = getSystemRecommendations(system.system, system.status);
  
  recommendations.forEach(rec => {
    const recLines = pdf.splitTextToSize(`• ${rec}`, width - 55);
    pdf.text(recLines, 30, yPos);
    yPos += recLines.length * 6 + 3;
  });
}

/**
 * Página de recomendaciones generales
 */
function addRecommendationsPage(pdf: any, result: WellnessTestResult, width: number, height: number): void {
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Recomendaciones Generales', 20, 20);

  let yPos = 40;

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');

  const criticalSystems = result.systemScores.filter(s => s.status === 'Crítico');
  const regularSystems = result.systemScores.filter(s => s.status === 'Regular');

  if (criticalSystems.length > 0) {
    pdf.setTextColor(239, 68, 68);
    pdf.setFont('helvetica', 'bold');
    pdf.text('⚠ ATENCIÓN PRIORITARIA NECESARIA', 25, yPos);
    yPos += 10;

    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
    const warningText = `Se han detectado ${criticalSystems.length} sistema(s) en estado crítico. Se recomienda consultar con un profesional de la salud lo antes posible.`;
    const warningLines = pdf.splitTextToSize(warningText, width - 50);
    pdf.text(warningLines, 25, yPos);
    yPos += warningLines.length * 7 + 15;
  }

  if (regularSystems.length > 0) {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Sistemas que requieren atención:', 25, yPos);
    yPos += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    regularSystems.forEach(sys => {
      pdf.text(`• ${sys.system} (${sys.percentage}%)`, 30, yPos);
      yPos += 7;
    });
    yPos += 10;
  }

  // Recomendaciones generales
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Hábitos saludables recomendados:', 25, yPos);
  yPos += 10;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');

  const generalRecs = [
    'Mantener una dieta balanceada rica en frutas, verduras y fibra',
    'Realizar ejercicio físico regular (30 minutos al día, 5 días a la semana)',
    'Dormir 7-8 horas diarias en horarios regulares',
    'Practicar técnicas de manejo del estrés (meditación, yoga, respiración profunda)',
    'Mantenerse hidratado (2-3 litros de agua al día)',
    'Evitar el consumo excesivo de alcohol, tabaco y sustancias nocivas',
    'Realizar chequeos médicos preventivos regularmente',
    'Mantener relaciones sociales saludables y apoyo emocional',
  ];

  generalRecs.forEach(rec => {
    const recLines = pdf.splitTextToSize(`• ${rec}`, width - 50);
    pdf.text(recLines, 30, yPos);
    yPos += recLines.length * 6 + 3;
  });

  // Disclaimer
  yPos += 20;
  pdf.setFillColor(255, 243, 205);
  pdf.rect(20, yPos, width - 40, 35, 'F');

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('IMPORTANTE:', 25, yPos + 8);

  pdf.setFont('helvetica', 'normal');
  const disclaimer = 'Este reporte es una herramienta de autoconocimiento y no sustituye el diagnóstico médico profesional. Si experimentas síntomas graves o persistentes, consulta con un profesional de la salud calificado.';
  const disclaimerLines = pdf.splitTextToSize(disclaimer, width - 50);
  pdf.text(disclaimerLines, 25, yPos + 15);

  // Footer
  yPos = height - 15;
  pdf.setTextColor(128, 128, 128);
  pdf.setFontSize(8);
  pdf.text(`Generado el ${new Date().toLocaleDateString('es-ES')}`, width / 2, yPos, { align: 'center' });
}

/**
 * Obtiene color RGB según estado
 */
function getStatusColor(status: string): { r: number; g: number; b: number } {
  switch (status) {
    case 'Óptimo':
      return { r: 34, g: 197, b: 94 };
    case 'Normal':
      return { r: 59, g: 130, b: 246 };
    case 'Regular':
      return { r: 249, g: 115, b: 22 };
    case 'Crítico':
      return { r: 239, g: 68, b: 68 };
    default:
      return { r: 128, g: 128, b: 128 };
  }
}

/**
 * Obtiene descripción del sistema
 */
function getSystemDescription(system: string): string {
  const descriptions: Record<string, string> = {
    'Digestivo': 'El sistema digestivo es responsable de la descomposición de alimentos, absorción de nutrientes y eliminación de desechos. Incluye órganos como el estómago, intestinos, hígado y páncreas.',
    'Nervioso': 'El sistema nervioso controla todas las funciones del cuerpo, procesa información sensorial y coordina movimientos. Comprende el cerebro, médula espinal y nervios periféricos.',
    'Circulatorio': 'El sistema circulatorio transporta sangre, oxígeno, nutrientes y hormonas a todas las células del cuerpo. Incluye el corazón, arterias, venas y capilares.',
    'Respiratorio': 'El sistema respiratorio proporciona oxígeno al cuerpo y elimina dióxido de carbono. Comprende pulmones, tráquea, bronquios y diafragma.',
    'Esquelético': 'El sistema esquelético proporciona estructura, soporte y protección a los órganos vitales. También produce células sanguíneas y almacena minerales.',
    'Muscular': 'El sistema muscular permite el movimiento del cuerpo, mantiene la postura y genera calor. Incluye músculos esqueléticos, lisos y cardíacos.',
  };
  return descriptions[system] || 'Sistema corporal evaluado.';
}

/**
 * Obtiene recomendaciones específicas por sistema y estado
 */
function getSystemRecommendations(system: string, status: string): string[] {
  // Recomendaciones base por sistema
  const baseRecs: Record<string, string[]> = {
    'Digestivo': [
      'Consumir alimentos ricos en fibra (frutas, verduras, cereales integrales)',
      'Evitar comidas copiosas y grasas saturadas',
      'Mantenerse hidratado durante el día',
      'Considerar probióticos para salud intestinal',
    ],
    'Nervioso': [
      'Practicar técnicas de relajación (meditación, mindfulness)',
      'Mantener horarios de sueño regulares',
      'Limitar el consumo de cafeína y alcohol',
      'Realizar actividades que estimulen la mente',
    ],
    'Circulatorio': [
      'Realizar ejercicio cardiovascular regularmente',
      'Reducir consumo de sodio y grasas saturadas',
      'Monitorear presión arterial periódicamente',
      'Evitar el tabaco y moderar el alcohol',
    ],
    'Respiratorio': [
      'Evitar ambientes con humo y contaminación',
      'Practicar ejercicios de respiración profunda',
      'Mantener buena higiene nasal',
      'Considerar ejercicios aeróbicos moderados',
    ],
    'Esquelético': [
      'Consumir suficiente calcio y vitamina D',
      'Mantener buena postura en actividades diarias',
      'Realizar ejercicios de fortalecimiento',
      'Evitar cargar pesos excesivos incorrectamente',
    ],
    'Muscular': [
      'Realizar estiramientos antes y después del ejercicio',
      'Mantener buena hidratación',
      'Consumir proteínas adecuadas en la dieta',
      'Descansar entre sesiones de ejercicio intenso',
    ],
  };

  const recs = baseRecs[system] || ['Consultar con un especialista'];

  // Agregar recomendaciones según severidad
  if (status === 'Crítico') {
    return [
      'URGENTE: Consultar con un profesional de la salud inmediatamente',
      'Mantener registro detallado de síntomas y su frecuencia',
      ...recs,
    ];
  } else if (status === 'Regular') {
    return [
      'Programar consulta médica en las próximas semanas',
      ...recs,
      'Realizar seguimiento regular de síntomas',
    ];
  }

  return recs;
}

/**
 * Descarga el PDF generado
 */
export async function downloadWellnessPDF(result: WellnessTestResult, filename?: string): Promise<void> {
  const blob = await generateWellnessPDF(result);
  
  if (!blob) {
    alert('Error al generar el PDF. Por favor, intenta de nuevo.');
    return;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `reporte-bienestar-${new Date().toISOString().split('T')[0]}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
