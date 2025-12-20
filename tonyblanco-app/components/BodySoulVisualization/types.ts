export type VisualizationLayerId = 'body' | 'sefirot' | 'integrated';

export type BodyViewSide = 'front' | 'back';

export interface SefirahDefinition {
  id: string;
  hebrewName: string;
  spanishName: string;
  description: string;
  colorToken: string;
  position: {
    x: number;
    y: number;
  };
}

export interface SefirahOverlayNode {
  id: string;
  label: string;
  position: {
    x: number;
    y: number;
  };
  colorToken: string;
}

export interface SefirahConnection {
  fromId: string;
  toId: string;
}

export interface BodyRegion {
  id: string;
  label: string;
  description: string;
  side: BodyViewSide;
  hotspot: {
    x: number;
    y: number;
    r: number;
  };
}

export interface SefirahBodyCorrespondence {
  sefirahId: string;
  bodyRegionId: string;
  note: string;
}

export interface TherapistNote {
  id: string;
  targetType: 'sefirah' | 'bodyRegion';
  targetId: string;
  text: string;
  status: 'attention' | 'observed' | 'historical';
  createdAt: string;
  updatedAt: string;
}

export interface VisualizationState {
  activeLayers: VisualizationLayerId[];
  selectedSefirahId: string | null;
  selectedBodyRegionId: string | null;
  side: BodyViewSide;
  notes: TherapistNote[];
}
