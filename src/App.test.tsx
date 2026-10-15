import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from './App'

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  cleanup()
})

describe('workspace UI', () => {
  it('renders the explorer, plain-text editor, and explicit preview controls', () => {
    render(<App />)
    expect(screen.getByText('PROJECT EXPLORER')).toBeInTheDocument()
    expect(screen.getByLabelText('Editor for index.html')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Run preview now' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Run preview from panel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Refresh preview' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Close preview' })).toBeDisabled()
    expect(screen.getByText(/plain text/i)).toBeInTheDocument()
  })

  it('switches mobile panels using accessible pressed-state controls', async () => {
    const user = userEvent.setup()
    render(<App />)
    const filesTab = screen.getByRole('button', { name: 'Files' })
    const editorTab = screen.getByRole('button', { name: 'Editor' })
    const previewTab = screen.getByRole('button', { name: 'Preview' })

    expect(editorTab).toHaveAttribute('aria-pressed', 'true')
    await user.click(filesTab)
    expect(filesTab).toHaveAttribute('aria-pressed', 'true')
    expect(editorTab).toHaveAttribute('aria-pressed', 'false')
    await user.click(previewTab)
    expect(previewTab).toHaveAttribute('aria-pressed', 'true')
  })

  it('filters files and opens the selected file in the editor', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByRole('searchbox', { name: 'Filter files' }), 'script')
    expect(screen.getByRole('button', { name: /script\.js/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /index\.html/i })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /script\.js/i }))
    expect((screen.getByLabelText('Editor for script.js') as HTMLTextAreaElement).value).toContain('addEventListener')
  })

  it('edits the active file and autosaves project data locally', async () => {
    render(<App />)
    const editor = screen.getByLabelText('Editor for index.html')
    fireEvent.change(editor, { target: { value: '<!doctype html>\n<h1>Local edit</h1>' } })
    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('umcp-starter-project-v1') ?? '[]') as Array<{ id: string; content: string }>
      expect(saved.find((file) => file.id === 'index-html')?.content).toContain('Local edit')
    })
  })

  it('creates a file through the accessible dialog', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'New file' }))
    const dialog = screen.getByRole('dialog', { name: 'Create a file' })
    const nameInput = screen.getByRole('textbox', { name: 'File name' })
    await user.clear(nameInput)
    await user.type(nameInput, 'notes.md')
    await user.click(screen.getByRole('button', { name: 'Create file' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Editor for notes.md')).toBeInTheDocument()
    expect(dialog).not.toBeInTheDocument()
  })

  it('imports a text file without running it automatically', async () => {
    const user = userEvent.setup()
    render(<App />)
    const imported = new File(['export const answer = 42'], 'answer.ts', { type: 'text/plain' })
    Object.defineProperty(imported, 'text', { value: async () => 'export const answer = 42' })
    await user.upload(screen.getByLabelText('Select text or code files to import'), imported)
    expect(await screen.findByLabelText('Editor for answer.ts')).toHaveValue('export const answer = 42')
    expect(screen.queryByTitle('Sandboxed HTML preview')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(/does not run until you choose Run preview/i)
  })

  it('runs, refreshes, and closes preview in a sandbox without same-origin access', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Run preview now' }))
    const firstFrame = screen.getByTitle('Sandboxed HTML preview')
    expect(firstFrame).toHaveAttribute('sandbox', 'allow-scripts')
    expect(firstFrame.getAttribute('sandbox')).not.toContain('allow-same-origin')
    expect(firstFrame.getAttribute('srcdoc')).toContain('Content-Security-Policy')

    await user.click(screen.getByRole('button', { name: 'Refresh preview' }))
    const refreshedFrame = screen.getByTitle('Sandboxed HTML preview')
    expect(refreshedFrame).not.toBe(firstFrame)
    await user.click(screen.getByRole('button', { name: 'Close preview' }))
    expect(screen.queryByTitle('Sandboxed HTML preview')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(/Preview closed/i)
  })
})
