/* global QUnit: false, window: false */
var DOMParanoid = require('paranoid.min'),
    testSuite = require('test-suite');

QUnit.module('DOMParanoid dist');
testSuite(DOMParanoid, window);
