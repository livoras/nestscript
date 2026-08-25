import {
  compileProgramFromJavaScript,
  createVMFromArrayBuffer as createRuntimeFromArrayBuffer,
  createVMFromJavaScript as createRuntimeFromJavaScript,
  Program,
  serializeProgram,
  VirtualMachine,
} from './vm'

/** Compile JavaScript source into the canonical NestScript bytecode format. */
export const compileJavaScriptToBytecode = (source: string): ArrayBuffer => {
  return serializeProgram(compileProgramFromJavaScript(source))
}

/** Create a VM from serialized NestScript bytecode. */
export const createVMFromArrayBuffer = (buffer: ArrayBuffer, ctx: any = {}): VirtualMachine => {
  return createRuntimeFromArrayBuffer(buffer, ctx)
}

/** Compile and create a VM in one step. */
export const createVMFromJavaScript = (source: string, ctx: any = {}): VirtualMachine => {
  return createRuntimeFromJavaScript(source, ctx)
}

export { Program, VirtualMachine }
