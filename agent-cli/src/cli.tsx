import { Box, render, Text } from 'ink'
import TextInput from 'ink-text-input'
import React from 'react'

interface Props {
  onSubmit: (text: string) => void
}

export const CLI: React.FC<Props> = ({ onSubmit }) => {
  const [value, setValue] = React.useState('')
  const [history, setHistory] = React.useState<string[]>([])

  const handleSubmit = (input: string) => {
    if (!input.trim())
      return
    setHistory(h => [input, ...h])
    setValue('')
    onSubmit(input)
  }

  return (
    <Box flexDirection="column">
      <Box flexDirection="column" marginBottom={1}>
        {history.map((h, i) => (
          <Text key={i}>
            »
            {h}
          </Text>
        ))}
      </Box>
      <Box>
        <Text>Input: </Text>
        <TextInput value={value} onChange={setValue} onSubmit={handleSubmit} />
      </Box>
    </Box>
  )
}

export function runCLI(onSubmit: (text: string) => void) {
  render(React.createElement(CLI, { onSubmit }))
}
