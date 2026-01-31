/**
 * ExportacionNarrativaPanel.tsx - Exportación Narrativa Hermosa
 * 
 * Genera documentos narrativos hermosos en lugar de reportes fríos:
 * - Carta del Alma: Una carta personal de tu ser superior
 * - Mapa del Viaje: Visualización del camino recorrido
 * - Libro del Proceso: Compilación completa del trabajo terapéutico
 */

'use client';

import React, { useState, useCallback } from 'react';
import { 
  BookOpen, 
  FileText, 
  Map, 
  Download,
  Eye,
  Loader2,
  AlertCircle,
  Sparkles,
  Heart,
  Scroll,
  ChevronRight,
  Info
} from 'lucide-react';
import { API_BASE_URL, getAuthToken } from '@/lib/api';

interface JourneyData {
  events?: Array<{
    date: string;
    type: string;
    description: string;
  }>;
  insights?: string[];
  transformations?: string[];
  current_sefira?: string;
  shadow_work?: string[];
}

interface ExportDocument {
  title: string;
  format: string;
  content: any;
  generated_at: string;
}

interface ExportacionNarrativaPanelProps {
  birthDate: string;
  consultantName: string;
  journeyData?: JourneyData;
  onExportGenerated?: (doc: ExportDocument) => void;
}

// Colores profesionales y sutiles
const EXPORT_TYPES = [
  {
    id: 'soul_letter',
    name: 'Carta del Alma',
    icon: <Heart className="w-6 h-6" />,
    description: 'Una carta personal de tu ser superior, escrita con amor y sabiduría.',
    color: 'from-slate-600 to-slate-700',
    bgHover: 'hover:bg-slate-50 dark:hover:bg-slate-800/30',
    accent: 'text-rose-500'
  },
  {
    id: 'journey_map',
    name: 'Mapa del Viaje',
    icon: <Map className="w-6 h-6" />,
    description: 'Visualización del camino recorrido y las transformaciones vividas.',
    color: 'from-slate-600 to-slate-700',
    bgHover: 'hover:bg-slate-50 dark:hover:bg-slate-800/30',
    accent: 'text-blue-500'
  },
  {
    id: 'process_book',
    name: 'Libro del Proceso',
    icon: <BookOpen className="w-6 h-6" />,
    description: 'Compilación completa de todo el trabajo terapéutico en formato libro.',
    color: 'from-slate-600 to-slate-700',
    bgHover: 'hover:bg-slate-50 dark:hover:bg-slate-800/30',
    accent: 'text-amber-500'
  }
];

