import type { AgentStatusType, Message, ProviderType } from 'agent'
import path from 'node:path'
import process from 'node:process'
import { AddTwoNums, Agent, Edit, LLMClient, Logger, Read } from 'agent'
import dotenv from 'dotenv'
import { create } from 'zustand'

dotenv.config({
  path: path.resolve(import.meta.dirname, '../../../.env'),
})

const client = new LLMClient({
  provider: 'anthropic',
  baseURL: process.env.ANTHROPIC_BASE_URL || '',
  apiKey: process.env.ANTHROPIC_API_KEY || '',
  model: 'deepseek-v4-flash',
})
const tools = [
  new AddTwoNums(),
  new Read(),
  new Edit(),
]
const logger = new Logger()

const agent = new Agent({
  llmClient: client,
  tools,
  logger,
})

interface AgentState {
  agent: Agent
  provider: ProviderType
  model: string
  status: AgentStatusType
}

interface States {
  messages: Array<Message>
  client: LLMClient | undefined
  mainAgent: AgentState
}

interface Actions {
  updateMessages: (messages: Array<Message>) => void
  setClient: (client: LLMClient) => void
  setMainAgentStatus: (status: AgentStatusType) => void
  cleanMessages: () => void
}

const useAgentStore = create<States & Actions>((set, get) => ({
  messages: [],
  client: undefined,
  mainAgent: {
    agent,
    provider: 'anthropic',
    model: 'deepseek-v4-flash',
    status: 'reday',
  },
  updateMessages: messages => set({ messages: [...messages] }),
  setClient: (client: LLMClient) => {
    set({ client })
    const agent = get().mainAgent.agent
    agent.set_llm_client(client)
  },
  setMainAgentStatus: (status) => {
    const _mainAgent = get().mainAgent
    set({
      mainAgent: {
        ..._mainAgent,
        status,
      },
    })
  },
  cleanMessages: () => {
    set({ messages: [] })
    const agent = get().mainAgent.agent
    agent.clean_messages()
  },
}))

agent.set_toogle_status_callback((status: AgentStatusType) => {
  useAgentStore.getState().setMainAgentStatus(status)
})

export default useAgentStore
