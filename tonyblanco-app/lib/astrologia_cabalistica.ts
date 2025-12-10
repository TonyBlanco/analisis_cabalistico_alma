/**
 * SISTEMA DE CÁLCULO DE ASTROLOGÍA CABALÍSTICA
 * Basado en las correspondencias del Árbol de la Vida y la Carta Natal.
 */

import { Body, Observer, Equator, Ecliptic } from 'astronomy-engine';

// --- 0. Constantes del Zodíaco ---

const ZODIAC_SIGNS = [
  'Aries', 'Tauro', 'Géminis', 'Cáncer', 
  'Leo', 'Virgo', 'Libra', 'Escorpio', 
  'Sagitario', 'Capricornio', 'Acuario', 'Piscis'
];

// --- 1. Tipos e Interfaces ---

export enum SefiraName {
  Keter = "Keter",
  Jojma = "Jojmá",
  Bina = "Biná",
  Jesed = "Jésed",
  Guevura = "Guevurá",
  Tiferet = "Tiféret",
  Netsaj = "Nétsaj",
  Hod = "Hod",
  Yesod = "Yesod",
  Maljut = "Maljút",
  Daat = "Dáat"
}

export interface PlanetCorrespondence {
  sefira: SefiraName;
  planeta: string;
  significado: string;
  vocalizacionTetragrammaton?: string; // Para la reprogramación (e.g., 'u' para Hod)
}

export interface PathCorrespondence {
  sendero: string; // Ej: "Kéter - Jojmá"
  letraHebrea: string;
  valorNumerico: number;
  regente: string; // Signo o Planeta o Elemento
}

export interface AngelCalculation {
  angelFisicoIndex: number;   // 1-72 (Basado en quinario solar)
  angelEmocionalIndex: number; // 1-72 (Basado en grado solar - rotación diaria)
  angelMentalIndex: number;    // 1-72 (Basado en hora nacimiento - rotación 20 min)
}

export interface AstrologicalData {
  sunLongitude: number;      // Grado del sol (0-360)
  birthMinutes: number;      // Minutos desde medianoche (0-1440)
  planets?: Record<string, number>; // Posiciones planetarias (opcional)
  aspects?: Array<{
    planet1: string;
    planet2: string;
    aspect: string; // "conjunction", "opposition", "square", "trine", "sextile"
  }>;
}

export interface ZodiacInfo {
  signo: string;              // Nombre del signo (ej: "Aries")
  gradoExacto: string;        // Grado exacto dentro del signo (0-29.99)
  gradoAbsoluto: string;      // Grado absoluto en la eclíptica (0-360)
  angelFisico: number;        // Ángel físico calculado (1-72)
}

// --- 2. Base de Datos (Mapeo Estático) ---

export const PLANETARY_MAP: Record<string, PlanetCorrespondence> = {
  Neptuno: { sefira: SefiraName.Keter, planeta: "Neptuno", significado: "Misticismo, Unidad" },
  Urano: { sefira: SefiraName.Jojma, planeta: "Urano", significado: "Cambio creativo, Sabiduría estelar", vocalizacionTetragrammaton: "Pataj (a)" },
  Saturno: { sefira: SefiraName.Bina, planeta: "Saturno", significado: "Ley, Forma, Estructura" },
  Jupiter: { sefira: SefiraName.Jesed, planeta: "Júpiter", significado: "Expansión, Gracia, Benevolencia" },
  Marte: { sefira: SefiraName.Guevura, planeta: "Marte", significado: "Rigor, Voluntad, Disciplina" },
  Sol: { sefira: SefiraName.Tiferet, planeta: "Sol", significado: "Centro, Identidad, Self, Vitalidad" },
  Venus: { sefira: SefiraName.Netsaj, planeta: "Venus", significado: "Atracción, Belleza, Emoción" },
  Mercurio: { sefira: SefiraName.Hod, planeta: "Mercurio", significado: "Intelecto, Razón, Comunicación", vocalizacionTetragrammaton: "Kubuts (u)" },
  Luna: { sefira: SefiraName.Yesod, planeta: "Luna", significado: "Espejo, Subconsciente, Imaginación, Éter" },
  Pluton: { sefira: SefiraName.Daat, planeta: "Plutón", significado: "Regencia sobre el inconsciente profundo" },
  Tierra: { sefira: SefiraName.Maljut, planeta: "Tierra", significado: "Realidad física" }
};

