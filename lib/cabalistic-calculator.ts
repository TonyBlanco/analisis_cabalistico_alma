

// Motor de cálculos numerológicos cabalísticos - Metodología Precisa Centro Atlantis

export interface DatosPersonales {
  nombreCompleto: string;
  fechaNacimiento: Date;
  lugarNacimiento?: string;
  horaNacimiento?: string;
}

export interface CalculosNumerologicos {
  // Números fundamentales según metodología María Isabel
  temaOrigen: number;
  principioTransformacion: number;
  temaDestino: number;
  estructuraEnergetica: number;
  imagenAlma: number;
  razonesKarmicas: number;
  
  // 4 Tipos de Vibraciones (CORREGIDO según Módulos 5-8)
  vibracionCuerpo: number;
  vibracionAlma: number;
  vibracionEspiritu: number;
  vibracionHoy: number;
  
  // Números adicionales
  numeroCorazon: number;
  efectoSanador: number;
  lemaVida: number;
  
  // Imagen del Alma con Frecuencias (10 posiciones)
  imagenAlmaCompleta: {
    posicion1: number;
    posicion2: number;
    posicion3: number;
    posicion4: number;
    posicion5: number;
    posicion6: number;
    posicion7: number;
    posicion8: number;
    posicion9: number;
    posicion10: number;
    frecuencias: Record<number, number>;
  };
  
  // Datos temporales y ciclos
  letrasHebreas: string[];
  diasFuerza: number[];
  edadTransformacion: number;
  anosTurbulenciasEspirituales: number;
  anosTurbulenciasAlma: number;
  anosTurbulenciasMateriales: number;
  
  // Secuencia principal de números
  secuenciaPrincipal: number[];
  
  // Cuentas pendientes con frecuencias (Módulo 9)
  cuentasPendientes: Record<number, number>;
  
  // Sistema de Ejes y Polos (Módulo 6)
  polosContrapolos: Record<string, boolean>;
  ejesTension: string[];
  ejesYangYin: string[];
  ejesEspirituMateria: string[];
}

export interface CartasArquetipicas {
  cartaOrigen: {
    nombre: string;
    arcano: number;
    sendero: string;
    vibracion: number;
    significado: string;
    afirmacion: string;
  };
  cartaTransformacion: {
    nombre: string;
    arcano: number;
    sendero: string;
    vibracion: number;
    significado: string;
    afirmacion: string;
  };
  cartaDestino: {
    nombre: string;
    arcano: number;
    sendero: string;
    vibracion: number;
    significado: string;
    afirmacion: string;
  };
}

export interface HeridasAlma {
  heridaDominante: string;
  heridasSecundarias: string[];
  gradosActivacion: Record<string, number>;
  descripcion: string;
  sanacion: string;
}

export interface CuentasPendientes {
  numerosRepetidos: number[];
  nucleo: number;
  significado: string;
  trabajoRequerido: string;
}

// Correspondencias Sefirot-Chakras-Planetas según metodología precisa
export interface SefirotCorrespondencia {
  nombre: string;
  chakra: string;
  planeta: string;
  fraseTotemica: string;
  ubicacion: string;
  energia: 'Yang' | 'Yin' | 'Neutro';
}

