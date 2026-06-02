import { LLMClient } from './llm'

function testLLMClientForOpenAI() {
  const config = {
    provider: 'openai' as const,
    apiKey: '',
    baseUrl: 'https://api.deepseek.com',
    modelName: 'deepseek-v4-flash',
  }
  const llmClient = new LLMClient(config)
  const messages = [
    llmClient.createMessage('user', 'Hello, how are you?'),
  ]
  llmClient.sendMessage(messages).then((response) => {
    console.log('testLLMClientForOpenAI Model response:', response)
  }).catch((error) => {
    console.error('Error sending message:', error)
  })
}
function testLLMClientForAnthropic() {
  const config = {
    provider: 'anthropic' as const,
    apiKey: '',
    baseUrl: 'https://api.deepseek.com/anthropic',
    modelName: 'deepseek-v4-flash',
  }
  const llmClient = new LLMClient(config)
  const messages = [
    llmClient.createMessage('user', 'Hello, how are you?'),
  ]
  llmClient.sendMessage(messages).then((response) => {
    console.log('testLLMClientForAnthropic Model response:', response)
  }).catch((error) => {
    console.error('Error sending message:', error)
  })
}

async function main() {
  console.log('Run LLM client example with current code.')
  testLLMClientForOpenAI()
  testLLMClientForAnthropic()
}

main().catch((error) => {
  console.error('Example failed:', error)
  process.exit(1)
})
