// components/inquiry/InquiryWidget.tsx
import React, { useState, useEffect } from 'react';
import type { 
  InquiryWidgetProps, 
  KnowledgeGap,
  GapResponse 
} from './InquiryWidget.types';
import { useInquiryGaps } from './hooks/useInquiryGaps';
import { useInquiryResponse } from './hooks/useInquiryResponse';
import { GapCard } from './components/GapCard';
import { GapBadge } from './components/GapBadge';
import { AskNowModal } from './components/AskNowModal';

export const InquiryWidget: React.FC<InquiryWidgetProps> = ({
  patientId,
  moduleCode,
  position = 'footer',
  defaultExpanded = false,
  maxVisibleGaps = 5,
  hideOptional = false,
  onGapResolved,
  onQuestionnaireSent,
  onGapIgnored,
  onExpandChange,
  className = '',
  collapsedTitle = 'Información Faltante',
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [ignoredGaps, setIgnoredGaps] = useState<Set<string>>(new Set());
  const [selectedForQuestionnaire, setSelectedForQuestionnaire] = useState<Set<string>>(new Set());
  const [activeGap, setActiveGap] = useState<KnowledgeGap | null>(null);
  const [showAllGaps, setShowAllGaps] = useState(false);

  const { gaps, counts, status, error, refetch, isLoading } = useInquiryGaps(patientId, moduleCode);
  
  const { saveResponse, isSaving } = useInquiryResponse((gapCode, response) => {
    setActiveGap(null);
    refetch();
    onGapResolved?.(gapCode, response);
  });

  // Filtrar gaps según configuración
  const visibleGaps = gaps
    .filter(gap => !ignoredGaps.has(gap.code))
    .filter(gap => !hideOptional || gap.priority !== 'optional')
    .slice(0, showAllGaps ? undefined : maxVisibleGaps);

  const hasMoreGaps = gaps.length > maxVisibleGaps && !showAllGaps;

  useEffect(() => {
    onExpandChange?.(isExpanded);
  }, [isExpanded, onExpandChange]);

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleAskNow = (gap: KnowledgeGap) => {
    setActiveGap(gap);
  };

  const handleSaveResponse = async (value: any, notes?: string) => {
    if (!activeGap) return;
    await saveResponse(patientId, activeGap.code, value, notes);
  };

  const handleIgnore = (gapCode: string) => {
    setIgnoredGaps(prev => new Set([...prev, gapCode]));
    onGapIgnored?.(gapCode);
  };

  const handleSendGap = (gapCode: string) => {
    setSelectedForQuestionnaire(prev => {
      const newSet = new Set(prev);
      if (newSet.has(gapCode)) {
        newSet.delete(gapCode);
      } else {
        newSet.add(gapCode);
      }
      return newSet;
    });
  };

  const handleSendQuestionnaire = () => {
    // TODO: Implementar modal de confirmación y envío
    console.log('Enviar cuestionario con gaps:', Array.from(selectedForQuestionnaire));
    // onQuestionnaireSent?.(Array.from(selectedForQuestionnaire), 'batch-id');
  };

  // Renderizado según estado
  const renderContent = () => {
    if (status === 'loading' || isLoading) {
      return (
        <div className="p-6 text-center text-gray-500">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
          <p className="text-sm">Cargando información faltante...</p>
        </div>
      );
    }

    if (status === 'error') {
      return (
        <div className="p-6 text-center">
          <div className="text-red-600 mb-2">⚠️ Error al cargar</div>
          <p className="text-sm text-gray-600 mb-3">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      );
    }

    if (status === 'empty') {
      return (
        <div className="p-6 text-center text-gray-500">
          <p className="text-sm">
            ℹ️ Este módulo no tiene preguntas contextuales configuradas.
          </p>
        </div>
      );
    }

    if (status === 'all_resolved') {
      return (
        <div className="p-6">
          <div className="text-center mb-4">
            <div className="text-green-600 mb-2">✅ Información Completa</div>
            <p className="text-sm text-gray-600">
              Todas las preguntas relevantes para {moduleCode} han sido respondidas.
            </p>
          </div>
          <button
            onClick={refetch}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            Ver historial de respuestas
          </button>
        </div>
      );
    }

    if (status === 'has_gaps') {
      return (
        <div className="p-4">
          <ul role="list" aria-label="Lista de preguntas pendientes">
            {visibleGaps.map(gap => (
              <GapCard
                key={gap.code}
                gap={gap}
                onAskNow={handleAskNow}
                onSend={handleSendGap}
                onIgnore={handleIgnore}
                isSelected={selectedForQuestionnaire.has(gap.code)}
              />
            ))}
          </ul>

          {hasMoreGaps && (
            <button
              onClick={() => setShowAllGaps(true)}
              className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Ver {gaps.length - maxVisibleGaps} más...
            </button>
          )}

          {selectedForQuestionnaire.size > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={handleSendQuestionnaire}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
              >
                📧 Enviar cuestionario con {selectedForQuestionnaire.size} pregunta{selectedForQuestionnaire.size !== 1 ? 's' : ''} seleccionada{selectedForQuestionnaire.size !== 1 ? 's' : ''}
              </button>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  // Posicionamiento según prop
  const positionClasses = {
    footer: 'fixed bottom-0 left-0 right-0 border-t shadow-lg',
    sidebar: 'w-80 border-l',
    header: 'border-b',
    modal: 'fixed inset-0 z-50',
  };

  return (
    <>
      <div 
        className={`bg-white ${positionClasses[position]} ${className}`}
        role="region"
        aria-label="Información faltante del paciente"
        aria-expanded={isExpanded}
      >
        {/* Header colapsable */}
        <button
          onClick={handleToggleExpand}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          aria-controls="inquiry-gap-list"
          aria-expanded={isExpanded}
          aria-label={`${isExpanded ? 'Colapsar' : 'Expandir'} información faltante. ${counts.critical} críticos, ${counts.important} importantes`}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              💬 {collapsedTitle}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {counts.critical > 0 && <GapBadge priority="critical" count={counts.critical} />}
            {counts.important > 0 && <GapBadge priority="important" count={counts.important} />}
            {counts.optional > 0 && !hideOptional && <GapBadge priority="optional" count={counts.optional} />}
            <span className="text-gray-400">
              {isExpanded ? '▲' : '▼'}
            </span>
          </div>
        </button>

        {/* Contenido expandible */}
        {isExpanded && (
          <div id="inquiry-gap-list" className="border-t border-gray-200">
            {renderContent()}
          </div>
        )}
      </div>

      {/* Modal "Preguntar Ahora" */}
      <AskNowModal
        gap={activeGap}
        onSave={handleSaveResponse}
        onCancel={() => setActiveGap(null)}
        isSaving={isSaving}
      />
    </>
  );
};
