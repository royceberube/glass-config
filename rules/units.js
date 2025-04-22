// units.js - utility functions for converting measurement strings to decimal inches

/**
 * Parse a measurement string into decimal inches.
 * Supports feet (ft or '), inches (in or "), plain numbers, and fractional inches (e.g. 5/8 in).
 * Throws an Error on malformed or unrecognized strings.
 * @param {string} input - measurement string
 * @returns {number} - total inches as a decimal
 */
function parseMeasurement(input) {
    if (typeof input !== 'string') {
      throw new Error(`Invalid input type: ${typeof input}. Expected a string.`);
    }
    const str = input.trim().toLowerCase();
    if (!str) {
      throw new Error('Empty measurement string');
    }
  
    let total = 0;
    let matched = false;
  
    // Feet: e.g. "7 ft" or "7'"
    const feetMatch = str.match(/(\d+)\s*(?:ft|feet|')/);
    if (feetMatch) {
      total += parseInt(feetMatch[1], 10) * 12;
      matched = true;
    }
  
    // Fractional inches: e.g. "5/8 in" or "5/8""
    const fractionRegex = /(\d+)\s*\/\s*(\d+)\s*(?:in|inch|\")/g;
    let fracMatch;
    while ((fracMatch = fractionRegex.exec(str)) !== null) {
      const numerator = parseInt(fracMatch[1], 10);
      const denominator = parseInt(fracMatch[2], 10);
      if (denominator === 0) {
        throw new Error(`Invalid fraction with zero denominator in "${input}"`);
      }
      total += numerator / denominator;
      matched = true;
    }
  
    // Remove already parsed parts to avoid double-counting
    let cleaned = str
      .replace(/(\d+)\s*(?:ft|feet|')/g, '')
      .replace(fractionRegex, '');
  
    // Whole inches: e.g. "10 in" or "10""
    const inchMatch = cleaned.match(/(\d+)\s*(?:in|inch|\")/);
    if (inchMatch) {
      total += parseInt(inchMatch[1], 10);
      matched = true;
      // remove matched inches
      cleaned = cleaned.replace(/(\d+)\s*(?:in|inch|\")/, '');
    }
  
    // Plain numbers with no unit: interpret as inches
    const plainMatch = cleaned.match(/^\s*(\d+(?:\.\d+)?)\s*$/);
    if (plainMatch) {
      total += parseFloat(plainMatch[1]);
      matched = true;
    }
  
    if (!matched) {
      throw new Error(`Unable to parse measurement from "${input}"`);
    }
  
    return total;
  }
  
  module.exports = { parseMeasurement };
  