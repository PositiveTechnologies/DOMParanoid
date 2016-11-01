/* global getElementsByTagName: false, window: false, define: false, module: false  */
(function(factory) {
    'use strict';
    var root = typeof window === 'undefined' ? null : window;

    if (typeof define === 'function' && define.amd) {
        define(function() {
            return factory(root);
        });
    } else if (typeof module !== 'undefined') {
        module.exports = factory(root);
    } else {
        root.DOMParanoid = factory(root);
    }
}(function factory(window) {
    'use strict';

    var DOMParanoid = function(window) {
        return factory(window);
    };

    DOMParanoid.version = '0.1.0';

    if (!window || !window.document || window.document.nodeType !== 9) {
        DOMParanoid.isSupported = false;
        return DOMParanoid;
    }
    
    var document = window.document;
    var Node = window.Node;
    var NodeFilter = window.NodeFilter;
    var DOMParser = window.DOMParser;
    var implementation = document.implementation;
    var createNodeIterator = document.createNodeIterator;

    var wholeDocument = false;
    var returnDOM = false;

    var defaultRules = {
        blankTarget: true,
        noopener: true,
        httpsLinks: true,
        httpsForms: true,
        validateURI: {
            validSchemes: ['http', 'https']
        },
        referrerPolicy: {
            policy: 'no-referrer'
        }
    };

    var _parseConfig = function(cfg) {
        /* Shield configuration object from tampering */
        if (typeof cfg !== 'object') {
            cfg = {};
        }
        // Default false
        wholeDocument      = cfg.wholeDocument      ||  false;
        // Default false
        returnDOM          = cfg.returnDOM          ||  false;
    };

    /**
     * _isNode
     *
     * @param object to check whether it's a DOM node
     * @return true is object is a DOM node
     */
    var _isNode = function(obj) {
        return (
            typeof Node === 'object' ? obj instanceof Node : obj &&
                typeof obj === 'object' && typeof obj.nodeType === 'number' &&
                typeof obj.nodeName === 'string'
        );
    };

    var _initDocument = function(dirty) {
        /* Create a HTML document using DOMParser */
        var doc, body;
        try {
            doc = new DOMParser().parseFromString(dirty, 'text/html');
        } catch (e) {}

        /* Some browsers throw, some browsers return null for the code above
           DOMParser with text/html support is only in very recent browsers.
           See #159 why the check here is extra-thorough */
        if (!doc || !doc.documentElement) {
            doc = implementation.createHTMLDocument('');
            body = doc.body;
            body.parentNode.removeChild(body.parentNode.firstElementChild);
            body.outerHTML = dirty;
        }

        /* Work on whole document or just its body */
        if (typeof doc.getElementsByTagName === 'function') {
            return doc.getElementsByTagName(
                wholeDocument ? 'html' : 'body')[0];
        }
        return getElementsByTagName.call(doc,
            wholeDocument ? 'html' : 'body')[0];
    };

    var _createIterator = function(root) {
        return createNodeIterator.call(root.ownerDocument || root,
            root,
            NodeFilter.SHOW_ELEMENT |
                NodeFilter.SHOW_COMMENT |
                NodeFilter.SHOW_TEXT,
            function() {
                return NodeFilter.FILTER_ACCEPT;
            },
            false
        );
    };

    var rules = Object.create(null);

    rules.blankTarget = function(node) {
        if ('target' in node) {
            node.setAttribute('target', '_blank');
        }
        // set non-HTML/MathML links to xlink:show=new
        if (!node.hasAttribute('target') && (node.hasAttribute('xlink:href') || node.hasAttribute('href'))) {
            node.setAttribute('xlink:show', 'new');
        }
    };

    rules.referrerPolicy = function(node, options) {
        var policy = options.policy || defaultRules.referrerPolicy.policy;
        if ('referrerPolicy' in node) {
            node.setAttribute('referrerPolicy', policy);
        }
    };

    rules.noopener = function(node) {
        if (node.nodeName === 'A') {
            node.setAttribute('rel', 'noopener noreferrer');
        }
    };

    rules.httpsLinks = function(node) {
        if (node.nodeName === 'A') {
            if (node.protocol === 'http:') {
                node.protocol = 'https:';
            }
        }
    };
    
    rules.httpsForms = function(node) {
        if (node.nodeName === 'FORM') {
            var anchor = document.createElement('a');
            anchor.href  = node.action;
            if (anchor.protocol === 'http:') {
                anchor.protocol = 'https:';
                node.action = anchor.href;
            }
        }
    };
    
    rules.validateURI = function(node, options) {
        var validSchemes = options.schemes || defaultRules.validateURI.validSchemes;
        // build fitting regex
        var regex = new RegExp('^(' + validSchemes.join('|') + '):', 'gim');
        // build an anchor to map URLs to
        var anchor = document.createElement('a');
        // check all href attributes for validity
        if (node.hasAttribute('href')) {
            anchor.href  = node.getAttribute('href');
            if (anchor.protocol && !anchor.protocol.match(regex)) {
                node.removeAttribute('href');
            }
        }
        // check all action attributes for validity
        if (node.hasAttribute('action')) {
            anchor.href  = node.getAttribute('action');
            if (anchor.protocol && !anchor.protocol.match(regex)) {
                node.removeAttribute('action');
            }
        }
        // check all xlink:href attributes for validity
        if (node.hasAttribute('xlink:href')) {
            anchor.href  = node.getAttribute('xlink:href');
            if (anchor.protocol && !anchor.protocol.match(regex)) {
                node.removeAttribute('xlink:href');
            }
        }
    };

    DOMParanoid.isSupported =
        typeof implementation.createHTMLDocument !== 'undefined' &&
        document.documentMode !== 9;

    /**
     * sanitize
     *
     * @param {String|Node} HTML string or DOM node
     * @param {Object} configuration object
     */
    DOMParanoid.sanitize = function(dirty, options) {
        var body, oldNode, currentNode, nodeIterator, importedNode;

        if (typeof options !== 'object') {
            options = {
                rules: defaultRules
            };
        }
        if (typeof options.rules !== 'object') {
            options.rules = defaultRules;
        }

        /* Make sure we have a string to sanitize.
           DO NOT return early, as this will return the wrong type if
           the user has requested a DOM object rather than a string */
        if (!dirty) {
            dirty = '';
        }

        /* Stringify, in case dirty is an object */
        if (typeof dirty !== 'string' && !_isNode(dirty)) {
            if (typeof dirty.toString !== 'function') {
                throw new TypeError('toString is not a function');
            } else {
                dirty = dirty.toString();
            }
        }

        /* Check we can run. Otherwise fall back or ignore */
        if (!DOMParanoid.isSupported) {
            if (typeof window.toStaticHTML === 'object' ||
                    typeof window.toStaticHTML === 'function') {
                if (typeof dirty === 'string') {
                    return window.toStaticHTML(dirty);
                } else if (_isNode(dirty)) {
                    return window.toStaticHTML(dirty.outerHTML);
                }
            }
            return dirty;
        }

        var configRules = options.rules;
        
        _parseConfig(options);


        if (dirty instanceof Node) {
            /* If dirty is a DOM element, append to an empty document to avoid
               elements being stripped by the parser */
            body = _initDocument('<!-->');
            importedNode = body.ownerDocument.importNode(dirty, true);
            if (importedNode.nodeType === 1 && importedNode.nodeName === 'BODY') {
                /* Node is already a body, use as is */
                body = importedNode;
            } else {
                body.appendChild(importedNode);
            }
        } else if (typeof dirty === 'string') {
            /* Exit directly if we have nothing to do */
            if (!returnDOM && !wholeDocument && dirty.indexOf('<') === -1) {
                return dirty;
            }

            /* Initialize the document to work on */
            body = _initDocument(dirty);

            /* Check we have a DOM node from the data */
            if (!body) {
                return returnDOM ? null : '';
            }
        } else {
            throw new TypeError('Unsupported type of input');
        }

        nodeIterator = _createIterator(body);

        /* Now start iterating over the created document */
        while ((currentNode = nodeIterator.nextNode())) {
            var attributes = currentNode.attributes;
            // Check if we have attributes; if not we might have a text node
            if (!attributes) {
                continue;
            }

            /* Fix IE's strange behavior with manipulated textNodes #89 */
            if (currentNode.nodeType === 3 && currentNode === oldNode) {
                continue;
            }

            // eslint-disable-next-line no-loop-func
            Object.keys(configRules).forEach(function(key) {
                rules[key](currentNode, configRules[key]);
            });

            oldNode = currentNode;
        }

        if (returnDOM) {
            return body;
        }

        return wholeDocument ? body.outerHTML : body.innerHTML;
        
    };

    return DOMParanoid;

}));
