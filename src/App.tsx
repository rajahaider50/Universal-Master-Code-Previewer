import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import {
  Activity,
  CheckCircle2,
  ChevronRight,
  Code2,
  FileCode2,
  FilePlus2,
  FolderOpen,
  LoaderCircle,
  Play,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Smartphone,
  Upload,
  X,
} from 'lucide-react'
import { detectLanguage, starterFiles, type ProjectFile } from './model'
import { buildPreviewDocument } from './preview'

const STORAGE_KEY = 'umcp-starter-project-v1'
const MAX_FILE_SIZE = 2 * 1024 * 1024

type NoticeTone = 'neutral' | 'success' | 'error'
type WorkspacePane = 'files' | 'editor' | 'preview'

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

function isKnownBinary(file: File) {
  return file.type.startsWith('image/')
    || file.type.startsWith('audio/')
    || file.type.startsWith('video/')
    || file.type === 'application/pdf'
}

export default function App() {
  const [files, setFiles] = useState<ProjectFile[]>(loadFiles)
  const [activeId, setActiveId] = useState<string>(() => loadFiles()[0]?.id ?? '')
  const [preview, setPreview] = useState(false)
  const [previewRunId, setPreviewRunId] = useState(0)
  const [notice, setNotice] = useState('Workspace ready. Files are saved locally on this device.')
  const [noticeTone, setNoticeTone] = useState<NoticeTone>('neutral')
  const [search, setSearch] = useState('')
  const [savedAt, setSavedAt] = useState('Auto-save on this device')
  const [isImporting, setIsImporting] = useState(false)
  const [mobilePane, setMobilePane] = useState<WorkspacePane>('editor')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newFileName, setNewFileName] = useState('new-file.html')
  const inputRef = useRef<HTMLInputElement>(null)
  const activeFile = files.find((file) => file.id === activeId) ?? files[0]
  const previewDocument = useMemo(() => buildPreviewDocument(files), [files])
  const visibleFiles = files.filter((file) => file.path.toLowerCase().includes(search.trim().toLowerCase()))

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(files))
    } catch {
      // Manual Save surfaces storage failures; autosave is best-effort.
    }
  }, [files])

  const announce = (message: string, tone: NoticeTone = 'neutral') => {
    setNotice(message)
    setNoticeTone(tone)
  }

  const updateActive = (content: string) => {
    if (!activeFile) return
    setFiles((current) => current.map((file) => file.id === activeFile.id
      ? { ...file, content, updatedAt: Date.now() }
      : file))
  }

  const importFiles = async (list: FileList | null) => {
    if (!list?.length) return
    setIsImporting(true)
    announce(`Reading ${list.length} file${list.length === 1 ? '' : 's'}…`)
    const accepted: ProjectFile[] = []
    const skipped: string[] = []

    try {
      for (const file of Array.from(list)) {
        if (file.size > MAX_FILE_SIZE) {
          skipped.push(`${file.name} exceeds the 2 MB per-file limit`)
          continue
        }
        if (isKnownBinary(file)) {
          skipped.push(`${file.name} is a binary file; only text/code files are supported`)
          continue
        }
        const content = await file.text()
        accepted.push({
          id: crypto.randomUUID(),
          name: file.name,
          path: file.webkitRelativePath || file.name,
          content,
          language: detectLanguage(file.name),
          updatedAt: Date.now(),
        })
      }

      if (accepted.length) {
        setFiles((current) => [...current, ...accepted])
        setActiveId(accepted[0].id)
        setPreview(false)
        setMobilePane('editor')
        const skippedSummary = skipped.length ? ` ${skipped.join('; ')}.` : ''
        announce(`Imported ${accepted.length} text/code file${accepted.length === 1 ? '' : 's'}.${skippedSummary} Imported code does not run until you choose Run preview.`, 'success')
      } else if (skipped.length) {
        announce(skipped.join('; ') + '.', 'error')
      }
    } catch {
      announce('Import failed while reading a file. Try selecting a supported text or code file again.', 'error')
    } finally {
      setIsImporting(false)
    }
  }

  const createNewFile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = newFileName.trim()
    if (!name) {
      announce('Enter a file name to continue.', 'error')
      return
    }
    if (name.includes('/') || name.includes('\\')) {
      announce('Use a file name only; folder paths are not supported here.', 'error')
      return
    }
    if (files.some((file) => file.path.toLowerCase() === name.toLowerCase())) {
      announce('A file with that name already exists.', 'error')
      return
    }

    const file: ProjectFile = {
      id: crypto.randomUUID(),
      name,
      path: name,
      content: '',
      language: detectLanguage(name),
      updatedAt: Date.now(),
    }
    setFiles((current) => [...current, file])
    setActiveId(file.id)
    setMobilePane('editor')
    setIsCreateDialogOpen(false)
    announce(`Created ${name}. It is ready to edit.`, 'success')
  }

  const runPreview = () => {
    setPreviewRunId((current) => current + 1)
    setPreview(true)
    setMobilePane('preview')
    announce('Preview started in a restricted sandbox. External network access is blocked.', 'success')
  }

  const refreshPreview = () => {
    setPreviewRunId((current) => current + 1)
    setPreview(true)
    announce('Preview refreshed in the restricted sandbox.', 'success')
  }

  const closePreview = () => {
    setPreview(false)
    announce('Preview closed. Imported code will not run again until you choose Run preview.')
  }

  const selectMobilePane = (pane: WorkspacePane) => {
    if (pane !== 'preview' && preview) {
      setPreview(false)
      announce('Preview closed. Run it again when you are ready to view it.')
    }
    setMobilePane(pane)
  }

  const saveNow = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(files))
      const time = new Date().toLocaleTimeString()
      setSavedAt(`Saved locally at ${time}`)
      announce('Saved locally on this device.', 'success')
    } catch {
      announce('Unable to save: browser storage may be full. Export or remove files before continuing.', 'error')
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-group">
          <a className="brand" href="#workspace" aria-label="Universal Master Code Previewer workspace">
            <span className="brand-mark"><Code2 size={21} strokeWidth={2.1} /></span>
            <span className="brand-copy">
              <strong>Universal</strong>
              <small>Master Code Previewer</small>
            </span>
          </a>
          <span className="brand-divider" aria-hidden="true" />
          <div className="project-context">
            <span className="context-label">CURRENT PROJECT</span>
            <span className="context-name">my-workspace</span>
          </div>
        </div>

        <div className="top-actions">
          <span className="status-pill" title="Files remain in this browser on this device">
            <span className="status-dot" />
            <span>Local workspace</span>
          </span>
          <button
            className="secondary-button import-button"
            type="button"
            title="Import text or code files"
            aria-label="Import files"
            disabled={isImporting}
            onClick={() => inputRef.current?.click()}
          >
            {isImporting ? <LoaderCircle className="spin" size={17} /> : <Upload size={17} />}
            <span>{isImporting ? 'Importing…' : 'Import files'}</span>
          </button>
          <button className="primary-button run-button" type="button" aria-label="Run preview now" onClick={runPreview}>
            <Play size={16} fill="currentColor" />
            <span>Run preview</span>
          </button>
        </div>
        <input
          ref={inputRef}
          className="visually-hidden"
          type="file"
          multiple
          aria-label="Select text or code files to import"
          onChange={(event) => {
            void importFiles(event.currentTarget.files)
            event.currentTarget.value = ''
          }}
        />
      </header>

      <nav className="mobile-pane-nav" aria-label="Workspace panels">
        <button type="button" aria-pressed={mobilePane === 'files'} onClick={() => selectMobilePane('files')}>
          <FolderOpen size={17} /><span>Files</span>
        </button>
        <button type="button" aria-pressed={mobilePane === 'editor'} onClick={() => selectMobilePane('editor')}>
          <FileCode2 size={17} /><span>Editor</span>
        </button>
        <button type="button" aria-pressed={mobilePane === 'preview'} onClick={() => selectMobilePane('preview')}>
          <Activity size={17} /><span>Preview</span>
          {preview && <span className="nav-live-dot" aria-label="Preview running" />}
        </button>
      </nav>

      <main className="workspace" id="workspace">
        <aside
          id="files-panel"
          className={`panel explorer-panel ${mobilePane === 'files' ? '' : 'is-mobile-hidden'}`}
          aria-label="Project explorer"
        >
          <div className="panel-heading explorer-heading">
            <div>
              <span className="eyebrow">PROJECT EXPLORER</span>
              <span className="panel-subtitle">Browse your workspace files</span>
            </div>
            <button
              className="icon-button"
              type="button"
              aria-label="New file"
              title="Create a new file"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <FilePlus2 size={18} />
            </button>
          </div>

          <div className="project-card">
            <span className="project-icon"><FolderOpen size={18} /></span>
            <span className="project-name-wrap">
              <strong>my-workspace</strong>
              <small>Local project</small>
            </span>
            <span className="file-count" aria-label={`${files.length} files`}>{files.length}</span>
          </div>

          <label className="search-box">
            <Search size={16} aria-hidden="true" />
            <input
              type="search"
              placeholder="Filter files…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Filter files"
            />
            {search && <button type="button" aria-label="Clear file filter" onClick={() => setSearch('')}><X size={14} /></button>}
          </label>

          <div className="file-list-heading">
            <span>FILES</span>
            <span>{visibleFiles.length} / {files.length}</span>
          </div>
          <div className="file-list" aria-label="Project files">
            {visibleFiles.map((file) => (
              <button
                key={file.id}
                type="button"
                className={`file-item ${activeFile?.id === file.id ? 'active' : ''}`}
                aria-pressed={activeFile?.id === file.id}
                title={file.path}
                onClick={() => {
                  setActiveId(file.id)
                  setPreview(false)
                  setMobilePane('editor')
                  announce(`Opened ${file.path}.`)
                }}
              >
                <FileCode2 size={16} aria-hidden="true" />
                <span className="file-name">{file.path}</span>
                <span className="file-type">{file.language}</span>
              </button>
            ))}
            {!visibleFiles.length && (
              <div className="empty-files">
                <Search size={19} />
                <span>{files.length ? 'No files match this filter.' : 'Your workspace is empty.'}</span>
                {search && <button type="button" onClick={() => setSearch('')}>Clear filter</button>}
              </div>
            )}
          </div>

          <div className="explorer-footer">
            <ShieldCheck size={17} aria-hidden="true" />
            <span><strong>Sandboxed by default</strong><small>Imported code waits for your Run action.</small></span>
          </div>
        </aside>

        <section
          id="editor-panel"
          className={`panel editor-panel ${mobilePane === 'editor' ? '' : 'is-mobile-hidden'}`}
          aria-label="Code editor"
        >
          <div className="panel-toolbar editor-toolbar">
            <div className="breadcrumbs" aria-label="Current file path">
              <span>my-workspace</span>
              <ChevronRight size={14} aria-hidden="true" />
              <strong title={activeFile?.path}>{activeFile?.path ?? 'No file selected'}</strong>
            </div>
            <div className="toolbar-actions">
              <span className="language-label" title="Editing uses a plain text field in this phase">
                {activeFile?.language ?? 'text'} <span>· plain text</span>
              </span>
              <button className="secondary-button save-button" type="button" onClick={saveNow} title="Save files on this device">
                <Save size={15} /><span>Save</span>
              </button>
            </div>
          </div>

          {activeFile ? (
            <div className="editor-content">
              <div className="editor-file-tab">
                <span className="file-tab-icon"><FileCode2 size={15} /></span>
                <span>{activeFile.name}</span>
                <span className="editor-mode">TEXT EDITOR</span>
              </div>
              <div className="code-editor">
                <div className="line-numbers" aria-hidden="true">
                  {Array.from({ length: Math.max(1, activeFile.content.split('\n').length) }, (_, index) => (
                    <span key={index}>{index + 1}</span>
                  ))}
                </div>
                <textarea
                  className="source-editor"
                  spellCheck={false}
                  aria-label={`Editor for ${activeFile.path}`}
                  value={activeFile.content}
                  onChange={(event) => updateActive(event.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="empty-editor">
              <FileCode2 size={31} />
              <h2>No file selected</h2>
              <p>Import a text file or create a new file to begin editing.</p>
              <button className="secondary-button" type="button" onClick={() => inputRef.current?.click()}><Upload size={16} /> Import a file</button>
            </div>
          )}

          <div className={`editor-status notice-${noticeTone}`} role="status" aria-live="polite">
            <span className="status-message">
              {noticeTone === 'error' ? <X size={15} /> : <CheckCircle2 size={15} />}
              <span>{notice}</span>
            </span>
            <span className="save-state" title="Project data is stored in this browser">{savedAt}</span>
          </div>
        </section>

        <section
          id="preview-panel"
          className={`panel preview-panel ${mobilePane === 'preview' ? '' : 'is-mobile-hidden'}`}
          aria-label="Live preview"
        >
          <div className="panel-toolbar preview-toolbar">
            <div className="preview-title">
              <span className="preview-title-icon"><Activity size={17} /></span>
              <span><strong>Live preview</strong><small>Isolated browser frame</small></span>
              <span className="sandbox-badge"><span /> SANDBOX</span>
            </div>
            <div className="preview-controls" aria-label="Preview controls">
              <button className="icon-button preview-control" type="button" aria-label="Run preview from panel" title="Run preview" onClick={runPreview}>
                <Play size={16} />
              </button>
              <button className="icon-button preview-control" type="button" aria-label="Refresh preview" title="Refresh preview" onClick={refreshPreview} disabled={!preview}>
                <RefreshCw size={16} />
              </button>
              <button className="icon-button preview-control close-control" type="button" aria-label="Close preview" title="Close preview" onClick={closePreview} disabled={!preview}>
                <X size={17} />
              </button>
            </div>
          </div>

          <div className="preview-stage">
            {preview ? (
              <iframe
                key={previewRunId}
                title="Sandboxed HTML preview"
                sandbox="allow-scripts"
                referrerPolicy="no-referrer"
                srcDoc={previewDocument}
              />
            ) : (
              <div className="preview-empty">
                <div className="preview-empty-art"><Smartphone size={24} /><span className="preview-art-check"><CheckCircle2 size={14} /></span></div>
                <span className="preview-ready-label"><span /> READY WHEN YOU ARE</span>
                <h2>Your code stays parked until you press Run.</h2>
                <p>Render an HTML file with linked CSS and JavaScript in a separate sandboxed frame. External network access stays blocked.</p>
                <button className="primary-button preview-empty-run" type="button" onClick={runPreview}>
                  <Play size={15} fill="currentColor" /> Run preview
                </button>
                <div className="preview-safety-note"><ShieldCheck size={15} /><span>No auto-run on import</span><span className="safety-separator">·</span><span>Network blocked</span></div>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <span className="footer-brand">UMCP <span>/</span> Phase 2 workspace</span>
        <span><ShieldCheck size={14} /> Local-first <span className="footer-separator">·</span> no backend required</span>
      </footer>

      {isCreateDialogOpen && (
        <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsCreateDialogOpen(false) }}>
          <section className="create-dialog" role="dialog" aria-modal="true" aria-labelledby="create-dialog-title" aria-describedby="create-dialog-description">
            <div className="dialog-icon"><FilePlus2 size={19} /></div>
            <div className="dialog-heading">
              <h2 id="create-dialog-title">Create a file</h2>
              <p id="create-dialog-description">Add a text or code file to this local workspace.</p>
            </div>
            <form onSubmit={createNewFile}>
              <label htmlFor="new-file-name">File name</label>
              <input
                id="new-file-name"
                autoFocus
                value={newFileName}
                onChange={(event) => setNewFileName(event.target.value)}
                placeholder="example.html"
              />
              <div className="dialog-actions">
                <button className="secondary-button" type="button" onClick={() => setIsCreateDialogOpen(false)}>Cancel</button>
                <button className="primary-button" type="submit"><FilePlus2 size={15} /> Create file</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}
