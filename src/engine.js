// engine.js
// Core calculation engine for glass properties
// Usage: const engine = require('./engine');
// const result = engine.calculateAll(parsedNotes);

const fs = require('fs');
const path = require('path');

// Load all rule sets from a “rules” folder (either next to this file or at project root)
const RULE_SETS = {};
// try __dirname/rules, then fallback to process.cwd()/rules
let rulesDir = path.join(__dirname, 'rules');
if (!fs.existsSync(rulesDir)) {
  rulesDir = path.join(process.cwd(), 'rules');
}
if (fs.existsSync(rulesDir)) {
  fs.readdirSync(rulesDir)
    .filter(f => f.endsWith('.json'))
    .forEach(f => {
      const name = path.basename(f, '.json').toLowerCase();
      RULE_SETS[name] = require(path.join(rulesDir, f));
    });
} else {
  console.warn(`⚠️  No rules directory found at ${rulesDir}`);
}

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
 * Determine which rule set to use based on order notes
 * e.g. hingedMetalDoors.json key => 'hingedmetaldoors'
 */
function loadRules(order) {
  // For metal-framed hinged doors, always use the hingedmetaldoors rule set
  const metalFramed = order['Metal Framed Hinged Door?'];
  if (metalFramed === 'Yes' || metalFramed === true) {
    return RULE_SETS['hingedmetaldoors'] || {};
  }
  const style = (order['Select Door Style'] || '').toString();
  // Normalize to a key: lowercase alphanumeric + 'doors'
  const key = style
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') + 'doors';
  return RULE_SETS[key] || {};
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
        return values.includes(actual);
      case 'notContains':
        return !values.includes(actual);
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
  const keys = Object.keys(order);
  const args = keys;
  const vals = keys.map(k => order[k]);
  // eslint-disable-next-line no-new-func
  const fn = new Function(...args, `return ${formula};`);
  return fn(...vals);
}

/**
 * Calculate a single property by finding matching rules and evaluating the last one
 */
function calculateProperty(order, rules, propName) {
  const propRules = Array.isArray(rules[propName]) ? rules[propName] : [];
  const matches = propRules.filter(r => matchRule(r, order));
  if (matches.length) {
    const rule = matches[matches.length - 1];
    return evaluateFormula(rule.formula, order);
  }
  return DEFAULTS[propName];
}

/**
 * Main entry: calculate all properties for a given order
 */
function calculateAll(order) {
  const rules = loadRules(order);
  return {
    length: calculateProperty(order, rules, 'length'),
    width: calculateProperty(order, rules, 'width'),
    thickness: calculateProperty(order, rules, 'thickness'),
    boringPlacement: calculateProperty(order, rules, 'boringPlacement'),
    boreDepth: calculateProperty(order, rules, 'boreDepth'),
    boreBoxHeight: calculateProperty(order, rules, 'boreBoxHeight'),
  };
}

module.exports = { calculateAll };
