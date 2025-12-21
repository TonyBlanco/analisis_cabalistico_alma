'use client';

export default function Legend() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-600">
      <div className="font-semibold text-gray-800">Leyenda</div>
      <div className="mt-2 grid gap-2">
        <div>Patron seleccionado: resaltado en cada panel.</div>
        <div>Tokens grises: referencia observacional sin seleccion.</div>
      </div>
    </div>
  );
}
