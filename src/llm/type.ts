/**
 * 工具定义
 */

export interface FunctionCall {
  name: string
  arguments: any
}
export interface ResponseTool {
  name: string
  id: string
  description?: string
  function: FunctionCall
}
// 自定义工具没有id，llm的response会有id
export type Tool = Omit<ResponseTool, 'id'>

/**
 * 通用的LLMResponse
 */
export interface ModelResponse {
  content: string
  tool_calls: Array<ResponseTool>
  thinking?: string
  finish_reason: string
  usage: string
}

/**
 * 通用的消息格式
 */
export type Role = 'user' | 'assistant' | 'system'
export type Content = string | Array<any>

interface UsualMessageType {
  role: Role
  content: Content
  thinking?: string
  name?: string
  tool_calls?: Array<ResponseTool>
}

interface ToolMessageType {
  role: 'tool'
  content: Content
  tool_call_id: string
}
export type Message = UsualMessageType | ToolMessageType

/**
 * LLMClient配置
 */
export interface LLMClientConfig {
  apiKey: string
  baseURL: string
  model: string
  isBrowser?: boolean
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
  generate: (messages: Message[], tools?: Tool[]) => Promise<ModelResponse>

  /**
   * 创建消息
   * @param role 消息角色
   * @param content 消息内容
   * @returns Message对象
   */
  createMessage: (role: Role, content: Content) => Message
}
