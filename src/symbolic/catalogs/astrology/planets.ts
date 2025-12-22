export type PlanetId =
  | 'sun'
  | 'moon'
  | 'mercury'
  | 'venus'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune'
  | 'pluto';

export interface PlanetCatalogEntry {
  id: PlanetId;
  name: string;
}

export const PLANETS: PlanetCatalogEntry[] = [
  { id: 'sun', name: 'Sun' },
  { id: 'moon', name: 'Moon' },
  { id: 'mercury', name: 'Mercury' },
  { id: 'venus', name: 'Venus' },
  { id: 'mars', name: 'Mars' },
  { id: 'jupiter', name: 'Jupiter' },
  { id: 'saturn', name: 'Saturn' },
  { id: 'uranus', name: 'Uranus' },
  { id: 'neptune', name: 'Neptune' },
  { id: 'pluto', name: 'Pluto' },
];
