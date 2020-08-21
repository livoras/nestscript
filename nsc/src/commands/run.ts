import { Command, flags } from '@oclif/command'
import path = require("path")
import fs = require("fs")
import { parseCodeToProgram } from "nestscript"
import { VirtualMachine, createVMFromArrayBuffer } from "nestscript/src/vm/vm"

export default class Run extends Command {
  static description = 'describe the command here'

  static examples = [
    `$ nsc compile eg.asm target`,
  ]

  static flags = {
    help: flags.help({ char: 'h' }),
    // flag with a value (-n, --name=VALUE)
    name: flags.string({ char: 'n', description: 'name to print' }),
    // flag with no value (-f, --force)
    force: flags.boolean({ char: 'f' }),
  }

  static args = [{ name: 'file' }]

  async run() {
    const { args, flags } = this.parse(Run)
    if (!args.file) {
      console.log("Please specify executable file.")
      return
    }
    const exe = this.getAbsPath(args.file)
    const vm = createVMFromArrayBuffer((new Uint8Array(fs.readFileSync(exe)).buffer), {
      Array,
      Function,
      RegExp,
      Object,
      String,
      TypeError,
      ArrayBuffer,
      DataView,
      Error,
      Math,
      console,
      Date,
    })
    vm.run()
  }

  public getAbsPath(p: string): string {
    return path.resolve(path.join(process.cwd(), p))
  }
}
