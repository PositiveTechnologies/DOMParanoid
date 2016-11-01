/* global QUnit: false, window: false */
var DOMParanoid = require('paranoid'),
    testSuite = require('test-suite');

QUnit.module('DOMParanoid src');
testSuite(DOMParanoid, window);