export const CORRESPONDENCIAS_SEFIROT: Record<string, SefirotCorrespondencia> = {
  'MALKUTH': {
    nombre: 'Malkuth',
    chakra: 'Chakra Raíz (Coxis)',
    planeta: 'Tierra',
    fraseTotemica: 'YO EVOLUCIONO – YO ME REALIZO – YO INTEGRO MI SOMBRA',
    ubicacion: 'Base de la columna',
    energia: 'Neutro'
  },
  'YESOD': {
    nombre: 'Yesod',
    chakra: 'Chakra Sacro (Bajo abdomen)',
    planeta: 'Luna',
    fraseTotemica: 'YO ME FERTILIZO – YO ME PACIFICO – YO COLABORO – YO PARTICIPO',
    ubicacion: 'Bajo abdomen',
    energia: 'Neutro'
  },
  'HOD': {
    nombre: 'Hod',
    chakra: 'Chakra Plexo Solar (Yin)',
    planeta: 'Venus',
    fraseTotemica: 'YO ME MUESTRO – YO ME DETERMINO – YO ME RECONOZCO',
    ubicacion: 'Plexo solar',
    energia: 'Yin'
  },
  'NETZAJ': {
    nombre: 'Netzaj',
    chakra: 'Chakra Plexo Solar (Yang)',
    planeta: 'Mercurio',
    fraseTotemica: 'YO ME SANO – YO ME ARMONIZO – YO ME RESPONSABILIZO',
    ubicacion: 'Plexo solar',
    energia: 'Yang'
  },
  'TIFERET': {
    nombre: 'Tiferet',
    chakra: 'Chakra Corazón',
    planeta: 'Sol',
    fraseTotemica: 'YO ME AMO – YO ME RECONOZCO – YO SOY',
    ubicacion: 'Centro del corazón',
    energia: 'Neutro'
  },
  'GUEVURAH': {
    nombre: 'Guevurah',
    chakra: 'Chakra Laríngeo (Yang)',
    planeta: 'Marte',
    fraseTotemica: 'YO PUEDO – YO REALIZO – YO ME COMPROMETO',
    ubicacion: 'Garganta',
    energia: 'Yang'
  },
  'JESED': {
    nombre: 'Jesed',
    chakra: 'Chakra Laríngeo (Yin)',
    planeta: 'Júpiter',
    fraseTotemica: 'YO AMO INCONDICIONALMENTE – YO SIRVO – YO CO-CREO – YO ME ENTREGO',
    ubicacion: 'Garganta',
    energia: 'Yin'
  },
  'BINAH': {
    nombre: 'Binah',
    chakra: 'Chakra Frontal (Yang)',
    planeta: 'Neptuno',
    fraseTotemica: 'YO ENTIENDO – YO DOY – YO COMPARTO- YO ENTREGO – YO CREO',
    ubicacion: 'Frente',
    energia: 'Yang'
  },
  'JOKHMAH': {
    nombre: 'Jokhmah',
    chakra: 'Chakra Frontal (Yin)',
    planeta: 'Urano',
    fraseTotemica: 'YO SÉ – YO CONFÍO – YO PERMITO',
    ubicacion: 'Frente',
    energia: 'Yin'
  },
  'KETER': {
    nombre: 'Keter',
    chakra: 'Chakra Corona',
    planeta: 'Plutón',
    fraseTotemica: 'YO VENZO – YO SOY UNO - YO REGRESO',
    ubicacion: 'Corona de la cabeza',
    energia: 'Neutro'
  }
};

// Las 7 Leyes Cósmicas del Kybalion
export const LEYES_COSMICAS = {
  MENTALISMO: {
    nombre: 'Principio del Mentalismo',
    ley: 'EL TODO es Mente; el Universo es mental',
    descripcion: 'Cada cosa que vivimos depende de nuestro pensamiento. El Universo Personal depende del Pensamiento. Todo lo que uno cree de sí mismo se refleja en los demás.'
  },
  CORRESPONDENCIA: {
    nombre: 'Principio de Correspondencia',
    ley: 'Como arriba es abajo, como abajo es arriba. Como adentro es afuera; como afuera es adentro',
    descripcion: 'Todo lo que sucede alrededor refleja lo que ocurre por dentro. Útil para detectar mentiras y estados internos.'
  },
  VIBRACION: {
    nombre: 'Principio de Vibración',
    ley: 'Nada está inmóvil, todo se mueve, todo vibra',
    descripcion: 'Materia y energía son estados vibratorios diferentes. Pensamientos positivos vibran alto (colores brillantes). Pensamientos negativos vibran bajo (colores opacos). Atraemos personas y situaciones del mismo nivel vibratorio.'
  },
  POLARIDAD: {
    nombre: 'Principio de Polaridad',
    ley: 'Todo es doble; todo tiene dos polos',
    descripcion: 'Los opuestos son idénticos en naturaleza, diferentes en grado. Función: aprender a armonizar los opuestos. Encontrar la unidad en todo para acceder a la paz de Dios.'
  },
  RITMO: {
    nombre: 'Principio del Ritmo',
    ley: 'Todo fluye y refluye; todo tiene períodos de avance y retroceso',
    descripcion: 'Movimiento pendular en todos los planos. Después de tristeza viene alegría (compensación). El ritmo siempre comienza por el polo negativo.'
  },
  CAUSA_EFECTO: {
    nombre: 'Principio de Causa y Efecto',
    ley: 'Toda causa tiene su efecto, todo efecto tiene su causa',
    descripcion: 'Karma: causa cuyo efecto aún no se ha manifestado. Todo lo que vivimos ha sido generado por nosotros. El karma se disuelve por completo con el perdón.'
  },
  GENERACION: {
    nombre: 'Principio de Generación',
    ley: 'La generación existe por doquier. Todo tiene principios masculino y femenino',
    descripcion: 'Para crear algo nuevo se necesita conjugación de energías masculina y femenina. Energía Yin (femenina): receptiva, creativa, imaginativa, pasiva. Energía Yang (masculina): dinámica, activa, agresiva, capacidad de dar.'
  }
};

// Correspondencias numerológicas con letras hebreas
const LETRAS_HEBREAS: Record<number, string> = {
  1: 'א (Alef)', 2: 'ב (Bet)', 3: 'ג (Gimel)', 4: 'ד (Dalet)', 5: 'ה (He)',
  6: 'ו (Vav)', 7: 'ז (Zayin)', 8: 'ח (Chet)', 9: 'ט (Tet)', 10: 'י (Yod)',
  11: 'כ (Kaf)', 12: 'ל (Lamed)', 13: 'מ (Mem)', 14: 'נ (Nun)', 15: 'ס (Samech)',
  16: 'ע (Ayin)', 17: 'פ (Pe)', 18: 'צ (Tzade)', 19: 'ק (Qof)', 20: 'ר (Resh)',
  21: 'ש (Shin)', 22: 'ת (Tav)'
};

