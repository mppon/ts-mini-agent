import type { Message } from 'agent'
import { Box, Text } from 'ink'
import { Markdown } from './Markdown'

interface MessagesProps {
  messages: Message[]
}

export const Messages: React.FC<MessagesProps> = (props) => {
  const { messages = [] } = props
  return (
    <>
      {messages.map((msg, index) => {
        if (msg.role === 'user') {
          return (
            <Box key={index}>
              <Text color="rgb(232, 131, 136)">[•‿•]:</Text>
              <Text color="rgb(232, 131, 136)">{msg.content}</Text>
            </Box>
          )
        }
        if (msg.role === 'assistant' && msg.tool_calls && msg.tool_calls?.length > 0) {
          const tools_name = msg.tool_calls?.map(tool => `[${tool.name}]`).join('、')
          return (
            <Box key={index}>
              <Text color="green">
                [⚙_⚙]: 我将调用以下工具来辅助回答：
              </Text>
              <Text>{tools_name}</Text>
            </Box>
          )
        }
        if (msg.role === 'assistant') {
          return (
            <Box key={index}>
              <Text>[◉_◉]:</Text>
              <Markdown content={msg.content as string} />
            </Box>
          )
        }
        return null
      })}
    </>
  )
}
