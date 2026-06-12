'use client';

import { jsPDF } from 'jspdf';
import { formatFormativeBriefPdfLines } from './formativeBriefContent';

export type CabalaReportInclude = {
  tree: boolean;
  estructurales: boolean;
  metodo: boolean;
  actividad: boolean;
  ia: boolean;
  formativa: boolean;
};

export type CabalaActivityPdfItem = {
  label: string;
  tipo: string;
  fecha: string | null;
};

export type CabalaAplicadaGraphicPdfParams = {
  patientName: string;
  patientBirthDate?: string | null;
  selectedMethodId?: string | null;
  methodName?: string | null;
  interpretationText?: string | null;
  gematriaInterpretacion?: Record<string, unknown> | null;
  formativeBrief?: Record<string, unknown> | null;
  activity?: CabalaActivityPdfItem[];
  include?: Partial<CabalaReportInclude>;
  pdfSummary?: {
    sefirotActivas: Array<{ id: string; indice?: number | null; peso?: number | null }>;
    senderosActivos: Array<{ from: string; to: string; peso?: number | null }>;
    repeticiones: Array<{ id: string; tipo?: string | null; veces?: number | null }>;
  };
};

export type ReportSection = { title: string; lines: string[] };

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

function formatDateEs(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  try {
    return d.toLocaleString('es-ES');
  } catch {
    return iso;
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

function tryGetExportTreeSvg(): SVGSVGElement | null {
  if (typeof document === 'undefined') return null;
  const container = document.getElementById('cabala-aplicada-export-tree');
  if (!container) return null;
  const svg = container.querySelector('svg');
  return (svg as SVGSVGElement) || null;
}

function asText(v: unknown): string | null {
  if (typeof v === 'string') {
    const t = v.trim();
    return t || null;
  }
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  return null;
}

function asLines(v: unknown): string[] {
  if (Array.isArray(v)) {
    return v.map((x) => asText(x)).filter((s): s is string => Boolean(s));
  }
  const t = asText(v);
  return t ? [t] : [];
}

function getField(obj: unknown, key: string): unknown {
  if (obj && typeof obj === 'object') {
    return (obj as Record<string, unknown>)[key];
  }
  return undefined;
}

export function normalizeInclude(include?: Partial<CabalaReportInclude>): CabalaReportInclude {
  return {
    tree: include?.tree !== false,
    estructurales: include?.estructurales !== false,
    metodo: include?.metodo !== false,
    actividad: include?.actividad !== false,
    ia: include?.ia === true,
    formativa: include?.formativa !== false,
  };
}

export function buildReportSections(params: CabalaAplicadaGraphicPdfParams): ReportSection[] {
  const include = normalizeInclude(params.include);
  const sections: ReportSection[] = [];

  if (include.metodo) {
    const gi = params.gematriaInterpretacion;
    const lines: string[] = [];

    const nombre =
      asText(getField(gi, 'nombreMetodo')) ??
      asText(params.methodName) ??
      asText(params.selectedMethodId);
    if (nombre) lines.push(`Método: ${nombre}`);

    const queEs = asText(getField(gi, 'queEs'));
    if (queEs) lines.push('', 'Qué es:', queEs);

    const como = asText(getField(gi, 'comoSeCalcula'));
    if (como) lines.push('', 'Cómo se calcula:', como);

    const ln = getField(gi, 'lecturaNumeros');
    const lnLines: string[] = [];
    const esencia = asText(getField(ln, 'esencia'));
    const expresion = asText(getField(ln, 'expresion'));
    const herencia = asText(getField(ln, 'herencia'));
    const caminoVida = asText(getField(ln, 'caminoVida'));
    if (esencia) lnLines.push(`- Esencia: ${esencia}`);
    if (expresion) lnLines.push(`- Expresión: ${expresion}`);
    if (herencia) lnLines.push(`- Herencia: ${herencia}`);
    if (caminoVida) lnLines.push(`- Camino de vida: ${caminoVida}`);
    if (lnLines.length) lines.push('', 'Lectura de números:', ...lnLines);

    const casas = asLines(getField(gi, 'lecturaCasas'));
    if (casas.length) lines.push('', 'Lectura de casas:', ...casas.map((c) => `- ${c}`));

    const equivalencias = asLines(getField(gi, 'equivalencias'));
    if (equivalencias.length) lines.push('', 'Equivalencias:', ...equivalencias.map((e) => `- ${e}`));

    const sintesis = asText(getField(gi, 'sintesis'));
    if (sintesis) lines.push('', 'Síntesis:', sintesis);

    const utilidad = asText(getField(gi, 'utilidadTerapeutica'));
    if (utilidad) lines.push('', 'Cómo ayuda al paciente:', utilidad);

    const avisos = asLines(getField(gi, 'avisos'));
    if (avisos.length) lines.push('', 'Avisos:', ...avisos.map((a) => `- ${a}`));

    if (!lines.length) lines.push('(sin datos en esta sesión)');
    sections.push({ title: 'Interpretación del método', lines });
  }

  if (include.formativa) {
    sections.push({
      title: 'Síntesis formativa',
      lines: formatFormativeBriefPdfLines(params.formativeBrief),
    });
  }

  if (include.estructurales) {
    const summary = params.pdfSummary;
    const sefirot = summary?.sefirotActivas ?? [];
    const senderos = summary?.senderosActivos ?? [];
    const reps = summary?.repeticiones ?? [];
    const lines: string[] = [];

    lines.push(`Sefirot activas (${sefirot.length})`);
    if (sefirot.length) {
      for (const s of sefirot) {
        const parts = [s.id];
        if (s.indice !== null && s.indice !== undefined && fmtNum(s.indice)) parts.push(`indice=${fmtNum(s.indice)}`);
        if (s.peso !== null && s.peso !== undefined && fmtNum(s.peso)) parts.push(`peso=${fmtNum(s.peso)}`);
        lines.push(`- ${parts.join(' · ')}`);
      }
    } else {
      lines.push('- (sin datos)');
    }

    lines.push('', `Senderos activos (${senderos.length})`);
    if (senderos.length) {
      for (const s of senderos) {
        const parts = [`${s.from}→${s.to}`];
        if (s.peso !== null && s.peso !== undefined && fmtNum(s.peso)) parts.push(`peso=${fmtNum(s.peso)}`);
        lines.push(`- ${parts.join(' · ')}`);
      }
    } else {
      lines.push('- (sin datos)');
    }

    lines.push('', `Repeticiones (${reps.length})`);
    if (reps.length) {
      for (const r of reps) {
        const parts = [r.id];
        if (r.tipo) parts.push(`tipo=${r.tipo}`);
        if (r.veces !== null && r.veces !== undefined && fmtNum(r.veces)) parts.push(`veces=${fmtNum(r.veces)}`);
        lines.push(`- ${parts.join(' · ')}`);
      }
    } else {
      lines.push('- (sin datos)');
    }

    sections.push({ title: 'Datos estructurales (export)', lines });
  }

  if (include.actividad) {
    const activity = params.activity ?? [];
    const lines: string[] = [];
    if (activity.length) {
      for (const a of activity) {
        lines.push(`- ${formatDateEs(a.fecha)} · ${a.label} (${a.tipo})`);
      }
    } else {
      lines.push('(sin actividad registrada en esta sesión)');
    }
    sections.push({ title: 'Actividad de la sesión', lines });
  }

  if (include.ia) {
    const ia = asText(params.interpretationText);
    const lines = ia ? [ia] : ['(sin interpretación IA generada en esta sesión)'];
    sections.push({ title: 'Lectura simbólica asistida (IA)', lines });
  }

  return sections;
}

export async function generateCabalaAplicadaGraphicPDF(params: CabalaAplicadaGraphicPdfParams): Promise<{
  filename: string;
  base64: string;
}> {
  const include = normalizeInclude(params.include);

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 14;
  const maxWidth = pageWidth - margin * 2;

  // Cover header
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.text('Cábala Aplicada — Informe', margin, 18);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text(`Paciente: ${params.patientName}`, margin, 26);
  pdf.text(`Fecha: ${safeDateEs()}`, margin, 32);
  let coverY = 38;
  if (params.patientBirthDate) {
    pdf.text(`Nacimiento: ${params.patientBirthDate}`, margin, coverY);
    coverY += 6;
  }
  const metodoLabel = params.methodName || params.selectedMethodId;
  if (metodoLabel) {
    pdf.text(`Método: ${metodoLabel}`, margin, coverY);
    coverY += 6;
  }

  // Visual (Tree SVG), optional and tolerant to absence
  let svg: SVGSVGElement | null = null;
  if (include.tree) {
    svg = tryGetExportTreeSvg();
  }
  if (svg) {
    const svgMarkup = svg.outerHTML;
    assertNoModernColorFunctions(svgMarkup);

    const svg2pdfMod = await import('svg2pdf.js');
    const svg2pdf = (svg2pdfMod as any).svg2pdf ?? (svg2pdfMod as any).default ?? svg2pdfMod;

    const headerHeight = coverY + 4;
    const availableWidth = pageWidth - margin * 2;
    const availableHeight = pageHeight - headerHeight - margin;

    const viewBox = svg.viewBox?.baseVal;
    const vbWidth = viewBox?.width || 400;
    const vbHeight = viewBox?.height || 600;
    const scale = Math.min(availableWidth / vbWidth, availableHeight / vbHeight);

    await withTimeout(
      Promise.resolve(svg2pdf(svg, pdf, { xOffset: margin, yOffset: headerHeight, scale })),
      25_000,
      'Render SVG (svg2pdf)'
    );
  } else if (include.tree) {
    pdf.setFontSize(10);
    pdf.text('Árbol no disponible para exportar en esta sesión.', margin, coverY + 4);
  }

  // Text sections
  const sections = buildReportSections(params);
  for (const section of sections) {
    pdf.addPage();
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text(section.title, margin, 18);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);

    let y = 28;
    for (const logicalLine of section.lines) {
      if (logicalLine === '') {
        y += 3;
        if (y > pageHeight - margin) {
          pdf.addPage();
          y = margin;
        }
        continue;
      }
      const wrapped = splitText(pdf, logicalLine, maxWidth, 10).map(String);
      y = addWrappedLines(pdf, wrapped, margin, y, pageHeight, margin);
    }
  }

  // Disclaimer
  pdf.addPage();
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('Aviso profesional', margin, 18);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);

  const disclaimer = `Este documento es un material simbólico y educativo.\n\nNo constituye diagnóstico médico ni psicológico, ni sustituye tratamiento profesional.\n\nLa lectura requiere contexto clínico y criterio humano del terapeuta.`;

  const dLines = splitText(pdf, disclaimer, pageWidth - margin * 2, 11);
  let curY = 30;
  for (const line of dLines) {
    if (curY > pageHeight - margin) {
      pdf.addPage();
      curY = margin;
    }
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

  pdf.save(filename);

  const base64 = await withTimeout(blobToBase64(pdf.output('blob')), 30_000, 'Codificación base64 (PDF)');

  return { filename, base64 };
}
