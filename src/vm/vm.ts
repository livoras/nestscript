// tslint:disable: no-bitwise
// tslint:disable: no-big-function
// tslint:disable: no-dead-store
import { parseStringsArray, getByProp, readUInt8, readInt16, readUInt32, readFloat64, readInt8, getOperatantByBuffer, getOperantName } from '../utils'
import { Scope } from '../scope'

export enum I {
 VAR, CLS,

 MOV, ADD, SUB, MUL, DIV, MOD,
 EXP, INC, DEC,

 LT, GT, EQ, LE, GE, NE, WEQ, WNE,
 LG_AND, LG_OR,
 AND, OR, XOR, SHL, SHR, ZSHR,

 JMP, JE, JNE, JG, JL, JIF, JF,
 JGE, JLE, PUSH, POP, CALL, PRINT,
 RET, PAUSE, EXIT,

 CALL_CTX, CALL_VAR, CALL_REG, MOV_CTX, MOV_PROP,
 SET_CTX, // SET_CTX "name" R1
 NEW_OBJ, NEW_ARR, NEW_REG, SET_KEY,
 FUNC, ALLOC,

 /* UnaryExpression */
 PLUS, // PLUS %r0 +
 MINUS, // MINUS %r0 -
 NOT, // NOT %r0 ~
 VOID, // VOID %r0 void
 DEL, // DEL %r0 %r1 delete
 NEG, // NEG %r0 !
 TYPE_OF,

 IN,
 INST_OF, // instanceof
 MOV_THIS, // moving this to resgister

 // try catch
 TRY, TRY_END, THROW, GET_ERR,

 // arguments
 MOV_ARGS,

 FORIN, FORIN_END, BREAK_FORIN, CONT_FORIN,

 BVAR, BLOCK, END_BLOCK, CLR_BLOCK,
}

const NO_RETURN_SYMBOL = Symbol()

class VMRunTimeError extends Error {
  constructor(public error: any) {
    super(error)
  }
}

interface ICallingFunctionInfo {
  closureScope: Scope,
  variables: Scope,
  returnValue?: any,
  args: any[],
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
  NULL = 10 << 4,
  UNDEFINED = 11 << 4,
  VAR_SYMBOL = 13 << 4,
}

// tslint:disable-next-line: max-classes-per-file
// class FunctionInfo {
//   public vm?: VirtualMachine
//   constructor(
//     public ip: number,
//     public numArgs: number,
//     public localSize: number,
//     public closureTable: any,
//     public jsFunction?: CallableFunction,
//   ) {
//   }

//   public setVirtualMachine(vm: VirtualMachine): void {
//     this.vm = vm
//   }

//   public getJsFunction(): CallableFunction {
//     if (!this.vm) { throw new VMRunTimeError("VirtualMachine is not set!")}
//     // if (!this.closureTable) { this.closureTable = {} }
//     // this.closureTable = {}
//     let jsFunc = this.jsFunction
//     if (!jsFunc) {
//       jsFunc = this.jsFunction = parseVmFunctionToJsFunction(this, this.vm)
//     }
//     return jsFunc as CallableFunction
//     // this.jsFunction = parseVmFunctionToJsFunction(this, this.vm)
//     // return this.jsFunction as CallableFunction
//   }

// }

