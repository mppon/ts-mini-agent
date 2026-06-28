import type { ChangeEvent } from 'react'
import './index.css'

export type ProviderType = 'openai' | 'anthropic'

export interface SettingsState {
  provider: ProviderType
  model: string
  apiKey: string
  baseUrl: string
}

interface SettingsPanelProps {
  settings: SettingsState
  onChange: (update: Partial<SettingsState>) => void
  disabled: boolean
}

const providerOptions: Array<{ value: ProviderType; label: string }> = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
]

function SettingsPanel({ settings, onChange }: SettingsPanelProps) {
  const handleChange = (field: keyof SettingsState) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onChange({ [field]: event.target.value } as Partial<SettingsState>)
  }

  return (
    <section className="settings-panel">
      <div className="settings-header">
        <div>
          <p className="eyebrow">设置</p>
          <h2>提供商与密钥</h2>
        </div>
      </div>

      <label className="field-label">
        提供商
        <select value={settings.provider} onChange={handleChange('provider')}>
          {providerOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="field-label">
        模型名称
        <input
          type="text"
          value={settings.model}
          onChange={handleChange('model')}
          placeholder="gpt-4o-mini 或 claude-3.5-mini"
        />
      </label>

      <label className="field-label">
        密钥
        <input
          type="password"
          inputMode="text"
          value={settings.apiKey}
          onChange={handleChange('apiKey')}
          placeholder="sk-... 或 Anthropic 密钥"
          autoComplete="new-password"
        />
      </label>

      <label className="field-label">
        API 基础地址
        <input
          type="url"
          value={settings.baseUrl}
          onChange={handleChange('baseUrl')}
          placeholder="留空使用默认地址"
        />
      </label>

      <p className="field-note">
        使用提供商接口地址和密钥，直接连接模型进行对话。
      </p>
    </section>
  )
}

export default SettingsPanel
