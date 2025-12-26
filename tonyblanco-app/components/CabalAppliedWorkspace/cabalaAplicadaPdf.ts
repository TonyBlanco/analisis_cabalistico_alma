'use client';

import { jsPDF } from 'jspdf';

export type CabalaAplicadaGraphicPdfParams = {
  patientName: string;
  patientBirthDate?: string | null;
  selectedMethodId?: string | null;
  interpretationText?: string | null;
  pdfSummary?: {
    sefirotActivas: Array<{ id: string; indice?: number | null; peso?: number | null }>;
    senderosActivos: Array<{ from: string; to: string; peso?: number | null }>;
    repeticiones: Array<{ id: string; tipo?: string | null; veces?: number | null }>;
  };
};

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(new Error(`${label} (timeout ${ms}ms)`));
    }, ms);
    promise
      .then((v) => {
        window.clearTimeout(timeoutId);
        resolve(v);
      })
      .catch((e) => {
        window.clearTimeout(timeoutId);
        reject(e);
      });
  });
}

async function blobToBase64(blob: Blob): Promise<string> {
  const dataUri = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer el PDF (FileReader).'));
    reader.onload = () => resolve(String(reader.result || ''));
    reader.readAsDataURL(blob);
  });
  return String(dataUri).split(',')[1] || '';
}

