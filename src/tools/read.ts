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
          description: '起始行号（从1开始）。用于大文件时从指定行读取',
        },
        limit: {
          type: 'integer',
          description: '读取的行数。配合offset对大文件进行分块读取',
        },
      },
      required: ['path'],
    }
  }

  public execute(args: { path: string, offset?: number, limit?: number }): string {
    const content = fs.readFileSync(args.path, 'utf-8')
    const lines = content.split('\n')

    const start = args.offset ? args.offset - 1 : 0
    const end = args.limit ? start + args.limit : lines.length

    return lines.slice(start, end).join('\n')
  }
}
