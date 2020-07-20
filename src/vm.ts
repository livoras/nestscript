import { arrayBufferToString, getByProp } from './utils'
export enum I {
 MOV, ADD, SUB, MUL, DIV, MOD,
 EXP, INC, DEC,

 LT, GT, EQ, LE, GE, NE,
 AND, OR, XOR,  SHL, SHR,

 JMP, JE, JNE, JG, JL, JIF, JF,
 JGE, JLE, PUSH, POP, CALL, PRINT,
 RET, PAUSE, EXIT,

 CALL_CTX, CALL_VAR, CALL_REG, MOV_CTX, MOV_PROP,
 SET_CTX, // SET_CTX "name" R1
 NEW_OBJ, NEW_ARR, SET_KEY,
 FUNC, ALLOC,

 /* UnaryExpression */
 PLUS, // PLUS %r0 +
 MINUS, // MINUS %r0 -
 NOT, // NOT %r0 ~
 VOID, // VOID %r0 void
 DEL, // DEL %r0 %r1 delete
 NEG, // NEG %r0 !
}

export const enum IOperatantType {
  REGISTER,
  CLOSURE_REGISTER,
  GLOBAL,
  NUMBER,
  FUNCTION_INDEX,
  STRING,
  ARG_COUNT,
  RETURN_VALUE,
  ADDRESS,
  BOOLEAN,
}

export interface IOperant {
  type: IOperatantType,
  value: any,
  raw?: any,
  index?: any,
}

export const operantBytesSize: { [x in IOperatantType]: number } = {
  [IOperatantType.FUNCTION_INDEX]: 2,
  [IOperatantType.STRING]: 2,

  [IOperatantType.REGISTER]: 2,
  [IOperatantType.CLOSURE_REGISTER]: 2,
  [IOperatantType.GLOBAL]: 2,
  [IOperatantType.ARG_COUNT]: 2,
  [IOperatantType.ADDRESS]: 4,
  [IOperatantType.NUMBER]: 8,
  [IOperatantType.RETURN_VALUE]: 0,
  [IOperatantType.BOOLEAN]: 1,
}

export type IClosureTable = {
  [x in number]: number
}

export class VirtualMachine {
  /** 指令索引 */
  public ip: number = 0
  /** 当前函数帧基索引 */
  public fp: number = 0
  /** 操作的栈顶 */
  public sp: number = -1

  /** 寄存器 */
  public RET: any // 函数返回寄存器
  public REG: any // 通用寄存器

  /** 函数操作栈 */
  public stack: any[] = []

  /** 闭包变量存储 */
  public heap: any[] = []

  /** 闭包映射表 */
  public closureTable: any = {}
  public closureTables: any[] = []

  public isRunning: boolean = false

  constructor (
    public codes: ArrayBuffer,
    public functionsTable: IFuncInfo[],
    public stringsTable: string[],
    public entryFunctionIndex: number,
    public globalSize: number,
    public ctx: any,
  ) {
    this.init()
  }

  public init(): void {
    const { globalSize, functionsTable, entryFunctionIndex } = this
    // RET
    // TODO: how to deal with it?
    this.stack = []
    // this.heap = []
    const globalIndex = globalSize + 1
    const mainLocalSize = functionsTable[entryFunctionIndex].localSize
    this.fp = globalIndex // fp 指向 old fp 位置，兼容普通函数
    this.stack[this.fp] =-1
    this.sp = this.fp + mainLocalSize
    this.stack.length = this.sp + 1
    this.closureTable = {}
    this.closureTables = [this.closureTable]
    /**
     * V2
     * V1 -> sp ->
     * <empty item>
     * ...
     * G2
     * G1
     * RET
     */
    console.log(
      'globalIndex', globalIndex,
      'localSize', functionsTable[entryFunctionIndex].localSize,
    )
    console.log("start ---> fp", this.fp, this.sp)
  }

  public reset(): void {
    this.init()
    // this.stack = []
    this.heap = []
  }

  // tslint:disable-next-line: no-big-function
  public run(): void {
    this.ip = this.functionsTable[this.entryFunctionIndex].ip
    console.log("start stack", this.stack)
    this.isRunning = true
    while (this.isRunning) { this.fetchAndExecute() }
  }

