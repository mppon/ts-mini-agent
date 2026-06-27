import { Box, Text } from 'ink'
import Gradient from 'ink-gradient'

function Banner() {
  return (
    <Box flexDirection="column" alignItems="center" marginY={1}>
      {/* 上装饰线 */}
      <Box
        width={50}
        borderStyle="single"
        borderTop={false}
        borderLeft={false}
        borderRight={false}
        borderBottom={true}
        borderColor="cyan"
      />

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
        Agent · CLI
      </Text>
      <Box
        width={50}
        borderStyle="single"
        borderTop={false}
        borderLeft={false}
        borderRight={false}
        borderBottom={true}
        borderColor="cyan"
      />
    </Box>
  )
}

export default Banner