export default function ExportacionNarrativaPanel({
  birthDate,
  consultantName,
  journeyData = {},
  onExportGenerated
}: ExportacionNarrativaPanelProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [generatedDoc, setGeneratedDoc] = useState<ExportDocument | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const generateExport = useCallback(async (exportType: string) => {
    if (!birthDate) {
      setError('Se requiere fecha de nacimiento');
      return;
    }

    setLoading(true);
    setError(null);
    setSelectedType(exportType);

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/cabala/exportacion-narrativa/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Token ${token}` } : {})
        },
        body: JSON.stringify({
          type: exportType,
          name: consultantName,
          birth_date: birthDate,
          journey_data: journeyData
        })
      });

      const data = await response.json();
      if (data.success) {
        setGeneratedDoc(data.document);
        setPreviewMode(true);
        onExportGenerated?.(data.document);
      } else {
        setError(data.error || 'Error al generar documento');
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  }, [birthDate, consultantName, journeyData, onExportGenerated]);

  const downloadDocument = useCallback(() => {
    if (!generatedDoc) return;

    // Crear contenido descargable
    const content = JSON.stringify(generatedDoc.content, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedDoc.title.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [generatedDoc]);

  // Vista de selección de tipo de exportación
  if (!previewMode) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
          <div className="flex items-center gap-3">
            <Scroll className="w-6 h-6 text-white" />
            <div>
              <h2 className="text-xl font-semibold text-white">
                Exportación Narrativa
              </h2>
              <p className="text-purple-200 text-sm">
                Documentos hermosos para tu proceso
              </p>
            </div>
            <div className="group relative ml-auto">
              <Info className="h-4 w-4 text-white/70 hover:text-white cursor-help transition-colors" />
              <div className="absolute right-0 top-6 invisible group-hover:visible bg-black text-white text-xs rounded-lg py-2 px-3 w-72 shadow-lg z-10">
                <p className="font-medium mb-1">Narrativa Terapéutica Hermosa</p>
                <p>• Carta del Alma: Mensaje personal de tu ser superior</p>
                <p>• Mapa del Viaje: Visualización del camino recorrido</p>
                <p>• Libro del Proceso: Compilación completa del trabajo</p>
                <p>• Documentos poéticos, no reportes fríos</p>
                <div className="absolute -top-1 right-4 w-2 h-2 bg-black transform rotate-45"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3 text-red-700 dark:text-red-300">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Tipo de exportación */}
          <div className="grid gap-4 sm:grid-cols-3">
            {EXPORT_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => generateExport(type.id)}
                disabled={loading}
                className={`relative group border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 transition-all duration-300 ${type.bgHover} ${
                  loading && selectedType === type.id
                    ? 'opacity-75 cursor-wait'
                    : 'hover:border-transparent hover:shadow-lg'
                }`}
              >
                {loading && selectedType === type.id ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    <p className="text-sm text-gray-500">Generando...</p>
                  </div>
                ) : (
                  <>
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${type.color} flex items-center justify-center text-white mb-4 mx-auto`}>
                      {type.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 text-center mb-2">
                      {type.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                      {type.description}
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-2 text-purple-600 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-sm font-medium">Generar</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </>
                )}
              </button>
            ))}
          </div>

          {/* Info adicional */}
          <div className="mt-8 bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-purple-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200">
                  Documentos con alma
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Cada documento se genera con lenguaje poético y cabalístico,
                  transformando datos terapéuticos en narrativas significativas
                  para acompañar tu proceso de transformación.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista de previsualización del documento generado
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-white" />
            <div>
              <h2 className="text-xl font-semibold text-white">
                {generatedDoc?.title || 'Documento Generado'}
              </h2>
              <p className="text-purple-200 text-sm">
                Vista previa
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewMode(false)}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Otro documento
            </button>
            <button
              onClick={downloadDocument}
              className="px-4 py-2 bg-white text-purple-700 hover:bg-purple-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Descargar
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {generatedDoc && (
          <DocumentPreview document={generatedDoc} />
        )}
      </div>
    </div>
  );
}

// Componente de previsualización de documento
function DocumentPreview({ document }: { document: ExportDocument }) {
  const { content } = document;

  // Renderizar según el tipo de documento
  if (content.format === 'soul_letter') {
    return <SoulLetterPreview content={content} />;
  }

  if (content.format === 'journey_map') {
    return <JourneyMapPreview content={content} />;
  }

  if (content.format === 'process_book') {
    return <ProcessBookPreview content={content} />;
  }

  // Fallback: mostrar JSON formateado
  return (
    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
      <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap overflow-auto max-h-96">
        {JSON.stringify(content, null, 2)}
      </pre>
    </div>
  );
}

// Previsualización de Carta del Alma
function SoulLetterPreview({ content }: { content: any }) {
  return (
    <div className="max-w-2xl mx-auto bg-gradient-to-b from-rose-50 to-white dark:from-rose-900/20 dark:to-gray-800 rounded-xl p-8 border border-rose-100 dark:border-rose-800">
      {/* Saludo */}
      <p className="text-lg text-rose-800 dark:text-rose-300 italic mb-6">
        {content.greeting || 'Querida alma...'}
      </p>

      {/* Reconocimiento */}
      {content.acknowledgment && (
        <div className="mb-6">
          <h4 className="text-rose-700 dark:text-rose-400 font-semibold mb-2">
            Reconozco tu camino
          </h4>
          <p className="text-gray-700 dark:text-gray-300">
            {content.acknowledgment}
          </p>
        </div>
      )}

      {/* Cuerpo */}
      {content.body && (
        <div className="mb-6 space-y-4">
          {Array.isArray(content.body) ? (
            content.body.map((paragraph: string, idx: number) => (
              <p key={idx} className="text-gray-700 dark:text-gray-300">
                {paragraph}
              </p>
            ))
          ) : (
            <p className="text-gray-700 dark:text-gray-300">{content.body}</p>
          )}
        </div>
      )}

      {/* Cierre */}
      <div className="mt-8 pt-6 border-t border-rose-200 dark:border-rose-700">
        <p className="text-rose-600 dark:text-rose-400 italic text-right">
          {content.closing || 'Con amor infinito,'}
        </p>
        <p className="text-rose-800 dark:text-rose-300 font-semibold text-right mt-2">
          {content.signature || 'Tu Ser Superior'}
        </p>
      </div>
    </div>
  );
}

