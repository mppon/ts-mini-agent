import { Box, Text } from 'ink'
import { marked } from 'marked'
import React from 'react'

interface Props {
  content: string
}

/* -----------------------------
 * 1. 预处理（关键：• → -）
 * ----------------------------- */
function normalizeMarkdown(md: string) {
  return md.replace(/^•\s+/gm, '- ')
}

/* -----------------------------
 * 2. Inline Renderer（核心）
 * ----------------------------- */
function renderInline(tokens: any[] = []): React.ReactNode[] {
  const result: React.ReactNode[] = []

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]

    switch (token.type) {
      case 'text':
        result.push(<Text key={`text-${i}`}>{token.text}</Text>)
        break

      case 'strong':
        result.push(
          <Text key={`s-${i}`} bold>
            {renderInline(token.tokens || [])}
          </Text>,
        )
        break

      case 'em':
        result.push(
          <Text key={`e-${i}`} italic>
            {renderInline(token.tokens || [])}
          </Text>,
        )
        break

      case 'codespan':
        result.push(
          <Text key={`c-${i}`} backgroundColor="gray" color="black">
            {token.text}
          </Text>,
        )
        break

      case 'link':
        result.push(
          <Text key={`l-${i}`} color="cyan" underline>
            {token.text}
          </Text>,
        )
        break

      case 'br':
        result.push(<Text key={`br-${i}`}>{`\n`}</Text>)
        break

      default:
        result.push(<Text key={`def-${i}`}>{token.text}</Text>)
    }
  }

  return result
}
/* -----------------------------
 * 3. Heading
 * ----------------------------- */
function Heading({ token }: any) {
  const color
    = token.depth === 1
      ? 'cyanBright'
      : token.depth === 2
        ? 'cyan'
        : 'gray'

  return (
    <Box marginY={1}>
      <Text bold color={color}>
        {renderInline(token.tokens)}
      </Text>
    </Box>
  )
}

/* -----------------------------
 * 4. Paragraph（关键修复）
 * ----------------------------- */
function Paragraph({ token }: any) {
  return (
    <Box>
      <Text>
        {renderInline(token.tokens || [])}
      </Text>
    </Box>
  )
}

/* -----------------------------
 * 5. List（Ink safe版本）
 * ----------------------------- */
function List({ token }: any) {
  return (
    <Box flexDirection="column">
      {token.items.map((item: any, i: number) => (
        <Box key={i} flexDirection="row">
          <Text>• </Text>
          {item.tokens?.[0]?.tokens
            ? renderInline(item.tokens[0].tokens)
            : <Text>{item.text}</Text>}
        </Box>
      ))}
    </Box>
  )
}

/* -----------------------------
 * 6. Code Block
 * ----------------------------- */
function CodeBlock({ token }: any) {
  return (
    <Box
      borderStyle="round"
      borderColor="gray"
      flexDirection="column"
    >
      <Text color="gray">{token.lang || 'code'}</Text>
      <Text>{token.text}</Text>
    </Box>
  )
}

/* -----------------------------
 * 7. Dispatcher
 * ----------------------------- */
function renderToken(token: any, key: string): React.ReactNode {
  switch (token.type) {
    case 'heading':
      return <Heading key={key} token={token} />

    case 'paragraph':
      return <Paragraph key={key} token={token} />

    case 'list':
      return <List key={key} token={token} />

    case 'code':
      return <CodeBlock key={key} token={token} />

    case 'hr':
      return (
        <Box key={key}>
          <Text color="gray">{'─'.repeat(30)}</Text>
        </Box>
      )

    case 'space':
      return null

    default:
      return null
  }
}

/* -----------------------------
 * 8. Main Component
 * ----------------------------- */
export function Markdown({ content }: Props) {
  const tokens = marked.lexer(normalizeMarkdown(content))

  return (
    <Box flexDirection="column">
      {tokens.map((token, i) => renderToken(token, `t-${i}`))}
    </Box>
  )
}
