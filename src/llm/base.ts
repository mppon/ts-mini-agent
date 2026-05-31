/**
 * 通用LLM客户端接口和类型定义
 */

/**
 * 工具参数的JSON Schema定义
 */
export interface ToolParameter {
    type: string;
    description?: string;
    enum?: string[];
    items?: ToolParameter;
    properties?: Record<string, ToolParameter>;
    required?: string[];
}

/**
 * 工具定义
 */
export interface Tool {
    name: string;
    description: string;
    input_schema: {
        type: string;
        properties: Record<string, ToolParameter>;
        required: string[];
    };
}

/**
 * 消息角色
 */
export type MessageRole = 'user' | 'assistant';

/**
 * 消息内容块
 */
export interface ContentBlock {
    type: 'text' | 'tool_use';
    text?: string;
    id?: string;
    name?: string;
    input?: Record<string, unknown>;
}

/**
 * 消息
 */
export interface Message {
    role: MessageRole;
    content: string | ContentBlock[];
}

/**
 * 模型响应
 */
export interface ModelResponse {
    content: ContentBlock[];
    stop_reason: string;
}

/**
 * LLM客户端通用接口
 */
export interface ILLMClient {
    /**
     * 发送消息给模型
     * @param messages 消息列表
     * @param tools 可用工具列表
     * @returns 模型响应
     */
    sendMessage(messages: Message[], tools?: Tool[]): Promise<ModelResponse>;

    /**
     * 创建消息
     * @param role 消息角色
     * @param content 消息内容
     * @returns Message对象
     */
    createMessage(role: MessageRole, content: string | ContentBlock[]): Message;
}
