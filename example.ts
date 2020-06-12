import { exec } from './index'

export default class Example {
  constructor() {
    this.onLoad()
  }

  public onLoad(): void {
    console.log("OJBK")
    exec(`
      this.sayHi('hello world')
    `, this)
  }

  public sayHi(msg: string): void {
    console.log(msg)
  }
}

const eg = new Example()
