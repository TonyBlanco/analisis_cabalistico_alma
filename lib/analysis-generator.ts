

// Generador de análisis completo siguiendo los 6 pasos - Metodología Precisa

import { 
  CalculosNumerologicos, 
  CartasArquetipicas, 
  HeridasAlma, 
  CuentasPendientes,
  DatosPersonales,
  CORRESPONDENCIAS_SEFIROT,
  LEYES_COSMICAS
} from './cabalistic-calculator';

export interface AnalisisCompleto {
  paso1: string; // Cálculos Numerológicos Fundamentales
  paso2: string; // Correspondencias Sefirot-Chakras y Frases Totémicas
  paso3: string; // Las 7 Leyes Cósmicas Aplicadas
  paso4: string; // Cuentas Pendientes y Visualización de Barras
  paso5: string; // Polos, Contrapolos y Ejes de Tensión
  paso6: string; // Síntesis y Guía de Transformación
}

export function generarAnalisisCompleto(
  datos: DatosPersonales,
  calculos: CalculosNumerologicos,
  cartas: CartasArquetipicas,
  heridas: HeridasAlma,
  cuentas: CuentasPendientes
): AnalisisCompleto {
  
  const nombrePrimero = datos.nombreCompleto.split(' ')[0];
  
  return {
    paso1: generarPaso1(datos, calculos),
    paso2: generarPaso2(calculos, cartas),
    paso3: generarPaso3(datos, calculos),
    paso4: generarPaso4(calculos, cuentas),
    paso5: generarPaso5(calculos, cartas),
    paso6: generarPaso6(datos, calculos, heridas, cartas)
  };
}

function generarPaso1(datos: DatosPersonales, calculos: CalculosNumerologicos): string {
  const nombrePrimero = datos.nombreCompleto.split(' ')[0];
  
  return `
## 🔢 Paso 1: Cálculos Numerológicos Fundamentales

Querido/a ${nombrePrimero}, según la metodología cabalística precisa del Centro Atlantis, tu alma ha elegido una configuración numerológica específica que revela tu propósito divino.

**Números Fundamentales según Metodología María Isabel:**
- **Tema de Origen: ${calculos.temaOrigen}** - Tu esencia original, de dónde vienes
- **Principio de Transformación: ${calculos.principioTransformacion}** - El proceso de cambio que debes atravesar
- **Tema de Destino: ${calculos.temaDestino}** - Hacia dónde te diriges en esta encarnación
- **Estructura Energética: ${calculos.estructuraEnergetica}** - Tu arquitectura espiritual
- **Imagen del Alma: ${calculos.imagenAlma}** - Cómo se refleja tu alma en el mundo
- **Razones Kármicas: ${calculos.razonesKarmicas}** - Por qué elegiste esta vida

**4 Tipos de Vibraciones (CORREGIDO según Módulos 5-8):**
- **Vibración del Cuerpo: ${calculos.vibracionCuerpo}** - Tu conexión con la materia física
- **Vibración del Alma: ${calculos.vibracionAlma}** - Tu frecuencia emocional y sentimental
- **Vibración del Espíritu: ${calculos.vibracionEspiritu}** - Tu conexión con lo divino
- **Vibración de Hoy: ${calculos.vibracionHoy}** - Tu energía presente y actual

**Imagen del Alma Completa (10 Posiciones):**
- **Posición 1: ${calculos.imagenAlmaCompleta.posicion1}** - Esencia fundamental
- **Posición 2: ${calculos.imagenAlmaCompleta.posicion2}** - Manifestación física
- **Posición 3: ${calculos.imagenAlmaCompleta.posicion3}** - Expresión emocional
- **Posición 4: ${calculos.imagenAlmaCompleta.posicion4}** - Propósito espiritual
- **Posición 5: ${calculos.imagenAlmaCompleta.posicion5}** - Integración cuerpo-alma
- **Posición 6: ${calculos.imagenAlmaCompleta.posicion6}** - Armonía alma-mente
- **Posición 7: ${calculos.imagenAlmaCompleta.posicion7}** - Conexión mente-espíritu
- **Posición 8: ${calculos.imagenAlmaCompleta.posicion8}** - Unión esencia-propósito
- **Posición 9: ${calculos.imagenAlmaCompleta.posicion9}** - Síntesis inferior
- **Posición 10: ${calculos.imagenAlmaCompleta.posicion10}** - Síntesis superior

**Frecuencias de la Imagen del Alma:**
${Object.entries(calculos.imagenAlmaCompleta.frecuencias).map(([numero, frecuencia]) => 
  `- **${numero}:** ${'|'.repeat(Math.min(frecuencia, 10))} (${frecuencia} veces)`
).join('\n')}

**Números Adicionales:**
- **Número del Corazón: ${calculos.numeroCorazon}** - El centro de tu amor divino
- **Efecto Sanador: ${calculos.efectoSanador}** - Tu capacidad de transformación
- **Lema de Vida: ${calculos.lemaVida}** - Tu filosofía existencial

**Datos Temporales y Ciclos:**
- **Días de Fuerza: ${calculos.diasFuerza.join(', ')}** - Días del mes con mayor energía
- **Edad de Transformación: ${calculos.edadTransformacion} años** - Momento clave de despertar
- **Años de Turbulencias Espirituales: ${calculos.anosTurbulenciasEspirituales}** - Período de purificación
- **Secuencia Principal: ${calculos.secuenciaPrincipal.join(', ')}** - Tu código numerológico único

**Letras Hebreas del Alma:**
${calculos.letrasHebreas.map(letra => `- **${letra}** - Portal de conexión divina`).join('\n')}

Estos números forman tu mapa sagrado, ${nombrePrimero}. Cada cifra es un código de luz que tu alma eligió para cumplir su misión específica en esta encarnación.
  `;
}