  public setReg(dst: IOperant, src: { value: any }): void {
    if (dst.type === IOperatantType.CLOSURE_REGISTER) {
      this.heap[this.makeClosureIndex(dst.index)] = src.value
    } else {
      this.stack[dst.index] = src.value
    }
  }

  public getReg(operatant: IOperant): any {
    if (operatant.type === IOperatantType.CLOSURE_REGISTER) {
      return this.heap[this.makeClosureIndex(operatant.index)]
    } else {
      return this.stack[operatant.index]
    }
  }

  public makeClosureIndex = (index: number): number => {
    if (this.closureTable[index] === undefined) {
      this.closureTable[index] = this.heap.length
      this.heap.push(undefined)
    }
    return this.closureTable[index]
  }

  // tslint:disable-next-line: no-big-function
  public fetchAndExecute(): I {
    const stack = this.stack
    const op = this.nextOperator()
    // console.log(op)
    // tslint:disable-next-line: max-switch-cases
    switch (op) {
    case I.PUSH: {
      this.push(this.nextOperant().value)
      break
    }
    case I.EXIT: {
      console.log('exit stack size -> ', stack.length)
      // console.log('stack -> ', this.stack)
      // console.log('heap -> ', this.heap)
      console.log('closures -> ', this.closureTables)
      this.isRunning = false
      this.closureTables = []
      this.init()
      break
    }
    case I.CALL: {
      const funcInfo: IFuncInfo = this.nextOperant().value
      const numArgs = this.nextOperant().value
      this.callFunction(funcInfo, numArgs)
      break
    }
    case I.RET: {
      const fp = this.fp
      this.fp = stack[fp]
      this.ip = stack[fp - 1]
      // 减去参数数量，减去三个 fp ip numArgs
      this.sp = fp - stack[fp - 2] - 3
      // 清空上一帧
      this.stack = stack.slice(0, this.sp + 1)
      this.closureTables.pop()
      this.closureTable = this.closureTables[this.closureTables.length - 1]
      break
    }
    case I.PRINT: {
      const val = this.nextOperant()
      console.log(val.value)
      break
    }
    case I.MOV: {
      const dst = this.nextOperant()
      const src = this.nextOperant()
      // console.log('mov', dst, src)
      // this.stack[dst.index] = src.value
      this.setReg(dst, src)
      break
    }
    case I.JMP: {
      const address = this.nextOperant()
      this.ip = address.value
      break
    }
    case I.JE: {
      this.jumpWithCondidtion((a: any, b: any): boolean => a === b)
      break
    }
    case I.JNE: {
      this.jumpWithCondidtion((a: any, b: any): boolean => a !== b)
      break
    }
    case I.JG: {
      this.jumpWithCondidtion((a: any, b: any): boolean => a > b)
      break
    }
    case I.JL: {
      this.jumpWithCondidtion((a: any, b: any): boolean => a < b)
      break
    }
    case I.JGE: {
      this.jumpWithCondidtion((a: any, b: any): boolean => a >= b)
      break
    }
    case I.JLE: {
      this.jumpWithCondidtion((a: any, b: any): boolean => a <= b)
      break
    }
    case I.JIF: {
      const cond = this.nextOperant()
      const address = this.nextOperant()
      if (cond.value) {
        this.ip = address.value
      }
      break
    }
    case I.JF: {
      const cond = this.nextOperant()
      const address = this.nextOperant()
      if (!cond.value) {
        this.ip = address.value
      }
      break
    }
    case I.CALL_CTX:
    case I.CALL_VAR: {
      let o

      if (op === I.CALL_CTX) {
        o = this.ctx
      } else {
        // const k = this.nextOperant().value
        // o = getByProp(this.ctx, k)
        o = this.nextOperant().value
      }

      const f = this.nextOperant().value
      const numArgs = this.nextOperant().value
      const args = []
      for (let i = 0; i < numArgs; i++) {
        args.push(stack[this.sp--])
      }
      // console.log('-->', f)
      stack[0] = o[f].apply(o, args)
      // console.log(this.stack)
      this.stack = stack.slice(0, this.sp + 1)
      break
    }
    case I.CALL_REG: {
      const o1 = this.nextOperant()
      const f = o1.value
      const numArgs = this.nextOperant().value
      const args = []
      for (let i = 0; i < numArgs; i++) {
        args.push(stack[this.sp--])
      }
      f(...args)
      break
    }
    case I.MOV_CTX: {
      const dst = this.nextOperant()
      const propKey = this.nextOperant()
      const src = getByProp(this.ctx, propKey.value)
      // this.stack[dst.index] = src
      this.setReg(dst, { value: src })
      break
    }
    case I.SET_CTX: {
      const propKey = this.nextOperant()
      const val = this.nextOperant()
      this.ctx[propKey.value] = val.value
      break
    }
    case I.NEW_OBJ: {
      const dst = this.nextOperant()
      const o = {}
      // this.stack[dst.index] = o
      this.setReg(dst, { value: o })
      break
    }
    case I.NEW_ARR: {
      const dst = this.nextOperant()
      const o: any[] = []
      // this.stack[dst.index] = o
      this.setReg(dst, { value: o })
      break
    }
    case I.SET_KEY: {
      const o = this.nextOperant().value
      const key = this.nextOperant().value
      const value = this.nextOperant().value
      o[key] = value
      break
    }
    /** 这是定义一个函数 */
    case I.FUNC: {
      const dst = this.nextOperant()
      const funcInfo: IFuncInfo = this.nextOperant().value
      // TODO
      const callback = this.newCallback({ ...funcInfo, closureTable: { ...this.closureTable } })
      // stack[dst.index] = callback
      this.setReg(dst, { value: callback })
      // console.log("++++++", dst, this.stack)
      break
    }
    // MOV_PRO R0 R1 "arr.length";
    case I.MOV_PROP: {
      const dst = this.nextOperant()
      const o = this.nextOperant().value
      const k = this.nextOperant().value
      const v = getByProp(o, k)
      // stack[dst.index] = v
      this.setReg(dst, { value: v })
      break
    }
    case I.LT: {
      this.binaryExpression((a, b): any => a < b)
      break
    }
    case I.GT: {
      this.binaryExpression((a, b): any => a > b)
      break
    }
    case I.EQ: {
      this.binaryExpression((a, b): any => a === b)
      break
    }
    case I.LE: {
      this.binaryExpression((a, b): any => a <= b)
      break
    }
    case I.GE: {
      this.binaryExpression((a, b): any => a >= b)
      break
    }
    case I.ADD: {
      this.binaryExpression((a, b): any => a + b)
      break
    }
    case I.SUB: {
      this.binaryExpression((a, b): any => a - b)
      break
    }
    case I.MUL: {
      this.binaryExpression((a, b): any => a * b)
      break
    }
    case I.DIV: {
      this.binaryExpression((a, b): any => a / b)
      break
    }
    case I.MOD: {
      this.binaryExpression((a, b): any => a % b)
      break
    }
    case I.AND: {
      this.binaryExpression((a, b): any => a && b)
      break
    }
    case I.OR: {
      this.binaryExpression((a, b): any => a || b)
      break
    }
    case I.ALLOC: {
      const dst = this.nextOperant()
      this.getReg(dst)
      break
    }
    case I.PLUS: {
      this.uniaryExpression((val: any): any => +val)
      break
    }
    case I.MINUS: {
      this.uniaryExpression((val: any): any => -val)
      break
    }
    case I.VOID: {
      // tslint:disable-next-line: no-unused-expression
      this.uniaryExpression((val: any): any => void val)
      break
    }
    case I.NOT: {
      // tslint:disable-next-line: no-bitwise
      this.uniaryExpression((val: any): any => ~val)
      break
    }
    case I.NEG: {
      // tslint:disable-next-line: no-bitwise
      this.uniaryExpression((val: any): any => !val)
      break
    }
    case I.DEL: {
      const o1 = this.nextOperant().value
      const o2 = this.nextOperant().value
      delete o1[o2]
      break
    }
    default:
      console.log(this.ip)
      throw new Error("Unknow command " + op)
    }

    return op
  }

