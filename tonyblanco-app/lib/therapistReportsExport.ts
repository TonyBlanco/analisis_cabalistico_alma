import type { TherapistReportsSummary } from '@/lib/types/therapist-reports';

function csvEscape(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return '';
  const text = String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  return new Date(iso).toLocaleString('es-ES');
}

export function buildTherapistReportsCsv(summary: TherapistReportsSummary): string {
  const lines: string[] = [];

  lines.push('Sección,Clave,Valor');
  lines.push(`Resumen,Generado,${csvEscape(formatDate(summary.generated_at))}`);
  lines.push(`Resumen,Consultantes activos,${summary.portfolio.total.patients_active ?? 0}`);
  lines.push(`Resumen,Tests asignados (total),${summary.portfolio.total.tests_assigned}`);
  lines.push(`Resumen,Tests pendientes (total),${summary.portfolio.total.tests_pending}`);
  lines.push(`Resumen,Tests completados (total),${summary.portfolio.total.tests_completed}`);
  lines.push(`Resumen,Tests asignados (30d),${summary.portfolio.last_30_days.tests_assigned}`);
  lines.push(`Resumen,Tests pendientes (30d),${summary.portfolio.last_30_days.tests_pending}`);
  lines.push(`Resumen,Tests completados (30d),${summary.portfolio.last_30_days.tests_completed}`);
  lines.push(`Resumen,Alertas abiertas,${summary.alerts_open}`);
  lines.push(`Resumen,Sesiones (total),${summary.sessions.total}`);
  lines.push(`Resumen,Sesiones (30d),${summary.sessions.last_30_days}`);
  lines.push('');

  lines.push('Resultados recientes');
  lines.push('Paciente,Test,Código,Fecha,Severidad,Referral,Alerta,Enlace');
  for (const row of summary.recent_results) {
    lines.push(
      [
        csvEscape(row.patient_display_name),
        csvEscape(row.test_name),
        csvEscape(row.test_code),
        csvEscape(formatDate(row.completed_at)),
        csvEscape(row.severity_label),
        row.referral_recommended ? 'sí' : 'no',
        row.alert ? 'sí' : 'no',
        csvEscape(row.href),
      ].join(',')
    );
  }
  lines.push('');

  lines.push('Consultantes');
  lines.push('Nombre,Estado,Asignados,Pendientes,Completados,Alertas,Sesiones,Última actividad');
  for (const patient of summary.patients) {
    lines.push(
      [
        csvEscape(patient.display_name),
        csvEscape(patient.therapy_status),
        patient.tests.assigned,
        patient.tests.pending,
        patient.tests.completed,
        patient.alerts_open,
        patient.sessions_count,
        csvEscape(formatDate(patient.last_activity_at)),
      ].join(',')
    );
  }

  return lines.join('\n');
}

export function downloadTherapistReportsCsv(summary: TherapistReportsSummary): void {
  const csv = buildTherapistReportsCsv(summary);
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const stamp = new Date().toISOString().slice(0, 10);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `reportes-terapeuta-${stamp}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function copyTherapistReportsSummary(summary: TherapistReportsSummary): Promise<void> {
  const total = summary.portfolio.total;
  const window30 = summary.portfolio.last_30_days;
  const text = [
    'Reportes terapeuta — resumen',
    `Generado: ${formatDate(summary.generated_at)}`,
    '',
    `Consultantes activos: ${total.patients_active ?? 0}`,
    `Tests — total: ${total.tests_assigned} asignados, ${total.tests_pending} pendientes, ${total.tests_completed} completados`,
    `Tests — últimos 30 días: ${window30.tests_assigned} asignados, ${window30.tests_pending} pendientes, ${window30.tests_completed} completados`,
    `Alertas abiertas: ${summary.alerts_open}`,
    `Sesiones: ${summary.sessions.total} total, ${summary.sessions.last_30_days} en 30 días`,
    '',
    summary.disclaimer,
  ].join('\n');

  await navigator.clipboard.writeText(text);
}