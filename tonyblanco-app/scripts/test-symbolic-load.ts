#!/usr/bin/env tsx
/**
 * Smoke: carga @holistica/symbolic, Pitágoras y los 10 métodos de gematría
 * con interpretacion en rawData.
 *
 * Run: npx tsx scripts/test-symbolic-load.ts
 */

const TEST_INPUT = {
  nombreCompleto: 'Test User',
  fechaNacimiento: { dia: 1, mes: 1, anio: 2000 },
};

const GEMATRIA_METHODS = [
  { id: 'gematria-standard', importPath: '@holistica/symbolic/methods/gematria-standard', fn: 'ejecutarMetodoGematriaStandard' },
  { id: 'gematria-katan', importPath: '@holistica/symbolic/methods/gematria-katan', fn: 'ejecutarMetodoGematriaKatan' },
  { id: 'mispar-gadol', importPath: '@holistica/symbolic/methods/mispar-gadol', fn: 'ejecutarMetodoMisparGadol' },
  { id: 'mispar-siduri', importPath: '@holistica/symbolic/methods/mispar-siduri', fn: 'ejecutarMetodoMisparSiduri' },
  { id: 'milui', importPath: '@holistica/symbolic/methods/milui', fn: 'ejecutarMetodoMilui' },
  { id: 'atbash', importPath: '@holistica/symbolic/methods/atbash', fn: 'ejecutarMetodoAtbash' },
  { id: 'albam', importPath: '@holistica/symbolic/methods/albam', fn: 'ejecutarMetodoAlbam' },
  { id: 'avgad', importPath: '@holistica/symbolic/methods/avgad', fn: 'ejecutarMetodoAvgad' },
  { id: 'temurah', importPath: '@holistica/symbolic/methods/temurah', fn: 'ejecutarMetodoTemurah' },
  { id: 'notarikon', importPath: '@holistica/symbolic/methods/notarikon', fn: 'ejecutarMetodoNotarikon' },
] as const;

async function runTest() {
  console.log('======================================');
  console.log('Testing @holistica/symbolic Module Load');
  console.log('======================================\n');

  try {
    const { ejecutarMetodoPitagorico } = await import('@holistica/symbolic/methods/pitagoras');
    const pitagoras = ejecutarMetodoPitagorico(TEST_INPUT);
    if (!pitagoras?.primaryNumbers?.length) {
      throw new Error('Pitagoras: resultado inválido');
    }
    console.log('✅ Pitágoras OK\n');

    let gematriaOk = 0;
    for (const m of GEMATRIA_METHODS) {
      const mod = await import(m.importPath);
      const run = (mod as Record<string, unknown>)[m.fn];
      if (typeof run !== 'function') {
        throw new Error(`${m.id}: falta ${m.fn}`);
      }
      const result = (run as (input: typeof TEST_INPUT) => { rawData?: { interpretacion?: { metodo?: string; avisos?: string[] } } })(
        TEST_INPUT,
      );
      const interp = result?.rawData?.interpretacion;
      const ok =
        interp?.metodo === m.id &&
        Array.isArray(interp.avisos) &&
        interp.avisos.length > 0;
      console.log(ok ? '✅' : '❌', m.id, ok ? '' : '(sin interpretacion)');
      if (ok) gematriaOk++;
    }

    if (gematriaOk !== GEMATRIA_METHODS.length) {
      throw new Error(`Solo ${gematriaOk}/${GEMATRIA_METHODS.length} métodos con interpretacion`);
    }

    console.log(`\n✅ ${gematriaOk}/10 gematría con interpretacion en rawData`);
    console.log('======================================\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

void runTest();
