'use client';

import TarotCardGrid from './TarotCardGrid';
import type { PatientContext } from '@/components/BodySoulVisualization/types';

interface TarotLayerProps {
  patientId?: PatientContext['patientId'];
  patientName?: string;
  patientBirthDate?: PatientContext['patientBirthDate'];
}

export default function TarotLayer({
  patientId,
  patientName,
  patientBirthDate,
}: TarotLayerProps) {
  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-fuchsia-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1">Tarot Cabalistico</h1>
                <p className="text-white/90 text-sm">Exploracion simbolica observacional.</p>
              </div>
            </div>

            {patientName && (
              <div className="text-right">
                <div className="text-xs text-white/70 uppercase tracking-wide">Paciente</div>
                <div className="text-lg font-semibold">{patientName}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="space-y-6">
          <TarotCardGrid
            patientId={patientId}
            patientBirthDate={patientBirthDate}
          />
        </div>
      </div>
    </div>
  );
}
