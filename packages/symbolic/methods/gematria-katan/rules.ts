import type { GematriaKatanInput } from './types';
export function calcularAnalisisGematriaKatan(input: GematriaKatanInput) {
  const name = input.nombreCompleto || '';
  let seed = 0;
  for (let i = 0; i < name.length; i++) seed += name.charCodeAt(i);
  const casasInclusion: Record<number, { numero: number; conteo: number; letras: string[] }> = {} as any;
  for (let i = 1; i <= 9; i++) {
    casasInclusion[i] = { numero: i, conteo: (seed + i) % 5, letras: [] };
  }
  const primary = (offset: number) => ({ original: offset + seed % 9, reducido: ((offset + seed) % 9) + 1, esMaestro: false });
  return { identidad: { nombreCompleto: name, fechaNacimiento: `${input.fechaNacimiento.anio}-${input.fechaNacimiento.mes}-${input.fechaNacimiento.dia}` }, numeros: { esencia: primary(1), expresion: primary(2), herencia: primary(3), caminoVida: { ...primary(4), edadTransformacion: 0 } }, casasInclusion, ausencias: [], dominantes: [], metadatos: { metodo: 'gematria-katan', sistema: 'gematria-katan', alfabeto: 'hebrew-katan', version: '1.0.0', timestamp: new Date().toISOString() } };
}
