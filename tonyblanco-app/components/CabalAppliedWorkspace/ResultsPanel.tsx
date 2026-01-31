'use client';

/**
 * ResultsPanel.tsx - P1.3 Mejora de UX de Resultados
 * 
 * Panel de resultados con historial de sesión y exportación.
 * Este componente es OBSERVACIONAL - muestra datos, no interpreta.
 */

import { useState, useCallback } from 'react';
import { Download, FileJson, FileText, Trash2, Clock, ChevronRight } from 'lucide-react';

/**
 * Execution result structure
 */
export interface ExecutionResult {
  id: string;
  method_id: string;
  method_name: string;
  timestamp: Date;
  input_data: Record<string, unknown>;
  output_data: Record<string, unknown>;
  tree_state?: Record<string, unknown>;
}

interface ResultsPanelProps {
  onResultSaved?: (result: ExecutionResult) => void;
}

/**
 * Downloads a file blob
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Downloads result as JSON
 */
function downloadJSON(result: ExecutionResult) {
  const blob = new Blob([JSON.stringify(result, null, 2)], {
    type: 'application/json;charset=utf-8'
  });
  downloadBlob(blob, `cabala_${result.method_id}_${Date.now()}.json`);
}

/**
 * Formats result as plain text
 */
function formatResultAsText(result: ExecutionResult): string {
  const formatData = (data: unknown, indent = 0): string => {
    if (data === null || data === undefined) return '(vacío)';
    if (typeof data !== 'object') return String(data);
    
    const prefix = '  '.repeat(indent);
    const entries = Object.entries(data as Record<string, unknown>);
    if (entries.length === 0) return '{}';
    
    return entries
      .map(([key, value]) => {
        const formattedValue = typeof value === 'object' && value !== null
          ? '\n' + formatData(value, indent + 1)
          : ` ${value}`;
        return `${prefix}${key}:${formattedValue}`;
      })
      .join('\n');
  };

  return `
═══════════════════════════════════════════════════════════════
CÁBALA APLICADA - ${result.method_name.toUpperCase()}
═══════════════════════════════════════════════════════════════
Fecha: ${result.timestamp.toLocaleString('es-ES')}
Método: ${result.method_id}

───────────────────────────────────────────────────────────────
ENTRADA
───────────────────────────────────────────────────────────────
${formatData(result.input_data)}

───────────────────────────────────────────────────────────────
RESULTADO
───────────────────────────────────────────────────────────────
${formatData(result.output_data)}

═══════════════════════════════════════════════════════════════
Generado por Sistema de Análisis Cabalístico
Este documento es observacional - no constituye diagnóstico.
═══════════════════════════════════════════════════════════════
  `.trim();
}

/**
 * Downloads result as TXT
 */
function downloadText(result: ExecutionResult) {
  const text = formatResultAsText(result);
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  downloadBlob(blob, `cabala_${result.method_id}_${Date.now()}.txt`);
}

/**
 * Generates a simple PDF (via print dialog)
 */
