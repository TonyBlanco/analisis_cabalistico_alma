export const TREE_SEFIROT = [
  { id: 'kether', x: 50, y: 5 },
  { id: 'binah', x: 20, y: 15 },
  { id: 'chokmah', x: 80, y: 15 },
  { id: 'gevurah', x: 20, y: 35 },
  { id: 'chesed', x: 80, y: 35 },
  { id: 'tiferet', x: 50, y: 50 },
  { id: 'hod', x: 20, y: 70 },
  { id: 'netzach', x: 80, y: 70 },
  { id: 'yesod', x: 50, y: 85 },
  { id: 'malkuth', x: 50, y: 97 }
] as const;

export const TREE_PATHS = [
  { id: 'kether-chokmah', from: 'kether', to: 'chokmah' },
  { id: 'kether-binah', from: 'kether', to: 'binah' },
  { id: 'chokmah-binah', from: 'chokmah', to: 'binah' },
  { id: 'chokmah-chesed', from: 'chokmah', to: 'chesed' },
  { id: 'binah-gevurah', from: 'binah', to: 'gevurah' },
  { id: 'chesed-gevurah', from: 'chesed', to: 'gevurah' },
  { id: 'chesed-tiferet', from: 'chesed', to: 'tiferet' },
  { id: 'gevurah-tiferet', from: 'gevurah', to: 'tiferet' },
  { id: 'tiferet-netzach', from: 'tiferet', to: 'netzach' },
  { id: 'tiferet-hod', from: 'tiferet', to: 'hod' },
  { id: 'netzach-hod', from: 'netzach', to: 'hod' },
  { id: 'netzach-yesod', from: 'netzach', to: 'yesod' },
  { id: 'hod-yesod', from: 'hod', to: 'yesod' },
  { id: 'tiferet-yesod', from: 'tiferet', to: 'yesod' },
  { id: 'yesod-malkuth', from: 'yesod', to: 'malkuth' },
  { id: 'chesed-netzach', from: 'chesed', to: 'netzach' },
  { id: 'gevurah-hod', from: 'gevurah', to: 'hod' }
] as const;
