import { useEffect, useRef } from 'react'
import MessageBubble from '../MessageBubble'
import './index.css'
import type { ChatMessage } from '../../App'

interface ChatWindowProps {
  messages: ChatMessage[]
  status: 'ready' | 'running'
  usage: number
  cache: number
}

function ChatWindow({ messages, status, cache, usage }: ChatWindowProps) {
  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [messages])

  return (
    <section className="chat-window">
      <div className="chat-header">
        <span className={`status-pill ${status === 'running' ? 'status-running' : 'status-ready'}`}>
          {status === 'running' ? 'Thinking…' : 'Ready'}
        </span>
        <div>
          <p className="eyebrow">对话 · cache: {cache}%   usage: {usage} tokens</p>
        </div>
      </div>

      <div className="message-list" role="log" aria-live="polite">
        {messages.map((message) => (
          <MessageBubble key={message.id} role={message.role} content={message.content} />
        ))}
        <div ref={endRef} />
      </div>
    </section>
  )
}

export default ChatWindow
