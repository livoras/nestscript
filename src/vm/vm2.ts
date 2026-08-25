// tslint:disable: no-bitwise
//
// Register VM V2
//
// V2 is deliberately implemented beside the original VM.  The original
// bytecode format is public and remains the compatibility path; V2 has its
// own fixed-width instruction format and can be adopted incrementally.

import { generateAssemblyFromJs } from '../codegen'
import { IParsedFunction, parseAssembler } from '../parser'

const REF_KIND_SHIFT = 30
const REF_INDEX_MASK = 0x3fffffff
const REF_LOCAL = 0
const REF_CONSTANT = 1
const REF_GLOBAL = 2
const REF_RETURN = 3
const NO_SLOT = 0xffff
const V2_MAGIC = 0x3256534e // little-endian bytes: NSV2
const V2_VERSION = 2
const HEADER_WORDS = 15
const FUNCTION_WORDS = 6
const CONSTANT_WORDS = 4

const ref = (kind: number, index: number = 0): number => {
  return ((kind << REF_KIND_SHIFT) | (index & REF_INDEX_MASK)) >>> 0
}

const refKind = (value: number): number => value >>> REF_KIND_SHIFT
const refIndex = (value: number): number => value & REF_INDEX_MASK
const localRef = (slot: number): number => ref(REF_LOCAL, slot)
const constantRef = (index: number): number => ref(REF_CONSTANT, index)
const globalRef = (index: number): number => ref(REF_GLOBAL, index)
const returnRef = (): number => ref(REF_RETURN)

export enum V2Opcode {
  NOP,
  MOVE,
  SET_GLOBAL,
  SET_RETURN,
  LOAD_CTX,
  SET_CTX,
  ADD,
  SUB,
  MUL,
  DIV,
  MOD,
  OR,
  AND,
  XOR,
  SHL,
  SHR,
  ZSHR,
  LT,
  GT,
  EQ,
  NE,
  LE,
  GE,
  WEQ,
  WNE,
  ADD_CONST,
  SUB_CONST,
  MUL_CONST,
  DIV_CONST,
  MOD_CONST,
  OR_CONST,
  AND_CONST,
  XOR_CONST,
  SHL_CONST,
  SHR_CONST,
  ZSHR_CONST,
  LT_CONST,
  GT_CONST,
  EQ_CONST,
  NE_CONST,
  LE_CONST,
  GE_CONST,
  WEQ_CONST,
  WNE_CONST,
  SUPER_ADD_STORE,
  /** A binary operation followed by a register/global store. */
  SUPER_BINARY_STORE,
  GET_PROP,
  SET_PROP,
  DEF_DATA,
  NEW_OBJ,
  NEW_ARR,
  MAKE_FUNC,
  MAKE_FUNC_GLOBAL,
  MAKE_FUNC_RETURN,
  JUMP,
  JUMP_IF_TRUE,
  JUMP_IF_FALSE,
  CALL,
  RETURN,
  EXIT,
  // Appended to keep the original V2 opcode numbers stable.  These are
  // installed adaptively in the packed stream for signed 32-bit operands.
  ADD_I32,
  SUB_I32,
  MUL_I32,
  MOD_I32,
  OR_I32,
  AND_I32,
  XOR_I32,
  SHL_I32,
  SHR_I32,
  ZSHR_I32,
  LT_I32,
  GT_I32,
  EQ_I32,
  NE_I32,
  LE_I32,
  GE_I32,
  WEQ_I32,
  WNE_I32,
  /** Static loop kernel for the canonical integer accumulation shape. */
  LOOP_ACCUMULATE,
}

export interface IV2Instruction {
  op: V2Opcode
  flags: number
  dst: number
  a: number
  b: number
  c: number
  /** Resolved by the compiler after all function offsets are known. */
  targetLabel?: string
}

export interface IV2FunctionMeta {
  start: number
  length: number
  numArgs: number
  slotCount: number
  flags: number
}

export interface IV2CallSite {
  args: number[]
  isNewExpression: boolean
}

export interface IV2Program {
  version: number
  entryFunction: number
  instructions: IV2Instruction[]
  functions: IV2FunctionMeta[]
  constants: any[]
  callSites: IV2CallSite[]
  globalNames: string[]
}

class V2UnsupportedError extends Error {
  constructor(public opcode: string, public details: string = '') {
    super(`V2 does not support ${opcode}${details ? ` (${details})` : ''}`)
  }
}

interface ICompileFunction {
  parsed: IParsedFunction
  index: number
  params: string[]
  locals: Map<string, number>
  labels: { [name: string]: number }
  instructions: IV2Instruction[]
  slotCount: number
  flags: number
}

const unquote = (value: string): string => {
  if (value.length >= 2 && ((value[0] === '"' && value[value.length - 1] === '"') ||
    (value[0] === "'" && value[value.length - 1] === "'"))) {
    return value.slice(1, -1)
  }
  return value
}

const isNumberToken = (value: string): boolean => {
  return value !== '' && !isNaN(+value)
}

const isBinaryOpcode = (opcode: string): boolean => {
  return [
    'ADD', 'SUB', 'MUL', 'DIV', 'MOD', 'OR', 'AND', 'XOR', 'SHL', 'SHR', 'ZSHR',
    'LT', 'GT', 'EQ', 'NE', 'LE', 'GE', 'WEQ', 'WNE',
  ].includes(opcode)
}

const binaryOpcode = (opcode: string): V2Opcode => {
  const result = (V2Opcode as any)[opcode]
  if (typeof result !== 'number') {
    throw new V2UnsupportedError(opcode)
  }
  return result
}

const i32OpcodeFor = (opcode: V2Opcode): V2Opcode | undefined => {
  switch (opcode) {
    case V2Opcode.ADD:
    case V2Opcode.ADD_CONST: return V2Opcode.ADD_I32
    case V2Opcode.SUB:
    case V2Opcode.SUB_CONST: return V2Opcode.SUB_I32
    case V2Opcode.MUL:
    case V2Opcode.MUL_CONST: return V2Opcode.MUL_I32
    case V2Opcode.MOD:
    case V2Opcode.MOD_CONST: return V2Opcode.MOD_I32
    case V2Opcode.OR:
    case V2Opcode.OR_CONST: return V2Opcode.OR_I32
    case V2Opcode.AND:
    case V2Opcode.AND_CONST: return V2Opcode.AND_I32
    case V2Opcode.XOR:
    case V2Opcode.XOR_CONST: return V2Opcode.XOR_I32
    case V2Opcode.SHL:
    case V2Opcode.SHL_CONST: return V2Opcode.SHL_I32
    case V2Opcode.SHR:
    case V2Opcode.SHR_CONST: return V2Opcode.SHR_I32
    case V2Opcode.ZSHR:
    case V2Opcode.ZSHR_CONST: return V2Opcode.ZSHR_I32
    case V2Opcode.LT:
    case V2Opcode.LT_CONST: return V2Opcode.LT_I32
    case V2Opcode.GT:
    case V2Opcode.GT_CONST: return V2Opcode.GT_I32
    case V2Opcode.EQ:
    case V2Opcode.EQ_CONST: return V2Opcode.EQ_I32
    case V2Opcode.NE:
    case V2Opcode.NE_CONST: return V2Opcode.NE_I32
    case V2Opcode.LE:
    case V2Opcode.LE_CONST: return V2Opcode.LE_I32
    case V2Opcode.GE:
    case V2Opcode.GE_CONST: return V2Opcode.GE_I32
    case V2Opcode.WEQ:
    case V2Opcode.WEQ_CONST: return V2Opcode.WEQ_I32
    case V2Opcode.WNE:
    case V2Opcode.WNE_CONST: return V2Opcode.WNE_I32
    default: return undefined
  }
}

