# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

wave-node is a Node.js client library for the WAVE (WebAIM) accessibility testing API. It provides a TypeScript-based interface for analyzing web pages for accessibility issues, similar to how axe-core operates but using the WAVE API service.

## Development Commands

```bash
npm install        # Install dependencies
npm run build      # Build TypeScript to JavaScript
npm run dev        # Build in watch mode
npm test           # Run tests
npm run test:watch # Run tests in watch mode
npm run lint       # Run ESLint
npm run lint:fix   # Run ESLint with auto-fix
```

## Architecture

### Project Structure

```plaintext
wave-node/
├── src/
│   ├── index.ts           # Main entry point and exports
│   ├── wave-client.ts     # Core WaveClient class implementation
│   ├── source-analyzer.ts # Local server and ngrok tunnel management
│   ├── types.ts           # TypeScript interfaces and types
│   └── __tests__/         # Unit tests
├── dist/                  # Built JavaScript files (generated)
├── package.json           # Project configuration
└── tsconfig.json          # TypeScript configuration
```

### Key Components

1. **WaveClient**: Main class that handles API communication
   - Manages authentication via API key
   - Sends HTTP requests to WAVE API
   - Handles error responses and network issues
   - Parses and returns structured analysis results
   - Supports both URL analysis and source code analysis

2. **SourceAnalyzer**: Handles local source code analysis
   - Creates temporary HTTP server for HTML content
   - Manages ngrok tunnel creation and cleanup
   - Provides temporary public URL for WAVE API access
   - Ensures proper resource cleanup after analysis

3. **Type Definitions**: Comprehensive TypeScript interfaces for:
   - API options and configuration
   - Analysis results structure
   - Error types
   - WAVE categories (errors, alerts, features, etc.)

4. **Error Handling**: Custom error types that preserve API error codes and HTTP status codes

### API Integration

- Base URL: `https://wave.webaim.org/api`
- Authentication: API key passed as query parameter
- Response formats: JSON (primary) and XML
- Credit system: Each analysis consumes 1-3 credits depending on options

## Testing Approach

Uses Jest with ts-jest for comprehensive testing:

### Unit Tests (with mocks)

- API client initialization and configuration
- Request parameter construction
- Response parsing and error handling
- Network error scenarios
- ngrok tunnel management (mocked)

### Unit Tests (without mocks)

- TypeScript type definitions validation
- Module exports and factory functions
- Error object construction

### Integration Tests

- Real WAVE API calls (requires `WAVE_API_KEY`)
- Real ngrok tunnel creation (requires `NGROK_AUTHTOKEN`)
- HTTP server functionality
- End-to-end `analyzeSource` workflow

Test commands:

- `npm test` - All tests
- `npm run test:unit` - Unit tests only
- `npm run test:integration` - Integration tests only

## Important Considerations

- The WAVE API requires a valid API key (register at <https://wave.webaim.org/api/>)
- API calls consume credits that must be purchased
- The module is designed to be used in other accessibility testing tools and CI/CD pipelines
