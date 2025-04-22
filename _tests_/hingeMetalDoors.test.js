const hinge = require('../src/hingeMetalDoors.json');

describe('Hinge Metal Doors JSON', () => {
  test('should load valid JSON with required top-level keys', () => {
    expect(hinge).toHaveProperty('calculationBlocks');
    expect(hinge).toHaveProperty('parts');
  });

  test('each part must reference existing calculationBlocks', () => {
    const definedBlocks = Object.keys(hinge.calculationBlocks);
    for (const partKey in hinge.parts) {
      const part = hinge.parts[partKey];
      if (part.calculationBlocks) {
        part.calculationBlocks.forEach(blockName => {
          expect(definedBlocks).toContain(blockName);
        });
      }
    }
  });

  test('every part has an include array', () => {
    for (const [partName, part] of Object.entries(hinge.parts)) {
      expect(part).toHaveProperty('include');
      expect(Array.isArray(part.include)).toBe(true);
    }
  });

  test('quantityRules, if present, are arrays of objects with conditions and quantity', () => {
    for (const part of Object.values(hinge.parts)) {
      if (part.quantityRules) {
        expect(Array.isArray(part.quantityRules)).toBe(true);
        part.quantityRules.forEach(rule => {
          expect(rule).toHaveProperty('conditions');
          expect(Array.isArray(rule.conditions)).toBe(true);
          expect(rule).toHaveProperty('quantity');
          expect(typeof rule.quantity).toBe('number');
        });
      }
    }
  });
});
