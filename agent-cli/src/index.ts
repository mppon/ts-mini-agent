#!/usr/bin/env node
import { runCLI } from './cli'

function handleInput(text: string) {
  // Placeholder: wire up to agent logic
  // eslint-disable-next-line no-console
  console.log('Received:', text)
}

runCLI(handleInput)