export const PATHS_DB: PathCorrespondence[] = [
  { sendero: "Kéter - Jojmá", letraHebrea: "Alef", valorNumerico: 1, regente: "Aire, Urano" },
  { sendero: "Kéter - Biná", letraHebrea: "Bet", valorNumerico: 2, regente: "Mercurio" },
  { sendero: "Kéter - Tiféret", letraHebrea: "Guimel", valorNumerico: 3, regente: "Luna" },
  { sendero: "Jojmá - Biná", letraHebrea: "Dalet", valorNumerico: 4, regente: "Venus" },
  { sendero: "Jojmá - Tiféret", letraHebrea: "He", valorNumerico: 5, regente: "Aries" },
  { sendero: "Jojmá - Jésed", letraHebrea: "Vav", valorNumerico: 6, regente: "Tauro" },
  { sendero: "Biná - Tiféret", letraHebrea: "Zayin", valorNumerico: 7, regente: "Géminis" },
  { sendero: "Biná - Guevurá", letraHebrea: "Jet", valorNumerico: 8, regente: "Cáncer" },
  { sendero: "Jésed - Guevurá", letraHebrea: "Tet", valorNumerico: 9, regente: "Leo" },
  { sendero: "Jésed - Tiféret", letraHebrea: "Yod", valorNumerico: 10, regente: "Virgo" },
  { sendero: "Jésed - Nétsaj", letraHebrea: "Kaf/Jaf", valorNumerico: 20, regente: "Júpiter" },
  { sendero: "Guevurá - Tiféret", letraHebrea: "Lamed", valorNumerico: 30, regente: "Libra" },
  { sendero: "Guevurá - Hod", letraHebrea: "Mem", valorNumerico: 40, regente: "Agua, Neptuno" },
  { sendero: "Tiféret - Nétsaj", letraHebrea: "Nun", valorNumerico: 50, regente: "Escorpio" },
  { sendero: "Tiféret - Yesod", letraHebrea: "Sámej", valorNumerico: 60, regente: "Sagitario" },
  { sendero: "Tiféret - Hod", letraHebrea: "Ayin", valorNumerico: 70, regente: "Capricornio" },
  { sendero: "Nétsaj - Hod", letraHebrea: "Pe/Fe", valorNumerico: 80, regente: "Marte" },
  { sendero: "Nétsaj - Yesod", letraHebrea: "Tsadi", valorNumerico: 90, regente: "Acuario" },
  { sendero: "Nétsaj - Maljút", letraHebrea: "Qof", valorNumerico: 100, regente: "Piscis" },
  { sendero: "Hod - Yesod", letraHebrea: "Resh", valorNumerico: 200, regente: "Sol" },
  { sendero: "Hod - Maljút", letraHebrea: "Shin", valorNumerico: 300, regente: "Fuego, Plutón" },
  { sendero: "Yesod - Maljút", letraHebrea: "Tav", valorNumerico: 400, regente: "Saturno" }
];

// --- 1. MAPA DE VOCALES PARA REPROGRAMACIÓN ---
export const SEFIROT_VOWELS: Record<string, { vowel: string, name: string, hebrew: string }> = {
  "Keter":   { vowel: "a", name: "Kamatz", hebrew: "ָ" },
  "Jojmá":   { vowel: "a", name: "Pataj", hebrew: "ַ" }, // Urano
  "Biná":    { vowel: "e", name: "Tsere", hebrew: "ֵ" }, // Saturno
  "Jésed":   { vowel: "o", name: "Jolam", hebrew: "ֹ" }, // Júpiter
  "Guevurá": { vowel: "i", name: "Jirik", hebrew: "ִ" }, // Marte
  "Tiféret": { vowel: "o", name: "Jolam", hebrew: "ֹ" }, // Sol
  "Nétsaj":  { vowel: "e", name: "Segol", hebrew: "ֶ" }, // Venus
  "Hod":     { vowel: "u", name: "Kubuts", hebrew: "ֻ" }, // Mercurio
  "Yesod":   { vowel: "u", name: "Shuruk", hebrew: "ּ" }, // Luna
  "Maljút":  { vowel: "a", name: "Pataj", hebrew: "ַ" }  // Tierra
};

