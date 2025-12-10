'use client';

import { useState } from 'react';
import { Sparkles, Eye, Heart, Wind, Droplets, Flame, Book, Mountain, Zap, Star } from 'lucide-react';

/**
 * Sistema de Letras del Alma (Otiot HaNefesh)
 * Basado en Sefer Yetzirah, Zohar y las enseñanzas de Ari'zal
 */

interface LetraInfo {
  nombre: string;
  hebreo: string;
  significado: string;
  elemento: string;
  tipo: 'Madre' | 'Simple' | 'Doble';
  descripcion: string;
  meditacion: string;
  cualidad: string;
  color: string;
  chakra: string;
  tarot: string;
  numeroTarot?: number;
  icono: any;
}

// Letras hebreas completas con correspondencias cabalísticas
const LETRAS_SAGRADAS: Record<string, LetraInfo> = {
  'א': {
    nombre: 'Alef',
    hebreo: 'א',
    significado: 'Unidad divina',
    elemento: 'Aire',
    tipo: 'Madre',
    descripcion: 'La letra madre. No tiene sonido propio: es el silencio del principio. Te recuerda que eres uno con la Fuente, incluso cuando olvidas.',
    meditacion: 'Visualizo una luz blanca entrando por mi coronilla. Respiro con suavidad y repito internamente: "Yo soy el soplo de Dios hecho forma."',
    cualidad: 'Unidad • Principio • Silencio',
    color: '#E0E7FF',
    chakra: 'Corona',
    tarot: 'El Loco (0)',
    numeroTarot: 0,
    icono: Wind
  },
  'מ': {
    nombre: 'Mem',
    hebreo: 'מ',
    significado: 'Agua, fluidez emocional',
    elemento: 'Agua',
    tipo: 'Madre',
    descripcion: 'Esta letra representa el mar, el vientre, la memoria emocional. Te enseña a sentir sin ahogarte, a dejar que las aguas internas se muevan.',
    meditacion: 'Imagino un océano azul profundo dentro de mí. "Dejo que mis emociones fluyan, sin reprimir ni retener."',
    cualidad: 'Fluidez • Emoción • Memoria',
    color: '#DBEAFE',
    chakra: 'Sacro',
    tarot: 'El Colgado (12)',
    numeroTarot: 12,
    icono: Droplets
  },
  'ש': {
    nombre: 'Shin',
    hebreo: 'ש',
    significado: 'Fuego transformador',
    elemento: 'Fuego',
    tipo: 'Madre',
    descripcion: 'Shin es el fuego divino, la chispa que purifica. Su llama te invita a transmutar lo viejo, a quemar los velos del ego.',
    meditacion: 'Visualizo una llama violeta en mi corazón. "Ardo en consciencia. Mi fuego no destruye: libera."',
    cualidad: 'Transformación • Purificación • Fuego Divino',
    color: '#FEE2E2',
    chakra: 'Corazón',
    tarot: 'El Juicio (20)',
    numeroTarot: 20,
    icono: Flame
  },
  'ל': {
    nombre: 'Lamed',
    hebreo: 'ל',
    significado: 'Aprendizaje del alma',
    elemento: 'Libra',
    tipo: 'Simple',
    descripcion: 'Es la única letra que se eleva por encima de la línea. Lamed es el látigo y el bastón: te guía con firmeza hacia la verdad.',
    meditacion: 'Veo un bastón de luz en mi mano derecha. "Aprendo con humildad. Cada experiencia es maestra."',
    cualidad: 'Aprendizaje • Enseñanza • Ascensión',
    color: '#FCE7F3',
    chakra: 'Tercer Ojo',
    tarot: 'La Justicia (11)',
    numeroTarot: 11,
    icono: Book
  },
  'ב': {
    nombre: 'Bet',
    hebreo: 'ב',
    significado: 'Casa, bendición',
    elemento: 'Luna',
    tipo: 'Doble',
    descripcion: 'La primera letra de la Torá. Bet construye el hogar interior, el templo del alma. Es la bendición que habita en ti.',
    meditacion: 'Me visualizo dentro de un templo de luz. "Mi cuerpo es casa sagrada. Bendigo mi existencia."',
    cualidad: 'Hogar • Bendición • Estructura',
    color: '#E9D5FF',
    chakra: 'Raíz',
    tarot: 'La Sacerdotisa (2)',
    numeroTarot: 2,
    icono: Mountain
  },
  'ג': {
    nombre: 'Guimel',
    hebreo: 'ג',
    significado: 'Generosidad, dar',
    elemento: 'Marte',
    tipo: 'Doble',
    descripcion: 'Guimel es el camello que cruza el desierto. Te enseña a dar sin esperar, a compartir tu luz.',
    meditacion: 'Imagino que extiendo mis manos llenas de luz. "Doy libremente. Mi abundancia fluye desde la Fuente."',
    cualidad: 'Generosidad • Dar • Abundancia',
    color: '#FECACA',
    chakra: 'Plexo Solar',
    tarot: 'La Emperatriz (3)',
    numeroTarot: 3,
    icono: Sparkles
  },
  'ד': {
    nombre: 'Dalet',
    hebreo: 'ד',
    significado: 'Puerta, humildad',
    elemento: 'Venus',
    tipo: 'Doble',
    descripcion: 'La puerta por donde entra lo nuevo. Dalet te invita a ser humilde para recibir la gracia divina.',
    meditacion: 'Veo una puerta de luz abriéndose ante mí. "Me abro con humildad. Recibo lo que es para mi bien supremo."',
    cualidad: 'Humildad • Puerta • Recepción',
    color: '#FED7AA',
    chakra: 'Corazón',
    tarot: 'El Emperador (4)',
    numeroTarot: 4,
    icono: Star
  },
  'ה': {
    nombre: 'He',
    hebreo: 'ה',
    significado: 'Revelación divina',
    elemento: 'Aries',
    tipo: 'Simple',
    descripcion: 'La ventana del alma. He es el aliento de Dios que te da vida. Revela lo oculto.',
    meditacion: 'Respiro profundamente y siento el aliento divino. "Revelo mi verdad. Soy un canal de luz."',
    cualidad: 'Revelación • Aliento • Vida',
    color: '#FEF3C7',
    chakra: 'Garganta',
    tarot: 'El Hierofante (5)',
    numeroTarot: 5,
    icono: Eye
  },
  'ו': {
    nombre: 'Vav',
    hebreo: 'ו',
    significado: 'Conexión, gancho',
    elemento: 'Tauro',
    tipo: 'Simple',
    descripcion: 'El gancho que une cielo y tierra. Vav es el puente entre lo divino y lo humano en ti.',
    meditacion: 'Me veo como un pilar de luz conectando cielo y tierra. "Soy el puente. Uno lo superior con lo inferior."',
    cualidad: 'Conexión • Unión • Puente',
    color: '#D1FAE5',
    chakra: 'Corazón',
    tarot: 'Los Enamorados (6)',
    numeroTarot: 6,
    icono: Zap
  },
  'ז': {
    nombre: 'Zayin',
    hebreo: 'ז',
    significado: 'Arma espiritual',
    elemento: 'Géminis',
    tipo: 'Simple',
    descripcion: 'La espada de la verdad. Zayin corta las ilusiones y te libera del engaño.',
    meditacion: 'Sostengo una espada de luz que corta mis cadenas. "Corto lo falso. Me libero del ego."',
    cualidad: 'Verdad • Liberación • Espada',
    color: '#E0E7FF',
    chakra: 'Tercer Ojo',
    tarot: 'El Carro (7)',
    numeroTarot: 7,
    icono: Zap
  },
  'ח': {
    nombre: 'Jet',
    hebreo: 'ח',
    significado: 'Cerco protector',
    elemento: 'Cáncer',
    tipo: 'Simple',
    descripcion: 'El muro sagrado. Jet protege tu espacio interior y establece límites sanos.',
    meditacion: 'Me rodeo de un círculo de luz protectora. "Estoy protegido. Mis límites son sagrados."',
    cualidad: 'Protección • Límites • Cerco',
    color: '#FEE2E2',
    chakra: 'Sacro',
    tarot: 'La Fuerza (8)',
    numeroTarot: 8,
    icono: Mountain
  },
  'ט': {
    nombre: 'Tet',
    hebreo: 'ט',
    significado: 'Bien oculto',
    elemento: 'Leo',
    tipo: 'Simple',
    descripcion: 'La serpiente que guarda el tesoro. Tet revela que incluso el dolor esconde una bendición.',
    meditacion: 'Busco el bien oculto en mis experiencias difíciles. "Todo sirve a mi evolución. Confío en el proceso."',
    cualidad: 'Bien oculto • Tesoro • Confianza',
    color: '#FEF3C7',
    chakra: 'Plexo Solar',
    tarot: 'El Ermitaño (9)',
    numeroTarot: 9,
    icono: Star
  },
  'י': {
    nombre: 'Yud',
    hebreo: 'י',
    significado: 'Chispa divina',
    elemento: 'Virgo',
    tipo: 'Simple',
    descripcion: 'La letra más pequeña pero más poderosa. Yud es la semilla de toda la creación.',
    meditacion: 'Veo una chispa dorada en mi corazón. "Soy chispa divina. Mi esencia es infinita."',
    cualidad: 'Chispa • Semilla • Potencial',
    color: '#FED7AA',
    chakra: 'Corona',
    tarot: 'La Rueda de la Fortuna (10)',
    numeroTarot: 10,
    icono: Sparkles
  },
  'כ': {
    nombre: 'Kaf',
    hebreo: 'כ',
    significado: 'Palma de la mano',
    elemento: 'Júpiter',
    tipo: 'Doble',
    descripcion: 'La mano que da y recibe. Kaf te enseña el equilibrio entre acción y receptividad.',
    meditacion: 'Abro mis manos al cielo. "Recibo con gratitud. Doy con amor."',
    cualidad: 'Dar y recibir • Equilibrio • Mano',
    color: '#DBEAFE',
    chakra: 'Corazón',
    tarot: 'La Justicia (11)',
    numeroTarot: 11,
    icono: Heart
  }
};