// Sistema Completo de Tarot - 22 Arcanos Mayores (Módulos 2-4)
const CARTAS_TAROT: Record<number, any> = {
  1: {
    nombre: "EL MAGO",
    sendero: "De Keter a Binah",
    significado: "Voluntad creadora, manifestación de la intención divina",
    afirmacion: "Soy canal de la voluntad divina. Mi palabra crea realidad"
  },
  2: {
    nombre: "LA SACERDOTISA",
    sendero: "De Keter a Tiferet",
    significado: "Sabiduría intuitiva, conexión con lo oculto",
    afirmacion: "En el silencio encuentro la verdad. Soy guardiana de los misterios"
  },
  3: {
    nombre: "LA EMPERATRIZ",
    sendero: "De Binah a Chokmah",
    significado: "Energía de fertilidad, creación desde el placer, abundancia y expansión afectiva",
    afirmacion: "Yo soy origen fértil. Mi alma crea desde el amor y da forma a lo invisible"
  },
  4: {
    nombre: "EL EMPERADOR",
    sendero: "De Chokmah a Tiferet",
    significado: "Autoridad espiritual, estructura y orden divino",
    afirmacion: "Gobierno con sabiduría. Mi autoridad sirve al bien supremo"
  },
  5: {
    nombre: "EL SUMO SACERDOTE",
    sendero: "De Chesed a Tiferet",
    significado: "Puente entre conocimiento superior y compasión práctica",
    afirmacion: "La verdad habita en mí. Mi fe construye puentes entre el cielo y la tierra"
  },
  6: {
    nombre: "LOS ENAMORADOS",
    sendero: "De Binah a Tiferet",
    significado: "Elección consciente, unión de opuestos",
    afirmacion: "Elijo el amor. Mi corazón une lo que parece separado"
  },
  7: {
    nombre: "EL CARRO",
    sendero: "De Binah a Geburah",
    significado: "Dominio consciente de fuerzas internas, integración de polaridades",
    afirmacion: "Con coraje y dirección avanzo. Soy vehículo de mi misión"
  },
  8: {
    nombre: "LA JUSTICIA",
    sendero: "De Geburah a Tiferet",
    significado: "Equilibrio kármico, ley divina",
    afirmacion: "Soy instrumento de justicia divina. Mi balanza pesa con amor"
  },
  9: {
    nombre: "EL ERMITAÑO",
    sendero: "De Chesed a Yesod",
    significado: "Búsqueda interior, guía espiritual",
    afirmacion: "Mi luz interior ilumina el camino. Soy faro para otros buscadores"
  },
  10: {
    nombre: "LA RUEDA DE LA FORTUNA",
    sendero: "De Netzach a Chesed",
    significado: "Ciclos del destino, cambios kármicos",
    afirmacion: "Acepto los ciclos de la vida. Soy parte del gran movimiento cósmico"
  },
  11: {
    nombre: "LA FUERZA",
    sendero: "De Geburah a Chesed",
    significado: "Poder interior, dominio de las pasiones",
    afirmacion: "Mi fuerza viene del amor. Domino mis instintos con compasión"
  },
  12: {
    nombre: "EL COLGADO",
    sendero: "De Hod a Geburah",
    significado: "Sacrificio consciente, nueva perspectiva",
    afirmacion: "En la entrega encuentro libertad. Mi sacrificio es mi poder"
  },
  13: {
    nombre: "LA MUERTE",
    sendero: "De Netzach a Tiferet",
    significado: "Transformación profunda, renacimiento",
    afirmacion: "Abrazo la transformación. En cada final hay un nuevo comienzo"
  },
  14: {
    nombre: "LA TEMPLANZA",
    sendero: "De Yesod a Tiferet",
    significado: "Equilibrio, moderación, alquimia espiritual",
    afirmacion: "Soy el alquimista de mi vida. Mezclo los opuestos con sabiduría"
  },
  15: {
    nombre: "EL DIABLO",
    sendero: "De Hod a Tiferet",
    significado: "Liberación de ataduras, reconocimiento de la sombra",
    afirmacion: "Reconozco mis cadenas para liberarme. Mi sombra es mi maestra"
  },
  16: {
    nombre: "LA TORRE",
    sendero: "De Netzach a Hod",
    significado: "Destrucción de ilusiones, despertar súbito",
    afirmacion: "Acepto la destrucción de lo falso. En las ruinas construyo verdad"
  },
  17: {
    nombre: "LA ESTRELLA",
    sendero: "De Yesod a Netzach",
    significado: "Esperanza, inspiración divina, guía celestial",
    afirmacion: "Soy una estrella en la oscuridad. Mi luz guía a otros hacia casa"
  },
  18: {
    nombre: "LA LUNA",
    sendero: "De Yesod a Netzach",
    significado: "Intuición, misterios del subconsciente",
    afirmacion: "Navego por los misterios de mi alma. La luna ilumina mi camino interior"
  },
  19: {
    nombre: "EL SOL",
    sendero: "De Yesod a Hod",
    significado: "Iluminación, alegría, éxito espiritual",
    afirmacion: "Soy luz radiante. Mi alegría ilumina el mundo"
  },
  20: {
    nombre: "EL JUICIO",
    sendero: "De Malkuth a Hod",
    significado: "Renacimiento espiritual, llamada superior",
    afirmacion: "Escucho el llamado de mi alma. Renazco en mi verdad más elevada"
  },
  21: {
    nombre: "EL MUNDO",
    sendero: "De Malkuth a Yesod",
    significado: "Completitud, realización del propósito",
    afirmacion: "He completado el ciclo. Soy uno con el Todo"
  },
  22: {
    nombre: "EL LOCO",
    sendero: "De Keter a Chokmah",
    significado: "Nuevo comienzo, fe en lo desconocido",
    afirmacion: "Confío en el viaje. Cada paso es sagrado en mi camino"
  }
};

