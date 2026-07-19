import process from 'node:process'
import { Box, render, Text } from 'ink'
import Spinner from 'ink-spinner'
import React, { useMemo, useState } from 'react'
import Banner from './components/Banner'
import { Input } from './components/Input'
import { Messages } from './components/Message'
import useAgentStore from './store'
import { formatUsage } from './utils'

export const App: React.FC = () => {
  const [usage, setUsage] = useState<number>(0)
  const [cache, setCache] = useState<number>(0)
  const { messages, updateMessages, mainAgent, cleanMessages } = useAgentStore()

  const { agent, status } = mainAgent

  const onSubmit = async (query: string) => {
    agent.add_user_message(query)
    const msgs = agent.get_all_messages()
    updateMessages(msgs)
    await agent.run({
      onToolCall: () => {
        const tempMsg = agent.get_all_messages()
        updateMessages(tempMsg)
      },
    })
    const new_msgs = agent.get_all_messages()
    updateMessages(new_msgs)
    const usage = agent.get_usage()
    setUsage(usage)
    const cache = agent.get_cache()
    setCache(cache)
  }

  const onCommand = (command: string) => {
    switch (command) {
      case '/clean':
        cleanMessages()
        break
      case '/exit':
        process.exit(0)
        break
    }
  }
  const cacheRate = useMemo(() => {
    if (usage === 0)
      return 0
    return Math.round(cache / usage * 100)
  }, [usage, cache])
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
        <Input onSubmit={onSubmit} onCommand={onCommand} />
      </Box>
      <Box flexDirection="row" justifyContent="flex-end" marginRight={1}>
        <Text>{`cache：${cacheRate}%  usage：${formatUsage(usage)} tokens`}</Text>
      </Box>
    </>
  )
}

export function run() {
  process.stdout.write('\x1B[2J\x1B[H')
  return render(React.createElement(App))
}
