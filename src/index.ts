export {
  CallSite,
  FunctionMeta,
  Instruction,
  Opcode,
  Program,
  UnsupportedOpcodeError,
  VirtualMachine,
  compileProgramFromAssembly,
  compileProgramFromJavaScript,
  deserializeProgram,
  serializeProgram,
} from './vm'
export {
  compileJavaScriptToBytecode,
  createVMFromArrayBuffer,
  createVMFromJavaScript,
} from './js'