// Heridas del alma y sus características
const HERIDAS_ALMA: Record<string, any> = {
  "abandono": {
    descripcion: "Miedo profundo a ser dejado solo, necesidad excesiva de compañía",
    sanacion: "Cultivar la autocompañía amorosa y la confianza en el apoyo divino",
    secundarias: ["rechazo", "soledad", "desamor"]
  },
  "rechazo": {
    descripcion: "Sensación de no ser aceptado, miedo al juicio de otros",
    sanacion: "Desarrollar autoaceptación incondicional y valor personal",
    secundarias: ["pertenencia", "culpa", "juicio"]
  },
  "juicio": {
    descripcion: "Autocrítica severa, perfeccionismo paralizante",
    sanacion: "Practicar la autocompasión y aceptar la imperfección humana",
    secundarias: ["duda", "confusión", "desamor"]
  },
  "traicion": {
    descripcion: "Dificultad para confiar, hipervigilancia emocional",
    sanacion: "Reconstruir la confianza gradualmente, empezando por uno mismo",
    secundarias: ["control", "miedo", "soledad"]
  },
  "injusticia": {
    descripcion: "Sensación de que la vida es injusta, victimización",
    sanacion: "Encontrar el propósito en las experiencias difíciles",
    secundarias: ["ira", "resentimiento", "impotencia"]
  }
};

export function calcularNumerologiaBasica(nombre: string, fecha: Date): CalculosNumerologicos {
  // Convertir nombre a números según metodología cabalística exacta
  const nombreNumeros = convertirNombreANumeros(nombre);
  
  // Cálculos fundamentales según metodología María Isabel
  const dia = fecha.getDate();
  const mes = fecha.getMonth() + 1;
  const ano = fecha.getFullYear();
  
  // Números fundamentales según caso María Isabel
  const temaOrigen = reducirADigito(nombreNumeros.reduce((sum, n) => sum + n, 0));
  const principioTransformacion = reducirADigito(dia + mes);
  const temaDestino = reducirADigito(ano);
  const estructuraEnergetica = calcularEstructuraEnergetica(nombre, fecha);
  const imagenAlma = calcularImagenAlma(nombreNumeros);
  const razonesKarmicas = calcularRazonesKarmicas(dia, mes, ano);
  
  // 4 Tipos de Vibraciones según Módulos 5-8
  const vibracionCuerpo = calcularVibracionCuerpo(nombre, fecha);
  const vibracionAlma = calcularVibracionAlma(nombre, fecha);
  const vibracionEspiritu = calcularVibracionEspiritu(nombre, fecha);
  const vibracionHoy = calcularVibracionHoy(new Date());
  
  // Imagen del Alma Completa con 10 posiciones
  const imagenAlmaCompleta = calcularImagenAlmaCompleta(nombre, fecha);
  
  // Secuencia principal de números (según patrón observado)
  const secuenciaPrincipal = generarSecuenciaPrincipal(nombre, fecha);
  
  // Números adicionales
  const numeroCorazon = calcularNumeroCorazon(fecha, imagenAlma);
  const efectoSanador = calcularEfectoSanador(temaOrigen, principioTransformacion, temaDestino);
  const lemaVida = calcularLemaVida(fecha, temaDestino);
  
  // Cuentas pendientes con frecuencias según Módulo 9
  const cuentasPendientes = calcularCuentasPendientes(nombre, fecha);
  
  // Letras hebreas asociadas
  const letrasHebreas = obtenerLetrasHebreas(temaOrigen, principioTransformacion, temaDestino);
  
  // Días de fuerza y fechas importantes
  const diasFuerza = calcularDiasFuerza(fecha, estructuraEnergetica);
  const edadTransformacion = calcularEdadTransformacion(razonesKarmicas);
  const anosTurbulenciasEspirituales = calcularTurbulenciasEspirituales(temaDestino);
  const anosTurbulenciasAlma = calcularTurbulenciasAlma(imagenAlma);
  const anosTurbulenciasMateriales = calcularTurbulenciasMateriales(estructuraEnergetica);
  
  // Sistema de Ejes y Polos según Módulo 6
  const polosContrapolos = calcularPolosContrapolos(temaOrigen, principioTransformacion, temaDestino);
  const ejesTension = calcularEjesTension(polosContrapolos);
  const ejesYangYin = calcularEjesYangYin(temaOrigen, principioTransformacion, temaDestino);
  const ejesEspirituMateria = calcularEjesEspirituMateria(temaOrigen, principioTransformacion, temaDestino);
  
  return {
    temaOrigen,
    principioTransformacion,
    temaDestino,
    estructuraEnergetica,
    imagenAlma,
    razonesKarmicas,
    vibracionCuerpo,
    vibracionAlma,
    vibracionEspiritu,
    vibracionHoy,
    numeroCorazon,
    efectoSanador,
    lemaVida,
    imagenAlmaCompleta,
    letrasHebreas,
    diasFuerza,
    edadTransformacion,
    anosTurbulenciasEspirituales,
    anosTurbulenciasAlma,
    anosTurbulenciasMateriales,
    secuenciaPrincipal,
    cuentasPendientes,
    polosContrapolos,
    ejesTension,
    ejesYangYin,
    ejesEspirituMateria
  };
}

