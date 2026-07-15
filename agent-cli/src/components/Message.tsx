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
        if (msg.role === 'assistant' && msg.tool_calls && msg.tool_calls.length > 0) {
          return (
            <>
              {msg.tool_calls.map((tool, toolIndex) => (
                <Box key={`${index}-${toolIndex}`}>
                  <Text color="green" bold>
                    [⚙_⚙]: Tool Calling...
                    {`(${tool.name.toUpperCase()})`}
                  </Text>
                </Box>
              ))}
            </>
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
