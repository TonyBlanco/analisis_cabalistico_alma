import { describe, it, expect } from 'vitest';
import {
  buildTreeStateFromTarotReading,
  type TarotTreePosition,
} from '@/lib/symbolic-session/tarot-tree-state';

const ALL_SEFIROT: TarotTreePosition[] = [
  { sefira: 'keter',   cardId: 'fool',     cardLabel: 'El Loco' },
  { sefira: 'chokmah', cardId: 'magician', cardLabel: 'El Mago' },
  { sefira: 'binah',   cardId: 'empress',  cardLabel: 'La Emperatriz' },
  { sefira: 'chesed',  cardId: 'emperor',  cardLabel: 'El Emperador' },
  { sefira: 'gevurah', cardId: 'strength', cardLabel: 'La Fuerza' },
  { sefira: 'tiferet', cardId: 'sun',      cardLabel: 'El Sol' },
  { sefira: 'netzach', cardId: 'star',     cardLabel: 'La Estrella' },
  { sefira: 'hod',     cardId: 'moon',     cardLabel: 'La Luna' },
  { sefira: 'yesod',   cardId: 'world',    cardLabel: 'El Mundo' },
  { sefira: 'malchut', cardId: 'judgment', cardLabel: 'El Juicio' },
];

describe('buildTreeStateFromTarotReading', () => {
  it('10 posiciones → TreeStructuralState con sefirot y flows no vacíos', () => {
    const result = buildTreeStateFromTarotReading({
      system: 'rider-waite',
      positions: ALL_SEFIROT,
    });
    expect(result).not.toBeNull();
    expect(result!.sefirot.length).toBeGreaterThan(0);
    expect(result!.flows.length).toBeGreaterThan(0);
  });

  it('reversed reduce la activación frente a upright', () => {
    const upright = buildTreeStateFromTarotReading({
      system: 'thoth',
      positions: [{ sefira: 'tiferet', cardId: 'sun', reversed: false }],
    });
    const reversed = buildTreeStateFromTarotReading({
      system: 'thoth',
      positions: [{ sefira: 'tiferet', cardId: 'sun', reversed: true }],
    });

    expect(upright).not.toBeNull();
    expect(reversed).not.toBeNull();

    const uprightNode = upright!.sefirot.find((s) => s.id === 'tiferet');
    const reversedNode = reversed!.sefirot.find((s) => s.id === 'tiferet');

    // Both nodes must exist
    expect(uprightNode).toBeDefined();
    expect(reversedNode).toBeDefined();

    // Upright activation >= reversed activation
    expect(uprightNode!.activation).toBeGreaterThanOrEqual(reversedNode!.activation);
  });

  it('positions=[] → devuelve null', () => {
    const result = buildTreeStateFromTarotReading({
      system: 'bota',
      positions: [],
    });
    expect(result).toBeNull();
  });

  it('posiciones con sefira inválida se ignoran silenciosamente', () => {
    const result = buildTreeStateFromTarotReading({
      system: 'bota',
      // @ts-expect-error — sefira inválida a propósito
      positions: [{ sefira: 'invalid-sefira', cardId: 'fool' }],
    });
    expect(result).toBeNull();
  });

  it('malchut sola → null (se excluye del mapeo primario)', () => {
    const result = buildTreeStateFromTarotReading({
      system: 'bota',
      positions: [{ sefira: 'malchut', cardId: 'world' }],
    });
    // malchut (10) is excluded from primaryNumbers; sin otros nodos → null
    expect(result).toBeNull();
  });

  it('tirada parcial (3 sefirot) → estado válido', () => {
    const result = buildTreeStateFromTarotReading({
      system: 'golden-dawn',
      positions: [
        { sefira: 'keter',   cardId: 'fool' },
        { sefira: 'tiferet', cardId: 'sun' },
        { sefira: 'yesod',   cardId: 'moon' },
      ],
    });
    expect(result).not.toBeNull();
    expect(result!.sefirot.length).toBeGreaterThan(0);
  });
});
