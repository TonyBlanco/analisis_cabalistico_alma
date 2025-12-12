'use client';

import { useState } from 'react';
import { X, Heart, Shield, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface TherapeuticConsentModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onClose?: () => void;
  type?: 'test' | 'analysis';
}

export default function TherapeuticConsentModal({
  isOpen,
  onAccept,
  onClose,
  type = 'test'
}: TherapeuticConsentModalProps) {
  const [commitments, setCommitments] = useState({
    honesty: false,
    safeSpace: false,
    ready: false
  });

  const canProceed = commitments.honesty && commitments.safeSpace && commitments.ready;

  const handleAccept = () => {
    if (canProceed) {
      // Guardar consentimiento en localStorage
      const consentData = {
        timestamp: new Date().toISOString(),
        type,
        commitments,
        accepted: true
      };
      localStorage.setItem('therapeuticConsent', JSON.stringify(consentData));
      onAccept();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700 text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light text-center mb-2" style={{ color: '#D4AF37' }}>
            Antes de comenzar tu viaje interior
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Cuerpo del mensaje */}
          <div className="text-center space-y-4">
            <p className="text-lg leading-relaxed text-slate-300">
              Bienvenido/a. Lo que estás a punto de iniciar no es un examen para juzgarte, ni un {type === 'test' ? 'test' : 'análisis'} para etiquetarte. Considéralo una <span className="text-amber-400 font-medium">brújula</span>.
            </p>
            <p className="text-base leading-relaxed text-slate-400">
              Para poder acompañarte a elevar tu consciencia y trabajar en la sanación de tu alma, necesitamos saber dónde estás hoy. Tus respuestas son las <span className="text-amber-400">coordenadas</span> que nos ayudarán a trazar el mapa de regreso a tu esencia.
            </p>
          </div>

          {/* El Compromiso */}
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 space-y-4">
            <h3 className="text-lg font-semibold text-amber-400 flex items-center gap-2 mb-4">
              <Heart className="h-5 w-5" />
              El Compromiso
            </h3>
            
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer group hover:bg-slate-700/30 p-3 rounded-lg transition-colors">
                <input
                  type="checkbox"
                  checked={commitments.honesty}
                  onChange={(e) => setCommitments({ ...commitments, honesty: e.target.checked })}
                  className="mt-1 w-5 h-5 rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900 cursor-pointer"
                />
                <div className="flex-1">
                  <span className="text-slate-200 font-medium">Honro mi verdad</span>
                  <p className="text-sm text-slate-400 mt-1">
                    Me comprometo a responder con sinceridad, entendiendo que no hay respuestas "correctas" o "incorrectas", solo mi realidad actual.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group hover:bg-slate-700/30 p-3 rounded-lg transition-colors">
                <input
                  type="checkbox"
                  checked={commitments.safeSpace}
                  onChange={(e) => setCommitments({ ...commitments, safeSpace: e.target.checked })}
                  className="mt-1 w-5 h-5 rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900 cursor-pointer"
                />
                <div className="flex-1">
                  <span className="text-slate-200 font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4 text-amber-400" />
                    Espacio Seguro
                  </span>
                  <p className="text-sm text-slate-400 mt-1">
                    Entiendo que toda la información que comparta aquí es confidencial y sagrada, utilizada únicamente para mi proceso de crecimiento. Puedo solicitar la eliminación de mis datos al finalizar mi terapia.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group hover:bg-slate-700/30 p-3 rounded-lg transition-colors">
                <input
                  type="checkbox"
                  checked={commitments.ready}
                  onChange={(e) => setCommitments({ ...commitments, ready: e.target.checked })}
                  className="mt-1 w-5 h-5 rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900 cursor-pointer"
                />
                <div className="flex-1">
                  <span className="text-slate-200 font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    Doy el paso
                  </span>
                  <p className="text-sm text-slate-400 mt-1">
                    Acepto iniciar esta exploración consciente y permitir el uso de mis datos para este {type === 'test' ? 'test' : 'análisis'} y su interpretación terapéutica.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Micro-Meditación */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-center">
            <p className="text-sm text-amber-300 italic">
              💫 Sugerencia: Cierra los ojos, toma una respiración profunda por la nariz, y al exhalar, suelta cualquier expectativa. Ahora, cuando estés listo/a, continúa.
            </p>
          </div>

          {/* Botón de Acción */}
          <div className="flex justify-center pt-4">
            <button
              onClick={handleAccept}
              disabled={!canProceed}
              className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 ${
                canProceed
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transform hover:scale-105'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              Comenzar mi Viaje
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

