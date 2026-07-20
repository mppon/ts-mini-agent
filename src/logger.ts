import type { Message, ModelResponse } from './llm'
import * as fs from 'node:fs'
import { dirname, join } from 'node:path'

export class Logger {
  private baseDir: string = ''
  private timeStamp: string = ''
  private runningTimeStamp: string = ''
  constructor() {
    this.timeStamp = this._generate_timestamp()
    this.runningTimeStamp = this._generate_timestamp()
    this.baseDir = `../log/${this.timeStamp}`
  }

  public _generate_timestamp() {
    return new Date().toISOString().slice(0, 19).replace(/:/g, '-').replace(/T/g, '-')
  }

  public logger_request(messages: Message[]) {
    const content = `---message-start---\n${JSON.stringify(messages, null, 2)}\n---message-end---\n`
    this.write(content)
  }

  public logger_response(response: ModelResponse) {
    const content = `---response-start---\n${JSON.stringify(response, null, 2)}\n---response-end---\n`
    this.write(content)
  }

  public start_new_run() {
    this.runningTimeStamp = this._generate_timestamp()
  }

  public write(log: string) {
    const _dir = join(this.baseDir, `${this.runningTimeStamp}.log`)
    const dirPath = dirname(_dir)

    fs.mkdirSync(dirPath, { recursive: true })
    fs.appendFileSync(_dir, `${log}\n`, 'utf8')
  }
}