const genericOpcodeForI32 = (opcode: V2Opcode): V2Opcode => {
  switch (opcode) {
    case V2Opcode.ADD_I32: return V2Opcode.ADD
    case V2Opcode.SUB_I32: return V2Opcode.SUB
    case V2Opcode.MUL_I32: return V2Opcode.MUL
    case V2Opcode.MOD_I32: return V2Opcode.MOD
    case V2Opcode.OR_I32: return V2Opcode.OR
    case V2Opcode.AND_I32: return V2Opcode.AND
    case V2Opcode.XOR_I32: return V2Opcode.XOR
    case V2Opcode.SHL_I32: return V2Opcode.SHL
    case V2Opcode.SHR_I32: return V2Opcode.SHR
    case V2Opcode.ZSHR_I32: return V2Opcode.ZSHR
    case V2Opcode.LT_I32: return V2Opcode.LT
    case V2Opcode.GT_I32: return V2Opcode.GT
    case V2Opcode.EQ_I32: return V2Opcode.EQ
    case V2Opcode.NE_I32: return V2Opcode.NE
    case V2Opcode.LE_I32: return V2Opcode.LE
    case V2Opcode.GE_I32: return V2Opcode.GE
    case V2Opcode.WEQ_I32: return V2Opcode.WEQ
    case V2Opcode.WNE_I32: return V2Opcode.WNE
    default: throw new Error(`Not an I32 opcode ${opcode}`)
  }
}

const isI32Opcode = (opcode: V2Opcode): boolean => {
  return opcode >= V2Opcode.ADD_I32 && opcode <= V2Opcode.WNE_I32
}
const isInt32Value = (value: any): value is number => {
  return typeof value === 'number' && value === (value | 0)
}

const constantOpcode = (opcode: string): V2Opcode => {
  const result = (V2Opcode as any)[`${opcode}_CONST`]
  if (typeof result !== 'number') {
    throw new V2UnsupportedError(opcode)
  }
  return result
}

const instruction = (
  op: V2Opcode,
  dst: number = NO_SLOT,
  a: number = 0,
  b: number = 0,
  c: number = 0,
): IV2Instruction => ({ op, flags: 0, dst, a, b, c })

const addSlot = (compileFunction: ICompileFunction, name: string): number => {
  const existing = compileFunction.locals.get(name)
  if (existing !== undefined) {
    return existing
  }
  const slot = compileFunction.slotCount++
  if (slot >= NO_SLOT) {
    throw new Error('V2 function has too many local slots')
  }
  compileFunction.locals.set(name, slot)
  return slot
}

const parseRegisterName = (name: string): string => name

const buildFunctionLocals = (parsed: IParsedFunction, index: number): ICompileFunction => {
  const compileFunction: ICompileFunction = {
    parsed,
    index,
    params: parsed.params.map((param): string => param.replace(/^\./, '')),
    locals: new Map<string, number>(),
    labels: {},
    instructions: [],
    slotCount: 0,
    flags: 0,
  }
  for (const param of compileFunction.params) {
    addSlot(compileFunction, param)
  }
  for (const code of parsed.instructions) {
    if (code[0] === 'VAR') {
      if (code[1].startsWith('@')) {
        throw new V2UnsupportedError(code[0], 'closures')
      }
      addSlot(compileFunction, code[1])
    } else if (code[0] === 'REG') {
      addSlot(compileFunction, parseRegisterName(code[1]))
    } else if (code[0] === 'META') {
      compileFunction.flags = Number(code[1]) || 0
    }
  }
  return compileFunction
}

const countEmittedInstructions = (
  code: string[],
  compileFunction: ICompileFunction,
  globalNames: Set<string>,
): number => {
  const opcode = code[0]
  if (['META', 'REG', 'VAR', 'CLS', 'GLOBAL_BIND', 'LABEL'].includes(opcode)) {
    return 0
  }
  if (opcode === 'PUSH') {
    // V1 PUSH captures the value at the push point.  V2 materializes that
    // value in a temporary slot so a later MOV cannot change the call arg.
    return 1
  }
  if (opcode === 'NEW_OBJ' || opcode === 'NEW_ARR') {
    const target = code[1]
    return globalNames.has(target) ? 2 : 1
  }
  return 1
}

const makeConstantTable = (): {
  constants: any[],
  get: (value: any) => number,
} => {
  const constants: any[] = []
  const indexes = new Map<any, number>()
  const get = (value: any): number => {
    const key = value !== value ? '__nestscript_nan__' : value
    const existing = indexes.get(key)
    if (existing !== undefined) {
      return existing
    }
    const index = constants.length
    constants.push(value)
    indexes.set(key, index)
    return index
  }
  return { constants, get }
}

