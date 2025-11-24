# Contributing to The Scribbler

Thank you for your interest in contributing to The Scribbler! We welcome contributions from the community and are grateful for your support.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Issue Guidelines](#issue-guidelines)
- [Community](#community)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](../CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm (comes with Node.js)
- Git
- A Firebase project (for full functionality)

### Setup for Development

1. **Fork the Repository**
   
   Click the "Fork" button at the top right of the repository page.

2. **Clone Your Fork**
   
   ```bash
   git clone https://github.com/YOUR_USERNAME/TheScribbler.git
   cd TheScribbler
   ```

3. **Add Upstream Remote**
   
   ```bash
   git remote add upstream https://github.com/Kiyoshiakira/TheScribbler.git
   ```

4. **Install Dependencies**
   
   ```bash
   npm install
   ```

5. **Set Up Environment Variables**
   
   Copy `.env` to `.env.local` and fill in your Firebase configuration:
   
   ```bash
   cp .env .env.local
   ```
   
   See [docs/USER_SETUP_INSTRUCTIONS.md](USER_SETUP_INSTRUCTIONS.md) for Firebase setup.

6. **Run the Development Server**
   
   ```bash
   npm run dev
   ```
   
   The application will be available at http://localhost:9002

## Development Process

### Branching Strategy

We use a simplified Git flow:

- `main` - Production-ready code
- Feature branches - `feature/your-feature-name`
- Bug fix branches - `fix/bug-description`
- Documentation branches - `docs/what-youre-documenting`

### Creating a Feature Branch

```bash
# Make sure you're on main and it's up to date
git checkout main
git pull upstream main

# Create your feature branch
git checkout -b feature/amazing-new-feature
```

### Making Changes

1. Make your changes in your feature branch
2. Write or update tests as needed
3. Ensure your code follows our coding standards
4. Test your changes thoroughly
5. Commit your changes with clear, descriptive messages

### Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that don't affect code meaning (formatting, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding or updating tests
- `chore`: Changes to build process or auxiliary tools

**Examples:**
```
feat(editor): add keyboard shortcuts for block navigation

fix(export): resolve PDF formatting issue with dialogue blocks

docs(contributing): update pull request guidelines

test(saveManager): add tests for offline mode
```

## Pull Request Process

### Before Submitting

1. **Update Your Branch**
   
   ```bash
   git checkout main
   git pull upstream main
   git checkout feature/your-feature
   git rebase main
   ```

2. **Run Tests**
   
   ```bash
   npm test
   npm run test:e2e
   ```

3. **Run Linter**
   
   ```bash
   npm run lint
   npm run typecheck
   ```

4. **Build the Project**
   
   ```bash
   npm run build
   ```

### Submitting a Pull Request

1. Push your branch to your fork:
   
   ```bash
   git push origin feature/your-feature
   ```

2. Go to the original repository on GitHub and click "New Pull Request"

3. Select your fork and branch

4. Fill out the pull request template:
   - Describe what your PR does
   - Reference any related issues
   - Include screenshots for UI changes
   - List any breaking changes
   - Describe testing performed

5. Submit the pull request

### Pull Request Review

- Maintainers will review your PR
- Address any requested changes
- Keep the PR focused on a single feature/fix
- Be responsive to feedback
- Once approved, a maintainer will merge your PR

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Provide proper type definitions
- Avoid `any` types when possible
- Use interfaces for object shapes

### React/Next.js

- Use functional components with hooks
- Follow React best practices
- Use Next.js conventions (app directory, server/client components)
- Implement proper error boundaries

### Code Style

- Follow the existing code style
- Use meaningful variable and function names
- Write self-documenting code
- Add comments for complex logic
- Keep functions small and focused

### Accessibility

- Follow WCAG 2.1 AA guidelines
- Use semantic HTML
- Ensure keyboard navigation works
- Provide proper ARIA labels
- Test with screen readers when possible

## Testing Guidelines

### Unit Tests

- Write unit tests for utility functions and business logic
- Use Jest and React Testing Library
- Aim for meaningful test coverage
- Test edge cases and error conditions

```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### E2E Tests

- Write E2E tests for critical user flows
- Use Playwright for E2E testing
- Test in multiple browsers when relevant
- Keep tests maintainable and fast

```bash
# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug
```

### Manual Testing

- Test your changes in the browser
- Test on different screen sizes
- Verify accessibility features
- Check browser console for errors

## Issue Guidelines

### Reporting Bugs

Use the bug report template and include:

- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots or videos if applicable
- Environment details (OS, browser, Node version)
- Error messages or console output

### Requesting Features

Use the feature request template and include:

- Clear description of the feature
- Use case and motivation
- Proposed implementation (optional)
- Alternatives considered

### Working on Issues

- Check if an issue is already assigned
- Comment on the issue to express interest
- Wait for maintainer approval before starting work
- Reference the issue in your PR

## Community

### Getting Help

- Check existing documentation
- Search closed issues
- Open a new issue with the question label
- Join community discussions

### Recognition

Contributors will be recognized in:
- The project README
- Release notes
- Contributors page

Thank you for contributing to The Scribbler! 🎬📝
