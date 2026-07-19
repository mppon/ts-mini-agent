import { Box, Text, useInput } from 'ink'
import { useState } from 'react'

interface Command {
  name: string
  description: string
}

const COMMANDS: Command[] = [
  { name: '/clean', description: 'Clear conversation' },
  { name: '/exit', description: 'Exit the terminal' },
]

interface InputProps {
  onSubmit?: (query: string) => void
  onCommand?: (command: string) => void
}

export function Input(props: InputProps) {
  const [value, setValue] = useState('')
  const [showCommands, setShowCommands] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const filteredCommands = showCommands && value.startsWith('/')
    ? COMMANDS.filter(c => c.name.startsWith(value))
    : []

  useInput((input, key) => {
    if (key.return) {
      const exactCommand = COMMANDS.find(c => c.name === value)
      if (exactCommand) {
        setValue('')
        setShowCommands(false)
        setSelectedIndex(0)
        props?.onCommand?.(exactCommand.name)
      }
      else if (showCommands && filteredCommands.length > 0) {
        const cmd = filteredCommands[selectedIndex]
        if (cmd) {
          setValue('')
          setShowCommands(false)
          setSelectedIndex(0)
          props?.onCommand?.(cmd.name)
        }
      }
      else {
        props?.onSubmit?.(value)
        setValue('')
        setShowCommands(false)
      }
      return
    }

    if (showCommands && filteredCommands.length > 0) {
      if (key.upArrow) {
        setSelectedIndex(prev => Math.max(0, prev - 1))
        return
      }
      if (key.downArrow) {
        setSelectedIndex(prev => Math.min(filteredCommands.length - 1, prev + 1))
        return
      }
      if (key.escape) {
        setShowCommands(false)
        return
      }
      if (key.tab) {
        const cmd = filteredCommands[selectedIndex]
        if (cmd) {
          setValue(cmd.name)
          setShowCommands(false)
        }
        return
      }
    }

    if (input.length > 0) {
      const newValue = value + input
      setValue(newValue)
      if (newValue === '/') {
        setShowCommands(true)
        setSelectedIndex(0)
      }
      else if (showCommands && !newValue.startsWith('/')) {
        setShowCommands(false)
      }
      return
    }

    if (key.backspace || key.delete) {
      setValue((prev) => {
        const newVal = prev.slice(0, -1)
        if (showCommands && !newVal.startsWith('/')) {
          setShowCommands(false)
        }
        return newVal
      })
    }
  })

  return (
    <Box flexDirection="column">
      <Box>
        <Text>❯ </Text>
        <Text>{value}</Text>
        <Text dimColor>█</Text>
      </Box>
      {showCommands && filteredCommands.length > 0 && (
        <Box flexDirection="column" marginLeft={2}>
          {filteredCommands.map((cmd, index) => (
            <Box key={cmd.name}>
              <Text color={index === selectedIndex ? 'cyan' : undefined}>
                {index === selectedIndex ? '› ' : '  '}
                {cmd.name}
              </Text>
              <Text>  </Text>
              <Text dimColor>{cmd.description}</Text>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}
