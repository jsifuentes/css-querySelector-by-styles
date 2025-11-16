/**
 * CSS Selector with Style Rules - TypeScript Definitions
 */

/**
 * Query selector with CSS rules - returns first matching element
 * @param query - The CSS query with optional style rules in curly braces
 * @param root - Root element to search from (default: document)
 * @returns First matching element or null
 * 
 * @example
 * ```typescript
 * const element = querySelectorWithCssRules('.button { background-color: rgb(40, 167, 69); }');
 * ```
 */
export function querySelectorWithCssRules(
  query: string,
  root?: Document | Element
): Element | null;

/**
 * Query selector all with CSS rules - returns all matching elements
 * @param query - The CSS query with optional style rules in curly braces
 * @param root - Root element to search from (default: document)
 * @returns Array of matching elements
 * 
 * @example
 * ```typescript
 * const elements = querySelectorAllWithCssRules('.card { background-color: rgb(255, 255, 255); }');
 * ```
 */
export function querySelectorAllWithCssRules(
  query: string,
  root?: Document | Element
): Element[];

/**
 * Alias for querySelectorWithCssRules
 */
export const querySelector: typeof querySelectorWithCssRules;

/**
 * Alias for querySelectorAllWithCssRules
 */
export const querySelectorAll: typeof querySelectorAllWithCssRules;

/**
 * Default export containing all functions
 */
declare const CSSQueryWithRules: {
  querySelectorWithCssRules: typeof querySelectorWithCssRules;
  querySelectorAllWithCssRules: typeof querySelectorAllWithCssRules;
  querySelector: typeof querySelectorWithCssRules;
  querySelectorAll: typeof querySelectorAllWithCssRules;
};

export default CSSQueryWithRules;

/**
 * Global declaration for browser script usage
 */
declare global {
  interface Window {
    CSSQueryWithRules: typeof CSSQueryWithRules;
  }
}

