/**
 * Modified es2015 preset with angular-inject
 * @type {{plugins: *[]}}
 */
"use strict";

const es2015 = require("babel-preset-es2015");

// Add our plugin
//
es2015.plugins.push(require("./index.js"));

module.exports = es2015;
