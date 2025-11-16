/**
 * CSS Selector with Style Rules - Query DOM elements by both selector and computed styles
 * @module css-querySelector-by-styles
 */

(function (global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    // CommonJS
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define([], factory);
  } else {
    // Browser globals
    global.CSSQueryWithRules = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Parse the custom CSS query syntax
   * @param {string} query - The CSS query with optional style rules
   * @returns {Array} - Array of query parts with their types and rules
   */
  function parseQuery(query) {
    const parts = [];
    let i = 0;
    let currentSelector = '';
    let inRules = false;
    let currentRules = '';
    let braceDepth = 0;
    let inQuotes = false;
    let quoteChar = '';

    while (i < query.length) {
      const char = query[i];

      // Track if we're inside quotes
      if (!inRules && (char === '"' || char === "'")) {
        if (!inQuotes) {
          inQuotes = true;
          quoteChar = char;
        } else if (char === quoteChar && query[i - 1] !== '\\') {
          inQuotes = false;
          quoteChar = '';
        }
        currentSelector += char;
        i++;
        continue;
      }

      if (!inRules) {
        // Only treat { as rules start if not inside quotes
        if (char === '{' && !inQuotes) {
          // Determine the relationship type based on what precedes the {
          let relationship = 'filter'; // default: no space before {
          let selector = currentSelector.trim();

          // Look at the selector without trailing/leading whitespace
          const trimmedSelector = currentSelector.trim();
          
          // Check what comes before the { (ignoring formatting whitespace)
          if (trimmedSelector.endsWith('>')) {
            relationship = 'child';
            // Remove the > from the selector
            selector = trimmedSelector.slice(0, -1).trim();
          } else {
            // Check if there's a SINGLE space before the brace (not multiple spaces which are just formatting)
            // We detect this by checking if the original had trailing space and it was exactly one space
            const trimmedEnd = currentSelector.trimEnd();
            const spacesBeforeBrace = currentSelector.length - trimmedEnd.length;
            
            // If there was exactly one space, treat as descendant mode
            // Multiple spaces are treated as formatting and ignored (filter mode)
            if (spacesBeforeBrace === 1) {
              relationship = 'descendant';
            }
          }

          parts.push({
            type: 'selector-with-rules',
            selector: selector,
            relationship: relationship,
            rules: ''
          });

          currentSelector = '';
          inRules = true;
          braceDepth = 1;
        } else {
          currentSelector += char;
        }
      } else {
        if (char === '{') {
          braceDepth++;
          currentRules += char;
        } else if (char === '}') {
          braceDepth--;
          if (braceDepth === 0) {
            // End of rules block
            parts[parts.length - 1].rules = currentRules.trim();
            currentRules = '';
            inRules = false;
          } else {
            currentRules += char;
          }
        } else {
          currentRules += char;
        }
      }

      i++;
    }

    // Handle any remaining selector
    if (currentSelector.trim()) {
      parts.push({
        type: 'selector',
        selector: currentSelector.trim()
      });
    }

    return parts;
  }

  /**
   * Parse CSS rules string into an object
   * @param {string} rulesString - CSS rules as a string
   * @returns {Object} - Object mapping property names to values
   */
  function parseCSSRules(rulesString) {
    const rules = {};
    const lines = rulesString.split(';').map(line => line.trim()).filter(line => line);

    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) continue;

      const property = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();

      if (property && value) {
        rules[property] = value;
      }
    }

    return rules;
  }

  /**
   * Normalize CSS property names (handle vendor prefixes, camelCase, etc.)
   * @param {string} property - CSS property name
   * @returns {string} - Normalized property name
   */
  function normalizePropertyName(property) {
    // Convert kebab-case to camelCase for getComputedStyle
    return property.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
  }

  /**
   * Convert hex color to rgb format
   * @param {string} hex - Hex color (e.g., #ff0000 or #f00)
   * @returns {string} - RGB format (e.g., rgb(255,0,0))
   */
  function hexToRgb(hex) {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    if (hex.length === 3) {
      hex = hex.split('').map(function(h) { return h + h; }).join('');
    }
    
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  /**
   * Convert HSL color to RGB format
   * @param {number} h - Hue (0-360)
   * @param {number} s - Saturation (0-100)
   * @param {number} l - Lightness (0-100)
   * @returns {string} - RGB format (e.g., rgb(255,0,0))
   */
  function hslToRgb(h, s, l) {
    h = h / 360;
    s = s / 100;
    l = l / 100;
    
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = function(p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    return 'rgb(' + Math.round(r * 255) + ',' + Math.round(g * 255) + ',' + Math.round(b * 255) + ')';
  }

  /**
   * Normalize CSS values for comparison
   * @param {string} value - CSS value
   * @returns {string} - Normalized value
   */
  function normalizeCSSValue(value) {
    if (!value) return '';
    
    // Trim and lowercase
    value = value.trim().toLowerCase();
    
    // Convert hex colors to rgb format
    if (value.match(/^#[0-9a-f]{3,6}$/i)) {
      value = hexToRgb(value);
    }
    
    // Convert HSL colors to rgb format
    const hslMatch = value.match(/hsl\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)%\s*,\s*(\d+(?:\.\d+)?)%\s*\)/i);
    if (hslMatch) {
      const h = parseFloat(hslMatch[1]);
      const s = parseFloat(hslMatch[2]);
      const l = parseFloat(hslMatch[3]);
      value = hslToRgb(h, s, l);
    }
    
    // Convert named colors to rgb (handle common ones)
    const namedColors = {
      'transparent': 'rgba(0,0,0,0)',
      'black': 'rgb(0,0,0)',
      'white': 'rgb(255,255,255)',
      'red': 'rgb(255,0,0)',
      'green': 'rgb(0,128,0)',
      'blue': 'rgb(0,0,255)',
      'yellow': 'rgb(255,255,0)',
      'cyan': 'rgb(0,255,255)',
      'magenta': 'rgb(255,0,255)',
      'gray': 'rgb(128,128,128)',
      'grey': 'rgb(128,128,128)'
    };
    
    if (namedColors[value]) {
      value = namedColors[value];
    }
    
    // Remove all whitespace for consistent comparison
    // This handles rgb(255, 0, 0) vs rgb(255,0,0) and extra spaces
    value = value.replace(/\s+/g, '');
    
    // Normalize rgb/rgba color formats - remove spaces after commas
    value = value.replace(/rgba?\([^)]+\)/g, function(match) {
      return match.replace(/\s+/g, '');
    });
    
    return value;
  }

  /**
   * Check if an element matches the given CSS rules
   * @param {Element} element - DOM element to check
   * @param {Object} rules - CSS rules object
   * @returns {boolean} - True if element matches all rules
   */
  function elementMatchesRules(element, rules) {
    const computedStyle = window.getComputedStyle(element);

    for (const [property, expectedValue] of Object.entries(rules)) {
      const normalizedProperty = normalizePropertyName(property);
      const actualValue = computedStyle[normalizedProperty] || computedStyle.getPropertyValue(property);
      
      const normalizedExpected = normalizeCSSValue(expectedValue);
      const normalizedActual = normalizeCSSValue(actualValue);

      if (normalizedExpected !== normalizedActual) {
        return false;
      }
    }

    return true;
  }

  /**
   * Execute a query with CSS rules
   * @param {string} query - The CSS query with optional style rules
   * @param {Element} root - Root element to search from (default: document)
   * @param {boolean} findAll - Whether to find all matches or just the first
   * @returns {Element|NodeList|null} - Matching element(s) or null
   */
  function executeQuery(query, root = document, findAll = false) {
    const parts = parseQuery(query);
    let currentElements = [root];
    let results = [];
    let previousFilterSelectors = []; // Track selectors from previous filter blocks

    for (let partIndex = 0; partIndex < parts.length; partIndex++) {
      const part = parts[partIndex];
      const nextResults = [];

      if (part.type === 'selector') {
        // Simple selector without rules
        for (const element of currentElements) {
          const matches = element.querySelectorAll(part.selector);
          nextResults.push(...matches);
        }
        currentElements = nextResults;
      } else if (part.type === 'selector-with-rules') {
        const rules = parseCSSRules(part.rules);

        if (part.relationship === 'filter') {
          // No space before {: get elements matching selector, then filter by rules
          for (const element of currentElements) {
            const selector = part.selector || '*';
            
            // Find all matching elements, but exclude those within elements
            // that match any previous filter selector (to prevent descending into nested structures)
            const matches = [];
            const allMatches = element.querySelectorAll(selector);
            
            for (const match of allMatches) {
              // Check if this match is within an element that matches a previous filter selector
              let shouldExclude = false;
              if (previousFilterSelectors.length > 0) {
                let ancestor = match.parentElement;
                while (ancestor && ancestor !== element) {
                  for (const prevSelector of previousFilterSelectors) {
                    if (ancestor.matches(prevSelector)) {
                      shouldExclude = true;
                      break;
                    }
                  }
                  if (shouldExclude) break;
                  ancestor = ancestor.parentElement;
                }
              }
              
              if (!shouldExclude && elementMatchesRules(match, rules)) {
                nextResults.push(match);
              }
            }
          }
          
          // Track this filter selector for future filter blocks
          if (part.selector) {
            previousFilterSelectors.push(part.selector);
          }
        } else if (part.relationship === 'descendant') {
          // Space before {: search recursively for elements matching rules
          for (const element of currentElements) {
            let searchRoot = element;
            
            // First apply the selector if provided
            if (part.selector) {
              const matches = element.querySelectorAll(part.selector);
              for (const match of matches) {
                // Get all descendants
                const allDescendants = match.querySelectorAll('*');
                for (const descendant of allDescendants) {
                  if (elementMatchesRules(descendant, rules)) {
                    nextResults.push(descendant);
                  }
                }
              }
            } else {
              // No selector, just search all descendants of current element
              const allDescendants = element.querySelectorAll('*');
              for (const descendant of allDescendants) {
                if (elementMatchesRules(descendant, rules)) {
                  nextResults.push(descendant);
                }
              }
            }
          }
        } else if (part.relationship === 'child') {
          // > before {: search immediate children only
          for (const element of currentElements) {
            let searchRoots = [element];
            
            // First apply the selector if provided
            if (part.selector) {
              searchRoots = [];
              const matches = element.querySelectorAll(part.selector);
              searchRoots.push(...matches);
            }

            for (const searchRoot of searchRoots) {
              const children = searchRoot.children;
              for (const child of children) {
                if (elementMatchesRules(child, rules)) {
                  nextResults.push(child);
                }
              }
            }
          }
        }

        currentElements = nextResults;
      }
    }

    // Remove duplicates
    const uniqueResults = [...new Set(currentElements)];

    if (findAll) {
      return uniqueResults;
    } else {
      return uniqueResults.length > 0 ? uniqueResults[0] : null;
    }
  }

  /**
   * Query selector with CSS rules - returns first matching element
   * @param {string} query - The CSS query with optional style rules
   * @param {Element} root - Root element to search from (default: document)
   * @returns {Element|null} - First matching element or null
   */
  function querySelectorWithCssRules(query, root = document) {
    return executeQuery(query, root, false);
  }

  /**
   * Query selector all with CSS rules - returns all matching elements
   * @param {string} query - The CSS query with optional style rules
   * @param {Element} root - Root element to search from (default: document)
   * @returns {Array<Element>} - Array of matching elements
   */
  function querySelectorAllWithCssRules(query, root = document) {
    return executeQuery(query, root, true);
  }

  // Export the public API
  return {
    querySelectorWithCssRules,
    querySelectorAllWithCssRules,
    querySelector: querySelectorWithCssRules,
    querySelectorAll: querySelectorAllWithCssRules
  };
});

