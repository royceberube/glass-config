// parser.js - CommonJS module for parsing sales order notes
const { parseMeasurement } = require('./rules/units.js');

/**
 * Parse a block of sales order note text into a structured object.
 * - Extracts Key: Value pairs
 * - Normalizes keys (lowercase, underscores)
 * - Parses measurement strings to decimal inches
 * - Converts yes/no values to booleans
 * - Collects any URLs found
 * @param {string} notesText - multiline string of sales order notes
 * @returns {Object<string, any>} - mapping of normalized keys to parsed values
 */
function parseNotes(notesText) {
  if (typeof notesText !== 'string') {
    throw new Error(`Expected notesText to be a string, got ${typeof notesText}`);
  }

  const lines = notesText.split(/\r?\n/);
  const data = {};
  const urls = [];
  const urlRegex = /https?:\/\/\S+/g;
  const measurementRegex = /\d+\s*(?:ft|feet|'|in|inch|"|\/)/i;

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    // collect URLs
    const foundUrls = line.match(urlRegex);
    if (foundUrls) urls.push(...foundUrls);

    // Expect "Key: Value" pattern
    const idx = line.indexOf(':');
    if (idx === -1) continue;

    const key = line.slice(0, idx).trim();
    const rawValue = line.slice(idx + 1).trim();

    // normalize key: lowercase, underscores
    const normKey = key
      .toLowerCase()
      .replace(/[\s\/\-]+/g, '_')
      .replace(/[^a-z0-9_]+/g, '');

    let value;

    // boolean conversion
    if (/^(yes|y)$/i.test(rawValue)) {
      value = true;
    } else if (/^(no|n)$/i.test(rawValue)) {
      value = false;
    }
    // measurement parsing
    else if (measurementRegex.test(rawValue)) {
      try {
        value = parseMeasurement(rawValue);
      } catch (e) {
        value = rawValue;
      }
    }
    // fallback to string
    else {
      value = rawValue;
    }

    data[normKey] = value;
  }

  if (urls.length) {
    data._urls = urls;
  }

  return data;
}

module.exports = { parseNotes };
