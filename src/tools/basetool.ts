/**
 Anthropic tool format:
{
    "name": "tool_name",
    "description": "Tool description",
    "input_schema": {
        "type": "object",
        "properties": {...},
        "required": [...]
    }
}
 */

/**
 * openAI
{
    "name":"tool_name",
    "description": "Tool description",
    "parameters":"json schema"
}
 */

export interface BaseTool {
  get_name: () => string
  get_description: () => string
  to_schema: () => any
  execute: (...args: any[]) => any
}
