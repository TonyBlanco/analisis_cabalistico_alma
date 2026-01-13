import { calcularAnalisisGematriaStandard } from './rules';
import { GEMATRIA_STANDARD_METADATA } from './tables';
// Return type is intentionally loose (`any`) to allow reuse of Pitagoras UI contract without
// forcing literal method identifiers. Adapters return a compatible shape at runtime.
export function generarAnalisisGematriaStandard(input) {
    // Reuse rules to build a simple result object similar to Pitagoras
    return calcularAnalisisGematriaStandard(input);
}
export function adaptarAEstadoSimbolicoGematria(result) {
    const pesos = { esencia: 1, expresion: 0.9, herencia: 0.85, caminoVida: 0.8 };
    const primaryNumbers = [
        { key: 'esencia', label: 'Esencia', value: result.numeros?.esencia?.reducido ?? 0, weight: pesos.esencia, meaning: { numero: result.numeros?.esencia?.reducido ?? 0, titulo: 'Esencia', cualidad: '', descripcion: '' } },
        { key: 'expresion', label: 'Expresión', value: result.numeros?.expresion?.reducido ?? 0, weight: pesos.expresion, meaning: { numero: result.numeros?.expresion?.reducido ?? 0, titulo: 'Expresión', cualidad: '', descripcion: '' } },
        { key: 'herencia', label: 'Herencia', value: result.numeros?.herencia?.reducido ?? 0, weight: pesos.herencia, meaning: { numero: result.numeros?.herencia?.reducido ?? 0, titulo: 'Herencia', cualidad: '', descripcion: '' } },
        { key: 'caminoVida', label: 'Camino de Vida', value: result.numeros?.caminoVida?.reducido ?? 0, weight: pesos.caminoVida, meaning: { numero: result.numeros?.caminoVida?.reducido ?? 0, titulo: 'Camino de Vida', cualidad: '', descripcion: '' } },
    ];
    const inclusionMap = {};
    for (let i = 1; i <= 9; i++) {
        const casa = result.casasInclusion?.[i] ?? { conteo: 0 };
        inclusionMap[i] = { frequency: casa.conteo ?? 0, isAbsent: (result.ausencias || []).includes(i), isDominant: (result.dominantes || []).includes(i) };
    }
    return {
        methodId: GEMATRIA_STANDARD_METADATA.id,
        methodName: GEMATRIA_STANDARD_METADATA.name,
        primaryNumbers,
        inclusionMap,
        rawData: result,
    };
}
export function ejecutarMetodoGematriaStandard(input) {
    const res = generarAnalisisGematriaStandard(input);
    return adaptarAEstadoSimbolicoGematria(res);
}
