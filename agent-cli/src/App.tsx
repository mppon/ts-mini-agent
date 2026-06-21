import type { AgentStatusType, Message } from 'agent'
import path from 'node:path'
import process from 'node:process'
import { AddTwoNums, Agent, LLMClient } from 'agent'
import dotenv from 'dotenv'
import { Box, Newline, render, Text } from 'ink'
import Spinner from 'ink-spinner'
import React, { useState } from 'react'
import { Icon } from './asc'
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
  }
  return (
    <>
      <Box flexDirection="column">
        <Text color="greenBright">{Icon}</Text>
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
      <Newline />
      <Input onSubmit={onSubmit} />
    </>
  )
}

export function run() {
  process.stdout.write('\x1B[2J\x1B[H')
  return render(React.createElement(App))
}
