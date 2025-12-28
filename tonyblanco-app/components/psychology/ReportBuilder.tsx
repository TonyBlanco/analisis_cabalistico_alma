'use client';

import React from 'react';
import { PsychAstroOutline } from '../psychology/types';

interface PrintableProps {
  outline: PsychAstroOutline;
  natalSnapshot?: any;
}

function buildHTML({ outline, natalSnapshot }: PrintableProps) {
  const title = 'Informe Astrológico - Lectura Psicológica (Holística)';
  const legal = `“Este informe es una lectura simbólica basada en astrología psicológica y enfoques holísticos de autoconocimiento.\nNo constituye diagnóstico médico, psicológico ni evaluación clínica.\nSu finalidad es orientativa, reflexiva y educativa.”`;

  const svgPlaceholder = (natalSnapshot && natalSnapshot.svg) ? natalSnapshot.svg : '<div style="width:420px;height:420px;background:#f6f6f6;display:flex;align-items:center;justify-content:center;color:#999">SVG Carta Aquí</div>';

  return `
  <html>
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <style>
      body { font-family: Inter, Arial, sans-serif; color:#111; padding:20px }
      .cover { text-align:center; margin-top:40px }
      .meta { margin-top:12px; color:#444 }
      .section { margin-top:22px }
      .note { font-size:12px; color:#666; margin-top:18px }
      .svg-wrap { margin-top:18px }
    </style>
  </head>
  <body>
    <div class="cover">
      <h1>${title}</h1>
      <div class="meta">Informe para el consultante — Lectura simbólica</div>
    </div>

    <div class="section svg-wrap">
      ${svgPlaceholder}
    </div>

    <div class="section">
      <h2>Identidad central</h2>
      <p>${outline.core_identity}</p>
    </div>

    <div class="section">
      <h2>Arquetipos dominantes</h2>
      <ul>
        ${outline.dominant_archetypes.map((a) => `<li>${a}</li>`).join('')}
      </ul>
    </div>

    <div class="section">
      <h2>Sombra y tensiones</h2>
      <ul>
        ${outline.shadow_dynamics.map((s) => `<li>${s}</li>`).join('')}
      </ul>
    </div>

    <div class="section">
      <h2>Camino de individuación</h2>
      <ul>
        ${outline.individuation_path.map((s) => `<li>${s}</li>`).join('')}
      </ul>
    </div>

    <div class="note">
      <pre>${legal}</pre>
    </div>
  </body>
  </html>
`;
}

const ReportBuilder = {
  openPrintableReport({ outline, natalSnapshot }: PrintableProps) {
    const html = buildHTML({ outline, natalSnapshot });
    const win = window.open('', '_blank', 'noopener');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    // allow rendering then call print (let user confirm save-as pdf)
    setTimeout(() => {
      try { win.focus(); win.print(); } catch (e) { /* ignore */ }
    }, 500);
  }
}

export default ReportBuilder;