  public push(val: any): void {
    this.stack[++this.sp] = val
  }

  public callFunction(funcInfo: IFuncInfo, numArgs: number): void {
    if (!funcInfo.closureTable) { funcInfo.closureTable = {} }
    this.closureTable = funcInfo.closureTable
    this.closureTables.push(funcInfo.closureTable)
    const stack = this.stack
    // console.log('call', funcInfo, numArgs)
    //            | R3      |
    //            | R2      |
    //            | R1      |
    //            | R0      |
    //      sp -> | fp      | # for restoring old fp
    //            | ip      | # for restoring old ip
    //            | numArgs | # for restoring old sp: old sp = current sp - numArgs - 3
    //            | arg1    |
    //            | arg2    |
    //            | arg3    |
    //  old sp -> | ....    |
    stack[++this.sp] = numArgs
    stack[++this.sp] = this.ip
    stack[++this.sp] = this.fp
    // set to new ip and fp
    this.ip = funcInfo.ip
    this.fp = this.sp
    this.sp += funcInfo.localSize
  }

  public nextOperator(): I {
    // console.log("ip -> ", this.ip)
    return readUInt8(this.codes, this.ip, ++this.ip)
  }

  public nextOperant(): IOperant {
    const codes = this.codes
    const valueType = readUInt8(codes, this.ip, ++this.ip)
    // console.log(valueType)
    let value: any
    switch (valueType) {
    case IOperatantType.REGISTER:
    case IOperatantType.CLOSURE_REGISTER:
    case IOperatantType.GLOBAL:
    case IOperatantType.ARG_COUNT:
    case IOperatantType.FUNCTION_INDEX:
    case IOperatantType.STRING: {
      const j = this.ip + 2
      value = readInt16(codes, this.ip, j)
      this.ip = j
      break
    }
    case IOperatantType.ADDRESS: {
      const j = this.ip + 4
      value = readUInt32(codes, this.ip, j)
      this.ip = j
      break
    }
    case IOperatantType.NUMBER: {
      const j = this.ip + 8
      value = readFloat64(codes, this.ip, j)
      this.ip = j
      break
    }
    case IOperatantType.BOOLEAN: {
      const j = this.ip + 1
      value = readInt8(codes, this.ip, j) === 1
      console.log("?????????????????????", value)
      this.ip = j
      break
    }
    case IOperatantType.RETURN_VALUE:
      value = 0
      break
    default:
      throw new Error("Unknown operant " + valueType)
    }
    return {
      type: valueType,
      value: this.parseValue(valueType, value),
      raw: value,
      index: valueType === IOperatantType.REGISTER ? (this.fp + value) : value,
    }
  }

