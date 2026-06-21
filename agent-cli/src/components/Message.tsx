import type { Message } from 'agent'
import { Text } from 'ink'

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
            <>
              <Text key={index}>{msg.content}</Text>
            </>
          )
        }
        if (msg.tool_calls && msg.tool_calls?.length > 0) {
          const tools_name = msg.tool_calls?.map(tool => tool.name).join('、')
          return (
            <>
              <Text color="green" key={index}>
                {`[⚙_⚙]: I need to utilize the following tools to assist in solving the problem.\n${tools_name}`}
              </Text>
            </>
          )
        }
        if (msg.role === 'assistant') {
          return (
            <>
              <Text color="rgb(232, 131, 136)" key={index}>{`[◉_◉]:${msg.content}`}</Text>
            </>
          )
        }
        return null
      })}
    </>
  )
}
