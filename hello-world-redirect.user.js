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
        
        // Check if the request is for hello.world/main.js
        if (url.includes('https://hello.world/main.js')) {
            console.log('Blocking request to hello.world/main.js, redirecting to helloworld.pro/main.js');
            // Replace the URL with the redirect target
            url = url.replace('https://hello.world/main.js', 'https://helloworld.pro/main.js');
            
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
        // Check if the request is for hello.world/main.js
        if (url.includes('https://hello.world/main.js')) {
            console.log('Blocking XMLHttpRequest to hello.world/main.js, redirecting to helloworld.pro/main.js');
            url = url.replace('https://hello.world/main.js', 'https://helloworld.pro/main.js');
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
                    if (value.includes('https://hello.world/main.js')) {
                        console.log('Blocking script src to hello.world/main.js, redirecting to helloworld.pro/main.js');
                        value = value.replace('https://hello.world/main.js', 'https://helloworld.pro/main.js');
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
                    if (src && src.includes('https://hello.world/main.js')) {
                        console.log('Blocking dynamically added script to hello.world/main.js, redirecting to helloworld.pro/main.js');
                        node.setAttribute('src', src.replace('https://hello.world/main.js', 'https://helloworld.pro/main.js'));
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