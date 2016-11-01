/* global QUnit: false */
/* eslint-disable object-curly-newline */

module.exports = function(DOMParanoid, window) {

    var helpers = {
        // Determine if tests are running in Chrome
        isChrome: window.navigator && window.navigator.userAgent.toLowerCase().indexOf('chrome') > -1
    };

    QUnit.test('DOMParanoid init', function(assert) {
        assert.equal(typeof DOMParanoid.sanitize, 'function');
        assert.equal(DOMParanoid.isSupported, true);
    });

    QUnit.test('Blank target test', function(assert) {
        var node = DOMParanoid.sanitize('<a>', {returnDOM: true, rules: {blankTarget: true}}).firstChild;
        assert.equal('target' in node, true);
        assert.equal(node.target, '_blank');
    });
    
    QUnit.test('Noopener test', function(assert) {
        var node = DOMParanoid.sanitize('<a href="http://example.com/">Link</a>', {returnDOM: true, rules: {noopener: true}}).firstChild;
        assert.equal('rel' in node, true);
        assert.equal(node.rel, 'noopener noreferrer');
    });

    QUnit.test('HTTPS links test', function(assert) {
        var node = DOMParanoid.sanitize('<a href="http://example.com/">Link</a>', {returnDOM: true, rules: {httpsLinks: true}}).firstChild;
        assert.equal(node.href, 'https://example.com/');
    });

    QUnit.test('HTTPS Forms test', function(assert) {
        var node = DOMParanoid.sanitize('<form action="http://example.com/"><input type=text name="a"></form>', {returnDOM: true, rules: {httpsForms: true}}).firstChild;
        assert.equal(node.action, 'https://example.com/');
    });

    QUnit.test('URI validation test', function(assert) {
        var nodes = DOMParanoid.sanitize('<a href="http://example.com">Link</a><form action="https://example.com/"><input type=text name="a"></form>', {returnDOM: true, rules: {validateURI: true}});
        assert.equal(nodes.children.length, 2);
        var a = nodes.children[0];
        var form = nodes.children[1];
        assert.equal(a.href, 'http://example.com/');
        assert.equal(form.action, 'https://example.com/');
    });
    
    QUnit.test('Custom URI validation test', function(assert) {
        var nodes = DOMParanoid.sanitize('<a href="http://example.com">Link</a><form action="https://example.com/"><input type=text name="a"></form>', {returnDOM: true, rules: {validateURI: {validSchemes: ['http', 'https']}}});
        assert.equal(nodes.children.length, 2);
        var a = nodes.children[0];
        var form = nodes.children[1];
        assert.equal(a.href, 'http://example.com/');
        assert.equal(form.action, 'https://example.com/');
    });
    
    QUnit.test('Default rules test', function(assert) {
        var nodes = DOMParanoid.sanitize('<a href="http://example.com">Link</a><form action="https://example.com/"><input type=text name="a"></form>', {returnDOM: true});
        assert.equal(true, true);
        assert.equal(nodes.children.length, 2);
        var a = nodes.children[0];
        var form = nodes.children[1];
        assert.equal(a.href, 'https://example.com/');
        assert.equal('target' in a, true);
        assert.equal(a.target, '_blank');
        assert.equal('rel' in a, true);
        assert.equal(a.rel, 'noopener noreferrer');
        assert.equal(form.action, 'https://example.com/');
        assert.equal('target' in form, true);
        assert.equal(form.target, '_blank');
    });

    QUnit.test('Chrome: Referrer policy test', function(assert) {
        if (!helpers.isChrome) {
            assert.ok(true, 'Skip referrer policy test');
            return;
        }
        var node = DOMParanoid.sanitize('<a>', {returnDOM: true, rules: {referrerPolicy: true}}).firstChild;
        assert.equal('referrerPolicy' in node, true);
        assert.equal(node.referrerPolicy, 'no-referrer');
    });
    
    QUnit.test('Chrome: Custom referrer policy test', function(assert) {
        if (!helpers.isChrome) {
            assert.ok(true, 'Skip referrer policy test');
            return;
        }
        var node = DOMParanoid.sanitize('<a>', {returnDOM: true, rules: {referrerPolicy: {policy: 'origin'}}}).firstChild;
        assert.equal('referrerPolicy' in node, true);
        assert.equal(node.referrerPolicy, 'origin');
    });

    QUnit.test('Blank target test for string', function(assert) {
        var html = DOMParanoid.sanitize('<a>', {rules: {blankTarget: true}});
        assert.equal(html, '<a target="_blank"></a>');
    });

    QUnit.test('Noopener test for string', function(assert) {
        var html = DOMParanoid.sanitize('<a>', {rules: {noopener: true}});
        assert.equal(html, '<a rel="noopener noreferrer"></a>');
    });

};
