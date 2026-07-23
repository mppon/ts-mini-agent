import { Box, Text } from 'ink'
import useAgentStore from '../store'

function Banner() {
  const { mainAgent } = useAgentStore()
  const { provider, model } = mainAgent
  return (
    <Box
      flexDirection="column"
      alignItems="flex-start"
      marginY={1}
      borderStyle="single"
      borderColor="#e2582f"
    >
      <Box
        flexDirection="column"
        alignItems="center"
        marginLeft={1}
        borderStyle="single"
        borderColor="#e2582f"
      >
        {/* 主标题 - 使用渐变色 */}
        <Box paddingX={2} width={40} height={5}>
        </Box>
        <Text color="yellow">
          {provider}
          ·
          {model}
        </Text>
      </Box>
    </Box>
  )
}

export default Banner
