// ==UserScript==
// @name         Hello World Request Redirect
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Block requests to hello.world/main.js and redirect to helloworld.pro/main.js
// @author       You
// @match        *://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';
    
    // Configuration - URLs to redirect
    const BLOCKED_URL = 'https://hello.world/main.js';
    const REDIRECT_URL = 'https://helloworld.pro/main.js';
    
    // Store the original fetch function
    const originalFetch = window.fetch;
    
    // Override the fetch function
    window.fetch = function(input, init) {
        let url = input;
        
        // Convert Request object to URL string if needed
        if (input instanceof Request) {
            url = input.url;
        } else if (typeof input === 'string') {
            url = input;
        }
        
        // Check if the request is for the blocked URL
        if (url.includes(BLOCKED_URL)) {
            console.log(`Blocking request to ${BLOCKED_URL}, redirecting to ${REDIRECT_URL}`);
            // Replace the URL with the redirect target
            url = url.replace(BLOCKED_URL, REDIRECT_URL);
            
            // If it was a Request object, create a new one with the new URL
            if (input instanceof Request) {
                input = new Request(url, input);
            } else {
                input = url;
            }
        }
        
        // Call the original fetch with the potentially modified URL
        return originalFetch.call(this, input, init);
    };
    
    // Override XMLHttpRequest for additional coverage
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
        // Check if the request is for the blocked URL
        if (url.includes(BLOCKED_URL)) {
            console.log(`Blocking XMLHttpRequest to ${BLOCKED_URL}, redirecting to ${REDIRECT_URL}`);
            url = url.replace(BLOCKED_URL, REDIRECT_URL);
        }
        
        // Call the original open method with the potentially modified URL
        return originalXHROpen.call(this, method, url, async, user, password);
    };
    
    // Override dynamic script loading
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
        const element = originalCreateElement.call(this, tagName);
        
        // If it's a script element, override the src setter
        if (tagName.toLowerCase() === 'script') {
            const originalSetter = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src').set;
            Object.defineProperty(element, 'src', {
                set: function(value) {
                    if (value.includes(BLOCKED_URL)) {
                        console.log(`Blocking script src to ${BLOCKED_URL}, redirecting to ${REDIRECT_URL}`);
                        value = value.replace(BLOCKED_URL, REDIRECT_URL);
                    }
                    originalSetter.call(this, value);
                },
                get: function() {
                    return this.getAttribute('src');
                }
            });
        }
        
        return element;
    };
    
    // Monitor for dynamically added script tags
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1 && node.tagName === 'SCRIPT') { // Element node and script tag
                    const src = node.getAttribute('src');
                    if (src && src.includes(BLOCKED_URL)) {
                        console.log(`Blocking dynamically added script to ${BLOCKED_URL}, redirecting to ${REDIRECT_URL}`);
                        node.setAttribute('src', src.replace(BLOCKED_URL, REDIRECT_URL));
                    }
                }
            });
        });
    });
    
    // Start observing
    observer.observe(document, {
        childList: true,
        subtree: true
    });
    
    console.log('Hello World Request Redirect script loaded successfully');
})();