// Conversión latina → hebrea (aproximada)
const CONVERSION_LATINA_HEBREA: Record<string, string> = {
  'A': 'א', 'E': 'א', 'I': 'י', 'O': 'ע', 'U': 'ו',
  'B': 'ב', 'C': 'כ', 'D': 'ד', 'F': 'פ', 'G': 'ג',
  'H': 'ה', 'J': 'י', 'K': 'כ', 'L': 'ל', 'M': 'מ',
  'N': 'נ', 'P': 'פ', 'Q': 'ק', 'R': 'ר', 'S': 'ס',
  'T': 'ת', 'V': 'ו', 'W': 'ו', 'X': 'צ', 'Y': 'י', 'Z': 'ז'
};

interface LetrasDelAlmaProps {
  nombre: string;
  showInput?: boolean;
}

/**
 * Genera la ruta correcta de la imagen del Tarot
 */
const getTarotImagePath = (numeroTarot: number): string => {
  // Mapeo de números a nombres exactos de archivos
  const tarotFileNames: Record<number, string> = {
    0: 'el-loco',
    1: 'el-mago',
    2: 'la-suma-sacerdotisa',
    3: 'la-emperatriz-luminosa',
    4: 'el-emperador',
    5: 'el-sumo-sacerdote',
    6: 'los-enamorados',
    7: 'el-carro',
    8: 'la-justicia',
    9: 'el-ermitano',
    10: 'la-rueda-de-la-fortuna',
    11: 'la-fuerza',
    12: 'el-colgado',
    13: 'la-muerte',
    14: 'la-templanza',
    15: 'el-diablo',
    16: 'la-torre',
    17: 'la-estrella',
    18: 'la-luna',
    19: 'el-sol',
    20: 'el-juicio-final',
    21: 'el-mundo'
  };

  const fileName = tarotFileNames[numeroTarot];
  return fileName ? `/tarot/${numeroTarot}-${fileName}.png` : '';
};

