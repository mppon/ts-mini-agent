export class addTwoNums {
  public name = 'addTwoNums'
  public description = '这是一个加法工具，输入两个数字，输出它们的和'
  public execute(args: { a: number, b: number }): number {
    const { a, b } = args
    return a + b
  }
}
