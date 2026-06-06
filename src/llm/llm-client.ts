import type {
  Content,
  ILLMClient,
  LLMClientConfig,
  Message,
  ModelResponse,
  Role,
} from './type'
import { AnthropicClient } from './anthropic-client'
import { OpenAIClient } from './openai-client'

export class LLMClient implements ILLMClient {
  public client: OpenAIClient | AnthropicClient
  constructor(config: LLMClientConfig & { provider: 'openai' | 'anthropic' }) {
    if (config.provider === 'openai') {
      this.client = new OpenAIClient(config)
    }
    else {
      this.client = new AnthropicClient(config)
    }
  }

  generate(messages: Message[]): Promise<ModelResponse> {
    return this.client.generate(messages)
  }

  createMessage(role: Role, content: Content): Message {
    return this.client.createMessage(role, content)
  }
}
