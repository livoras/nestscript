import { VirtualMachine, createVMFromArrayBuffer } from './vm/vm'
import {
  RegisterVirtualMachine,
  compileV2FromJavaScript,
  createRegisterVMFromArrayBuffer,
  createRegisterVMFromJavaScript,
  serializeV2Program,
} from './vm/vm2'
import { generateAssemblyFromJs } from './codegen'
import { parseCodeToProgram } from './assembler'

export const createVMFromJavaScript = (jsCode: string, ctx: any = {}): VirtualMachine => {
  const asmCodes = generateAssemblyFromJs(jsCode)
  const buffer = parseCodeToProgram(asmCodes).buffer
  return createVMFromArrayBuffer(buffer, ctx)
}

export const createVMFromJavaScriptV2 = (jsCode: string, ctx: any = {}): RegisterVirtualMachine => {
  return createRegisterVMFromJavaScript(jsCode, ctx)
}

export const compileJavaScriptToV2Bytecode = (jsCode: string): ArrayBuffer => {
  return serializeV2Program(compileV2FromJavaScript(jsCode))
}

export const createVMFromV2ArrayBuffer = (buffer: ArrayBuffer, ctx: any = {}): RegisterVirtualMachine => {
  return createRegisterVMFromArrayBuffer(buffer, ctx)
}
