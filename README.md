# wave-node

Node.js client for the WAVE (WebAIM) accessibility testing API. Written in TypeScript with full type definitions included.

## Features

* **URL Analysis** - Test any public website for accessibility issues
* **Source Analysis** - Test HTML source code without deploying (uses ngrok)
* **TypeScript Support** - Full type definitions included
* **Error Handling** - Comprehensive error messages with status codes
* **Promise-based** - Modern async/await API
* **Configurable** - Timeout, viewport size, authentication options
* **Detailed Reports** - Get errors, alerts, features, structure, ARIA, and contrast information
* **Demo Scripts** - Example implementations included

## Installation

```bash
npm install @afixt/wave-node
```

## Prerequisites

* Node.js 14.0.0 or higher
* A WAVE API key - register at [https://wave.webaim.org/api/](https://wave.webaim.org/api/)
* Internet connection (required for ngrok tunneling when using `analyzeSource`)
* (Optional) ngrok account for `analyzeSource` - free tier available at [https://ngrok.com/](https://ngrok.com/)

## Quick Start

```javascript
const { WaveClient } = require('@afixt/wave-node');

const wave = new WaveClient({ apiKey: 'your-api-key' });

// Analyze a URL
const result = await wave.analyze('https://example.com');
console.log(`Found ${Object.keys(result.categories.error || {}).length} accessibility errors`);

// Analyze HTML source (requires ngrok)
const htmlResult = await wave.analyzeSource('<html>...</html>');
console.log(`Credits remaining: ${htmlResult.statistics.creditsremaining}`);
```

## Usage

### Basic Usage

```javascript
const { WaveClient } = require('@afixt/wave-node');
// or
import { WaveClient } from '@afixt/wave-node';

const wave = new WaveClient({
  apiKey: 'your-api-key'
});

// Analyze a URL
const result = await wave.analyze('https://example.com');

console.log(`Errors: ${Object.keys(result.categories.error || {}).length}`);
console.log(`Alerts: ${Object.keys(result.categories.alert || {}).length}`);
console.log(`Features: ${Object.keys(result.categories.feature || {}).length}`);
```

### Demo Files

The package includes two demo files that show practical examples of using the WAVE API:

#### test-url.js - Analyze a Public URL

To run the demos, first clone the repository:

```bash
git clone https://github.com/karlgroves/wave-node.git
cd wave-node
npm install
npm run build

# Set your API key
export WAVE_API_KEY=your_api_key_here

# Run the URL analysis demo
node src/demo/test-url.js                    # Analyzes example.com
node src/demo/test-url.js https://google.com # Analyzes any public URL
```

This demo:

* Analyzes any public URL for accessibility issues
* Displays a comprehensive report with error counts, alerts, and features
* Shows detailed error information including WCAG guidelines
* Highlights contrast issues with color values and ratios
* Provides actionable feedback and links to the full WAVE report

#### test-source.js - Analyze HTML Source Code

```bash
# Set your credentials
export WAVE_API_KEY=your_api_key_here
export NGROK_AUTHTOKEN=your_ngrok_token_here

# Run the demo
node src/demo/test-source.js                      # Uses sample HTML
node src/demo/test-source.js path/to/file.html   # Analyzes your HTML file
```

This demo:

* Analyzes HTML source code without needing a public URL
* Creates a temporary ngrok tunnel for WAVE API access
* Includes sample HTML with both good and bad accessibility practices
* Shows how to analyze local development files
* Demonstrates the full `analyzeSource()` workflow

Both demos include comprehensive error handling and helpful messages for common issues like missing API keys or insufficient credits.

### TypeScript Usage

```typescript
import { WaveClient, WaveAnalysisResult } from '@afixt/wave-node';

const wave = new WaveClient({
  apiKey: process.env.WAVE_API_KEY!,
  timeout: 60000 // 60 seconds
});

try {
  const result: WaveAnalysisResult = await wave.analyze('https://example.com', {
    reporttype: 1,
    viewportwidth: 1200,
    viewportheight: 800
  });

  // Process errors
  if (result.categories.error) {
    for (const [errorType, errorData] of Object.entries(result.categories.error)) {
      console.log(`${errorType}: ${errorData.count} instances`);
      console.log(`Description: ${errorData.description}`);
    }
  }
} catch (error) {
  console.error('Analysis failed:', error.message);
}
```

### Analyzing HTML Source

You can analyze HTML source code directly without needing a public URL:

```javascript
const htmlSource = `
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Test Page</title>
</head>
<body>
    <h1>Welcome</h1>
    <img src="logo.png">
    <p>This is a test page.</p>
</body>
</html>
`;

const result = await wave.analyzeSource(htmlSource);
console.log(`Errors found: ${Object.keys(result.categories.error || {}).length}`);
```

#### ngrok Configuration

`analyzeSource` uses ngrok to create a temporary public URL for the WAVE API. While ngrok works without authentication for basic usage, you may want to set up an authtoken for:

* Higher rate limits
* Longer session times
* Custom domains (paid plans)

To configure ngrok with an authtoken:

1. Sign up for a free ngrok account at [https://ngrok.com/](https://ngrok.com/)
2. Get your authtoken from the ngrok dashboard
3. Set it using one of these methods:

##### Option 1: Environment Variable

```bash
export NGROK_AUTHTOKEN=your_authtoken_here
```

##### Option 2: ngrok Configuration File

```bash
ngrok config add-authtoken your_authtoken_here
```

##### Option 3: Programmatically

```javascript
import { setAuthtoken } from '@ngrok/ngrok';

// Set authtoken before using analyzeSource
await setAuthtoken('your_authtoken_here');

// Then use wave.analyzeSource as normal
const result = await wave.analyzeSource(htmlSource);
```

**Note**: The module will work without an authtoken, but you may encounter rate limits with heavy usage. This is especially true if using as part of CI/ CD or running a large set of automated functional testing

### Advanced Options

```javascript
const result = await wave.analyze('https://example.com', {
  reporttype: 2,        // 1-4, controls level of detail
  format: 'json',       // 'json' or 'xml'
  viewportwidth: 1920,  // Viewport width for analysis (default: 1200)
  viewportheight: 1080, // Viewport height for analysis
  evaldelay: 2000,      // Delay before evaluation in ms (default: 250)
  username: 'user',     // Username for authenticated pages
  password: 'pass',     // Password for authenticated pages
  useragent: 'Mozilla/5.0...' // Custom user agent string
});

// Options work the same way with analyzeSource
const sourceResult = await wave.analyzeSource(htmlSource, {
  reporttype: 2,
  viewportwidth: 1920
});
```

#### Report Types

* **Type 1** (1 credit): Basic statistics only
* **Type 2** (2 credits): Includes detailed error/alert/feature listings
* **Type 3** (3 credits): Adds XPath selectors for elements
* **Type 4** (3 credits): Adds CSS selectors for elements

## API Reference

### WaveClient

#### Constructor

```typescript
new WaveClient(options: WaveOptions)
```

Options:

* `apiKey` (required): Your WAVE API key
* `baseUrl` (optional): API base URL (default: `https://wave.webaim.org/api`)
* `timeout` (optional): Request timeout in milliseconds (default: 30000)

#### Methods

##### analyze(url: string, options?: WaveAnalysisOptions): Promise&lt;WaveAnalysisResult&gt;

Analyzes a URL for accessibility issues.

Parameters:

* `url`: The URL to analyze (must be publicly accessible)
* `options`: Optional analysis parameters (see below)

##### analyzeSource(source: string, options?: WaveAnalysisOptions): Promise&lt;WaveAnalysisResult&gt;

Analyzes HTML source code for accessibility issues by creating a temporary public URL via ngrok.

Parameters:

* `source`: HTML source code as a string (can include inline CSS and JavaScript)
* `options`: Optional analysis parameters (see below)

###### How it works

1. Creates a local HTTP server serving your HTML source
2. Establishes an ngrok tunnel to make it publicly accessible
3. Sends the ngrok URL to WAVE API for analysis
4. Automatically cleans up the server and tunnel after completion

###### Requirements

* Active internet connection
* Port availability for local server (uses random port)
* Optional: ngrok authtoken for extended usage

#### Analysis Options

Both `analyze` and `analyzeSource` accept the following options:

* `reporttype`: Level of report detail (1-4, default: 1)
* `format`: Response format ('json' or 'xml', default: 'json')
* `viewportwidth`: Browser viewport width in pixels (default: 1200)
* `viewportheight`: Browser viewport height in pixels
* `evaldelay`: Delay before evaluation in milliseconds (default: 250)
* `username`: Username for HTTP authentication
* `password`: Password for HTTP authentication
* `useragent`: Custom user agent string for browser simulation

### Response Structure

The analysis result includes:

* `status`: Success status and HTTP status code
* `statistics`: Page statistics including title, URL, credits remaining
* `categories`: Accessibility findings organized by type
  * `error`: Accessibility errors
  * `alert`: Accessibility alerts
  * `feature`: Accessibility features
  * `structure`: Structural elements
  * `aria`: ARIA usage
  * `contrast`: Contrast issues

## Error Handling

The client throws `WaveApiError` for API-related errors:

```javascript
try {
  const result = await wave.analyze('https://example.com');
} catch (error) {
  if (error.code === 'INVALID_KEY') {
    console.error('Invalid API key');
  } else if (error.statusCode === 429) {
    console.error('Rate limit exceeded');
  } else {
    console.error('Error:', error.message);
  }
}
```

## Credits and Pricing

Each API request consumes credits:

* Basic page analysis: 1 credit
* Advanced features: 2-3 credits

Monitor your remaining credits:

```javascript
const result = await wave.analyze('https://example.com');
console.log(`Credits remaining: ${result.statistics.creditsremaining}`);
```

## License

MIT

## Troubleshooting

### analyzeSource Issues

#### Error: "Failed to connect to ngrok"

* Ensure you have an active internet connection
* Check if your firewall is blocking ngrok
* Try setting an authtoken (see ngrok Configuration above)

#### Error: "ngrok tunnel expired"

* Free ngrok accounts have session limits
* Consider setting up an authtoken for longer sessions
* The module automatically retries once on tunnel errors

#### Timeout errors

* Increase the timeout in WaveClient options
* Check if the HTML contains external resources that are slow to load
* Consider using the `evaldelay` option to give the page more time to render

## Security Considerations

When using `analyzeSource`:

* The HTML content is temporarily exposed via a public ngrok URL
* The server and tunnel are automatically cleaned up after analysis
* Consider the sensitivity of your HTML content before using this feature
* For highly sensitive content, use the standard `analyze()` method with your own secure hosting

## Testing

The module includes comprehensive test coverage with both unit and integration tests.

### Running Tests

```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests only (requires API keys)
npm run test:integration

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Integration Tests

Integration tests require environment variables:

```bash
export WAVE_API_KEY=your_wave_api_key
export NGROK_AUTHTOKEN=your_ngrok_token  # Optional, for analyzeSource tests
npm run test:integration
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on the process for submitting pull requests.

All contributions are expected to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

### Development Scripts

```bash
npm run build       # Build TypeScript to JavaScript
npm run dev         # Build in watch mode
npm run lint        # Run ESLint
npm run lint:fix    # Fix linting issues
npm test            # Run all tests
npm run test:unit   # Run unit tests only
npm run test:integration # Run integration tests (requires API keys)
```

## Additional Resources

### WAVE Documentation API

To get detailed information about specific WAVE issue types, you can use the documentation API:

```text
https://wave.webaim.org/api/docs?id={item_id}
```

For a full list of all WAVE issue types and their descriptions:

```text
https://wave.webaim.org/api/docs
```

## Links

* [GitHub Repository](https://github.com/karlgroves/wave-node)
* [NPM Package](https://www.npmjs.com/package/@afixt/wave-node)
* [WAVE API Documentation](https://wave.webaim.org/api/)
* [WAVE API Details](https://wave.webaim.org/api/details)
* [WAVE Web Interface](https://wave.webaim.org/)
* [WebAIM](https://webaim.org/)
