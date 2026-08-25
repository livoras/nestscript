import * as fs from 'fs'
import * as path from 'path'
import {
  compileJavaScriptToBytecode,
  createVMFromArrayBuffer,
} from './index'
import { generateAssemblyFromJs } from './compiler/codegen'

// The CLI is intentionally a thin Node.js adapter around the library API.
// The generated package entry point is build/src/cli.js; the nsc shim only
// supplies the executable shebang required by npm's bin mechanism.
const packageJson = require('../../package.json')

const usage = `NestScript ${packageJson.version}

Usage:
  nsc compile <source.js> <output>
  nsc codegen <source.js> <output.nes>
  nsc run <bytecode>

Commands:
  compile  Compile JavaScript directly to NestScript bytecode
  codegen  Generate human-readable NestScript assembly
  run      Execute NestScript bytecode with a Node.js host context

Options:
  -h, --help     Show this help
  -v, --version  Show the installed version`

const resolvePath = (file: string): string => path.resolve(process.cwd(), file)

const requireArguments = (command: string, args: string[], count: number): void => {
  if (args.length !== count) {
    throw new Error(`Invalid arguments for '${command}'. Run 'nsc --help' for usage.`)
  }
}

const createNodeContext = (): any => ({
  Array,
  ArrayBuffer,
  Boolean,
  Buffer,
  DataView,
  Date,
  Error,
  Function,
  Infinity,
  Map,
  Math,
  Number,
  Object,
  RegExp,
  Set,
  String,
  TypeError,
  Uint8Array,
  console,
  process,
})

const compile = (sourceFile: string, outputFile: string): void => {
  const source = fs.readFileSync(resolvePath(sourceFile), 'utf8')
  fs.writeFileSync(resolvePath(outputFile), Buffer.from(compileJavaScriptToBytecode(source)))
  console.log('Compile done!')
}

const codegen = (sourceFile: string, outputFile: string): void => {
  const source = fs.readFileSync(resolvePath(sourceFile), 'utf8')
  fs.writeFileSync(resolvePath(outputFile), generateAssemblyFromJs(source))
  console.log('Code generation done!')
}

const run = (bytecodeFile: string): void => {
  const bytecode = Uint8Array.from(fs.readFileSync(resolvePath(bytecodeFile))).buffer
  createVMFromArrayBuffer(bytecode, createNodeContext()).run()
}

export const runCli = (argv: string[] = process.argv.slice(2)): void => {
  const [command, ...args] = argv

  if (!command || command === '-h' || command === '--help' || command === 'help') {
    console.log(usage)
    return
  }
  if (command === '-v' || command === '--version' || command === 'version') {
    console.log(packageJson.version)
    return
  }

  switch (command) {
    case 'compile':
      requireArguments(command, args, 2)
      compile(args[0], args[1])
      return
    case 'codegen':
      requireArguments(command, args, 2)
      codegen(args[0], args[1])
      return
    case 'run':
      requireArguments(command, args, 1)
      run(args[0])
      return
    default:
      throw new Error(`Unknown command '${command}'. Run 'nsc --help' for usage.`)
  }
}

if (require.main === module) {
  try {
    runCli()
  } catch (error) {
    console.error(error && (error as any).stack ? (error as any).stack : error)
    process.exitCode = 1
  }
}
