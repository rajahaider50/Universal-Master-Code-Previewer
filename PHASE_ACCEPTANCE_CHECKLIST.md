# Phase Acceptance Checklist

Mark each item only after performing it and saving evidence.

## Phase 1 — Foundation
- [ ] Repository target and branch verified
- [ ] Project files committed without force-pushing existing history
- [ ] `npm install` or `npm ci` completed successfully
- [ ] `npm run lint` passed
- [ ] `npm run test` passed
- [ ] `npm run build` passed
- [ ] GitHub Actions workflow completed successfully
- [ ] Build and CI URLs / commit SHA recorded
- [ ] Known warnings and limitations recorded

## Phase 2 onward
For each phase, record:
- Scope and acceptance criteria
- Files changed
- Tests added
- Exact commands run
- Actual results / failing logs
- Commit SHA and CI URL
- Known limitations
- Status: PASS / BLOCKED / FAIL

Do not mark a feature complete because its UI exists; test the behavior.