const lowerV2Function = (
  compileFunction: ICompileFunction,
  functionIndexes: Map<string, number>,
  globalIndexes: Map<string, number>,
  constantTable: { constants: any[], get: (value: any) => number },
  callSites: IV2CallSite[],
): void => {
  const raw = compileFunction.parsed.instructions
  let ip = 0
  for (const code of raw) {
    ip += countEmittedInstructions(code, compileFunction, new Set(globalIndexes.keys()))
    if (code[0] === 'LABEL') {
      compileFunction.labels[code[1]] = ip
    }
  }

  let pendingArgs: number[] = []
  const tempSlot = (): number => {
    const slot = compileFunction.slotCount++
    if (slot >= NO_SLOT) {
      throw new Error('V2 function has too many local slots')
    }
    return slot
  }
  const getConstant = (value: any): number => constantRef(constantTable.get(value))
  const resolve = (token: string): number => {
    if (token === '$RET') {
      return returnRef()
    }
    if (token.startsWith('@')) {
      throw new V2UnsupportedError('operand', 'closures')
    }
    if (token.startsWith('%')) {
      const slot = compileFunction.locals.get(token)
      if (slot === undefined) { throw new V2UnsupportedError('register', token) }
      return localRef(slot)
    }
    if (token.startsWith('.')) {
      const slot = compileFunction.locals.get(token.slice(1))
      if (slot === undefined) { throw new V2UnsupportedError('parameter', token) }
      return localRef(slot)
    }
    const localSlot = compileFunction.locals.get(token)
    if (localSlot !== undefined) {
      return localRef(localSlot)
    }
    const globalIndex = globalIndexes.get(token)
    if (globalIndex !== undefined) {
      return globalRef(globalIndex)
    }
    if (token === 'true' || token === 'false') {
      return getConstant(token === 'true')
    }
    if (token === 'null') {
      return getConstant(null)
    }
    if (token === 'undefined') {
      return getConstant(void 0)
    }
    if (isNumberToken(token)) {
      return getConstant(+token)
    }
    if ((token.startsWith('"') && token.endsWith('"')) ||
      (token.startsWith("'") && token.endsWith("'"))) {
      return getConstant(unquote(token))
    }
    throw new V2UnsupportedError('operand', token)
  }
  const destination = (token: string): number => {
    const value = resolve(token)
    if (refKind(value) !== REF_LOCAL && refKind(value) !== REF_GLOBAL && refKind(value) !== REF_RETURN) {
      throw new V2UnsupportedError('destination', token)
    }
    return value
  }
  const emitStore = (target: number, value: number): void => {
    if (refKind(target) === REF_LOCAL) {
      compileFunction.instructions.push(instruction(V2Opcode.MOVE, refIndex(target), value))
    } else if (refKind(target) === REF_GLOBAL) {
      compileFunction.instructions.push(instruction(V2Opcode.SET_GLOBAL, NO_SLOT, refIndex(target), value))
    } else if (refKind(target) === REF_RETURN) {
      compileFunction.instructions.push(instruction(V2Opcode.SET_RETURN, NO_SLOT, value))
    } else {
      throw new V2UnsupportedError('store')
    }
  }
  const emitBinary = (opcode: string, target: number, left: number, right: number): void => {
    if (refKind(target) === REF_LOCAL) {
      const op = refKind(right) === REF_CONSTANT ? constantOpcode(opcode) : binaryOpcode(opcode)
      compileFunction.instructions.push(instruction(op, refIndex(target), left, right))
      return
    }
    const temporary = tempSlot()
    const op = refKind(right) === REF_CONSTANT ? constantOpcode(opcode) : binaryOpcode(opcode)
    compileFunction.instructions.push(instruction(op, temporary, left, right))
    emitStore(target, localRef(temporary))
  }

  for (const code of raw) {
    const opcode = code[0]
    if (['META', 'REG', 'VAR', 'CLS', 'GLOBAL_BIND', 'LABEL'].includes(opcode)) {
      if (opcode === 'CLS' || opcode === 'GLOBAL_BIND') {
        // Closures are intentionally rejected in buildFunctionLocals; global
        // bindings are represented by the V2 global slot table.
        if (opcode === 'CLS') { throw new V2UnsupportedError(opcode) }
      }
      continue
    }
    if (opcode === 'PUSH') {
      const temporary = tempSlot()
      compileFunction.instructions.push(instruction(V2Opcode.MOVE, temporary, resolve(code[1])))
      pendingArgs.push(localRef(temporary))
      continue
    }
    if (opcode === 'MOV') {
      emitStore(destination(code[1]), resolve(code[2]))
      continue
    }
    if (opcode === 'FUNC') {
      const functionIndex = functionIndexes.get(code[2])
      if (functionIndex === undefined) { throw new V2UnsupportedError(opcode, code[2]) }
      const target = destination(code[1])
      if (refKind(target) === REF_LOCAL) {
        compileFunction.instructions.push(instruction(V2Opcode.MAKE_FUNC, refIndex(target), 0, 0, functionIndex))
      } else if (refKind(target) === REF_GLOBAL) {
        compileFunction.instructions.push(instruction(V2Opcode.MAKE_FUNC_GLOBAL, NO_SLOT, refIndex(target), 0, functionIndex))
      } else {
        compileFunction.instructions.push(instruction(V2Opcode.MAKE_FUNC_RETURN, NO_SLOT, 0, 0, functionIndex))
      }
      continue
    }
    if (opcode === 'CALL_REG' || opcode === 'CALL_REF') {
      const functionRef = resolve(code[1])
      const argc = Number(opcode === 'CALL_REF' ? code[3] : code[2])
      if (!Number.isInteger(argc) || argc < 0 || pendingArgs.length < argc) {
        throw new V2UnsupportedError(opcode, 'argument stack')
      }
      const args = pendingArgs.splice(pendingArgs.length - argc, argc)
      const callSite = callSites.length
      callSites.push({ args, isNewExpression: code[3] === 'true' })
      const receiver = opcode === 'CALL_REF' ? resolve(code[2]) : getConstant(void 0)
      compileFunction.instructions.push(instruction(V2Opcode.CALL, NO_SLOT, functionRef, receiver, callSite))
      continue
    }
    if (isBinaryOpcode(opcode)) {
      emitBinary(opcode, destination(code[1]), resolve(code[1]), resolve(code[2]))
      continue
    }
    if (opcode === 'JF' || opcode === 'JIF') {
      compileFunction.instructions.push(instruction(
        opcode === 'JF' ? V2Opcode.JUMP_IF_FALSE : V2Opcode.JUMP_IF_TRUE,
        NO_SLOT,
        resolve(code[1]),
        0,
        0,
      ))
      compileFunction.instructions[compileFunction.instructions.length - 1].targetLabel = code[2]
      continue
    }
    if (opcode === 'JMP' || opcode === 'ABRUPT_JUMP') {
      if (opcode === 'ABRUPT_JUMP') { throw new V2UnsupportedError(opcode, 'finally routing') }
      const jump = instruction(V2Opcode.JUMP, NO_SLOT, 0, 0, 0)
      jump.targetLabel = code[1]
      compileFunction.instructions.push(jump)
      continue
    }
    if (opcode === 'SET_CTX') {
      compileFunction.instructions.push(instruction(V2Opcode.SET_CTX, NO_SLOT, resolve(code[1]), resolve(code[2])))
      continue
    }
    if (opcode === 'MOV_CTX') {
      const target = destination(code[1])
      if (refKind(target) !== REF_LOCAL) { throw new V2UnsupportedError(opcode, 'global destination') }
      compileFunction.instructions.push(instruction(V2Opcode.LOAD_CTX, refIndex(target), resolve(code[2])))
      continue
    }
    if (opcode === 'MOV_PROP') {
      const target = destination(code[1])
      if (refKind(target) !== REF_LOCAL) { throw new V2UnsupportedError(opcode, 'non-local destination') }
      compileFunction.instructions.push(instruction(V2Opcode.GET_PROP, refIndex(target), resolve(code[2]), resolve(code[3])))
      continue
    }
    if (opcode === 'SET_KEY') {
      compileFunction.instructions.push(instruction(V2Opcode.SET_PROP, NO_SLOT, resolve(code[1]), resolve(code[2]), resolve(code[3])))
      continue
    }
    if (opcode === 'DEF_DATA') {
      compileFunction.instructions.push(instruction(V2Opcode.DEF_DATA, NO_SLOT, resolve(code[1]), resolve(code[2]), resolve(code[3])))
      continue
    }
    if (opcode === 'NEW_OBJ' || opcode === 'NEW_ARR') {
      const target = destination(code[1])
      if (refKind(target) === REF_LOCAL) {
        compileFunction.instructions.push(instruction(opcode === 'NEW_OBJ' ? V2Opcode.NEW_OBJ : V2Opcode.NEW_ARR, refIndex(target)))
      } else {
        const temporary = tempSlot()
        compileFunction.instructions.push(instruction(opcode === 'NEW_OBJ' ? V2Opcode.NEW_OBJ : V2Opcode.NEW_ARR, temporary))
        emitStore(target, localRef(temporary))
      }
      continue
    }
    if (opcode === 'RET') {
      if (pendingArgs.length > 0) { throw new V2UnsupportedError('PUSH', 'not followed by CALL') }
      compileFunction.instructions.push(instruction(V2Opcode.RETURN, NO_SLOT, returnRef()))
      continue
    }
    if (opcode === 'EXIT') {
      compileFunction.instructions.push(instruction(V2Opcode.EXIT))
      continue
    }
    throw new V2UnsupportedError(opcode)
  }
  if (pendingArgs.length > 0) {
    throw new V2UnsupportedError('PUSH', 'not followed by CALL')
  }
}

const isBinaryV2Opcode = (op: V2Opcode): boolean => {
  return op >= V2Opcode.ADD && op <= V2Opcode.WNE_CONST && op !== V2Opcode.SUPER_ADD_STORE
}

