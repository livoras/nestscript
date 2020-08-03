  // tslint:disable: no-bitwise
import { parseStringsArray, getByProp, readUInt8, readInt16, readUInt32, readFloat64, readInt8, getOperatantByBuffer, getOperantName } from './utils'
const raw = require('./raw')

export enum I {
 MOV, ADD, SUB, MUL, DIV, MOD,
 EXP, INC, DEC,

 LT, GT, EQ, LE, GE, NE, WEQ, WNE,
 LG_AND, LG_OR,
 AND, OR, XOR, SHL, SHR,

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

 INST_OF, // instanceof
 MOV_THIS, // moving this to resgister
}

export const enum IOperatantType {
  REGISTER = 0 << 4,
  CLOSURE_REGISTER = 1 << 4,
  GLOBAL = 2 << 4,
  NUMBER = 3 << 4,
  // tslint:disable-next-line: no-identical-expressions
  FUNCTION_INDEX = 4 << 4,
  STRING = 5 << 4,
  ARG_COUNT = 6 << 4,
  RETURN_VALUE = 7 << 4,
  ADDRESS = 8 << 4,
  BOOLEAN = 9 << 4,
}

class FunctionInfo {
  public vm?: VirtualMachine
  constructor(
    public ip: number,
    public numArgs: number,
    public localSize: number,
    public closureTable?: any,
    public jsFunction?: CallableFunction,
  ) {
  }

  public setVirtualMachine(vm: VirtualMachine): void {
    this.vm = vm
  }

  public getJsFunction(): CallableFunction {
    if (!this.vm) { throw new Error("VirtualMachine is not set!")}
    if (!this.closureTable) { this.closureTable = {} }
    let jsFunc = this.jsFunction
    if (!jsFunc) {
      jsFunc = this.jsFunction = raw.parseVmFunctionToJsFunction(this, this.vm)
    }
    return jsFunc as CallableFunction
  }

}

type CallableFunction = (...args: any[]) => any

raw.setInstructionsCode(I)

export interface IOperant {
  type: IOperatantType,
  value: any,
  raw?: any,
  index?: any,
}

export type IClosureTable = {
  [x in number]: number
}

