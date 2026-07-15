import { Box, Text } from 'ink'
import TextInput from 'ink-text-input'
import { useState } from 'react'

interface InputProps {
  onSubmit?: (query: string) => void
}
export function Input(props: InputProps) {
  const [value, setValue] = useState('')
  const submit = (query: string) => {
    props?.onSubmit && props?.onSubmit(query)
    setValue('')
  }
  return (
    <Box>
      <Text>❯ </Text>
      <TextInput
        value={value}
        onChange={setValue}
        placeholder="Ask me anything..."
        onSubmit={submit}
      />
    </Box>
  )
}
