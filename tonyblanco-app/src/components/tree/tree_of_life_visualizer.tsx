import React, { useState, useEffect, KeyboardEvent } from 'react';
import { Circle, Moon, Sun, Star, Zap } from 'lucide-react';

// Datos de las Sefiroth con sus posiciones en el diagrama
type SephiraData = { x: number; y: number; color: string; label: string; number: number; hidden?: boolean };
const SEPHIROT_DATA: Record<string, SephiraData> = {
  keter: { x: 250, y: 50, color: '#ffffff', label: 'Keter\nCorona', number: 1 },
  chochmah: { x: 150, y: 120, color: '#87CEEB', label: 'Chochmah\nSabiduría', number: 2 },
  binah: { x: 350, y: 120, color: '#8B008B', label: 'Binah\nComprensión', number: 3 },
  chesed: { x: 150, y: 220, color: '#4169E1', label: 'Chesed\nMisericordia', number: 4 },
  gevurah: { x: 350, y: 220, color: '#DC143C', label: 'Gevurah\nSeveridad', number: 5 },
  tiferet: { x: 250, y: 280, color: '#FFD700', label: 'Tiferet\nBelleza', number: 6 },
  netzach: { x: 150, y: 380, color: '#50C878', label: 'Netzach\nVictoria', number: 7 },
  hod: { x: 350, y: 380, color: '#FF8C00', label: 'Hod\nEsplendor', number: 8 },
  yesod: { x: 250, y: 480, color: '#9370DB', label: 'Yesod\nFundamento', number: 9 },
  malchut: { x: 250, y: 580, color: '#DAA520', label: 'Malchut\nReino', number: 10 },
  daat: { x: 250, y: 180, color: '#E6E6FA', label: 'Da\'at\n(Oculto)', number: 11, hidden: true }
};

// Senderos que conectan las Sefiroth
const PATHS = [
  { from: 'keter', to: 'chochmah', number: 11 },
  { from: 'keter', to: 'binah', number: 12 },
  { from: 'keter', to: 'tiferet', number: 13 },
  { from: 'chochmah', to: 'binah', number: 14 },
  { from: 'chochmah', to: 'chesed', number: 16 },
  { from: 'chochmah', to: 'tiferet', number: 15 },
  { from: 'binah', to: 'gevurah', number: 18 },
  { from: 'binah', to: 'tiferet', number: 17 },
  { from: 'chesed', to: 'gevurah', number: 19 },
  { from: 'chesed', to: 'tiferet', number: 20 },
  { from: 'chesed', to: 'netzach', number: 21 },
  { from: 'gevurah', to: 'tiferet', number: 22 },
  { from: 'gevurah', to: 'hod', number: 23 },
  { from: 'tiferet', to: 'netzach', number: 24 },
  { from: 'tiferet', to: 'hod', number: 26 },
  { from: 'tiferet', to: 'yesod', number: 25 },
  { from: 'netzach', to: 'hod', number: 27 },
  { from: 'netzach', to: 'yesod', number: 28 },
  { from: 'netzach', to: 'malchut', number: 29 },
  { from: 'hod', to: 'yesod', number: 30 },
  { from: 'hod', to: 'malchut', number: 31 },
  { from: 'yesod', to: 'malchut', number: 32 }
];

type UserNumbers = {
  esencia: string;
  expresion: string;
  herencia: string;
  destino: string;
  caminoVida: string;
};

