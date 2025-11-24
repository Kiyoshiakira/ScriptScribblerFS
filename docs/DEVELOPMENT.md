# Development Guide

This guide covers the development setup, architecture, and best practices for The Scribbler project.

## Table of Contents

- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Building and Deployment](#building-and-deployment)
- [Troubleshooting](#troubleshooting)

## Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/Kiyoshiakira/TheScribbler.git
cd TheScribbler

# Install dependencies
npm install

# Set up environment variables
cp .env .env.local
# Edit .env.local with your Firebase configuration

# Run development server
npm run dev
```

The application will be available at http://localhost:9002

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:e2e` - Run end-to-end tests
- `npm run test:e2e:ui` - Run E2E tests with UI
- `npm run test:e2e:debug` - Debug E2E tests

## Project Structure

```
TheScribbler/
├── .github/
│   └── workflows/          # GitHub Actions workflows
│       ├── test.yml       # CI test workflow
│       └── build.yml      # Build workflow
├── docs/                  # Documentation
│   ├── CONTRIBUTING.md    # Contribution guidelines
│   ├── DEVELOPMENT.md     # This file
│   ├── ARCHITECTURE.md    # Architecture documentation
│   └── ...               # Other documentation
├── e2e/                   # End-to-end tests
│   └── *.spec.ts         # Playwright test files
├── public/                # Static assets
├── src/
│   ├── app/              # Next.js app directory (routes)
│   ├── components/       # React components
│   │   ├── ui/          # Reusable UI components
│   │   └── views/       # Page-level views
│   ├── context/          # React context providers
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions and core logic
│   │   └── __tests__/   # Unit tests for lib
│   ├── services/         # External service integrations
│   ├── utils/            # General utilities
│   │   ├── exporters/   # Export format handlers
│   │   └── __tests__/   # Unit tests for utils
│   ├── firebase/         # Firebase configuration
│   └── constants.ts      # App-wide constants
├── jest.config.js        # Jest configuration
├── jest.setup.js         # Jest setup file
├── playwright.config.ts  # Playwright configuration
├── next.config.ts        # Next.js configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies and scripts
```

## Technology Stack

### Core Framework
- **Next.js 15** - React framework with app router
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript

### Styling
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives

### Backend & Data
- **Firebase Firestore** - NoSQL database
- **Firebase Auth** - Authentication
- **IndexedDB** - Local offline storage (via idb-keyval)

### AI & Content
- **Google Gemini** - Generative AI for writing assistance
- **Genkit** - AI application framework

### Testing
- **Jest** - Unit testing framework
- **React Testing Library** - React component testing
- **Playwright** - End-to-end testing

### Development Tools
- **ESLint** - Code linting
- **TypeScript Compiler** - Type checking

## Development Workflow

### 1. Setting Up Environment

Create `.env.local` with required environment variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY="your_api_key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_project_id"
NEXT_PUBLIC_FIREBASE_APP_ID="your_app_id"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="your_measurement_id"

# Google Gemini API
GEMINI_API_KEY="your_gemini_api_key"

# Optional: Google Picker API
NEXT_PUBLIC_GOOGLE_API_KEY="your_google_api_key"
NEXT_PUBLIC_GOOGLE_APP_ID="your_google_app_id"
```

### 2. Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication (Email/Password and Google)
3. Create a Firestore database
4. Add your domain to authorized domains
5. Copy configuration to `.env.local`

See [docs/USER_SETUP_INSTRUCTIONS.md](USER_SETUP_INSTRUCTIONS.md) for detailed setup.

### 3. Running Tests

```bash
# Run all unit tests
npm test

# Run specific test file
npm test -- src/lib/__tests__/export-fountain.test.ts

# Run with coverage
npm run test:coverage

# Run E2E tests (requires dev server running)
npm run test:e2e

# Or start server automatically
npm run test:e2e -- --headed
```

### 4. Code Quality

```bash
# Lint your code
npm run lint

# Auto-fix linting issues
npm run lint -- --fix

# Type check
npm run typecheck
```

### 5. Building

```bash
# Production build
npm run build

# Test production build locally
npm run build && npm run start
```

## Testing

### Unit Tests

Located in `__tests__` directories next to the code they test.

**Example test structure:**
```typescript
import { functionToTest } from '../module';

describe('Module Name', () => {
  it('should do something specific', () => {
    const result = functionToTest(input);
    expect(result).toBe(expected);
  });
});
```

**Running specific tests:**
```bash
# Run tests matching a pattern
npm test -- --testNamePattern="export"

# Run in watch mode
npm run test:watch
```

### E2E Tests

Located in the `e2e/` directory.

**Example E2E test:**
```typescript
import { test, expect } from '@playwright/test';

test('homepage loads correctly', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
});
```

**Running E2E tests:**
```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui

# Run specific test file
npx playwright test e2e/homepage.spec.ts
```

### Test Coverage

```bash
# Generate coverage report
npm run test:coverage

# View coverage in browser
open coverage/lcov-report/index.html
```

## Building and Deployment

### Development Build

```bash
npm run dev
```

Runs on http://localhost:9002 with hot reload.

### Production Build

```bash
npm run build
```

Creates an optimized build in `.next/` directory.

### Environment Variables

**Build-time variables:**
- Must be prefixed with `NEXT_PUBLIC_` to be available in the browser
- Set in `.env.local` for local development
- Set in deployment platform for production

**Server-only variables:**
- Not prefixed with `NEXT_PUBLIC_`
- Only available in server components and API routes

### Deployment Platforms

The app can be deployed to:
- **Vercel** (recommended for Next.js)
- **Firebase Hosting**
- Any Node.js hosting platform

See Next.js deployment documentation for platform-specific guides.

## Troubleshooting

### Common Issues

#### Build Errors

**Issue:** Type errors during build
```bash
npm run typecheck
```
Fix type errors before building.

**Issue:** Missing environment variables
- Ensure all required variables are in `.env.local`
- Check that they're prefixed correctly

#### Test Failures

**Issue:** Tests fail locally but pass in CI
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Jest cache: `npx jest --clearCache`

**Issue:** E2E tests timeout
- Increase timeout in `playwright.config.ts`
- Ensure dev server is running
- Check for console errors in the browser

#### Firebase Issues

**Issue:** 403 errors during authentication
- See [docs/TROUBLESHOOTING_403_ERRORS.md](TROUBLESHOOTING_403_ERRORS.md)
- Verify authorized domains in Firebase Console
- Check Firestore rules

**Issue:** Firestore permission denied
- Deploy Firestore rules: `firebase deploy --only firestore:rules`
- Verify user is authenticated

### Getting Help

1. Check existing documentation in `docs/`
2. Search closed issues on GitHub
3. Ask in GitHub discussions
4. Open a new issue with detailed information

## Best Practices

### Code Organization

- Keep components small and focused
- Extract reusable logic into custom hooks
- Use TypeScript interfaces for data structures
- Organize imports (external, internal, relative)

### Performance

- Use React.memo() for expensive components
- Implement proper loading states
- Optimize images with Next.js Image component
- Lazy load components when appropriate

### Accessibility

- Use semantic HTML elements
- Provide ARIA labels where needed
- Ensure keyboard navigation works
- Test with screen readers
- Maintain color contrast ratios

### Security

- Never commit secrets to version control
- Validate user input
- Sanitize content before rendering
- Use Firebase security rules
- Keep dependencies updated

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Firebase Documentation](https://firebase.google.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Playwright Documentation](https://playwright.dev)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

---

For more information, see:
- [CONTRIBUTING.md](CONTRIBUTING.md) - How to contribute
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [USER_SETUP_INSTRUCTIONS.md](USER_SETUP_INSTRUCTIONS.md) - Initial setup
