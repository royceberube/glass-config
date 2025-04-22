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

// Load all rule sets from ./rules directory
const RULE_SETS = {};
fs.readdirSync(path.join(__dirname, 'rules'))
  .filter(file => file.endsWith('.json'))
  .forEach(file => {
    const key = path.basename(file, '.json');
    RULE_SETS[key] = require(path.join(__dirname, 'rules', file));
  });

/**
 * Determine which rule set to use based on order notes
 * e.g. hingedMetalDoors.json keys => 'hingedMetalDoors'
 */
function loadRules(order) {
  const style = order['Select Door Style'] || '';
  // Normalize style to key convention, e.g. "hingedmetaldoors"
  const key = style
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '') + 'doors';
  return RULE_SETS[key] || {};
}

/**
 * Check if a rule's conditions match the order
 */
function matchRule(rule, order) {
  return (rule.conditions || []).every(cond => {
    const actual = order[cond.variable];
    const { operator, values } = cond;
    switch (operator) {
      case 'contains':
        return values.includes(actual);
      case 'notContains':
        return !values.includes(actual);
      case 'gte':
        return parseFloat(actual) >= parseFloat(values[0]);
      case 'lte':
        return parseFloat(actual) <= parseFloat(values[0]);
      default:
        return false;
    }
  });
}

/**
 * Safely evaluate a formula string against order variables
 */
function evaluateFormula(formula, order) {
  // Build argument list
  const args = Object.keys(order);
  const vals = args.map(k => order[k]);
  // Create a function: (var1,var2,...) => formula
  const fn = new Function(...args, `return ${formula};`);
  return fn(...vals);
}

/**
 * Calculate a single property by finding matching rules and evaluating the last one
 */
function calculateProperty(order, rules, propName) {
  const propRules = rules[propName] || [];
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
