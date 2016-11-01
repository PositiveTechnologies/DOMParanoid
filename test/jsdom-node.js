/* eslint-disable no-process-exit */
/* global QUnit */
'use strict';

// Test DOMParanoid + jsdom using Node.js (version 4 and up)
const
    domparanoid = require('../src/paranoid'),
    jsdom = require('jsdom'),
    testSuite = require('./test-suite');

require('qunit-parameterize/qunit-parameterize');

QUnit.assert.contains = function(needle, haystack, message) {
    const result = haystack.indexOf(needle) > -1;
    this.push(result, needle, haystack, message);
};

QUnit.config.autostart = false;

jsdom.env({
    html: '<html><head></head><body><div id="qunit-fixture"></div></body></html>',
    // scripts: ['node_modules/jquery/dist/jquery.js'],
    features: {
        // needed for firing the onload event for about:blank iframes
        ProcessExternalResources: ['script']
    },
    done(err, window) {
        QUnit.module('DOMParanoid in jsdom');
        if (err) {
            console.error('Unexpected error returned by jsdom.env():', err, err.stack);
            process.exit(1);
        }

        const DOMParanoid = domparanoid(window);
        if (!DOMParanoid.isSupported) {
            console.error('Unexpected error returned by jsdom.env():', err, err.stack);
            process.exit(1);
        }

        testSuite(DOMParanoid, window);
        QUnit.start();
    }
});
