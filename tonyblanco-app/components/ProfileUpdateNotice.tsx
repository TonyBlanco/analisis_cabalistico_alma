'use client';

import { CheckCircle, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ProfileUpdateNoticeProps {
  isOpen: boolean;
  onAcknowledge: () => void;
  lastUpdate?: string | null;
}

/**
 * ProfileUpdateNotice
 * 
 * Modal shown to patients when their profile has been updated by their therapist.
 * 
 * RULES:
 * - Only shown once (when profile_updated_by_therapist === true)
 * - Patient must acknowledge (click "Entendido")
 * - Non-blocking: patient can still use dashboard
 * - Calm, professional tone
 * 
 * ARCHITECTURE:
 * - Called from patient dashboard mount
 * - Calls POST /api/profile/me/acknowledge-update/
 * - Resets profile_updated_by_therapist flag
 */
export default function ProfileUpdateNotice({
  isOpen,
  onAcknowledge,
  lastUpdate,
}: ProfileUpdateNoticeProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onAcknowledge()}>
      <DialogContent className="max-w-lg bg-white border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            Actualización de perfil
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Main message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 leading-relaxed">
              Tu perfil ha sido actualizado por tu terapeuta para garantizar 
              la precisión de los análisis cabalísticos.
            </p>
          </div>

          {/* Explanation */}
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              Los datos de nacimiento son esenciales para cálculos cabalísticos precisos. 
              Tu terapeuta ha verificado y/o completado tu información.
            </p>
            <p className="text-xs text-gray-500">
              Los análisis futuros utilizarán los datos actualizados. 
              Los análisis anteriores conservan los datos con los que fueron creados.
            </p>
          </div>

          {/* Timestamp (if available) */}
          {lastUpdate && (
            <div className="text-xs text-gray-500 border-t border-gray-200 pt-3">
              Última actualización: {new Date(lastUpdate).toLocaleString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          )}

          {/* Action button */}
          <div className="flex justify-center pt-2">
            <button
              onClick={onAcknowledge}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <CheckCircle className="w-4 h-4" />
              Entendido
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