  public parseValue(valueType: IOperatantType, value: any): any {
    switch (valueType) {
    case IOperatantType.CLOSURE_REGISTER:
      return this.heap[this.closureTable[value]]
    case IOperatantType.REGISTER:
      return this.stack[this.fp + value]
    case IOperatantType.ARG_COUNT:
    case IOperatantType.NUMBER:
    case IOperatantType.ADDRESS:
      return value
    case IOperatantType.GLOBAL:
      return this.stack[value]
    case IOperatantType.STRING:
      return this.stringsTable[value]
    case IOperatantType.FUNCTION_INDEX:
      return { ...this.functionsTable[value] }
    case IOperatantType.RETURN_VALUE:
      return this.stack[0]
    case IOperatantType.BOOLEAN:
      return value
    default:
      throw new Error("Unknown operant " + valueType)
    }
  }

  public jumpWithCondidtion(cond: (a: any, b: any) => boolean): void {
    const op1 = this.nextOperant()
    const op2 = this.nextOperant()
    const address = this.nextOperant()
    // console.log("JUMP --->l", address)
    if (cond(op1.value, op2.value)) {
      this.ip = address.value
    }
  }

  public uniaryExpression(exp: (a: any) => any): void {
    const o = this.nextOperant()
    const ret = exp(o.value)
    this.setReg(o, { value: ret })
  }

  public binaryExpression(exp: (a: any, b: any) => any): void {
    const o1 = this.nextOperant()
    const o2 = this.nextOperant()
    const ret = exp(o1.value, o2.value)
    this.setReg(o1, { value: ret })
  }

  public newCallback(funcInfo: IFuncInfo): () => any {
    return (...args: any[]): any => {
      args.reverse()
      args.forEach((arg: any): void => this.push(arg))
      this.callFunction(funcInfo, args.length)
      let op: any = null
      let callCount = 1
      /** 回调函数的实现 */
      while (callCount !== 0) {
        op = this.fetchAndExecute()
        if(op === I.CALL) {
          callCount++
        } else if (op === I.RET) {
          callCount--
        } else {
          // do nothing..
        }
      }
    }
  }
}

