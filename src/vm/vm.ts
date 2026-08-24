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

 // Calls a function value while preserving the receiver captured from a
 // MemberExpression. Appended to keep existing opcode numbers stable.
 CALL_REF,

 FORIN_INIT, FORIN_NEXT,

 FINALLY_END,

 LET, CONST, INIT,

  TYPEOF_CTX,

  // Object-literal accessor definition. Appended to preserve bytecode values.
  DEF_PROP,

  DELETE_REF,
  DELETE_CTX,
  GLOBAL_BIND,
  ENTER_WITH,
  EXIT_WITH,
  WITH_GET,
  WITH_SET,
  WITH_RESOLVE,
  WITH_TYPEOF,
  WITH_DELETE,
  DEF_DATA,
  ABRUPT_JUMP,
  SET_ARGS,
}

const NO_RETURN_SYMBOL = Symbol()

const ES5_WHITE_SPACE = /^[\u0009\u000B\u000C\u0020\u00A0\u000A\u000D\u2028\u2029\u1680\u180E\u2000-\u200A\u202F\u205F\u3000]+|[\u0009\u000B\u000C\u0020\u00A0\u000A\u000D\u2028\u2029\u1680\u180E\u2000-\u200A\u202F\u205F\u3000]+$/g
const toES5Number = (value: any): number => Number(
  typeof value === 'string' ? value.replace(ES5_WHITE_SPACE, '') : value,
)
const ES5NumberPrototype = new Number(0)
const ES5Number: any = function(this: any, value?: any): any {
  const number = arguments.length === 0 ? 0 : toES5Number(value)
  if (this instanceof ES5Number) {
    return Object.setPrototypeOf(new Number(number), ES5NumberPrototype)
  }
  return number
}
Object.defineProperty(ES5NumberPrototype, 'constructor', {
  configurable: true,
  value: ES5Number,
  writable: true,
})
ES5Number.prototype = ES5NumberPrototype
Object.setPrototypeOf(ES5Number, Number)
for (const name of ['MAX_VALUE', 'MIN_VALUE', 'NaN', 'NEGATIVE_INFINITY', 'POSITIVE_INFINITY']) {
  Object.defineProperty(ES5Number, name, {
    configurable: false,
    enumerable: false,
    value: (Number as any)[name],
    writable: false,
  })
}

const INTRINSIC_GLOBALS = new Map<string, any>([
  ['undefined', void 0],
  ['NaN', NaN],
  ['Infinity', Infinity],
  ['parseFloat', parseFloat],
  ['parseInt', parseInt],
  ['isFinite', isFinite],
  ['isNaN', isNaN],
  ['decodeURI', decodeURI],
  ['decodeURIComponent', decodeURIComponent],
  ['encodeURI', encodeURI],
  ['encodeURIComponent', encodeURIComponent],
])

class VMRunTimeError extends Error {
  constructor(public error: any) {
    super(error)
  }
}

interface ICallingFunctionInfo {
  isInitClosure: boolean,
  closureScope: Scope,
  variables: Scope | null,
  returnValue?: any,
  args: any[],
  argumentsValue: any,
  func?: CallableFunction,
  strict: boolean,
  capturedWithObjects: any[],
}

interface IArgumentsMeta {
  values: any[]
  mapped: Set<number>
}

const ARGUMENTS_META = Symbol('nestscript.arguments')
const RESTRICTED_PROPERTY_ACCESSOR: () => never =
  Object.getOwnPropertyDescriptor(Function.prototype, 'caller')!.get as () => never

const defineRestrictedProperties = (object: any, names: string[]): void => {
  for (const name of names) {
    Object.defineProperty(object, name, {
      configurable: false,
      enumerable: false,
      get: RESTRICTED_PROPERTY_ACCESSOR,
      set: RESTRICTED_PROPERTY_ACCESSOR,
    })
  }
}

type Completion =
  | { type: 'normal' }
  | { type: 'return', value: any, functionInfo: ICallingFunctionInfo }
  | { type: 'throw', value: any }
  | { type: 'jump', address: number, functionInfo: ICallingFunctionInfo }

interface ITryHandler {
  functionInfo: ICallingFunctionInfo
  catchAddress: number
  finallyAddress: number
  endAddress: number
  hasCatch: boolean
  hasFinally: boolean
  phase: 'try' | 'catch' | 'finally'
  pending?: Completion
  startAddress: number
}