const applyStaticSuperinstructions = (program: IV2Program): void => {
  const constantSpecializations = new Map<V2Opcode, V2Opcode>([
    [V2Opcode.ADD, V2Opcode.ADD_CONST], [V2Opcode.SUB, V2Opcode.SUB_CONST],
    [V2Opcode.MUL, V2Opcode.MUL_CONST], [V2Opcode.DIV, V2Opcode.DIV_CONST],
    [V2Opcode.MOD, V2Opcode.MOD_CONST], [V2Opcode.OR, V2Opcode.OR_CONST],
    [V2Opcode.AND, V2Opcode.AND_CONST], [V2Opcode.XOR, V2Opcode.XOR_CONST],
    [V2Opcode.SHL, V2Opcode.SHL_CONST], [V2Opcode.SHR, V2Opcode.SHR_CONST],
    [V2Opcode.ZSHR, V2Opcode.ZSHR_CONST], [V2Opcode.LT, V2Opcode.LT_CONST],
    [V2Opcode.GT, V2Opcode.GT_CONST], [V2Opcode.EQ, V2Opcode.EQ_CONST],
    [V2Opcode.NE, V2Opcode.NE_CONST], [V2Opcode.LE, V2Opcode.LE_CONST],
    [V2Opcode.GE, V2Opcode.GE_CONST], [V2Opcode.WEQ, V2Opcode.WEQ_CONST],
    [V2Opcode.WNE, V2Opcode.WNE_CONST],
  ])
  // First fold the very common `MOVE tmp, <constant>; ADD dst, ..., tmp`
  // shape emitted by the source-to-assembly compiler.  The MOVE is retained
  // for now (it may be live on another path), but the binary dispatch can use
  // its constant fast path directly.
  for (const meta of program.functions) {
    const end = meta.start + meta.length
    const targeted = new Set<number>()
    for (let i = meta.start; i < end; i++) {
      const item = program.instructions[i]
      if ((item.op === V2Opcode.JUMP || item.op === V2Opcode.JUMP_IF_TRUE ||
        item.op === V2Opcode.JUMP_IF_FALSE) && item.c >= meta.start && item.c <= end) {
        targeted.add(item.c)
      }
    }
    for (let i = meta.start + 1; i < end; i++) {
      const current = program.instructions[i]
      if (!constantSpecializations.has(current.op) || refKind(current.b) !== REF_LOCAL) {
        continue
      }
      if (targeted.has(i)) { continue }
      const previous = program.instructions[i - 1]
      if (previous.op === V2Opcode.MOVE && previous.dst === refIndex(current.b) &&
        refKind(previous.a) === REF_CONSTANT) {
        current.op = constantSpecializations.get(current.op)!
        current.b = previous.a
      }
    }
  }

  // Fuse a binary operation with the immediately following store.  This is
  // a real dispatch reduction: both instructions become one fixed-width
  // SUPER_BINARY_STORE instruction.  `flags` carries the original binary
  // opcode, while `c` is a tagged local/global destination reference.
  const oldInstructions = program.instructions
  const oldFunctions = program.functions
  const remappedAddresses = new Map<number, number>()
  const rebuiltInstructions: IV2Instruction[] = []
  const rebuiltFunctions: IV2FunctionMeta[] = []

  oldFunctions.forEach((meta): void => {
    const segment = oldInstructions.slice(meta.start, meta.start + meta.length)
    const targeted = new Set<number>()
    segment.forEach((item): void => {
      if ((item.op === V2Opcode.JUMP || item.op === V2Opcode.JUMP_IF_TRUE ||
        item.op === V2Opcode.JUMP_IF_FALSE) && item.c >= meta.start &&
        item.c <= meta.start + meta.length) {
        targeted.add(item.c)
      }
    })
    const localMap = new Array<number>(segment.length + 1)
    const output: IV2Instruction[] = []
    let index = 0
    while (index < segment.length) {
      localMap[index] = output.length
      const current = segment[index]
      const next = segment[index + 1]
      let fused: IV2Instruction | undefined
      if (next && isBinaryV2Opcode(current.op) && current.dst !== NO_SLOT &&
        !targeted.has(meta.start + index + 1)) {
        const resultRef = localRef(current.dst)
        if (next.op === V2Opcode.MOVE && next.a === resultRef) {
          fused = instruction(V2Opcode.SUPER_BINARY_STORE, NO_SLOT, current.a, current.b,
            localRef(next.dst))
        } else if (next.op === V2Opcode.SET_GLOBAL && next.b === resultRef) {
          fused = instruction(V2Opcode.SUPER_BINARY_STORE, NO_SLOT, current.a, current.b,
            globalRef(next.a))
        }
      }
      if (fused) {
        fused.flags = current.op
        output.push(fused)
        // A branch can never target the skipped instruction (checked above),
        // but map its boundary for the end-address remap anyway.
        localMap[index + 1] = output.length
        index += 2
      } else {
        output.push(current)
        index++
      }
    }
    localMap[segment.length] = output.length
    const newStart = rebuiltInstructions.length
    for (let i = 0; i <= segment.length; i++) {
      remappedAddresses.set(meta.start + i, newStart + localMap[i])
    }
    output.forEach((item): void => { rebuiltInstructions.push(item) })
    rebuiltFunctions.push({ ...meta, start: newStart, length: output.length })
  })

  rebuiltInstructions.forEach((item): void => {
    if (item.op === V2Opcode.JUMP || item.op === V2Opcode.JUMP_IF_TRUE ||
      item.op === V2Opcode.JUMP_IF_FALSE) {
      const target = remappedAddresses.get(item.c)
      if (target === undefined) { throw new Error(`Invalid V2 jump target ${item.c}`) }
      item.c = target
    }
  })
  program.instructions = rebuiltInstructions
  program.functions = rebuiltFunctions
}

interface IV2LoopKernelCandidate {
  start: number
  end: number
  instruction: IV2Instruction
}

const isLocal = (value: number, slot: number): boolean => {
  return refKind(value) === REF_LOCAL && refIndex(value) === slot
}

const isLocalOrGlobal = (value: number): boolean => {
  return refKind(value) === REF_LOCAL || refKind(value) === REF_GLOBAL
}

const isConstantValue = (value: number, constants: any[], expected: any): boolean => {
  return refKind(value) === REF_CONSTANT && constants[refIndex(value)] === expected
}

/**
 * Recognize the loop shape emitted for a numeric accumulator.  The matcher is
 * deliberately strict: if any observable operation is present, the generic
 * bytecode loop remains in place.
 */
const findLoopKernel = (
  segment: IV2Instruction[],
  functionStart: number,
  constants: any[],
): IV2LoopKernelCandidate | undefined => {
  for (let start = 0; start + 12 < segment.length; start++) {
    const loadCounter = segment[start]
    const loadLimit = segment[start + 1]
    const compare = segment[start + 2]
    const branch = segment[start + 3]
    const loadAccumulator = segment[start + 4]
    const loadBodyCounter = segment[start + 5]
    const addAccumulator = segment[start + 6]
    const zero = segment[start + 7]
    const normalize = segment[start + 8]
    const updateCounter = segment[start + 9]
    const one = segment[start + 10]
    const increment = segment[start + 11]
    const backJump = segment[start + 12]
    if (loadCounter.op !== V2Opcode.MOVE || loadLimit.op !== V2Opcode.MOVE ||
      loadCounter.dst === NO_SLOT || loadLimit.dst === NO_SLOT ||
      !isLocalOrGlobal(loadCounter.a) ||
      !isLocalOrGlobal(loadLimit.a) && refKind(loadLimit.a) !== REF_CONSTANT ||
      compare.op !== V2Opcode.LT && compare.op !== V2Opcode.LT_CONST ||
      !isLocal(compare.a, loadCounter.dst) || compare.dst === NO_SLOT ||
      (compare.b !== loadLimit.a && compare.b !== localRef(loadLimit.dst)) ||
      branch.op !== V2Opcode.JUMP_IF_FALSE || !isLocal(branch.a, compare.dst) ||
      branch.c <= functionStart + start + 12 ||
      loadAccumulator.op !== V2Opcode.MOVE || loadAccumulator.dst === NO_SLOT ||
      !isLocalOrGlobal(loadAccumulator.a) || loadAccumulator.a === loadCounter.a ||
      loadBodyCounter.op !== V2Opcode.MOVE || loadBodyCounter.dst === NO_SLOT ||
      loadBodyCounter.a !== loadCounter.a ||
      addAccumulator.op !== V2Opcode.ADD && addAccumulator.op !== V2Opcode.ADD_CONST ||
      !isLocal(addAccumulator.a, loadAccumulator.dst) ||
      !isLocal(addAccumulator.b, loadBodyCounter.dst) ||
      zero.op !== V2Opcode.MOVE || !isConstantValue(zero.a, constants, 0) ||
      normalize.op !== V2Opcode.SUPER_BINARY_STORE || normalize.flags !== V2Opcode.OR_CONST ||
      !isLocal(normalize.a, loadAccumulator.dst) || normalize.c !== loadAccumulator.a ||
      !isConstantValue(normalize.b, constants, 0) ||
      updateCounter.op !== V2Opcode.MOVE || updateCounter.dst === NO_SLOT ||
      updateCounter.a !== loadCounter.a ||
      one.op !== V2Opcode.MOVE || !isConstantValue(one.a, constants, 1) ||
      increment.op !== V2Opcode.SUPER_BINARY_STORE || increment.flags !== V2Opcode.ADD_CONST ||
      !isLocal(increment.a, updateCounter.dst) || increment.c !== loadCounter.a ||
      !isConstantValue(increment.b, constants, 1) ||
      backJump.op !== V2Opcode.JUMP || backJump.c !== functionStart + start) {
      continue
    }
    if (updateCounter.dst > 0xff || loadAccumulator.dst > 0xff) {
      continue
    }
    let hasInteriorTarget = false
    segment.forEach((item): void => {
      if ((item.op === V2Opcode.JUMP || item.op === V2Opcode.JUMP_IF_TRUE ||
        item.op === V2Opcode.JUMP_IF_FALSE) && item.c > functionStart + start &&
        item.c <= functionStart + start + 12) {
        hasInteriorTarget = true
      }
    })
    if (hasInteriorTarget) { continue }
    const kernel = instruction(
      V2Opcode.LOOP_ACCUMULATE,
      loadAccumulator.dst,
      loadCounter.a,
      loadLimit.a,
      loadAccumulator.a,
    )
    kernel.flags = loadCounter.dst
    return { start, end: start + 12, instruction: kernel }
  }
  return undefined
}

