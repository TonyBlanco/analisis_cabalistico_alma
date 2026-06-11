export type AstrologyMethod = {
  id: string;
  name: string;
  status: 'active' | 'locked' | 'coming_soon';
  category: 'natal' | 'relationship' | 'forecast' | 'special';
};

export const ASTRO_METHODS: AstrologyMethod[] = [
  { id: 'natal', name: 'Carta Natal', status: 'active', category: 'natal' },
  { id: 'natal_asteroids', name: 'Natal + Asteroides', status: 'active', category: 'natal' },
  { id: 'huber', name: 'Estilo Huber', status: 'active', category: 'natal' },
  { id: 'harmonics', name: 'Armónicos', status: 'active', category: 'special' },
  { id: 'persona', name: 'Persona Charts', status: 'active', category: 'special' },
  { id: 'davison', name: 'Davison', status: 'active', category: 'relationship' },
  { id: 'relocation', name: 'Relocación', status: 'active', category: 'special' },
];

export default ASTRO_METHODS;