function generatePDF(result: ExecutionResult) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.error('Could not open print window');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Cábala Aplicada - ${result.method_name}</title>
      <style>
        body { font-family: 'Georgia', serif; padding: 40px; max-width: 800px; margin: 0 auto; }
        h1 { color: #7c3aed; border-bottom: 2px solid #7c3aed; padding-bottom: 10px; }
        h2 { color: #4c1d95; margin-top: 30px; }
        .meta { color: #6b7280; font-size: 14px; margin-bottom: 20px; }
        .section { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 15px 0; }
        pre { white-space: pre-wrap; font-family: 'Consolas', monospace; font-size: 13px; }
        .disclaimer { font-size: 12px; color: #9ca3af; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <h1>✡ ${result.method_name}</h1>
      <div class="meta">
        <strong>Fecha:</strong> ${result.timestamp.toLocaleString('es-ES')}<br>
        <strong>Método:</strong> ${result.method_id}
      </div>
      
      <h2>Entrada</h2>
      <div class="section">
        <pre>${JSON.stringify(result.input_data, null, 2)}</pre>
      </div>
      
      <h2>Resultado</h2>
      <div class="section">
        <pre>${JSON.stringify(result.output_data, null, 2)}</pre>
      </div>
      
      <div class="disclaimer">
        ⚠️ <strong>Aviso:</strong> Este documento es observacional y educativo. 
        No constituye diagnóstico clínico ni prescripción terapéutica. 
        La interpretación requiere criterio profesional.
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.print();
}

/**
 * Session history item component
 */
function SessionHistoryItem({
  result,
  isSelected,
  onClick,
}: {
  result: ExecutionResult;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-lg cursor-pointer transition-all ${
        isSelected
          ? 'bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-700'
          : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-transparent'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-gray-900 dark:text-white">
          {result.method_name}
        </div>
        {isSelected && <ChevronRight className="h-4 w-4 text-purple-600" />}
      </div>
      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-gray-500">
        <Clock className="h-3 w-3" />
        {result.timestamp.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })}
      </div>
    </div>
  );
}

/**
 * Generic result viewer
 */
function GenericResultView({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="space-y-3">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            {key.replace(/_/g, ' ')}
          </div>
          <div className="text-sm text-gray-900 dark:text-white">
            {typeof value === 'object' && value !== null ? (
              <pre className="text-xs overflow-x-auto bg-white dark:bg-gray-900 p-2 rounded">
                {JSON.stringify(value, null, 2)}
              </pre>
            ) : (
              String(value ?? '—')
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Gematria result viewer
 */
function GematriaResultView({ data }: { data: Record<string, unknown> }) {
  const numericValue = data.numeric_value as number | undefined;
  const word = data.word as string | undefined;
  const relatedWords = data.related_words as string[] | undefined;

  return (
    <div className="space-y-4">
      {word && (
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-700 dark:text-purple-400" dir="rtl">
            {word}
          </div>
          {numericValue !== undefined && (
            <div className="text-4xl font-bold text-gray-900 dark:text-white mt-2">
              = {numericValue}
            </div>
          )}
        </div>
      )}
      {relatedWords && relatedWords.length > 0 && (
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <div className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-2">
            Palabras relacionadas (mismo valor)
          </div>
          <div className="flex flex-wrap gap-2">
            {relatedWords.map((w, i) => (
              <span
                key={i}
                className="px-2 py-1 bg-purple-100 dark:bg-purple-800 rounded text-sm"
                dir="rtl"
              >
                {w}
              </span>
            ))}
          </div>
        </div>
      )}
      <GenericResultView data={data} />
    </div>
  );
}

/**
 * Notarikon result viewer
 */
function NotarikonResultView({ data }: { data: Record<string, unknown> }) {
  const acronym = data.extracted_acronym as string | undefined;
  const mode = data.mode as string | undefined;
  const hint = data.interpretation_hint as string | undefined;
  const numericValue = data.numeric_value as number | undefined;

  return (
    <div className="space-y-4">
      {acronym && (
        <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1">
            Acróstico extraído ({mode?.replace(/_/g, ' ')})
          </div>
          <div className="text-3xl font-bold text-purple-700 dark:text-purple-300" dir="rtl">
            {acronym}
          </div>
          {numericValue !== undefined && (
            <div className="text-lg text-gray-600 dark:text-gray-400 mt-1">
              Gematría: {numericValue}
            </div>
          )}
        </div>
      )}
      {hint && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 rounded-r-lg">
          <div className="text-xs text-yellow-800 dark:text-yellow-200">{hint}</div>
        </div>
      )}
      <GenericResultView data={data} />
    </div>
  );
}

/**
 * Temurah result viewer
 */
function TemurahResultView({ data }: { data: Record<string, unknown> }) {
  const original = data.original as string | undefined;
  const transformed = data.transformed as string | undefined;
  const system = data.system as string | undefined;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {original && (
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Original
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white" dir="rtl">
              {original}
            </div>
          </div>
        )}
        {transformed && (
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1">
              Transformado ({system})
            </div>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300" dir="rtl">
              {transformed}
            </div>
          </div>
        )}
      </div>
      <GenericResultView data={data} />
    </div>
  );
}

/**
 * Result viewer router
 */
function ResultViewer({ result }: { result: ExecutionResult }) {
  const methodId = result.method_id.toLowerCase();

  if (methodId.includes('gematria') || methodId === 'gematrias') {
    return <GematriaResultView data={result.output_data} />;
  }
  if (methodId.includes('notarikon') || methodId === 'notarikon') {
    return <NotarikonResultView data={result.output_data} />;
  }
  if (methodId.includes('temurah') || methodId === 'temurah') {
    return <TemurahResultView data={result.output_data} />;
  }
  return <GenericResultView data={result.output_data} />;
}

/**
 * Main ResultsPanel component
 */
export default function ResultsPanel({ onResultSaved }: ResultsPanelProps) {
  const [sessionHistory, setSessionHistory] = useState<ExecutionResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<ExecutionResult | null>(null);

  /**
   * Adds a new result to session history
   */
  const addResult = useCallback(
    (result: ExecutionResult) => {
      setSessionHistory((prev) => [result, ...prev]);
      setSelectedResult(result);
      onResultSaved?.(result);
    },
    [onResultSaved]
  );

  /**
   * Clears session history
   */
  const clearSession = useCallback(() => {
    if (window.confirm('¿Borrar todos los cálculos de esta sesión? Los registros guardados en el servidor no se eliminarán.')) {
      setSessionHistory([]);
      setSelectedResult(null);
    }
  }, []);

  /**
   * Exports result in specified format
   */
  const exportResult = useCallback((result: ExecutionResult, format: 'json' | 'pdf' | 'txt') => {
    switch (format) {
      case 'json':
        downloadJSON(result);
        break;
      case 'pdf':
        generatePDF(result);
        break;
      case 'txt':
        downloadText(result);
        break;
    }
  }, []);

  return (
    <div className="results-panel grid grid-cols-3 gap-4 h-full min-h-[400px]">
      {/* Left column: Session history */}
      <div className="col-span-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Sesión Actual
          </h3>
          {sessionHistory.length > 0 && (
            <button
              onClick={clearSession}
              className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 dark:text-red-400"
              title="Limpiar sesión"
            >
              <Trash2 className="h-3 w-3" />
              Limpiar
            </button>
          )}
        </div>

        {sessionHistory.length === 0 ? (
          <div className="text-xs text-gray-500 dark:text-gray-400 p-3 bg-white dark:bg-gray-700 rounded-lg">
            No hay cálculos en esta sesión. Los resultados aparecerán aquí al ejecutar métodos.
          </div>
        ) : (
          <div className="space-y-2">
            {sessionHistory.map((result) => (
              <SessionHistoryItem
                key={result.id}
                result={result}
                isSelected={selectedResult?.id === result.id}
                onClick={() => setSelectedResult(result)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Right columns: Selected result */}
      <div className="col-span-2 bg-white dark:bg-gray-900 rounded-lg p-6 overflow-y-auto">
        {selectedResult ? (
          <div>
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {selectedResult.method_name}
                </h2>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {selectedResult.timestamp.toLocaleString('es-ES')}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => exportResult(selectedResult, 'json')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  title="Descargar JSON"
                >
                  <FileJson className="h-3.5 w-3.5" />
                  JSON
                </button>
                <button
                  onClick={() => exportResult(selectedResult, 'txt')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  title="Descargar texto"
                >
                  <FileText className="h-3.5 w-3.5" />
                  TXT
                </button>
                <button
                  onClick={() => exportResult(selectedResult, 'pdf')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-md text-xs font-medium text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800/30"
                  title="Imprimir/Guardar como PDF"
                >
                  <Download className="h-3.5 w-3.5" />
                  PDF
                </button>
              </div>
            </div>

            <ResultViewer result={selectedResult} />

            <div className="mt-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 rounded-r-lg">
              <div className="text-xs text-yellow-800 dark:text-yellow-200">
                ⚠️ <strong>Aviso:</strong> Este resultado es observacional. No constituye
                diagnóstico clínico ni prescripción. La interpretación requiere criterio
                profesional.
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
            <div className="text-4xl mb-4">✡</div>
            <div className="text-sm">Selecciona un cálculo para ver detalles</div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Exported utilities for external use
 */
export { downloadJSON, downloadText, generatePDF, formatResultAsText };