function safeDateEs() {
  try {
    return new Date().toLocaleDateString('es-ES');
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function splitText(pdf: jsPDF, text: string, maxWidth: number, fontSize: number) {
  pdf.setFontSize(fontSize);
  return pdf.splitTextToSize(text, maxWidth);
}

function fmtNum(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'number') {
    if (Number.isFinite(v)) return String(Math.round(v * 1000) / 1000);
    return '';
  }
  const s = String(v).trim();
  return s;
}

function addWrappedLines(pdf: jsPDF, lines: string[], x: number, y: number, pageHeight: number, margin: number) {
  let curY = y;
  for (const line of lines) {
    if (curY > pageHeight - margin) {
      pdf.addPage();
      curY = margin;
    }
    pdf.text(line, x, curY);
    curY += 5;
  }
  return curY;
}

function assertNoModernColorFunctions(svgMarkup: string) {
  const forbidden = [
    /oklab\s*\(/i,
    /oklch\s*\(/i,
    /lab\s*\(/i,
    /hsl\s*\(/i,
    /var\s*\(/i,
  ];

  const hit = forbidden.find((re) => re.test(svgMarkup));
  if (hit) {
    throw new Error(
      `Export PDF abortado: el SVG contiene color/CSS no permitido (${String(hit)}). ` +
        'El modo PDF solo permite #RRGGBB o rgb(r,g,b) embebido en el SVG.'
    );
  }
}

function getExportTreeSvg(): SVGSVGElement {
  const container = document.getElementById('cabala-aplicada-export-tree');
  if (!container) {
    throw new Error('No se encontró el contenedor del Árbol exportable (cabala-aplicada-export-tree).');
  }
  const svg = container.querySelector('svg');
  if (!svg) {
    throw new Error('No se encontró el SVG del Árbol dentro del contenedor exportable.');
  }
  return svg as SVGSVGElement;
}

export async function generateCabalaAplicadaGraphicPDF(params: CabalaAplicadaGraphicPdfParams): Promise<{
  filename: string;
  base64: string;
}> {
  // Canonical export path: SVG -> PDF. No Tailwind/DOM capture.
  const svg = getExportTreeSvg();
  const svgMarkup = svg.outerHTML;
  assertNoModernColorFunctions(svgMarkup);

  const svg2pdfMod = await import('svg2pdf.js');
  const svg2pdf = (svg2pdfMod as any).svg2pdf ?? (svg2pdfMod as any).default ?? svg2pdfMod;

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 14;

  // Header
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.text('Cábala Aplicada — Informe visual', margin, 18);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text(`Paciente: ${params.patientName}`, margin, 26);
  pdf.text(`Fecha: ${safeDateEs()}`, margin, 32);
  if (params.patientBirthDate) {
    pdf.text(`Nacimiento: ${params.patientBirthDate}`, margin, 38);
  }
  if (params.selectedMethodId) {
    pdf.text(`Método: ${params.selectedMethodId}`, margin, params.patientBirthDate ? 44 : 38);
  }

  // Visual (Tree SVG)
  const headerHeight = params.patientBirthDate ? 50 : 44;
  const availableWidth = pageWidth - margin * 2;
  const availableHeight = pageHeight - headerHeight - margin;

  const viewBox = svg.viewBox?.baseVal;
  const vbWidth = viewBox?.width || 400;
  const vbHeight = viewBox?.height || 600;
  const scale = Math.min(availableWidth / vbWidth, availableHeight / vbHeight);

  // svg2pdf.js uses xOffset/yOffset + scale.
  await withTimeout(
    Promise.resolve(svg2pdf(svg, pdf, { xOffset: margin, yOffset: headerHeight, scale })),
    25_000,
    'Render SVG (svg2pdf)'
  );

  // Data page (plain text only)
  pdf.addPage();
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('Datos estructurales (export)', margin, 18);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);

  const summary = params.pdfSummary;
  const sefirot = summary?.sefirotActivas ?? [];
  const senderos = summary?.senderosActivos ?? [];
  const reps = summary?.repeticiones ?? [];

  let y = 28;
  const maxWidth = pageWidth - margin * 2;

  const headerLines = splitText(
    pdf,
    `Paciente: ${params.patientName}${params.patientBirthDate ? `\nNacimiento: ${params.patientBirthDate}` : ''}${
      params.selectedMethodId ? `\nMétodo: ${params.selectedMethodId}` : ''
    }\nFecha: ${safeDateEs()}`,
    maxWidth,
    10
  );
  y = addWrappedLines(pdf, headerLines.map(String), margin, y, pageHeight, margin) + 2;

  pdf.setFont('helvetica', 'bold');
  pdf.text(`Sefirot activas (${sefirot.length})`, margin, y);
  y += 6;
  pdf.setFont('helvetica', 'normal');
  const sefirotLines = sefirot.length
    ? sefirot.map((s) => {
        const parts = [s.id];
        if (s.indice !== null && s.indice !== undefined && fmtNum(s.indice)) parts.push(`indice=${fmtNum(s.indice)}`);
        if (s.peso !== null && s.peso !== undefined && fmtNum(s.peso)) parts.push(`peso=${fmtNum(s.peso)}`);
        return `- ${parts.join(' · ')}`;
      })
    : ['- (sin datos)'];
  y = addWrappedLines(pdf, splitText(pdf, sefirotLines.join('\n'), maxWidth, 10).map(String), margin, y, pageHeight, margin) + 2;

  pdf.setFont('helvetica', 'bold');
  pdf.text(`Senderos activos (${senderos.length})`, margin, y);
  y += 6;
  pdf.setFont('helvetica', 'normal');
  const senderosLines = senderos.length
    ? senderos.map((s) => {
        const parts = [`${s.from}→${s.to}`];
        if (s.peso !== null && s.peso !== undefined && fmtNum(s.peso)) parts.push(`peso=${fmtNum(s.peso)}`);
        return `- ${parts.join(' · ')}`;
      })
    : ['- (sin datos)'];
  y = addWrappedLines(pdf, splitText(pdf, senderosLines.join('\n'), maxWidth, 10).map(String), margin, y, pageHeight, margin) + 2;

  pdf.setFont('helvetica', 'bold');
  pdf.text(`Repeticiones (${reps.length})`, margin, y);
  y += 6;
  pdf.setFont('helvetica', 'normal');
  const repLines = reps.length
    ? reps.map((r) => {
        const parts = [r.id];
        if (r.tipo) parts.push(`tipo=${r.tipo}`);
        if (r.veces !== null && r.veces !== undefined && fmtNum(r.veces)) parts.push(`veces=${fmtNum(r.veces)}`);
        return `- ${parts.join(' · ')}`;
      })
    : ['- (sin datos)'];
  addWrappedLines(pdf, splitText(pdf, repLines.join('\n'), maxWidth, 10).map(String), margin, y, pageHeight, margin);

  // Interpretation page
  pdf.addPage();
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('Interpretación simbólica (educativa)', margin, 18);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);

  const interpretation = (params.interpretationText || '').trim();
  const bodyText = interpretation
    ? interpretation
    : 'Sin interpretación generada en esta sesión. (Opcional: generar interpretación educativa desde el panel interno antes de exportar.)';

  const lines = splitText(pdf, bodyText, pageWidth - margin * 2, 10);
  let curY = 28;
  for (const line of lines) {
    if (curY > pageHeight - margin) {
      pdf.addPage();
      curY = margin;
    }
    pdf.text(String(line), margin, curY);
    curY += 5;
  }

  // Disclaimer
  pdf.addPage();
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('Aviso profesional', margin, 18);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);

  const disclaimer = `Este documento es un material simbólico y educativo.

No constituye diagnóstico médico ni psicológico, ni sustituye tratamiento profesional.

La lectura requiere contexto clínico y criterio humano del terapeuta.`;

  const dLines = splitText(pdf, disclaimer, pageWidth - margin * 2, 11);
  curY = 30;
  for (const line of dLines) {
    pdf.text(String(line), margin, curY);
    curY += 6;
  }

  // Footer watermark
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(170, 170, 170);
    pdf.text('Documento simbólico · No médico', pageWidth / 2, pageHeight - 8, { align: 'center' });
    pdf.setTextColor(0, 0, 0);
  }

  const todayIso = new Date().toISOString().slice(0, 10);
  const filename = `Cabala_Aplicada_${params.patientName.replace(/\s+/g, '_')}_${todayIso}.pdf`;

  // Save locally
  pdf.save(filename);

  // Persist-friendly base64 (without data: prefix)
  const base64 = await withTimeout(blobToBase64(pdf.output('blob')), 30_000, 'Codificación base64 (PDF)');

  return { filename, base64 };
}
