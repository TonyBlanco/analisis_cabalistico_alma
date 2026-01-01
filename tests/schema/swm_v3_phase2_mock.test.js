// Phase 2 schema smoke test (non-UI)
const fs = require('fs');
const path = require('path');
const assert = require('assert');

(function main() {
  const swmButtonPath = path.resolve(__dirname, '../../tonyblanco-app/components/SWMV3/SwmV3Button.tsx');
  const mockEnginePath = path.resolve(__dirname, '../../tonyblanco-app/components/SWMV3/MockEngine.ts');
  const exampleDeckPath = path.resolve(__dirname, '../../src/symbolic/tarot/decks/example_ai_v3.ts');

  assert.ok(fs.existsSync(swmButtonPath), 'SWM V3 button component must exist');
  assert.ok(fs.existsSync(mockEnginePath), 'SWM V3 mock engine must exist');
  assert.ok(fs.existsSync(exampleDeckPath), 'Example Phase 1 deck must exist');

  // Ensure Phase 2 does not introduce persistence markers in mock engine
  const mockSource = fs.readFileSync(mockEnginePath, 'utf8');
  assert.ok(!/localStorage|fetch\(|axios|post\(|save\(|writeFileSync/.test(mockSource), 'Mock engine must not persist or call endpoints');

  console.log('SWM v3 Phase 2 schema smoke test: OK');
})();
