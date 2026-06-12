import { tokenizeAtlantis } from './shekinah-engine';

export interface LetraInfo {
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
}

export const LETRAS_SAGRADAS: Record<string, LetraInfo> = {
  'א': {
    nombre: 'Alef', hebreo: 'א', significado: 'Unidad divina', elemento: 'Aire',
    tipo: 'Madre',
    descripcion: 'La letra madre. No tiene sonido propio: es el silencio del principio. Te recuerda que eres uno con la Fuente, incluso cuando olvidas.',
    meditacion: 'Visualizo una luz blanca entrando por mi coronilla. Respiro con suavidad y repito internamente: "Yo soy el soplo de Dios hecho forma."',
    cualidad: 'Unidad • Principio • Silencio', color: '#E0E7FF', chakra: 'Corona',
    tarot: 'El Loco (0)', numeroTarot: 0
  },
  'מ': {
    nombre: 'Mem', hebreo: 'מ', significado: 'Agua, fluidez emocional', elemento: 'Agua',
    tipo: 'Madre',
    descripcion: 'Esta letra representa el mar, el vientre, la memoria emocional. Te enseña a sentir sin ahogarte, a dejar que las aguas internas se muevan.',
    meditacion: 'Imagino un océano azul profundo dentro de mí. "Dejo que mis emociones fluyan, sin reprimir ni retener."',
    cualidad: 'Fluidez • Emoción • Memoria', color: '#DBEAFE', chakra: 'Sacro',
    tarot: 'El Colgado (12)', numeroTarot: 12
  },
  'ש': {
    nombre: 'Shin', hebreo: 'ש', significado: 'Fuego transformador', elemento: 'Fuego',
    tipo: 'Madre',
    descripcion: 'Shin es el fuego divino, la chispa que purifica. Su llama te invita a transmutar lo viejo, a quemar los velos del ego.',
    meditacion: 'Visualizo una llama violeta en mi corazón. "Ardo en consciencia. Mi fuego no destruye: libera."',
    cualidad: 'Transformación • Purificación • Fuego Divino', color: '#FEE2E2', chakra: 'Corazón',
    tarot: 'El Juicio (20)', numeroTarot: 20
  },
  'ב': {
    nombre: 'Bet', hebreo: 'ב', significado: 'Casa, bendición', elemento: 'Luna',
    tipo: 'Doble',
    descripcion: 'La primera letra de la Torá. Bet construye el hogar interior, el templo del alma. Es la bendición que habita en ti.',
    meditacion: 'Me visualizo dentro de un templo de luz. "Mi cuerpo es casa sagrada. Bendigo mi existencia."',
    cualidad: 'Hogar • Bendición • Estructura', color: '#E9D5FF', chakra: 'Raíz',
    tarot: 'La Sacerdotisa (2)', numeroTarot: 2
  },
  'ג': {
    nombre: 'Guimel', hebreo: 'ג', significado: 'Generosidad, dar', elemento: 'Marte',
    tipo: 'Doble',
    descripcion: 'Guimel es el camello que cruza el desierto. Te enseña a dar sin esperar, a compartir tu luz.',
    meditacion: 'Imagino que extiendo mis manos llenas de luz. "Doy libremente. Mi abundancia fluye desde la Fuente."',
    cualidad: 'Generosidad • Dar • Abundancia', color: '#FECACA', chakra: 'Plexo Solar',
    tarot: 'La Emperatriz (3)', numeroTarot: 3
  },
  'ד': {
    nombre: 'Dalet', hebreo: 'ד', significado: 'Puerta, humildad', elemento: 'Venus',
    tipo: 'Doble',
    descripcion: 'La puerta por donde entra lo nuevo. Dalet te invita a ser humilde para recibir la gracia divina.',
    meditacion: 'Veo una puerta de luz abriéndose ante mí. "Me abro con humildad. Recibo lo que es para mi bien supremo."',
    cualidad: 'Humildad • Puerta • Recepción', color: '#FED7AA', chakra: 'Corazón',
    tarot: 'El Emperador (4)', numeroTarot: 4
  },
  'ה': {
    nombre: 'He', hebreo: 'ה', significado: 'Revelación divina', elemento: 'Aries',
    tipo: 'Simple',
    descripcion: 'La ventana del alma. He es el aliento de Dios que te da vida. Revela lo oculto.',
    meditacion: 'Respiro profundamente y siento el aliento divino. "Revelo mi verdad. Soy un canal de luz."',
    cualidad: 'Revelación • Aliento • Vida', color: '#FEF3C7', chakra: 'Garganta',
    tarot: 'El Hierofante (5)', numeroTarot: 5
  },
  'ו': {
    nombre: 'Vav', hebreo: 'ו', significado: 'Conexión, gancho', elemento: 'Tauro',
    tipo: 'Simple',
    descripcion: 'El gancho que une cielo y tierra. Vav es el puente entre lo divino y lo humano en ti.',
    meditacion: 'Me veo como un pilar de luz conectando cielo y tierra. "Soy el puente. Uno lo superior con lo inferior."',
    cualidad: 'Conexión • Unión • Puente', color: '#D1FAE5', chakra: 'Corazón',
    tarot: 'Los Enamorados (6)', numeroTarot: 6
  },
  'ז': {
    nombre: 'Zayin', hebreo: 'ז', significado: 'Arma espiritual', elemento: 'Géminis',
    tipo: 'Simple',
    descripcion: 'La espada de la verdad. Zayin corta las ilusiones y te libera del engaño.',
    meditacion: 'Sostengo una espada de luz que corta mis cadenas. "Corto lo falso. Me libero del ego."',
    cualidad: 'Verdad • Liberación • Espada', color: '#E0E7FF', chakra: 'Tercer Ojo',
    tarot: 'El Carro (7)', numeroTarot: 7
  },
  'ח': {
    nombre: 'Jet', hebreo: 'ח', significado: 'Cerco protector', elemento: 'Cáncer',
    tipo: 'Simple',
    descripcion: 'El muro sagrado. Jet protege tu espacio interior y establece límites sanos.',
    meditacion: 'Me rodeo de un círculo de luz protectora. "Estoy protegido. Mis límites son sagrados."',
    cualidad: 'Protección • Límites • Cerco', color: '#FEE2E2', chakra: 'Sacro',
    tarot: 'La Fuerza (8)', numeroTarot: 8
  },
  'ט': {
    nombre: 'Tet', hebreo: 'ט', significado: 'Bien oculto', elemento: 'Leo',
    tipo: 'Simple',
    descripcion: 'La serpiente que guarda el tesoro. Tet revela que incluso el dolor esconde una bendición.',
    meditacion: 'Busco el bien oculto en mis experiencias difíciles. "Todo sirve a mi evolución. Confío en el proceso."',
    cualidad: 'Bien oculto • Tesoro • Confianza', color: '#FEF3C7', chakra: 'Plexo Solar',
    tarot: 'El Ermitaño (9)', numeroTarot: 9
  },
  'י': {
    nombre: 'Yud', hebreo: 'י', significado: 'Chispa divina', elemento: 'Virgo',
    tipo: 'Simple',
    descripcion: 'La letra más pequeña pero más poderosa. Yud es la semilla de toda la creación.',
    meditacion: 'Veo una chispa dorada en mi corazón. "Soy chispa divina. Mi esencia es infinita."',
    cualidad: 'Chispa • Semilla • Potencial', color: '#FED7AA', chakra: 'Corona',
    tarot: 'La Rueda de la Fortuna (10)', numeroTarot: 10
  },
  'כ': {
    nombre: 'Kaf', hebreo: 'כ', significado: 'Palma de la mano', elemento: 'Júpiter',
    tipo: 'Doble',
    descripcion: 'La mano que da y recibe. Kaf te enseña el equilibrio entre acción y receptividad.',
    meditacion: 'Abro mis manos al cielo. "Recibo con gratitud. Doy con amor."',
    cualidad: 'Dar y recibir • Equilibrio • Mano', color: '#DBEAFE', chakra: 'Corazón',
    tarot: 'La Justicia (11)', numeroTarot: 11
  },
  'ל': {
    nombre: 'Lamed', hebreo: 'ל', significado: 'Aprendizaje del alma', elemento: 'Libra',
    tipo: 'Simple',
    descripcion: 'Es la única letra que se eleva por encima de la línea. Lamed es el látigo y el bastón: te guía con firmeza hacia la verdad.',
    meditacion: 'Veo un bastón de luz en mi mano derecha. "Aprendo con humildad. Cada experiencia es maestra."',
    cualidad: 'Aprendizaje • Enseñanza • Ascensión', color: '#FCE7F3', chakra: 'Tercer Ojo',
    tarot: 'La Justicia (11)', numeroTarot: 11
  },
  'נ': {
    nombre: 'Nun', hebreo: 'נ', significado: 'Pez, continuidad del alma', elemento: 'Escorpio',
    tipo: 'Simple',
    descripcion: 'Nun es el pez que nada en las aguas del inconsciente. Representa la continuidad del alma a través de las transformaciones y la muerte del ego.',
    meditacion: 'Me veo como un pez que fluye libre en aguas profundas. "Mi alma trasciende la muerte. Soy eterno en esencia."',
    cualidad: 'Continuidad • Transformación • Eternidad', color: '#CFFAFE', chakra: 'Sacro',
    tarot: 'La Muerte (13)', numeroTarot: 13
  },
  'ס': {
    nombre: 'Samech', hebreo: 'ס', significado: 'Apoyo divino, sustento', elemento: 'Sagitario',
    tipo: 'Simple',
    descripcion: 'La columna que sostiene. Samech te recuerda que el Universo te apoya en cada paso del camino, incluso cuando no lo percibes.',
    meditacion: 'Siento el apoyo del Universo bajo mis pies. "Soy sostenido y amado incondicionalmente. Confío."',
    cualidad: 'Apoyo • Sustento • Confianza divina', color: '#FEF9C3', chakra: 'Raíz',
    tarot: 'La Templanza (14)', numeroTarot: 14
  },
  'ע': {
    nombre: 'Ayin', hebreo: 'ע', significado: 'Ojo interior, percepción', elemento: 'Capricornio',
    tipo: 'Simple',
    descripcion: 'El ojo que ve más allá de la forma. Ayin te invita a mirar la realidad con ojos del alma, más allá de las ilusiones del ego.',
    meditacion: 'Abro mi ojo interior en el entrecejo. "Veo la verdad detrás de las apariencias. La luz guía mi visión."',
    cualidad: 'Percepción • Visión • Insight', color: '#E0F2FE', chakra: 'Tercer Ojo',
    tarot: 'El Diablo (15)', numeroTarot: 15
  },
  'פ': {
    nombre: 'Pe', hebreo: 'פ', significado: 'Boca, palabra creadora', elemento: 'Marte',
    tipo: 'Doble',
    descripcion: 'La boca que crea realidades con sus palabras. Pe te enseña el poder sagrado de tu voz: cada palabra es un decreto que modela tu mundo.',
    meditacion: 'Respiro y hablo solo con verdad y amor. "Mis palabras son semillas de luz. Creo belleza con mi voz."',
    cualidad: 'Palabra • Creación • Comunicación', color: '#FFE4E6', chakra: 'Garganta',
    tarot: 'La Torre (16)', numeroTarot: 16
  },
  'צ': {
    nombre: 'Tzadi', hebreo: 'צ', significado: 'Justicia, rectitud interior', elemento: 'Acuario',
    tipo: 'Simple',
    descripcion: 'El anzuelo que captura la verdad. Tzadi representa la búsqueda de la rectitud: el alma que anhela vivir en alineación con su propósito sagrado.',
    meditacion: 'Me alinео con mi verdad más alta. "Actúo con integridad. Mi camino es recto y luminoso."',
    cualidad: 'Rectitud • Integridad • Justicia', color: '#F0FDF4', chakra: 'Plexo Solar',
    tarot: 'La Estrella (17)', numeroTarot: 17
  },
  'ק': {
    nombre: 'Kuf', hebreo: 'ק', significado: 'Ciclo, integración de la sombra', elemento: 'Piscis',
    tipo: 'Simple',
    descripcion: 'La nuca, lo que no vemos de nosotros mismos. Kuf te invita a integrar tu sombra con amor, pues en ella están tus mayores dones ocultos.',
    meditacion: 'Abrazo mis partes oscuras con compasión. "Lo que huyo de ver es donde está mi oro. Me integro en totalidad."',
    cualidad: 'Integración • Sombra • Ciclos', color: '#F5F3FF', chakra: 'Raíz',
    tarot: 'La Luna (18)', numeroTarot: 18
  },
  'ר': {
    nombre: 'Resh', hebreo: 'ר', significado: 'Cabeza, principio consciente', elemento: 'Sol',
    tipo: 'Doble',
    descripcion: 'La cabeza, el inicio del pensamiento consciente. Resh simboliza el liderazgo del alma iluminada que guía con sabiduría y amor.',
    meditacion: 'Soy guiado por mi mente superior. "Mi conciencia es un faro de luz. Lidero desde el corazón y la sabiduría."',
    cualidad: 'Liderazgo • Conciencia • Inicio', color: '#FFF7ED', chakra: 'Corona',
    tarot: 'El Sol (19)', numeroTarot: 19
  },
  'ת': {
    nombre: 'Tav', hebreo: 'ת', significado: 'Sello divino, completitud', elemento: 'Saturno',
    tipo: 'Doble',
    descripcion: 'La última letra, el sello de la creación. Tav representa la completitud del camino espiritual y el retorno al origen desde la plenitud.',
    meditacion: 'Soy completo tal como soy. "El sello divino está impreso en mi ser. Mi camino culmina en totalidad y paz."',
    cualidad: 'Completitud • Sello • Final/Inicio', color: '#F9F5FF', chakra: 'Raíz',
    tarot: 'El Mundo (21)', numeroTarot: 21
  }
};

