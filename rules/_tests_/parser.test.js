// Parser.test.js - tests for parseNotes in CommonJS form
const { parseNotes } = require('../../parser.js');

describe('parseNotes', () => {
  const sampleNotes = `
1 x Hinged Door - OC - Door - https://rustica.com/provence-interior-door/

Line Item ID: RZD1XXTH
Select Door Style: Provence
Metal Framed Hinged Door?: Yes
Is Wine Room Door?: No
Select Width of a Single Door (not the door way opening): 2 ft 5 in 3/4 in
Select Door Height: 7 ft 10 in 5/8 in
Select Glass Style: Clear
Some Custom Note: Fancy Finish
`;  

  test('parses measurements, booleans, strings, and URLs', () => {
    const data = parseNotes(sampleNotes);

    // measurement parsing
    expect(data.select_width_of_a_single_door_not_the_door_way_opening)
      .toBeCloseTo(29.75); // 2*12 + 5 + 0.75
    expect(data.select_door_height).toBeCloseTo(94.625); // 7*12 + 10 + 0.625

    // boolean parsing
    expect(data.metal_framed_hinged_door).toBe(true);
    expect(data.is_wine_room_door).toBe(false);

    // string passthrough
    expect(data.select_door_style).toBe('Provence');
    expect(data.some_custom_note).toBe('Fancy Finish');

    // URLs
    expect(Array.isArray(data._urls)).toBe(true);
    expect(data._urls).toContain('https://rustica.com/provence-interior-door/');
  });

  test('skips malformed lines and non key-value content', () => {
    const notes = 'Just some text without colon\nAnother Line';
    const data = parseNotes(notes);
    expect(Object.keys(data)).toEqual([]);
  });

  test('throws on non-string input', () => {
    expect(() => parseNotes(123)).toThrow('Expected notesText to be a string');
  });
});
