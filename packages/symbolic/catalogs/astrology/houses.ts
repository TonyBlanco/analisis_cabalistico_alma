export type HouseId =
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | '11'
  | '12';

export interface HouseCatalogEntry {
  id: HouseId;
  label: string;
}

export const HOUSES: HouseCatalogEntry[] = [
  { id: '1', label: 'House 1' },
  { id: '2', label: 'House 2' },
  { id: '3', label: 'House 3' },
  { id: '4', label: 'House 4' },
  { id: '5', label: 'House 5' },
  { id: '6', label: 'House 6' },
  { id: '7', label: 'House 7' },
  { id: '8', label: 'House 8' },
  { id: '9', label: 'House 9' },
  { id: '10', label: 'House 10' },
  { id: '11', label: 'House 11' },
  { id: '12', label: 'House 12' },
];