export function obtenerCartasArquetipicas(calculos: CalculosNumerologicos): CartasArquetipicas {
  const cartaOrigen = CARTAS_TAROT[calculos.temaOrigen] || CARTAS_TAROT[1];
  const cartaTransformacion = CARTAS_TAROT[calculos.principioTransformacion] || CARTAS_TAROT[2];
  const cartaDestino = CARTAS_TAROT[calculos.temaDestino] || CARTAS_TAROT[3];
  
  return {
    cartaOrigen: {
      ...cartaOrigen,
      arcano: calculos.temaOrigen,
      vibracion: calculos.temaOrigen
    },
    cartaTransformacion: {
      ...cartaTransformacion,
      arcano: calculos.principioTransformacion,
      vibracion: calculos.principioTransformacion
    },
    cartaDestino: {
      ...cartaDestino,
      arcano: calculos.temaDestino,
      vibracion: calculos.temaDestino
    }
  };
}

export function analizarHeridasAlma(calculos: CalculosNumerologicos): HeridasAlma {
  // Determinar herida dominante basada en números actualizados
  const heridasPosibles = Object.keys(HERIDAS_ALMA);
  const heridaDominante = determinarHeridaDominante(calculos);
  const heridasSecundarias = determinarHeridasSecundarias(calculos, heridaDominante);
  
  const gradosActivacion: Record<string, number> = {};
  gradosActivacion[heridaDominante] = calcularGradoActivacion(calculos, heridaDominante);
  heridasSecundarias.forEach(herida => {
    gradosActivacion[herida] = calcularGradoActivacion(calculos, herida);
  });
  
  return {
    heridaDominante,
    heridasSecundarias,
    gradosActivacion,
    descripcion: HERIDAS_ALMA[heridaDominante]?.descripcion || "",
    sanacion: HERIDAS_ALMA[heridaDominante]?.sanacion || ""
  };
}

export function obtenerCuentasPendientesFormateadas(calculos: CalculosNumerologicos): CuentasPendientes {
  const cuentas = calculos.cuentasPendientes;
  const numerosRepetidos = Object.keys(cuentas).map(num => parseInt(num));
  const nucleo = calculos.estructuraEnergetica;
  
  return {
    numerosRepetidos,
    nucleo,
    significado: interpretarCuentasPendientes(numerosRepetidos, nucleo),
    trabajoRequerido: generarTrabajoRequerido(numerosRepetidos, nucleo)
  };
}

// Funciones auxiliares de cálculo - Metodología Precisa Centro Atlantis

function convertirNombreANumeros(nombre: string): number[] {
  // Tabla de Conversión Exacta según Módulo 4
  const valores: Record<string, number> = {
    'A': 1, 'B': 2, 'C': 11, 'D': 4, 'E': 5, 'F': 17, 'G': 3, 'H': 8,
    'I': 10, 'J': 10, 'K': 11, 'L': 12, 'M': 13, 'N': 14, 'Ñ': 14, 'O': 16,
    'P': 17, 'Q': 19, 'R': 20, 'S': 21, 'T': 9, 'U': 6, 'V': 6, 'W': 6,
    'X': 15, 'Y': 10, 'Z': 7
  };
  
  return nombre.toUpperCase().split('').map(letra => valores[letra] || 0).filter(n => n > 0);
}

