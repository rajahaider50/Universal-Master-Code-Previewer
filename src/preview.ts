import type { ProjectFile } from './model'

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function buildPreviewDocument(files: ProjectFile[]): string {
  const htmlFile = files.find((file) => file.path.toLowerCase().endsWith('.html'))
  if (!htmlFile) {
    return '<!doctype html><html><body style="font-family:system-ui;background:#07111f;color:#e8f1ff;padding:24px"><h2>No HTML file found</h2><p>Add an .html file to preview this project.</p></body></html>'
  }
  let html = htmlFile.content
  for (const file of files) {
    if (file.path.toLowerCase().endsWith('.css')) {
      const basename = file.path.split('/').pop() ?? file.name
      const link = new RegExp(`<link\\b[^>]*href=["']${escapeRegExp(basename)}["'][^>]*>`, 'gi')
      html = html.replace(link, `<style>${file.content.replace(/<\/style/gi, '<\\/style')}</style>`)
    }
    if (file.path.toLowerCase().endsWith('.js')) {
      const basename = file.path.split('/').pop() ?? file.name
      const script = new RegExp(`<script\\b[^>]*src=["']${escapeRegExp(basename)}["'][^>]*><\\/script\\s*>`, 'gi')
      html = html.replace(script, `<script>${file.content.replace(/<\/script/gi, '<\\/script')}</script>`)
    }
  }
  const guard = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: blob:; style-src 'unsafe-inline' data:; script-src 'unsafe-inline'; font-src data:; connect-src 'none'; media-src data: blob:;">`
  if (/<head\b[^>]*>/i.test(html)) return html.replace(/<head\b[^>]*>/i, (match) => `${match}${guard}`)
  return `${guard}${html}`
}
