'use client';

import AstrologySidebar from './AstrologySidebar';
import AstrologyVisualCore from './AstrologyVisualCore';
import type { AstrologyContext } from './types';

interface AstrologyWorkspaceProps {
  patientId?: AstrologyContext['patientId'];
  patientBirthDate?: AstrologyContext['patientBirthDate'];
}

export default function AstrologyWorkspace({
  patientId,
  patientBirthDate,
}: AstrologyWorkspaceProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AstrologySidebar />
        <main className="flex-1 px-6 py-6">
          <div className="mb-4 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
            Observacional. Sin interpretacion, sin prediccion, sin automatizacion.
          </div>
          <div className="flex gap-6 items-start">
            <AstrologyVisualCore patientId={patientId} patientBirthDate={patientBirthDate} />
          </div>
        </main>
      </div>
    </div>
  );
}
