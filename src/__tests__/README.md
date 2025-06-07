# Test Suite Documentation

This directory contains the test suite for the wave-node module.

## Test Structure

### Unit Tests (with mocks)

- `wave-client.test.ts` - Tests for WaveClient using mocked dependencies
- `source-analyzer.test.ts` - Tests for SourceAnalyzer using mocked ngrok

### Unit Tests (without mocks)

- `types.test.ts` - Tests for TypeScript type definitions
- `index.test.ts` - Tests for module exports and factory functions

### Integration Tests

- `integration/wave-client.integration.test.ts` - Real API tests (requires API keys)

## Running Tests

### All Tests

```bash
npm test
```

### Unit Tests Only

```bash
npm run test:unit
```

### Integration Tests Only

```bash
npm run test:integration
```

### Watch Mode

```bash
npm run test:watch
```

### Coverage Report

```bash
npm run test:coverage
```

## Environment Variables for Integration Tests

Integration tests require the following environment variables:

- `WAVE_API_KEY` - Your WAVE API key (required for WAVE API tests)
- `NGROK_AUTHTOKEN` - Your ngrok auth token (required for analyzeSource tests)
- `SKIP_INTEGRATION_TESTS` - Set to 'true' to skip all integration tests
- `SKIP_NGROK_TESTS` - Set to 'true' to skip ngrok-specific tests

### Currently Skipped Tests

Without environment variables set, these test suites are skipped:

1. **WaveClient Integration Tests** - Requires `WAVE_API_KEY`
   - Real WAVE API calls to example.com
   - Error handling for invalid URLs
   - Network error scenarios

2. **WaveClient with SourceAnalyzer Integration** - Requires both `WAVE_API_KEY` and `NGROK_AUTHTOKEN`
   - End-to-end analyzeSource functionality
   - Real ngrok tunnel creation
   - HTML accessibility analysis

### Tests That Always Run

- **SourceAnalyzer Integration Tests** - No external dependencies
  - HTTP server creation and content serving
  - 404 error handling

### Example

```bash
export WAVE_API_KEY=your_wave_api_key
export NGROK_AUTHTOKEN=your_ngrok_token
npm run test:integration
```

## Test Categories

1. **Constructor Tests** - Validate proper initialization and error handling
2. **API Tests** - Test API request formation and response handling
3. **Error Handling Tests** - Ensure proper error messages and types
4. **Type Tests** - Validate TypeScript interfaces and types
5. **Integration Tests** - Real API calls and ngrok tunnel creation

## Notes

- Integration tests are skipped if required environment variables are not set
- Integration tests have longer timeouts (30-60 seconds) due to network operations
- Unit tests use Jest mocks to avoid external dependencies
- The test suite uses `forceExit: true` to handle open handles from HTTP servers