const TreeOfLife: React.FC<{ initial?: Partial<UserNumbers> }> = ({ initial = {} }) => {
  const [selectedSephirah, setSelectedSephirah] = useState<string | null>(null);
  const [userNumbers, setUserNumbers] = useState<UserNumbers>({
    esencia: initial?.esencia || '',
    expresion: initial?.expresion || '',
    herencia: initial?.herencia || '',
    destino: initial?.destino || '',
    caminoVida: initial?.caminoVida || ''
  });
  const [highlightedNumbers, setHighlightedNumbers] = useState(new Set());
  const [showDaat, setShowDaat] = useState(false);

  useEffect(() => {
    setUserNumbers({
        esencia: initial?.esencia || '',
        expresion: initial?.expresion || '',
        herencia: initial?.herencia || '',
        destino: initial?.destino || '',
        caminoVida: initial?.caminoVida || ''
    });
  }, [initial]);

  // Calcular qué números están presentes en el perfil
  useEffect(() => {
    const numbers = new Set();
    Object.values(userNumbers).forEach(val => {
      const num = parseInt(val);
      if (num >= 1 && num <= 22) {
        numbers.add(num);
      }
    });
    setHighlightedNumbers(numbers);
  }, [userNumbers]);

  const handleInputChange = (field: keyof UserNumbers, value: string) => {
    setUserNumbers(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getSephirahInfo = (id: string) => {
    const info: Record<string, { arcangel: string; planeta: string; chakra: string }> = {
      keter: { arcangel: 'Metatron', planeta: 'Primum Mobile', chakra: 'Corona' },
      chochmah: { arcangel: 'Raziel', planeta: 'Zodíaco', chakra: 'Tercer Ojo' },
      binah: { arcangel: 'Tzaphkiel', planeta: 'Saturno', chakra: 'Tercer Ojo' },
      chesed: { arcangel: 'Tzadkiel', planeta: 'Júpiter', chakra: 'Garganta' },
      gevurah: { arcangel: 'Khamael', planeta: 'Marte', chakra: 'Garganta' },
      tiferet: { arcangel: 'Raphael', planeta: 'Sol', chakra: 'Corazón' },
      netzach: { arcangel: 'Haniel', planeta: 'Venus', chakra: 'Plexo Solar' },
      hod: { arcangel: 'Michael', planeta: 'Mercurio', chakra: 'Plexo Solar' },
      yesod: { arcangel: 'Gabriel', planeta: 'Luna', chakra: 'Sacro' },
      malchut: { arcangel: 'Sandalphon', planeta: 'Tierra', chakra: 'Raíz' },
      daat: { arcangel: 'N/A', planeta: 'N/A', chakra: 'Garganta' }
    };
    return info[id] || {};
  };

  const isHighlighted = (number: number | undefined) => Boolean(number && highlightedNumbers.has(number));

  const handleKeySelect = (ev: KeyboardEvent, id: string) => {
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      setSelectedSephirah(id);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-950 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-yellow-300 mb-2 flex items-center justify-center gap-2">
            <Star className="w-8 h-8" />
            Árbol de la Vida Cabalístico
            <Star className="w-8 h-8" />
          </h1>
          <p className="text-purple-200">Visualizador Interactivo - Sistema Dshevastan®</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel de entrada de datos */}
          <div className="bg-purple-900/40 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30">
            <h2 className="text-xl font-bold text-yellow-300 mb-4">📊 Tu Perfil Numerológico</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-purple-200 mb-1 text-sm">Esencia (Alma) 1-9</label>
                <input
                  type="number"
                  min="1"
                  max="9"
                  value={userNumbers.esencia}
                  onChange={(e) => handleInputChange('esencia', e.target.value)}
                  className="w-full px-3 py-2 bg-purple-950/50 border border-purple-400/30 rounded text-white focus:ring-2 focus:ring-yellow-400"
                  placeholder="Ej: 7"
                />
              </div>

              <div>
                <label className="block text-purple-200 mb-1 text-sm">Expresión 1-22</label>
                <input
                  type="number"
                  min="1"
                  max="22"
                  value={userNumbers.expresion}
                  onChange={(e) => handleInputChange('expresion', e.target.value)}
                  className="w-full px-3 py-2 bg-purple-950/50 border border-purple-400/30 rounded text-white focus:ring-2 focus:ring-yellow-400"
                  placeholder="Ej: 16"
                />
              </div>

              <div>
                <label className="block text-purple-200 mb-1 text-sm">Herencia 1-22</label>
                <input
                  type="number"
                  min="1"
                  max="22"
                  value={userNumbers.herencia}
                  onChange={(e) => handleInputChange('herencia', e.target.value)}
                  className="w-full px-3 py-2 bg-purple-950/50 border border-purple-400/30 rounded text-white focus:ring-2 focus:ring-yellow-400"
                  placeholder="Ej: 14"
                />
              </div>

              <div>
                <label className="block text-purple-200 mb-1 text-sm">Destino 1-22</label>
                <input
                  type="number"
                  min="1"
                  max="22"
                  value={userNumbers.destino}
                  onChange={(e) => handleInputChange('destino', e.target.value)}
                  className="w-full px-3 py-2 bg-purple-950/50 border border-purple-400/30 rounded text-white focus:ring-2 focus:ring-yellow-400"
                  placeholder="Ej: 9"
                />
              </div>

              <div>
                <label className="block text-purple-200 mb-1 text-sm">Camino de Vida (edad)</label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={userNumbers.caminoVida}
                  onChange={(e) => handleInputChange('caminoVida', e.target.value)}
                  className="w-full px-3 py-2 bg-purple-950/50 border border-purple-400/30 rounded text-white focus:ring-2 focus:ring-yellow-400"
                  placeholder="Ej: 38"
                />
              </div>

              <div className="pt-4">
                <label className="flex items-center gap-2 text-purple-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showDaat}
                    onChange={(e) => setShowDaat(e.target.checked)}
                    className="w-4 h-4"
                  />
                  Mostrar Da'at (Sefirá Oculta)
                </label>
              </div>
            </div>

            <div className="mt-6 p-4 bg-purple-950/50 rounded border border-yellow-400/30">
              <p className="text-yellow-300 text-sm mb-2">💡 Leyenda:</p>
              <ul className="text-purple-200 text-xs space-y-1">
                <li>• Números 1-10: Sefiroth (Esferas)</li>
                <li>• Números 11-22: Senderos</li>
                <li>• Los resaltados aparecen en tu perfil</li>
              </ul>
            </div>
          </div>

          {/* Diagrama del Árbol de la Vida */}
          <div className="bg-purple-900/40 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30">
            <h2 className="text-xl font-bold text-yellow-300 mb-4 text-center">🌳 El Árbol</h2>
            
            <svg viewBox="0 0 500 650" className="w-full">
              {/* Senderos (líneas) */}
              {PATHS.map((path, idx) => {
                const from = SEPHIROT_DATA[path.from];
                const to = SEPHIROT_DATA[path.to];
                const highlighted = isHighlighted(path.number);
                
                return (
                  <g key={idx}>
                    <line
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      stroke={highlighted ? '#fbbf24' : '#8b5cf6'}
                      strokeWidth={highlighted ? '3' : '1'}
                      opacity={highlighted ? '0.9' : '0.3'}
                    />
                    {/* Número del sendero */}
                    <text
                      x={(from.x + to.x) / 2}
                      y={(from.y + to.y) / 2}
                      fill={highlighted ? '#fbbf24' : '#c084fc'}
                      fontSize="10"
                      textAnchor="middle"
                      className="select-none"
                    >
                      {path.number}
                    </text>
                  </g>
                );
              })}

              {/* Sefiroth (círculos) */}
              {Object.entries(SEPHIROT_DATA).map(([id, data]) => {
                if (id === 'daat' && !showDaat) return null;
                
                const highlighted = isHighlighted(data.number);
                const isSelected = selectedSephirah === id;
                
                return (
                  <g
                    key={id}
                    onClick={() => setSelectedSephirah(id)}
                    onKeyDown={(e) => handleKeySelect(e, id)}
                    tabIndex={0}
                    role="button"
                    aria-label={`${data.label} - número ${data.number}`}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={data.x}
                      cy={data.y}
                      r={isSelected ? '42' : '38'}
                      fill={data.color}
                      stroke={highlighted ? '#fbbf24' : '#8b5cf6'}
                      strokeWidth={highlighted ? '4' : '2'}
                      opacity={id === 'daat' ? '0.7' : '0.9'}
                      className="transition-all duration-200"
                    />
                    <text
                      x={data.x}
                      y={data.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#000"
                      fontSize="11"
                      fontWeight="bold"
                      className="select-none pointer-events-none"
                    >
                      {data.label.split('\n').map((line, i) => (
                        <tspan key={i} x={data.x} dy={i === 0 ? -6 : 12}>
                          {line}
                        </tspan>
                      ))}
                    </text>
                    <text
                      x={data.x}
                      y={data.y + 20}
                      textAnchor="middle"
                      fill="#000"
                      fontSize="14"
                      fontWeight="bold"
                      className="select-none pointer-events-none"
                    >
                      {data.number}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Panel de información */}
          <div className="bg-purple-900/40 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30">
            <h2 className="text-xl font-bold text-yellow-300 mb-4">ℹ️ Información</h2>
            
            {selectedSephirah ? (
              <div className="space-y-4">
                <div className="bg-purple-950/50 p-4 rounded border border-purple-400/30">
                  <h3 className="text-yellow-300 font-bold mb-2">
                    {SEPHIROT_DATA[selectedSephirah].label.replace('\n', ' - ')}
                  </h3>
                  <p className="text-purple-200 text-sm mb-3">
                    Número: {SEPHIROT_DATA[selectedSephirah].number}
                  </p>
                  
                  {(() => {
                    const info = getSephirahInfo(selectedSephirah);
                    return (
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-400" />
                          <span className="text-purple-200">Arcángel: {info.arcangel}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Sun className="w-4 h-4 text-yellow-400" />
                          <span className="text-purple-200">Planeta: {info.planeta}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Circle className="w-4 h-4 text-yellow-400" />
                          <span className="text-purple-200">Chakra: {info.chakra}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Verificar si este número aparece en el perfil */}
                {isHighlighted(SEPHIROT_DATA[selectedSephirah].number) && (
                  <div className="bg-yellow-400/10 border border-yellow-400/30 rounded p-3">
                    <p className="text-yellow-300 text-sm font-bold">
                      ⭐ Este número aparece en tu perfil numerológico
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-purple-300 text-sm space-y-3">
                <p>Haz clic en cualquier Sefirá para ver su información detallada.</p>
                
                <div className="bg-purple-950/50 p-4 rounded">
                  <p className="font-bold text-yellow-300 mb-2">Las 10 Sefiroth:</p>
                  <ul className="space-y-1 text-xs">
                    <li>1. Keter - Corona (Unidad Divina)</li>
                    <li>2. Chochmah - Sabiduría</li>
                    <li>3. Binah - Comprensión</li>
                    <li>4. Chesed - Misericordia</li>
                    <li>5. Gevurah - Severidad</li>
                    <li>6. Tiferet - Belleza/Armonía</li>
                    <li>7. Netzach - Victoria</li>
                    <li>8. Hod - Esplendor</li>
                    <li>9. Yesod - Fundamento</li>
                    <li>10. Malchut - Reino</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Análisis del perfil */}
            {Object.values(userNumbers).some(v => v) && (
              <div className="mt-4 bg-purple-950/50 p-4 rounded border border-yellow-400/30">
                <h3 className="text-yellow-300 font-bold mb-2">🔮 Tu Mapa Cabalístico</h3>
                <div className="text-purple-200 text-xs space-y-1">
                  {userNumbers.esencia && (
                    <p>• Esencia: Sefirá {userNumbers.esencia}</p>
                  )}
                  {userNumbers.expresion && (
                    <p>• Expresión: {parseInt(userNumbers.expresion) <= 10 ? 'Sefirá' : 'Sendero'} {userNumbers.expresion}</p>
                  )}
                  {userNumbers.destino && (
                    <p>• Destino: {parseInt(userNumbers.destino) <= 10 ? 'Sefirá' : 'Sendero'} {userNumbers.destino}</p>
                  )}
                  {userNumbers.caminoVida && (
                    <p>• Transformación a los {userNumbers.caminoVida} años</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-purple-300 text-sm">
          <p>Sistema Dshevastan® + Tradición Hermética Occidental</p>
        </div>
      </div>
    </div>
  );
};

export default TreeOfLife;