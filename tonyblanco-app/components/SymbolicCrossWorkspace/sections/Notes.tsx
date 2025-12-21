'use client';

interface NotesProps {
  notes?: string;
}

export default function Notes({ notes }: NotesProps) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
      <h3 className="text-sm font-semibold text-gray-900">Notas</h3>
      <p className="mt-1 text-xs text-gray-500">
        Registro observacional sin conclusiones ni interpretacion.
      </p>
      <div className="mt-3 text-xs text-gray-600">
        {notes || 'Observacional. Con interpretación asistida, sin predicción clínica, sin automatización decisoria.'}
      </div>
    </section>
  );
}
