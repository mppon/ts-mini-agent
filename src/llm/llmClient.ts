
import { OpenAIClient } from './openaiClient';
import { AnthropicClient } from './anthropicClient';
import { Tool, ILLMClient, ContentBlock, Message, MessageRole, ModelResponse } from './base';

export class LLMClient implements ILLMClient {
    public client: OpenAIClient | AnthropicClient;
    constructor(config: {
        provider: 'openai' | 'anthropic';
        apiKey: string;
        baseUrl: string;
        modelName: string;
        tools?: Tool[];
    }) {
        if (config.provider === 'openai') {
            this.client = new OpenAIClient(config);
        } else {
            this.client = new AnthropicClient(config);
        }
    }
    sendMessage(messages: Message[]): Promise<ModelResponse> {
        return this.client.sendMessage(messages);
    }
    createMessage(role: MessageRole, content: string | ContentBlock[]): Message {
        return this.client.createMessage(role, content);
    }

}