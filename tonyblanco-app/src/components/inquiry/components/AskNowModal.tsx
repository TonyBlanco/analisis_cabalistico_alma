// components/inquiry/components/AskNowModal.tsx
import React, { useState, useEffect } from 'react';
import type { KnowledgeGap } from '../InquiryWidget.types';

interface AskNowModalProps {
  gap: KnowledgeGap | null;
  onSave: (value: any, notes?: string) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

export const AskNowModal: React.FC<AskNowModalProps> = ({
  gap,
  onSave,
  onCancel,
  isSaving,
}) => {
  const [value, setValue] = useState<any>('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (gap) {
      setValue(gap.questionType === 'scale_1_10' ? 5 : '');
      setNotes('');
      setError(null);
    }
  }, [gap]);

  if (!gap) return null;

  const handleSave = async () => {
    // Validación básica
    if (gap.validation?.required && !value) {
      setError('Este campo es obligatorio');
      return;
    }

    if (gap.questionType === 'text_long' || gap.questionType === 'text_short') {
      const strValue = String(value);
      if (gap.validation?.minLength && strValue.length < gap.validation.minLength) {
        setError(`Mínimo ${gap.validation.minLength} caracteres`);
        return;
      }
      if (gap.validation?.maxLength && strValue.length > gap.validation.maxLength) {
        setError(`Máximo ${gap.validation.maxLength} caracteres`);
        return;
      }
    }

    try {
      await onSave(value, notes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    }
  };

  const renderInput = () => {
    switch (gap.questionType) {
      case 'scale_1_10':
        return (
          <div className="space-y-2">
            <input
              type="range"
              min="1"
              max="10"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className="w-full"
              aria-label="Escala del 1 al 10"
            />
            <div className="flex justify-between text-xs text-gray-600">
              <span>1</span>
              <span className="font-semibold text-lg">{value}</span>
              <span>10</span>
            </div>
          </div>
        );

      case 'choice_single':
        return (
          <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={gap.title}
          >
            <option value="">-- Selecciona una opción --</option>
            {gap.choices?.map((choice) => (
              <option key={choice.value} value={choice.value}>
                {choice.label}
              </option>
            ))}
          </select>
        );

      case 'choice_multi':
        return (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {gap.choices?.map((choice) => (
              <label key={choice.value} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={choice.value}
                  checked={Array.isArray(value) && value.includes(choice.value)}
                  onChange={(e) => {
                    const arr = Array.isArray(value) ? [...value] : [];
                    if (e.target.checked) {
                      setValue([...arr, choice.value]);
                    } else {
                      setValue(arr.filter((v) => v !== choice.value));
                    }
                  }}
                  className="rounded"
                />
                <span className="text-sm">{choice.label}</span>
              </label>
            ))}
          </div>
        );

      case 'yes_no':
        return (
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="yes_no"
                value="yes"
                checked={value === 'yes'}
                onChange={(e) => setValue(e.target.value)}
              />
              <span>Sí</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="yes_no"
                value="no"
                checked={value === 'no'}
                onChange={(e) => setValue(e.target.value)}
              />
              <span>No</span>
            </label>
          </div>
        );

      case 'text_short':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={gap.placeholder}
            maxLength={gap.validation?.maxLength}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={gap.title}
          />
        );

      case 'text_long':
      default:
        return (
          <div className="space-y-1">
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={gap.placeholder}
              maxLength={gap.validation?.maxLength}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              aria-label={gap.title}
            />
            {gap.validation?.maxLength && (
              <div className="text-xs text-gray-500 text-right">
                {String(value).length} / {gap.validation.maxLength} caracteres
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200">
          <h3 id="modal-title" className="text-lg font-semibold text-gray-900 mb-2">
            🔴 {gap.title}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {gap.description}
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-xs font-medium text-blue-800 mb-1">
              📝 Pregunta sugerida:
            </p>
            <p className="text-sm text-gray-700 italic">
              "{gap.questionText}"
            </p>
          </div>
        </div>

        <div className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Respuesta del paciente (transcripción):
          </label>
          {renderInput()}

          {error && (
            <div className="mt-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas adicionales (opcional):
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observaciones del terapeuta..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isSaving ? 'Guardando...' : '✓ Guardar Respuesta'}
          </button>
        </div>
      </div>
    </div>
  );
};
