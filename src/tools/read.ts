import type { BaseTool } from './basetool'
import * as fs from 'node:fs'

export class Read implements BaseTool {
  public name = 'read'
  public description = '读取指定文件的内容，支持偏移量和行数限制'

  public get_name(): string {
    return this.name
  }

  public get_description(): string {
    return this.description
  }

  public to_schema() {
    return {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: '文件的绝对路径或相对路径',
        },
        offset: {
          type: 'integer',
          description: '起始行号（从1开始）',
        },
        limit: {
          type: 'integer',
          description: '读取的行数',
        },
      },
      required: ['path'],
    }
  }

  public async execute(args: {
    path: string
    offset?: number
    limit?: number
  }): Promise<string> {
    try {
      const stat = await fs.promises.stat(args.path)

      if (!stat.isFile()) {
        return `Error: "${args.path}" is not a file.`
      }

      const content = await fs.promises.readFile(args.path, 'utf8')
      const lines = content.split(/\r?\n/)

      const start = Math.max((args.offset ?? 1) - 1, 0)
      const end = args.limit == null
        ? lines.length
        : Math.min(start + args.limit, lines.length)

      return lines.slice(start, end).join('\n')
    }
    catch (err) {
      const error = err as NodeJS.ErrnoException

      switch (error.code) {
        case 'ENOENT':
          return `Error: File not found: ${args.path}`

        case 'EACCES':
        case 'EPERM':
          return `Error: Permission denied: ${args.path}`

        case 'EISDIR':
          return `Error: "${args.path}" is a directory.`

        default:
          return `Error: ${error.message ?? 'Failed to read file.'}`
      }
    }
  }
}