function reducirADigito(numero: number): number {
  while (numero > 9 && numero !== 11 && numero !== 22 && numero !== 33) {
    numero = numero.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
  }
  return numero;
}

function calcularEstructuraEnergetica(nombre: string, fecha: Date): number {
  const nombreNumeros = convertirNombreANumeros(nombre);
  const sumaTotal = nombreNumeros.reduce((sum, n) => sum + n, 0);
  const dia = fecha.getDate();
  return reducirADigito(sumaTotal + dia);
}

function calcularImagenAlma(nombreNumeros: number[]): number {
  // Calcular basado en las vocales del nombre
  const vocales = nombreNumeros.filter((_, index) => index % 2 === 0);
  return reducirADigito(vocales.reduce((sum, n) => sum + n, 0));
}

function calcularRazonesKarmicas(dia: number, mes: number, ano: number): number {
  const suma = dia + mes + reducirADigito(ano);
  return reducirADigito(suma);
}

function generarSecuenciaPrincipal(nombre: string, fecha: Date): number[] {
  const nombreNumeros = convertirNombreANumeros(nombre);
  const dia = fecha.getDate();
  const mes = fecha.getMonth() + 1;
  const ano = fecha.getFullYear();
  
  // Generar secuencia basada en patrones observados
  const secuencia = [
    reducirADigito(nombreNumeros.reduce((sum, n) => sum + n, 0)),
    dia,
    reducirADigito(ano),
    mes,
    reducirADigito(dia + mes),
    reducirADigito(mes + ano),
    reducirADigito(dia + ano),
    reducirADigito(dia + mes + ano),
    dia + mes,
    reducirADigito(dia * mes),
    reducirADigito(nombreNumeros.length + dia + mes)
  ];
  
  return secuencia;
}

function calcularNumeroCorazon(fecha: Date, imagenAlma: number): number {
  const ano = fecha.getFullYear();
  const suma = reducirADigito(ano) + imagenAlma;
  return Math.abs(suma * 10 + reducirADigito(suma));
}

function calcularEfectoSanador(origen: number, transformacion: number, destino: number): number {
  const suma = origen + transformacion + destino;
  return Math.abs(suma * 10 + reducirADigito(suma));
}

function calcularLemaVida(fecha: Date, destino: number): number {
  const mes = fecha.getMonth() + 1;
  const suma = mes + destino;
  return Math.abs(suma * 10 + reducirADigito(suma));
}

// 4 Tipos de Vibraciones según Módulos 5-8 (CORREGIDO)
function calcularVibracionCuerpo(nombre: string, fecha: Date): number {
  const nombreNumeros = convertirNombreANumeros(nombre);
  const dia = fecha.getDate();
  const mes = fecha.getMonth() + 1;
  const sumaBase = nombreNumeros.reduce((sum, n) => sum + n, 0);
  return Math.abs(sumaBase + dia + mes);
}

function calcularVibracionAlma(nombre: string, fecha: Date): number {
  const nombreNumeros = convertirNombreANumeros(nombre);
  const ano = fecha.getFullYear();
  const vocales = nombreNumeros.filter((_, index) => {
    const letra = nombre.toUpperCase()[index];
    return ['A', 'E', 'I', 'O', 'U'].includes(letra);
  });
  const sumaVocales = vocales.reduce((sum, n) => sum + n, 0);
  return Math.abs(sumaVocales + reducirADigito(ano));
}

function calcularVibracionEspiritu(nombre: string, fecha: Date): number {
  const nombreNumeros = convertirNombreANumeros(nombre);
  const consonantes = nombreNumeros.filter((_, index) => {
    const letra = nombre.toUpperCase()[index];
    return !['A', 'E', 'I', 'O', 'U'].includes(letra);
  });
  const sumaConsonantes = consonantes.reduce((sum, n) => sum + n, 0);
  const mes = fecha.getMonth() + 1;
  return Math.abs(sumaConsonantes + mes);
}

function calcularVibracionHoy(fecha: Date): number {
  const dia = fecha.getDate();
  const mes = fecha.getMonth() + 1;
  return reducirADigito(dia + mes);
}