// Previsualización de Mapa del Viaje
function JourneyMapPreview({ content }: { content: any }) {
  const stages = content.stages || [];

  return (
    <div className="space-y-6">
      {/* Título del mapa */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          {content.title || 'Tu Mapa del Viaje'}
        </h3>
        {content.subtitle && (
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {content.subtitle}
          </p>
        )}
      </div>

      {/* Etapas del viaje */}
      <div className="relative">
        {/* Línea conectora */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-indigo-500" />

        <div className="space-y-8">
          {stages.map((stage: any, idx: number) => (
            <div key={idx} className="relative flex items-start gap-4">
              {/* Punto en la línea */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold z-10 bg-gradient-to-br ${
                idx === stages.length - 1
                  ? 'from-green-500 to-emerald-500'
                  : 'from-blue-500 to-indigo-500'
              }`}>
                {idx + 1}
              </div>

              {/* Contenido de la etapa */}
              <div className="flex-1 bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                  {stage.name || `Etapa ${idx + 1}`}
                </h4>
                {stage.archetype && (
                  <span className="inline-block px-2 py-1 bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300 rounded text-xs mt-1">
                    {stage.archetype}
                  </span>
                )}
                <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
                  {stage.description}
                </p>
                {stage.learning && (
                  <p className="text-green-700 dark:text-green-400 mt-2 text-sm italic">
                    Aprendizaje: {stage.learning}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Previsualización de Libro del Proceso
function ProcessBookPreview({ content }: { content: any }) {
  const chapters = content.chapters || [];

  return (
    <div className="space-y-6">
      {/* Portada */}
      <div className="bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-xl p-8 text-center">
        <BookOpen className="w-16 h-16 mx-auto text-amber-600 dark:text-amber-400 mb-4" />
        <h2 className="text-3xl font-bold text-amber-800 dark:text-amber-300">
          {content.title || 'Libro de tu Proceso'}
        </h2>
        {content.author && (
          <p className="text-amber-600 dark:text-amber-400 mt-2">
            {content.author}
          </p>
        )}
        {content.date_range && (
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-4">
            {content.date_range}
          </p>
        )}
      </div>

      {/* Índice */}
      <div className="bg-white dark:bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Índice
        </h3>
        <ol className="space-y-2">
          {chapters.map((chapter: any, idx: number) => (
            <li key={idx} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                {idx + 1}.
              </span>
              {chapter.title || `Capítulo ${idx + 1}`}
            </li>
          ))}
        </ol>
      </div>

      {/* Capítulos */}
      <div className="space-y-6">
        {chapters.map((chapter: any, idx: number) => (
          <div 
            key={idx}
            className="bg-white dark:bg-gray-700 rounded-lg p-6 border-l-4 border-amber-500"
          >
            <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Capítulo {idx + 1}: {chapter.title}
            </h4>
            {chapter.epigraph && (
              <p className="text-gray-500 dark:text-gray-400 italic border-l-2 border-gray-300 pl-4 mb-4">
                "{chapter.epigraph}"
              </p>
            )}
            <div className="prose dark:prose-invert max-w-none">
              {Array.isArray(chapter.content) ? (
                chapter.content.map((para: string, pidx: number) => (
                  <p key={pidx} className="text-gray-700 dark:text-gray-300 mb-3">
                    {para}
                  </p>
                ))
              ) : (
                <p className="text-gray-700 dark:text-gray-300">
                  {chapter.content}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
