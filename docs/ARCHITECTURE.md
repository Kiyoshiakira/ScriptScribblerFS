# Architecture Documentation

This document describes the architecture and design patterns used in The Scribbler application.

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Application Structure](#application-structure)
- [Data Flow](#data-flow)
- [Key Components](#key-components)
- [State Management](#state-management)
- [Data Persistence](#data-persistence)
- [Authentication & Authorization](#authentication--authorization)
- [Export System](#export-system)
- [AI Integration](#ai-integration)
- [Testing Strategy](#testing-strategy)

## Overview

The Scribbler is a modern web application built with Next.js 15, using the App Router for routing and server/client component architecture. It provides a collaborative writing environment for screenplays and stories with AI-powered assistance.

### Key Features
- **Screenplay Editor** - Fountain-format screenplay writing
- **Story Development** - Structured story outlining and world-building
- **AI Assistance** - Google Gemini-powered writing help
- **Offline Support** - IndexedDB for local-first editing
- **Cloud Sync** - Firebase Firestore for persistence
- **Export System** - Multiple export formats (PDF, Fountain, DOCX, etc.)

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client Browser                       │
├─────────────────────────────────────────────────────────┤
│  Next.js App (React 18)                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  UI Layer    │  │  Business    │  │   Data       │  │
│  │  Components  │◄─┤   Logic      │◄─┤   Layer      │  │
│  │              │  │   Hooks      │  │  Context     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         │                  │                  │         │
│         └──────────────────┼──────────────────┘         │
│                            │                            │
├────────────────────────────┼────────────────────────────┤
│                            ▼                            │
│  ┌──────────────────────────────────────────────────┐  │
│  │         IndexedDB (Local Storage)                │  │
│  │         - Drafts                                 │  │
│  │         - Offline Queue                          │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                   External Services                      │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Firebase   │  │   Google     │  │   Google     │  │
│  │  Firestore   │  │    Auth      │  │   Gemini     │  │
│  │  (Database)  │  │(Authenticate)│  │    (AI)      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Application Structure

### Next.js App Router

The application uses Next.js 15 App Router with the following structure:

```
src/app/
├── layout.tsx              # Root layout with providers
├── page.tsx                # Homepage (redirects to dashboard)
├── login/                  # Authentication pages
├── dashboard/              # Script management
├── editor/                 # Main editor interface
├── user/[userId]/          # Public user profiles
│   └── script/[scriptId]/  # Public script viewing
└── import-scrite/          # Scrite import tool
```

### Component Organization

```
src/components/
├── ui/                     # Reusable UI components (Radix UI based)
│   ├── button.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   └── ...
├── views/                  # Page-level view components
│   ├── dashboard-view.tsx
│   ├── editor-view.tsx
│   └── ...
├── script-editor.tsx       # Main screenplay editor
├── rich-text-editor.tsx    # Rich text editor for stories
├── ai-assistant.tsx        # AI integration component
└── ...
```

## Data Flow

### Local-First Architecture

```
User Action
    │
    ▼
UI Component
    │
    ▼
Business Logic (Hook/Service)
    │
    ├─────────────────┐
    ▼                 ▼
IndexedDB      Firebase Firestore
(Immediate)    (Background Sync)
    │                 │
    └────────┬────────┘
             ▼
    UI Update (Optimistic)
```

### Save Flow

1. **User edits content** in the editor
2. **Autosave hook** debounces changes (300ms)
3. **SaveManager** writes to IndexedDB immediately
4. **If online**: Sync to Firestore in background
5. **If offline**: Queue for later sync
6. **When online**: Process sync queue

### Read Flow

1. **Check IndexedDB** first (fast, local)
2. **If not found or outdated**: Fetch from Firestore
3. **Update IndexedDB** with fresh data
4. **Return to component**

## Key Components

### Editor System

**Script Editor** (`script-editor.tsx`)
- Manages screenplay blocks
- Handles Fountain format parsing
- Provides keyboard shortcuts
- Integrates with character tracking

**Rich Text Editor** (`rich-text-editor.tsx`)
- Quill-based WYSIWYG editor
- Used for story chapters and notes
- Supports formatting and embeds

### SaveManager

**Location:** `src/utils/saveManager.ts`

Responsibilities:
- Local persistence with IndexedDB
- Online/offline detection
- Sync queue management
- Conflict resolution

```typescript
class SaveManager {
  saveDraft(id, content, metadata): Promise<void>
  getDraft(id): Promise<Draft | null>
  deleteDraft(id): Promise<void>
  getAllDrafts(): Promise<Draft[]>
  isOnline(): boolean
  addStatusListener(listener): () => void
}
```

### Export System

**Location:** `src/lib/export-*.ts` and `src/utils/exporters/`

Supports multiple formats:
- **PDF** - Browser-based generation
- **Fountain** - Plain text screenplay format
- **Final Draft (FDX)** - XML-based format
- **DOCX** - Word document
- **EPUB** - E-book format
- **Markdown** - Plain text with formatting

Each exporter follows a common pattern:
```typescript
export async function exportToFormat(
  scriptDoc: ScriptDocument,
  options?: ExportOptions
): Promise<Blob>
```

## State Management

### React Context

Global state managed through React Context:

**AuthContext** (`src/context/AuthContext.tsx`)
- User authentication state
- Firebase Auth integration
- User profile data

**ScriptContext** (`src/context/ScriptContext.tsx`)
- Current script data
- Script metadata
- Auto-save state

### Local State

Component-level state with:
- `useState` for simple state
- `useReducer` for complex state
- Custom hooks for reusable logic

### Custom Hooks

**useAutosave** (`src/hooks/useAutosave.ts`)
```typescript
useAutosave(scriptId, content, debounceMs)
```
Handles automatic saving with debouncing.

**useScript** (`src/hooks/useScript.ts`)
```typescript
useScript(scriptId)
```
Fetches and manages script data.

## Data Persistence

### Firestore Schema

```
users/
  {userId}/
    - email
    - displayName
    - avatarUrl
    - createdAt
    - settings

scripts/
  {scriptId}/
    - userId
    - title
    - content
    - lastModified
    - createdAt
    - visibility (public/private)

characters/
  {characterId}/
    - scriptId
    - name
    - description
    - scenes

scenes/
  {sceneId}/
    - scriptId
    - number
    - heading
    - description

stories/
  {storyId}/
    - userId
    - title
    - outline
    - chapters
    - worldBuilding
```

### IndexedDB Schema

```
stores:
  drafts:
    key: scriptId (string)
    value: {
      id: string
      content: string
      timestamp: number
      synced: boolean
      metadata: object
    }
```

## Authentication & Authorization

### Firebase Authentication

Supported methods:
- Email/Password
- Google Sign-In

### Authorization Rules

Firestore security rules enforce:
- Users can only read/write their own data
- Public scripts are readable by anyone
- Character/scene data is restricted to script owner

```javascript
// firestore.rules example
match /scripts/{scriptId} {
  allow read: if resource.data.visibility == 'public' 
              || request.auth.uid == resource.data.userId;
  allow write: if request.auth.uid == resource.data.userId;
}
```

## Export System

### Architecture

```
User clicks Export
    │
    ▼
Format Selection (PDF/Fountain/etc.)
    │
    ▼
Export Function (export-pdf.ts, etc.)
    │
    ├─ Parse ScriptDocument
    ├─ Apply formatting rules
    ├─ Generate output (Blob)
    │
    ▼
Download to user's device
```

### Format Handlers

Each format has a dedicated module:
- **export-pdf.ts** - Client-side PDF generation
- **export-fountain.ts** - Fountain text format
- **export-fdx.ts** - Final Draft XML
- **export-docx.ts** - Word document (via docx library)
- **export-epub.ts** - E-book format

## AI Integration

### Google Gemini

**Location:** `src/lib/client-ai.ts`, `src/services/googleAiProvider.ts`

Features:
- Writing suggestions
- Script analysis
- Character insights
- Content generation

### Flow

```
User request
    │
    ▼
AI Assistant Component
    │
    ▼
AI Provider (Google Gemini)
    │
    ├─ Build prompt with context
    ├─ Call Gemini API
    ├─ Stream response
    │
    ▼
Display in UI
```

### RAG (Retrieval Augmented Generation)

**Location:** `src/lib/rag-service.ts`

For long documents:
1. Split document into chunks
2. Generate embeddings
3. Store in vector database
4. Retrieve relevant context for queries
5. Enhance AI prompts with context

## Testing Strategy

### Unit Tests

- Test business logic in isolation
- Mock external dependencies (Firebase, IndexedDB)
- Focus on `src/lib/` and `src/utils/`

**Example:**
```typescript
// src/lib/__tests__/export-fountain.test.ts
describe('exportToFountain', () => {
  it('should convert script to Fountain format', () => {
    const result = exportToFountain(mockScript);
    expect(result).toContain('INT. SCENE');
  });
});
```

### E2E Tests

- Test complete user flows
- Use Playwright for browser automation
- Test critical paths (login, create, save, export)

**Example:**
```typescript
// e2e/homepage.spec.ts
test('should load homepage', async ({ page }) => {
  await page.goto('/');
  expect(page.url()).toContain('localhost:9002');
});
```

### Integration Tests

- Test component integration
- Use React Testing Library
- Test user interactions

## Performance Considerations

### Optimization Strategies

1. **Code Splitting**
   - Dynamic imports for heavy components
   - Route-based splitting (automatic with Next.js)

2. **Caching**
   - IndexedDB for offline access
   - React Query for server state (future)

3. **Debouncing**
   - Autosave debounced to 300ms
   - Search input debouncing

4. **Lazy Loading**
   - Load AI features on demand
   - Defer non-critical scripts

### Monitoring

- Performance tracking with Next.js built-in metrics
- Error tracking (to be implemented)
- Usage analytics (Firebase Analytics)

## Security

### Best Practices

1. **Authentication**
   - Firebase Auth handles all authentication
   - Session management via Firebase SDK

2. **Authorization**
   - Firestore security rules enforce access control
   - Client-side checks for UX only

3. **Data Validation**
   - TypeScript for type safety
   - Zod schemas for runtime validation

4. **XSS Prevention**
   - DOMPurify for sanitizing HTML
   - React's built-in XSS protection

5. **Secrets Management**
   - Environment variables for API keys
   - Never commit secrets to repository

## Future Enhancements

### Planned Improvements

1. **Real-time Collaboration**
   - Yjs for CRDT-based collaboration
   - WebSocket server for sync

2. **Advanced AI Features**
   - Script formatting suggestions
   - Plot consistency checking
   - Character arc analysis

3. **Enhanced Export**
   - More format options
   - Custom templates
   - Batch export

4. **Performance**
   - Implement React Query
   - Add service worker for full offline support
   - Optimize bundle size

## Related Documentation

- [DEVELOPMENT.md](DEVELOPMENT.md) - Development setup and workflow
- [CONTRIBUTING.md](CONTRIBUTING.md) - How to contribute
- [IMPLEMENTATION_HISTORY.md](IMPLEMENTATION_HISTORY.md) - Feature history

---

**Last Updated:** 2024-11-24
**Version:** 1.0
