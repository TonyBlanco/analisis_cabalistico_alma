import { describe, it, expect } from 'vitest';
import { treeStructuralStateFromTarotDraws } from '@/lib/symbolic-session/tarot-tree-state';

const SEFIROT_IDS = [
  'keter',
  'chokmah',
  'binah',
  'chesed',
  'gevurah',
  'tiferet',
  'netzach',
  'hod',
  'yesod',
  'malchut',
] as const;

/** Simula payload SWM v3 tree_of_life (10 cartas, position.id = Sefirá). */
function mockTreeOfLifeDraws() {
  return SEFIROT_IDS.map((sefira, i) => ({
    id: `draw-${i + 1}`,
    position: { id: sefira, nameSpanish: sefira },
    reversed: false,
    card: { id: `card-${i + 1}`, nameSpanish: `Carta ${i + 1}` },
  }));
}

describe('tarot-tree-spread wiring (tree_of_life → treeState)', () => {
  it('tree_of_life con 10 Sefirot produce TreeStructuralState no nulo', () => {
    const result = treeStructuralStateFromTarotDraws(mockTreeOfLifeDraws(), 'thoth');
    expect(result).not.toBeNull();
    expect(result!.sefirot.length).toBeGreaterThan(0);
    expect(result!.flows.length).toBeGreaterThan(0);
  });

  it('significator (simple) no produce treeState utilizable', () => {
    const result = treeStructuralStateFromTarotDraws(
      [
        {
          position: { id: 'significator' },
          card: { id: 'fool', nameSpanish: 'El Loco' },
        },
      ],
      'thoth',
    );
    expect(result).toBeNull();
  });
});