'use client';

import { SandboxScore } from './sandboxScoring';
import { logEvent } from './eventLogger';

type ExportableRow = Record<string, string | number | null | undefined>;

function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function toCSV(rows: ExportableRow[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];
  rows.forEach((row) => {
    lines.push(
      headers
        .map((h) => {
          const value = row[h];
          const text = value == null ? '' : String(value);
          return `"${text.replace(/"/g, '""')}"`;
        })
        .join(',')
    );
  });
  return lines.join('\n');
}

export function exportCSV(filename: string, rows: ExportableRow[]) {
  const csv = toCSV(rows);
  downloadFile(filename, csv, 'text/csv');
  logEvent('EXPORT_CLICK', { filename, type: 'csv', rows: rows.length });
}

export function exportTXT(filename: string, lines: string[]) {
  downloadFile(filename, lines.join('\n'), 'text/plain');
  logEvent('EXPORT_CLICK', { filename, type: 'txt', lines: lines.length });
}

export function buildConfigAuditLines(config: Record<string, string | number | undefined>): string[] {
  return Object.entries(config).map(([key, val]) => `${key}: ${val ?? '-'}`);
}

export function buildScoresRows(scores: SandboxScore[]): ExportableRow[] {
  return scores.map((s) => ({
    id: s.id,
    name: s.name,
    value: s.value,
    variables: s.variablesUsed.join('|'),
    formula: s.formulaText,
    limitations: s.limitationsText,
  }));
}
