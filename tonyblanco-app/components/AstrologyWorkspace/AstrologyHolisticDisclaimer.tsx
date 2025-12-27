'use client';

export default function AstrologyHolisticDisclaimer({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 ${compact ? 'text-xs' : ''}`}>
      <p className="font-semibold">Aviso importante</p>
      <p>
        Este módulo ofrece análisis astrológico y simbólico con fines holísticos y de orientación personal.
        No es un sistema médico y no sustituye evaluación, tratamiento ni asesoramiento sanitario.
      </p>
    </div>
  );
}
