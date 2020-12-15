import { Command, flags } from '@oclif/command'
import path = require("path")
import fs = require("fs")
import { generateAssemblyFromJs } from '../../../src/codegen'
import { parseCodeToProgram } from '../../../src/assembler'

export default class Compile extends Command {
  static description = 'compile source javascript file to executable binary file'

  static examples = [
    `$ nsc compile main.js main`,
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
    const { args, flags } = this.parse(Compile)
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
    const asm = generateAssemblyFromJs(code)
    const buffer = parseCodeToProgram(asm)
    fs.writeFileSync(dst, buffer)
    console.log("Compile done!")
  }

  public getAbsPath(p: string): string {
    return path.resolve(path.join(process.cwd(), p))
  }
}
