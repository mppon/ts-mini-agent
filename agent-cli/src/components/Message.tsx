import type { Message } from 'agent'
import { Box, Text } from 'ink'
import { Fragment } from 'react/jsx-runtime'
import { Markdown } from './Markdown'

interface MessagesProps {
  messages: Message[]
}

export const Messages: React.FC<MessagesProps> = (props) => {
  const { messages = [] } = props
  function getToolFirstArgument(argument: Record<string, any>) {
    if (Object.keys(argument).length > 0) {
      return `${Object.keys(argument)[0]}:${Object.values(argument)[0]}`
    }
    return ''
  }
  return (
    <>
      {messages.map((msg, index) => {
        if (msg.role === 'user') {
          return (
            <Box key={index}>
              <Text color="rgb(232, 131, 136)">[•‿•]: </Text>
              <Text color="rgb(232, 131, 136)">{msg.content}</Text>
            </Box>
          )
        }
        if (msg.role === 'assistant' && msg.tool_calls && msg.tool_calls.length > 0) {
          return (
            <Fragment key={index}>
              {msg.tool_calls.map((tool, toolIndex) => (
                <Box key={`${index}-${toolIndex}`}>
                  <Box>
                    <Text>[⚙_⚙]: </Text>
                    <Text color="green" bold>
                      {`(${tool.name.toUpperCase()})`}
                    </Text>
                  </Box>
                  <Box>
                    <Text color="green" bold>
                      {getToolFirstArgument(tool.function.arguments)}
                    </Text>
                  </Box>
                </Box>
              ))}
            </Fragment>
          )
        }
        if (msg.role === 'assistant') {
          return (
            <Box key={index}>
              <Text>[◉_◉]: </Text>
              <Markdown content={msg.content as string} />
            </Box>
          )
        }
        return null
      })}
    </>
  )
}
