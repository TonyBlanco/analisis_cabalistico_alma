// Self-contained JS unit tests duplicating normalization and calculation logic
const HEBREW_ALPHABET = 'אבגדהוזחטיכלמנסעפצקרשת';
const HEBREW_FINALS = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' };
const ALL_HEBREW = HEBREW_ALPHABET + 'ךםןףץ';

const GEMATRIA_STANDARD = {
  'א':1,'ב':2,'ג':3,'ד':4,'ה':5,'ו':6,'ז':7,'ח':8,'ט':9,'י':10,'כ':20,'ך':20,'ל':30,'מ':40,'ם':40,'נ':50,'ן':50,'ס':60,'ע':70,'פ':80,'ף':80,'צ':90,'ץ':90,'ק':100,'ר':200,'ש':300,'ת':400
};
const MISPAR_GADOL = Object.assign({}, GEMATRIA_STANDARD, { 'ך':500, 'ם':600, 'ן':700, 'ף':800, 'ץ':900 });

function normalizeHebrew(text, opts) {
  const options = Object.assign({ mapFinals:'toBase', removeNiqqud:true, unicode:'NFD', onlyHebrew:true, keepSpaces:true, collapseSpaces:true }, opts||{});
  if (!text) return '';
  try { text = options.unicode === 'NFC' ? text.normalize('NFC') : text.normalize('NFD'); } catch(e){}
  if (options.removeNiqqud) { text = text.replace(/[\u0591-\u05C7]/g, ''); text = text.replace(/\p{M}/gu, ''); }
  if (options.mapFinals === 'toBase') text = text.split('').map(ch => HEBREW_FINALS[ch] || ch).join('');
  if (options.onlyHebrew) { const res=[]; for (const ch of text.split('')) { if (ALL_HEBREW.includes(ch)) res.push(ch); else if (options.keepSpaces && ch===' ') res.push(ch); } text = res.join(''); }
  if (options.collapseSpaces) text = text.replace(/\s+/g,' ').trim();
  return text;
}

function calculateGematria(text, table, opts) {
  const mapFinals = opts && opts.mapFinals ? opts.mapFinals : 'toBase';
  const clean = normalizeHebrew(text, { mapFinals, removeNiqqud:true, onlyHebrew:true, keepSpaces:false, collapseSpaces:false });
  return clean.split('').reduce((s,ch)=>s+(table[ch]||0),0);
}

function calculateGematriaGadol(text) { return calculateGematria(text, MISPAR_GADOL, { mapFinals:'keep' }); }

function atbashTransform(letter) { const normal = HEBREW_FINALS[letter] || letter; const idx = HEBREW_ALPHABET.indexOf(normal); if (idx===-1) return letter; return HEBREW_ALPHABET[21-idx]; }
function applyTemurah(text, method) { const transforms = { 'atbash': atbashTransform }; const transform = transforms[method]; if(!transform) return text; const clean = normalizeHebrew(text, { mapFinals:'toBase', removeNiqqud:true, onlyHebrew:true, keepSpaces:false, collapseSpaces:false }); return clean.split('').map(transform).join(''); }

function assertEqual(a,b,msg){ if(a===b) console.log('PASS:',msg); else console.error('FAIL:',msg, '=>', a, '!=', b); }

// Test 1: base stable with finals normalized (single-letter check)
const finalLetter = 'ם';
assertEqual(normalizeHebrew(finalLetter), 'מ', 'normalize maps final mem to base mem');
assertEqual(calculateGematria(finalLetter, GEMATRIA_STANDARD), calculateGematria('מ', GEMATRIA_STANDARD), 'Gematria standard equal for final vs base mem');

// Test 2: gadol differs only if sofit
const sofitInput = 'ץ';
const gadolVal = calculateGematriaGadol(sofitInput);
const standardVal = calculateGematria(sofitInput, GEMATRIA_STANDARD);
if (gadolVal !== standardVal) console.log('PASS: Mispar Gadol differs for sofit'); else console.error('FAIL: Mispar Gadol should differ for sofit');

// Test 3: temurah always uses base mapping
const temurahInput = 'ך';
const atbashRaw = applyTemurah(temurahInput, 'atbash');
const atbashNormalized = applyTemurah(normalizeHebrew(temurahInput), 'atbash');
assertEqual(atbashRaw, atbashNormalized, 'Temurah uses base mapping (sofit -> base)');

console.log('Unit tests complete.');
