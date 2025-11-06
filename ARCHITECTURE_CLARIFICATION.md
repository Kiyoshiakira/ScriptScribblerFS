# Architecture Clarification

## Overview
This document clarifies the ScriptScribbler application architecture to ensure consistent understanding and documentation.

## Application Type
ScriptScribbler is a **Single-Page Application (SPA)** with a **tabbed sidebar interface**.

## Main Application Structure

### Left Sidebar Tabs
The main application uses tabs in the left sidebar for navigation between different views:

1. **Dashboard** - Script management hub
2. **Editor** - Screenplay editor
3. **Logline** - Story summary editor
4. **Scenes** - Scene organization
5. **Characters** - Character management
6. **Notes** - Notes and ideas

### Top-Right User Menu
Profile and Settings are accessed via the user avatar menu in the top-right corner:

- **Profile** - User profile and script management
- **Settings** - Application settings
- **Sign Out** - User logout

## Additional Routes

### Public Sharing Routes
These are separate standalone routes (not part of the main app) for sharing content:

- `/user/{userId}` - Public user profile view
- `/user/{userId}/script/{scriptId}` - Public script view (read-only)

**Purpose**: Share scripts and profiles with others via URL

### Utility Routes
Standalone tools separate from the main application:

- `/import-scrite` - Scrite to Fountain converter tool
- `/login` - Authentication page

## Key Architecture Decisions

### Why Profile is Not in Sidebar
The Profile view is intentionally **not** included in the left sidebar because:
- It's an account management function, not a script editing function
- The sidebar is focused on screenplay creation and organization
- Profile is accessed less frequently than script-related tabs
- Standard UX pattern places account settings in top-right menu

### Why Public Routes are Separate
Public sharing routes are separate from the main app because:
- They serve a different purpose (sharing vs. editing)
- They have different permission models (read-only vs. read-write)
- They need to work without the full app context
- They're accessed via direct links, not internal navigation

## Terminology Guide

### Correct Terms
- **Tab** - Items in the left sidebar (Dashboard, Editor, etc.)
- **View** - The rendered content when a tab is selected
- **Route** - URL paths (both internal views and external pages)
- **Public sharing route** - URLs for sharing scripts externally
- **User menu** - Avatar menu in top-right corner

### Avoid Using
- ❌ "Page" when referring to sidebar tabs
- ❌ "Web page" when referring to views in the main app
- ✅ Use "tab" or "view" instead for sidebar items
- ✅ Use "route" or "public sharing route" for `/user/...` paths

## Implementation Details

### Code Structure
- `src/components/layout/AppLayout.tsx` - Main app layout with view routing
- `src/components/layout/app-sidebar.tsx` - Left sidebar with tabs
- `src/components/layout/app-header.tsx` - Top header with user menu
- `src/components/views/*` - Individual view components
- `src/app/user/[userId]/...` - Public sharing routes

### View Type
The View type includes all accessible views:
```typescript
export type View = 'dashboard' | 'editor' | 'scenes' | 'characters' | 'notes' | 'logline' | 'profile';
```

Note: 'profile' is included because it's a valid view, even though it's only accessible via the user menu, not the sidebar.

## User Experience Flow

### Normal Workflow
1. User logs in
2. App loads with **Dashboard** view by default
3. User navigates between tabs using left sidebar
4. User accesses Profile via top-right avatar menu when needed
5. User creates/edits scripts using Editor tab
6. User organizes content using Scenes, Characters, Notes tabs

### Sharing Workflow
1. User clicks "View" button on a script in Profile view
2. Opens public sharing route in new tab (`/user/{userId}/script/{scriptId}`)
3. User copies URL to share with others
4. Recipients can view (but not edit) the script

## Summary
The application architecture is designed to:
- Keep script editing functionality in the sidebar tabs
- Place account management in the user menu
- Provide public sharing via separate routes
- Maintain clear separation of concerns
- Follow standard UX patterns
