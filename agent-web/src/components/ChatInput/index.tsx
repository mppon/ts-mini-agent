import type { KeyboardEvent } from 'react'
import './index.css'

interface ChatInputProps {
  value: string
  disabled: boolean
  onChange: (value: string) => void
  onSend: () => void
}

function ChatInput({ value, disabled, onChange, onSend }: ChatInputProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (value.trim()) {
        onSend()
      }
    }
  }

  return (
    <div className="chat-input-wrapper">
      <textarea
        className="chat-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="请输入问题，按回车发送..."
        rows={2}
        disabled={disabled}
      />
      <button
        className="send-button"
        type="button"
        onClick={onSend}
        disabled={disabled || !value.trim()}
        aria-label="发送"
        title="发送"
      >
        <span className="send-icon">➤</span>
      </button>
    </div>
  )
}

export default ChatInput
