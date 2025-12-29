'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  CheckCircle, 
  AlertCircle, 
  ChevronRight, 
  Calendar,
  Download,
  Loader2
} from 'lucide-react';
import { setActivePatientId } from '@/lib/active-patient';
import { openPrintableReport } from '@/lib/report-printing';
import { getApiBaseUrl } from '@/lib/api-base';

const API_URL = getApiBaseUrl();

interface NatalChartSummary {
  calculated_at: string | null;
  house_system: string | null;
  zodiac_type: string | null;
  planet_count: number;
}

interface CabalisticAnalysis {
  id: number;
  analysis_type: string;
  analysis_type_display: string;
  created_at: string | null;
  brief_summary: string;
}

interface TestResult {
  id: number;
  test_name: string;
  test_code: string | null;
  completed_at: string | null;
  severity_label: string;
}

interface SymbolicOverview {
  patient_id: number;
  patient_name: string;
  has_natal_chart: boolean;
  natal_chart_summary: NatalChartSummary | null;
  cabalistic_analyses: CabalisticAnalysis[];
  test_results: TestResult[];
  completeness_score: number;
  modules_completed: string[];
  missing_modules: string[];
}

interface PatientSymbolicOverviewProps {
  patientId: string | number;
}

export default function PatientSymbolicOverview({ patientId }: PatientSymbolicOverviewProps) {
  const [overview, setOverview] = useState<SymbolicOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportLevel, setExportLevel] = useState<'summary' | 'audit'>('summary');

  const activatePatient = () => {
    const parsedId = typeof patientId === 'string' ? parseInt(patientId, 10) : patientId;
    if (!parsedId || Number.isNaN(parsedId)) {
      return;
    }

    setActivePatientId(parsedId, overview?.patient_name ?? null);
    // Some workspaces listen to this event (in addition to storage).
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('activePatientChanged'));
    }
  };

  useEffect(() => {
    if (!patientId) {
      setError('No patient selected');
      setLoading(false);
      return;
    }

    const fetchOverview = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      if (!token) {
        setError('No auth token found');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/therapist/patients/${patientId}/symbolic-overview/`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Token ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || `Failed to fetch overview (${response.status})`);
        }

        const data = await response.json();
        setOverview(data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching symbolic overview:', err);
        setError(err.message || 'Failed to load overview');
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, [patientId]);

  const downloadFile = (filename: string, content: string, mimeType: string) => {
    if (typeof window === 'undefined') return;
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const sanitizeFilename = (value: string) => {
    return value
      .trim()
      .replace(/[\\/:*?"<>|]/g, '_')
      .replace(/\s+/g, '_')
      .slice(0, 80);
  };

  const handleExportHolistic = async () => {
    if (exporting) return;
    setExportError(null);

    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token) {
      setExportError('No auth token found');
      return;
    }

    setExporting(true);
    try {
      const res = await fetch(`${API_URL}/therapist/patients/${patientId}/holistic-exports/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          selected_sections: {
            astrology: true,
            tests: true,
            tarot: true,
            kabbalah: true,
            bioemotional: true,
          },
          level: exportLevel,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || body.message || `Failed to export (${res.status})`);
      }

      const data = await res.json();
      const exportObj = data?.export;
      const markdown = exportObj?.markdown;

      const today = new Date().toISOString().slice(0, 10);
      const patientName = sanitizeFilename(overview?.patient_name || `patient_${patientId}`);
      const base = `holistic_export_${patientName}_${today}`;

      if (typeof markdown === 'string' && markdown.trim()) {
        openPrintableReport({
          title: 'Reporte holístico (Terapeuta)',
          subtitle: overview?.patient_name || null,
          markdown,
        });
      } else {
        // Fallback: si por alguna razón no hay markdown, guardar JSON.
        downloadFile(`${base}.json`, JSON.stringify(exportObj ?? data, null, 2), 'application/json;charset=utf-8');
      }
    } catch (err: any) {
      console.error('Error exporting holistic data:', err);
      setExportError(err?.message || 'No se pudo exportar.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div>
            <p className="font-medium text-red-900">Error loading overview</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-gray-600">No overview data available</p>
      </div>
    );
  }

  const getCompletenessColor = (score: number) => {
    if (score >= 75) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getSeverityColor = (severity: string) => {
    const s = (severity || '').toLowerCase();
    if (s.includes('severe') || s.includes('grave')) return 'text-red-700 bg-red-100';
    if (s.includes('moderate') || s.includes('moderado')) return 'text-amber-700 bg-amber-100';
    if (s.includes('mild') || s.includes('leve')) return 'text-yellow-700 bg-yellow-100';
    return 'text-gray-700 bg-gray-100';
  };

  return (
    <div className="space-y-6">
      {/* Header con completeness score */}
      <div className={`p-6 border rounded-lg ${getCompletenessColor(overview.completeness_score)}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Análisis completado</h3>
            <p className="text-sm opacity-90 mt-1">
              {overview.modules_completed.length} de 4 módulos simbólicos analizados
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{overview.completeness_score}%</div>
            <div className="text-xs opacity-75 mt-1">Completitud</div>
          </div>
        </div>

        {overview.missing_modules.length > 0 && (
          <div className="mt-4 pt-4 border-t border-current/20">
            <p className="text-sm font-medium mb-2">Módulos pendientes:</p>
            <ul className="text-sm space-y-1">
              {overview.missing_modules.map((module) => (
                <li key={module} className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {module}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Astrología (Carta Natal) */}
      <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              overview.has_natal_chart ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
            }`}>
              {overview.has_natal_chart ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Astrología (Carta Natal)</h3>
              <p className="text-xs text-gray-500">
                {overview.has_natal_chart ? 'Calculada y disponible' : 'Sin calcular'}
              </p>
            </div>
          </div>
          {overview.has_natal_chart && (
            <Link
              href={`/dashboard/therapist/astrologia`}
              onClick={activatePatient}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              Ver carta
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {overview.natal_chart_summary && (
          <div className="px-6 py-4 space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar className="h-4 w-4 text-gray-400" />
              Calculada: {overview.natal_chart_summary.calculated_at 
                ? new Date(overview.natal_chart_summary.calculated_at).toLocaleString('es-ES')
                : '—'}
            </div>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <span className="text-xs text-gray-500">Sistema de casas</span>
                <p className="font-medium text-gray-900">{overview.natal_chart_summary.house_system || '—'}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Zodíaco</span>
                <p className="font-medium text-gray-900">{overview.natal_chart_summary.zodiac_type || '—'}</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Análisis Cabalísticos (Tarot, Gematria, etc.) */}
      <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">Análisis simbólicos guardados</h3>
          <p className="text-xs text-gray-500 mt-1">
            {overview.cabalistic_analyses.length} análisis registrados
          </p>
        </div>

        {overview.cabalistic_analyses.length === 0 ? (
          <div className="px-6 py-4 text-sm text-gray-600">
            No hay análisis simbólicos guardados aún.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {overview.cabalistic_analyses.slice(0, 5).map((analysis) => (
              <div key={analysis.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{analysis.analysis_type_display}</div>
                    <div className="text-sm text-gray-600 mt-1">{analysis.brief_summary}</div>
                    <div className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {analysis.created_at 
                        ? new Date(analysis.created_at).toLocaleString('es-ES')
                        : '—'}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Tests Psicométricos */}
      <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">Tests psicométricos</h3>
          <p className="text-xs text-gray-500 mt-1">
            {overview.test_results.length} tests completados
          </p>
        </div>

        {overview.test_results.length === 0 ? (
          <div className="px-6 py-4 text-sm text-gray-600">
            No hay tests completados aún.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {overview.test_results.slice(0, 5).map((test) => (
              <Link
                key={test.id}
                href={`/dashboard/therapist/tests/results/${test.id}`}
                onClick={activatePatient}
                className="block px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{test.test_name}</div>
                    {test.severity_label && (
                      <span
                        className={`inline-block text-xs px-2 py-1 rounded-full mt-2 ${getSeverityColor(test.severity_label)}`}
                      >
                        {test.severity_label}
                      </span>
                    )}
                    <div className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {test.completed_at
                        ? new Date(test.completed_at).toLocaleString('es-ES')
                        : '—'}
                    </div>
                  </div>
                  <span className="text-blue-600 hover:text-blue-700" aria-hidden="true">
                    <ChevronRight className="h-5 w-5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          href={`/dashboard/therapist/astrologia`}
          onClick={activatePatient}
          className="block p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-blue-900">Calcular carta natal</p>
              <p className="text-xs text-blue-700 mt-1">Astrología simbólica</p>
            </div>
            <ChevronRight className="h-5 w-5 text-blue-600" />
          </div>
        </Link>

        <Link
          href={`/dashboard/therapist/tarot`}
          onClick={activatePatient}
          className="block p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-purple-900">Nueva lectura tarot</p>
              <p className="text-xs text-purple-700 mt-1">Tirada terapéutica</p>
            </div>
            <ChevronRight className="h-5 w-5 text-purple-600" />
          </div>
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-gray-900">Export holístico</p>
            <p className="text-xs text-gray-600 mt-1">
              Genera un reporte imprimible (PDF) y lo guarda en el historial.
            </p>
          </div>
          <label className="flex items-center gap-2 text-xs text-gray-700">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={exportLevel === 'audit'}
              disabled={exporting}
              onChange={(e) => setExportLevel(e.target.checked ? 'audit' : 'summary')}
            />
            Nivel audit
          </label>
          <button
            type="button"
            onClick={handleExportHolistic}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {exporting ? 'Exportando…' : 'Exportar PDF'}
          </button>
        </div>
        {exportError && <p className="text-xs text-red-600 mt-2">{exportError}</p>}
      </div>
    </div>
  );
}
