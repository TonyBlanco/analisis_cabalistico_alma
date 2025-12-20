import type { BodyRegion } from '../types';

export const bodyRegions: BodyRegion[] = [
  {
    id: 'head',
    label: 'Head',
    description: 'Zona superior para observacion consultive de procesos simbolicos.',
    side: 'front',
    hotspot: { x: 50, y: 14, r: 7 },
  },
  {
    id: 'throat',
    label: 'Throat',
    description: 'Area cervical para observacion consultive y dialogo interno.',
    side: 'front',
    hotspot: { x: 50, y: 26, r: 5 },
  },
  {
    id: 'heart',
    label: 'Chest',
    description: 'Zona toracica para observar resonancias relacionales.',
    side: 'front',
    hotspot: { x: 50, y: 38, r: 7 },
  },
  {
    id: 'solarPlexus',
    label: 'Solar Plexus',
    description: 'Punto central para observacion de dinamicas simbolicas.',
    side: 'front',
    hotspot: { x: 50, y: 50, r: 6 },
  },
  {
    id: 'abdomen',
    label: 'Abdomen',
    description: 'Area media para reflexion sobre procesos internos.',
    side: 'front',
    hotspot: { x: 50, y: 60, r: 6 },
  },
  {
    id: 'pelvis',
    label: 'Pelvis',
    description: 'Zona inferior para observacion consultive de base vital.',
    side: 'front',
    hotspot: { x: 50, y: 74, r: 7 },
  },
  {
    id: 'leftShoulder',
    label: 'Left Shoulder',
    description: 'Lado izquierdo superior para observacion simbolica.',
    side: 'front',
    hotspot: { x: 34, y: 30, r: 5 },
  },
  {
    id: 'rightShoulder',
    label: 'Right Shoulder',
    description: 'Lado derecho superior para observacion simbolica.',
    side: 'front',
    hotspot: { x: 66, y: 30, r: 5 },
  },
  {
    id: 'leftHip',
    label: 'Left Hip',
    description: 'Lado izquierdo inferior para observacion consultive.',
    side: 'front',
    hotspot: { x: 42, y: 80, r: 5 },
  },
  {
    id: 'rightHip',
    label: 'Right Hip',
    description: 'Lado derecho inferior para observacion consultive.',
    side: 'front',
    hotspot: { x: 58, y: 80, r: 5 },
  },
];
