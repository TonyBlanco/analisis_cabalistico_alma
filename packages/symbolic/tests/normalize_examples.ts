import { normalizeHebrew, calculateGematria, GEMATRIA_STANDARD, MISPAR_GADOL, applyTemurah } from '../utils/hebrew-gematria';

function show(title: string, value: string) {
  console.log('---', title, '---');
  console.log(value);
}

// Niqqud example
const withNiqqud = 'מֶלֶךְ';
show('Input with niqqud', withNiqqud);
show('Normalized (toBase)', normalizeHebrew(withNiqqud)); // expected: מלכ

// Finals example
const finals = 'ךםןףץ';
show('Finals input', finals);
show('Normalized (toBase)', normalizeHebrew(finals)); // expected: כמנפצ

// Mixed text
const mixed = 'לויס אנטוני !!! בלאנקו';
show('Mixed input', mixed);
show('Normalized (letters+spaces)', normalizeHebrew(mixed));

// Gematria examples
show('Gematria standard (clean)', String(calculateGematria('מלך', GEMATRIA_STANDARD)));
show('Gematria standard (with niqqud)', String(calculateGematria(withNiqqud, GEMATRIA_STANDARD)));

// Mispar Gadol keeps finals
show('Mispar Gadol (finals kept)', String(calculateGematria('וךץ', MISPAR_GADOL)));
show('Mispar Gadol (normalized to keep finals)', String(calculateGematria('וךץ', MISPAR_GADOL, { mapFinals: 'keep' })));

// Temurah example
show('Atbash of מלך', applyTemurah('מלך', 'atbash'));
show('Atbash of מֶלֶךְ (with niqqud)', applyTemurah(withNiqqud, 'atbash'));

console.log('\nDone.');