// Mapa Planeta -> Sefirá (para astronomy-engine Body names)
const PLANET_SEFIRA: Record<string, string> = {
  "Sun": "Tiféret", 
  "Moon": "Yesod", 
  "Mercury": "Hod", 
  "Venus": "Nétsaj",
  "Mars": "Guevurá", 
  "Jupiter": "Jésed", 
  "Saturn": "Biná", 
  "Uranus": "Jojmá", 
  "Neptune": "Keter", 
  "Pluto": "Dáat"
};

// --- 3. Motor de Cálculos (Clase) ---

export class CabalaAstrologer {
  
  /**
   * Obtiene la correspondencia de un planeta con el Árbol de la Vida
   */
  getPlanetInfo(planetName: string): PlanetCorrespondence | null {
    // Normalización simple de texto
    const key = Object.keys(PLANETARY_MAP).find(k => 
      k.toLowerCase() === planetName.toLowerCase()
    );
    return key ? PLANETARY_MAP[key] : null;
  }

  /**
   * Obtiene la correspondencia de un sendero basado en la letra hebrea o número
   */
  getPathInfo(identifier: string | number): PathCorrespondence | undefined {
    return PATHS_DB.find(p => 
      p.letraHebrea === identifier || p.valorNumerico === identifier
    );
  }

  /**
   * Calcula los índices de los 72 Nombres de Dios (Ángeles)
   * @param sunLongitude Grado del sol (0 - 360)
   * @param birthMinutes Minutos totales desde medianoche (0 - 1440)
   */
  calculateAngels(sunLongitude: number, birthMinutes: number): AngelCalculation {
    // 1. Ángel Físico: Por quinario solar (cada 5 grados)
    // Formula: Math.floor(Grado / 5) + 1
    // Si grado es 0 (0 Aries), es el Ángel 1. Si es 359, es el Ángel 72.
    let angelFisico = Math.floor(sunLongitude / 5) + 1;
    if (angelFisico > 72) angelFisico = 1;

    // 2. Ángel Emocional: Por grado del sol (rotación diaria)
    // El texto dice "por el grado del sol". En la tradición cabalística, 
    // los ángeles rotan día a día a través del año zodiacal.
    // Simplificación para este motor: Mapeo directo 1 a 1 cíclico o por tabla de efemérides.
    // Nota: Aquí se asume que el input sunLongitude ya es preciso.
    // Una aproximación común es que el ángel rota cada ~5 días, pero el texto dice "grado".
    // Si se refiere a 1 grado = 1 día simbólico, necesitaríamos la fecha exacta del calendario hebreo.
    // Usaremos el mismo índice del físico como base si no hay datos más precisos, 
    // o calculamos el día del año (1-365) y hacemos modulo 72.
    // *Implementación basada en 5 grados según el contexto del texto*:
    const angelEmocional = angelFisico; // Placeholder según interpretación del texto proporcionado

    // 3. Ángel Mental: Por hora de nacimiento (cada 20 minutos)
    // 24 horas = 1440 minutos. 1440 / 72 = 20 minutos por ángel.
    // El ciclo comienza a la salida del sol o medianoche según la tradición.
    // Asumiremos medianoche (00:00) para este cálculo estándar.
    let angelMental = Math.floor(birthMinutes / 20) + 1;
    if (angelMental > 72) angelMental = 1;

    return {
      angelFisicoIndex: angelFisico,
      angelEmocionalIndex: angelEmocional,
      angelMentalIndex: angelMental
    };
  }