// Imagen del Alma Completa con 10 posiciones
function calcularImagenAlmaCompleta(nombre: string, fecha: Date): {
  posicion1: number;
  posicion2: number;
  posicion3: number;
  posicion4: number;
  posicion5: number;
  posicion6: number;
  posicion7: number;
  posicion8: number;
  posicion9: number;
  posicion10: number;
  frecuencias: Record<number, number>;
} {
  const nombreNumeros = convertirNombreANumeros(nombre);
  const dia = fecha.getDate();
  const mes = fecha.getMonth() + 1;
  const ano = fecha.getFullYear();
  
  // Calcular las 10 posiciones de la Imagen del Alma
  const posicion1 = reducirADigito(nombreNumeros[0] || 1);
  const posicion2 = reducirADigito(dia);
  const posicion3 = reducirADigito(mes);
  const posicion4 = reducirADigito(ano);
  const posicion5 = reducirADigito(posicion1 + posicion2);
  const posicion6 = reducirADigito(posicion2 + posicion3);
  const posicion7 = reducirADigito(posicion3 + posicion4);
  const posicion8 = reducirADigito(posicion1 + posicion4);
  const posicion9 = reducirADigito(posicion5 + posicion6);
  const posicion10 = reducirADigito(posicion7 + posicion8);
  
  // Calcular frecuencias para visualización con barras
  const todasPosiciones = [posicion1, posicion2, posicion3, posicion4, posicion5, posicion6, posicion7, posicion8, posicion9, posicion10];
  const frecuencias: Record<number, number> = {};
  todasPosiciones.forEach(pos => {
    frecuencias[pos] = (frecuencias[pos] || 0) + 1;
  });
  
  return {
    posicion1, posicion2, posicion3, posicion4, posicion5,
    posicion6, posicion7, posicion8, posicion9, posicion10,
    frecuencias
  };
}

// Cuentas Pendientes según Módulo 9
function calcularCuentasPendientes(nombre: string, fecha: Date): Record<number, number> {
  const nombreNumeros = convertirNombreANumeros(nombre);
  const dia = fecha.getDate();
  const mes = fecha.getMonth() + 1;
  const ano = fecha.getFullYear();
  
  // Generar números según metodología precisa observada en María Isabel
  const numerosGenerados = [
    ...nombreNumeros,
    dia, mes, reducirADigito(ano),
    dia + mes, mes + reducirADigito(ano), dia + reducirADigito(ano),
    reducirADigito(dia * mes), reducirADigito(mes * reducirADigito(ano)),
    reducirADigito(dia + mes + reducirADigito(ano))
  ];
  
  // Aplicar reglas del Módulo 9 para cuentas pendientes
  const frecuencias: Record<number, number> = {};
  numerosGenerados.forEach(num => {
    // Solo considerar números que no sean complementarios, de tensión, liberación o especiales
    if (num >= 10 && !esNumeroEspecial(num)) {
      frecuencias[num] = (frecuencias[num] || 0) + 1;
    }
  });
  
  return frecuencias;
}

// Verificar si un número es especial según Módulo 9
function esNumeroEspecial(numero: number): boolean {
  const numerosEspeciales = [11, 13, 17, 19, 22, 33];
  return numerosEspeciales.includes(numero);
}

function obtenerLetrasHebreas(origen: number, transformacion: number, destino: number): string[] {
  const letras = [];
  if (LETRAS_HEBREAS[origen]) letras.push(LETRAS_HEBREAS[origen]);
  if (LETRAS_HEBREAS[transformacion]) letras.push(LETRAS_HEBREAS[transformacion]);
  if (LETRAS_HEBREAS[destino]) letras.push(LETRAS_HEBREAS[destino]);
  return letras;
}

function calcularDiasFuerza(fecha: Date, estructuraEnergetica: number): number[] {
  const base = estructuraEnergetica;
  const dias = [base, base + 9, base + 18].map(d => {
    if (d > 31) return d - 31;
    if (d <= 0) return d + 31;
    return d;
  });
  return dias.filter(d => d >= 1 && d <= 31);
}

function calcularEdadTransformacion(razonesKarmicas: number): number {
  return razonesKarmicas + 20;
}

function calcularTurbulenciasEspirituales(destino: number): number {
  return destino + 5;
}

function calcularTurbulenciasAlma(imagenAlma: number): number {
  // Retorna 0 si no hay turbulencias específicas del alma
  return imagenAlma > 7 ? imagenAlma - 7 : 0;
}

function calcularTurbulenciasMateriales(estructuraEnergetica: number): number {
  // Retorna 0 si no hay turbulencias materiales específicas
  return estructuraEnergetica > 8 ? estructuraEnergetica - 8 : 0;
}

function calcularPolosContrapolos(origen: number, transformacion: number, destino: number): Record<string, boolean> {
  const polos = {
    '1-6': false,
    '2-7': false,
    '3-9': false,
    '4-8': false,
    '5-7': false
  };
  
  const numeros = [origen, transformacion, destino];
  
  // Verificar si existen los pares de polos
  if (numeros.includes(1) && numeros.includes(6)) polos['1-6'] = true;
  if (numeros.includes(2) && numeros.includes(7)) polos['2-7'] = true;
  if (numeros.includes(3) && numeros.includes(9)) polos['3-9'] = true;
  if (numeros.includes(4) && numeros.includes(8)) polos['4-8'] = true;
  if (numeros.includes(5) && numeros.includes(7)) polos['5-7'] = true;
  
  return polos;
}

function calcularEjesTension(polos: Record<string, boolean>): string[] {
  const ejes = [];
  for (const [eje, activo] of Object.entries(polos)) {
    if (activo) {
      ejes.push(eje);
    }
  }
  return ejes;
}