const applyLoopKernels = (program: IV2Program): void => {
  const oldInstructions = program.instructions
  const oldFunctions = program.functions
  const remappedAddresses = new Map<number, number>()
  const rebuiltInstructions: IV2Instruction[] = []
  const rebuiltFunctions: IV2FunctionMeta[] = []

  oldFunctions.forEach((meta): void => {
    const segment = oldInstructions.slice(meta.start, meta.start + meta.length)
    const candidate = findLoopKernel(segment, meta.start, program.constants)
    const localMap = new Array<number>(segment.length + 1)
    const output: IV2Instruction[] = []
    let index = 0
    while (index < segment.length) {
      localMap[index] = output.length
      if (candidate && index === candidate.start) {
        for (let consumed = candidate.start + 1; consumed <= candidate.end; consumed++) {
          localMap[consumed] = output.length
        }
        output.push(candidate.instruction)
        index = candidate.end + 1
      } else {
        output.push(segment[index])
        index++
      }
    }
    localMap[segment.length] = output.length
    const newStart = rebuiltInstructions.length
    for (let i = 0; i <= segment.length; i++) {
      remappedAddresses.set(meta.start + i, newStart + localMap[i])
    }
    output.forEach((item): void => { rebuiltInstructions.push(item) })
    rebuiltFunctions.push({ ...meta, start: newStart, length: output.length })
  })

  rebuiltInstructions.forEach((item): void => {
    if (item.op === V2Opcode.JUMP || item.op === V2Opcode.JUMP_IF_TRUE ||
      item.op === V2Opcode.JUMP_IF_FALSE) {
      const target = remappedAddresses.get(item.c)
      if (target === undefined) { throw new Error(`Invalid V2 jump target ${item.c}`) }
      item.c = target
    }
  })
  program.instructions = rebuiltInstructions
  program.functions = rebuiltFunctions
}

export const compileV2FromJavaScript = (source: string): IV2Program => {
  return compileV2FromAssembly(generateAssemblyFromJs(source))
}

export const compileV2FromAssembly = (assembly: string): IV2Program => {
  const parsed = parseAssembler(assembly)
  const functionIndexes = new Map<string, number>()
  parsed.forEach((func, index): void => { functionIndexes.set(func.functionName, index) })
  const globalNames: string[] = []
  const globalSet = new Set<string>()
  const main = parsed.find((func): boolean => func.functionName === '@@main') || parsed[0]
  for (const code of main.instructions) {
    if (code[0] === 'GLOBAL_BIND' && !globalSet.has(code[1])) {
      globalSet.add(code[1])
      globalNames.push(code[1])
    }
  }
  const globalIndexes = new Map<string, number>()
  globalNames.forEach((name, index): void => { globalIndexes.set(name, index) })
  const constantTable = makeConstantTable()
  // Reserve undefined at a stable index; CALL uses it as an unbound receiver.
  constantTable.get(void 0)
  const callSites: IV2CallSite[] = []
  const compileFunctions = parsed.map(buildFunctionLocals)
  compileFunctions.forEach((func): void => {
    lowerV2Function(func, functionIndexes, globalIndexes, constantTable, callSites)
  })
  const instructions: IV2Instruction[] = []
  const functions: IV2FunctionMeta[] = []
  compileFunctions.forEach((func): void => {
    const start = instructions.length
    func.instructions.forEach((item): void => { instructions.push(item) })
    functions.push({
      start,
      length: func.instructions.length,
      numArgs: func.params.length,
      slotCount: func.slotCount,
      flags: func.flags,
    })
  })
  functions.forEach((meta, functionIndex): void => {
    const compileFunction = compileFunctions[functionIndex]
    for (let i = 0; i < meta.length; i++) {
      const item = instructions[meta.start + i]
      if (item.targetLabel) {
        const localTarget = compileFunction.labels[item.targetLabel]
        if (localTarget === undefined) {
          throw new Error(`Unknown V2 label ${item.targetLabel}`)
        }
        item.c = meta.start + localTarget
        delete item.targetLabel
      }
    }
  })
  const program: IV2Program = {
    version: V2_VERSION,
    entryFunction: Math.max(0, parsed.findIndex((func): boolean => func.functionName === '@@main')),
    instructions,
    functions,
    constants: constantTable.constants,
    callSites,
    globalNames,
  }
  applyStaticSuperinstructions(program)
  applyLoopKernels(program)
  return program
}

interface IV2Frame {
  functionIndex: number
  ip: number
  slots: any[]
  returnValue: any
  thisValue: any
}

interface IV2PropertyCache {
  object: any
  key: string | number | symbol
  prototype: any
  value: any
}

interface IV2CallCache {
  functionValue: any
  functionIndex?: number
  args: any[]
}

interface IV2TypedFallback {
  opcode: V2Opcode
  inFlags: boolean
}

const V2_INSTRUCTION_WORDS = 4

/** Pack the public instruction objects once at VM construction time. */
const packV2Instructions = (instructions: IV2Instruction[]): Uint32Array => {
  const packed = new Uint32Array(instructions.length * V2_INSTRUCTION_WORDS)
  instructions.forEach((item, index): void => {
    const offset = index * V2_INSTRUCTION_WORDS
    packed[offset] = (item.op | (item.flags << 8) | (item.dst << 16)) >>> 0
    packed[offset + 1] = item.a >>> 0
    packed[offset + 2] = item.b >>> 0
    packed[offset + 3] = item.c >>> 0
  })
  return packed
}

const isV2Function = (value: any): value is { __v2Function: number } => {
  return !!value && typeof value === 'object' && typeof value.__v2Function === 'number'
}

export class RegisterVirtualMachine {
  public isRunning: boolean = false
  public result: any
  public readonly stats = {
    callCacheHits: 0,
    loopKernelHits: 0,
    numericFastPathHits: 0,
    propertyCacheHits: 0,
  }
  private readonly globals: any[]
  private readonly packedCode: Uint32Array
  private readonly frames: IV2Frame[] = []
  private readonly hostFunctions = new Map<Function, number>()
  private readonly guestFunctions = new Map<number, Function>()
  private readonly callCaches = new Map<number, IV2CallCache>()
  private readonly propertyCaches = new Map<number, IV2PropertyCache>()
  private readonly typedFallbacks = new Map<number, IV2TypedFallback>()
  private readonly vmObjects = new WeakSet<object>()
  private returnValue: any
  private frame: IV2Frame

  constructor(public program: IV2Program, public ctx: any = {}) {
    this.packedCode = packV2Instructions(program.instructions)
    this.globals = new Array(program.globalNames.length)
    program.globalNames.forEach((name, index): void => {
      if (!Object.prototype.hasOwnProperty.call(ctx, name)) {
        Object.defineProperty(ctx, name, {
          configurable: false,
          enumerable: true,
          get: (): any => this.toHostValue(this.globals[index]),
          set: (value: any): void => { this.globals[index] = this.fromHostValue(value) },
        })
      }
    })
    this.frame = {
      functionIndex: program.entryFunction,
      ip: program.functions[program.entryFunction].start,
      slots: new Array(program.functions[program.entryFunction].slotCount),
      returnValue: undefined,
      thisValue: ctx,
    }
  }

  public reset(): void {
    const entry = this.program.functions[this.program.entryFunction]
    this.frames.length = 0
    this.globals.fill(undefined)
    this.frame = {
      functionIndex: this.program.entryFunction,
      ip: entry.start,
      slots: new Array(entry.slotCount),
      returnValue: undefined,
      thisValue: this.ctx,
    }
    this.returnValue = undefined
    this.result = undefined
    this.isRunning = false
    this.callCaches.clear()
    this.propertyCaches.clear()
    this.stats.callCacheHits = 0
    this.stats.loopKernelHits = 0
    this.stats.numericFastPathHits = 0
    this.stats.propertyCacheHits = 0
  }

  public run(): any {
    this.isRunning = true
    // Host objects can be changed between runs; never carry a stale property
    // value into a new execution.
    this.propertyCaches.clear()
    while (this.isRunning) {
      this.executeOne()
    }
    return this.result
  }

  private toHostValue(value: any): any {
    if (isV2Function(value)) {
      const functionIndex = value.__v2Function
      const existing = this.guestFunctions.get(functionIndex)
      if (existing) { return existing }
      const callable = (...args: any[]): any => this.callFromHost(functionIndex, this.ctx, args)
      this.hostFunctions.set(callable, functionIndex)
      this.guestFunctions.set(functionIndex, callable)
      return callable
    }
    return value
  }

  private fromHostValue(value: any): any {
    const functionIndex = typeof value === 'function' ? this.hostFunctions.get(value) : undefined
    return functionIndex === undefined ? value : { __v2Function: functionIndex }
  }

  private callFromHost(functionIndex: number, receiver: any, args: any[]): any {
    const oldFrame = this.frame
    this.propertyCaches.clear()
    this.pushFrame(functionIndex, args, receiver, undefined)
    this.isRunning = true
    while (this.frames.length > 0) {
      this.executeOne()
    }
    this.frame = oldFrame
    this.propertyCaches.clear()
    return this.returnValue
  }

