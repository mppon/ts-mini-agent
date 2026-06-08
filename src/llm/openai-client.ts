/**
 * OpenAI客户端实现
 */

import type {
  Content,
  ILLMClient,
  LLMClientConfig,
  Message,
  ModelResponse,
  Role,
  Tool,
} from './type'
import OpenAI from 'openai'

export class OpenAIClient implements ILLMClient {
  private client: OpenAI
  private model: string

  constructor(config: LLMClientConfig) {
    const { baseURL, apiKey } = config
    this.client = new OpenAI({ baseURL, apiKey })
    this.model = config.model || ''
  }

  /**
   * 将通用Tool格式转换为OpenAI格式
   */
  private convertToolsToOpenAI(tools: Tool[]) {
    return tools.map(tool => ({
      type: 'function' as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.function.arguments,
      },
    }))
  }

  /**
   * 将OpenAI消息格式转换为通用格式
   */
  private _parse_response(
    response: OpenAI.Chat.Completions.ChatCompletion,
  ): ModelResponse {
    const tool_calls: Array<Tool> = []
    const message = response.choices[0].message
    if (message.tool_calls && message.tool_calls.length > 0) {
      for (const tool_call of message.tool_calls) {
        if (tool_call.type === 'function') {
          tool_calls.push({
            id: tool_call.id,
            name: tool_call.function.name,
            description: '',
            function: {
              name: tool_call.function.name,
              arguments: JSON.parse(tool_call.function.arguments || '{}'),
            },
          })
        }
      }
    }
    let usage = ''
    if (response?.usage) {
      usage = `${response.usage.total_tokens}`
    }

    return {
      content: message.content || '',
      tool_calls,
      finish_reason: response.choices[0].finish_reason || 'default_stop',
      usage,
    }
  }

  /**
   * 将通用消息格式转换为OpenAI格式
   */
  private _convert_messages(
    messages: Array<Message>,
  ): Array<OpenAI.Chat.ChatCompletionMessageParam> {
    const api_messages = []
    for (const msg of messages) {
      if (msg.role === 'system' || msg.role === 'user') {
        api_messages.push({
          role: msg.role,
          content: msg.content,
        })
        continue
      }
      if (msg.role === 'assistant') {
        const _assistant_message = {
          role: msg.role,
        }

        const tool_calls = []
        if (msg.content) {
          Object.assign(_assistant_message, {
            content: msg.content,
          })
        }
        if (msg.tool_calls && msg?.tool_calls?.length > 0) {
          for (const toolCall of msg.tool_calls) {
            tool_calls.push({
              type: 'function' as const,
              id: toolCall.id,
              function: {
                name: toolCall.name,
                arguments: JSON.stringify(toolCall.function.arguments || {}),
              },
            })
          }
          Object.assign(_assistant_message, {
            tool_calls,
          })
        }
        continue
      }
      if (msg.role === 'tool') {
        api_messages.push({
          role: 'tool' as const,
          tool_call_id: msg.tool_call_id || '',
          content: msg.content,
        })
      }
    }
    return api_messages
  }

  async generate(messages: Message[], tools?: Tool[]): Promise<ModelResponse> {
    const api_messages = this._convert_messages(messages)
    const params: OpenAI.Chat.ChatCompletionCreateParams = {
      model: this.model,
      messages: api_messages,
    }

    if (tools && tools.length > 0) {
      params.tools = this.convertToolsToOpenAI(tools)
    }
    const response = await this.client.chat.completions.create(params)
    return this._parse_response(response)
  }

  /**
   * 创建消息
   */
  createMessage(
    role: Role,
    content: Content,
  ): Message {
    return {
      role,
      content,
    }
  }
}
