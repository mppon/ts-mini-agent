import type { BaseTool } from './basetool'
import * as fs from 'node:fs'

export class Edit implements BaseTool {
  public name = 'edit'
  public description = '编辑文件，将文件中的指定字符串替换为新字符串'

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
        old_str: {
          type: 'string',
          description: '要查找并替换的精确字符串（必须在文件中唯一）',
        },
        new_str: {
          type: 'string',
          description: '替换后的新字符串',
        },
      },
      required: ['path', 'old_str', 'new_str'],
    }
  }

  public execute(args: { path: string, old_str: string, new_str: string }): string {
    const content = fs.readFileSync(args.path, 'utf-8')

    const occurrences = content.split(args.old_str).length - 1
    if (occurrences === 0) {
      return `错误：未在文件中找到 "${args.old_str}"`
    }
    if (occurrences > 1) {
      return `错误："${args.old_str}" 在文件中出现了 ${occurrences} 次，请提供更精确的字符串以确保唯一匹配`
    }

    const newContent = content.replace(args.old_str, args.new_str)
    fs.writeFileSync(args.path, newContent, 'utf-8')
    return `成功将 "${args.old_str}" 替换为 "${args.new_str}"`
  }
}