// tslint:disable-next-line: max-classes-per-file
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

  /** this 链 */
  public currentThis: any
  public allThis: any[] = []

  public isRunning: boolean = false

  constructor (
    public codes: ArrayBuffer,
    public functionsTable: FunctionInfo[],
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
    this.stack.splice(0)
    // this.heap = []
    const globalIndex = globalSize + 1
    const mainLocalSize = functionsTable[entryFunctionIndex].localSize
    this.fp = globalIndex // fp 指向 old fp 位置，兼容普通函数
    this.stack[this.fp] =-1
    this.sp = this.fp + mainLocalSize
    this.stack.length = this.sp + 1
    //
    this.closureTable = {}
    this.closureTables = [this.closureTable]
    //
    this.currentThis = this.ctx
    this.allThis = [this.currentThis]
    this.currentThis = this.ctx
    //
    this.functionsTable.forEach((funcInfo): void => { funcInfo.vm = this })

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

  // tslint:disable-next-line: no-big-function cognitive-complexity
  public fetchAndExecute(): [I, boolean] {
    const stack = this.stack
    const op = this.nextOperator()
    // 用来判断是否嵌套调用 vm 函数
    let isCallVMFunction = false
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
    // case I.CALL: {
    //   const funcInfo: FunctionInfo = this.nextOperant().value
    //   const numArgs = this.nextOperant().value
    //   if (funcInfo instanceof )
    //   break
    // }
    case I.RET: {
      const fp = this.fp
      this.fp = stack[fp]
      this.ip = stack[fp - 1]
      // 减去参数数量，减去三个 fp ip numArgs
      this.sp = fp - stack[fp - 2] - 3
      // 清空上一帧
      this.stack.splice(this.sp + 1)
      this.closureTables.pop()
      this.closureTable = this.closureTables[this.closureTables.length - 1]
      //
      this.allThis.pop()
      this.currentThis = this.allThis[this.allThis.length - 1]
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
        o = this.nextOperant().value
      }
      const funcName = this.nextOperant().value
      const numArgs = this.nextOperant().value
      const isNewExpression = this.nextOperant().value
      isCallVMFunction = this.callFunction(void 0, o, funcName, numArgs, isNewExpression)
      break
    }
    case I.CALL_REG: {
      const o = this.nextOperant()
      const f = o.value
      const numArgs = this.nextOperant().value
      const isNewExpression = this.nextOperant().value
      isCallVMFunction = this.callFunction(f, void 0, '', numArgs, isNewExpression)
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
      this.setReg(dst, { value: o })
      break
    }
    case I.NEW_ARR: {
      const dst = this.nextOperant()
      const o: any[] = []
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
      const funcOperant = this.nextOperant()
      const funcInfoIndex: number = funcOperant.raw
      const funcInfo = this.functionsTable[funcInfoIndex]
      // TODO
      funcInfo.closureTable = { ...this.closureTable }
      // stack[dst.index] = callback
      this.setReg(dst, { value: funcOperant.value })
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
    case I.NE: {
      this.binaryExpression((a, b): any => a !== b)
      break
    }
    case I.WEQ: {
      // tslint:disable-next-line: triple-equals
      this.binaryExpression((a, b): any => a == b)
      break
    }
    case I.WNE: {
      // tslint:disable-next-line: triple-equals
      this.binaryExpression((a, b): any => a != b)
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
      // tslint:disable-next-line: no-bitwise
      this.binaryExpression((a, b): any => a & b)
      break
    }
    case I.OR: {
      // tslint:disable-next-line: no-bitwise
      this.binaryExpression((a, b): any => a | b)
      break
    }
    case I.XOR: {
      // tslint:disable-next-line: no-bitwise
      this.binaryExpression((a, b): any => a ^ b)
      break
    }
    case I.SHL: {
      // tslint:disable-next-line: no-bitwise
      this.binaryExpression((a, b): any => a << b)
      break
    }
    case I.SHR: {
      // tslint:disable-next-line: no-bitwise
      this.binaryExpression((a, b): any => a >> b)
      break
    }
    case I.LG_AND: {
      this.binaryExpression((a, b): any => a && b)
      break
    }
    case I.LG_OR: {
      this.binaryExpression((a, b): any => a || b)
      break
    }
    case I.INST_OF: {
      this.binaryExpression((a, b): any => {
        return a instanceof b
      })
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
    case I.MOV_THIS: {
      this.setReg(this.nextOperant(), { value: this.currentThis })
      break
    }
    default:
      console.log(this.ip)
      throw new Error("Unknow command " + op)
    }

    return [op, isCallVMFunction]
  }

  public push(val: any): void {
    this.stack[++this.sp] = val
  }

  public nextOperator(): I {
    // console.log("ip -> ", this.ip)
    return readUInt8(this.codes, this.ip, ++this.ip)
  }

  public nextOperant(): IOperant {
    const codes = this.codes
    const [operantType, value, byteLength] = getOperatantByBuffer(codes, this.ip++)
    this.ip = this.ip + byteLength
    return {
      type: operantType,
      value: this.parseValue(operantType, value),
      raw: value,
      index: operantType === IOperatantType.REGISTER ? (this.fp + value) : value,
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
      return this.functionsTable[value].getJsFunction()
    case IOperatantType.RETURN_VALUE:
      return this.stack[0]
    case IOperatantType.BOOLEAN:
      return !!value
    default:
      throw new Error("Unknown operant " + valueType)
    }
  }

  public jumpWithCondidtion(cond: (a: any, b: any) => boolean): void {
    const op1 = this.nextOperant()
    const op2 = this.nextOperant()
    const address = this.nextOperant()
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

  // tslint:disable-next-line: cognitive-complexity
  public callFunction(
    func: CallableFunction | undefined,
    o: any,
    funcName: string,
    numArgs: number,
    isNewExpression: boolean,
  ): boolean {
    const stack = this.stack
    const f = func || o[funcName]
    let isCallVMFunction = false
    if ((f instanceof raw.Callable) && !isNewExpression) {
      const arg = new raw.NumArgs(numArgs)
      if (o) {
        o[funcName](arg)
      } else {
        f(arg)
      }
      isCallVMFunction = true
    } else {
      const args = []
      for (let i = 0; i < numArgs; i++) {
        args.push(stack[this.sp--])
      }
      if (o) {
        stack[0] = isNewExpression
          ? new o[funcName](...args)
          : o[funcName](...args)
      } else {
        stack[0] = isNewExpression
          ? new f(...args)
          : f(...args)
      }
      this.stack.splice(this.sp + 1)
    }
    return isCallVMFunction
  }
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
  const funcsTable: FunctionInfo[] = parseFunctionTable(funcsBuf)
  console.log('string table', stringsTable)
  console.log('function table', funcsTable)
  console.log(mainFunctionIndex, 'function basic index', funcionTableBasicIndex)
  console.log('total codes bytes length -->', codesBuf.byteLength)
  console.log('main start index', funcsTable[mainFunctionIndex].ip, stringTableBasicIndex)

  return new VirtualMachine(codesBuf, funcsTable, stringsTable, mainFunctionIndex, globalsSize, ctx)
}

const parseFunctionTable = (buffer: ArrayBuffer): FunctionInfo[] => {
  const funcs: FunctionInfo[] = []
  let i = 0
  while (i < buffer.byteLength) {
    const ipEnd = i + 4
    const ip = readUInt32(buffer, i, ipEnd)
    const numArgsAndLocal = new Uint16Array(buffer.slice(ipEnd, ipEnd + 2 * 2))
    funcs.push(
      new FunctionInfo(
        ip,
        numArgsAndLocal[0],
        numArgsAndLocal[1],
      ),
    )
    i += 8
  }
  return funcs
}

export { createVMFromArrayBuffer }
