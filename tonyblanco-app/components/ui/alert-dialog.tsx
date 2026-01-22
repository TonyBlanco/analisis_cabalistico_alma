'use client';

import * as React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from './button';

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** List items to show (e.g., things being deleted) */
  items?: string[];
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  /** Whether confirmation is destructive (red button) */
  destructive?: boolean;
  /** Show loading state on confirm button */
  loading?: boolean;
}

/**
 * AlertDialog component to replace native window.confirm
 * Provides a consistent UI for confirmation dialogs.
 */
export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  items,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  destructive = false,
  loading = false,
}: AlertDialogProps) {
  if (!open) return null;

  const handleConfirm = () => {
    onConfirm();
    // Note: The caller is responsible for closing the dialog after the action completes
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => !loading && onOpenChange(false)}
      />
      
      {/* Dialog */}
      <div
        className="relative z-50 w-full max-w-md bg-white rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 p-2 rounded-full ${destructive ? 'bg-red-100' : 'bg-yellow-100'}`}>
              {destructive ? (
                <Trash2 className={`w-5 h-5 ${destructive ? 'text-red-600' : 'text-yellow-600'}`} />
              ) : (
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              {description && (
                <p className="mt-1 text-sm text-gray-600">{description}</p>
              )}
            </div>
          </div>
          
          {/* Items list */}
          {items && items.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
              <ul className="space-y-1 text-sm text-gray-700">
                {items.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex gap-3 p-6 pt-2 border-t border-gray-100">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? 'destructive' : 'default'}
            className={`flex-1 ${destructive ? 'bg-red-600 hover:bg-red-700 text-white' : ''}`}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Procesando...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
