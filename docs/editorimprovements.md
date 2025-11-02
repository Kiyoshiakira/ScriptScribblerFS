```markdown
# Editor Improvements — Make the Screenplay Editor Function Like Scrite

This file contains a numbered list of tasks (small-to-medium scoped) to evolve the current screenplay editor into a full-featured screenplay writer similar to Scrite. Each item is written so it can be turned into an issue and implemented as one or more PRs. Prioritize tasks based on user-visible value and iteration speed.

1. Structured document model (core)
   - Problem: Editor likely stores raw text lines; structured screenplay model enables reliable features.
   - Change: Introduce a document model that represents scenes, headings, action, character, parenthetical, dialogue, transitions, shot lines, and metadata.
   - Implementation:
     - Create types: Scene, Block (with blockType enum), CharacterRef, Metadata.
     - Implement parser + serializer to/from plain screenplay text.
   - Files to modify/create: src/editor/model/* (types + parser + serializer).
   - Tests: Round-trip tests (parse -> serialize -> parse) for sample scripts.

2. Rich block-based editor (WYSIWYG with block types)
   - Problem: Line-oriented editing is fragile; users need block semantics (Scene Heading, Action, Character, Dialogue, Parenthetical, Transition).
   - Change: Move editor to a block-based WYSIWYG (each block knows its type and formatting).
   - Implementation:
     - Use contenteditable or a rich text editor library that supports structured blocks (e.g., Draft.js/Slate/ProseMirror/TipTap).
     - Provide UI to switch block type with keyboard shortcuts (Tab, Ctrl+1..).
   - Files to modify: src/components/editor/* (editor core, toolbar).
   - Tests: Keyboard navigation + block typing behavior.

3. Industry-standard screenplay formatting rules & auto-format
   - Problem: Formatting must follow industry rules by default.
   - Change: Implement auto-format rules per block type (margins, capitalization for character names, centered character lines, indent dialogue, etc.).
   - Implementation:
     - Formatting engine that maps block types to styles/CSS and to plain-text output.
     - Auto-correct capitalization of character names.
   - Files: src/editor/formatting.ts, editor CSS modules/themes.
   - Tests: Visual snapshot tests and formatting unit tests.

4. Scene list and navigation (project outline)
   - Problem: Writers need quick navigation and editing by scene.
   - Change: Add a collapsible scene list panel showing scene headings, slugline, length, and tags; clicking navigates to scene block.
   - Implementation:
     - Maintain an index of scenes in model; update in real-time as scenes are edited.
     - Provide reordering via drag-and-drop (react-beautiful-dnd or similar).
   - Files: src/components/scene-list.tsx, editor context/store.
   - Tests: Scene reorder, navigation.

5. Character sidebar and character management
   - Problem: Manage characters (bio, slugs, appearance counts).
   - Change: Add sidebar to create/edit characters, show usage count, assign color/tags.
   - Implementation:
     - Link character names to character entries in the model.
     - Clicking a character highlights their lines in script and opens profile editor.
   - Files: src/components/character-sidebar.tsx, src/editor/character.ts
   - Tests: Create/edit character, highlight lines, import/export character list.

6. Beatboard / scene notes (index cards)
   - Problem: Scrite-style beatboard helps structure story.
   - Change: Add a beatboard where each scene becomes an editable card with title, notes, tags, and sortable order.
   - Implementation:
     - Sync beatboard card order with scene order; allow adding/merging/splitting scenes.
   - Files: src/components/beatboard/*, style updates.
   - Tests: Reorder scene sync, edit card persist.

7. Scene splitting and merging tools
   - Problem: Writers split/merge scenes frequently.
   - Change: Provide UI actions to split a scene at cursor (create new scene) and merge adjacent scenes.
   - Implementation:
     - Update model and scene index, preserve formatting and metadata.
   - Files: editor actions utilities.
   - Tests: Split/merge operations preserve content and metadata.

8. Inline notes & comments (annotation)
   - Problem: Need local notes and collaborative comments.
   - Change: Add inline notes and threaded comments tied to a block or selection.
   - Implementation:
     - Store comments in Firestore with references to script id + block id + user.
     - UI for read/add/reply/resolve comments.
   - Files: src/components/comments/*, Firestore rules & schemas.
   - Tests: Create/reply/resolve comment flows.

9. Undo/Redo and granular history
   - Problem: Editing must be safe with undo/redo across operations.
   - Change: Implement a command stack at block level to support undo/redo and batch operations.
   - Implementation:
     - Use immutable operations for model updates and store deltas in history.
   - Files: src/editor/history.ts
   - Tests: Undo/redo sequences including split/merge and character edits.

10. Autosave, explicit save, and save indicators
    - Problem: Avoid data loss and show save status.
    - Change: Autosave changes to Firestore with debounce; explicit save button and status indicators (saved/unsaved/syncing).
    - Implementation:
      - Debounce 1s, optimistic UI, background sync, conflict resolution strategy.
      - Expose a "Last saved" timestamp.
    - Files: src/context/script-context, save utilities, UI badges.
    - Tests: Simulated network offline -> back online behavior.

11. Collaboration & presence (multi-user cursors)
    - Problem: Support simultaneous editing and presence.
    - Change: Use Firestore or a real-time backend to sync cursors and edits; show collaborator avatars and cursors.
    - Implementation:
      - Operational transform / CRDT recommended for concurrent editing (OT via ShareDB or CRDT via Yjs).
      - If limited to block editing, simpler locking/staging may suffice for first pass.
    - Files: new real-time sync layer under src/realtime/*
    - Tests: Multiple sessions editing same doc (integration tests).

12. Import/Export improvements (Scrite, Fountain, Final Draft, PDF)
    - Problem: Robust import/export from Scrite/Fountain/FDX and export to PDF.
    - Change:
      - Improve Scrite import parsing and reformat via ai (already present but refine).
      - Add Fountain (.fountain) and FDX import/export.
      - Generate print-ready PDF (via wkhtmltopdf, Puppeteer or a server PDF renderer).
    - Files: src/utils/importers/*, export pipeline.
    - Tests: Import/Export round-trip with sample files.

13. Print / pagination / page-break preview
    - Problem: Screenplay needs page formatting (1 page ≈ 55 lines).
    - Change:
      - Implement print layout with accurate margins and page break preview.
      - Allow "View: Pagination" mode and print-ready export options.
    - Implementation:
      - CSS for print media, simulated page preview in UI, page numbering.
    - Files: styles/print.css, preview component.
    - Tests: Visual acceptance; check page counts.

14. Keyboard-first UX & shortcuts (writer-friendly)
    - Problem: Writers rely on keyboard shortcuts for speed.
    - Change:
      - Implement industry-standard shortcuts: Enter to create new block, Ctrl/Cmd+Shift+T for scene heading, Tab to indent, Ctrl+K for character lookup, Ctrl+Z, Ctrl+Y, Ctrl+S, etc.
      - Allow custom shortcut mapping in settings.
    - Files: src/hooks/use-shortcuts.ts, editor key handlers.
    - Tests: Shortcut handling & conflict resolution.

15. Find & Replace with filters (scene/character/whole script)
    - Problem: Need robust search/replace across script.
    - Change:
      - Add find/replace modal supporting scope (entire script, current scene, only dialogue) and regex support.
    - Files: src/components/find-replace.tsx
    - Tests: Replace tests, regex edge cases.

16. Scene metadata & tagging (location, time, POV)
    - Problem: Scene-level metadata enhances organization.
    - Change:
      - Add metadata editor for each scene: location, interior/exterior, time, pages estimate, POV.
      - Display metadata in scene list and beatboard.
    - Files: scene metadata schema and UI.
    - Tests: Metadata persistence & display.

17. Visual line numbers and page estimation
    - Problem: Writers track length and pacing.
    - Change:
      - Add line numbers (non-printing/printing modes) and page estimate indicator per scene.
    - Files: UI indicators and editor stats module.
    - Tests: Accurate line/page estimate with different formatting.

18. Character auto-complete and smart suggestions
    - Problem: Repeated character names should be consistent.
    - Change:
      - Implement character name auto-complete and suggestion dropdown, auto-capitalization, and dedupe (map alias to canonical name).
    - Files: editor autocompletion module.
    - Tests: Auto-complete behavior and alias detection.

19. Apply AI features contextually (proofread, reformat, beat suggestions)
    - Problem: AI features are global; integrate them into writer workflows.
    - Change:
      - Add inline AI suggestions per scene or selection (proofread, reformat).
      - Allow “Apply suggestion” at block level with preview and undo.
      - Provide AI scene summaries, logline suggestions, and character profile generation inside character sidebar.
    - Files: ai integration points in editor UI and actions.
    - Tests: Mock AI responses for UI flows.

20. Performance & virtualization for large scripts
    - Problem: Large scripts can slow rendering.
    - Change:
      - Virtualize block rendering (react-window/react-virtual) and lazy-load heavy UIs (beatboard, analytics).
    - Files: editor renderer & virtualization adapter.
    - Tests: Performance metrics for large sample scripts.

21. Offline editing & sync conflict resolution
    - Problem: Writers often work without constant connectivity.
    - Change:
      - Add offline editing support with local persistence (IndexedDB) and sync logic with conflict resolution prompts.
    - Files: src/offline/sync.ts, local store provider.
    - Tests: Simulate offline edits and conflict merges.

22. Version history & snapshots
    - Problem: Need to revert to earlier drafts.
    - Change:
      - Implement versioning snapshots (manual checkpoint and automatic daily snapshots).
      - UI for timeline and restore.
    - Files: versioning service and UI.
    - Tests: Create/restore snapshot flows.

23. Template & project settings (screenplay templates)
    - Problem: Users want templates and project configs (font, margins).
    - Change:
      - Add templates (feature film, short, TV), project-level settings, and default formatting presets.
    - Files: templates/* and settings UI.
    - Tests: Template instantiation.

24. Accessible UI & ARIA improvements
    - Problem: Ensure editor is accessible.
    - Change:
      - Add ARIA roles, keyboard focus management, high-contrast mode, and screen-reader labels for main controls.
    - Files: editor components and accessibility helpers.
    - Tests: Manual a11y audits and automated checks (axe-core).

25. Testing, CI, and UX metrics
    - Problem: Need to prevent regressions and monitor editor health.
    - Change:
      - Add unit tests for model/parser, integration tests for editor flows, and CI that runs them.
      - Add basic telemetry for editor load time, save failures, and AI timeouts (PII-free).
    - Files: tests/*, .github/workflows/editor-ci.yml, telemetry hooks.
    - Tests: Include in CI run.

26. UX polish: compact mode, distraction-free mode, dark mode, line spacing options
    - Problem: Writers have different preferences.
    - Change:
      - Add distraction-free full-screen mode, compact and comfortable spacing presets, and theme options (light/dark).
    - Files: themes and UI toggles.
    - Tests: Visual checks and user preference persistence.

27. Integrations: FDX / Celtx / Google Drive / Dropbox
    - Problem: Writers use multiple tools.
    - Change:
      - Add export/import connectors and optional cloud sync integrations (OAuth flows).
    - Files: integrations/*, auth flows.
    - Tests: Connect and transfer sample files.

28. Security & rules for collaborative data
    - Problem: Protect user content and enforce permissions.
    - Change:
      - Harden Firestore rules for scripts, comments, snapshots, and shared projects.
      - Enforce server-side validation on writes.
    - Files: firebase.rules, server-side validation helpers.
    - Tests: Rule unit tests with emulator.

29. Onboarding & help inside editor
    - Problem: New users need guidance.
    - Change:
      - Add a guided tour for editor features, keyboard shortcuts cheat sheet, and help center links.
    - Files: onboarding components.
    - Tests: Manual QA for guided tour flows.

30. Incremental rollout & feature flags
    - Problem: Big features need safe rollout.
    - Change:
      - Add feature flagging system (env-driven or remote) to toggle new editor features for beta users.
    - Files: feature-flag util and gating around new components.
    - Tests: Flag on/off behavior.

---

Notes
- Break tasks into small PRs; prefer one user-visible feature or one core refactor per PR.
- Start with core: structured document model, block-based editor, formatting rules, and autosave before adding collaboration and AI integrations.
- Use mocked AI responses and simulated offline environments to develop complex features without external dependencies.
- Prioritize keyboard UX, autosave, undo/redo, and import/export for highest writer productivity gains.

If you want, I can:
- Generate a starter PR for Task 1 (document model + parser).
- Produce component skeletons for Task 2 (block-based editor) matching existing repo patterns.
- Create a sample API design for collaboration (Task 11) using Firestore vs CRDT recommendations.

Which task should I prepare a PR for first?
```