import { describe, it, expect } from 'vitest';
import { FULL_DECK, TarotEngine, buildTarotSeed, ARCANOS_MAYORES, COPAS, OROS, ESPADAS, BASTOS } from '@/components/BodySoulVisualization/plugins/tarot/tarot.logic';

describe('FULL_DECK — integridad de la baraja', () => {
  it('tiene exactamente 78 cartas', () => {
    expect(FULL_DECK.length).toBe(78);
  });

  it('ARCANOS_MAYORES tiene 22 cartas', () => {
    expect(ARCANOS_MAYORES.length).toBe(22);
  });

  it('cada palo menor tiene 14 cartas', () => {
    expect(COPAS.length).toBe(14);
    expect(OROS.length).toBe(14);
    expect(ESPADAS.length).toBe(14);
    expect(BASTOS.length).toBe(14);
  });

  it('no hay ids duplicados', () => {
    const ids = FULL_DECK.map(c => c.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(78);
  });

  it('todas las cartas tienen keywords no vacíos', () => {
    for (const card of FULL_DECK) {
      expect(card.keywords.length).toBeGreaterThan(0);
    }
  });

  it('todos los arcanos mayores tienen número 0-21', () => {
    for (const card of ARCANOS_MAYORES) {
      expect(card.number).toBeGreaterThanOrEqual(0);
      expect(card.number).toBeLessThanOrEqual(21);
    }
  });

  it('cada palo menor llega hasta el Rey (número 14)', () => {
    for (const suit of [COPAS, OROS, ESPADAS, BASTOS]) {
      const max = Math.max(...suit.map(c => c.number));
      expect(max).toBe(14);
    }
  });
});

describe('TarotEngine — determinismo con seed', () => {
  it('shuffleAndDraw con misma seed produce mismo resultado', () => {
    const seed = buildTarotSeed('Luis Blanco', '1959-08-01', 'tree_of_life');
    const a = TarotEngine.shuffleAndDraw(10, true, seed);
    const b = TarotEngine.shuffleAndDraw(10, true, seed);
    expect(a.map(d => d.card.id)).toEqual(b.map(d => d.card.id));
    expect(a.map(d => d.reversed)).toEqual(b.map(d => d.reversed));
  });

  it('seeds distintas producen resultados distintos', () => {
    const seed1 = buildTarotSeed('Luis Blanco', '1959-08-01', 'tree_of_life');
    const seed2 = buildTarotSeed('Maria Zambrano', '1963-02-20', 'tree_of_life');
    const a = TarotEngine.shuffleAndDraw(10, true, seed1);
    const b = TarotEngine.shuffleAndDraw(10, true, seed2);
    const idsA = a.map(d => d.card.id).join(',');
    const idsB = b.map(d => d.card.id).join(',');
    expect(idsA).not.toBe(idsB);
  });

  it('shuffleAndDraw retorna count exacto de cartas únicas', () => {
    const seed = buildTarotSeed('test', '2000-01-01', 'spread');
    const drawn = TarotEngine.shuffleAndDraw(10, true, seed);
    const uniqueIds = new Set(drawn.map(d => d.card.id));
    expect(drawn.length).toBe(10);
    expect(uniqueIds.size).toBe(10);
  });

  it('treeOfLifeReading con seed retorna 10 cartas únicas', () => {
    const seed = buildTarotSeed('Eugenio Santana', '1963-01-22', 'tree_of_life');
    const reading = TarotEngine.treeOfLifeReading(seed);
    expect(reading.length).toBe(10);
    const uniqueIds = new Set(reading.map(d => d.card.id));
    expect(uniqueIds.size).toBe(10);
  });

  it('treeOfLifeReading es determinista con misma seed', () => {
    const seed = buildTarotSeed('Eugenio Santana', '1963-01-22', 'tree_of_life');
    const a = TarotEngine.treeOfLifeReading(seed);
    const b = TarotEngine.treeOfLifeReading(seed);
    expect(a.map(d => d.card.id)).toEqual(b.map(d => d.card.id));
  });

  it('buildTarotSeed es determinista', () => {
    const s1 = buildTarotSeed('Luis Blanco', '1959-08-01', 'tree_of_life');
    const s2 = buildTarotSeed('Luis Blanco', '1959-08-01', 'tree_of_life');
    expect(s1).toBe(s2);
  });
});
