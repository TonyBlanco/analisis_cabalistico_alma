// Simple JS runner duplicating normalizeHebrew logic for functional checks
const HEBREW_ALPHABET = 'אבגדהוזחטיכלמנסעפצקרשת';
const HEBREW_FINALS = {
  'ך': 'כ',
  'ם': 'מ',
  'ן': 'נ',
  'ף': 'פ',
  'ץ': 'צ',
};
const ALL_HEBREW = HEBREW_ALPHABET + 'ךםןףץ';

function normalizeHebrew(text, opts) {
  const options = Object.assign({
    mapFinals: 'toBase',
    removeNiqqud: true,
    unicode: 'NFD',
    onlyHebrew: true,
    keepSpaces: true,
    collapseSpaces: true,
  }, opts || {});

  if (!text) return '';

  try {
    text = options.unicode === 'NFC' ? text.normalize('NFC') : text.normalize('NFD');
  } catch (e) {}

  if (options.removeNiqqud) {
    text = text.replace(/[\u0591-\u05C7]/g, '');
    text = text.replace(/\p{M}/gu, '');
  }

  if (options.mapFinals === 'toBase') {
    text = text.split('').map(ch => HEBREW_FINALS[ch] || ch).join('');
  }

  if (options.onlyHebrew) {
    const resultChars = [];
    for (const ch of text.split('')) {
      if (ALL_HEBREW.includes(ch)) resultChars.push(ch);
      else if (options.keepSpaces && ch === ' ') resultChars.push(ch);
    }
    text = resultChars.join('');
  }

  if (options.collapseSpaces) text = text.replace(/\s+/g, ' ').trim();

  return text;
}

const cases = [
  { in: 'מֶלֶךְ', expect: 'מלכ' },
  { in: 'ךםןףץ', expect: 'כמנפצ' },
  { in: 'לויס אנטוני !!! בלאנקו', expect: 'לויס אנטוני בלאנקו' },
];

for (const c of cases) {
  console.log('Input:', c.in);
  console.log('Normalized:', normalizeHebrew(c.in));
  console.log('Expected:', c.expect);
  console.log('---');
}

console.log('Done.');