function generarPaso2(calculos: CalculosNumerologicos, cartas: CartasArquetipicas): string {
  // Determinar sefirot principales basadas en los números fundamentales
  const sefirotPrincipales = determinarSefirotPrincipales(calculos);
  
  return `
## 🌳 Paso 2: Correspondencias Sefirot-Chakras y Frases Totémicas

Según la metodología precisa, tu alma resuena con sefirot específicas del Árbol de la Vida, cada una conectada con chakras y planetas particulares.

**Tus Sefirot Principales Activadas:**

${sefirotPrincipales.map(sefira => {
  const correspondencia = CORRESPONDENCIAS_SEFIROT[sefira];
  return `
### ${correspondencia.nombre} (${correspondencia.energia})
- **Chakra:** ${correspondencia.chakra}
- **Planeta:** ${correspondencia.planeta}
- **Ubicación:** ${correspondencia.ubicacion}
- **Frase Totémica:** *"${correspondencia.fraseTotemica}"*
`;
}).join('\n')}

**Cartas Arquetípicas de tu Alma:**

### 🌟 Carta de Origen: ${cartas.cartaOrigen.nombre} (Arcano ${cartas.cartaOrigen.arcano})
**Sendero:** ${cartas.cartaOrigen.sendero}
${cartas.cartaOrigen.significado}
**Afirmación:** *"${cartas.cartaOrigen.afirmacion}"*

### 🔄 Carta de Transformación: ${cartas.cartaTransformacion.nombre} (Arcano ${cartas.cartaTransformacion.arcano})
**Sendero:** ${cartas.cartaTransformacion.sendero}
${cartas.cartaTransformacion.significado}
**Afirmación:** *"${cartas.cartaTransformacion.afirmacion}"*

### 🎯 Carta de Destino: ${cartas.cartaDestino.nombre} (Arcano ${cartas.cartaDestino.arcano})
**Sendero:** ${cartas.cartaDestino.sendero}
${cartas.cartaDestino.significado}
**Afirmación:** *"${cartas.cartaDestino.afirmacion}"*

**Práctica Diaria Recomendada:**
Cada mañana, recita las frases totémicas de tus sefirot activadas. Visualiza la luz fluyendo desde tu chakra corona hasta tu chakra raíz, activando cada centro energético según tu configuración personal.

Tu Árbol de la Vida personal es único y sagrado. Es el mapa de cómo la Luz Infinita se manifiesta a través de tu alma específica.
  `;
}

