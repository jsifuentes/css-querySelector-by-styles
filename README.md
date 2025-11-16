# CSS Selector with Style Rules

A JavaScript library that extends CSS selectors to query DOM elements not just by their structure, but also by their **computed CSS styles**. This allows you to find elements based on how they're actually rendered in the browser.

Had this idea one day while looking to make an extension for a site using randomized CSS class names.

## Installation

### Browser (Script Tag)

```html
<script src="css-querySelector-by-styles.js"></script>
<script>
  const { querySelectorWithCssRules, querySelectorAllWithCssRules } = CSSQueryWithRules;
  
  const element = querySelectorWithCssRules('.button { background-color: rgb(40, 167, 69); }');
</script>
```

### ES6 Module

```javascript
import { querySelectorWithCssRules, querySelectorAllWithCssRules } from './css-querySelector-by-styles.js';

const element = querySelectorWithCssRules('.button { background-color: rgb(40, 167, 69); }');
```

### CommonJS

```javascript
const { querySelectorWithCssRules, querySelectorAllWithCssRules } = require('./css-querySelector-by-styles.js');

const element = querySelectorWithCssRules('.button { background-color: rgb(40, 167, 69); }');
```

## Usage

### Basic Syntax

The library extends CSS selector syntax by allowing you to specify CSS rules in curly braces `{}`:

```javascript
querySelectorWithCssRules('selector { property: value; }')
```

### Three Search Modes

#### 1. Filter Mode (No space before `{`)

Finds elements matching the selector, then filters them by CSS rules:

```javascript
// Find buttons with green background
const button = querySelectorWithCssRules('.button{ background-color: rgb(40, 167, 69); }');
```

#### 2. Descendant Mode (Space before `{`)

Searches recursively under elements matching the selector:

```javascript
// Find any descendants of .container that have flex display
const flexElements = querySelectorAllWithCssRules('.container { display: flex; }');
```

#### 3. Child Mode (`>` before `{`)

Searches only immediate children:

```javascript
// Find immediate children of nav with specific padding
const navItems = querySelectorAllWithCssRules('nav > { padding: 10px; }');
```

## Examples

### Example 1: Find Elements by Computed Styles

```javascript
// Find the main element with specific flex properties
const main = querySelectorWithCssRules(`body #react-root main {
  align-items: stretch;
  background-color: rgba(0, 0, 0, 0);
  border: 0px solid black;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 0;
}`);
```

### Example 2: Find All Elements with Specific Style

```javascript
// Find all cards with white background
const whiteCards = querySelectorAllWithCssRules(`.card {
  background-color: rgb(255, 255, 255);
}`);

console.log(`Found ${whiteCards.length} white cards`);
```

### Example 3: Complex Multi-Part Query

```javascript
// Find a specific button within a container
const specificButton = querySelectorWithCssRules(`
  .container .button-group .button {
    background-color: rgb(40, 167, 69);
    color: rgb(255, 255, 255);
    border-radius: 4px;
  }
`);
```

### Example 4: Search Root Context

```javascript
// Search from a specific element instead of document
const container = document.querySelector('.my-container');
const element = querySelectorWithCssRules(
  '.item { display: flex; }',
  container  // Use container as root
);
```

## API Reference

### `querySelectorWithCssRules(query, root = document)`

Returns the **first** element that matches the query.

**Parameters:**
- `query` (string): CSS selector with optional style rules in `{}`
- `root` (Element): Root element to search from (default: `document`)

**Returns:** `Element | null`

**Example:**
```javascript
const element = querySelectorWithCssRules('.card { background-color: rgb(255, 250, 205); }');
```

### `querySelectorAllWithCssRules(query, root = document)`

Returns **all** elements that match the query.

**Parameters:**
- `query` (string): CSS selector with optional style rules in `{}`
- `root` (Element): Root element to search from (default: `document`)

**Returns:** `Array<Element>`

**Example:**
```javascript
const elements = querySelectorAllWithCssRules('.button { background-color: rgb(0, 123, 255); }');
elements.forEach(el => console.log(el.textContent));
```

## How It Works

1. **Parsing**: The query is parsed to separate CSS selectors from style rules
2. **Element Selection**: Elements are selected using standard `querySelector`/`querySelectorAll`
3. **Style Matching**: `window.getComputedStyle()` is used to get each element's computed styles
4. **Filtering**: Elements are filtered based on whether their computed styles match the specified rules

## CSS Value Normalization

The library automatically normalizes CSS values for comparison:
- Colors: `rgba(0, 0, 0, 0)` matches `rgba(0,0,0,0)`
- Whitespace is normalized
- Values are case-insensitive

## Browser Support

Works in all browsers that support:
- `querySelector` / `querySelectorAll`
- `window.getComputedStyle()`
- ES5+

This includes all modern browsers and IE9+.

## Use Cases

- **Testing**: Find elements by their visual appearance in automated tests
- **Debugging**: Identify elements with specific computed styles
- **Dynamic Styling**: Find elements affected by CSS cascades
- **Accessibility**: Locate elements with specific display properties
- **Browser Automation**: More precise element selection in tools like Puppeteer/Playwright

## Advanced Examples

### Testing Frameworks

```javascript
// In a test
it('should have primary buttons with green background', () => {
  const primaryButtons = querySelectorAllWithCssRules(`
    .button.primary {
      background-color: rgb(40, 167, 69);
      color: rgb(255, 255, 255);
    }
  `);
  
  expect(primaryButtons.length).toBeGreaterThan(0);
});
```

### Finding Hidden Elements

```javascript
// Find all hidden elements
const hiddenElements = querySelectorAllWithCssRules(`* {
  display: none;
}`);
```

### Responsive Design Testing

```javascript
// Find all elements that are flex containers in mobile view
const flexContainers = querySelectorAllWithCssRules(`* {
  display: flex;
}`);
```

## Edge Cases & Compatibility

The library handles many CSS edge cases including:
- Color format normalization (hex, HSL, named colors → RGB)
- Whitespace handling in queries
- Braces in attribute selectors
- Complex CSS values (transforms, gradients, calc())
- SVG elements
- Modern CSS features (grid, flexbox, sticky positioning)

For detailed information about edge cases, browser compatibility, and known limitations, see [EDGE_CASES.md](./EDGE_CASES.md).

## Limitations

- Only matches computed styles (not inline styles or CSS rules directly)
- CSS value comparison is exact (after normalization)
- Must query using longhand properties (e.g., `margin-top` not `margin`)
- CSS variables must be queried by their computed value
- Performance depends on the complexity of the query and DOM size

## Testing

This library includes a test suite using Vitest.

### Running Tests

```bash
npm install
npm test
```

### Test Coverage

The test suite covers:
- All three search modes (filter, descendant, child)
- CSS value normalization
- Complex selectors and queries
- Edge cases and error handling
- Real-world scenarios
- Performance benchmarks

