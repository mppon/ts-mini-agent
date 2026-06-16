import type { InjectorConfig } from '../src/agent'
import process from 'node:process'
import { Agent } from '../src/agent'
import { LLMClient } from '../src/llm'
import { AddTwoNums } from '../src/tools/addTwoNum'

import 'dotenv/config'

async function testAgent() {
  const llmConfig = {
    provider: 'openai' as const,
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    baseURL: process.env.OPENAI_BASE_URL || '',
    model: 'deepseek-v4-flash',
  }
  const llmClient = new LLMClient(llmConfig)
  const tools = [
    new AddTwoNums(),
  ]
  const agent = new Agent({
    llmClient,
    systemPrompt: '你是一个智能助手，下面回答我的问题',
    maxSteps: 30,
    tools,
  })
  const injecter: InjectorConfig = {
    onMessage: (msg) => {
      console.warn(msg.content)
    },
    onToolCall: (msg) => {
      console.warn(`调用工具${msg.name}，参数：${JSON.stringify(msg.function.arguments)}`)
    },
  }
  agent.add_user_message('帮我计算一下32.56加72.84等于几')
  const res = await agent.run(injecter)
  console.warn('res:', res)
  agent.add_user_message('再帮我计算一下665.56加7682.44等于几')
  const res1 = await agent.run(injecter)
  console.warn('res1:', res1)
}

async function main() {
  testAgent()
}

main().catch((error) => {
  console.error('Example failed:', error)
  process.exit(1)
})
