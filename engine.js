// engine.js
// Core calculation engine for glass properties
// Usage: const engine = require('./engine');
// const result = engine.calculateAll(parsedNotes);

const fs = require('fs');
const path = require('path');

// Default fallbacks if no rule matches
const DEFAULTS = {
  length: 0,
  width: 0,
  thickness: 0,
  boringPlacement: 0,
  boreDepth: 0,
  boreBoxHeight: 0,
};

/**
 * Dynamically load the appropriate rule set file based on order data
 */
function loadRules(order) {
  // Debug logging to trace rule loading
  console.log('loadRules: incoming order data:', order);

  const rulesDir = path.join(__dirname, 'rules');
  console.log('loadRules: using rules directory:', rulesDir);

  let key;
  // If metal framed hinged door, always use hingedmetaldoors.json
  const metalFramed = order['Metal Framed Hinged Door?'];
  if (metalFramed === 'Yes' || metalFramed === true) {
    key = 'hingedmetaldoors';
  } else {
    const style = (order['Select Door Style'] || '').toString();
    key = style.toLowerCase().replace(/[^a-z0-9]/g, '') + 'doors';
  }
  console.log('loadRules: determined rule key:', key);

  const ruleFile = path.join(rulesDir, `${key}.json`);
  console.log('loadRules: rule file path:', ruleFile);

  try {
    const content = fs.readFileSync(ruleFile, 'utf8');
    console.log('loadRules: raw rule file content:', content);
    const parsed = JSON.parse(content);
    console.log('loadRules: parsed rules object keys:', Object.keys(parsed));
    return parsed;
  } catch (err) {
    console.warn('loadRules: failed to load/parse rules from', ruleFile, '-', err.message);
    return {};
  }
}

/**
 * Check if a rule's conditions match the order
 */
function matchRule(rule, order) {
  const conditions = Array.isArray(rule.conditions) ? rule.conditions : [];
  return conditions.every(cond => {
    const actual = order[cond.variable];
    const { operator, values } = cond;
    switch (operator) {
      case 'contains':
        return Array.isArray(values) && values.includes(actual);
      case 'notContains':
        return Array.isArray(values) && !values.includes(actual);
      case 'gte':
        return Number(actual) >= Number(values[0]);
      case 'lte':
        return Number(actual) <= Number(values[0]);
      default:
        return false;
    }
  });
}

/**
 * Safely evaluate a formula string against order variables
 */
function evaluateFormula(formula, order) {
  // Use a single 'order' parameter and a with() block to allow referencing keys directly
  // e.g. "10 + parseFloat(SomeDimension)"
  // eslint-disable-next-line no-new-func
  const fn = new Function('order', `with(order) { return ${formula}; }`);
  try {
    const result = fn(order);
    console.log(`evaluateFormula: formula='${formula}' => ${result}`);
    return result;
  } catch (err) {
    console.error('evaluateFormula: error evaluating formula', formula, err.message);
    return 0;
  }
}

/**
 * Calculate a single property by finding matching rules and evaluating the last one
 */
function calculateProperty(order, rules, propName) {
  const propRules = Array.isArray(rules[propName]) ? rules[propName] : [];
  const matches = propRules.filter(r => matchRule(r, order));
  console.log(`calculateProperty: property='${propName}', found ${matches.length} matching rules`);
  if (matches.length) {
    // respect ordering: pick last matching rule
    const rule = matches[matches.length - 1];
    console.log(`calculateProperty: using rule formula='${rule.formula}' for property='${propName}'`);
    return evaluateFormula(rule.formula, order);
  }
  console.log(`calculateProperty: no matching rules for '${propName}', using default ${DEFAULTS[propName]}`);
  return DEFAULTS[propName];
}

/**
 * Main entry: calculate all properties for a given order
 */
function calculateAll(order) {
  console.log('calculateAll: start calculation for order');
  const rules = loadRules(order);
  const result = {
    length: calculateProperty(order, rules, 'length'),
    width: calculateProperty(order, rules, 'width'),
    thickness: calculateProperty(order, rules, 'thickness'),
    boringPlacement: calculateProperty(order, rules, 'boringPlacement'),
    boreDepth: calculateProperty(order, rules, 'boreDepth'),
    boreBoxHeight: calculateProperty(order, rules, 'boreBoxHeight'),
  };
  console.log('calculateAll: result =>', result);
  return result;
}

// export as CommonJS
module.exports = { calculateAll };
