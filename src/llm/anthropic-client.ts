/**
 * Anthropic客户端实现
 * 1. client的初始化
 * 2. 消息格式转换（通用格式 <-> Anthropic格式）
 * 3. 发送消息并处理响应
 * 4. 响应结果的转换
 */
import type { ContentBlockParam } from '@anthropic-ai/sdk/resources'
import type {
  Content,
  ILLMClient,
  LLMClientConfig,
  Message,
  ModelResponse,
  Role,
  Tool,
} from './type'
import Anthropic from '@anthropic-ai/sdk'

export class AnthropicClient implements ILLMClient {
  private client: Anthropic
  private model: string
  constructor(config: LLMClientConfig) {
    const { baseURL, apiKey, isBrowser = false } = config
    this.client = new Anthropic({ baseURL, apiKey, dangerouslyAllowBrowser: isBrowser })
    this.model = config.model || ''
  }

  /**
   * 将通用Tool格式转换为Anthropic格式
   */
  private convertToolsToAnthropic(tools: Tool[]): Array<Anthropic.Tool> {
    return tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.function.arguments,
    }))
  }

  /**
   * 将Anthropic相应结果进行parse
   */
  private _parse_response(
    response: Anthropic.Messages.Message,
  ): ModelResponse {
    // "end_turn": the model reached a natural stopping point
    // "max_tokens": we exceeded the requested max_tokens or the model's maximum
    // "stop_sequence": one of your provided custom stop_sequences was generated
    // "tool_use": the model invoked one or more tools
    // "pause_turn": we paused a long-running turn. You may provide the response back as-is in a subsequent request to let the model continue.
    // "refusal": when streaming classifiers intervene to handle potential policy violations
    const stop_reason = response.stop_reason || 'stop'
    const usage = `${(response.usage.input_tokens || 0) + (response.usage.output_tokens || 0)}`
    let text_content = ''
    let thinking_content = ''
    const tool_calls: Array<Tool> = []
    for (const res of response.content) {
      if (res.type === 'text') {
        text_content += res.text
      }
      if (res.type === 'thinking') {
        thinking_content += res.thinking
      }
      if (res.type === 'tool_use') {
        tool_calls.push({
          id: res.id,
          name: res.name,
          description: '',
          function: {
            name: res.name,
            arguments: res.input,
          },
        })
      }
    }
    return {
      content: text_content,
      tool_calls,
      thinking: thinking_content,
      finish_reason: stop_reason,
      usage,
    }
  }

  /**
   * 将通用消息格式转换为Anthropic格式
   */
  private _convert_messages(
    messages: Array<Message>,
  ): {
    system_prompt: string
    api_messages: Array<Anthropic.MessageParam>
  } {
    let system_prompt = ''
    const api_messages: Array<Anthropic.MessageParam> = []
    for (const msg of messages) {
      // system prompt
      if (msg.role === 'system') {
        system_prompt = msg.content as string
        continue
      }
      // user
      if (msg.role === 'user') {
        api_messages.push({
          role: msg.role,
          content: msg.content,
        })
        continue
      }
      // assistant: type include thinking & toolcall & text
      if (msg.role === 'assistant') {
        const content: Array<ContentBlockParam> = []
        // thinking
        if (msg.thinking) {
          content.push({
            type: 'thinking' as const,
            thinking: msg.thinking,
            signature: '',
          })
        }
        if (msg.content) {
          content.push({
            type: 'text',
            text: msg.content as string,
          })
        }
        // toolcall应该放到最后
        if (msg.tool_calls && msg?.tool_calls?.length > 0) {
          for (const toolCall of msg.tool_calls) {
            content.push({
              type: 'tool_use',
              id: toolCall.id,
              name: toolCall.name,
              input: toolCall.function.arguments,
            })
          }
        }
        api_messages.push({
          role: msg.role,
          content,
        })
      }
      // tool call的结果
      if (msg.role === 'tool') {
        api_messages.push({
          role: 'user',
          content: [
            {
              type: 'tool_result',
              tool_use_id: msg.tool_call_id || '',
              content: msg.content,
            },
          ],
        })
      }
    }
    return {
      system_prompt,
      api_messages,
    }
  }

  async generate(messages: Message[], tools?: Tool[]): Promise<ModelResponse> {
    const { system_prompt, api_messages } = this._convert_messages(messages)
    const params: Anthropic.MessageCreateParams = {
      model: this.model,
      max_tokens: 2048,
      system: system_prompt,
      messages: api_messages,
    }

    if (tools && tools.length > 0) {
      params.tools = this.convertToolsToAnthropic(tools)
    }

    const response = await this.client.messages.create(params)

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
