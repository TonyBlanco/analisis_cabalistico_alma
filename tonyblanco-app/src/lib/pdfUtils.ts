import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface HolisticSynthesis {
  scores: Record<string, number>;
  color_alerts: Record<string, string>;
  axis_contributions: Record<string, any[]>;
  metadata: {
    total_records: number;
    computed_at: string;
    patient_id: number;
  };
}

interface AIAnalysis {
  dominant_themes: string[];
  priority_axes: string[];
  recurrent_patterns: string[];
  areas_of_progress: string[];
  areas_of_stagnation: string[];
  evaluated_summary: string;
  confidence_level: 'low' | 'medium' | 'high';
  limits_notice: string;
}

interface AnalysisRecord {
  id: string;
  kind: string;
  computed_result: HolisticSynthesis;
  raw_input: {
    ai_analysis: AIAnalysis;
  };
  therapist_annotations?: {
    summary?: string;
    notes?: string;
    therapist_validation?: boolean;
  };
  created_at: string;
}

const AXIS_NAMES: Record<string, string> = {
  identity_purpose: 'Identidad y Propósito',
  emotion_regulation: 'Emoción y Regulación',
  relationships_bonds: 'Relaciones y Vínculos',
  vital_energy: 'Energía Vital y Cuerpo Simbólico',
  cycles_change: 'Ciclos y Procesos de Cambio',
  memory_lineage: 'Memoria y Linaje Transgeneracional'
};

const COLOR_DESCRIPTIONS: Record<string, string> = {
  verde: 'Área integrada',
  amarillo: 'Área en proceso',
  naranja: 'Área que merece atención consciente',
  rojo: 'Área importante para explorar con acompañamiento'
};

export async function generateMSHEPDF(
  synthesisRecord: AnalysisRecord,
  patientName: string,
  therapistName: string
): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  let currentY = margin;

  // Helper function to add text with word wrapping
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return y + (lines.length * fontSize * 0.4);
  };

  // Helper function to check if we need a new page
  const checkNewPage = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - margin) {
      pdf.addPage();
      currentY = margin;
    }
  };

  // Cover Page
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Síntesis Holística Evaluativa', pageWidth / 2, currentY + 30, { align: 'center' });

  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Lectura Simbólica Orientativa', pageWidth / 2, currentY + 50, { align: 'center' });

  pdf.setFontSize(12);
  pdf.text(`Paciente: ${patientName}`, margin, currentY + 80);
  pdf.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, margin, currentY + 95);
  pdf.text(`Terapeuta: ${therapistName}`, margin, currentY + 110);

  // Watermark
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text('Documento simbólico · No médico', pageWidth / 2, pageHeight - 20, { align: 'center' });
  pdf.setTextColor(0, 0, 0);

  // Section 1: Resumen General
  pdf.addPage();
  currentY = margin;

  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('1. Resumen General', margin, currentY);
  currentY += 20;

  if (synthesisRecord.therapist_annotations?.summary) {
    currentY = addWrappedText(
      synthesisRecord.therapist_annotations.summary,
      margin,
      currentY,
      pageWidth - (margin * 2),
      11
    );
  } else {
    currentY = addWrappedText(
      'Resumen no disponible - pendiente de validación terapéutica.',
      margin,
      currentY,
      pageWidth - (margin * 2),
      11
    );
  }

  // Section 2: Áreas de Conciencia
  checkNewPage(100);
  currentY += 20;

  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('2. Áreas de Conciencia', margin, currentY);
  currentY += 20;

  // Table header
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Área', margin, currentY);
  pdf.text('Estado', pageWidth - margin - 60, currentY, { align: 'center' });
  currentY += 10;

  // Table rows
  pdf.setFont('helvetica', 'normal');
  Object.entries(synthesisRecord.computed_result.color_alerts).forEach(([axis, color]) => {
    checkNewPage(15);
    pdf.text(AXIS_NAMES[axis] || axis, margin, currentY);
    pdf.text(COLOR_DESCRIPTIONS[color] || color, pageWidth - margin - 60, currentY, { align: 'center' });
    currentY += 8;
  });

  // Color legend
  currentY += 10;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'italic');
  pdf.text('Leyenda de colores:', margin, currentY);
  currentY += 8;
  Object.entries(COLOR_DESCRIPTIONS).forEach(([color, desc]) => {
    checkNewPage(8);
    pdf.text(`• ${desc}`, margin + 10, currentY);
    currentY += 6;
  });

  // Section 3: Evolución (simplified for PDF)
  checkNewPage(60);
  currentY += 20;

  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('3. Evolución Personal', margin, currentY);
  currentY += 20;

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  currentY = addWrappedText(
    'Esta evaluación representa un momento específico en el proceso personal del paciente. ' +
    'Los cambios observados a lo largo del tiempo reflejan evolución en diferentes áreas de conciencia.',
    margin,
    currentY,
    pageWidth - (margin * 2),
    10
  );

  // Section 4: Conclusión del Terapeuta
  checkNewPage(80);
  currentY += 20;

  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('4. Conclusión del Terapeuta', margin, currentY);
  currentY += 20;

  if (synthesisRecord.therapist_annotations?.summary) {
    currentY = addWrappedText(
      synthesisRecord.therapist_annotations.summary,
      margin,
      currentY,
      pageWidth - (margin * 2),
      11
    );
  }

  // Therapist signature
  checkNewPage(40);
  currentY += 20;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Terapeuta: ${therapistName}`, margin, currentY);
  pdf.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, margin, currentY + 15);

  // Ethical Notice (Final Page)
  pdf.addPage();
  currentY = margin;

  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Aviso Ético Importante', pageWidth / 2, currentY + 30, { align: 'center' });

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  const ethicalText = `Este documento no constituye diagnóstico médico ni psicológico.

Es una herramienta simbólica de reflexión y acompañamiento que integra diferentes perspectivas holísticas del proceso personal.

Las interpretaciones contenidas son orientativas y requieren siempre del discernimiento y acompañamiento profesional.

Esta evaluación no sustituye tratamientos médicos, psicológicos o terapéuticos convencionales.`;

  currentY = addWrappedText(ethicalText, margin, currentY + 60, pageWidth - (margin * 2), 11);

  // Footer watermark on all pages
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(200, 200, 200);
    pdf.text('Documento simbólico · No médico', pageWidth / 2, pageHeight - 10, { align: 'center' });
    pdf.setTextColor(0, 0, 0);
  }

  // Save the PDF
  const fileName = `Sintesis_Holistica_${patientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
}