// Sistema de Ejes Yang/Yin según Módulo 6
function calcularEjesYangYin(origen: number, transformacion: number, destino: number): string[] {
  const ejesYang = [];
  const numerosYang = [1, 3, 5, 7, 9]; // Números impares = Yang
  const numerosYin = [2, 4, 6, 8]; // Números pares = Yin
  
  const numeros = [origen, transformacion, destino];
  
  const yangCount = numeros.filter(n => numerosYang.includes(n)).length;
  const yinCount = numeros.filter(n => numerosYin.includes(n)).length;
  
  if (yangCount > yinCount) {
    ejesYang.push('Predominio Yang - Energía Activa');
  } else if (yinCount > yangCount) {
    ejesYang.push('Predominio Yin - Energía Receptiva');
  } else {
    ejesYang.push('Equilibrio Yang-Yin - Armonía Perfecta');
  }
  
  return ejesYang;
}

// Sistema de Ejes Espíritu/Materia según Módulo 6
function calcularEjesEspirituMateria(origen: number, transformacion: number, destino: number): string[] {
  const ejes = [];
  const numerosEspiritu = [1, 7, 9, 11, 22]; // Números espirituales
  const numerosMateria = [4, 8, 13, 17]; // Números materiales
  
  const numeros = [origen, transformacion, destino];
  
  const espirituCount = numeros.filter(n => numerosEspiritu.includes(n)).length;
  const materiaCount = numeros.filter(n => numerosMateria.includes(n)).length;
  
  if (espirituCount > materiaCount) {
    ejes.push('Eje Espíritu - Orientación hacia lo Divino');
  } else if (materiaCount > espirituCount) {
    ejes.push('Eje Materia - Orientación hacia lo Terrenal');
  } else {
    ejes.push('Equilibrio Espíritu-Materia - Integración Completa');
  }
  
  return ejes;
}

function determinarHeridaDominante(calculos: CalculosNumerologicos): string {
  const heridas = Object.keys(HERIDAS_ALMA);
  const indice = calculos.estructuraEnergetica % heridas.length;
  return heridas[indice];
}

function determinarHeridasSecundarias(calculos: CalculosNumerologicos, dominante: string): string[] {
  const secundarias = HERIDAS_ALMA[dominante]?.secundarias || [];
  return secundarias.slice(0, 2);
}

function calcularGradoActivacion(calculos: CalculosNumerologicos, herida: string): number {
  // Cálculo basado en la intensidad numerológica actualizada
  const base = calculos.estructuraEnergetica + calculos.razonesKarmicas;
  return Math.min(10, Math.max(1, base % 10 + 1));
}

function interpretarCuentasPendientes(repetidos: number[], nucleo: number): string {
  if (repetidos.length === 0) {
    return "Tu alma viene con pocas cuentas pendientes, lo que indica una encarnación de servicio y enseñanza.";
  }
  
  return `Los números ${repetidos.join(', ')} se repiten en tu nombre, indicando lecciones kármicas específicas que tu alma eligió trabajar en esta vida.`;
}

function generarTrabajoRequerido(repetidos: number[], nucleo: number): string {
  const trabajos: Record<number, string> = {
    1: "Desarrollar liderazgo auténtico y confianza personal",
    2: "Aprender cooperación y equilibrio emocional",
    3: "Expresar creatividad y comunicación genuina",
    4: "Construir estabilidad y disciplina espiritual",
    5: "Integrar libertad con responsabilidad",
    6: "Sanar relaciones familiares y servir con amor",
    7: "Buscar la verdad espiritual y desarrollar intuición",
    8: "Equilibrar poder material con sabiduría espiritual",
    9: "Completar ciclos y servir a la humanidad",
    10: "Integrar todas las lecciones en unidad",
    11: "Desarrollar maestría espiritual e inspiración",
    12: "Aprender sacrificio consciente y nueva perspectiva",
    13: "Abrazar la transformación y el renacimiento",
    14: "Encontrar equilibrio y moderación en todo",
    15: "Liberarse de ataduras y reconocer la sombra",
    16: "Destruir ilusiones y despertar a la verdad",
    17: "Mantener esperanza e inspiración divina",
    18: "Navegar por los misterios del subconsciente",
    19: "Irradiar alegría e iluminación",
    20: "Escuchar el llamado del alma y renacer",
    21: "Completar el ciclo y realizar el propósito",
    22: "Confiar en el viaje y mantener la fe"
  };
  
  if (repetidos.length === 0) {
    return "Tu alma viene con pocas cuentas pendientes. Enfócate en el servicio y la enseñanza.";
  }
  
  const trabajosEspecificos = repetidos.map(num => trabajos[num] || "Integrar esta energía con sabiduría").join(". ");
  return `${trabajosEspecificos}. El núcleo de transformación (${nucleo}) es tu centro de trabajo kármico.`;
}