  private pushFrame(functionIndex: number, args: any[], receiver: any, returnTarget: number | undefined): void {
    this.frames.push(this.frame)
    const meta = this.program.functions[functionIndex]
    const slots = new Array(meta.slotCount)
    for (let i = 0; i < meta.numArgs; i++) {
      slots[i] = args[i]
    }
    this.frame = {
      functionIndex,
      ip: meta.start,
      slots,
      returnValue: returnTarget,
      thisValue: receiver,
    }
  }

  private popFrame(): void {
    const completed = this.frame
    const caller = this.frames.pop()
    if (!caller) {
      this.result = this.returnValue
      this.isRunning = false
      return
    }
    this.frame = caller
    if (completed.returnValue !== undefined && completed.returnValue !== NO_SLOT) {
      this.setRef(completed.returnValue, this.returnValue)
    }
  }

  private getRef(value: number): any {
    switch (refKind(value)) {
      case REF_LOCAL: return this.frame.slots[refIndex(value)]
      case REF_CONSTANT: return this.program.constants[refIndex(value)]
      case REF_GLOBAL: return this.globals[refIndex(value)]
      case REF_RETURN: return this.returnValue
      default: return undefined
    }
  }

  private setRef(target: number, value: any): void {
    switch (refKind(target)) {
      case REF_LOCAL: this.frame.slots[refIndex(target)] = value; return
      case REF_GLOBAL: this.globals[refIndex(target)] = this.fromHostValue(value); return
      case REF_RETURN: this.returnValue = value; return
      default: throw new Error('Invalid V2 destination')
    }
  }

  private isCacheablePropertyKey(key: any): key is string | number | symbol {
    const type = typeof key
    return (type === 'string' || type === 'number' || type === 'symbol') && key === key
  }

  private isCacheablePropertyObject(object: any): boolean {
    if (object === null || (typeof object !== 'object' && typeof object !== 'function')) {
      return false
    }
    if (!this.vmObjects.has(object)) { return false }
    const prototype = Object.getPrototypeOf(object)
    return prototype === Object.prototype || prototype === null
  }

  private getProperty(object: any, key: any, instructionIp: number): any {
    if (!this.isCacheablePropertyKey(key) || !this.isCacheablePropertyObject(object)) {
      return object[key]
    }
    const prototype = Object.getPrototypeOf(object)
    const cached = this.propertyCaches.get(instructionIp)
    if (cached && cached.object === object && cached.key === key && cached.prototype === prototype) {
      this.stats.propertyCacheHits++
      return cached.value
    }
    const value = object[key]
    const descriptor = Object.getOwnPropertyDescriptor(object, key)
    if (descriptor && Object.prototype.hasOwnProperty.call(descriptor, 'value')) {
      this.propertyCaches.set(instructionIp, { object, key, prototype, value })
    }
    return value
  }

  private setProperty(object: any, key: any, value: any): void {
    Reflect.set(object, key, value)
    let refreshed = false
    this.propertyCaches.forEach((cached): void => {
      if (cached.object === object && cached.key === key) {
        cached.value = object[key]
        refreshed = true
      }
    })
    if (refreshed) {
      // A previously cached own data property keeps the object's shape; only
      // its value changed.
      return
    }
    // A new property, accessor, prototype write, or exotic object may change
    // lookup semantics, so invalidate conservatively.
    this.propertyCaches.clear()
  }

  private invokeHostFunction(fn: Function, receiver: any, args: any[], isNewExpression: boolean): any {
    if (isNewExpression) {
      return new (fn as any)(...args)
    }
    return Reflect.apply(fn, receiver === void 0 ? void 0 : receiver, args)
  }

  private executeBinary(op: V2Opcode, left: any, right: any): any {
    switch (op) {
      case V2Opcode.ADD:
      case V2Opcode.ADD_CONST: return left + right
      case V2Opcode.SUB:
      case V2Opcode.SUB_CONST: return left - right
      case V2Opcode.MUL:
      case V2Opcode.MUL_CONST: return left * right
      case V2Opcode.DIV:
      case V2Opcode.DIV_CONST: return left / right
      case V2Opcode.MOD:
      case V2Opcode.MOD_CONST: return left % right
      case V2Opcode.OR:
      case V2Opcode.OR_CONST: return left | right
      case V2Opcode.AND:
      case V2Opcode.AND_CONST: return left & right
      case V2Opcode.XOR:
      case V2Opcode.XOR_CONST: return left ^ right
      case V2Opcode.SHL:
      case V2Opcode.SHL_CONST: return left << right
      case V2Opcode.SHR:
      case V2Opcode.SHR_CONST: return left >> right
      case V2Opcode.ZSHR:
      case V2Opcode.ZSHR_CONST: return left >>> right
      case V2Opcode.LT:
      case V2Opcode.LT_CONST: return left < right
      case V2Opcode.GT:
      case V2Opcode.GT_CONST: return left > right
      case V2Opcode.EQ:
      case V2Opcode.EQ_CONST: return left === right
      case V2Opcode.NE:
      case V2Opcode.NE_CONST: return left !== right
      case V2Opcode.LE:
      case V2Opcode.LE_CONST: return left <= right
      case V2Opcode.GE:
      case V2Opcode.GE_CONST: return left >= right
      case V2Opcode.WEQ:
      case V2Opcode.WEQ_CONST: return left == right // tslint:disable-line: triple-equals
      case V2Opcode.WNE:
      case V2Opcode.WNE_CONST: return left != right // tslint:disable-line: triple-equals
      default: throw new Error(`Unsupported V2 binary opcode ${op}`)
    }
  }

  private executeI32Binary(op: V2Opcode, left: number, right: number): any {
    switch (op) {
      case V2Opcode.ADD_I32: return left + right
      case V2Opcode.SUB_I32: return left - right
      case V2Opcode.MUL_I32: return left * right
      case V2Opcode.MOD_I32: return left % right
      case V2Opcode.OR_I32: return left | right
      case V2Opcode.AND_I32: return left & right
      case V2Opcode.XOR_I32: return left ^ right
      case V2Opcode.SHL_I32: return left << right
      case V2Opcode.SHR_I32: return left >> right
      case V2Opcode.ZSHR_I32: return left >>> right
      case V2Opcode.LT_I32: return left < right
      case V2Opcode.GT_I32: return left > right
      case V2Opcode.EQ_I32: return left === right
      case V2Opcode.NE_I32: return left !== right
      case V2Opcode.LE_I32: return left <= right
      case V2Opcode.GE_I32: return left >= right
      case V2Opcode.WEQ_I32: return left == right // tslint:disable-line: triple-equals
      case V2Opcode.WNE_I32: return left != right // tslint:disable-line: triple-equals
      default: return this.executeBinary(op, left, right)
    }
  }

  private executeBinaryFast(op: V2Opcode, left: any, right: any): any {
    if (isInt32Value(left) && isInt32Value(right)) {
      const specialized = i32OpcodeFor(op)
      if (specialized !== undefined) {
        this.stats.numericFastPathHits++
        return this.executeI32Binary(specialized, left, right)
      }
    }
    return this.executeBinary(op, left, right)
  }

  private executeAdaptiveBinary(
    op: V2Opcode,
    left: any,
    right: any,
    offset: number,
    packed: number,
    inFlags: boolean,
  ): any {
    if (isI32Opcode(op)) {
      if (isInt32Value(left) && isInt32Value(right)) {
        this.stats.numericFastPathHits++
        return this.executeI32Binary(op, left, right)
      }
      const fallback = this.typedFallbacks.get(offset)
      const original = fallback ? fallback.opcode : genericOpcodeForI32(op)
      if (inFlags) {
        this.packedCode[offset] = ((packed & 0xffff00ff) | (original << 8)) >>> 0
      } else {
        this.packedCode[offset] = ((packed & 0xffffff00) | original) >>> 0
      }
      this.typedFallbacks.delete(offset)
      return this.executeBinary(original, left, right)
    }
    const specialized = i32OpcodeFor(op)
    if (specialized !== undefined && isInt32Value(left) && isInt32Value(right)) {
      if (inFlags) {
        this.packedCode[offset] = ((packed & 0xffff00ff) | (specialized << 8)) >>> 0
      } else {
        this.packedCode[offset] = ((packed & 0xffffff00) | specialized) >>> 0
      }
      this.typedFallbacks.set(offset, { opcode: op, inFlags })
      return this.executeI32Binary(specialized, left, right)
    }
    return this.executeBinary(op, left, right)
  }

