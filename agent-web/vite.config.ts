import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const rootDir = path.resolve(__dirname, '..')

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  envDir: rootDir,
  envPrefix: ['VITE', 'OPENAI', 'ANTHROPIC'],
  server: {
    fs: {
      allow: [rootDir],
    },
  },
})
