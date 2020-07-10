import { Command, flags } from '@oclif/command'
import path = require("path")
import fs = require("fs")
import { generateAssemblyFromJs } from '../../../codegen'

export default class Codegen extends Command {
  static description = 'compile js to nestscript assembly.'

  static examples = [
    `$ nsc codegen main.js main.nes`,
  ]

  static flags = {
    help: flags.help({ char: 'h' }),
    // flag with a value (-n, --name=VALUE)
    name: flags.string({ char: 'n', description: 'name to print' }),
    // flag with no value (-f, --force)
    force: flags.boolean({ char: 'f' }),
  }

  static args = [{ name: 'file' }, { name: 'target' }]

  async run() {
    const { args, flags } = this.parse(Codegen)
    if (!args.file) {
      console.log("Please specify source file.")
      return
    }

    if (!args.target) {
      console.log("Please specify target file.")
      return
    }

    const src = this.getAbsPath(args.file)
    const dst = this.getAbsPath(args.target)
    const code = fs.readFileSync(src, 'utf-8')
    const buffer = generateAssemblyFromJs(code)
    fs.writeFileSync(dst, buffer)
    console.log("Compile done!")
  }

  public getAbsPath(p: string): string {
    return path.resolve(path.join(process.cwd(), p))
  }
}
