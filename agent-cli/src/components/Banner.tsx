import { Box, Text } from 'ink'
import Gradient from 'ink-gradient'
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
      borderColor="#f77336"
    >
      <Box
        flexDirection="column"
        alignItems="center"
        marginLeft={1}
        borderStyle="single"
        borderColor="#f77336"
      >
        {/* 主标题 - 使用渐变色 */}
        <Box paddingX={2}>
          <Gradient name="vice">
            <Text>
              {`
█████╗  ██████╗ ███████╗███╗   ██╗████████╗
██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝
███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║   
██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║   
██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║   
╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝   
          `}
            </Text>
          </Gradient>
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
