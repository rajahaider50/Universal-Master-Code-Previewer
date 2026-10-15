export type ProjectFile = {
  id: string
  name: string
  path: string
  content: string
  language: string
  updatedAt: number
}

export type Project = {
  id: string
  name: string
  files: ProjectFile[]
  activeFileId: string | null
  updatedAt: number
}

export const starterFiles: ProjectFile[] = [
  {
    id: 'index-html',
    name: 'index.html',
    path: 'index.html',
    language: 'html',
    updatedAt: Date.now(),
    content: '<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>Hello preview</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <main class="card">\n    <p class="eyebrow">LIVE PREVIEW</p>\n    <h1>Hello, developer.</h1>\n    <p>Edit the HTML, CSS or JavaScript file and press Run preview.</p>\n    <button id="hello">Test interaction</button>\n    <p id="result" aria-live="polite"></p>\n  </main>\n  <script src="script.js"></script>\n</body>\n</html>',
  },
  {
    id: 'style-css',
    name: 'style.css',
    path: 'style.css',
    language: 'css',
    updatedAt: Date.now(),
    content: 'body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #07111f; color: #e8f1ff; font-family: system-ui, sans-serif; }\n.card { width: min(560px, calc(100% - 48px)); padding: 28px; border: 1px solid #23405f; border-radius: 24px; background: #0d1c2e; box-shadow: 0 24px 70px #0005; }\n.eyebrow { color: #61d7ff; letter-spacing: .16em; font-size: 12px; }\nbutton { border: 0; border-radius: 12px; padding: 12px 16px; color: #06111e; background: #61d7ff; font-weight: 700; }',
  },
  {
    id: 'script-js',
    name: 'script.js',
    path: 'script.js',
    language: 'javascript',
    updatedAt: Date.now(),
    content: 'document.querySelector("#hello")?.addEventListener("click", () => {\n  const result = document.querySelector("#result");\n  if (result) result.textContent = "JavaScript preview is running.";\n});',
  },
]

export function detectLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  const map: Record<string, string> = {
    html: 'html', htm: 'html', css: 'css', js: 'javascript', mjs: 'javascript',
    cjs: 'javascript', ts: 'typescript', tsx: 'typescriptreact', jsx: 'javascriptreact',
    json: 'json', md: 'markdown', py: 'python', sql: 'sql', xml: 'xml',
    yaml: 'yaml', yml: 'yaml', sh: 'shell', java: 'java', kt: 'kotlin',
    swift: 'swift', c: 'c', h: 'c', cpp: 'cpp', hpp: 'cpp', go: 'go',
    rs: 'rust', php: 'php', rb: 'ruby', toml: 'toml', txt: 'text',
  }
  return map[ext] ?? 'text'
}
