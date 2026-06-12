'use client';

import { useState } from 'react';
import { FileText, Loader2, CheckCircle } from 'lucide-react';
import { buildSoulMapData } from '@/lib/buildSoulMapData';

const ARCANO_NAMES: Record<number, string> = {
  0: 'El Loco', 1: 'El Mago', 2: 'La Sacerdotisa', 3: 'La Emperatriz',
  4: 'El Emperador', 5: 'El Hierofante', 6: 'Los Enamorados', 7: 'El Carro',
  8: 'La Fuerza', 9: 'El Ermitaño', 10: 'La Rueda', 11: 'La Justicia',
  12: 'El Colgado', 13: 'La Muerte', 14: 'La Templanza', 15: 'El Diablo',
  16: 'La Torre', 17: 'La Estrella', 18: 'La Luna', 19: 'El Sol',
  20: 'El Juicio', 21: 'El Mundo'
};

interface Props {
  nombre: string;
  birthDate: string; // YYYY-MM-DD
}

function buildHtmlReport(nombre: string, birthDate: string): string {
  const data = buildSoulMapData(nombre, birthDate);
  const { arcanos, gematria, vibraciones, letrasDelAlma, cuentasPendientes } = data;

  const [year, month, day] = birthDate.split('-');
  const fechaLegible = `${day}/${month}/${year}`;

  const letrasHtml = letrasDelAlma.map(l =>
    `<tr>
      <td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;font-weight:600">${l.hebreo} ${l.nombre}</td>
      <td style="padding:6px 12px;border-bottom:1px solid #e2e8f0">${l.significado}</td>
      <td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;color:#6b7280">${l.cualidad}</td>
    </tr>`
  ).join('');

  const cuentasHtml = Object.entries(cuentasPendientes).map(([k, v]) =>
    `<li><strong>Número ${k}:</strong> intensidad ${v}/7</li>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Mapa del Alma — ${nombre}</title>
  <style>
    @media print { body { margin: 0; } }
    body { font-family: Georgia, serif; color: #1e1b4b; background: #fff; max-width: 800px; margin: 0 auto; padding: 40px 32px; }
    h1 { font-size: 28px; color: #4c1d95; text-align: center; margin-bottom: 4px; }
    .subtitle { text-align: center; color: #7c3aed; font-size: 13px; letter-spacing: 2px; margin-bottom: 32px; }
    h2 { font-size: 16px; color: #5b21b6; border-bottom: 2px solid #ede9fe; padding-bottom: 6px; margin-top: 28px; }
    .grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 12px 0; }
    .card { background: #f5f3ff; border-radius: 8px; padding: 14px 16px; text-align: center; }
    .card .val { font-size: 28px; font-weight: bold; color: #4c1d95; }
    .card .lbl { font-size: 11px; color: #7c3aed; text-transform: uppercase; letter-spacing: 1px; }
    .card .name { font-size: 13px; color: #5b21b6; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    ul { font-size: 13px; line-height: 1.8; }
    .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 16px; }
  </style>
</head>
<body>
  <h1>Mapa del Alma</h1>
  <p class="subtitle">ANÁLISIS CABALÍSTICO PROFESIONAL · MÉTODO ATLANTIS / SHEKINAH</p>

  <h2>I. IDENTIDAD</h2>
  <p><strong>Nombre:</strong> ${nombre}</p>
  <p><strong>Fecha de nacimiento:</strong> ${fechaLegible}</p>

  <h2>II. GEMATRÍA ATLANTIS</h2>
  <div class="grid3">
    <div class="card">
      <div class="val">${gematria.total}</div>
      <div class="lbl">Gematría Total</div>
    </div>
    <div class="card">
      <div class="val">${gematria.scf}</div>
      <div class="lbl">SCF / ET</div>
      <div class="name">Edad Transformación</div>
    </div>
    <div class="card">
      <div class="val">${gematria.pin}</div>
      <div class="lbl">PIN / Corazón</div>
    </div>
  </div>

  <h2>III. SENDERO OTD (Origen · Transformación · Destino)</h2>
  <div class="grid3">
    <div class="card">
      <div class="val">${arcanos.origen}</div>
      <div class="lbl">Origen</div>
      <div class="name">${ARCANO_NAMES[arcanos.origen] ?? '—'}</div>
    </div>
    <div class="card">
      <div class="val">${arcanos.transformacion}</div>
      <div class="lbl">Transformación</div>
      <div class="name">${ARCANO_NAMES[arcanos.transformacion] ?? '—'}</div>
    </div>
    <div class="card">
      <div class="val">${arcanos.destino}</div>
      <div class="lbl">Destino</div>
      <div class="name">${ARCANO_NAMES[arcanos.destino] ?? '—'}</div>
    </div>
  </div>

  <h2>IV. VIBRACIONES</h2>
  <p><strong>Vibración Alma (Fecha):</strong> ${vibraciones.alma}</p>
  <p><strong>Días de Fuerza Personal:</strong> ${vibraciones.diasFuerza.join(', ')}</p>

  <h2>V. LETRAS DEL ALMA (${letrasDelAlma.length})</h2>
  <table>
    <thead>
      <tr style="background:#ede9fe">
        <th style="padding:8px 12px;text-align:left;font-size:12px">Letra</th>
        <th style="padding:8px 12px;text-align:left;font-size:12px">Significado</th>
        <th style="padding:8px 12px;text-align:left;font-size:12px">Cualidades</th>
      </tr>
    </thead>
    <tbody>${letrasHtml}</tbody>
  </table>

  <h2>VI. CUENTAS PENDIENTES (KARMAS)</h2>
  <ul>${cuentasHtml}</ul>

  <div class="footer">
    <p>Generado con el Motor Shekinah · Método Atlantis · Studios33</p>
    <p>Este análisis es de carácter espiritual y no sustituye orientación profesional de salud.</p>
  </div>
</body>
</html>`;
}

export default function GenerarInforme({ nombre, birthDate }: Props) {
  const [estado, setEstado] = useState<'idle' | 'generando' | 'listo'>('idle');

  const handleGenerar = () => {
    if (!nombre || !birthDate) return;
    setEstado('generando');

    try {
      const html = buildHtmlReport(nombre, birthDate);
      const ventana = window.open('', '_blank');
      if (!ventana) {
        setEstado('idle');
        return;
      }
      ventana.document.write(html);
      ventana.document.close();
      ventana.focus();
      setTimeout(() => {
        ventana.print();
        setEstado('listo');
        setTimeout(() => setEstado('idle'), 3000);
      }, 500);
    } catch {
      setEstado('idle');
    }
  };

  const disabled = !nombre || !birthDate || estado === 'generando';

  return (
    <button
      type="button"
      onClick={handleGenerar}
      disabled={disabled}
      className={[
        'inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200',
        estado === 'listo'
          ? 'bg-emerald-600 text-white'
          : 'bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white shadow-lg hover:shadow-purple-500/30',
        disabled && estado !== 'listo' ? 'opacity-50 cursor-not-allowed' : ''
      ].join(' ')}
    >
      {estado === 'generando' && <Loader2 className="w-4 h-4 animate-spin" />}
      {estado === 'listo' && <CheckCircle className="w-4 h-4" />}
      {estado === 'idle' && <FileText className="w-4 h-4" />}
      {estado === 'generando' ? 'Generando…' : estado === 'listo' ? '¡Listo!' : 'Generar informe profesional'}
    </button>
  );
}
