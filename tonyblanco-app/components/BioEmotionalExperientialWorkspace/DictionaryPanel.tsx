'use client';

import { useState, useEffect } from 'react';
import { searchDictionaryByTerm, type BioEmotionalDictionaryEntry } from '@/lib/api/bioemotional';
import type { AnatomicalRegion } from './data/anatomicalRegions';

interface DictionaryPanelProps {
  selectedRegion: AnatomicalRegion | null;
  onCopyToObservation?: (text: string) => void;
  onCopyToHypothesis?: (text: string) => void;
  onCopyToSynthesis?: (text: string) => void;
  isReadOnly?: boolean;
}

export default function DictionaryPanel({
  selectedRegion,
  onCopyToObservation,
  onCopyToHypothesis,
  onCopyToSynthesis,
  isReadOnly = false,
}: DictionaryPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<BioEmotionalDictionaryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<BioEmotionalDictionaryEntry | null>(null);

  const formatFuente = (fuente: BioEmotionalDictionaryEntry['fuente']): string | null => {
    if (fuente === null || fuente === undefined) {
      return null;
    }
    if (typeof fuente === 'string') {
      return fuente;
    }
    if (typeof fuente === 'number' || typeof fuente === 'boolean') {
      return String(fuente);
    }
    if (typeof fuente === 'object') {
      const record = fuente as Record<string, unknown>;
      const book = record.book;
      const author = record.author;
      const pages = record.pages;
      if (typeof book === 'string' || typeof author === 'string' || typeof pages === 'number') {
        const parts = [
          typeof book === 'string' ? book : null,
          typeof author === 'string' ? author : null,
          typeof pages === 'number' ? `p. ${pages}` : null,
        ].filter(Boolean);
        if (parts.length) {
          return parts.join(' - ');
        }
      }
      try {
        return JSON.stringify(fuente);
      } catch {
        return 'Fuente disponible';
      }
    }
    return null;
  };

  const buildCopyText = (entry: BioEmotionalDictionaryEntry) => {
    const fuente = formatFuente(entry.fuente);
    const lines = [
      entry.termino ? `Termino: ${entry.termino}` : null,
      entry.definicion ? `Definicion: ${entry.definicion}` : null,
      fuente ? `Fuente: ${fuente}` : null,
    ].filter(Boolean);
    return lines.map((line) => `> ${line}`).join('\n');
  };

  // Reset search when region changes
  useEffect(() => {
    setSearchTerm('');
    setResults([]);
    setSelectedEntry(null);
    setError(null);
  }, [selectedRegion?.id]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError('Por favor ingresa un término de búsqueda');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const entries = await searchDictionaryByTerm(searchTerm.trim());
      setResults(entries);
      
      if (entries.length === 0) {
        setError('No se encontraron resultados para este término');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar en el diccionario');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-1">
          Diccionario Bio-Emocional
        </h4>
        <p className="text-xs text-gray-500">
          Búsqueda manual consultiva. Sin inferencias automáticas.
        </p>
      </div>

      {/* Search Input */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Buscar término bio-emocional..."
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={loading || !searchTerm.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {/* Region Context (if selected) */}
        {selectedRegion && (
          <div className="rounded-md bg-blue-50 border border-blue-200 p-2 text-xs text-blue-700">
            <p className="font-medium">Región seleccionada: {selectedRegion.label}</p>
            <p className="text-blue-600">
              Puedes buscar términos relacionados con esta región
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-700">
            {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
          </p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {results.map((entry, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedEntry(selectedEntry?.termino === entry.termino ? null : entry)}
                className={`w-full text-left rounded-md border p-3 transition-colors ${
                  selectedEntry?.termino === entry.termino
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <p className="text-sm font-medium text-gray-900">{entry.termino}</p>
                {entry.definicion && (
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {entry.definicion}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Entry Detail */}
      {selectedEntry && (
        <div className="rounded-lg border border-blue-300 bg-blue-50 p-4 space-y-3">
          <div className="flex items-start justify-between">
            <h5 className="text-sm font-semibold text-gray-900">{selectedEntry.termino}</h5>
            <button
              type="button"
              onClick={() => setSelectedEntry(null)}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Cerrar detalle"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {selectedEntry.definicion && (
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1">Definición:</p>
              <p className="text-xs text-gray-600">{selectedEntry.definicion}</p>
            </div>
          )}

          {selectedEntry.sentido_biologico && (
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1">Sentido Biológico:</p>
              <p className="text-xs text-gray-600">{selectedEntry.sentido_biologico}</p>
            </div>
          )}

          {selectedEntry.conflicto_asociado && (
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1">Conflicto Asociado:</p>
              <p className="text-xs text-gray-600">{selectedEntry.conflicto_asociado}</p>
            </div>
          )}

          {formatFuente(selectedEntry.fuente) && (
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1">Fuente:</p>
              <p className="text-xs text-gray-500 italic">{formatFuente(selectedEntry.fuente)}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2 border-t border-blue-200">
            <button
              type="button"
              onClick={() => onCopyToObservation?.(buildCopyText(selectedEntry))}
              disabled={isReadOnly || !onCopyToObservation}
              className="px-2 py-1 text-xs font-medium text-blue-700 border border-blue-200 rounded-md hover:bg-blue-50 disabled:opacity-60"
            >
              Copiar a observacion
            </button>
            <button
              type="button"
              onClick={() => onCopyToHypothesis?.(buildCopyText(selectedEntry))}
              disabled={isReadOnly || !onCopyToHypothesis}
              className="px-2 py-1 text-xs font-medium text-blue-700 border border-blue-200 rounded-md hover:bg-blue-50 disabled:opacity-60"
            >
              Copiar a hipotesis
            </button>
            <button
              type="button"
              onClick={() => onCopyToSynthesis?.(buildCopyText(selectedEntry))}
              disabled={isReadOnly || !onCopyToSynthesis}
              className="px-2 py-1 text-xs font-medium text-blue-700 border border-blue-200 rounded-md hover:bg-blue-50 disabled:opacity-60"
            >
              Copiar a sintesis
            </button>
          </div>

          {/* Possible relation with selected region (informative only) */}
          {selectedRegion && (
            <div className="pt-2 border-t border-blue-200">
              <p className="text-xs font-medium text-blue-700 mb-1">
                Posible relación con {selectedRegion.label}:
              </p>
              <p className="text-xs text-blue-600">
                El terapeuta puede considerar esta información en su observación consultiva.
                No es una conclusión automática.
              </p>
            </div>
          )}

          {/* Non-diagnostic disclaimer */}
          <div className="pt-2 border-t border-blue-200">
            <p className="text-[11px] text-gray-500 italic">
              Esta información es consultiva y no diagnóstica. El terapeuta observa y decide.
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && results.length === 0 && !error && searchTerm === '' && (
        <div className="text-center py-6 text-xs text-gray-500">
          <p>Ingresa un término para buscar en el diccionario bio-emocional</p>
          <p className="mt-1">Ejemplo: "hígado", "miedo", "abandono"</p>
        </div>
      )}
    </div>
  );
}
