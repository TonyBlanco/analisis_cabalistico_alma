'use client';

import { useState } from 'react';
import { Sparkles, Eye, Heart, Wind, Droplets, Flame, Book, Mountain, Zap, Star } from 'lucide-react';
import { extractLetrasDelAlma, type LetraInfo } from '@/lib/letras-sagradas';

const LETRA_ICONS: Record<string, React.ElementType<{ className?: string }>> = {
  'א': Wind, 'מ': Droplets, 'ש': Flame, 'ב': Mountain, 'ג': Sparkles,
  'ד': Star, 'ה': Eye, 'ו': Zap, 'ז': Zap, 'ח': Mountain, 'ט': Star,
  'י': Sparkles, 'כ': Heart, 'ל': Book, 'נ': Droplets, 'ס': Mountain,
  'ע': Eye, 'פ': Zap, 'צ': Star, 'ק': Sparkles, 'ר': Flame, 'ת': Heart
};

interface LetrasDelAlmaProps {
  nombre: string;
  showInput?: boolean;
}

const getTarotImagePath = (numeroTarot: number): string => {
  const fileNames: Record<number, string> = {
    0: 'el-loco', 2: 'la-suma-sacerdotisa', 3: 'la-emperatriz-luminosa',
    4: 'el-emperador', 5: 'el-sumo-sacerdote', 6: 'los-enamorados',
    7: 'el-carro', 8: 'la-justicia', 9: 'el-ermitano',
    10: 'la-rueda-de-la-fortuna', 11: 'la-fuerza', 12: 'el-colgado',
    13: 'la-muerte', 14: 'la-templanza', 15: 'el-diablo', 16: 'la-torre',
    17: 'la-estrella', 18: 'la-luna', 19: 'el-sol', 20: 'el-juicio-final',
    21: 'el-mundo'
  };
  const name = fileNames[numeroTarot];
  return name ? `/tarot/${numeroTarot}-${name}.png` : '';
};

