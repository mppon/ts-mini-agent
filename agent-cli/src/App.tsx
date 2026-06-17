import { Box, render, Text } from 'ink'
import React from 'react'
import { Icon } from './asc'

interface Props {
  onSubmit: (text: string) => void
}

export const App: React.FC<Props> = () => {
  return (
    <Box flexDirection="column">
      <Text color="greenBright">{Icon}</Text>
    </Box>
  )
}

export function run() {
  render(React.createElement(App))
}
