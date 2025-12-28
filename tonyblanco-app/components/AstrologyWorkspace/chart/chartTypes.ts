export type ChartPlanet = {
  key: string;              // "sun"
  glyph: string;            // "☉"
  lon: number;              // 0..360 (eclíptica)
  sign: string;             // "Aries"
  signGlyph: string;        // "♈"
  deg: number;              // 0..29.999
  min?: number;
  house: number;            // 1..12
  retro?: boolean;
};

export type ChartHouse = {
  number: number;           // 1..12
  cuspLon: number;          // 0..360
};

export type ChartAspect = {
  a: string;                // planet key
  b: string;
  type: "conjunction"|"opposition"|"square"|"trine"|"sextile"|"quincunx"|"other";
  orb: number;
  exact?: boolean;
};

export type ChartAngles = {
  ascLon: number;
  mcLon: number;
  dscLon: number;
  icLon: number;
};

export type AdvancedChartInput = {
  planets: ChartPlanet[];
  houses: ChartHouse[];
  aspects: ChartAspect[];
  angles: ChartAngles | null;
  zodiacType: string;       // tropical/sidereal/draconic
  houseSystem: string;      // placidus/whole-sign/etc
};
