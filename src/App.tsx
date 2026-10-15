import { useEffect, useMemo, useRef, useState } from 'react'
import { Activity, Code2, FileCode2, FilePlus2, FolderOpen, Play, RefreshCw, Save, ShieldCheck, Smartphone, Upload, X } from 'lucide-react'
import { detectLanguage, starterFiles, type ProjectFile } from './model'
import { buildPreviewDocument } from './preview'

const STORAGE_KEY = 'umcp-starter-project-v1'

function loadFiles(): ProjectFile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as ProjectFile[]
      if (Array.isArray(parsed) && parsed.every((item) => item && typeof item.id === 'string' && typeof item.content === 'string')) return parsed
    }
  } catch {
    // Fall back to sample files if local data is unavailable or malformed.
  }
  return starterFiles
}

export default function App() {
  const [files, setFiles] = useState<ProjectFile[]>(loadFiles)
  const [activeId, setActiveId] = useState<string>(() => loadFiles()[0]?.id ?? '')
  const [preview, setPreview] = useState(false)
  const [notice, setNotice] = useState('Ready — your sample project is stored on this device.')
  const [search, setSearch] = useState('')
  const [savedAt, setSavedAt] = useState('Not saved yet')
  const inputRef = useRef<HTMLInputElement>(null)
  const activeFile = files.find((file) => file.id === activeId) ?? files[0]
  const previewDocument = useMemo(() => buildPreviewDocument(files), [files])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(files))
    } catch {
      // Explicit Save reports storage errors; autosave remains best-effort.
    }
  }, [files])

  const updateActive = (content: string) => {
    if (!activeFile) return
    setFiles((current) => current.map((file) => file.id === activeFile.id ? { ...file, content, updatedAt: Date.now() } : file))
  }

  const importFiles = async (list: FileList | null) => {
    if (!list?.length) return
    const accepted: ProjectFile[] = []
    for (const file of Array.from(list)) {
      if (file.size > 2 * 1024 * 1024) {
        setNotice(`${file.name} skipped: starter import limit is 2 MB per file.`)
        continue
      }
      const looksBinary = file.type.startsWith('image/') || file.type.startsWith('audio/') || file.type.startsWith('video/') || file.type === 'application/pdf'
      if (looksBinary) {
        setNotice(`${file.name} skipped: this starter accepts text/code files only.`)
        continue
      }
      const content = await file.text()
      accepted.push({ id: crypto.randomUUID(), name: file.name, path: file.webkitRelativePath || file.name, content, language: detectLanguage(file.name), updatedAt: Date.now() })
    }
    if (accepted.length) {
      setFiles((current) => [...current, ...accepted])
      setActiveId(accepted[0].id)
      setPreview(false)
      setNotice(`Imported ${accepted.length} text/code file(s). Imported code is not executed automatically.`)
    }
  }

  const createFile = () => {
    const name = window.prompt('New file name', 'new-file.html')?.trim()
    if (!name) return
    if (files.some((file) => file.path === name)) {
      setNotice('A file with that name already exists.')
      return
    }
    const file: ProjectFile = { id: crypto.randomUUID(), name, path: name, content: '', language: detectLanguage(name), updatedAt: Date.now() }
    setFiles((current) => [...current, file])
    setActiveId(file.id)
    setNotice(`Created ${name}.`)
  }

  const visibleFiles = files.filter((file) => file.path.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Universal Master Code Previewer home">
          <span className="brand-mark"><Code2 size={22} /></span>
          <span><strong>UNIVERSAL</strong><small>MASTER CODE PREVIEWER</small></span>
        </a>
        <div className="top-actions">
          <span className="status-pill"><span className="status-dot" /> Local workspace</span>
          <button className="icon-button" title="Import files" aria-label="Import files" onClick={() => inputRef.current?.click()}><Upload size={18} /></button>
          <button className="primary-button" onClick={() => { setPreview(true); setNotice('Preview refreshed in a restricted iframe. External network requests are blocked by the preview policy.') }}><Play size={16} /> Run preview</button>
        </div>
        <input ref={inputRef} hidden type="file" multiple onChange={(event) => { void importFiles(event.target.files); event.currentTarget.value = '' }} />
      </header>

      <main className="workspace">
        <aside className="sidebar">
          <div className="section-heading"><span>PROJECT EXPLORER</span><button className="mini-button" aria-label="Create file" title="Create file" onClick={createFile}><FilePlus2 size={16} /></button></div>
          <div className="project-label"><FolderOpen size={15} /><span>my-workspace</span><span className="file-count">{files.length}</span></div>
          <input className="search-input" placeholder="Filter files…" value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Filter files" />
          <div className="file-list">
            {visibleFiles.map((file) => (
              <button key={file.id} className={`file-item ${activeFile?.id === file.id ? 'active' : ''}`} onClick={() => { setActiveId(file.id); setPreview(false) }}>
                <FileCode2 size={15} /><span>{file.path}</span>
              </button>
            ))}
            {!visibleFiles.length && <p className="empty-note">No matching files.</p>}
          </div>
          <div className="sidebar-bottom"><ShieldCheck size={16} /><span>Files stay in this browser on this device.</span></div>
        </aside>

        <section className="editor-area">
          <div className="editor-toolbar">
            <div className="crumbs"><span>my-workspace</span><span className="slash">/</span><strong>{activeFile?.path ?? 'No file selected'}</strong></div>
            <div className="toolbar-actions"><span className="language-label">{activeFile?.language ?? 'text'}</span><button className="subtle-button" onClick={() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(files)); setSavedAt(new Date().toLocaleTimeString()); setNotice('Saved locally on this device.') } catch { setNotice('Unable to save: browser storage may be full.') } }}><Save size={15} /> Save</button></div>
          </div>
          {activeFile ? <div className="code-editor"><div className="line-numbers" aria-hidden="true">{Array.from({ length: Math.max(1, activeFile.content.split('\n').length) }, (_, i) => <span key={i}>{i + 1}</span>)}</div><textarea spellCheck={false} aria-label={`Editor for ${activeFile.path}`} value={activeFile.content} onChange={(event) => updateActive(event.target.value)} /></div> : <div className="empty-editor"><FileCode2 size={34} /><h2>No file selected</h2><p>Import a text file or create a new one to begin.</p></div>}
          <div className="editor-footer"><span><span className="footer-dot" /> {notice}</span><span>Saved {savedAt}</span></div>
        </section>

        <section className={`preview-area ${preview ? 'preview-active' : ''}`}>
          <div className="preview-header"><div><Activity size={16} /><strong>LIVE PREVIEW</strong><span className="preview-tag">SANDBOX</span></div><div className="preview-buttons"><button className="mini-button" aria-label="Refresh preview" title="Refresh preview" onClick={() => setPreview(true)}><RefreshCw size={15} /></button><button className="mini-button" aria-label="Close preview" title="Close preview" onClick={() => setPreview(false)}><X size={16} /></button></div></div>
          {preview ? <iframe title="Sandboxed HTML preview" sandbox="allow-scripts" referrerPolicy="no-referrer" srcDoc={previewDocument} /> : <div className="preview-empty"><div className="preview-icon"><Smartphone size={26} /></div><h2>Your preview appears here</h2><p>Choose <b>Run preview</b> to render the first HTML file with linked CSS and JavaScript.</p><button className="primary-button" onClick={() => setPreview(true)}><Play size={15} /> Run preview</button><small>Sandboxed · External network blocked · No auto-execution on import</small></div>}
        </section>
      </main>
      <footer className="app-footer"><span>UMCP <span className="footer-separator">/</span> Phase 1 starter</span><span>Free-first · No backend required · Build status must be verified</span></footer>
    </div>
  )
}
