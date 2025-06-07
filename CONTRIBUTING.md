# Contributing to wave-node

Thank you for your interest in contributing to wave-node! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Style Guidelines](#style-guidelines)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

Please note that this project is released with a [Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:

   ```bash
   git clone https://github.com/YOUR_USERNAME/wave-node.git
   cd wave-node
   ```

3. Add the upstream repository as a remote:

   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/wave-node.git
   ```

## Development Setup

1. Install Node.js 14.0.0 or higher
2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the project:

   ```bash
   npm run build
   ```

4. Run tests to ensure everything is working:

   ```bash
   npm test
   ```

### Required API Keys

For full testing capabilities, you'll need:

- A WAVE API key from [https://wave.webaim.org/api/](https://wave.webaim.org/api/)
- (Optional) An ngrok authtoken from [https://ngrok.com/](https://ngrok.com/)

Set these as environment variables:

```bash
export WAVE_API_KEY=your_wave_api_key_here
export NGROK_AUTHTOKEN=your_ngrok_authtoken_here
```

## Making Changes

1. Create a new branch from `main`:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following our [Style Guidelines](#style-guidelines)
3. Add or update tests as needed
4. Update documentation if necessary
5. Commit your changes with clear, descriptive messages

### Commit Message Format

Use conventional commit format:

```text
type(scope): description

[optional body]

[optional footer]
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Test additions or modifications
- `refactor`: Code refactoring
- `style`: Code style changes (formatting, etc.)
- `chore`: Maintenance tasks

Example:

```text
feat(client): add retry logic for network errors

Implements automatic retry with exponential backoff for
transient network failures.

Closes #123
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

### Writing Tests

- Write tests for all new features and bug fixes
- Maintain or improve code coverage
- Use descriptive test names that explain what is being tested
- Mock external dependencies (axios, ngrok) appropriately

Example test structure:

```typescript
describe('FeatureName', () => {
  describe('methodName', () => {
    it('should handle specific scenario', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = someFunction(input);
      
      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

## Submitting Changes

1. Push your changes to your fork:

   ```bash
   git push origin feature/your-feature-name
   ```

2. Create a Pull Request (PR) on GitHub:
   - Use a clear, descriptive title
   - Reference any related issues
   - Describe what changes you made and why
   - Include screenshots for UI changes if applicable

3. PR Requirements:
   - All tests must pass
   - Code must be properly formatted (`npm run lint`)
   - Documentation must be updated if needed
   - PR must be reviewed by at least one maintainer

## Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Avoid `any` types where possible
- Use interfaces over type aliases for object shapes
- Export types/interfaces that are part of the public API

### Code Style

We use ESLint for code style enforcement. Run the linter:

```bash
npm run lint
npm run lint:fix  # Auto-fix issues
```

Key style points:

- 2 spaces for indentation
- Single quotes for strings
- No semicolons (except where required)
- Trailing commas in multi-line objects/arrays
- Prefer `const` over `let`, avoid `var`

### Documentation

- Use JSDoc comments for public APIs
- Include examples in documentation
- Keep README.md up to date
- Update CLAUDE.md with architectural changes

## Reporting Issues

### Bug Reports

When reporting bugs, please include:

- Node.js version
- wave-node version
- Minimal code example that reproduces the issue
- Expected behavior
- Actual behavior
- Error messages and stack traces

### Feature Requests

For feature requests, please:

- Check if the feature has already been requested
- Provide use cases and examples
- Explain why this feature would be valuable
- Consider if it aligns with the project's goals

## Additional Resources

- [WAVE API Documentation](https://wave.webaim.org/api/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [ngrok Documentation](https://ngrok.com/docs)

## Questions?

If you have questions about contributing, feel free to:

- Open an issue with the "question" label
- Reach out to the maintainers
- Check existing issues and discussions

Thank you for contributing to wave-node!