interface IFuncInfo {
  ip: number,
  numArgs: number,
  localSize: number,
  closureTable?: any,
}

/**
 * Header:
 *
 * mainFunctionIndex: 1
 * funcionTableBasicIndex: 1
 * stringTableBasicIndex: 1
 * globalsSize: 2
 */
const createVMFromArrayBuffer = (buffer: ArrayBuffer, ctx: any = {}): VirtualMachine => {
  const mainFunctionIndex = readUInt32(buffer, 0, 4)
  const funcionTableBasicIndex = readUInt32(buffer, 4, 8)
  const stringTableBasicIndex = readUInt32(buffer, 8, 12)
  const globalsSize = readUInt32(buffer, 12, 16)
  console.log(
    ' =========================== Start Running =======================\n',
    'main function index', mainFunctionIndex, '\n',
    'function table basic index', funcionTableBasicIndex, '\n',
    'string table basic index', stringTableBasicIndex, '\n',
    'globals szie ', globalsSize, '\n',
    '=================================================================\n',
  )

  const stringsTable: string[] = parseStringsArray(buffer.slice(stringTableBasicIndex))
  const codesBuf = buffer.slice(4 * 4, funcionTableBasicIndex)
  const funcsBuf = buffer.slice(funcionTableBasicIndex, stringTableBasicIndex)
  const funcsTable: IFuncInfo[] = parseFunctionTable(funcsBuf)
  console.log('string table', stringsTable)
  console.log('function table', funcsTable)
  console.log(mainFunctionIndex, funcsTable, 'function basic index', funcionTableBasicIndex)
  console.log('codes length -->', codesBuf.byteLength, stringTableBasicIndex)
  console.log('main start index', funcsTable[mainFunctionIndex].ip, stringTableBasicIndex)

  return new VirtualMachine(codesBuf, funcsTable, stringsTable, mainFunctionIndex, globalsSize, ctx)
}

const parseFunctionTable = (buffer: ArrayBuffer): IFuncInfo[] => {
  const funcs: IFuncInfo[] = []
  let i = 0
  while (i < buffer.byteLength) {
    const ipEnd = i + 4
    const ip = readUInt32(buffer, i, ipEnd)
    const numArgsAndLocal = new Uint16Array(buffer.slice(ipEnd, ipEnd + 2 * 2))
    funcs.push({ ip, numArgs: numArgsAndLocal[0], localSize: numArgsAndLocal[1] })
    i += 8
  }
  return funcs
}

const parseStringsArray = (buffer: ArrayBuffer): string[] => {
  const strings: string[] = []
  let i = 0
  while(i < buffer.byteLength) {
    const lentOffset = i + 4
    const len = readUInt32(buffer, i, lentOffset)
    const start = lentOffset
    const end = lentOffset + len * 2
    const str = readString(buffer, start, end)
    strings.push(str)
    i = end
  }
  return strings
}

const readFloat64 = (buffer: ArrayBuffer, from: number, to: number): number => {
  return (new Float64Array(buffer.slice(from, to)))[0]
}

const readUInt8 = (buffer: ArrayBuffer, from: number, to: number): number => {
  return (new Uint8Array(buffer.slice(from, to)))[0]
}

const readInt8 = (buffer: ArrayBuffer, from: number, to: number): number => {
  return (new Int8Array(buffer.slice(from, to)))[0]
}

const readInt16 = (buffer: ArrayBuffer, from: number, to: number): number => {
  return (new Int16Array(buffer.slice(from, to)))[0]
}

const readUInt16 = (buffer: ArrayBuffer, from: number, to: number): number => {
  return (new Uint16Array(buffer.slice(from, to)))[0]
}

const readUInt32 = (buffer: ArrayBuffer, from: number, to: number): number => {
  return (new Uint32Array(buffer.slice(from, to)))[0]
}

const readString = (buffer: ArrayBuffer, from: number, to: number): string => {
  return arrayBufferToString(buffer.slice(from, to))
}

export { createVMFromArrayBuffer }
