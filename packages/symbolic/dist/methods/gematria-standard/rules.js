/** Deterministic lightweight analysis used for UI-only presentation. */
export function calcularAnalisisGematriaStandard(input) {
    const name = input.nombreCompleto || '';
    const dateStr = `${input.fechaNacimiento.anio}-${input.fechaNacimiento.mes}-${input.fechaNacimiento.dia}`;
    let seed = 0;
    const seedSource = name + dateStr;
    for (let i = 0; i < seedSource.length; i++)
        seed += seedSource.charCodeAt(i);
    // Simple, deterministic distribution for UI visualization
    const casasInclusion = {};
    for (let i = 1; i <= 9; i++) {
        const conteo = (seed + i) % 4; // 0..3
        casasInclusion[i] = { numero: i, conteo, letras: [] };
    }
    const primary = (offset) => ({ original: offset + seed % 9, reducido: ((offset + seed) % 9) + 1, esMaestro: false });
    return {
        identidad: {
            nombreCompleto: name,
            fechaNacimiento: dateStr,
        },
        numeros: {
            esencia: { ...primary(1) },
            expresion: { ...primary(2) },
            herencia: { ...primary(3) },
            caminoVida: { ...primary(4), edadTransformacion: 0 },
        },
        casasInclusion,
        ausencias: Object.keys(casasInclusion).filter((k) => casasInclusion[Number(k)].conteo === 0).map((k) => Number(k)),
        dominantes: Object.keys(casasInclusion).filter((k) => casasInclusion[Number(k)].conteo >= 3).map((k) => Number(k)),
        metadatos: {
            metodo: 'gematria-standard',
            sistema: 'gematria',
            alfabeto: 'hebrew-classic',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
        },
    };
}
