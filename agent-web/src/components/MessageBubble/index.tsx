import './index.css'

interface MessageBubbleProps {
  role: 'user' | 'assistant' | 'system' | 'error'
  content: string
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderMarkdown(text: string) {
  let html = escapeHtml(text)

  html = html.replace(/```([\s\S]*?)```/g, (_, code) => {
    return `<pre><code>${escapeHtml(code.trim())}</code></pre>`
  })

  html = html.replace(/`([^`]+)`/g, (_, code) => `<code>${escapeHtml(code)}</code>`)
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
  html = html.replace(/_(.*?)_/g, '<em>$1</em>')
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')

  const lines = html.split(/\r?\n/)
  const parsed = []
  let inList = false

  for (const line of lines) {
    if (/^\s*[-*+]\s+/.test(line)) {
      if (!inList) {
        parsed.push('<ul>')
        inList = true
      }
      const item = line.replace(/^\s*[-*+]\s+/, '')
      parsed.push(`<li>${item}</li>`)
      continue
    }
    if (inList) {
      parsed.push('</ul>')
      inList = false
    }
    if (line.trim() === '') {
      parsed.push('<br/>')
      continue
    }
    parsed.push(`<p>${line}</p>`)
  }

  if (inList) {
    parsed.push('</ul>')
  }

  return parsed.join('')
}

function MessageBubble({ role, content }: MessageBubbleProps) {
  return (
    <div className={`message-bubble message-${role}`}>
      <div className="message-content" dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
    </div>
  )
}

export default MessageBubble
