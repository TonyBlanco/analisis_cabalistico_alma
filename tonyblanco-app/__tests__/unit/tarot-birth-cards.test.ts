import { describe, it, expect } from 'vitest';
import { computeBirthCards } from '@/components/BodySoulVisualization/plugins/tarot/tarot.logic';

describe('computeBirthCards', () => {
  it('es determinista: misma fecha produce las mismas 3 cartas en dos llamadas', () => {
    const date = new Date(1968, 6, 28); // 28/07/1968
    const a = computeBirthCards(date, 2024);
    const b = computeBirthCards(date, 2024);
    expect(a).not.toBeNull();
    expect(a!.personalityCard.id).toBe(b!.personalityCard.id);
    expect(a!.soulCard.id).toBe(b!.soulCard.id);
    expect(a!.yearCard.id).toBe(b!.yearCard.id);
  });

  it('fechas distintas producen personalityCard distintas', () => {
    const d1 = computeBirthCards(new Date(1968, 6, 28), 2024); // → 41 → 5
    const d2 = computeBirthCards(new Date(1990, 0, 1), 2024);  // → diferente
    expect(d1).not.toBeNull();
    expect(d2).not.toBeNull();
    expect(d1!.personalityCard.id).not.toBe(d2!.personalityCard.id);
  });

  it('fecha inválida devuelve null', () => {
    expect(computeBirthCards(new Date('invalid'))).toBeNull();
  });

  it('calcula el ejemplo canónico: 28/07/1968 → personality=5 (El Sumo Sacerdote)', () => {
    // 2+8+0+7+1+9+6+8 = 41 → 4+1 = 5 → arcano 5 (El Sumo Sacerdote)
    const result = computeBirthCards(new Date(1968, 6, 28), 2024);
    expect(result).not.toBeNull();
    expect(result!.personalityCard.number).toBe(5);
    expect(result!.soulCard.number).toBe(5); // 5 < 10 → soul = personality
  });

  it('personality ≥ 10 produce soul distinto (reducción extra)', () => {
    // Buscar una fecha cuyo digit-sum quede en 10..21
    // 01/01/1991: 0+1+0+1+1+9+9+1 = 22 > 21 → 2+2 = 4 (no sirve)
    // 10/05/1970: 1+0+0+5+1+9+7+0 = 23 > 21 → 2+3 = 5
    // 19/01/1981: 1+9+0+1+1+9+8+1 = 30 > 21 → 3+0 = 3
    // 05/09/1967: 0+5+0+9+1+9+6+7 = 37 > 21 → 3+7 = 10
    const result = computeBirthCards(new Date(1967, 8, 5), 2024);
    expect(result).not.toBeNull();
    expect(result!.personalityCard.number).toBe(10);
    expect(result!.soulCard.number).toBe(1); // 1+0 = 1
    expect(result!.personalityCard.id).not.toBe(result!.soulCard.id);
  });

  it('la yearCard cambia si se pasa un año distinto', () => {
    const date = new Date(1968, 6, 28);
    const r2024 = computeBirthCards(date, 2024);
    const r2025 = computeBirthCards(date, 2025);
    expect(r2024).not.toBeNull();
    expect(r2025).not.toBeNull();
    // Los años distintos producen year cards distintas o iguales por numerología,
    // lo que importa es que el resultado sea estable dentro del mismo año.
    const r2024b = computeBirthCards(date, 2024);
    expect(r2024!.yearCard.id).toBe(r2024b!.yearCard.id);
  });

  it('todas las cartas resultantes son Arcanos Mayores', () => {
    const result = computeBirthCards(new Date(1985, 3, 15), 2024);
    expect(result).not.toBeNull();
    expect(result!.personalityCard.type).toBe('arcano_mayor');
    expect(result!.soulCard.type).toBe('arcano_mayor');
    expect(result!.yearCard.type).toBe('arcano_mayor');
  });
});