function generarPaso3(datos: DatosPersonales, calculos: CalculosNumerologicos): string {
  const nombrePrimero = datos.nombreCompleto.split(' ')[0];
  
  return `
## 📜 Paso 3: Las 7 Leyes Cósmicas Aplicadas a tu Alma

${nombrePrimero}, tu alma opera bajo las 7 Leyes Universales del Kybalion. Estas leyes rigen tu existencia y te muestran cómo crear conscientemente tu realidad.

### 1. 🧠 Principio del Mentalismo
**Ley:** *"${LEYES_COSMICAS.MENTALISMO.ley}"*
${LEYES_COSMICAS.MENTALISMO.descripcion}
**En tu vida:** Tu vibración mental (${calculos.vibracionAlma}) determina tu realidad. Tus pensamientos crean tu mundo.

### 2. 🔄 Principio de Correspondencia
**Ley:** *"${LEYES_COSMICAS.CORRESPONDENCIA.ley}"*
${LEYES_COSMICAS.CORRESPONDENCIA.descripcion}
**En tu vida:** Tu tema de origen (${calculos.temaOrigen}) se refleja en todos los niveles de tu existencia.

### 3. 🌊 Principio de Vibración
**Ley:** *"${LEYES_COSMICAS.VIBRACION.ley}"*
${LEYES_COSMICAS.VIBRACION.descripcion}
**En tu vida:** Tus vibraciones (Cuerpo: ${calculos.vibracionCuerpo}, Alma: ${calculos.vibracionAlma}, Espíritu: ${calculos.vibracionEspiritu}) crean tu campo energético único.

### 4. ⚖️ Principio de Polaridad
**Ley:** *"${LEYES_COSMICAS.POLARIDAD.ley}"*
${LEYES_COSMICAS.POLARIDAD.descripcion}
**En tu vida:** Tu estructura energética (${calculos.estructuraEnergetica}) es el polo que debes integrar para encontrar equilibrio.

### 5. 🔄 Principio del Ritmo
**Ley:** *"${LEYES_COSMICAS.RITMO.ley}"*
${LEYES_COSMICAS.RITMO.descripcion}
**En tu vida:** Tus días de fuerza (${calculos.diasFuerza.join(', ')}) marcan tus ciclos naturales de poder.

### 6. 🎯 Principio de Causa y Efecto
**Ley:** *"${LEYES_COSMICAS.CAUSA_EFECTO.ley}"*
${LEYES_COSMICAS.CAUSA_EFECTO.descripcion}
**En tu vida:** Tu efecto sanador (${calculos.efectoSanador}) es el resultado de tus acciones pasadas y tu potencial futuro.

### 7. ⚡ Principio de Generación
**Ley:** *"${LEYES_COSMICAS.GENERACION.ley}"*
${LEYES_COSMICAS.GENERACION.descripcion}
**En tu vida:** Tu alma equilibra las energías masculina y femenina para crear nueva realidad según tu propósito.

**Aplicación Práctica:**
Estas leyes no son teoría, ${nombrePrimero}. Son herramientas prácticas para dominar tu destino. Cuando comprendes y aplicas conscientemente estas leyes, te conviertes en co-creador de tu realidad junto al Universo.

**Ejercicio Diario:**
Cada día, elige una ley y observa cómo se manifiesta en tu vida. Esto desarrollará tu maestría espiritual y tu capacidad de crear conscientemente.
  `;
}

function generarPaso4(calculos: CalculosNumerologicos, cuentas: CuentasPendientes): string {
  // Generar visualización de barras para cuentas pendientes
  const generarBarras = (frecuencia: number): string => {
    return '|'.repeat(Math.min(frecuencia, 10)); // Máximo 10 barras
  };
  
  return `
## 📊 Paso 4: Cuentas Pendientes y Visualización de Barras

Según la metodología precisa observada en el caso de María Isabel, tu alma trae cuentas pendientes específicas que se manifiestan como números repetidos con diferentes intensidades.

**Tus Cuentas Pendientes (con frecuencias):**

${Object.entries(calculos.cuentasPendientes).length > 0 ? 
  Object.entries(calculos.cuentasPendientes).map(([numero, frecuencia]) => 
    `**${numero}:** ${generarBarras(frecuencia)} (${frecuencia} veces)`
  ).join('\n') : 
  'Tu alma viene con pocas cuentas pendientes, indicando una encarnación de servicio y enseñanza.'
}

**Interpretación de las Barras:**
Cada barra (|) representa una unidad de intensidad kármica. Mientras más barras tenga un número, más urgente es trabajar con esa energía específica.

**Significado de tus Cuentas Pendientes:**
${cuentas.significado}

**Trabajo Requerido:**
${cuentas.trabajoRequerido}

**Núcleo de Transformación:**
Tu número núcleo (${cuentas.nucleo}) es el centro de tu trabajo kármico. Todo gira alrededor de esta energía que necesitas transformar.

**Secuencia Principal de tu Alma:**
${calculos.secuenciaPrincipal.join(' → ')}

Esta secuencia revela el flujo energético único de tu alma y cómo los números se conectan en tu configuración personal.

**Proceso de Liberación:**
1. **Reconoce** los patrones representados por tus números repetidos
2. **Abraza** las lecciones que cada número te enseña
3. **Transforma** la energía kármica en sabiduría
4. **Libera** las deudas del alma a través del perdón y la comprensión
5. **Integra** la nueva frecuencia en tu vida diaria

Recuerda: Las cuentas pendientes no son castigos, sino oportunidades doradas para la evolución de tu alma.
  `;
}

