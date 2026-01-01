// Schema-only validation test for SWM v3 Phase 1 example fixture
// This test is intentionally minimal and checks required fields and counts.

const fs = require('fs');
const assert = require('assert');
const path = require('path');

function validateCard(card) {
  const required = ['id', 'name', 'arcanaType', 'symbolicKeywords', 'educationalThemes', 'interpretativeHints', 'sources'];
  for (const k of required) {
    assert.ok(Object.prototype.hasOwnProperty.call(card, k), `Missing field ${k} in card ${card && card.id}`);
  }
  assert.ok(Array.isArray(card.symbolicKeywords) && card.symbolicKeywords.length > 0, 'symbolicKeywords must be non-empty array');
  assert.ok(Array.isArray(card.educationalThemes) && card.educationalThemes.length > 0, 'educationalThemes must be non-empty array');
}

(function main() {
  const fixturePath = path.resolve(__dirname, '../fixtures/tarot_swm_v3_example.json');
  const raw = fs.readFileSync(fixturePath, 'utf8');
  const data = JSON.parse(raw);

  assert.ok(data.meta && data.meta.example === true, 'Fixture must be marked as example');
  assert.ok(Array.isArray(data.cards), 'cards must be an array');
  assert.ok(data.cards.length >= 1 && data.cards.length <= 5, 'cards must have 1-5 entries for Phase 1');

  data.cards.forEach(validateCard);

  console.log('SWM v3 Phase 1 fixture schema validation: OK');
})();