  /**
   * Calcula la carta astral real y convierte a signos del zodíaco
   * @param date Fecha y hora de nacimiento
   * @param latitude Latitud del lugar de nacimiento
   * @param longitude Longitud del lugar de nacimiento
   */
  calcularCartaAstralReal(date: Date, lat: number, lng: number): ZodiacInfo {
    try {
      // Calcular longitud eclíptica del sol directamente
      let sunDegree = 0;
      
      try {
        const observer = new Observer(lat, lng, 0);
        const sunEquator = Equator(Body.Sun, date, observer, true, true);
        
        if (sunEquator && sunEquator.ra !== undefined && sunEquator.dec !== undefined) {
          // Convertir RA/Dec a longitud eclíptica manualmente
          const epsilon = 23.4397 * Math.PI / 180; // Oblicuidad de la eclíptica
          const ra = sunEquator.ra * Math.PI / 180;
          const dec = sunEquator.dec * Math.PI / 180;
          
          const sinLambda = Math.sin(ra) * Math.cos(epsilon) + Math.tan(dec) * Math.sin(epsilon);
          const cosLambda = Math.cos(ra);
          sunDegree = Math.atan2(sinLambda, cosLambda) * 180 / Math.PI;
          
          if (sunDegree < 0) sunDegree += 360;
        } else {
          throw new Error('Equator no devolvió valores válidos');
        }
      } catch (e) {
        // Fallback: cálculo aproximado
        const year = date.getFullYear();
        const springEquinox = new Date(year, 2, 20, 12, 0, 0);
        const daysSinceEquinox = (date.getTime() - springEquinox.getTime()) / (1000 * 60 * 60 * 24);
        sunDegree = (daysSinceEquinox * 0.9856) % 360;
        if (sunDegree < 0) sunDegree += 360;
      }
    
    // TRADUCCIÓN A ASTROLOGÍA
    const signIndex = Math.floor(sunDegree / 30); // 0 = Aries, 1 = Tauro...
    const degreeInSign = sunDegree % 30; // Grado exacto dentro del signo (0-29.99)
    
      return {
        signo: ZODIAC_SIGNS[signIndex],
        gradoExacto: degreeInSign.toFixed(2), // Ej: "15.40"
        gradoAbsoluto: sunDegree.toFixed(2),  // Ej: "45.40" (Usado para tus Ángeles)
        // Para tu Cabalá, esto es oro puro:
        angelFisico: Math.floor(sunDegree / 5) + 1 
      };
    } catch (error) {
      console.error('Error en calcularCartaAstralReal:', error);
      // Retornar valores por defecto en caso de error
      return {
        signo: 'Desconocido',
        gradoExacto: '0.00',
        gradoAbsoluto: '0.00',
        angelFisico: 1
      };
    }
  }

