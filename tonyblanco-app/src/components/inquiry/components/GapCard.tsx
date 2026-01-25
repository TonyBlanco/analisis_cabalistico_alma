// components/inquiry/components/GapCard.tsx
import React from 'react';
import type { KnowledgeGap } from '../InquiryWidget.types';
import { GapBadge } from './GapBadge';

interface GapCardProps {
  gap: KnowledgeGap;
  onAskNow: (gap: KnowledgeGap) => void;
  onSend: (gapCode: string) => void;
  onIgnore: (gapCode: string) => void;
  isSelected?: boolean;
}

export const GapCard: React.FC<GapCardProps> = ({
  gap,
  onAskNow,
  onSend,
  onIgnore,
  isSelected = false,
}) => {
  return (
    <div 
      className={`border rounded-lg p-3 mb-3 transition-all ${
        isSelected 
          ? 'border-blue-400 bg-blue-50' 
          : 'border-gray-200 bg-gray-50'
      }`}
      role="listitem"
      aria-labelledby={`gap-title-${gap.code}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <GapBadge priority={gap.priority} />
            {gap.dynamic && (
              <span className="text-xs text-gray-500 italic">
                {gap.entityLabel}
              </span>
            )}
          </div>
          <h4 
            id={`gap-title-${gap.code}`}
            className="font-semibold text-sm text-gray-900 mb-1"
          >
            {gap.title}
          </h4>
          <p className="text-xs text-gray-600 mb-2">
            {gap.description}
          </p>
          {gap.previousResponse && (
            <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1 mb-2">
              ⚠️ Última respuesta hace {calculateDaysAgo(gap.previousResponse.collectedAt)} días (expirada)
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onAskNow(gap)}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          aria-label={`Preguntar ahora: ${gap.title}`}
        >
          🎤 Preguntar Ahora
        </button>
        <button
          onClick={() => onSend(gap.code)}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-white border border-blue-300 hover:bg-blue-50 rounded transition-colors"
          aria-label={`Enviar por email: ${gap.title}`}
        >
          📧 Enviar
        </button>
        <button
          onClick={() => onIgnore(gap.code)}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded transition-colors"
          aria-label={`Ignorar temporalmente: ${gap.title}`}
        >
          ⏭️ Ignorar
        </button>
      </div>

      {gap.followUpTriggeredBy && (
        <div className="mt-2 text-xs text-gray-500 italic border-l-2 border-gray-300 pl-2">
          ↳ Activado por: {gap.followUpCondition}
        </div>
      )}
    </div>
  );
};

function calculateDaysAgo(isoDate: string): number {
  const then = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - then.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}
