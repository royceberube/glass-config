// index.js - bundle entry point for browser

// load our CommonJS modules
const { parseNotes } = require("./parser.js");
const { calculateAll } = require("./engine.js");

// expose to global window object
if (typeof window !== "undefined") {
  window.parseNotes = parseNotes;
  window.calculateAll = calculateAll;
}

// For Node.js or other CommonJS consumers
module.exports = {
  parseNotes,
  calculateAll,
};
