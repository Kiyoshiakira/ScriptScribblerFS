# Tasks and Improvements for ScriptScribbler

Below is a numbered list of focused tasks you can feed to Copilot agents over time. Each item is written so it can be converted into an issue and then into one or more PRs. Tasks range from high-priority bug fixes to medium/low priority improvements for reliability, developer experience, and UI/UX.

Important: adjust branch names and minor details to match your repo conventions. Reference files mentioned when applicable.

1. Centralize SCRIPT_TOKEN_LIMIT constant
   - Problem: Duplicate constant found in src/ai/flows/ai-proofread-script.ts and src/app/actions.ts.
   - Change: Create src/constants.ts with `export const SCRIPT_TOKEN_LIMIT = 1_000_000;` and replace other declarations with `import { SCRIPT_TOKEN_LIMIT } from '@/constants';`.
   - Tests: Run TypeScript build and linter.
   - Files to modify: src/constants.ts, src/ai/flows/ai-proofread-script.ts, src/app/actions.ts

2. Rename and clarify app/actions wrappers vs flow exports
   - Problem: Functions like `aiReformatScript` exist both as flow exports and as action wrappers; this causes confusion.
   - Change: Rename wrapper exports in src/app/actions.ts to `runAiReformatScript`, `runAiProofreadScript`, `runAiGenerateLogline`, `runAiGenerateCharacterProfile`, `runAiAgent`, etc., and update imports across the app.
   - Tests: Search/replace imports; run TypeScript build to ensure no broken imports.
   - Files to modify: src/app/actions.ts and any files importing those wrappers (components, pages).

3. Ensure Firestore batch writes include commit
   - Problem: writeBatch used in app-header import flow but commit may be missing or out of sight.
   - Change: Verify batch.commit() is called after all operations. Add `await batch.commit();` and handle errors.
   - Tests: Manual test: import a Scrite file and verify data appears in Firestore.

4. Remove unused imports and tidy dependencies
   - Problem: Observed unused imports (e.g., `googleAI` in some files).
   - Change: Run ESLint to find unused imports and remove them (or use them if intended). Clean up package.json dependencies if any packages are unused.
   - Tests: Run `npm run lint` and fix reported issues.

5. Add robust handling when GEMINI_API_KEY is missing (graceful UI)
   - Problem: UI can appear broken if GEMINI_API_KEY is absent because many actions return error objects.
   - Change: In src/app/actions.ts, keep server-side checks but:
     - Add a client-exposed config endpoint or NEXT_PUBLIC flag `NEXT_PUBLIC_AI_ENABLED` so UI can detect AI availability and show “AI disabled” state.
     - Update UI components (AI FAB, Assistant, Editor) to show a non-blocking message if AI disabled, and disable buttons rather than block rendering.
   - Files to modify: src/app/actions.ts, src/components/ai-fab.tsx, src/components/ai-assistant.tsx, possibly layout components.

6. Improve AI output validation and logging
   - Problem: Zod schema validation will throw if model returns unexpected output; raw response isn't easy to debug.
   - Change:
     - Add a small wrapper around ai.generate/ai flows to catch validation errors, log raw responses (sanitized), and return an internal error message with details.
     - Optionally, store recent raw model outputs in server logs (rotating or limited).
   - Files to modify: src/ai/genkit.ts (if present) or wrap calls in flows (ai-*.ts files).
   - Tests: Cause model to return invalid JSON (mock) and verify logs include raw response.

7. Consider switching default model to gemini-2.5-flash (configurable)
   - Problem: You want better AI performance/quality.
   - Change:
     - Make the model name configurable via env (e.g., GEMINI_MODEL or GENKIT_MODEL). Default to existing model, but provide docs to change to `gemini-2.5-flash`.
     - Update genkit/google-ai initialization to read model from env.
   - Files to modify: src/ai/genkit.ts or wherever googleAI is configured.
   - Tests: Verify flows work with the new model name (if you have access/credentials).

8. Add defensive guards in editor render to avoid crashes
   - Problem: Editor tab sometimes doesn't load — often caused by null/undefined user, script, or thrown exceptions during render.
   - Change:
     - Add an Error Boundary around the editor component to prevent whole tab collapse and show a friendly error.
     - Add early-return guards for user/script usage (e.g., `if (!user) return <SignInPrompt/>;`).
     - Add detailed logging when editor fails to mount.
   - Files to modify: Create src/components/ErrorBoundary.tsx and wrap the editor view (e.g., in page layout or editor container).
   - Tests: Simulate missing user/script to confirm fallback UIs.

9. Add Firestore rules and client-side permission checks
   - Problem: Permission denied errors break editor when user lacks rights.
   - Change:
     - Ensure Firestore rules restrict writes but allow reads for authenticated owners.
     - Add client-side checks to detect permission errors and show descriptive messages.
   - Files to modify: firebase rules in repo (if present), UI components that fetch scripts.

10. Add timeouts and cancellation for long AI requests
    - Problem: UI may hang waiting for AI calls.
    - Change:
      - Add a configurable timeout for AI requests (server-side) and return a timeout error to UI.
      - On client, show retry/cancel UI and use AbortController to cancel requests where supported.
    - Files to modify: server-side actions (src/app/actions.ts), client API calls.

