import { calcularAnalisisAtbash } from './rules';
import { ATBASH_METADATA } from './tables';
export function generarAnalisisAtbash(i) {
    return calcularAnalisisAtbash(i);
}
export function adaptarAEstadoSimbolicoAtbash(r) {
    const pk = [
        { key: 'esencia', label: 'Esencia', value: r.numeros.esencia.reducido, weight: 1, meaning: { numero: r.numeros.esencia.reducido, titulo: 'Esencia', cualidad: '', descripcion: '' } },
        { key: 'expresion', label: 'Expresión', value: r.numeros.expresion.reducido, weight: 0.9, meaning: { numero: r.numeros.expresion.reducido, titulo: 'Expresión', cualidad: '', descripcion: '' } },
        { key: 'herencia', label: 'Herencia', value: r.numeros.herencia.reducido, weight: 0.85, meaning: { numero: r.numeros.herencia.reducido, titulo: 'Herencia', cualidad: '', descripcion: '' } },
        { key: 'caminoVida', label: 'Camino de Vida', value: r.numeros.caminoVida.reducido, weight: 0.8, meaning: { numero: r.numeros.caminoVida.reducido, titulo: 'Camino', cualidad: '', descripcion: '' } },
    ];
    const inclusion = {};
    for (let i = 1; i <= 9; i++) {
        const c = r.casasInclusion?.[i] ?? { conteo: 0 };
        inclusion[i] = { frequency: c.conteo, isAbsent: (r.ausencias || []).includes(i), isDominant: (r.dominantes || []).includes(i) };
    }
    return { methodId: ATBASH_METADATA.id, methodName: ATBASH_METADATA.name, primaryNumbers: pk, inclusionMap: inclusion, rawData: r };
}
export function ejecutarMetodoAtbash(i) {
    const r = generarAnalisisAtbash(i);
    return adaptarAEstadoSimbolicoAtbash(r);
}