export default function LetrasDelAlma({ nombre: nombreProp, showInput = false }: LetrasDelAlmaProps) {
  const [nombreLocal, setNombreLocal] = useState('');
  const [letraSeleccionada, setLetraSeleccionada] = useState<LetraInfo | null>(null);
  const [mostrarMeditacion, setMostrarMeditacion] = useState(false);

  const nombreFinal = showInput ? nombreLocal : nombreProp;

  const convertirNombre = (nombreLatino: string) => {
    return nombreLatino.toUpperCase()
      .split('')
      .map(letra => CONVERSION_LATINA_HEBREA[letra] || '')
      .join('');
  };

  const extraerLetrasEspeciales = (nombreHebreo: string) => {
    const letrasEncontradas = new Set<string>();
    
    for (const letra of nombreHebreo) {
      if (LETRAS_SAGRADAS[letra]) {
        letrasEncontradas.add(letra);
      }
    }
    
    return Array.from(letrasEncontradas).map(l => LETRAS_SAGRADAS[l]);
  };

  const nombreHebreo = nombreFinal ? convertirNombre(nombreFinal) : '';
  const letrasDelAlma = nombreHebreo ? extraerLetrasEspeciales(nombreHebreo) : [];

  const IconoLetra = letraSeleccionada?.icono || Sparkles;

  return (
    <div className="bg-gradient-to-br from-indigo-950/30 via-purple-950/30 to-violet-950/30 border border-purple-500/30 rounded-xl p-6">
      {/* Header */}
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

      {/* Input opcional */}
      {showInput && (
        <div className="mb-6">
          <label className="block text-purple-200 mb-2 text-sm font-bold">
            Ingresa tu nombre
          </label>
          <input
            type="text"
            value={nombreLocal}
            onChange={(e) => setNombreLocal(e.target.value.toUpperCase())}
            placeholder="MARIA"
            className="w-full px-4 py-3 bg-purple-950/50 border border-purple-400/30 rounded text-white text-lg font-bold focus:ring-2 focus:ring-purple-400 focus:outline-none"
          />
        </div>
      )}

      {nombreHebreo && (
        <div className="mb-4 p-3 bg-purple-950/30 rounded border border-purple-500/20">
          <p className="text-purple-300 text-xs mb-1">Transcripción hebrea:</p>
          <p className="text-2xl text-purple-100 font-bold text-center tracking-widest">
            {nombreHebreo}
          </p>
        </div>
      )}

      {/* Letras del Alma encontradas */}
      {letrasDelAlma.length > 0 ? (
        <div className="space-y-4">
          <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/20">
            <h3 className="text-lg font-bold text-purple-200 mb-3 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Tus Letras Sagradas ({letrasDelAlma.length})
            </h3>
            
            <p className="text-purple-300 text-sm mb-4">
              {letrasDelAlma.length === 1 && 'Se ha identificado 1 letra sagrada en tu nombre.'}
              {letrasDelAlma.length > 1 && `Se han identificado ${letrasDelAlma.length} letras sagradas en tu nombre.`}
              {' '}Estas son las energías primordiales que conforman tu esencia.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {letrasDelAlma.map((letra, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setLetraSeleccionada(letra);
                    setMostrarMeditacion(false);
                  }}
                  className="cursor-pointer group"
                >
                  <div 
                    className="p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105"
                    style={{ 
                      backgroundColor: letra.color + '20',
                      borderColor: letra.color + '60'
                    }}
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
                      <letra.icono className="w-5 h-5 text-purple-300" />
                    </div>
                    
                    <p className="text-purple-200 text-xs mb-1">{letra.significado}</p>
                    <p className="text-purple-300 text-xs">{letra.cualidad}</p>
                    
                    <div className="mt-2 text-xs text-purple-400">
                      Haz clic para ver más →
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panel de meditación */}
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
                  <h3 className="text-2xl font-bold text-purple-100">
                    {letraSeleccionada.nombre}
                  </h3>
                  <p className="text-purple-300 text-sm">{letraSeleccionada.significado}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-purple-950/30 rounded-lg p-3">
                  <p className="text-purple-200 text-sm leading-relaxed">
                    {letraSeleccionada.descripcion}
                  </p>
                </div>

                {/* Imagen del Tarot si existe */}
                {letraSeleccionada.numeroTarot !== undefined && (
                  <div className="bg-purple-950/30 rounded-lg p-3 mb-3">
                    <p className="text-xs text-purple-400 mb-2">Carta del Tarot</p>
                    <div className="flex items-center gap-3">
                      <img
                        src={getTarotImagePath(letraSeleccionada.numeroTarot)}
                        alt={letraSeleccionada.tarot}
                        className="w-20 h-auto rounded border-2 border-purple-400/30"
                        onError={(e) => {
                          // Ocultar imagen si no existe
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div>
                        <p className="text-purple-100 font-bold">{letraSeleccionada.tarot}</p>
                        <p className="text-xs text-purple-300">Arcano Mayor {letraSeleccionada.numeroTarot}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-purple-950/30 rounded-lg p-2">
                    <p className="text-xs text-purple-400 mb-1">Elemento</p>
                    <p className="text-purple-100 text-sm font-bold">{letraSeleccionada.elemento}</p>
                  </div>
                  <div className="bg-purple-950/30 rounded-lg p-2">
                    <p className="text-xs text-purple-400 mb-1">Chakra</p>
                    <p className="text-purple-100 text-sm font-bold">{letraSeleccionada.chakra}</p>
                  </div>
                  <div className="bg-purple-950/30 rounded-lg p-2">
                    <p className="text-xs text-purple-400 mb-1">Tipo</p>
                    <p className="text-purple-100 text-sm font-bold">{letraSeleccionada.tipo}</p>
                  </div>
                  <div className="bg-purple-950/30 rounded-lg p-2">
                    <p className="text-xs text-purple-400 mb-1">Tarot</p>
                    <p className="text-purple-100 text-sm font-bold">{letraSeleccionada.tarot}</p>
                  </div>
                </div>

                <button
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
          <IconoLetra className="w-12 h-12 text-purple-400 mx-auto mb-3" />
          <p className="text-purple-300 text-sm">
            {showInput ? 'Ingresa tu nombre para descubrir' : 'No se encontraron letras sagradas'}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 text-center text-purple-400 text-xs">
        <p className="mb-1">Basado en Sefer Yetzirah, Zohar y las enseñanzas de Ari'zal</p>
        <p className="text-purple-500 italic">
          "Las letras son los ladrillos con los que Dios construyó el universo"
        </p>
      </div>
    </div>
  );
}
