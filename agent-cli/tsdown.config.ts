import { defineConfig } from 'tsdown'

export default defineConfig({
  dts: {
    tsgo: true,
  },
  exports: true,
  entry: ['./src/index.ts'],
  alias: {
    agent: '../src/agent.ts',
  },
})