// type CallableFunction = (...args: any[]) => any

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
  // public closureScope: Scope

  /** 闭包映射表 */
  public callingFunctionInfo: ICallingFunctionInfo = {
    closureScope: new Scope(),
    variables: new Scope(),
    args: [],
  }
  public callingFunctionInfos: ICallingFunctionInfo[] = []

  /** this 链 */
  public currentThis: any
  public allThis: any[] = []

  public isRunning: boolean = false
  public mainFunction: CallableFunction

  public error: any

  constructor (
    public codes: ArrayBuffer,
    public functionsTable: FuncInfoMeta[],
    public entryIndx: number,
    public stringsTable: string[],
    public globalSize: number,
    public ctx: any,
  ) {
    const mainClosureScope = new Scope()
    mainClosureScope.isRestoreWhenChange = false
    this.mainFunction = this.parseToJsFunc(functionsTable[this.entryIndx], mainClosureScope)
    this.init()
  }

  public init(): void {
    const { globalSize, mainFunction } = this
    const { meta } = this.getMetaFromFunc(mainFunction)
    const [ip, numArgs, localSize] = meta
    // RET
    // TODO: how to deal with it?
    this.stack.splice(0)
    // this.heap = []
    const globalIndex = globalSize + 1
    // const mainLocalSize = localSize
    this.fp = globalIndex // fp 指向 old fp 位置，兼容普通函数
    this.stack[this.fp] =-1
    this.sp = this.fp
    this.stack.length = this.sp + 1
    //
    // this.closureTable = {}
    this.callingFunctionInfos = []
    //
    // this.currentThis = this.ctx
    // this.allThis = [this.currentThis]
    this.allThis = []
    // this.currentThis = this.ctx
    //
    // this.functionsTable.forEach((funcInfo): void => { funcInfo.vm = this })
    // mainFuncInfo.vm = this

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
      'localSize', localSize,
    )
    console.log("start ---> fp", this.fp, this.sp)
  }

  public reset(): void {
    this.init()
    this.error = null
    // this.closureScope = new Scope()
    // this.closureScope.isRestoreWhenChange = false
    // this.stack = []
    // this.heap = []
  }

  // tslint:disable-next-line: no-big-function
  public run(): void {
    this.callFunction(this.mainFunction, void 0, '', 0, false)
    // this.ip = this.functionsTable[this.entryFunctionIndex].ip
    console.log("start stack", this.stack)
    this.isRunning = true
    while (this.isRunning) {
      // console.log('running in main stream.....')
      this.fetchAndExecute()
    }
  }

  public setReg(dst: IOperant, src: { value: any }): void {
    if (dst.type === IOperatantType.VAR_SYMBOL) {
      this.callingFunctionInfo.variables.set(dst.index, src.value)
    } else if (dst.type === IOperatantType.CLOSURE_REGISTER) {
      this.callingFunctionInfo.closureScope.set(dst.index, src.value)
    } else if (dst.type === IOperatantType.REGISTER || dst.type === IOperatantType.RETURN_VALUE) {
      if (dst.type === IOperatantType.RETURN_VALUE) {
        this.callingFunctionInfo.returnValue = src.value
      }
      if (dst.raw <= -4) {
        this.callingFunctionInfo.args[-4 - dst.raw] = src.value
      } else {
        this.stack[dst.index] = src.value
      }
    } else {
      console.error(dst)
      throw new Error(`Cannot process register type ${dst.type}`)
    }
  }

  public newReg(o: IOperant): any {
    if (o.type === IOperatantType.VAR_SYMBOL) {
      this.callingFunctionInfo.variables.new(o.index)
    } else if (o.type === IOperatantType.CLOSURE_REGISTER) {
      this.callingFunctionInfo.closureScope.new(o.index)
    } else {
      console.error(o)
      throw new Error(`Cannot process register type ${o.type}`)
    }
  }

  public getReg(o: IOperant): any {
    if (o.type === IOperatantType.VAR_SYMBOL) {
      return this.callingFunctionInfo.variables.get(o.index)
    } else if (o.type === IOperatantType.CLOSURE_REGISTER) {
      return this.callingFunctionInfo.closureScope.get(o.index)
    } else if (o.type === IOperatantType.REGISTER || o.type === IOperatantType.RETURN_VALUE) {
      return this.stack[o.index]
    } else {
      throw new Error(`Cannot process register type ${o.type}`)
    }
    // if (operatant.type === IOperatantType.CLOSURE_REGISTER) {
    //   // console.log("GET closure", operatant)
    //   return this.heap[this.makeClosureIndex(operatant.index)]
    // } else {
    //   return this.stack[operatant.index]
    // }
  }

  // public makeClosureIndex = (index: number): number => {
  //   const closureTable = this.callingFunctionInfo.closureTable
  //   if (closureTable[index] === undefined) {
  //     closureTable[index] = this.heap.length
  //     this.heap.push(undefined)
  //   }
  //   return closureTable[index]
  // }

  // tslint:disable-next-line: no-big-function cognitive-complexity
  public fetchAndExecute(): [I, boolean] {
    if (!this.isRunning) {
      throw new VMRunTimeError('try to run again...')
    }
    const stack = this.stack
    if (this.ip === 28) {
      console.log('running .... ip -> ', this.ip)
    }
    let op = this.nextOperator()
    // 用来判断是否嵌套调用 vm 函数
    let isCallVMFunction = false
    // console.log(op, I[op])
    // tslint:disable-next-line: max-switch-cases
    switch (op) {
    case I.VAR:
    case I.CLS: {
      const o = this.nextOperant()
      // this.callingFunctionInfo.variables.set(o.raw, void 0)
      // console.log('---------------------------------------')
      // const closureScope = this.callingFunctionInfo.closureScope
      // console.log(closureScope, o, closureScope.scope, Object.getPrototypeOf(closureScope.scope))
      this.newReg(o)
      // console.log(closureScope)
      // console.log('---------------------------------------')
      break
    }

    // case I.CLS: {
    //   console.log(this.callingFunctionInfo.closureScope)
    //   const o = this.nextOperant()
    //   this.newReg(o)
    //   console.log(this.callingFunctionInfo.closureScope)
    //   // console.log('?', o)
    //   break
    // }

    case I.PUSH: {
      const value = this.nextOperant().value
      // console.log('PUSHING....', value)
      this.push(value)
      // console.log(this.stack)
      break
    }
    case I.EXIT: {
      console.log('exit stack size -> ', stack.length)
      // console.log('stack -> ', this.stack)
      // console.log('heap -> ', this.heap)
      // console.log('closures -> ', this.closureTables)
      this.isRunning = false
      // this.closureTables = []
      // this.init()
      break
    }
    // case I.CALL: {
    //   const funcInfo: FunctionInfo = this.nextOperant().value
    //   const numArgs = this.nextOperant().value
    //   if (funcInfo instanceof )
    //   break
    // }
    case I.RET: {
      this.returnCurrentFunction()
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
      // console.log('MOV', dst, src)
      // console.log('MOV', dst, src)
      // this.stack[dst.index] = src.value
      // console.log(dst, src)
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
      // console.log("CALL---->", o, funcName, numArgs)
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
      const src = this.ctx[propKey.value] // getByProp(this.ctx, propKey.value)
      // console.log(' ================ MOV_CTX STACK -> before', this.stack)
      this.setReg(dst, { value: src })
      // console.log(' ================ MOV_CTX STACK -> after', this.stack)
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
    case I.NEW_REG: {
      const dst = this.nextOperant()
      const pattern = this.nextOperant()
      const flags = this.nextOperant()
      // console.log(dst, pattern, flags)
      try {
        // console.log(pattern, flags, '---------?')
        this.setReg(dst, { value: new RegExp(pattern.value, flags.value) })
      } catch(e) {
        console.log("================== pattern\n")
        console.log(pattern.value)
        console.log("==================\n")

        console.log("=================== value\n")
        console.log(flags.value)
        console.log("===================\n")
        throw new VMRunTimeError(e)
      }
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
      // console.log(o, key, value)
      o[key] = value
      break
    }
    /** 这是定义一个函数 */
    case I.FUNC: {
      const dst = this.nextOperant()
      const funcOperant = this.nextOperant()
      // const funcInfoIndex: number = funcOperant.value
      const funcInfoMeta = funcOperant.value
      const func = this.parseToJsFunc(funcInfoMeta, this.callingFunctionInfo.closureScope.fork())
      // TODO
      // console.log(this.closureTable, '??????????????')
      // funcInfo.closureTable = { ...this.closureTable }
      // stack[dst.index] = callback
      this.setReg(dst, { value: func })
      // console.log("++++++", dst, this.stack)
      break
    }
    // MOV_PRO R0 R1 "arr.length";
    case I.MOV_PROP: {
      const dst = this.nextOperant()
      const o = this.nextOperant()
      const k = this.nextOperant()
      const v = o.value[k.value] // getByProp(o.value, k.value)
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
    case I.ZSHR: {
      // tslint:disable-next-line: no-bitwise
      this.binaryExpression((a, b): any => a >>> b)
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
    case I.IN: {
      this.binaryExpression((a, b): any => {
        return a in b
      })
      break
    }
    case I.ALLOC: {
      const dst = this.nextOperant()
      // this.makeClosureIndex()
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
    case I.TYPE_OF: {
      this.uniaryExpression((val: any): any => typeof val)
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
    case I.TRY: {
      const catchAddress = this.nextOperant()
      const endAddress = this.nextOperant()
      let callCount = 1
      const currentFunctionInfo = this.callingFunctionInfo
      while (callCount > 0 && this.isRunning) {
        try {
          const [o, isCallVMFunc] = this.fetchAndExecute()
          op = o
          if (isCallVMFunc) {
            callCount++
          }
          if (o === I.RET) {
            callCount--
            if (callCount === 0) {
              break
            }
          }
          if (o === I.TRY_END && callCount === 1) {
            this.ip = endAddress.value
            break
          }
        } catch(e) {
          // console.log('catching .... the fucking errror', e)
          if (e instanceof VMRunTimeError) {
            throw e
          }
          this.popToFunction(currentFunctionInfo)
          this.error = e
          // console.log(this.callingFunctionInfo.closureScope)
          this.ip = catchAddress.value
          break
        }
      }
      break
    }
    case I.THROW: {
      const err = this.nextOperant()
      throw err.value
      // throw new VMRunTimeError(err)
      break
    }
    case I.TRY_END: {
      // throw new VMRunTimeError('Should not has `TRY_END` here.')
      break
    }
    case I.GET_ERR: {
      const o = this.nextOperant()
      this.setReg(o, { value: this.error })
      break
    }
    case I.MOV_ARGS: {
      const dst = this.nextOperant()
      // console.log(this.stack[this.fp - 2], '--->')
      this.setReg(dst, { value: this.stack[this.fp - 3] })
      break
    }
    case I.FORIN: {
      const dst = this.nextOperant()
      const target = this.nextOperant()
      const startAddress = this.nextOperant()
      const endAddress = this.nextOperant()
      forIn:
      // tslint:disable-next-line: forin
      for (const i in target.value) {
        this.setReg(dst, { value: i })
        while (true) {
          const o = this.fetchAndExecute()[0]
          if (o === I.BREAK_FORIN) {
            break forIn
          }
          if (o === I.FORIN_END || o === I.CONT_FORIN) {
            this.ip = startAddress.value
            continue forIn
          }
        }
      }
      this.ip = endAddress.value
      break
    }
    case I.FORIN_END:
    case I.BREAK_FORIN:
    case I.CONT_FORIN: {
      // throw new VMRunTimeError('Should not has `TRY_END` here.')
      break
    }

    // case I.BVAR: {
    //   const o = this.nextOperant()
    //   break
    // }
    case I.BLOCK: {
      const o= this.nextOperant()
      // console.log('===================== start block ===================', o.value)
      // console.log(this.callingFunctionInfo.variables)
      this.callingFunctionInfo.closureScope.front(o.value)
      this.callingFunctionInfo.variables.front(o.value)
      // console.log('\n')
      break
    }
    case I.CLR_BLOCK:
    case I.END_BLOCK: {
      const o = this.nextOperant()
      // console.log('===================== end block ===================', o.value)
      // console.log('before -> ', this.callingFunctionInfo.variables.printScope())
      this.callingFunctionInfo.closureScope.back(o.value)
      this.callingFunctionInfo.variables.back(o.value)
      // console.log('after -> ', this.callingFunctionInfo.variables.printScope())
      // console.log('\n')
      break
    }
    // case I.END_BLOCK: {
    //   this.callingFunctionInfo.closureScope.back()
    //   this.callingFunctionInfo.variables.back()
    //   break
    // }

    default:
      console.log(this.ip)
      throw new VMRunTimeError("Unknow command " + op + " " + I[op],)
    }

    return [op, isCallVMFunction]
  }

  public returnCurrentFunction(): void {
    const stack = this.stack
    const fp = this.fp
    this.fp = stack[fp]
    this.ip = stack[fp - 1]
    // 减去参数数量，减去三个 fp ip numArgs args
    this.sp = fp - stack[fp - 2] - 4
    // 清空上一帧
    this.stack.splice(this.sp + 1)
    if (this.callingFunctionInfo.returnValue === NO_RETURN_SYMBOL) {
      this.stack[0] = undefined
    }
    this.allThis.pop()
    this.currentThis = this.allThis[this.allThis.length - 1]
    this.callingFunctionInfos.pop()
    this.callingFunctionInfo = this.callingFunctionInfos[this.callingFunctionInfos.length - 1]
  }

  public push(val: any): void {
    this.stack[++this.sp] = val
  }

  public nextOperator(): I {
    // console.log("ip -->> ", this.ip)
    return readUInt8(this.codes, this.ip, ++this.ip)
  }

  public nextOperant(): IOperant {
    const codes = this.codes
    const [operantType, value, byteLength] = getOperatantByBuffer(codes, this.ip++)
    this.ip = this.ip + byteLength
    if (operantType === IOperatantType.REGISTER) {
      // console.log(this.fp, value)
    }
    return {
      type: operantType,
      value: this.parseValue(operantType, value),
      raw: value,
      index: operantType === IOperatantType.REGISTER ? (this.fp + value) : value,
    }
    // console.log('raw', ret, byteLength)
    // return ret
  }

  public parseValue(valueType: IOperatantType, value: any): any {
    switch (valueType) {
    case IOperatantType.CLOSURE_REGISTER:
      return this.callingFunctionInfo.closureScope.get(value) // [this.callingFunctionInfo.closureTable[value]]
    case IOperatantType.REGISTER:
      // 参数数量控制
      if (value <= -4) {
        if ((-4 - value) < this.callingFunctionInfo.args.length)  {
          return this.callingFunctionInfo.args[-4 - value]
        } else {
          return void 0
        }
      }
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
      return this.functionsTable[value]
    case IOperatantType.RETURN_VALUE:
      return this.stack[0]
    case IOperatantType.BOOLEAN:
      return !!value
    case IOperatantType.NULL:
      return null
    case IOperatantType.UNDEFINED:
      return void 0
    case IOperatantType.VAR_SYMBOL:
      return this.callingFunctionInfo.variables.get(value)
    default:
      throw new VMRunTimeError("Unknown operant " + valueType)
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
    func: Callable | undefined,
    o: any,
    funcName: string,
    numArgs: number,
    isNewExpression: boolean,
  ): boolean {
    const stack = this.stack
    const f = func || o[funcName]
    let isCallVMFunction = false
    const isNullOrUndefined = o === void 0 || o === null
    if ((f instanceof Callable) && !isNewExpression) {
      // console.log('---> THE IP IS -->', numArgs)
      const arg = new NumArgs(numArgs)
      if (!isNullOrUndefined) {
        if (typeof o[funcName] === 'function') {
          o[funcName](arg)
        } else {
          throw new VMRunTimeError(`The function ${funcName} is not a function`)
        }
      } else {
        f(arg)
      }
      isCallVMFunction = true
    } else {
      const args = []
      for (let i = 0; i < numArgs; i++) {
        args.unshift(stack[this.sp--])
      }
      // console.log(stack, args, 'good....')
      if (!isNullOrUndefined) {
        // try {
        // console.log(funcName)
        stack[0] = isNewExpression
          ? new o[funcName](...args)
          : o[funcName](...args)
        // } catch(e) {
        //   throw e
          // console.log(`Calling function "${funcName}" failed.`, typeof o)
          // console.trace(e)
          // if (!(e instanceof VMRunTimeError)) {
          // console.error(e)
          // throw new VMRunTimeError(e)
          // }
          // console.log(o[funcName]())
          // console.error(`Function '${funcName}' is not found.`, o)
          // throw e
        // }
      } else {
        stack[0] = isNewExpression
          ? new f(...args)
          : f(...args)
      }
      this.stack.splice(this.sp + 1)
    }
    return isCallVMFunction
  }

  public popToFunction(targetFunctionInfo: ICallingFunctionInfo): void {
    while (this.callingFunctionInfos[this.callingFunctionInfos.length - 1] !== targetFunctionInfo) {
      this.returnCurrentFunction()
    }
  }

  // tslint:disable-next-line: cognitive-complexity
  public parseToJsFunc (meta: FuncInfoMeta, closureScope: Scope): any {
    // console.log('meta -->', meta)
    const vm = this
    const func = function (this: any, ...args: any[]): any {
      // console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~> calling....')
      const [ip, _, localSize] = meta
      // console.log('running ip', ip)
      vm.isRunning = true
      const n = args[0]
      const isCalledFromJs = !(n instanceof NumArgs)
      let numArgs = 0
      let allArgs = []
      if (isCalledFromJs) {
        // args.reverse()
        args.forEach((arg: any): void => vm.push(arg))
        numArgs = args.length
        // args.reverse()
        // args.forEach((arg: any): void => vm.push(arg))
        allArgs = [...args]
      } else {
        numArgs = n.numArgs
        allArgs = []
        for (let i = 0; i < numArgs; i++) {
          allArgs.unshift(vm.stack[vm.sp - i])
        }
      }
      // console.log(allArgs)
      const currentCallingFunctionInfo: ICallingFunctionInfo =  vm.callingFunctionInfo = {
        closureScope: closureScope.fork(),
        variables: new Scope(),
        args: allArgs,
        returnValue: NO_RETURN_SYMBOL,
      }
      vm.callingFunctionInfos.push(vm.callingFunctionInfo)
      // console.log(vm.callingFunctionInfo.variables, 'start variables..')
      if (vm.allThis.length === 0) {
        vm.currentThis = vm.ctx
      } else {
        vm.currentThis = this || vm.ctx
      }
      vm.allThis.push(vm.currentThis)
      const stack = vm.stack
      if (isCalledFromJs) {
        stack[0] = undefined
      }
      // console.log('call', funcInfo, numArgs)
      //            | R3        |
      //            | R2        |
      //            | R1        |
      //            | R0        |
      //      sp -> | fp        | # for restoring old fp
      //            | ip        | # for restoring old ip
      //            | numArgs   | # for restoring old sp: old sp = current sp - numArgs - 3
      //            | arguments | # for store arguments for js `arguments` keyword
      //            | arg1      |
      //            | arg2      |
      //            | arg3      |
      //  old sp -> | ....      |
      stack[++vm.sp] = allArgs
      stack[++vm.sp] = numArgs
      stack[++vm.sp] = vm.ip
      stack[++vm.sp] = vm.fp
      // set to new ip and fp
      vm.ip = ip
      vm.fp = vm.sp
      vm.sp += localSize
      if (isCalledFromJs) {
        /** 嵌套 vm 函数调 vm 函数，需要知道嵌套多少层，等到当前层完结再返回 */
        let callCount = 1
        while (callCount > 0 && vm.isRunning) {
          const [op, isCallVMFunction] = vm.fetchAndExecute()
          if (isCallVMFunction) {
            callCount++
          } else if (op === I.RET) {
            callCount--
          }
        }
        if (currentCallingFunctionInfo.returnValue !== NO_RETURN_SYMBOL) {
          return currentCallingFunctionInfo.returnValue
        }
      }
    }
    Object.setPrototypeOf(func, Callable.prototype)
    Object.defineProperty(func, 'length', { value: meta[1] })
    vm.setMetaToFunc(func, meta)
    return func
  }

  private setMetaToFunc(func: any, meta: FuncInfoMeta): void {
    Object.defineProperty(func, '__vm_func_info__', {
      enumerable: false,
      value: { meta },
      writable: false,
    })
  }

  private getMetaFromFunc(func: any): { meta: FuncInfoMeta, closureTable: any } {
    return func.__vm_func_info__
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
  const funcsTable: FuncInfoMeta[] = parseFunctionTable(funcsBuf)
  console.log('string table', stringsTable)
  // console.log('function table', funcsTable)
  console.log(mainFunctionIndex, 'function basic index', funcionTableBasicIndex)
  console.log('total codes bytes length -->', codesBuf.byteLength)
  console.log('main start index', funcsTable[mainFunctionIndex][0], stringTableBasicIndex)

  return new VirtualMachine(codesBuf, funcsTable, mainFunctionIndex, stringsTable, globalsSize, ctx)
  // const mainFuncInfo = parseVmFunctionToJsFunction({
  //   meta: mainFuncMeta,
  //   closureTable: {},
  // }) // new FunctionInfo(mainFuncMeta[0], mainFuncMeta[1], mainFuncMeta[2], {})
}

type FuncInfoMeta = [number, number, number] // address, numArgs, numLocals

const parseFunctionTable = (buffer: ArrayBuffer): FuncInfoMeta[] => {
  const funcs: FuncInfoMeta[] = []
  let i = 0
  while (i < buffer.byteLength) {
    const ipEnd = i + 4
    const ip = readUInt32(buffer, i, ipEnd)
    const numArgsAndLocal = new Uint16Array(buffer.slice(ipEnd, ipEnd + 2 * 2))
    funcs.push([ip, numArgsAndLocal[0], numArgsAndLocal[1]])
    i += 8
  }
  // console.log('ALL FUNCTIONS META --->', funcs)
  return funcs
}

export { createVMFromArrayBuffer }

// https://hackernoon.com/creating-callable-objects-in-javascript-d21l3te1
// tslint:disable-next-line: max-classes-per-file
class Callable extends Function {
  constructor() {
    super()
  }
}

exports.Callable = Callable


// tslint:disable-next-line: max-classes-per-file
class NumArgs {
  constructor(public numArgs: number) {
  }
// tslint:disable-next-line: max-file-line-count
}
