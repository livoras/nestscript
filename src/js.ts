import { VirtualMachine, createVMFromArrayBuffer } from './vm'
import { generateAssemblyFromJs } from './codegen'
import { parseCodeToProgram } from './assembler'

export const createVMFromJavaScript = (jsCode: string, ctx: any = {}): VirtualMachine => {
  const asmCodes = generateAssemblyFromJs(jsCode)
  const buffer = parseCodeToProgram(asmCodes).buffer
  return createVMFromArrayBuffer(buffer, ctx)
}