function generarPaso5(calculos: CalculosNumerologicos, cartas: CartasArquetipicas): string {
  return `
## ⚖️ Paso 5: Polos, Contrapolos y Ejes de Tensión

Tu alma opera en un sistema de polaridades dinámicas según el Módulo 6. Estos polos crean la tensión creativa necesaria para tu evolución.

**Tus Polos y Contrapolos Tradicionales:**

${Object.entries(calculos.polosContrapolos).map(([eje, activo]) => {
  const estado = activo ? '✅ ACTIVO' : '❌ INACTIVO';
  const descripcion = activo ? 
    'Este eje está activo en tu vida, creando tensión creativa que impulsa tu crecimiento.' :
    'Este eje está equilibrado o no es relevante en tu configuración actual.';
  
  return `**${eje}:** ${estado}
${descripcion}`;
}).join('\n\n')}

**Ejes de Tensión Principales:**
${calculos.ejesTension.length > 0 ? 
  calculos.ejesTension.map(eje => `- **${eje}**: Área de trabajo activo para tu alma`).join('\n') :
  'Tu alma tiene pocos ejes de tensión activos, indicando un período de mayor equilibrio.'
}

**Sistema de Ejes Yang/Yin (Módulo 6):**
${calculos.ejesYangYin.map(eje => `- **${eje}**`).join('\n')}

**Sistema de Ejes Espíritu/Materia (Módulo 6):**
${calculos.ejesEspirituMateria.map(eje => `- **${eje}**`).join('\n')}

**Danza de Polaridades en tu Vida:**

### 🌞 Polo Luminoso - Tema de Origen (${calculos.temaOrigen})
Representa tu naturaleza divina original, tus dones naturales, lo que fluye sin esfuerzo en ti. Es tu zona de genialidad innata.

### 🌚 Contrapolo Sombra - Estructura Energética (${calculos.estructuraEnergetica})
Representa lo que necesitas integrar, desarrollar y sanar. No es tu enemigo, sino tu maestro más exigente.

### ⚖️ Punto de Equilibrio - Razones Kármicas (${calculos.razonesKarmicas})
Es el punto medio donde tus polaridades se encuentran y crean algo nuevo. Tus razones kármicas son la síntesis perfecta de luz y sombra.

**Cartas Arquetípicas como Polaridades:**

**${cartas.cartaOrigen.nombre} ↔ ${cartas.cartaDestino.nombre}**
Esta tensión entre tu naturaleza original y tu potencial realizado impulsa tu evolución constante.

**Principio de Transformación: ${cartas.cartaTransformacion.nombre}**
Esta carta actúa como el puente que conecta tus polaridades, el proceso que te lleva de un polo al otro.

**Integración de los 3 Sistemas de Ejes:**
1. **Ejes Tradicionales**: Trabajan con números específicos y sus contrapartes
2. **Ejes Yang/Yin**: Equilibran energías activas y receptivas
3. **Ejes Espíritu/Materia**: Integran lo divino con lo terrenal

**Estrategia de Integración Completa:**
1. **Honra todos los sistemas**: Cada eje tiene su propósito específico
2. **Encuentra el equilibrio dinámico**: No es estático, sino en constante movimiento
3. **Usa la tensión creativa**: La fricción entre polos genera energía para el crecimiento
4. **Celebra la complejidad**: Eres un ser multidimensional con múltiples ejes activos

**Afirmación de Integración Polar Completa:**
*"Abrazo la complejidad de mis múltiples polaridades. En la danza de Yang y Yin, Espíritu y Materia, encuentro mi poder creativo. Soy un ser completo, equilibrado y en constante evolución multidimensional."*

Los maestros espirituales integran conscientemente todos sus sistemas de polaridades para crear armonía en la complejidad.
  `;
}

