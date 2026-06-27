import type { AgentStatusType, Message } from 'agent'
import path from 'node:path'
import process from 'node:process'
import { AddTwoNums, Agent, LLMClient } from 'agent'
import dotenv from 'dotenv'
import { Box, render, Text } from 'ink'
import Spinner from 'ink-spinner'
import React, { useState } from 'react'
import Banner from './components/Banner'
import { Input } from './components/Input'
import { Messages } from './components/Message'

dotenv.config({
  path: path.resolve(import.meta.dirname, '../../.env'),
})

const client = new LLMClient({
  provider: 'anthropic',
  baseURL: process.env.ANTHROPIC_BASE_URL || '',
  apiKey: process.env.ANTHROPIC_API_KEY || '',
  model: 'deepseek-v4-flash',
})
const tools = [
  new AddTwoNums(),
]

const agent = new Agent({
  llmClient: client,
  tools,
})

export const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [status, setStatus] = useState<AgentStatusType>('reday')
  const [usage, setUsage] = useState<number>(0)
  const [cache, setCache] = useState<number>(0)
  agent.set_toogle_status_callback(setStatus)

  const onSubmit = async (query: string) => {
    agent.add_user_message(query)
    const msgs = agent.get_all_messages()
    setMessages(msgs)
    await agent.run({
      onToolCall: () => {
        const tempMsg = agent.get_all_messages()
        setMessages(tempMsg)
      },
    })
    const new_msgs = agent.get_all_messages()
    setMessages(new_msgs)
    const usage = agent.get_usage()
    setUsage(usage)
    const cache = agent.get_cache()
    setCache(cache)
  }
  return (
    <>
      <Box flexDirection="column">
        <Banner />
      </Box>
      <Messages messages={messages} />
      {
        status === 'running' && (
          <Text>
            <Text color="green">
              <Spinner type="dots" />
            </Text>
            {' Loading'}
          </Text>
        )
      }
      <Box
        borderStyle="single"
        borderDimColor
        borderLeft={false}
        borderRight={false}
      >
        <Input onSubmit={onSubmit} />
      </Box>
      <Box flexDirection="row" justifyContent="flex-end" marginRight={1}>
        <Text>{`cache:${cache} tokens  usage:${usage} tokens`}</Text>
      </Box>
    </>
  )
}

export function run() {
  process.stdout.write('\x1B[2J\x1B[H')
  return render(React.createElement(App))
}