export default function LetrasDelAlma({ nombre: nombreProp, showInput = false }: LetrasDelAlmaProps) {
  const [nombreLocal, setNombreLocal] = useState('');
  const [letraSeleccionada, setLetraSeleccionada] = useState<LetraInfo | null>(null);
  const [mostrarMeditacion, setMostrarMeditacion] = useState(false);

  const nombreFinal = showInput ? nombreLocal : nombreProp;
  const letrasDelAlma = nombreFinal ? extractLetrasDelAlma(nombreFinal) : [];

  const IconoSeleccionado = letraSeleccionada
    ? (LETRA_ICONS[letraSeleccionada.hebreo] ?? Sparkles)
    : Sparkles;

  return (
    <div className="bg-gradient-to-br from-indigo-950/30 via-purple-950/30 to-violet-950/30 border border-purple-500/30 rounded-xl p-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Sparkles className="w-6 h-6 text-yellow-300" />
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300">
            Letras del Alma
          </h2>
          <Sparkles className="w-6 h-6 text-yellow-300" />
        </div>
        <p className="text-purple-200 text-xs">Otiot HaNefesh • Las Letras Sagradas de tu Ser</p>
      </div>

      {showInput && (
        <div className="mb-6">
          <label className="block text-purple-200 mb-2 text-sm font-bold">
            Ingresa tu nombre completo
          </label>
          <input
            type="text"
            value={nombreLocal}
            onChange={(e) => setNombreLocal(e.target.value.toUpperCase())}
            placeholder="NOMBRE APELLIDO"
            className="w-full px-4 py-3 bg-purple-950/50 border border-purple-400/30 rounded text-white text-lg font-bold focus:ring-2 focus:ring-purple-400 focus:outline-none"
          />
        </div>
      )}

      {letrasDelAlma.length > 0 ? (
        <div className="space-y-4">
          <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/20">
            <h3 className="text-lg font-bold text-purple-200 mb-3 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Tus Letras Sagradas ({letrasDelAlma.length})
            </h3>
            <p className="text-purple-300 text-sm mb-4">
              {letrasDelAlma.length === 1
                ? 'Se ha identificado 1 letra sagrada en tu nombre.'
                : `Se han identificado ${letrasDelAlma.length} letras sagradas en tu nombre.`}{' '}
              Estas son las energías primordiales que conforman tu esencia.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {letrasDelAlma.map((letra, idx) => {
                const Icono = LETRA_ICONS[letra.hebreo] ?? Sparkles;
                return (
                  <div
                    key={idx}
                    onClick={() => { setLetraSeleccionada(letra); setMostrarMeditacion(false); }}
                    className="cursor-pointer group"
                  >
                    <div
                      className="p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105"
                      style={{ backgroundColor: letra.color + '20', borderColor: letra.color + '60' }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold"
                            style={{ backgroundColor: letra.color }}
                          >
                            {letra.hebreo}
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-purple-100">{letra.nombre}</h4>
                            <p className="text-xs text-purple-300">{letra.elemento}</p>
                          </div>
                        </div>
                        <Icono className="w-5 h-5 text-purple-300" />
                      </div>
                      <p className="text-purple-200 text-xs mb-1">{letra.significado}</p>
                      <p className="text-purple-300 text-xs">{letra.cualidad}</p>
                      <div className="mt-2 text-xs text-purple-400">Haz clic para ver más →</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {letraSeleccionada && (
            <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 rounded-lg p-6 border border-purple-400/30">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold shadow-lg"
                  style={{ backgroundColor: letraSeleccionada.color }}
                >
                  {letraSeleccionada.hebreo}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-purple-100">{letraSeleccionada.nombre}</h3>
                  <p className="text-purple-300 text-sm">{letraSeleccionada.significado}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-purple-950/30 rounded-lg p-3">
                  <p className="text-purple-200 text-sm leading-relaxed">{letraSeleccionada.descripcion}</p>
                </div>

                {letraSeleccionada.numeroTarot !== undefined && (
                  <div className="bg-purple-950/30 rounded-lg p-3">
                    <p className="text-xs text-purple-400 mb-2">Carta del Tarot</p>
                    <div className="flex items-center gap-3">
                      <img
                        src={getTarotImagePath(letraSeleccionada.numeroTarot)}
                        alt={letraSeleccionada.tarot}
                        className="w-20 h-auto rounded border-2 border-purple-400/30"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      <div>
                        <p className="text-purple-100 font-bold">{letraSeleccionada.tarot}</p>
                        <p className="text-xs text-purple-300">Arcano Mayor {letraSeleccionada.numeroTarot}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['Elemento', letraSeleccionada.elemento],
                    ['Chakra', letraSeleccionada.chakra],
                    ['Tipo', letraSeleccionada.tipo],
                    ['Tarot', letraSeleccionada.tarot]
                  ].map(([label, value]) => (
                    <div key={label} className="bg-purple-950/30 rounded-lg p-2">
                      <p className="text-xs text-purple-400 mb-1">{label}</p>
                      <p className="text-purple-100 text-sm font-bold">{value}</p>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setMostrarMeditacion(!mostrarMeditacion)}
                  className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-lg text-white text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Heart className="w-4 h-4" />
                  {mostrarMeditacion ? 'Ocultar' : 'Ver'} Meditación Guiada
                </button>

                {mostrarMeditacion && (
                  <div className="bg-gradient-to-br from-indigo-950/50 to-purple-950/50 rounded-lg p-4 border border-purple-400/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-yellow-300" />
                      <h4 className="text-sm font-bold text-purple-200">Práctica de Meditación</h4>
                    </div>
                    <p className="text-purple-100 italic text-sm leading-relaxed bg-purple-950/30 p-3 rounded mb-3">
                      🕯️ {letraSeleccionada.meditacion}
                    </p>
                    <div className="bg-purple-950/30 rounded p-3">
                      <p className="text-xs text-purple-300 mb-2 font-bold">Sugerencias:</p>
                      <ul className="text-xs text-purple-200 space-y-1">
                        <li>• Encuentra un lugar tranquilo</li>
                        <li>• Respira profundamente 3 veces</li>
                        <li>• Visualiza la letra {letraSeleccionada.hebreo} en luz dorada</li>
                        <li>• Permanece en silencio 5-10 minutos</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-purple-900/20 rounded-lg p-8 border border-purple-500/20 text-center">
          <IconoSeleccionado className="w-12 h-12 text-purple-400 mx-auto mb-3" />
          <p className="text-purple-300 text-sm">
            {showInput
              ? 'Ingresa tu nombre completo para descubrir tus letras sagradas'
              : 'No se encontraron letras sagradas'}
          </p>
        </div>
      )}

      <div className="mt-4 text-center text-purple-400 text-xs">
        <p className="mb-1">Basado en Sefer Yetzirah, Zohar y las enseñanzas de Ari'zal</p>
        <p className="text-purple-500 italic">
          "Las letras son los ladrillos con los que Dios construyó el universo"
        </p>
      </div>
    </div>
  );
}