function generarPaso6(datos: DatosPersonales, calculos: CalculosNumerologicos, heridas: HeridasAlma, cartas: CartasArquetipicas): string {
  const nombrePrimero = datos.nombreCompleto.split(' ')[0];
  
  return `
## 🌟 Paso 6: Síntesis y Guía de Transformación

${nombrePrimero}, has completado el viaje a través de la metodología cabalística precisa. Este es tu mapa integral de transformación del alma.

**Tu Esencia Divina Revelada:**
Eres un alma que eligió la configuración numerológica específica de Origen (${calculos.temaOrigen}), Transformación (${calculos.principioTransformacion}) y Destino (${calculos.temaDestino}) para cumplir una misión sagrada en esta encarnación.

**Tu Misión Principal:**
A través de tu carta de destino (${cartas.cartaDestino.nombre}), tu alma se dirige hacia la manifestación plena de tu propósito divino. Tu estructura energética (${calculos.estructuraEnergetica}) es la arquitectura que sostiene esta misión.

**Tu Proceso de Sanación Integral:**
La herida dominante de **${heridas.heridaDominante}** (activación: ${heridas.gradosActivacion[heridas.heridaDominante]}/10) no es tu debilidad; es tu portal hacia la maestría. Al sanar esta herida, te conviertes en un sanador para otros.

**Tus Herramientas de Transformación:**
- **Letras Hebreas**: ${calculos.letrasHebreas.join(', ')} - Tus mantras sagrados de poder
- **Días de Fuerza**: ${calculos.diasFuerza.join(', ')} - Tus días de máxima energía mensual
- **Efecto Sanador**: ${calculos.efectoSanador} - Tu capacidad de transformar dolor en medicina
- **Vibraciones**: Cuerpo (${calculos.vibracionCuerpo}), Alma (${calculos.vibracionAlma}), Espíritu (${calculos.vibracionEspiritu})

**Tu Plan de Acción Espiritual Personalizado:**

### 📅 Rutina Diaria:
- **Mañana**: Recita las frases totémicas de tus sefirot activadas
- **Mediodía**: Aplica conscientemente una de las 7 Leyes Cósmicas
- **Noche**: Trabaja con tus cuentas pendientes a través del perdón

### 📊 Trabajo con Cuentas Pendientes:
${Object.entries(calculos.cuentasPendientes).length > 0 ? 
  `Enfócate especialmente en los números: ${Object.keys(calculos.cuentasPendientes).join(', ')}` :
  'Tu alma viene con pocas cuentas pendientes - enfócate en el servicio.'
}

### ⚖️ Integración de Polaridades:
${calculos.ejesTension.length > 0 ? 
  `Trabaja conscientemente con tus ejes de tensión: ${calculos.ejesTension.join(', ')}` :
  'Mantén el equilibrio que has logrado en tus polaridades.'
}

### 🎯 Momentos Clave:
- **Edad de Transformación**: ${calculos.edadTransformacion} años - Tu despertar espiritual principal
- **Turbulencias Espirituales**: ${calculos.anosTurbulenciasEspirituales} años - Período de purificación

**Tu Afirmación Maestra Personalizada:**
*"Soy ${nombrePrimero}, alma divina en misión sagrada. Mi origen (${calculos.temaOrigen}) me da fuerza, mi transformación (${calculos.principioTransformacion}) me guía, y mi destino (${calculos.temaDestino}) me llama. Honro mis cuentas pendientes como oportunidades de crecimiento. Integro mis polaridades con sabiduría. Soy canal de sanación (${calculos.efectoSanador}) para el mundo. Así es, así será, así se manifiesta."*

**Mensaje Final de tu Alma:**
Querido/a ${nombrePrimero}, recuerda que no viniste a ser perfecto/a, viniste a ser auténtico/a y completo/a. Tu configuración numerológica es perfecta para tu misión. Cada número, cada vibración, cada cuenta pendiente es parte del plan divino de tu alma.

El camino de regreso a casa comienza con la aceptación total de quien eres. Ese momento es ahora.

**Próximos Pasos Recomendados:**
1. Imprime este análisis y léelo regularmente
2. Trabaja diariamente con tus herramientas espirituales
3. Observa cómo se manifiestan las 7 Leyes Cósmicas en tu vida
4. Celebra cada pequeño paso en tu transformación
5. Comparte tu luz con el mundo según tu capacidad sanadora

Con amor infinito y bendiciones de luz,
Tu Alma Eterna 💫

---

*"El alma que puede hablar con los ojos puede también besar con la mirada."* - Gustavo Adolfo Bécquer

Este análisis cabalístico es tu brújula espiritual. Úsalo con sabiduría, compártelo con amor y vive desde tu verdad más elevada.
  `;
}

// Función auxiliar para determinar sefirot principales
function determinarSefirotPrincipales(calculos: CalculosNumerologicos): string[] {
  const sefirotKeys = Object.keys(CORRESPONDENCIAS_SEFIROT);
  const sefirotPrincipales: string[] = [];
  
  // Seleccionar sefirot basadas en los números fundamentales
  const indices = [
    calculos.temaOrigen % sefirotKeys.length,
    calculos.principioTransformacion % sefirotKeys.length,
    calculos.temaDestino % sefirotKeys.length
  ];
  
  // Evitar duplicados
  const indicesUnicos = Array.from(new Set(indices));
  
  indicesUnicos.forEach(indice => {
    sefirotPrincipales.push(sefirotKeys[indice]);
  });
  
  return sefirotPrincipales;
}