  private executeOne(): void {
    const frame = this.frame
    const meta = this.program.functions[frame.functionIndex]
    if (frame.ip >= meta.start + meta.length) {
      this.returnValue = frame.returnValue
      this.popFrame()
      return
    }
    const offset = frame.ip++ * V2_INSTRUCTION_WORDS
    const packed = this.packedCode[offset]
    const op = packed & 0xff
    const flags = (packed >>> 8) & 0xff
    const dst = packed >>> 16
    const a = this.packedCode[offset + 1]
    const b = this.packedCode[offset + 2]
    const c = this.packedCode[offset + 3]
    switch (op) {
      case V2Opcode.NOP:
        return
      case V2Opcode.MOVE:
        frame.slots[dst] = this.getRef(a)
        return
      case V2Opcode.SET_GLOBAL:
        this.globals[a] = this.fromHostValue(this.getRef(b))
        return
      case V2Opcode.SET_RETURN:
        this.returnValue = this.getRef(a)
        return
      case V2Opcode.LOAD_CTX:
        frame.slots[dst] = this.ctx[this.getRef(a)]
        return
      case V2Opcode.SET_CTX:
        this.ctx[this.getRef(a)] = this.toHostValue(this.getRef(b))
        return
      case V2Opcode.ADD:
      case V2Opcode.SUB:
      case V2Opcode.MUL:
      case V2Opcode.DIV:
      case V2Opcode.MOD:
      case V2Opcode.OR:
      case V2Opcode.AND:
      case V2Opcode.XOR:
      case V2Opcode.SHL:
      case V2Opcode.SHR:
      case V2Opcode.ZSHR:
      case V2Opcode.LT:
      case V2Opcode.GT:
      case V2Opcode.EQ:
      case V2Opcode.NE:
      case V2Opcode.LE:
      case V2Opcode.GE:
      case V2Opcode.WEQ:
      case V2Opcode.WNE:
      case V2Opcode.ADD_CONST:
      case V2Opcode.SUB_CONST:
      case V2Opcode.MUL_CONST:
      case V2Opcode.DIV_CONST:
      case V2Opcode.MOD_CONST:
      case V2Opcode.OR_CONST:
      case V2Opcode.AND_CONST:
      case V2Opcode.XOR_CONST:
      case V2Opcode.SHL_CONST:
      case V2Opcode.SHR_CONST:
      case V2Opcode.ZSHR_CONST:
      case V2Opcode.LT_CONST:
      case V2Opcode.GT_CONST:
      case V2Opcode.EQ_CONST:
      case V2Opcode.NE_CONST:
      case V2Opcode.LE_CONST:
      case V2Opcode.GE_CONST:
      case V2Opcode.WEQ_CONST:
      case V2Opcode.WNE_CONST:
        frame.slots[dst] = this.executeBinary(op as V2Opcode, this.getRef(a), this.getRef(b))
        return
      case V2Opcode.ADD_I32:
      case V2Opcode.SUB_I32:
      case V2Opcode.MUL_I32:
      case V2Opcode.MOD_I32:
      case V2Opcode.OR_I32:
      case V2Opcode.AND_I32:
      case V2Opcode.XOR_I32:
      case V2Opcode.SHL_I32:
      case V2Opcode.SHR_I32:
      case V2Opcode.ZSHR_I32:
      case V2Opcode.LT_I32:
      case V2Opcode.GT_I32:
      case V2Opcode.EQ_I32:
      case V2Opcode.NE_I32:
      case V2Opcode.LE_I32:
      case V2Opcode.GE_I32:
      case V2Opcode.WEQ_I32:
      case V2Opcode.WNE_I32:
        frame.slots[dst] = this.executeAdaptiveBinary(
          op as V2Opcode, this.getRef(a), this.getRef(b), offset, packed, false,
        )
        return
      case V2Opcode.SUPER_ADD_STORE: {
        this.setRef(c, this.getRef(a) + this.getRef(b))
        return
      }
      case V2Opcode.SUPER_BINARY_STORE: {
        const value = this.executeBinaryFast(flags as V2Opcode, this.getRef(a), this.getRef(b))
        this.setRef(c, value)
        return
      }
      case V2Opcode.LOOP_ACCUMULATE: {
        let counter = this.getRef(a)
        const limit = this.getRef(b)
        let accumulator = this.getRef(c)
        while (counter < limit) {
          accumulator = (accumulator + counter) | 0
          counter = counter + 1
        }
        this.setRef(c, accumulator)
        this.setRef(a, counter)
        frame.slots[dst] = accumulator
        frame.slots[flags] = counter
        if (refKind(a) === REF_LOCAL) {
          frame.slots[refIndex(a)] = counter
        }
        this.stats.loopKernelHits++
        return
      }
      case V2Opcode.GET_PROP:
        frame.slots[dst] = this.getProperty(this.getRef(a), this.getRef(b), frame.ip - 1)
        return
      case V2Opcode.SET_PROP:
        this.setProperty(this.getRef(a), this.getRef(b), this.getRef(c))
        return
      case V2Opcode.DEF_DATA:
        Object.defineProperty(this.getRef(a), this.getRef(b), {
          configurable: true,
          enumerable: true,
          value: this.getRef(c),
          writable: true,
        })
        this.propertyCaches.clear()
        return
      case V2Opcode.NEW_OBJ:
        frame.slots[dst] = {}
        this.vmObjects.add(frame.slots[dst])
        return
      case V2Opcode.NEW_ARR:
        frame.slots[dst] = []
        this.vmObjects.add(frame.slots[dst])
        return
      case V2Opcode.MAKE_FUNC:
        frame.slots[dst] = { __v2Function: c }
        return
      case V2Opcode.MAKE_FUNC_GLOBAL:
        this.globals[a] = { __v2Function: c }
        return
      case V2Opcode.MAKE_FUNC_RETURN:
        this.returnValue = { __v2Function: c }
        return
      case V2Opcode.JUMP:
        frame.ip = c
        return
      case V2Opcode.JUMP_IF_TRUE:
        if (this.getRef(a)) { frame.ip = c }
        return
      case V2Opcode.JUMP_IF_FALSE:
        if (!this.getRef(a)) { frame.ip = c }
        return
      case V2Opcode.CALL: {
        const fn = this.getRef(a)
        const receiver = this.getRef(b)
        const callSite = this.program.callSites[c]
        const instructionIp = frame.ip - 1
        let cache = this.callCaches.get(instructionIp)
        if (!cache || cache.functionValue !== fn || cache.args.length !== callSite.args.length) {
          cache = {
            functionValue: fn,
            functionIndex: isV2Function(fn) ? fn.__v2Function : undefined,
            args: new Array(callSite.args.length),
          }
          this.callCaches.set(instructionIp, cache)
        } else {
          this.stats.callCacheHits++
        }
        for (let i = 0; i < callSite.args.length; i++) {
          cache.args[i] = this.getRef(callSite.args[i])
        }
        const args = cache.args
        const functionIndex = cache.functionIndex
        if (functionIndex !== undefined) {
          this.pushFrame(functionIndex, args, receiver, NO_SLOT)
          return
        }
        if (typeof fn !== 'function') { throw new TypeError('Value is not a function') }
        this.returnValue = this.invokeHostFunction(fn, receiver, args, callSite.isNewExpression)
        this.propertyCaches.clear()
        return
      }
      case V2Opcode.RETURN:
        this.returnValue = this.getRef(a)
        this.popFrame()
        return
      case V2Opcode.EXIT:
        this.result = this.returnValue
        this.isRunning = false
        return
      default:
        throw new Error(`Unknown V2 opcode ${op}`)
    }
  }
}

const writeStringData = (strings: string[]): { data: Uint8Array, offsets: number[] } => {
  const sizes = strings.map((value): number => 4 + value.length * 2)
  const data = new Uint8Array(sizes.reduce((sum, size): number => sum + size, 0))
  const view = new DataView(data.buffer)
  const offsets: number[] = []
  let offset = 0
  strings.forEach((value): void => {
    offsets.push(offset)
    view.setUint32(offset, value.length, true)
    for (let i = 0; i < value.length; i++) {
      view.setUint16(offset + 4 + i * 2, value.charCodeAt(i), true)
    }
    offset += 4 + value.length * 2
  })
  return { data, offsets }
}

