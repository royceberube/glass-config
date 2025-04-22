const { parseMeasurement } = require('../src/units');

describe('parseMeasurement', () => {
  test('parses feet, inches, and fractional inches', () => {
    // 7 ft → 84 in, + 10 in → 94, + 5/8 in → 94.625
    expect(parseMeasurement('7 ft 10 in 5/8 in')).toBeCloseTo(94.625);
  });

  test('parses only feet', () => {
    expect(parseMeasurement('2 ft')).toBe(24);
  });

  test('parses only whole inches', () => {
    expect(parseMeasurement('15 in')).toBe(15);
  });

  test('parses only fraction', () => {
    expect(parseMeasurement('3/4 in')).toBeCloseTo(0.75);
  });

  test('parses quotes and mixed casing', () => {
    expect(parseMeasurement("1' 2\"")).toBeCloseTo(14);
  });

  test('ignores extra whitespace and casing', () => {
    expect(parseMeasurement('  1 FT  2  IN   1/4  In ')).toBeCloseTo(14.25);
  });

  test('parses plain number as inches', () => {
    expect(parseMeasurement('12')).toBe(12);
    expect(parseMeasurement('  5.5  ')).toBe(5.5);
  });

  test('throws on empty string', () => {
    expect(() => parseMeasurement('')).toThrow('Empty measurement string');
  });

  test('throws on non-string inputs', () => {
    expect(() => parseMeasurement(null)).toThrow('Invalid input type');
    expect(() => parseMeasurement(42)).toThrow('Invalid input type');
  });

  test('throws on unparseable string', () => {
    expect(() => parseMeasurement('foo bar')).toThrow('Unable to parse measurement');
  });
});
