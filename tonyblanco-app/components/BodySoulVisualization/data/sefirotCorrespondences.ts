import type { SefirahBodyCorrespondence, SefirahConnection, SefirahDefinition } from '../types';

export const sefirotDefinitions: SefirahDefinition[] = [
  {
    id: 'keter',
    hebrewName: 'Keter',
    spanishName: 'Corona',
    description: 'Referencia simbolica de apertura y vision amplia.',
    colorToken: 'amber-500',
    position: { x: 50, y: 6 },
  },
  {
    id: 'chokmah',
    hebrewName: 'Chokmah',
    spanishName: 'Sabiduria',
    description: 'Referencia simbolica de intuicion y perspectiva.',
    colorToken: 'sky-500',
    position: { x: 70, y: 18 },
  },
  {
    id: 'binah',
    hebrewName: 'Binah',
    spanishName: 'Entendimiento',
    description: 'Referencia simbolica de claridad y estructura.',
    colorToken: 'indigo-500',
    position: { x: 30, y: 18 },
  },
  {
    id: 'chesed',
    hebrewName: 'Chesed',
    spanishName: 'Misericordia',
    description: 'Referencia simbolica de amplitud y apertura relacional.',
    colorToken: 'emerald-500',
    position: { x: 76, y: 36 },
  },
  {
    id: 'gevurah',
    hebrewName: 'Gevurah',
    spanishName: 'Rigor',
    description: 'Referencia simbolica de limites y enfoque.',
    colorToken: 'rose-500',
    position: { x: 24, y: 36 },
  },
  {
    id: 'tiferet',
    hebrewName: 'Tiferet',
    spanishName: 'Belleza',
    description: 'Referencia simbolica de integracion y balance narrativo.',
    colorToken: 'teal-500',
    position: { x: 50, y: 52 },
  },
  {
    id: 'netzach',
    hebrewName: 'Netzach',
    spanishName: 'Victoria',
    description: 'Referencia simbolica de impulso y continuidad.',
    colorToken: 'lime-500',
    position: { x: 66, y: 68 },
  },
  {
    id: 'hod',
    hebrewName: 'Hod',
    spanishName: 'Esplendor',
    description: 'Referencia simbolica de lenguaje y expresion.',
    colorToken: 'fuchsia-500',
    position: { x: 34, y: 68 },
  },
  {
    id: 'yesod',
    hebrewName: 'Yesod',
    spanishName: 'Fundamento',
    description: 'Referencia simbolica de cohesion y memoria.',
    colorToken: 'slate-500',
    position: { x: 50, y: 84 },
  },
  {
    id: 'malkuth',
    hebrewName: 'Malkuth',
    spanishName: 'Reino',
    description: 'Referencia simbolica de presencia y realidad concreta.',
    colorToken: 'orange-500',
    position: { x: 50, y: 96 },
  },
];

export const sefirotConnections: SefirahConnection[] = [
  { fromId: 'keter', toId: 'chokmah' },
  { fromId: 'keter', toId: 'binah' },
  { fromId: 'chokmah', toId: 'binah' },
  { fromId: 'chokmah', toId: 'chesed' },
  { fromId: 'binah', toId: 'gevurah' },
  { fromId: 'chesed', toId: 'gevurah' },
  { fromId: 'chesed', toId: 'tiferet' },
  { fromId: 'gevurah', toId: 'tiferet' },
  { fromId: 'tiferet', toId: 'netzach' },
  { fromId: 'tiferet', toId: 'hod' },
  { fromId: 'netzach', toId: 'hod' },
  { fromId: 'netzach', toId: 'yesod' },
  { fromId: 'hod', toId: 'yesod' },
  { fromId: 'yesod', toId: 'malkuth' },
];

export const sefirotBodyCorrespondences: SefirahBodyCorrespondence[] = [
  {
    sefirahId: 'keter',
    bodyRegionId: 'head',
    note: 'Correspondencia simbolica con la zona superior para observacion consultive.',
  },
  {
    sefirahId: 'chokmah',
    bodyRegionId: 'rightShoulder',
    note: 'Correspondencia simbolica con el lado derecho superior.',
  },
  {
    sefirahId: 'binah',
    bodyRegionId: 'leftShoulder',
    note: 'Correspondencia simbolica con el lado izquierdo superior.',
  },
  {
    sefirahId: 'chesed',
    bodyRegionId: 'rightShoulder',
    note: 'Correspondencia simbolica de apertura en el lado derecho.',
  },
  {
    sefirahId: 'gevurah',
    bodyRegionId: 'leftShoulder',
    note: 'Correspondencia simbolica de enfoque en el lado izquierdo.',
  },
  {
    sefirahId: 'tiferet',
    bodyRegionId: 'heart',
    note: 'Correspondencia simbolica con el centro toracico.',
  },
  {
    sefirahId: 'netzach',
    bodyRegionId: 'rightHip',
    note: 'Correspondencia simbolica con el soporte derecho inferior.',
  },
  {
    sefirahId: 'hod',
    bodyRegionId: 'leftHip',
    note: 'Correspondencia simbolica con el soporte izquierdo inferior.',
  },
  {
    sefirahId: 'yesod',
    bodyRegionId: 'abdomen',
    note: 'Correspondencia simbolica con la zona abdominal.',
  },
  {
    sefirahId: 'malkuth',
    bodyRegionId: 'pelvis',
    note: 'Correspondencia simbolica con la base corporal.',
  },
];
