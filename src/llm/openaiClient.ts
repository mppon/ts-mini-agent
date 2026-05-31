/**
 * OpenAI客户端实现
 */

import OpenAI from 'openai';
import {
    ILLMClient,
    Message,
    MessageRole,
    Tool,
    ModelResponse,
    ContentBlock,
} from './base';

export class OpenAIClient implements ILLMClient {
    private client: OpenAI;
    private modelName: string;
    private tools: Tool[] = [];

    /**
     * 创建OpenAI客户端实例
     * @param config 配置对象
     *   - apiKey: OpenAI API密钥，默认从OPENAI_API_KEY环境变量读取
     *   - baseUrl: API基础URL，可选
     *   - modelName: 模型名称，默认为gpt-4
     *   - tools: 默认工具列表，可选
     */
    constructor(config: {
        apiKey: string;
        baseUrl: string;
        modelName: string;
        tools?: Tool[];
    }) {
        const {
            apiKey,
            baseUrl,
            modelName,
            tools = [],
        } = config || {};

        const clientConfig: ConstructorParameters<typeof OpenAI>[0] = {
            apiKey: apiKey,
        };

        if (baseUrl) {
            clientConfig.baseURL = baseUrl;
        }

        this.client = new OpenAI(clientConfig);
        this.modelName = modelName;
        this.tools = tools;
    }

    /**
     * 将通用Tool格式转换为OpenAI格式
     */
    private convertToolsToOpenAI(tools: Tool[]) {
        return tools.map((tool) => ({
            type: 'function' as const,
            function: {
                name: tool.name,
                description: tool.description,
                parameters: tool.input_schema,
            },
        }));
    }

    /**
     * 将OpenAI消息格式转换为通用格式
     */
    private convertOpenAIMessageToUniversal(
        message: OpenAI.Chat.ChatCompletionMessage
    ): Message {
        const role = message.role as MessageRole;
        let content: ContentBlock[] = [];

        if (message.content) {
            content.push({
                type: 'text',
                text: message.content,
            });
        }

        if (message.tool_calls && message.tool_calls.length > 0) {
            message.tool_calls.forEach((toolCall) => {
                if (toolCall.type === 'function') {
                    content.push({
                        type: 'tool_use',
                        id: toolCall.id,
                        name: toolCall.function.name,
                        input: JSON.parse(toolCall.function.arguments || '{}'),
                    });
                }
            });
        }

        return {
            role,
            content: content.length === 1 && content[0].type === 'text' && content[0].text
                ? content[0].text
                : content,
        };
    }

    /**
     * 将通用消息格式转换为OpenAI格式
     */
    private convertUniversalMessageToOpenAI(
        message: Message
    ): OpenAI.Chat.ChatCompletionMessageParam {
        const role = message.role;

        if (typeof message.content === 'string') {
            return {
                role,
                content: message.content,
            };
        }

        let textContent = '';
        const toolUses: Array<OpenAI.Chat.ChatCompletionMessageParam> = [];

        message.content.forEach((block: ContentBlock) => {
            if (block.type === 'text' && block.text) {
                textContent += block.text;
            } else if (block.type === 'tool_use' && block.id) {
                // OpenAI returns tool use results through separate tool messages
                // This case handles assistant tool use in requests
            }
        });

        return {
            role,
            content: textContent || '',
        };
    }

    /**
     * 发送消息给模型
     * @param messages 消息列表
     * @param tools 工具列表，如果不提供则使用默认工具
     */
    async sendMessage(messages: Message[]): Promise<ModelResponse> {
        const openaiMessages = messages.map((msg) =>
            this.convertUniversalMessageToOpenAI(msg)
        );

        const params: OpenAI.Chat.ChatCompletionCreateParams = {
            model: this.modelName,
            messages: openaiMessages,
        };

        if (this.tools && this.tools.length > 0) {
            params.tools = this.convertToolsToOpenAI(this.tools);
        }

        const response = await this.client.chat.completions.create(params);
        const choice = response.choices[0];

        const content: ContentBlock[] = [];

        if (choice.message.content) {
            content.push({
                type: 'text',
                text: choice.message.content,
            });
        }

        if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
            choice.message.tool_calls.forEach((toolCall: OpenAI.Chat.ChatCompletionMessageToolCall) => {
                if (toolCall.type === 'function') {
                    content.push({
                        type: 'tool_use',
                        id: toolCall.id,
                        name: toolCall.function.name,
                        input: JSON.parse(toolCall.function.arguments || '{}'),
                    });
                }
            });
        }

        return {
            content: content.length > 0 ? content : [{ type: 'text', text: '' }],
            stop_reason: choice.finish_reason || 'stop',
        };
    }

    /**
     * 创建消息
     */
    createMessage(
        role: MessageRole,
        content: string | ContentBlock[]
    ): Message {
        return {
            role,
            content,
        };
    }
}
