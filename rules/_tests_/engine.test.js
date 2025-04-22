// __tests__/engine.test.js
const path = require('path');
const fs = require('fs');
// point at the root-level engine.js (two levels up from this tests folder)
const engine = require('../../engine');

// Mock a minimal ruleset for a “testdoors.json”
beforeAll(() => {
  const mockRules = {
    length: [
      {
        conditions: [{ variable: 'Select Door Style', operator: 'contains', values: ['Test'] }],
        formula: '10 + parseFloat(SomeDimension)'
      }
    ],
    width: [
      {
        conditions: [{ variable: 'Select Door Style', operator: 'contains', values: ['Test'] }],
        formula: '5'
      }
    ],
    thickness: [],
    boringPlacement: [],
    boreDepth: [],
    boreBoxHeight: []
  };
  // Write it into rules/testdoors.json
  // Create mock rules file directly in the `rules/` folder one level above this test directory
  const rulesDir = path.join(__dirname, '..');
  if (!fs.existsSync(rulesDir)) fs.mkdirSync(rulesDir);
  fs.writeFileSync(path.join(rulesDir, 'testdoors.json'), JSON.stringify(mockRules));
});

afterAll(() => {
  // Clean up the test file we wrote into rules/
  const fileToRemove = path.join(__dirname, '..', 'testdoors.json');
  if (fs.existsSync(fileToRemove)) fs.unlinkSync(fileToRemove);
});

test('calculates length & width from matching rule', () => {
  const order = {
    'Select Door Style': 'Test',
    SomeDimension: '2'
  };
  const result = engine.calculateAll(order);
  expect(result.length).toBe(12);     // 10 + 2
  expect(result.width).toBe(5);       // fixed
  expect(result.thickness).toBe(0);   // default
});

test('falls back to defaults when no rule matches', () => {
  const order = { 'Select Door Style': 'Other' };
  const result = engine.calculateAll(order);
  expect(result.length).toBe(0);
  expect(result.width).toBe(0);
});