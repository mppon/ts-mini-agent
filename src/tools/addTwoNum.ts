import type { BaseTool } from './basetool'

export class AddTwoNums implements BaseTool {
  public name = 'addTwoNums'
  public description = '这是一个加法工具，输入两个数字，输出它们的和'

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
        a: { type: 'number', description: '第一个加数' },
        b: { type: 'number', description: '第二个加数' },
      },
      required: ['a', 'b'],
    }
  }

  public execute(args: { a: number, b: number }): number {
    return args.a + args.b
  }
}
