'use client';

const BOTA_MAJOR_PNGS = [
  '00_el_loco.png',
  '01_el_mago.png',
  '02_la_sacerdotisa.png',
  '03_la_emperatriz.png',
  '04_el_emperador.png',
  '05_el_hierofante.png',
  '06_los_amantes.png',
  '07_el_carro.png',
  '08_la_fuerza.png',
  '09_el_ermitano.png',
  '10_la_rueda.png',
  '11_la_justicia.png',
  '12_el_colgado.png',
  '13_la_muerte.png',
  '14_la_templanza.png',
  '15_el_diablo.png',
  '16_la_torre.png',
  '17_la_estrella.png',
  '18_la_luna.png',
  '19_el_sol.png',
  '20_el_juicio.png',
  '21_el_mundo.png',
] as const;

function labelFromFilename(filename: string) {
  const withoutExt = filename.replace(/\.png$/i, '');
  const withoutIndex = withoutExt.replace(/^\d{2}_/, '');
  return withoutIndex.replace(/_/g, ' ');
}

export default function BotaImageReferencePanel() {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">B.O.T.A. — Referencia visual</h3>
          <p className="mt-1 text-xs text-gray-600">
            Imágenes PNG de referencia (solo lectura). No afecta SWM v3.
          </p>
        </div>
        <div className="text-[11px] uppercase tracking-wide text-gray-500">22 arcanos</div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {BOTA_MAJOR_PNGS.map((filename) => {
          const label = labelFromFilename(filename);
          return (
            <figure key={filename} className="rounded-lg border border-gray-100 bg-gray-50 p-2">
              <img
                src={`/symbolic_assets/tarot/bota/majors/${filename}`}
                alt={`B.O.T.A. ${label}`}
                className="h-auto w-full rounded-md bg-white object-contain"
                loading="lazy"
              />
              <figcaption className="mt-2 text-center text-[11px] text-gray-600">
                {label}
              </figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}

