/**
 * Anthropic客户端实现 https://platform.claude.com/docs/en/api/typescript/messages
 */
import type { ContentBlockParam } from '@anthropic-ai/sdk/resources'
import type {
  Content,
  ILLMClient,
  LLMClientConfig,
  Message,
  ModelResponse,
  ResponseTool,
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
    // Total input tokens in a request is the summation of input_tokens, cache_creation_input_tokens, and cache_read_input_tokens.
    const total_input_tokens
      = (response.usage.input_tokens || 0) + (response.usage.cache_creation_input_tokens || 0) + (response.usage.cache_read_input_tokens || 0)
    const usage = total_input_tokens + response.usage.output_tokens
    let cache = response.usage.cache_read_input_tokens || 0
    if (Object.hasOwn(response.usage, 'prompt_cache_hit_tokens')) {
      // @ts-expect-error for deepseek https://api-docs.deepseek.com/zh-cn/guides/kv_cache
      cache = response.usage.prompt_cache_hit_tokens
    }
    let text_content = ''
    let thinking_content = ''
    const tool_calls: Array<ResponseTool> = []
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
      cache,
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
        const content = msg.results.map(res => ({
          type: 'tool_result' as const,
          tool_use_id: res.tool_call_id,
          content: res.content,
        }))
        api_messages.push({
          role: 'user',
          content,
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
