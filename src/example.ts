import process from 'node:process'
import { LLMClient } from './llm'
import 'dotenv/config'

function testLLMClientForOpenAI() {
  const config = {
    provider: 'openai' as const,
    apiKey: process.env.OPENAI_API_KEY || '',
    baseURL: process.env.OPENAI_BASE_URL || '',
    model: 'deepseek-v4-flash',
  }
  const llmClient = new LLMClient(config)
  const messages = [
    llmClient.createMessage('user', 'Hello, how are you?'),
  ]
  llmClient.generate(messages).then((response) => {
    console.warn('testLLMClientForOpenAI Model response:', response)
  }).catch((error) => {
    console.error('Error sending message:', error)
  })
}
function testLLMClientForAnthropic() {
  const config = {
    provider: 'anthropic' as const,
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    baseURL: process.env.ANTHROPIC_BASE_URL || '',
    model: 'deepseek-v4-flash',
  }
  const llmClient = new LLMClient(config)
  const messages = [
    llmClient.createMessage('user', 'Hello, how are you?'),
  ]
  llmClient.generate(messages).then((response) => {
    console.warn('testLLMClientForAnthropic Model response:', response)
  }).catch((error) => {
    console.error('Error sending message:', error)
  })
}

async function main() {
  console.warn('Run LLM client example with current code.')
  testLLMClientForOpenAI()
  testLLMClientForAnthropic()
}

main().catch((error) => {
  console.error('Example failed:', error)
  process.exit(1)
})
