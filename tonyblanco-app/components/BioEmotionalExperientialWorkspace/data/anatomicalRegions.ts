import type { BodyAnatomy } from '../types';

export interface AnatomicalRegion {
  id: string;
  label: string;
  description: string;
  bioEmotionalThemes: string[];
  svgPath: {
    male: string;
    female: string;
    intersex: string;
    unknown: string;
  };
  hotspot: {
    x: number;
    y: number;
    r: number;
  };
}

/**
 * Anatomical regions for bio-emotional observation
 * Non-diagnostic, consultative only
 * Based on biological sex for anatomical accuracy
 */
export const anatomicalRegions: AnatomicalRegion[] = [
  {
    id: 'head',
    label: 'Cabeza',
    description: 'Centro de pensamiento, identidad y conexión espiritual',
    bioEmotionalThemes: [
      'Pensamientos recurrentes',
      'Identidad y autoconcepto',
      'Conexión con lo superior',
      'Migrañas y tensión mental',
    ],
    svgPath: {
      male: 'M100,20 Q85,20 85,35 Q85,50 100,55 Q115,50 115,35 Q115,20 100,20 Z',
      female: 'M100,20 Q85,20 85,35 Q85,50 100,55 Q115,50 115,35 Q115,20 100,20 Z',
      intersex: 'M100,20 Q85,20 85,35 Q85,50 100,55 Q115,50 115,35 Q115,20 100,20 Z',
      unknown: 'M100,20 Q85,20 85,35 Q85,50 100,55 Q115,50 115,35 Q115,20 100,20 Z',
    },
    hotspot: { x: 50, y: 12, r: 8 },
  },
  {
    id: 'throat',
    label: 'Garganta',
    description: 'Expresión, comunicación y verdad personal',
    bioEmotionalThemes: [
      'Palabras no dichas',
      'Expresión bloqueada',
      'Comunicación familiar',
      'Tiroides y voz',
    ],
    svgPath: {
      male: 'M100,55 Q90,55 90,65 Q90,70 100,72 Q110,70 110,65 Q110,55 100,55 Z',
      female: 'M100,55 Q90,55 90,65 Q90,70 100,72 Q110,70 110,65 Q110,55 100,55 Z',
      intersex: 'M100,55 Q90,55 90,65 Q90,70 100,72 Q110,70 110,65 Q110,55 100,55 Z',
      unknown: 'M100,55 Q90,55 90,65 Q90,70 100,72 Q110,70 110,65 Q110,55 100,55 Z',
    },
    hotspot: { x: 50, y: 20, r: 5 },
  },
  {
    id: 'chest',
    label: 'Pecho / Corazón',
    description: 'Amor, relaciones y vínculos afectivos',
    bioEmotionalThemes: [
      'Duelos no procesados',
      'Relaciones de pareja',
      'Amor materno/paterno',
      'Respiración y ansiedad',
    ],
    svgPath: {
      male: 'M100,72 Q75,75 75,95 Q75,110 85,120 L100,130 L115,120 Q125,110 125,95 Q125,75 100,72 Z',
      female: 'M100,72 Q75,75 75,95 Q75,110 85,120 L100,130 L115,120 Q125,110 125,95 Q125,75 100,72 Z',
      intersex: 'M100,72 Q75,75 75,95 Q75,110 85,120 L100,130 L115,120 Q125,110 125,95 Q125,75 100,72 Z',
      unknown: 'M100,72 Q75,75 75,95 Q75,110 85,120 L100,130 L115,120 Q125,110 125,95 Q125,75 100,72 Z',
    },
    hotspot: { x: 50, y: 32, r: 9 },
  },
  {
    id: 'solar-plexus',
    label: 'Plexo Solar',
    description: 'Poder personal, autoestima y control',
    bioEmotionalThemes: [
      'Miedo y ansiedad',
      'Poder y control',
      'Digestión emocional',
      'Estrés y tensión',
    ],
    svgPath: {
      male: 'M100,130 Q80,132 80,145 Q80,155 100,158 Q120,155 120,145 Q120,132 100,130 Z',
      female: 'M100,130 Q80,132 80,145 Q80,155 100,158 Q120,155 120,145 Q120,132 100,130 Z',
      intersex: 'M100,130 Q80,132 80,145 Q80,155 100,158 Q120,155 120,145 Q120,132 100,130 Z',
      unknown: 'M100,130 Q80,132 80,145 Q80,155 100,158 Q120,155 120,145 Q120,132 100,130 Z',
    },
    hotspot: { x: 50, y: 45, r: 7 },
  },
  {
    id: 'abdomen',
    label: 'Abdomen',
    description: 'Emociones profundas, creatividad y nutrición',
    bioEmotionalThemes: [
      'Emociones reprimidas',
      'Creatividad bloqueada',
      'Nutrición y cuidado',
      'Sistema digestivo',
    ],
    svgPath: {
      male: 'M100,158 Q82,160 82,175 Q82,188 100,192 Q118,188 118,175 Q118,160 100,158 Z',
      female: 'M100,158 Q82,160 82,175 Q82,188 100,192 Q118,188 118,175 Q118,160 100,158 Z',
      intersex: 'M100,158 Q82,160 82,175 Q82,188 100,192 Q118,188 118,175 Q118,160 100,158 Z',
      unknown: 'M100,158 Q82,160 82,175 Q82,188 100,192 Q118,188 118,175 Q118,160 100,158 Z',
    },
    hotspot: { x: 50, y: 55, r: 7 },
  },
  {
    id: 'pelvis',
    label: 'Pelvis / Sacro',
    description: 'Sexualidad, supervivencia y raíces familiares',
    bioEmotionalThemes: [
      'Sexualidad y placer',
      'Supervivencia y seguridad',
      'Raíces transgeneracionales',
      'Órganos reproductivos',
    ],
    svgPath: {
      male: 'M100,192 Q78,194 78,215 Q78,230 88,240 L100,245 L112,240 Q122,230 122,215 Q122,194 100,192 Z',
      female: 'M100,192 Q78,194 78,215 Q78,235 88,245 L100,250 L112,245 Q122,235 122,215 Q122,194 100,192 Z',
      intersex: 'M100,192 Q78,194 78,215 Q78,232 88,242 L100,247 L112,242 Q122,232 122,215 Q122,194 100,192 Z',
      unknown: 'M100,192 Q78,194 78,215 Q78,230 88,240 L100,245 L112,240 Q122,230 122,215 Q122,194 100,192 Z',
    },
    hotspot: { x: 50, y: 70, r: 8 },
  },
  {
    id: 'left-shoulder',
    label: 'Hombro Izquierdo',
    description: 'Responsabilidades y cargas emocionales (lado receptivo)',
    bioEmotionalThemes: [
      'Cargas familiares',
      'Responsabilidades heredadas',
      'Lado materno/receptivo',
      'Tensión y rigidez',
    ],
    svgPath: {
      male: 'M75,75 Q65,75 60,85 Q58,95 65,100 Q72,95 75,90 Z',
      female: 'M75,75 Q65,75 60,85 Q58,95 65,100 Q72,95 75,90 Z',
      intersex: 'M75,75 Q65,75 60,85 Q58,95 65,100 Q72,95 75,90 Z',
      unknown: 'M75,75 Q65,75 60,85 Q58,95 65,100 Q72,95 75,90 Z',
    },
    hotspot: { x: 32, y: 28, r: 6 },
  },
  {
    id: 'right-shoulder',
    label: 'Hombro Derecho',
    description: 'Acción y proyección externa (lado activo)',
    bioEmotionalThemes: [
      'Acción y hacer',
      'Proyección al mundo',
      'Lado paterno/activo',
      'Tensión y rigidez',
    ],
    svgPath: {
      male: 'M125,75 Q135,75 140,85 Q142,95 135,100 Q128,95 125,90 Z',
      female: 'M125,75 Q135,75 140,85 Q142,95 135,100 Q128,95 125,90 Z',
      intersex: 'M125,75 Q135,75 140,85 Q142,95 135,100 Q128,95 125,90 Z',
      unknown: 'M125,75 Q135,75 140,85 Q142,95 135,100 Q128,95 125,90 Z',
    },
    hotspot: { x: 68, y: 28, r: 6 },
  },
  {
    id: 'left-arm',
    label: 'Brazo Izquierdo',
    description: 'Recibir y abrazar (lado receptivo)',
    bioEmotionalThemes: [
      'Capacidad de recibir',
      'Abrazar y contener',
      'Relación con lo materno',
      'Flexibilidad emocional',
    ],
    svgPath: {
      male: 'M65,100 Q55,105 55,130 Q55,145 60,150 Q65,145 65,130 Q65,115 65,100 Z',
      female: 'M65,100 Q55,105 55,130 Q55,145 60,150 Q65,145 65,130 Q65,115 65,100 Z',
      intersex: 'M65,100 Q55,105 55,130 Q55,145 60,150 Q65,145 65,130 Q65,115 65,100 Z',
      unknown: 'M65,100 Q55,105 55,130 Q55,145 60,150 Q65,145 65,130 Q65,115 65,100 Z',
    },
    hotspot: { x: 28, y: 42, r: 5 },
  },
  {
    id: 'right-arm',
    label: 'Brazo Derecho',
    description: 'Dar y actuar (lado activo)',
    bioEmotionalThemes: [
      'Capacidad de dar',
      'Acción en el mundo',
      'Relación con lo paterno',
      'Fuerza y determinación',
    ],
    svgPath: {
      male: 'M135,100 Q145,105 145,130 Q145,145 140,150 Q135,145 135,130 Q135,115 135,100 Z',
      female: 'M135,100 Q145,105 145,130 Q145,145 140,150 Q135,145 135,130 Q135,115 135,100 Z',
      intersex: 'M135,100 Q145,105 145,130 Q145,145 140,150 Q135,145 135,130 Q135,115 135,100 Z',
      unknown: 'M135,100 Q145,105 145,130 Q145,145 140,150 Q135,145 135,130 Q135,115 135,100 Z',
    },
    hotspot: { x: 72, y: 42, r: 5 },
  },
  {
    id: 'left-hip',
    label: 'Cadera Izquierda',
    description: 'Movimiento y avance (lado receptivo)',
    bioEmotionalThemes: [
      'Avanzar en la vida',
      'Flexibilidad vital',
      'Linaje materno',
      'Apoyo y estabilidad',
    ],
    svgPath: {
      male: 'M78,215 Q70,220 70,235 Q70,245 78,248 Q82,240 82,230 Z',
      female: 'M78,215 Q70,220 70,240 Q70,252 78,255 Q82,245 82,235 Z',
      intersex: 'M78,215 Q70,220 70,237 Q70,248 78,251 Q82,242 82,232 Z',
      unknown: 'M78,215 Q70,220 70,235 Q70,245 78,248 Q82,240 82,230 Z',
    },
    hotspot: { x: 38, y: 72, r: 5 },
  },
  {
    id: 'right-hip',
    label: 'Cadera Derecha',
    description: 'Movimiento y avance (lado activo)',
    bioEmotionalThemes: [
      'Avanzar en la vida',
      'Toma de decisiones',
      'Linaje paterno',
      'Apoyo y estabilidad',
    ],
    svgPath: {
      male: 'M122,215 Q130,220 130,235 Q130,245 122,248 Q118,240 118,230 Z',
      female: 'M122,215 Q130,220 130,240 Q130,252 122,255 Q118,245 118,235 Z',
      intersex: 'M122,215 Q130,220 130,237 Q130,248 122,251 Q118,242 118,232 Z',
      unknown: 'M122,215 Q130,220 130,235 Q130,245 122,248 Q118,240 118,230 Z',
    },
    hotspot: { x: 62, y: 72, r: 5 },
  },
  {
    id: 'left-leg',
    label: 'Pierna Izquierda',
    description: 'Enraizamiento y conexión con la tierra',
    bioEmotionalThemes: [
      'Conexión con la tierra',
      'Seguridad y estabilidad',
      'Avanzar o retroceder',
      'Circulación y movimiento',
    ],
    svgPath: {
      male: 'M88,240 Q82,245 82,280 Q82,295 88,300 Q92,290 92,270 Z',
      female: 'M88,245 Q82,250 82,285 Q82,300 88,305 Q92,295 92,275 Z',
      intersex: 'M88,242 Q82,247 82,282 Q82,297 88,302 Q92,292 92,272 Z',
      unknown: 'M88,240 Q82,245 82,280 Q82,295 88,300 Q92,290 92,270 Z',
    },
    hotspot: { x: 42, y: 88, r: 5 },
  },
  {
    id: 'right-leg',
    label: 'Pierna Derecha',
    description: 'Enraizamiento y conexión con la tierra',
    bioEmotionalThemes: [
      'Conexión con la tierra',
      'Seguridad y estabilidad',
      'Avanzar o retroceder',
      'Circulación y movimiento',
    ],
    svgPath: {
      male: 'M112,240 Q118,245 118,280 Q118,295 112,300 Q108,290 108,270 Z',
      female: 'M112,245 Q118,250 118,285 Q118,300 112,305 Q108,295 108,275 Z',
      intersex: 'M112,242 Q118,247 118,282 Q118,297 112,302 Q108,292 108,272 Z',
      unknown: 'M112,240 Q118,245 118,280 Q118,295 112,300 Q108,290 108,270 Z',
    },
    hotspot: { x: 58, y: 88, r: 5 },
  },
];

/**
 * Get anatomical regions for specific body anatomy
 */
export function getRegionsForAnatomy(anatomy: BodyAnatomy): AnatomicalRegion[] {
  return anatomicalRegions;
}

/**
 * Get SVG path for a region based on anatomy
 */
export function getRegionPath(regionId: string, anatomy: BodyAnatomy): string {
  const region = anatomicalRegions.find((r) => r.id === regionId);
  return region?.svgPath[anatomy] || '';
}