  /**
   * CÁLCULO REAL DE ÁNGELES
   * Usa astronomy-engine para obtener la posición exacta del Sol.
   * @param date Fecha y hora de nacimiento
   * @param latitude Latitud del lugar de nacimiento
   * @param longitude Longitud del lugar de nacimiento
   */
  calculateRealAngels(date: Date, latitude: number, longitude: number) {
    try {
      // 1. Calcular longitud eclíptica del sol directamente desde la fecha
      // Usamos una fórmula astronómica precisa para evitar problemas con Ecliptic
      let sunLongitude = 0;
      
      try {
        // Intentar usar astronomy-engine si está disponible y funciona
        const observer = new Observer(latitude, longitude, 0);
        const sunEquator = Equator(Body.Sun, date, observer, true, true);
        
        if (sunEquator && sunEquator.ra !== undefined && sunEquator.dec !== undefined) {
          // Convertir RA/Dec a longitud eclíptica manualmente
          // Fórmula: tan(lambda) = (sin(RA) * cos(epsilon) + tan(Dec) * sin(epsilon)) / cos(RA)
          // donde epsilon = 23.4397° (oblicuidad de la eclíptica)
          const epsilon = 23.4397 * Math.PI / 180; // En radianes
          const ra = sunEquator.ra * Math.PI / 180; // En radianes
          const dec = sunEquator.dec * Math.PI / 180; // En radianes
          
          // Calcular longitud eclíptica
          const sinLambda = Math.sin(ra) * Math.cos(epsilon) + Math.tan(dec) * Math.sin(epsilon);
          const cosLambda = Math.cos(ra);
          sunLongitude = Math.atan2(sinLambda, cosLambda) * 180 / Math.PI;
          
          // Normalizar a 0-360
          if (sunLongitude < 0) sunLongitude += 360;
        } else {
          throw new Error('Equator no devolvió valores válidos');
        }
      } catch (astronomyError) {
        console.warn('⚠️ Error con astronomy-engine, usando cálculo aproximado:', astronomyError);
        // Fallback: calcular longitud aproximada basada en la fecha
        // IMPORTANTE: Usar métodos UTC para evitar problemas de zona horaria
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth(); // 0-11
        const day = date.getUTCDate();
        
        // Calcular día del año (1-365/366)
        const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        // Año bisiesto si es divisible por 4 (excepto siglos, pero simplificado)
        if (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) {
          daysInMonth[1] = 29;
        }
        
        let dayOfYear = day;
        for (let i = 0; i < month; i++) {
          dayOfYear += daysInMonth[i];
        }
        
        // Equinoccio de primavera aproximado: 20 de marzo = día 79 (o 80 en año bisiesto)
        const springEquinoxDay = (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 80 : 79;
        
        // Calcular días desde equinoccio
        let daysSinceEquinox = dayOfYear - springEquinoxDay;
        
        // Si la fecha es antes del equinoccio, sumar 365 días (año anterior)
        if (daysSinceEquinox < 0) {
          daysSinceEquinox += (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 366 : 365;
        }
        
        // El sol se mueve aproximadamente 0.9856 grados por día
        // Longitud eclíptica: 0° = Aries (equinoccio), 360° = vuelta completa
        sunLongitude = (daysSinceEquinox * 0.9856) % 360;
        if (sunLongitude < 0) sunLongitude += 360;
        
        console.log(`📊 Cálculo fallback: Año ${year}, Mes ${month + 1}, Día ${day}, Día del año ${dayOfYear}, Días desde equinoccio ${daysSinceEquinox}, Longitud solar ${sunLongitude.toFixed(2)}°`);
      }

    // 3. Calcular Ángel Físico (Quinario Solar)
    // 360 grados / 72 ángeles = 5 grados por ángel
    let angelFisico = Math.floor(sunLongitude / 5) + 1;
    if (angelFisico > 72) angelFisico = 1;

    // 4. Calcular Ángel Emocional (Grado Solar - Día)
    // En la práctica cabalista estricta, el ángel rota cada día. 
    // Usaremos una aproximación basada en el ciclo anual solar.
    // Días del año aproximados desde Aries 0 (Equinoccio primavera)
    // Esto es una simplificación válida para aplicaciones no-académicas.
    const angelEmocional = angelFisico; // A menudo coinciden o se calculan por tablas de efemérides complejas.

    // 5. Calcular Ángel Mental (Hora de nacimiento)
    // Rotan cada 20 minutos empezando al amanecer o medianoche según tradición.
    // Usaremos medianoche UTC como estándar para evitar problemas de zona horaria.
    const minutesSinceMidnight = (date.getUTCHours() * 60) + date.getUTCMinutes();
    let angelMental = Math.floor(minutesSinceMidnight / 20) + 1;
    if (angelMental > 72) angelMental = 1;

      // Calcular información zodiacal
      const signIndex = Math.floor(sunLongitude / 30);
      const degreeInSign = sunLongitude % 30;
      
      return {
        sunDegree: sunLongitude.toFixed(2),
        angelFisico, // ID del 1 al 72
        angelEmocional,
        angelMental,
        // Información zodiacal adicional
        zodiacSign: ZODIAC_SIGNS[signIndex] || 'Desconocido',
        degreeInSign: degreeInSign.toFixed(2),
        signIndex: signIndex
      };
    } catch (error) {
      console.error('Error calculando ángeles con astronomy-engine:', error);
      // Fallback: cálculo aproximado basado solo en la fecha usando UTC
      const year = date.getUTCFullYear();
      const month = date.getUTCMonth();
      const day = date.getUTCDate();
      
      // Calcular día del año
      const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      if (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) {
        daysInMonth[1] = 29;
      }
      
      let dayOfYear = day;
      for (let i = 0; i < month; i++) {
        dayOfYear += daysInMonth[i];
      }
      
      const springEquinoxDay = (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 80 : 79;
      let daysSinceEquinox = dayOfYear - springEquinoxDay;
      if (daysSinceEquinox < 0) {
        daysSinceEquinox += (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 366 : 365;
      }
      
      const sunLongitude = (daysSinceEquinox * 0.9856) % 360;
      
      let angelFisico = Math.floor(sunLongitude / 5) + 1;
      if (angelFisico > 72) angelFisico = 1;
      
      const minutesSinceMidnight = (date.getUTCHours() * 60) + date.getUTCMinutes();
      let angelMental = Math.floor(minutesSinceMidnight / 20) + 1;
      if (angelMental > 72) angelMental = 1;
      
      // Calcular información zodiacal aproximada
      const signIndex = Math.floor(sunLongitude / 30);
      const degreeInSign = sunLongitude % 30;
      
      return {
        sunDegree: sunLongitude.toFixed(2),
        angelFisico,
        angelEmocional: angelFisico,
        angelMental,
        // Información zodiacal adicional
        zodiacSign: ZODIAC_SIGNS[signIndex] || 'Desconocido',
        degreeInSign: degreeInSign.toFixed(2),
        signIndex: signIndex
      };
    }
  }

  /**
   * NUEVO: Calcula posiciones planetarias y detecta conflictos (Tikún)
   */
  calculatePlanetaryAspects(date: Date, lat: number, lng: number) {
    try {
      const observer = new Observer(lat, lng, 0);
      const bodies = [Body.Sun, Body.Moon, Body.Mercury, Body.Venus, Body.Mars, Body.Jupiter, Body.Saturn, Body.Uranus, Body.Neptune, Body.Pluto];
      
      // 1. Obtener longitudes eclípticas
      const positions: Array<{ name: string, deg: number }> = [];
      
      for (const body of bodies) {
        try {
          const eq = Equator(body, date, observer, true, true);
          const ecl = Ecliptic(eq as any);
          const bodyName = body.toString().replace('Body.', '');
          positions.push({ name: bodyName, deg: ecl.elon });
        } catch (err) {
          console.warn(`⚠️ Error calculando posición de ${body}:`, err);
        }
      }

      // 2. Buscar el aspecto más tenso (Cuadratura ~90° o Oposición ~180°)
      let primaryConflict: any = null;

      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          const p1 = positions[i];
          const p2 = positions[j];
          
          // Diferencia angular
          let diff = Math.abs(p1.deg - p2.deg);
          if (diff > 180) diff = 360 - diff;

          // Tolerancia (Orbe) de 6 grados
          const isSquare = Math.abs(diff - 90) < 6;
          const isOpposition = Math.abs(diff - 180) < 6;

          if (isSquare || isOpposition) {
            primaryConflict = {
              planet1: p1.name,
              planet2: p2.name,
              aspect: isSquare ? "Cuadratura (Tensión)" : "Oposición (Bloqueo)",
              sefira1: PLANET_SEFIRA[p1.name] || "Tiféret",
              sefira2: PLANET_SEFIRA[p2.name] || "Biná",
              angle: diff.toFixed(1)
            };
            // Si encontramos uno, paramos (para simplificar el MVP)
            break;
          }
        }
        if (primaryConflict) break;
      }

      // Si no hay aspectos tensos fuertes, usamos Sol vs Saturno (Ego vs Estructura) por defecto
      if (!primaryConflict) {
        primaryConflict = {
          planet1: "Sun",
          planet2: "Saturn",
          aspect: "Alineación General",
          sefira1: "Tiféret",
          sefira2: "Biná",
          angle: "90.0"
        };
      }

      return primaryConflict;
    } catch (error) {
      console.error('Error calculando aspectos planetarios:', error);
      // Fallback por defecto
      return {
        planet1: "Sun",
        planet2: "Saturn",
        aspect: "Alineación General",
        sefira1: "Tiféret",
        sefira2: "Biná",
        angle: "90.0"
      };
    }
  }

  /**
   * NUEVO: Genera el Código de Reprogramación (Vocalización)
   */
  getReprogrammingCode(sefira1: string, sefira2: string) {
    const v1 = SEFIROT_VOWELS[sefira1] || { vowel: "a", name: "Pataj", hebrew: "ַ" };
    const v2 = SEFIROT_VOWELS[sefira2] || { vowel: "a", name: "Pataj", hebrew: "ַ" };

    // Construcción del Nombre Entrelazado Y-H-V-H con vocales
    // Letras: Yod (Y), He (H), Vav (V), He (H)
    // Alternamos las vocales de las dos sefirot para unir las energías
    return {
      visual: [
        { letter: "י", vowelMark: v1.hebrew, vowelName: v1.name, sound: `Y${v1.vowel}` },
        { letter: "ה", vowelMark: v2.hebrew, vowelName: v2.name, sound: `H${v2.vowel}` },
        { letter: "ו", vowelMark: v1.hebrew, vowelName: v1.name, sound: `V${v1.vowel}` },
        { letter: "ה", vowelMark: v2.hebrew, vowelName: v2.name, sound: `H${v2.vowel}` }
      ],
      explanation: `Unión de ${sefira1} (${v1.name}) con ${sefira2} (${v2.name})`
    };
  }

  /**
   * Genera la instrucción de reprogramación para un aspecto planetario
   * @param planet1 Nombre del primer planeta (ej: "Mercurio")
   * @param planet2 Nombre del segundo planeta (ej: "Urano")
   */
  getReprogrammingInstruction(planet1: string, planet2: string): string {
    const p1 = this.getPlanetInfo(planet1);
    const p2 = this.getPlanetInfo(planet2);

    if (!p1 || !p2) return "Información planetaria incompleta para reprogramación.";

    const vocal1 = p1.vocalizacionTetragrammaton || "(vocal desconocida)";
    const vocal2 = p2.vocalizacionTetragrammaton || "(vocal desconocida)";

    return `
      TÉCNICA DE REPROGRAMACIÓN DE ASPECTO (${planet1} - ${planet2}):
      1. Sefirot Involucradas: ${p1.sefira} y ${p2.sefira}.
      2. Vocalización: Combina la vocal '${vocal1}' de ${planet1} con '${vocal2}' de ${planet2}.
      3. Meditación: Entrelaza el Tetragrammaton con estas vocales para crear un Nombre de 12 letras.
      4. Objetivo: Alinear voluntad personal (Asiá) con la Voluntad Suprema para transmutar la energía.
    `;
  }

  /**
   * Calcula todas las correspondencias para una carta astral
   */
  calculateFullChart(data: AstrologicalData) {
    const angels = this.calculateAngels(data.sunLongitude, data.birthMinutes);
    
    const planetCorrespondences: Record<string, PlanetCorrespondence> = {};
    if (data.planets) {
      Object.keys(data.planets).forEach(planet => {
        const info = this.getPlanetInfo(planet);
        if (info) {
          planetCorrespondences[planet] = info;
        }
      });
    }

    const reprogrammingInstructions: string[] = [];
    if (data.aspects) {
      data.aspects.forEach(aspect => {
        const instruction = this.getReprogrammingInstruction(aspect.planet1, aspect.planet2);
        reprogrammingInstructions.push(instruction);
      });
    }

    return {
      angels,
      planetCorrespondences,
      reprogrammingInstructions,
      sunSefira: PLANETARY_MAP.Sol?.sefira || null,
    };
  }
}