const collectStrings = (program: IV2Program): { values: string[], indexes: Map<string, number> } => {
  const values: string[] = []
  const indexes = new Map<string, number>()
  const add = (value: string): number => {
    const existing = indexes.get(value)
    if (existing !== undefined) { return existing }
    const index = values.length
    values.push(value)
    indexes.set(value, index)
    return index
  }
  program.constants.forEach((value): void => { if (typeof value === 'string') { add(value) } })
  program.globalNames.forEach(add)
  return { values, indexes }
}

export const serializeV2Program = (program: IV2Program): ArrayBuffer => {
  const strings = collectStrings(program)
  const stringData = writeStringData(strings.values)
  const headerBytes = HEADER_WORDS * 4
  const functionOffset = headerBytes
  const functionBytes = program.functions.length * FUNCTION_WORDS * 4
  const constantOffset = functionOffset + functionBytes
  const constantBytes = program.constants.length * CONSTANT_WORDS * 4
  const callSiteOffset = constantOffset + constantBytes
  const callSiteBytes = program.callSites.reduce((size, site): number => size + 16 + site.args.length * 4, 0)
  const globalNameOffset = callSiteOffset + callSiteBytes
  const globalNameBytes = program.globalNames.length * 4
  const codeOffset = globalNameOffset + globalNameBytes
  const codeBytes = program.instructions.length * 16
  const stringOffset = codeOffset + codeBytes
  const output = new ArrayBuffer(stringOffset + stringData.data.byteLength)
  const view = new DataView(output)
  const header = [
    V2_MAGIC, V2_VERSION, program.entryFunction, program.functions.length,
    program.instructions.length, program.constants.length, program.callSites.length,
    program.globalNames.length, functionOffset, constantOffset, callSiteOffset,
    globalNameOffset, codeOffset, stringOffset, stringData.data.byteLength,
  ]
  header.forEach((value, index): void => view.setUint32(index * 4, value >>> 0, true))
  program.functions.forEach((meta, index): void => {
    const offset = functionOffset + index * FUNCTION_WORDS * 4
    ;[meta.start, meta.length, meta.numArgs, meta.slotCount, meta.flags, 0xffffffff]
      .forEach((value, word): void => view.setUint32(offset + word * 4, value >>> 0, true))
  })
  program.constants.forEach((value, index): void => {
    const offset = constantOffset + index * CONSTANT_WORDS * 4
    if (value === undefined) {
      view.setUint32(offset, 0, true)
    } else if (value === null) {
      view.setUint32(offset, 1, true)
    } else if (typeof value === 'boolean') {
      view.setUint32(offset, 2, true)
      view.setUint32(offset + 4, value ? 1 : 0, true)
    } else if (typeof value === 'number') {
      view.setUint32(offset, 3, true)
      view.setFloat64(offset + 4, value, true)
    } else if (typeof value === 'string') {
      view.setUint32(offset, 4, true)
      const stringIndex = strings.indexes.get(value)!
      view.setUint32(offset + 4, stringData.offsets[stringIndex], true)
      view.setUint32(offset + 8, value.length, true)
    } else {
      throw new Error(`Cannot serialize V2 constant ${typeof value}`)
    }
  })
  let callOffset = callSiteOffset
  program.callSites.forEach((site): void => {
    view.setUint32(callOffset, site.args.length, true)
    view.setUint32(callOffset + 4, site.isNewExpression ? 1 : 0, true)
    view.setUint32(callOffset + 8, 16, true)
    view.setUint32(callOffset + 12, 0, true)
    site.args.forEach((arg, index): void => view.setUint32(callOffset + 16 + index * 4, arg >>> 0, true))
    callOffset += 16 + site.args.length * 4
  })
  program.globalNames.forEach((name, index): void => {
    const stringIndex = strings.indexes.get(name)!
    view.setUint32(globalNameOffset + index * 4, stringData.offsets[stringIndex], true)
  })
  program.instructions.forEach((item, index): void => {
    const offset = codeOffset + index * 16
    view.setUint32(offset, (item.op | (item.flags << 8) | (item.dst << 16)) >>> 0, true)
    view.setUint32(offset + 4, item.a >>> 0, true)
    view.setUint32(offset + 8, item.b >>> 0, true)
    view.setUint32(offset + 12, item.c >>> 0, true)
  })
  new Uint8Array(output, stringOffset).set(stringData.data)
  return output
}

export const deserializeV2Program = (buffer: ArrayBuffer): IV2Program => {
  const view = new DataView(buffer)
  if (view.getUint32(0, true) !== V2_MAGIC) { throw new Error('Not a V2 bytecode buffer') }
  if (view.getUint32(4, true) !== V2_VERSION) { throw new Error('Unsupported V2 bytecode version') }
  const entryFunction = view.getUint32(8, true)
  const functionCount = view.getUint32(12, true)
  const instructionCount = view.getUint32(16, true)
  const constantCount = view.getUint32(20, true)
  const callSiteCount = view.getUint32(24, true)
  const globalCount = view.getUint32(28, true)
  const functionOffset = view.getUint32(32, true)
  const constantOffset = view.getUint32(36, true)
  const callSiteOffset = view.getUint32(40, true)
  const globalNameOffset = view.getUint32(44, true)
  const codeOffset = view.getUint32(48, true)
  const stringOffset = view.getUint32(52, true)
  const readString = (index: number): string => {
    const start = stringOffset + index
    const length = view.getUint32(start, true)
    let result = ''
    for (let i = 0; i < length; i++) {
      result += String.fromCharCode(view.getUint16(start + 4 + i * 2, true))
    }
    return result
  }
  const functions: IV2FunctionMeta[] = []
  for (let i = 0; i < functionCount; i++) {
    const offset = functionOffset + i * FUNCTION_WORDS * 4
    functions.push({
      start: view.getUint32(offset, true),
      length: view.getUint32(offset + 4, true),
      numArgs: view.getUint32(offset + 8, true),
      slotCount: view.getUint32(offset + 12, true),
      flags: view.getUint32(offset + 16, true),
    })
  }
  const constants: any[] = []
  for (let i = 0; i < constantCount; i++) {
    const offset = constantOffset + i * CONSTANT_WORDS * 4
    const kind = view.getUint32(offset, true)
    if (kind === 0) constants.push(undefined)
    else if (kind === 1) constants.push(null)
    else if (kind === 2) constants.push(view.getUint32(offset + 4, true) !== 0)
    else if (kind === 3) constants.push(view.getFloat64(offset + 4, true))
    else if (kind === 4) constants.push(readString(view.getUint32(offset + 4, true)))
    else throw new Error(`Unknown V2 constant kind ${kind}`)
  }
  const callSites: IV2CallSite[] = []
  let callOffset = callSiteOffset
  for (let i = 0; i < callSiteCount; i++) {
    const argc = view.getUint32(callOffset, true)
    const args: number[] = []
    for (let j = 0; j < argc; j++) args.push(view.getUint32(callOffset + 16 + j * 4, true))
    callSites.push({ args, isNewExpression: view.getUint32(callOffset + 4, true) !== 0 })
    callOffset += 16 + argc * 4
  }
  const globalNames: string[] = []
  for (let i = 0; i < globalCount; i++) {
    const stringDataOffset = view.getUint32(globalNameOffset + i * 4, true)
    globalNames.push(readString(stringDataOffset))
  }
  const instructions: IV2Instruction[] = []
  for (let i = 0; i < instructionCount; i++) {
    const offset = codeOffset + i * 16
    const packed = view.getUint32(offset, true)
    instructions.push({
      op: packed & 0xff,
      flags: (packed >>> 8) & 0xff,
      dst: packed >>> 16,
      a: view.getUint32(offset + 4, true),
      b: view.getUint32(offset + 8, true),
      c: view.getUint32(offset + 12, true),
    })
  }
  return { version: V2_VERSION, entryFunction, instructions, functions, constants, callSites, globalNames }
}

export const createRegisterVMFromArrayBuffer = (buffer: ArrayBuffer, ctx: any = {}): RegisterVirtualMachine => {
  return new RegisterVirtualMachine(deserializeV2Program(buffer), ctx)
}

export const createRegisterVMFromJavaScript = (source: string, ctx: any = {}): RegisterVirtualMachine => {
  return new RegisterVirtualMachine(compileV2FromJavaScript(source), ctx)
}

export { V2UnsupportedError }
