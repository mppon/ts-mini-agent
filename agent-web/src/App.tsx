import { useEffect, useMemo, useRef, useState } from 'react'
import type { Message } from '../../src/llm/type'
import { Agent } from '../../src/agent'
import { LLMClient } from '../../src/llm/llm-client'
import ChatWindow from './components/ChatWindow'
import ChatInput from './components/ChatInput'
import SettingsPanel, { type SettingsState } from './components/SettingsPanel'
import './App.css'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system' | 'error'
  content: string
}

const defaultSettings: SettingsState = {
  provider: 'anthropic',
  model: 'deepseek-v4-flash',
  apiKey: import.meta.env.ANTHROPIC_API_KEY || '',
  baseUrl: import.meta.env.ANTHROPIC_BASE_URL || '',
}

const SYSTEM_PROMPT = 'You are a helpful assistant. Answer clearly and respectfully, and keep the response concise.'

function App() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [status, setStatus] = useState<'ready' | 'running'>('ready')
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'chat' | 'settings'>('chat')
  const [usage, setUsage] = useState<number>(0)
  const [cache, setCache] = useState<number>(0)

  const cacheRate = useMemo(() => {
    if (usage === 0)
      return 0
    return Math.round(cache / usage * 100)
  }, [cache, usage])

  const agentRef = useRef<Agent | null>(null)

  const clientConfig = useMemo(
    () => ({
      provider: settings.provider,
      apiKey: settings.apiKey,
      baseURL: settings.baseUrl || "",
      model: settings.model.trim() || (settings.provider === 'anthropic' ? 'claude-3.5-mini' : 'gpt-4o-mini'),
      isBrowser: true,
    }),
    [settings],
  )

  useEffect(() => {
    if (!settings.apiKey.trim()) {
      agentRef.current = null
      return
    }

    try {
      const llmClient = new LLMClient(clientConfig)
      const newAgent = new Agent({
        llmClient,
        systemPrompt: SYSTEM_PROMPT,
        maxSteps: 6,
      })
      newAgent.set_toogle_status_callback((nextStatus: 'running' | 'reday') => {
        setStatus(nextStatus === 'running' ? 'running' : 'ready')
      })
      agentRef.current = newAgent
    }
    catch {
      agentRef.current = null
    }
  }, [settings.apiKey, settings.baseUrl, settings.model, settings.provider])

  const pushMessage = (message: ChatMessage) => {
    setMessages((current) => [...current, message])
  }

  const handleSend = async () => {
    const content = draft.trim()
    if (!content) {
      setError('请输入消息内容。')
      return
    }

    if (!agentRef.current) {
      setError('请先配置提供商和 API 密钥。')
      return
    }

    setError(null)
    setDraft('')

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
    }
    pushMessage(userMessage)
    agentRef.current.add_user_message(content)

    try {
      const assistantText = await agentRef.current.run({
        onMessage: (message: Message) => {
          if (message.role === 'assistant') {
            pushMessage({
              id: `assistant-${Date.now()}`,
              role: 'assistant',
              content: message.content as string,
            })
          }
        },
      })

      setUsage(agentRef.current.get_usage())
      setCache(agentRef.current.get_cache())

      if (assistantText && !assistantText.trim()) {
        pushMessage({
          id: `assistant-empty-${Date.now()}`,
          role: 'assistant',
          content: 'The assistant replied without content.',
        })
      }
    }
    catch {
      setError('请求失败，请检查密钥和 URL 设置。')
      pushMessage({
        id: `error-${Date.now()}`,
        role: 'error',
        content: '请求无法完成，请确认配置后重试。',
      })
      setStatus('ready')
    }
  }

  const handleSettingsChange = (update: Partial<SettingsState>) => {
    setSettings((prev) => ({ ...prev, ...update }))
  }

  return (
    <div className="app-shell">
      <main className="layout-grid">
        <nav className="menu-panel" aria-label="聊天与设置">
          <button
            type="button"
            className={`menu-button ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
            aria-label="聊天"
            title="聊天"
          >
            <span className="menu-icon">💬</span>
          </button>
          <button
            type="button"
            className={`menu-button ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
            aria-label="设置"
            title="设置"
          >
            <span className="menu-icon">⚙️</span>
          </button>
        </nav>

        <section className="content-area">
          {activeTab === 'chat' ? (
            <div className="workspace-panel">
              <ChatWindow messages={messages} status={status} usage={usage} cache={cacheRate} />
              <ChatInput value={draft} disabled={status === 'running'} onChange={setDraft} onSend={handleSend} />
              {error ? <p className="error-text">{error}</p> : null}
            </div>
          ) : (
            <div className="settings-panel-wrapper">
              <SettingsPanel settings={settings} onChange={handleSettingsChange} disabled={status === 'running'} />
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