// Mapa de valor Atlantis → letra hebrea (22 letras canónicas)
export const ATLANTIS_VALUE_TO_HEBREW: Record<number, string> = {
  1: 'א', 2: 'ב', 3: 'ג', 4: 'ד', 5: 'ה', 6: 'ו', 7: 'ז', 8: 'ח',
  9: 'ט', 10: 'י', 11: 'כ', 12: 'ל', 13: 'מ', 14: 'נ', 15: 'ס',
  16: 'ע', 17: 'פ', 18: 'צ', 19: 'ק', 20: 'ר', 21: 'ש', 22: 'ת'
  // 42 (SS) no corresponde a letra canónica — se omite
};

/**
 * Extrae las letras del alma de un nombre usando la tabla Atlantis.
 * Misma entrada → mismo output SIEMPRE (determinista).
 * Deduplica por valor Atlantis conservando el orden de aparición.
 */
export function extractLetrasDelAlma(fullName: string): LetraInfo[] {
  const values = tokenizeAtlantis(fullName);
  const seen = new Set<number>();
  const result: LetraInfo[] = [];

  for (const val of values) {
    if (val === 42 || seen.has(val)) continue;
    seen.add(val);
    const hebreo = ATLANTIS_VALUE_TO_HEBREW[val];
    if (!hebreo) continue;
    const info = LETRAS_SAGRADAS[hebreo];
    if (info) result.push(info);
  }

  return result;
}
