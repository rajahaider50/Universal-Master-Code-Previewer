# MASTER EXECUTION INSTRUCTIONS — Universal Master Code Previewer

You are Manus AI acting as senior frontend/platform engineer, Android integration engineer, QA lead, and GitHub release engineer.

## Goal
Complete the repository `rajahaider50/Universal-Master-Code-Previewer` into a polished, mobile-first universal code viewer/editor/importer with safe previews and optional local/browser-based runtimes. Work directly in GitHub if permissions are available. The user primarily works from an Android phone and wants a free-first design with no mandatory paid API or backend.

Repository: https://github.com/rajahaider50/Universal-Master-Code-Previewer
Default branch: main

## Important honesty rule
This supplied ZIP is a Phase 1 starter scaffold, not the finished product. Inspect it first. Do not tell the user the project is complete until tests and builds have actually run. Never fabricate test logs, screenshots, CI success, commits, APKs, or feature support. For every phase report one of: PASS, BLOCKED, FAIL. A phase can be PASS only with real test/build evidence.

## Preferred stack
- React + TypeScript + Vite + Tailwind CSS
- CodeMirror 6 for editor and language support
- IndexedDB + OPFS where supported; localStorage only for small preferences, not full projects
- fflate for ZIP reading, with path traversal and decompression-bomb protections
- Sandboxed iframe for HTML/CSS/JS preview, strict CSP where possible, no unrestricted bridge
- Web Workers for expensive parsing/compilation
- Optional esbuild-wasm for suitable JS/TS/JSX workflows; explain limits of arbitrary Vite projects and package resolution
- Optional Pyodide for Python and SQLite WASM for SQL if practical and tested
- Capacitor for Android packaging after web functionality is stable
- Vitest + React Testing Library + Playwright where supported
- ESLint, TypeScript strict mode, GitHub Actions CI, dependency auditing
- No mandatory backend, Firebase, Supabase, MySQL, PostgreSQL, or paid AI API. Node.js is allowed for build/test tooling only, not as a required production backend. Python is not a backend requirement.

## UX / design
Premium, mobile-first workspace; navy/blue/cyan developer aesthetic; responsive phone/tablet/desktop; proper SVG/icon library, never emoji as UI icons; clear empty states, loading/error states, accessible focus, keyboard support, subtle animation respecting reduced-motion. On phone, optimize for touch and small screens. Avoid blocking browser zoom or selection unless an explicit, justified UX requirement exists.

## Core requirements (eventual target)
1. Import individual files from Android file picker / browser.
2. Import ZIP and folders where browser/platform APIs permit; clearly disclose platform limitations.
3. Detect file types and display text/code safely; binary files should be identified, not corrupted as text.
4. Code editor with syntax highlighting, search, line numbers, dirty-state indicator, save/undo.
5. Preview HTML/CSS/JS using a restricted sandbox.
6. Detect project types and show helpful diagnostics.
7. Support selected JS/TS/React workflows through documented browser compilation, without promising all projects work.
8. Optional Python and SQL execution only through appropriate browser runtimes, with resource limits.
9. Optional AI provider settings, stored safely. Warn that browser API keys can be extracted by the device owner or scripts; never embed secrets in source or commits.
10. AI Auto-Fix must show diagnosis, proposed diff, user approval, backup/undo, then run tests/retest. Never auto-overwrite silently.
11. Android APK via Capacitor only after web app passes gates. Document Android permissions and offline limitations.
12. Offline-first where technically feasible; document runtime/model downloads and cache limits.

## Security / reliability
- Treat all imported project files as untrusted.
- Prevent ZIP path traversal; limit file count, uncompressed size, nesting and compression ratio; reject suspicious archives.
- Preview in sandboxed iframe; no allow-same-origin + scripts combination unless an explicit security review justifies it.
- Do not execute imported scripts in the main app origin.
- Avoid exposing filesystem/native bridge or app secrets to previews.
- Add timeout/output/resource controls to runtimes where feasible.
- Do not execute a project automatically upon import.
- No telemetry by default; document any network requests.
- Avoid unsafe HTML injection into the app shell.

## Phase workflow (must be followed in order)
Phase 1 — Foundation and build gates
Phase 2 — Design system and responsive shell
Phase 3 — Project model and IndexedDB/OPFS persistence
Phase 4 — Secure import engine (single file, ZIP, folder where supported)
Phase 5 — Editor experience (CodeMirror)
Phase 6 — Project detection and diagnostics
Phase 7 — HTML/CSS/JS preview sandbox
Phase 8 — Selected React/TSX/Tailwind build path
Phase 9 — Preview isolation/security tests
Phase 10 — Runtime adapter interface and selected runtimes
Phase 11 — Python/SQL optional runtimes
Phase 12 — AI provider configuration
Phase 13 — AI Auto-Fix diff/backup/undo/retest
Phase 14 — Capacitor Android integration and APK workflow
Phase 15 — QA, accessibility, performance, offline behavior
Phase 16 — release documentation and final acceptance

For each phase:
A. Inspect current repo and state the scope.
B. Implement only the phase plus required repairs.
C. Add/update automated tests.
D. Run lint, tests, and production build (and relevant targeted tests).
E. Inspect actual outputs; fix failures and rerun.
F. Report changed files, commands run, real results, limitations, and status.
G. Commit/push only if authorized and tests are appropriate. Do not rewrite or force-push history without permission.

## Acceptance gate
Phase 1 passes only if `npm ci` or `npm install`, `npm run lint`, `npm run test`, and `npm run build` succeed in the actual environment and CI workflow is valid. If the repository has no commit, create an initial commit without force-pushing. If GitHub integration cannot write, explain the permission issue and give the user exact manual steps; do not claim a push happened.

At the end of each phase, stop and report PASS/BLOCKED/FAIL. Continue to the next phase only when the current phase passes, unless the user explicitly instructs otherwise.

## Immediate task
1. Inspect the supplied starter files and repository state.
2. Import the starter into `rajahaider50/Universal-Master-Code-Previewer`.
3. Run Phase 1 commands and GitHub Actions CI.
4. Fix all Phase 1 failures.
5. Report the actual commit SHA/URL and workflow run URL if pushed.
6. Stop at the Phase 1 gate. Do not claim future-phase functionality exists.
