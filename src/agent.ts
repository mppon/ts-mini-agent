/**
 * agent的实现
 * message的维护
 * tool call
 * agent loop
 */

import type { LLMClient } from './llm'
import type { Message, ResponseTool, Tool } from './llm/type'
import type { BaseTool } from './tools/basetool'

export interface AgentConfig {
  llmClient: LLMClient
  tools?: Array<BaseTool>
  systemPrompt?: string
  maxSteps?: number
}

export interface InjectorConfig {
  onMessage?: (message: Message) => void
  onToolCall?: (tool: ResponseTool) => void
}

export type AgentStatusType = 'running' | 'reday'

export class Agent {
  private messages: Array<Message> = []
  private protoTools: Array<BaseTool> = []
  private tools: Array<Tool> = []
  private llmClient: LLMClient
  private maxSteps: number
  private agentStatus: AgentStatusType
  private toggle_status_callback: (...rest: any[]) => void
  private cache: number
  private usage: number

  constructor(config: AgentConfig) {
    this.llmClient = config.llmClient
    this.protoTools = config.tools || []
    this.tools = this._convert_tools(this.protoTools)
    if (config.systemPrompt) {
      this.messages.push({
        role: 'system',
        content: config.systemPrompt,
      })
    }
    this.maxSteps = config.maxSteps || 20
    this.agentStatus = 'reday'
    this.toggle_status_callback = () => { }
    this.cache = 0
    this.usage = 0
  }

  public add_user_message(content: string) {
    const msg = this.llmClient.createMessage('user', content)
    this.messages.push(msg)
  }

  public get_all_messages() {
    return this.messages
  }

  public toggle_status(status: 'running' | 'reday') {
    this.toggle_status_callback && this.toggle_status_callback(status)
    this.agentStatus = status
  }

  public get_status() {
    return this.agentStatus
  }

  public get_usage() {
    return this.usage
  }

  public get_cache() {
    return this.cache
  }

  public set_toogle_status_callback(cb: (...rest: any[]) => void) {
    this.toggle_status_callback = cb
  }

  public _convert_tools(tools: BaseTool[]): Tool[] {
    return tools.map(tool => ({
      name: tool.get_name(),
      description: tool.get_description(),
      function: {
        name: tool.get_name(),
        arguments: tool.to_schema(),
      },
    }))
  }

  public async run(injector?: InjectorConfig) {
    let step = 0
    this.toggle_status('running')
    // agent loop
    while (step < this.maxSteps) {
      const response = await this.llmClient.generate(this.messages, this.tools)
      const message = {
        role: 'assistant' as const,
        content: response.content,
        thinking: response.thinking,
        tool_calls: response.tool_calls,
      }
      this.messages.push(message)
      this.cache = response.cache
      this.usage = response.usage

      // loop过程存在多个消息，抛出供外部消费
      injector?.onMessage && injector.onMessage(message)

      // 如果没有工具调用，则认为对话结束
      if (!response.tool_calls || response.tool_calls.length === 0) {
        this.toggle_status('reday')
        return response.content
      }

      // 存在工具调用
      if (response.tool_calls && response.tool_calls.length > 0) {
        const tool_calls_result = []
        for (const toolCall of response.tool_calls) {
          const tool = this.protoTools.find(tool => tool.get_name() === toolCall.name)
          const tool_response = tool
            ? await tool?.execute(toolCall.function.arguments)
            : undefined
          // 供外部消费
          injector?.onToolCall && injector?.onToolCall(toolCall)
          tool_calls_result.push({
            content: `${tool_response}`,
            tool_call_id: toolCall.id,
          })
        }
        this.messages.push({
          // tool call的结果role为tool，client以此识别用户输入还是工具调用结果
          role: 'tool',
          results: tool_calls_result,
        })
      }
      step++
    }
    this.toggle_status('reday')
  }
}
