import { describe, expect, it } from 'vitest'
import { buildPreviewDocument } from './preview'
import type { ProjectFile } from './model'

const file = (name: string, content: string): ProjectFile => ({
  id: name, name, path: name, content, language: 'text', updatedAt: 0,
})

describe('buildPreviewDocument', () => {
  it('returns a helpful document if there is no HTML file', () => {
    expect(buildPreviewDocument([file('readme.md', '# Hello')])).toContain('No HTML file found')
  })

  it('adds a restrictive CSP and inlines a linked stylesheet', () => {
    const html = '<html><head></head><body><link rel="stylesheet" href="style.css"><h1>Hi</h1></body></html>'
    const result = buildPreviewDocument([file('index.html', html), file('style.css', 'h1 { color: red; }')])
    expect(result).toContain('Content-Security-Policy')
    expect(result).toContain('<style>h1 { color: red; }</style>')
  })

  it('inlines a linked JavaScript file for sandbox preview', () => {
    const html = '<html><head></head><body><script src="script.js"></script></body></html>'
    const result = buildPreviewDocument([file('index.html', html), file('script.js', 'window.testValue = 1;')])
    expect(result).toContain('window.testValue = 1;')
    expect(result).toContain("connect-src 'none'")
  })
})
