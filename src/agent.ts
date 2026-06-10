/**
 * agent的实现
 * message的维护
 * agent loop
 */

import type { LLMClient } from './llm'
import type { Message } from './llm/type'

export interface AgentConfig {
  llmClient: LLMClient
  tools?: Array<any>
  systemPrompt?: string
  maxSteps?: number
}

export class Agent {
  private messages: Array<Message> = []
  private tools: Array<any> = []
  private llmClient: LLMClient
  private maxSteps: number

  constructor(config: AgentConfig) {
    this.llmClient = config.llmClient
    this.tools = config.tools || []
    if (config.systemPrompt) {
      this.messages.push({
        role: 'system',
        content: config.systemPrompt,
      })
    }
    this.maxSteps = config.maxSteps || 20
  }

  public add_user_message(content: string) {
    const msg = this.llmClient.createMessage('user', content)
    this.messages.push(msg)
  }

  public async run() {
    let step = 0
    // agent loop
    while (step < this.maxSteps) {
      const response = await this.llmClient.generate(this.messages, this.tools)
      this.messages.push({
        role: 'assistant',
        content: response.content,
        thinking: response.thinking,
        tool_calls: response.tool_calls,
      })

      // 如果没有工具调用，则认为对话结束
      if (!response.tool_calls || response.tool_calls.length === 0) {
        return response.content
      }

      // 存在工具调用
      if (response.tool_calls && response.tool_calls.length > 0) {
        for (const toolCall of response.tool_calls) {
          // 这里简单的模拟工具调用，实际可以根据toolCall.name去调用不同的工具
          const tool_response = `工具${toolCall.name}的调用结果`
          this.messages.push({
            // tool call的结果role为tool，client以此识别用户输入还是工具调用结果
            role: 'tool',
            content: tool_response,
            tool_call_id: toolCall.id,
          })
        }
      }
      step++
    }
  }
}
