# Universal Master Code Previewer — Manus Handoff Package

This is a **Phase 1 starter scaffold**, not a finished universal IDE. It gives Manus AI a real project foundation and a detailed execution brief to continue implementation in your GitHub repository.

## Current starter capabilities
- React + TypeScript + Vite application shell
- Dark, responsive developer-workspace UI
- Import individual text/code files from the device
- Basic project file list and editor
- HTML/CSS/JavaScript preview in a sandboxed iframe
- Local project persistence in browser localStorage (starter only; migrate to IndexedDB/OPFS in a later phase)
- Build/test/lint scripts and GitHub Actions CI
- Manus implementation instructions and phase acceptance gates

## Not yet implemented
ZIP/folder import, robust IndexedDB/OPFS storage, syntax highlighting, broad language runtimes, React/TSX project execution, Pyodide/SQL runtimes, AI providers/Auto-Fix, Android APK/Capacitor integration, advanced import security, and full end-to-end tests. Manus must implement these in phases and must not claim they are complete without evidence.

## Run locally
Requires Node.js 20+ and npm (only for development/build; no backend server is required for the app's core features).

```bash
npm install
npm run dev
npm run lint
npm run test
npm run build
```

## GitHub
Repository target: `https://github.com/rajahaider50/Universal-Master-Code-Previewer`
Default branch: `main`

Upload/extract the contents of this ZIP at the repository root, or give the ZIP and `MANUS_MASTER_INSTRUCTIONS.md` to Manus AI and authorize it to inspect, commit, push, and run GitHub Actions.

**Security:** Do not commit API keys, tokens, credentials, signing keys, or `.env` files containing secrets.
