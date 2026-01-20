/**
 * Pitagoras Method - Symbolic Adapter
 *
 * Adaptador al sistema simbólico
 * Traduce salida matemática → estado simbólico estándar compatible con Visual Core
 *
 * NO persiste, NO interpreta, NO cruza con otros métodos
 */
import { calcularAnalisisPitagorico } from './pitagoras.rules';
import { obtenerSignificado, PITAGORAS_METADATA } from './pitagoras.tables';
/**
 * Generar análisis pitagórico completo
 * @param input - Datos de entrada (nombre y fecha)
 * @returns Resultado completo con significados simbólicos
 */
export function generarAnalisisPitagorico(input) {
    const { nombreCompleto, fechaNacimiento } = input;
    const { dia, mes, anio } = fechaNacimiento;
    // Ejecutar cálculos matemáticos puros
    const analisis = calcularAnalisisPitagorico(input);
    // Obtener significados simbólicos
    const esenciaSignificado = obtenerSignificado(analisis.esencia.reducido);
    const expresionSignificado = obtenerSignificado(analisis.expresion.reducido);
    const herenciaSignificado = obtenerSignificado(analisis.herencia.reducido);
    const caminoVidaSignificado = obtenerSignificado(analisis.caminoVida.reducido);
    // Construir casas con significados
    const casas = {};
    for (let i = 1; i <= 9; i++) {
        const casa = analisis.casasInclusion[i];
        casas[i] = {
            numero: i,
            conteo: casa.conteo,
            letras: casa.letras,
            significado: obtenerSignificado(i),
        };
    }
    // Construir resultado completo
    const resultado = {
        identidad: {
            nombreCompleto,
            fechaNacimiento: `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`,
        },
        numeros: {
            esencia: {
                ...analisis.esencia,
                significado: esenciaSignificado,
            },
            expresion: {
                ...analisis.expresion,
                significado: expresionSignificado,
            },
            herencia: {
                ...analisis.herencia,
                significado: herenciaSignificado,
            },
            caminoVida: {
                ...analisis.caminoVida,
                significado: caminoVidaSignificado,
                edadTransformacion: analisis.edadTransformacion,
            },
        },
        inclusion: {
            casas,
            ausencias: analisis.ausencias,
            dominantes: analisis.dominantes,
        },
        metadatos: {
            metodo: 'pitagoras',
            sistema: 'pitagorico',
            alfabeto: 'pitagorico',
            version: PITAGORAS_METADATA.version,
            timestamp: new Date().toISOString(),
        },
    };
    return resultado;
}
/**
 * Adaptar resultado pitagórico a estado simbólico normalizado
 * Compatible con Visual Core del sistema cabalístico
 * @param resultado - Resultado pitagórico completo
 * @returns Estado simbólico normalizado
 */
export function adaptarAEstadoSimbolico(resultado) {
    // Calcular pesos normalizados (0-1) para números principales
    // Peso mayor = relevancia mayor en el perfil numerológico
    const pesos = {
        esencia: 1.0, // Máxima relevancia (núcleo del ser)
        expresion: 0.85, // Alta relevancia (cómo se manifiesta)
        herencia: 0.9, // Muy alta relevancia (destino heredado)
        caminoVida: 0.95, // Casi máxima (propósito vital)
    };
    const primaryNumbers = [
        {
            key: 'esencia',
            label: 'Esencia/Alma',
            value: resultado.numeros.esencia.reducido,
            weight: pesos.esencia,
            meaning: resultado.numeros.esencia.significado,
        },
        {
            key: 'expresion',
            label: 'Expresión/Personalidad',
            value: resultado.numeros.expresion.reducido,
            weight: pesos.expresion,
            meaning: resultado.numeros.expresion.significado,
        },
        {
            key: 'herencia',
            label: 'Herencia/Destino',
            value: resultado.numeros.herencia.reducido,
            weight: pesos.herencia,
            meaning: resultado.numeros.herencia.significado,
        },
        {
            key: 'caminoVida',
            label: 'Camino de Vida',
            value: resultado.numeros.caminoVida.reducido,
            weight: pesos.caminoVida,
            meaning: resultado.numeros.caminoVida.significado,
        },
    ];
    // Construir mapa de inclusión normalizado
    const inclusionMap = {};
    for (let i = 1; i <= 9; i++) {
        const casa = resultado.inclusion.casas[i];
        inclusionMap[i] = {
            frequency: casa.conteo,
            isAbsent: resultado.inclusion.ausencias.includes(i),
            isDominant: resultado.inclusion.dominantes.includes(i),
        };
    }
    // Retornar estado simbólico normalizado
    return {
        methodId: 'pitagoras',
        methodName: 'Método Pitagórico',
        primaryNumbers,
        inclusionMap,
        rawData: resultado,
    };
}
/**
 * Pipeline completo: input → cálculo → adaptación
 * Esta es la función pública principal del adaptador
 * @param input - Datos de entrada
 * @returns Estado simbólico normalizado listo para consumir
 */
export function ejecutarMetodoPitagorico(input) {
    const resultado = generarAnalisisPitagorico(input);
    return adaptarAEstadoSimbolico(resultado);
}