11. Improve proofread suggestions UI performance and UX
    - Problem: Large suggestion lists and animations can be heavy.
    - Change:
      - Virtualize long suggestion lists (react-window or similar) for performance.
      - Add quick “apply correction” buttons to replace selected text in editor.
      - Allow batch-apply or preview-only mode.
    - Files to modify: src/components/ai-fab.tsx (proofread UI), editor integration.

12. Add more tests (unit & integration)
    - Problem: Repo lacks automated tests to prevent regressions.
    - Change:
      - Add basic unit tests for action wrappers and AI flow inputs/outputs (mock ai responses).
      - Add an integration test for editor mounting (React Testing Library).
      - Add CI step to run tests.
    - Files to create: tests for actions and components; update GitHub Actions workflow.

13. Add linting and CI checks
    - Problem: Code style and duplicates can creep in.
    - Change:
      - Ensure ESLint + Prettier are configured and run on CI (pre-commit hooks).
      - Add TypeScript `tsc --noEmit` check in CI.
    - Files to modify: .github/workflows/ci.yml (create if missing), .eslintrc, prettier config.

14. Add better error messages and telemetry for AI failures
    - Problem: Generic "An error occurred" messages are unhelpful.
    - Change:
      - Return structured errors from actions with codes (e.g., AI_DISABLED, TIMEOUT, MODEL_ERROR).
      - Capture minimal telemetry (error code, user action) to server logs for debugging.
      - Avoid logging secrets.
    - Files to modify: src/app/actions.ts and client error displays.

15. Add a feature flag for AI-enabled flows
    - Problem: Need safe rollout and ability to disable AI features temporarily.
    - Change:
      - Add a simple runtime feature flag (env or remote) `FEATURE_AI=false/true`.
      - Use it to toggle UI controls and server endpoints.
    - Files to modify: src/app/actions.ts, UI components.

16. Improve import flow (Scrite / ZIP import)
    - Problem: Import flow might fail silently or leave partial data.
    - Change:
      - Add validation for parsed files.
      - Perform imports in transactions or ensure rollback on failure.
      - Show progress and success/failure details to the user.
    - Files to modify: src/components/layout/app-header.tsx and helper import utilities.

17. Add accessibility and keyboard support to editor and AI panels
    - Problem: UX improvements needed.
    - Change:
      - Ensure editor elements have appropriate ARIA roles.
      - Allow keyboard navigation for AI suggestions and quick apply buttons.
    - Files to modify: editor component and ai-fab/assistant UI components.

18. Optimize editor performance (virtualize large script rendering)
    - Problem: Large scripts may cause slow renders.
    - Change:
      - Use virtualization for line rendering, debounce expensive operations, memoize heavy computations.
    - Files to modify: the editor component and its context hooks.

19. Add error reporting UI for end-users
    - Problem: Users see technical errors but can't report them.
    - Change:
      - Add a "Report error" button in error boundaries that pre-fills logs and environment (non-sensitive).
      - Optionally integrate with an issue tracker or create a feedback Firestore collection.
    - Files to modify: ErrorBoundary, report UI.

20. Document developer setup and troubleshooting steps
    - Problem: Onboarding and debugging (editor not loading) are painful.
    - Change:
      - Add README section for running locally, env variables, AI key deps, debugging editor issues (console logs to watch).
      - Document how to switch Gemini models and where to set GEMINI_MODEL.
    - Files to modify: README.md (or docs/DEV_SETUP.md)

21. Add Zod-safe parsing helpers for AI outputs
    - Problem: Zod parse throws; better to use safeParse and enriched errors.
    - Change:
      - Replace `schema.parse()` with `schema.safeParse()` and when invalid, log `result.error` plus raw response.
    - Files to modify: ai flow files (src/ai/flows/*.ts)

22. Add graceful fallback when AI returns non-JSON
    - Problem: Model sometimes returns plaintext or partial JSON causing parse errors.
    - Change:
      - If parsing fails, attempt a best-effort extraction (regex) and fall back to original content with a clear error.
    - Files to modify: ai flow wrappers.

23. Add a "simulate AI" dev mode
    - Problem: Tests and local development may not have access to real Gemini keys.
    - Change:
      - Add an environment-driven simulation (`SIMULATE_AI=true`) that returns canned responses for each flow to enable UI testing without external API.
    - Files to modify: ai flow wrappers and actions.

24. Add clear logging for editor load flow (instrument the mount)
    - Problem: Hard to find why editor hangs.
    - Change:
      - Add debug logs when editor mounts, when it fetches script, and when it receives data or errors.
      - Consider using debug-level logger (enable via env).
    - Files to modify: editor component and script context provider.

25. Introduce incremental, small PR plan
    - Change: Break work into small PRs (one per task above). For each PR, include:
      - Description
      - Files changed
      - Tests added
      - Manual test steps
    - Benefit: Faster reviews and safer rollouts.

---

Notes for Copilot agents
- Default to small, single-purpose PRs (one logical change per PR).
- Ensure TypeScript build and linter pass in each PR.
- If changing exported function names (task 2), include a migration plan for imports (use repo-wide rename tool or create temporary re-exports to avoid breaking imports).
- When adding logging or telemetry, never log sensitive data (API keys, tokens, PII).
- When switching models (task 7), ensure env names are documented and model access is available for the Google Cloud project.

If you want, I can:
- Generate the exact patch for task 1 (centralize constant).
- Generate a starter PR body and file diffs for task 2 (rename wrappers).
- Inspect the editor component files to propose exact code fixes if you paste the editor file path or contents.

Which task should I prepare the PR for first?