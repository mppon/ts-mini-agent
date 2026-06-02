/**
 * Anthropic客户端实现
 */

import type {
  ContentBlock,
  ILLMClient,
  Message,
  MessageRole,
  ModelResponse,
  Tool,
} from './base'
import Anthropic from '@anthropic-ai/sdk'

export class AnthropicClient implements ILLMClient {
  private client: Anthropic
  private modelName: string
  private tools: Tool[] = []

  /**
   * 创建Anthropic客户端实例
   * @param config 配置对象
   *   - apiKey: Anthropic API密钥，默认从ANTHROPIC_API_KEY环境变量读取
   *   - baseUrl: API基础URL，可选
   *   - modelName: 模型名称，默认为claude-3-5-sonnet-20241022
   *   - tools: 默认工具列表，可选
   */
  constructor(config: {
    apiKey: string
    baseUrl: string
    modelName: string
    tools?: Tool[]
  }) {
    const {
      apiKey,
      baseUrl,
      modelName,
      tools = [],
    } = config || {}

    const clientConfig: ConstructorParameters<typeof Anthropic>[0] = {
      apiKey,
    }

    if (baseUrl) {
      clientConfig.baseURL = baseUrl
    }

    this.client = new Anthropic(clientConfig)
    this.modelName = modelName
    this.tools = tools
  }

  /**
   * 将通用Tool格式转换为Anthropic格式
   */
  private convertToolsToAnthropic(tools: Tool[]): Anthropic.Tool[] {
    return tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.input_schema as Anthropic.Tool['input_schema'],
    }))
  }

  /**
   * 将Anthropic ContentBlock转换为通用格式
   */
  private convertAnthropicContentToUniversal(
    content: Anthropic.ContentBlock[],
  ): ContentBlock[] {
    return content.map((block) => {
      if (block.type === 'text') {
        return {
          type: 'text',
          text: block.text,
        }
      }
      else if (block.type === 'tool_use') {
        return {
          type: 'tool_use',
          id: block.id,
          name: block.name,
          input: block.input as Record<string, unknown>,
        }
      }
      return {
        type: 'text',
        text: '',
      }
    })
  }

  /**
   * 将通用消息格式转换为Anthropic格式
   */
  private convertUniversalMessageToAnthropic(
    message: Message,
  ): Anthropic.MessageParam {
    const role = message.role

    if (typeof message.content === 'string') {
      return {
        role,
        content: message.content,
      }
    }

    const content: Anthropic.ContentBlockParam[] = []

    message.content.forEach((block: ContentBlock) => {
      if (block.type === 'text' && block.text) {
        content.push({
          type: 'text',
          text: block.text,
        })
      }
      else if (block.type === 'tool_use') {
        // Anthropic不在消息中直接包含tool_use块
        // tool_use通常只在响应中出现
      }
    })

    return {
      role,
      content: content.length > 0 ? content : [{ type: 'text', text: '' }],
    }
  }

  /**
   * 发送消息给模型
   * @param messages 消息列表
   * @param tools 工具列表，如果不提供则使用默认工具
   */
  async sendMessage(messages: Message[]): Promise<ModelResponse> {
    const anthropicMessages = messages.map(msg =>
      this.convertUniversalMessageToAnthropic(msg),
    )

    const params: Anthropic.MessageCreateParams = {
      model: this.modelName,
      max_tokens: 2048,
      messages: anthropicMessages,
    }

    if (this.tools && this.tools.length > 0) {
      params.tools = this.convertToolsToAnthropic(this.tools)
    }

    const response = await this.client.messages.create(params)

    const content = this.convertAnthropicContentToUniversal(response.content)

    return {
      content: content.length > 0 ? content : [{ type: 'text', text: '' }],
      stop_reason: response.stop_reason || 'stop',
    }
  }

  /**
   * 创建消息
   */
  createMessage(
    role: MessageRole,
    content: string | ContentBlock[],
  ): Message {
    return {
      role,
      content,
    }
  }
}
