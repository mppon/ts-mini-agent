import process from 'node:process'
import { Agent } from '../src/agent'
import { LLMClient } from '../src/llm'
import 'dotenv/config'

async function testAgent() {
  const llmConfig = {
    provider: 'anthropic' as const,
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    baseURL: process.env.ANTHROPIC_BASE_URL || '',
    model: 'deepseek-v4-flash',
  }
  const llmClient = new LLMClient(llmConfig)
  const agent = new Agent({
    llmClient,
    systemPrompt: '你是一个智能助手，下面回答我的问题',
    maxSteps: 5,
  })
  agent.add_user_message('请给我推荐几首毛不易的歌曲，只告诉我名字就可以。')
  const res1 = await agent.run()
  console.warn('res:', res1)
  console.warn('--------------------------------------')
  agent.add_user_message('重复一遍我刚才问的你的问题')
  const res2 = await agent.run()
  console.warn('res:', res2)
}

async function main() {
  testAgent()
}

main().catch((error) => {
  console.error('Example failed:', error)
  process.exit(1)
})