interface IWithEnvironment {
  object: any
  functionInfo: ICallingFunctionInfo
  endAddress: number
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
    isInitClosure: true,
    closureScope: new Scope(),
    variables: new Scope(),
    args: [],
    argumentsValue: [],
    strict: false,
    capturedWithObjects: [],
  }
  public callingFunctionInfos: ICallingFunctionInfo[] = []
  public tryHandlers: ITryHandler[] = []
  public withEnvironments: IWithEnvironment[] = []

  /** this 链 */
  public currentThis: any
  public allThis: any[] = []

  public isRunning: boolean = false
  public mainFunction: CallableFunction

  public error: any

  constructor (
    public codes: Uint8Array,
    public functionsTable: FuncInfoMeta[],
    public entryIndx: number,
    public stringsTable: string[],
    public globalSize: number,
    public ctx: any,
  ) {
    // These are immutable properties of the ES5 global object. Contexts are
    // supplied by the embedder, so normalize the descriptors at the boundary
    // instead of inheriting modern object-literal defaults from the harness.
    for (const [name, value] of [
      ['undefined', void 0],
      ['NaN', NaN],
      ['Infinity', Infinity],
    ] as Array<[string, any]>) {
      const descriptor = Object.getOwnPropertyDescriptor(ctx, name)
      if (!descriptor || descriptor.configurable) {
        Object.defineProperty(ctx, name, {
          configurable: false,
          enumerable: false,
          value,
          writable: false,
        })
      }
    }
    if (ctx.Number === Number) {
      ctx.Number = ES5Number
    }
    for (const name of [
      'Object', 'Function', 'Array', 'String', 'Boolean', 'Number', 'Date', 'RegExp',
      'Error', 'EvalError', 'RangeError', 'ReferenceError', 'SyntaxError', 'TypeError', 'URIError',
      'Math', 'JSON', 'parseFloat', 'parseInt', 'isFinite', 'isNaN',
      'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent',
    ]) {
      const descriptor = Object.getOwnPropertyDescriptor(ctx, name)
      if (descriptor && descriptor.enumerable) {
        Object.defineProperty(ctx, name, { ...descriptor, enumerable: false })
      }
    }
    const mainClosureScope = new Scope()
    mainClosureScope.isRestoreWhenChange = false
    this.mainFunction = this.parseToJsFunc(functionsTable[this.entryIndx], mainClosureScope)
    this.init()
  }

  public init(): void {
    const { globalSize, mainFunction } = this
    const { meta } = this.getMetaFromFunc(mainFunction)
    const [ip, numArgs, localSize] = meta
    this.stack.splice(0)
    // Index 0 is the VM return register. Materialize it as an own data
    // property so numeric accessors installed on Object.prototype by guest
    // code cannot intercept writes to VM internals.
    this.setStack(0, undefined)
    const globalIndex = globalSize + 1
    this.fp = globalIndex // fp 指向 old fp 位置，兼容普通函数
    this.setStack(this.fp, -1)
    this.sp = this.fp
    this.stack.length = this.sp + 1
    this.callingFunctionInfos = []
    this.tryHandlers = []
    this.withEnvironments = []
    this.allThis = []
  }

  public reset(): void {
    this.init()
    this.error = null
  }

  // tslint:disable-next-line: no-big-function
  public run(): void {
    // Script code always receives the global object as its this value; a
    // top-level strict directive changes statement semantics, not Script this.
    this.callFunctionValue(this.mainFunction, this.ctx, 0, false)
    this.isRunning = true
    while (this.isRunning) {
      this.executeNext()
    }
  }

  public executeNext(exceptionBoundary?: ICallingFunctionInfo): [I, boolean] {
    try {
      return this.fetchAndExecute()
    } catch(e) {
      if (e instanceof VMRunTimeError) {
        throw e
      }
      if (this.handleThrow(e, exceptionBoundary)) {
        return [I.THROW, false]
      }
      throw e
    }
  }

  public setReg(dst: IOperant, src: { value: any }): void {
    const callingFunctionInfo = this.callingFunctionInfo
    if (dst.type === IOperatantType.VAR_SYMBOL) {
      this.checkVariableScopeAndNew()
      callingFunctionInfo.variables!.set(dst.index, src.value)
    } else if (dst.type === IOperatantType.CLOSURE_REGISTER) {
      this.checkClosureAndFork()
      this.callingFunctionInfo.closureScope.set(dst.index, src.value)
    } else if (dst.type === IOperatantType.REGISTER || dst.type === IOperatantType.RETURN_VALUE) {
      if (dst.type === IOperatantType.RETURN_VALUE) {
        this.callingFunctionInfo.returnValue = src.value
      }
      if (dst.raw <= -4) {
        const index = -4 - dst.raw
        this.callingFunctionInfo.args[index] = src.value
        const argsObject = this.callingFunctionInfo.argumentsValue
        const meta: IArgumentsMeta | undefined = argsObject && argsObject[ARGUMENTS_META]
        if (meta && meta.mapped.has(index) && Object.prototype.hasOwnProperty.call(argsObject, index)) {
          Reflect.set(argsObject, index, src.value)
        }
      } else {
        this.setStack(dst.index, src.value)
      }
    } else {
      console.error(dst)
      throw new Error(`Cannot process register type ${dst.type}`)
    }
  }

  public newReg(o: IOperant): any {
    this.newBinding(o, true, true)
  }

  public newBinding(o: IOperant, mutable: boolean, initialized: boolean): any {
    const callingFunctionInfo = this.callingFunctionInfo
    if (o.type === IOperatantType.VAR_SYMBOL) {
      this.checkVariableScopeAndNew()
      this.callingFunctionInfo.variables!.new(o.index, { mutable, initialized })
    } else if (o.type === IOperatantType.CLOSURE_REGISTER) {
      this.checkClosureAndFork()
      this.callingFunctionInfo.closureScope.new(o.index, { mutable, initialized })
    } else {
      console.error(o)
      throw new Error(`Cannot process register type ${o.type}`)
    }
  }

  public initReg(dst: IOperant, src: { value: any }): void {
    if (dst.type === IOperatantType.VAR_SYMBOL) {
      this.checkVariableScopeAndNew()
      this.callingFunctionInfo.variables!.init(dst.index, src.value)
    } else if (dst.type === IOperatantType.CLOSURE_REGISTER) {
      this.checkClosureAndFork()
      this.callingFunctionInfo.closureScope.init(dst.index, src.value)
    } else {
      throw new Error(`Cannot initialize register type ${dst.type}`)
    }
  }

  public getReg(o: IOperant): any {
    if (o.type === IOperatantType.VAR_SYMBOL) {
      if (!this.callingFunctionInfo.variables) {
        throw new Error('variable is not declared.')
      }
      return this.callingFunctionInfo.variables.get(o.index)
    } else if (o.type === IOperatantType.CLOSURE_REGISTER) {
      return this.callingFunctionInfo.closureScope.get(o.index)
    } else if (o.type === IOperatantType.REGISTER || o.type === IOperatantType.RETURN_VALUE) {
      return this.stack[o.index]
    } else {
      throw new Error(`Cannot process register type ${o.type}`)
    }
  }

  // tslint:disable-next-line: no-big-function cognitive-complexity
  public fetchAndExecute(): [I, boolean] {
    if (!this.isRunning) {
      throw new VMRunTimeError('try to run again...')
    }
    let op = this.nextOperator()
    // 用来判断是否嵌套调用 vm 函数
    let isCallVMFunction = false
    // tslint:disable-next-line: max-switch-cases
    switch (op) {
    case I.VAR:
    case I.CLS: {
      const o = this.nextOperant(false)
      this.newReg(o)
      break
    }
    case I.GLOBAL_BIND: {
      const binding = this.nextOperant(false)
      const name = this.nextOperant().value
      this.newReg(binding)
      const variables = this.callingFunctionInfo.variables!
      const closureScope = this.callingFunctionInfo.closureScope
      if (!Object.prototype.hasOwnProperty.call(this.ctx, name)) {
        Object.defineProperty(this.ctx, name, {
          configurable: false,
          enumerable: true,
          get: (): any => binding.type === IOperatantType.CLOSURE_REGISTER
            ? closureScope.get(binding.index)
            : variables.get(binding.index),
          set: (value: any): void => binding.type === IOperatantType.CLOSURE_REGISTER
            ? closureScope.set(binding.index, value)
            : variables.set(binding.index, value),
        })
      }
      break
    }
    case I.LET:
    case I.CONST: {
      const o = this.nextOperant(false)
      this.newBinding(o, op === I.LET, false)
      break
    }
    case I.INIT: {
      const dst = this.nextOperant(false)
      const src = this.nextOperant()
      this.initReg(dst, src)
      break
    }

    case I.PUSH: {
      const value = this.nextOperant().value
      this.push(value)
      break
    }
    case I.EXIT: {
      this.isRunning = false
      break
    }
    case I.RET: {
      if (!this.beginReturn()) {
        this.returnCurrentFunction()
      }
      break
    }
    case I.PRINT: {
      const val = this.nextOperant()
      console.log(val.value)
      break
    }
    case I.MOV: {
      const dst = this.nextOperant(false)
      const src = this.nextOperant()
      this.setReg(dst, src)
      break
    }
    case I.JMP: {
      const address = this.nextOperant()
      this.ip = address.value
      break
    }
    case I.ABRUPT_JUMP: {
      const address = this.nextOperant().value
      this.routeJump({ type: 'jump', address, functionInfo: this.callingFunctionInfo })
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
    case I.CALL_REF: {
      const f = this.nextOperant().value
      const receiver = this.nextOperant().value
      const numArgs = this.nextOperant().value
      const isNewExpression = this.nextOperant().value
      isCallVMFunction = this.callFunctionValue(f, receiver, numArgs, isNewExpression)
      break
    }
    case I.MOV_CTX: {
      const dst = this.nextOperant(false)
      const propKey = this.nextOperant()
      const key = propKey.value
      let src
      if (this.ctx !== null && this.ctx !== void 0 && key in Object(this.ctx)) {
        src = this.ctx[key]
      } else if (INTRINSIC_GLOBALS.has(key)) {
        src = INTRINSIC_GLOBALS.get(key)
      } else {
        throw new ReferenceError(`${key} is not defined`)
      }
      this.setReg(dst, { value: src })
      break
    }
    case I.TYPEOF_CTX: {
      const dst = this.nextOperant(false)
      const key = this.nextOperant().value
      let value
      if (this.ctx !== null && this.ctx !== void 0 && key in Object(this.ctx)) {
        value = this.ctx[key]
      } else if (INTRINSIC_GLOBALS.has(key)) {
        value = INTRINSIC_GLOBALS.get(key)
      } else {
        this.setReg(dst, { value: 'undefined' })
        break
      }
      this.setReg(dst, { value: typeof value })
      break
    }
    case I.SET_CTX: {
      const propKey = this.nextOperant()
      const val = this.nextOperant()
      const key = propKey.value
      if (this.callingFunctionInfo.strict && !(key in Object(this.ctx)) && !INTRINSIC_GLOBALS.has(key)) {
        throw new ReferenceError(`${key} is not defined`)
      }
      const success = Reflect.set(this.ctx, key, val.value)
      if (!success && this.callingFunctionInfo.strict) {
        throw new TypeError(`Cannot assign to read only property '${String(key)}'`)
      }
      break
    }
    case I.ENTER_WITH: {
      const value = this.nextOperant().value
      const endAddress = this.nextOperant().value
      if (value === null || value === undefined) {
        throw new TypeError(`Cannot convert ${value} to object`)
      }
      this.appendInternal(this.withEnvironments, {
        object: Object(value),
        functionInfo: this.callingFunctionInfo,
        endAddress,
      })
      break
    }
    case I.EXIT_WITH: {
      const environment = this.withEnvironments[this.withEnvironments.length - 1]
      if (environment && environment.functionInfo === this.callingFunctionInfo) {
        this.withEnvironments.pop()
      }
      break
    }
    case I.WITH_GET:
    case I.WITH_TYPEOF: {
      const dst = this.nextOperant(false)
      const name = this.nextOperant().value
      const fallbackKind = this.nextOperant().value
      const fallback = this.nextOperant(false)
      const environment = this.findWithEnvironment(name)
      let value
      if (environment) {
        value = environment.object[name]
      } else {
        value = this.readNameFallback(name, fallbackKind, fallback, op === I.WITH_TYPEOF)
      }
      this.setReg(dst, { value: op === I.WITH_TYPEOF ? typeof value : value })
      break
    }
    case I.WITH_SET: {
      const name = this.nextOperant().value
      const fallbackKind = this.nextOperant().value
      const fallback = this.nextOperant(false)
      const value = this.nextOperant().value
      const environment = this.findWithEnvironment(name)
      if (environment) {
        const success = Reflect.set(environment.object, name, value)
        if (!success && this.callingFunctionInfo.strict) {
          throw new TypeError(`Cannot assign to read only property '${String(name)}'`)
        }
      } else {
        this.writeNameFallback(name, fallbackKind, fallback, value)
      }
      break
    }
    case I.WITH_RESOLVE: {
      const dst = this.nextOperant(false)
      const receiverDst = this.nextOperant(false)
      const name = this.nextOperant().value
      const fallbackKind = this.nextOperant().value
      const fallback = this.nextOperant(false)
      const environment = this.findWithEnvironment(name)
      if (environment) {
        this.setReg(dst, { value: environment.object[name] })
        this.setReg(receiverDst, { value: environment.object })
      } else {
        this.setReg(dst, { value: this.readNameFallback(name, fallbackKind, fallback, false) })
        this.setReg(receiverDst, { value: fallbackKind === 0 ? this.ctx : undefined })
      }
      break
    }
    case I.WITH_DELETE: {
      const dst = this.nextOperant(false)
      const name = this.nextOperant().value
      const fallbackKind = this.nextOperant().value
      // Consume the statically encoded fallback even though only its kind is
      // needed for deletion.
      this.nextOperant(false)
      const environment = this.findWithEnvironment(name)
      let deleted
      if (environment) {
        deleted = Reflect.deleteProperty(environment.object, name)
      } else if (fallbackKind === 0) {
        deleted = INTRINSIC_GLOBALS.has(name) ? false : Reflect.deleteProperty(this.ctx, name)
      } else {
        deleted = false
      }
      if (!deleted && this.callingFunctionInfo.strict) {
        throw new TypeError(`Cannot delete property '${String(name)}'`)
      }
      this.setReg(dst, { value: deleted })
      break
    }
    case I.NEW_OBJ: {
      const dst = this.nextOperant(false)
      const o = {}
      this.setReg(dst, { value: o })
      break
    }
    case I.NEW_REG: {
      const dst = this.nextOperant(false)
      const pattern = this.nextOperant()
      const flags = this.nextOperant()
      try {
        this.setReg(dst, { value: new RegExp(pattern.value, flags.value) })
      } catch(e) {
        throw new VMRunTimeError(e)
      }
      break
    }
    case I.NEW_ARR: {
      const dst = this.nextOperant(false)
      const o: any[] = []
      this.setReg(dst, { value: o })
      break
    }
    case I.SET_KEY: {
      const o = this.nextOperant().value
      const key = this.nextOperant().value
      const value = this.nextOperant().value
      const success = Reflect.set(o, key, value)
      if (!success && this.callingFunctionInfo.strict) {
        throw new TypeError(`Cannot assign to read only property '${String(key)}'`)
      }
      const meta: IArgumentsMeta | undefined = o && o[ARGUMENTS_META]
      const index = typeof key === 'symbol' ? NaN : (typeof key === 'number' ? key : Number(key))
      if (meta && Number.isInteger(index) && String(index) === String(key) && meta.mapped.has(index)) {
        meta.values[index] = value
      }
      break
    }
    case I.DEF_PROP: {
      const o = this.nextOperant().value
      const key = this.nextOperant().value
      const accessor = this.nextOperant().value
      const kind = this.nextOperant().value
      Object.defineProperty(o, key, {
        [kind]: accessor,
        configurable: true,
        enumerable: true,
      })
      break
    }
    case I.DEF_DATA: {
      const object = this.nextOperant().value
      const key = this.nextOperant().value
      const value = this.nextOperant().value
      Object.defineProperty(object, key, {
        configurable: true,
        enumerable: true,
        value,
        writable: true,
      })
      break
    }
    /** 这是定义一个函数 */
    case I.FUNC: {
      const dst = this.nextOperant(false)
      const funcOperant = this.nextOperant()
      const funcInfoMeta = funcOperant.value
      const func = this.parseToJsFunc(
        funcInfoMeta,
        this.callingFunctionInfo.closureScope.fork(),
        this.currentThis,
        this.callingFunctionInfo.argumentsValue,
        this.captureWithObjects(),
      )
      this.setReg(dst, { value: func })
      break
    }
    case I.MOV_PROP: {
      const dst = this.nextOperant(false)
      const o = this.nextOperant()
      const k = this.nextOperant()
      let v = o.value[k.value] // getByProp(o.value, k.value)
      // Host Object(number) instances inherit the host Number constructor.
      // Present the context's ES5 Number constructor at the guest boundary.
      if (k.value === 'constructor' && v === Number && this.ctx.Number === ES5Number) {
        v = ES5Number
      }
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
      this.uniaryExpression((val: any): any => toES5Number(val))
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
    case I.DELETE_REF: {
      const dst = this.nextOperant(false)
      const base = this.nextOperant().value
      const key = this.nextOperant().value
      if (base === null || base === undefined) {
        throw new TypeError(`Cannot convert ${base} to object`)
      }
      const object = Object(base)
      // ES5 function `length` is non-configurable. Modern hosts commonly make
      // built-in constructor lengths configurable, so do not leak that newer
      // host-realm difference into guest semantics.
      const deleted = typeof object === 'function' && key === 'length'
        ? false
        : Reflect.deleteProperty(object, key)
      const meta: IArgumentsMeta | undefined = object && object[ARGUMENTS_META]
      const index = typeof key === 'symbol' ? NaN : (typeof key === 'number' ? key : Number(key))
      if (deleted && meta && Number.isInteger(index) && String(index) === String(key)) {
        meta.mapped.delete(index)
      }
      if (!deleted && this.callingFunctionInfo.strict) {
        throw new TypeError(`Cannot delete property '${String(key)}'`)
      }
      this.setReg(dst, { value: deleted })
      break
    }
    case I.DELETE_CTX: {
      const dst = this.nextOperant(false)
      const key = this.nextOperant().value
      const deleted = INTRINSIC_GLOBALS.has(key)
        ? false
        : Reflect.deleteProperty(this.ctx, key)
      if (!deleted && this.callingFunctionInfo.strict) {
        throw new TypeError(`Cannot delete property '${String(key)}'`)
      }
      this.setReg(dst, { value: deleted })
      break
    }
    case I.MOV_THIS: {
      this.setReg(this.nextOperant(false), { value: this.currentThis })
      break
    }
    case I.TRY: {
      const catchAddress = this.nextOperant().value
      const finallyAddress = this.nextOperant().value
      const endAddress = this.nextOperant().value
      const hasCatch = this.nextOperant().value
      const hasFinally = this.nextOperant().value
      this.appendInternal(this.tryHandlers, {
        functionInfo: this.callingFunctionInfo,
        catchAddress,
        finallyAddress,
        endAddress,
        hasCatch,
        hasFinally,
        phase: 'try',
        startAddress: this.ip,
      })
      break
    }
    case I.THROW: {
      const err = this.nextOperant()
      throw err.value
      // throw new VMRunTimeError(err)
      break
    }
    case I.TRY_END: {
      this.finishTryRegion()
      break
    }
    case I.FINALLY_END: {
      this.finishFinally()
      break
    }
    case I.GET_ERR: {
      const o = this.nextOperant(false)
      this.setReg(o, { value: this.error })
      break
    }
    case I.MOV_ARGS: {
      const dst = this.nextOperant(false)
      this.setReg(dst, { value: this.callingFunctionInfo.argumentsValue })
      break
    }
    case I.SET_ARGS: {
      this.callingFunctionInfo.argumentsValue = this.nextOperant().value
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
      break
    }

    case I.FORIN_INIT: {
      const dst = this.nextOperant(false)
      const target = this.nextOperant().value
      const keys: string[] = []
      // Match JavaScript for-in enumeration, including inherited enumerable
      // string properties.
      // tslint:disable-next-line: forin
      for (const key in target) {
        this.appendInternal(keys, key)
      }
      this.setReg(dst, { value: { index: 0, keys } })
      break
    }
    case I.FORIN_NEXT: {
      const dst = this.nextOperant(false)
      const iterator = this.nextOperant().value
      const endAddress = this.nextOperant().value
      if (iterator.index >= iterator.keys.length) {
        this.ip = endAddress
      } else {
        this.setReg(dst, { value: iterator.keys[iterator.index++] })
      }
      break
    }

    case I.BLOCK: {
      const o= this.nextOperant()
      this.checkClosureAndFork()
      this.checkVariableScopeAndNew()
      this.callingFunctionInfo.closureScope.front(o.value)
      this.callingFunctionInfo.variables!.front(o.value)
      break
    }
    case I.CLR_BLOCK:
    case I.END_BLOCK: {
      const o = this.nextOperant()
      this.callingFunctionInfo.closureScope.back(o.value)
      this.callingFunctionInfo.variables!.back(o.value)
      break
    }

    default:
      throw new VMRunTimeError("Unknow command " + op + " " + I[op],)
    }

    return [op, isCallVMFunction]
  }

  public checkClosureAndFork(): void {
    const callingFunctionInfo = this.callingFunctionInfo
    if (!callingFunctionInfo.isInitClosure) {
      callingFunctionInfo.closureScope = this.callingFunctionInfo.closureScope.fork()
      callingFunctionInfo.isInitClosure = true
    }
  }

  public checkVariableScopeAndNew(): void {
    if (!this.callingFunctionInfo.variables) {
      this.callingFunctionInfo.variables = new Scope()
    }
  }

  /**
   * Route a return through every active finally block in the current function.
   * The return value is captured because calls made by finally can overwrite
   * the VM's shared return register at stack[0].
   */
  public beginReturn(): boolean {
    const functionInfo = this.callingFunctionInfo
    const value = functionInfo.returnValue === NO_RETURN_SYMBOL
      ? void 0
      : functionInfo.returnValue
    return this.routeReturn({ type: 'return', value, functionInfo })
  }

  private routeReturn(completion: Extract<Completion, { type: 'return' }>): boolean {
    while (this.tryHandlers.length > 0) {
      const handler = this.tryHandlers[this.tryHandlers.length - 1]
      if (handler.functionInfo !== completion.functionInfo) {
        break
      }
      if (handler.phase !== 'finally' && handler.hasFinally) {
        handler.phase = 'finally'
        handler.pending = completion
        this.ip = handler.finallyAddress
        return true
      }
      // Returning from a catch without finally, or returning from inside a
      // finally, discards that handler and continues unwinding outward.
      this.tryHandlers.pop()
    }
    return false
  }

  private routeJump(completion: Extract<Completion, { type: 'jump' }>): void {
    while (this.tryHandlers.length > 0) {
      const handler = this.tryHandlers[this.tryHandlers.length - 1]
      if (handler.functionInfo !== completion.functionInfo) {
        break
      }

      // A jump whose destination remains inside this TryStatement does not
      // leave its protected region and therefore must not run finally yet.
      if (
        handler.phase !== 'finally' &&
        completion.address >= handler.startAddress &&
        completion.address < handler.endAddress
      ) {
        this.ip = completion.address
        return
      }

      if (handler.phase !== 'finally' && handler.hasFinally) {
        handler.phase = 'finally'
        handler.pending = completion
        this.ip = handler.finallyAddress
        return
      }
      this.tryHandlers.pop()
    }
    this.ip = completion.address
  }

  private finishTryRegion(): void {
    const handler = this.tryHandlers[this.tryHandlers.length - 1]
    if (!handler || handler.functionInfo !== this.callingFunctionInfo || handler.phase === 'finally') {
      throw new VMRunTimeError('TRY_END without an active try or catch region')
    }
    if (handler.hasFinally) {
      handler.phase = 'finally'
      handler.pending = { type: 'normal' }
      this.ip = handler.finallyAddress
    } else {
      this.tryHandlers.pop()
      this.ip = handler.endAddress
    }
  }

  private finishFinally(): void {
    const handler = this.tryHandlers.pop()
    if (!handler || handler.phase !== 'finally') {
      throw new VMRunTimeError('FINALLY_END without an active finally region')
    }
    const pending = handler.pending || { type: 'normal' }
    if (pending.type === 'normal') {
      this.ip = handler.endAddress
      return
    }
    if (pending.type === 'return') {
      pending.functionInfo.returnValue = pending.value
      this.setStack(0, pending.value)
      if (!this.routeReturn(pending)) {
        this.returnCurrentFunction()
      }
      return
    }
    if (pending.type === 'jump') {
      this.routeJump(pending)
      return
    }
    throw pending.value
  }

  private handleThrow(error: any, exceptionBoundary?: ICallingFunctionInfo): boolean {
    while (this.tryHandlers.length > 0) {
      const handler = this.tryHandlers[this.tryHandlers.length - 1]

      // A VM function can be entered synchronously by a host operation (for
      // example ToPrimitive calling valueOf). A handler in the VM frame that
      // initiated that host operation must not consume the exception before
      // the host operation itself has unwound; otherwise coercion continues
      // and may evaluate the right operand after the left already threw.
      if (exceptionBoundary) {
        const boundaryIndex = this.callingFunctionInfos.indexOf(exceptionBoundary)
        const handlerIndex = this.callingFunctionInfos.indexOf(handler.functionInfo)
        if (handlerIndex < boundaryIndex) {
          return false
        }
      }

      if (this.callingFunctionInfo !== handler.functionInfo) {
        this.popToFunction(handler.functionInfo)
      }

      if (handler.phase === 'try' && handler.hasCatch) {
        handler.phase = 'catch'
        this.error = error
        this.ip = handler.catchAddress
        return true
      }

      if (handler.phase !== 'finally' && handler.hasFinally) {
        handler.phase = 'finally'
        handler.pending = { type: 'throw', value: error }
        this.ip = handler.finallyAddress
        return true
      }

      // A new exception in catch without finally, or in finally itself,
      // supersedes the current handler and continues toward the outer one.
      this.tryHandlers.pop()
    }
    return false
  }

  public returnCurrentFunction(): void {
    const stack = this.stack
    const fp = this.fp
    const completedFunction = this.callingFunctionInfo
    this.fp = stack[fp]
    this.ip = stack[fp - 1]
    // 减去参数数量，减去三个 fp ip numArgs args
    this.sp = fp - stack[fp - 2] - 4
    // 清空上一帧
    this.stack.splice(this.sp + 1)
    if (this.callingFunctionInfo.returnValue === NO_RETURN_SYMBOL) {
      this.setStack(0, undefined)
    }
    this.allThis.pop()
    this.currentThis = this.allThis[this.allThis.length - 1]
    this.callingFunctionInfos.pop()
    this.callingFunctionInfo = this.callingFunctionInfos[this.callingFunctionInfos.length - 1]
    this.withEnvironments = this.withEnvironments.filter((environment): boolean => {
      return environment.functionInfo !== completedFunction
    })
  }

  public push(val: any): void {
    this.setStack(++this.sp, val)
  }

  private setStack(index: number, value: any): void {
    this.setArrayIndex(this.stack, index, value)
  }

  private appendInternal<T>(array: T[], value: T): void {
    this.setArrayIndex(array, array.length, value)
  }

  private setArrayIndex<T>(array: T[], index: number, value: T): void {
    if (
      !Object.prototype.hasOwnProperty.call(array, index) &&
      index in array
    ) {
      // An inherited numeric accessor/data property must not intercept VM
      // internals. This is rare; keep the common path as a normal fast write.
      Object.defineProperty(array, index, {
        configurable: true,
        enumerable: true,
        value,
        writable: true,
      })
    } else {
      array[index] = value
    }
  }

  private findWithEnvironment(name: string): IWithEnvironment | undefined {
    // A jump or exception can leave the lexical region without executing its
    // explicit EXIT_WITH. Expire such entries by their bytecode end address.
    this.withEnvironments = this.withEnvironments.filter((environment): boolean => {
      return environment.functionInfo !== this.callingFunctionInfo || this.ip < environment.endAddress
    })
    for (let i = this.withEnvironments.length - 1; i >= 0; i--) {
      const environment = this.withEnvironments[i]
      if (
        environment.functionInfo === this.callingFunctionInfo &&
        name in environment.object
      ) {
        return environment
      }
    }
    const captured = this.callingFunctionInfo.capturedWithObjects || []
    for (let i = captured.length - 1; i >= 0; i--) {
      if (name in captured[i]) {
        return {
          object: captured[i],
          functionInfo: this.callingFunctionInfo,
          endAddress: Number.POSITIVE_INFINITY,
        }
      }
    }
    return undefined
  }

  private captureWithObjects(): any[] {
    const objects = [...(this.callingFunctionInfo.capturedWithObjects || [])]
    for (const environment of this.withEnvironments) {
      if (
        environment.functionInfo === this.callingFunctionInfo &&
        this.ip < environment.endAddress
      ) {
        objects.push(environment.object)
      }
    }
    return objects
  }

  private readNameFallback(
    name: string,
    kind: number,
    fallback: IOperant,
    typeofSafe: boolean,
  ): any {
    if (kind === 1) {
      return this.parseValue(fallback.type, fallback.raw)
    }
    if (kind === 2) {
      return this.callingFunctionInfo.argumentsValue
    }
    if (this.ctx !== null && this.ctx !== undefined && name in Object(this.ctx)) {
      return this.ctx[name]
    }
    if (INTRINSIC_GLOBALS.has(name)) {
      return INTRINSIC_GLOBALS.get(name)
    }
    if (typeofSafe) {
      return undefined
    }
    throw new ReferenceError(`${name} is not defined`)
  }

  private writeNameFallback(name: string, kind: number, fallback: IOperant, value: any): void {
    if (kind === 1) {
      this.setReg(fallback, { value })
      return
    }
    if (kind === 2) {
      this.callingFunctionInfo.argumentsValue = value
      return
    }
    if (this.callingFunctionInfo.strict && !(name in Object(this.ctx)) && !INTRINSIC_GLOBALS.has(name)) {
      throw new ReferenceError(`${name} is not defined`)
    }
    const success = Reflect.set(this.ctx, name, value)
    if (!success && this.callingFunctionInfo.strict) {
      throw new TypeError(`Cannot assign to read only property '${String(name)}'`)
    }
  }

  public nextOperator(): I {
    return readUInt8(this.codes, this.ip, ++this.ip)
  }

  public nextOperant(resolveValue: boolean = true): IOperant {
    const [operantType, value, byteLength] = getOperatantByBuffer(this.codes, this.ip++)
    this.ip = this.ip + byteLength
    if (operantType === IOperatantType.REGISTER) {
    }
    return {
      type: operantType,
      value: resolveValue ? this.parseValue(operantType, value) : value,
      raw: value,
      index: operantType === IOperatantType.REGISTER ? (this.fp + value) : value,
    }
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
      if (!this.callingFunctionInfo.variables) {
        return undefined
      }
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
    const f = func !== void 0 ? func : o[funcName]
    const isNullOrUndefined = o === void 0 || o === null || o === this.ctx
    return this.invokeFunction(f, o, !isNullOrUndefined, numArgs, isNewExpression)
  }

  public callFunctionValue(
    func: any,
    receiver: any,
    numArgs: number,
    isNewExpression: boolean,
  ): boolean {
    return this.invokeFunction(func, receiver, true, numArgs, isNewExpression)
  }

  private invokeFunction(
    func: any,
    receiver: any,
    hasReceiver: boolean,
    numArgs: number,
    isNewExpression: boolean,
  ): boolean {
    if (typeof func !== 'function') {
      throw new TypeError('Value is not a function')
    }

    if (
      isNewExpression &&
      func instanceof Callable &&
      (this.getMetaFromFunc(func).meta[3] & 1) === 1
    ) {
      throw new TypeError('Arrow functions are not constructors')
    }

    if ((func instanceof Callable) && !isNewExpression) {
      const arg = new NumArgs(numArgs)
      if (hasReceiver) {
        func.call(receiver, arg)
      } else {
        func(arg)
      }
      return true
    }

    const args = new Array(numArgs)
    for (let i = 0; i < numArgs; i++) {
      this.setArrayIndex(args, numArgs - i - 1, this.stack[this.sp--])
    }
    this.setStack(0, isNewExpression
      ? new func(...args)
      : func.apply(hasReceiver ? receiver : void 0, args))
    this.stack.splice(this.sp + 1)
    return false
  }

  public popToFunction(targetFunctionInfo: ICallingFunctionInfo): void {
    while (this.callingFunctionInfos[this.callingFunctionInfos.length - 1] !== targetFunctionInfo) {
      this.returnCurrentFunction()
    }
  }

  // tslint:disable-next-line: cognitive-complexity
  public parseToJsFunc (
    meta: FuncInfoMeta,
    closureScope: Scope,
    lexicalThis?: any,
    lexicalArguments?: any,
    lexicalWithObjects: any[] = [],
  ): any {
    const vm = this
    const isArrow = (meta[3] & 1) === 1
    const isStrict = (meta[3] & 2) === 2
    const usesArguments = (meta[3] & 4) === 4
    const func = function (this: any, ...args: any[]): any {
      const [ip, _, localSize] = meta
      vm.isRunning = true
      // Reading index 0 from an empty rest array would consult
      // Object.prototype. User code is allowed to install an accessor there;
      // in that case the accessor may itself be a VM function and recurse.
      const n = args.length > 0 ? args[0] : undefined
      const isCalledFromJs = !(n instanceof NumArgs)
      let numArgs = 0
      let allArgs = []
      if (isCalledFromJs) {
        args.forEach((arg: any): void => vm.push(arg))
        numArgs = args.length
        allArgs = [...args]
      } else {
        numArgs = n.numArgs
        const end = vm.sp + 1
        allArgs = vm.stack.slice(end - numArgs, end) // []
      }
      const currentCallingFunctionInfo: ICallingFunctionInfo =  vm.callingFunctionInfo = {
        isInitClosure: false,
        closureScope,
        variables: null,
        args: allArgs,
        argumentsValue: isArrow ? (lexicalArguments || []) : undefined,
        func,
        strict: isStrict,
        capturedWithObjects: lexicalWithObjects,
        returnValue: NO_RETURN_SYMBOL,
      }
      if (!isArrow && usesArguments) {
        currentCallingFunctionInfo.argumentsValue = vm.createArgumentsObject(
          allArgs,
          func,
          isStrict,
          meta[1],
        )
      }
      vm.appendInternal(vm.callingFunctionInfos, vm.callingFunctionInfo)
      if (isArrow) {
        vm.currentThis = lexicalThis
      } else if (isStrict) {
        vm.currentThis = this
      } else {
        vm.currentThis = this === void 0 || this === null ? vm.ctx : Object(this)
      }
      vm.appendInternal(vm.allThis, vm.currentThis)
      const stack = vm.stack
      if (isCalledFromJs) {
        vm.setStack(0, undefined)
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
      vm.setStack(++vm.sp, allArgs)
      vm.setStack(++vm.sp, numArgs)
      vm.setStack(++vm.sp, vm.ip)
      vm.setStack(++vm.sp, vm.fp)
      // set to new ip and fp
      vm.ip = ip
      vm.fp = vm.sp
      vm.sp += localSize
      if (isCalledFromJs) {
        try {
          // A throw can unwind several VM frames at once before a catch handles
          // it. Counting CALL/RET opcodes therefore loses track of the host call
          // boundary. Run until this exact frame has been removed instead.
          while (
            vm.callingFunctionInfos.includes(currentCallingFunctionInfo) &&
            vm.isRunning
          ) {
            vm.executeNext(currentCallingFunctionInfo)
          }
        } catch(e) {
          // An exception escaping to native JavaScript must leave the VM at
          // the frame that invoked this wrapper. Otherwise the next call into
          // the same exported function resumes a half-unwound stack.
          while (vm.callingFunctionInfos.includes(currentCallingFunctionInfo)) {
            const abandonedFrame = vm.callingFunctionInfo
            vm.tryHandlers = vm.tryHandlers.filter((handler): boolean => {
              return handler.functionInfo !== abandonedFrame
            })
            vm.returnCurrentFunction()
          }
          throw e
        }
        if (currentCallingFunctionInfo.returnValue !== NO_RETURN_SYMBOL) {
          return currentCallingFunctionInfo.returnValue
        }
      }
    }
    Object.setPrototypeOf(func, Callable.prototype)
    try {
      Object.defineProperty(func, 'length', { value: meta[1] })
    } catch(e) {}
    vm.setMetaToFunc(func, meta)
    try {
      if (isStrict) {
        defineRestrictedProperties(func, ['caller', 'arguments'])
      } else {
        Object.defineProperty(func, 'caller', {
          configurable: true,
          enumerable: false,
          value: undefined,
          writable: true,
        })
      }
    } catch(e) {}
    return func
  }

  private createArgumentsObject(
    values: any[],
    callee: CallableFunction,
    strict: boolean,
    formalCount: number,
  ): any {
    const object = Object.create(Object.prototype)
    const mapped = new Set<number>()
    Object.defineProperty(object, ARGUMENTS_META, {
      value: { values, mapped },
    })
    Object.defineProperty(object, 'length', {
      configurable: true,
      enumerable: false,
      value: values.length,
      writable: true,
    })
    values.forEach((value, index): void => {
      Object.defineProperty(object, String(index), {
        configurable: true,
        enumerable: true,
        value,
        writable: true,
      })
      if (!strict && index < formalCount) {
        mapped.add(index)
      }
    })

    if (strict) {
      defineRestrictedProperties(object, ['caller', 'callee'])
    } else {
      Object.defineProperty(object, 'callee', {
        configurable: true,
        enumerable: false,
        value: callee,
        writable: true,
      })
    }
    return object
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
  // console.log(
  //   ' =========================== Start Running =======================\n',
  //   'main function index', mainFunctionIndex, '\n',
  //   'function table basic index', funcionTableBasicIndex, '\n',
  //   'string table basic index', stringTableBasicIndex, '\n',
  //   'globals szie ', globalsSize, '\n',
  //   '=================================================================\n',
  // )

  const stringsTable: string[] = parseStringsArray(buffer.slice(stringTableBasicIndex))
  const codesBuf = new Uint8Array(buffer.slice(4 * 4, funcionTableBasicIndex))
  const funcsBuf = buffer.slice(funcionTableBasicIndex, stringTableBasicIndex)
  const funcsTable: FuncInfoMeta[] = parseFunctionTable(funcsBuf)
  // console.log('string table', stringsTable)
  // console.log('function table', funcsTable)
  // console.log(mainFunctionIndex, 'function basic index', funcionTableBasicIndex)
  // console.log('total codes bytes length -->', codesBuf.byteLength)
  // console.log('main start index', funcsTable[mainFunctionIndex][0], stringTableBasicIndex)

  return new VirtualMachine(codesBuf, funcsTable, mainFunctionIndex, stringsTable, globalsSize, ctx)
}

type FuncInfoMeta = [number, number, number, number] // address, numArgs, numLocals, flags

const parseFunctionTable = (buffer: ArrayBuffer): FuncInfoMeta[] => {
  const funcs: FuncInfoMeta[] = []
  let i = 0
  while (i < buffer.byteLength) {
    const ipEnd = i + 4
    const ip = readUInt32(buffer, i, ipEnd)
    const numArgsLocalAndFlags = new Uint16Array(buffer.slice(ipEnd, ipEnd + 3 * 2))
    funcs.push([
      ip,
      numArgsLocalAndFlags[0],
      numArgsLocalAndFlags[1],
      numArgsLocalAndFlags[2],
    ])
    i += 10
  }
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

Object.defineProperty(Callable.prototype, 'constructor', {
  configurable: true,
  value: Function,
  writable: true,
})

Object.defineProperty(Callable.prototype, 'bind', {
  configurable: true,
  value: function(this: CallableFunction, ...args: any[]): any {
    const bound = (Function.prototype.bind as any).apply(this, args)
    defineRestrictedProperties(bound, ['caller', 'arguments'])
    return bound
  },
  writable: true,
})

export { Callable }


// tslint:disable-next-line: max-classes-per-file
class NumArgs {
  constructor(public numArgs: number) {
  }
// tslint:disable-next-line: max-file-line-count
}

if (typeof window !== 'undefined') {
  (window as any).VirtualMachine = VirtualMachine;
  (window as any).createVMFromArrayBuffer = createVMFromArrayBuffer
}
