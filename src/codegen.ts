/**
 * 通过 acorn parser 解析 JS，然后将 JS 转化成 nestscript IR
 */

const acorn = require("acorn")
const walk = require("acorn-walk")
import * as et from "estree"
import { CategoriesPriorityQueue } from './utils'
import { BlockChain } from './block-chain'

export const enum VariableType {
  NO_EXIST = -1,
  FUNCTION = 1,
  VARIABLE = 2,
  CLOSURE = 3,
}

interface IScope {
  funcName: string, // for debug.
  // params: Map<string, any>,
  // locals: Map<string, any>,
  closureTable?: Map<string, any>,
  closureCounter?: number // 只有最外层的函数有
}

interface IFunction {
  name: string,
  body: et.FunctionExpression | et.ArrowFunctionExpression | et.FunctionDeclaration,
  blockChain: BlockChain,
  // scopes: IScope[], // 存储作用域链
  // params: { [x in string]: 1 }[],
}

interface IState {
  tmpVariableName: string,
  // globals: any,
  // locals: Map<string, any>,
  // params: Map<string, any>,
  scopes: IScope[],
  isGlobal: boolean,
  labelIndex: number,
  functionIndex: number,
  functionTable: any,
  functions: IFunction[],
  codes: CategoriesPriorityQueue<string | (() => string[])>,
  r0: string | null,
  r1: string | null,
  r2: string | null,
  maxRegister: number,
  currentFunctionName: string,
  funcName: string,
  currentScope?: IScope,
  blockChain: BlockChain,

  // $obj: string,
  // $key: string,
  // $val: string,
}

interface BlockLabel {
  startLabel?: string,
  endLabel?: string,
  updateLabel?: string,
  blockNameStart?: string, // 给 block 起名，这样好 continue 和 break
  blockNameBody?: string, // 给 block 起名，这样好 continue 和 break
  isForIn?: boolean,
}

const codeMap = {
  '<': 'LT',
  '>': 'GT',
  '===': 'EQ',
  '!==': 'NE',
  '==': 'WEQ',
  '!=': 'WNE',
  '<=': 'LE',
  '>=': 'GE',
  '+': 'ADD',
  '-': 'SUB',
  '*': 'MUL',
  '/': 'DIV',
  '%': 'MOD',
  '&': 'AND',
  '|': 'OR',
  '^': 'XOR',
  '<<': 'SHL',
  '>>': 'SHR',
  '>>>': 'ZSHR',
  "in": "IN",
  'instanceof': 'INST_OF',
}

class Codegen {
  public parse(code: string): et.Program {
    return acorn.parse(code)
  }
}

/**
 * 为了处理这种情况：
 * ```
 * i = 1
 * var i
 * ```
 */
const getVariablesByFunctionAstBody = (ast: any): Map<string, any> => {
  const locals = new Map()
  walk.recursive(ast, locals, {
    VariableDeclaration: (node: et.VariableDeclaration, s: any, c: any): void => {
      // console.log("VARIABLE...", node)
      s.varKind = node.kind
      node.declarations.forEach((n: any): void => c(n, s))
      delete s.varKind
    },

    /** 要处理 (global, local) * (function, other) 的情况 */
    VariableDeclarator: (node: et.VariableDeclarator, s: any, c: any): void => {
      const kind = s.varKind
      // console.log(node)
      // let funcName = ''
      if (node.id.type === 'Identifier') {
        if (kind === 'var') {
          locals.set(node.id.name, VariableType.VARIABLE)
        }
      } else {
        throw new Error("Unprocessed node.id.type " + node.id.type + " " + node.id)
      }
    },

    FunctionDeclaration(node: et.FunctionDeclaration, s: any, c: any): any {
      if (node.id) {
        locals.set(node.id.name, VariableType.VARIABLE)
      }
    },
  })
  return locals
}

const codegen = new Codegen()
let state: IState
const createNewState = (): IState => {
  return {
    tmpVariableName: '',
    isGlobal: true,
    // globals: {},
    // locals: new Map(),
    currentScope: {
      funcName: '',
      // params: new Map(),
      // locals: new Map(),
      closureTable: new Map(),
      closureCounter: 0,
    },
    // params: new Map(),
    scopes: [],
    labelIndex: 0,
    functionIndex: 0,
    functions: [],
    functionTable: {},
    funcName: '',
    codes: new CategoriesPriorityQueue(),
    r0: '', // 寄存器的名字
    r1: '', // 寄存器的名字
    r2: '', //
    maxRegister: 0,
    currentFunctionName: '',
    blockChain: new BlockChain([]),
  }
}
// tslint:disable-next-line: no-big-function
const parseToCode = (ast: any): void => {
  const newFunctionName = (): string => {
    state.currentFunctionName = `@@f${state.functionIndex++}`
    return state.currentFunctionName
  }

  const parseFunc = (
    node: et.FunctionExpression | et.ArrowFunctionExpression | et.FunctionDeclaration,
    s: IState,
    prior?: number,
  ): string => {
    const funcName = newFunctionName()
    // s.globals[funcName] = VariableType.FUNCTION
    s.blockChain.newGlobal(funcName, VariableType.FUNCTION)
    s.functions.push({
      name: funcName,
      body: node,
      blockChain: s.blockChain.newFuncBlock(),
      // scopes: [...s.scopes, getCurrentScope() || {
      //   locals: s.locals, params: s.params, closureCounter: 0,
      // }],
    })
    s.functionTable[funcName] = node
    // console.log(s.r0, '....', s.functionTable)
    if (s.r0) {
      cg([`FUNC`, `${s.r0}`, `${funcName}`], prior)
    }
    delete s.funcName
    return funcName
  }

  let registerCounter = 0
  let maxRegister = 0

  const newLabelName = (): string => `_l${state.labelIndex++}_`

  const newRegister = (): string => {
    const r = `%r${registerCounter++}`
    maxRegister = Math.max(maxRegister, registerCounter)
    return r
  }
  const freeRegister = (): number => {
    state.r0 = null
    return registerCounter--
  }

  const newRegisterController = (): [any, any] => {
    let count = 0
    return [(): string => {
      count++
      return newRegister()
    }, (): void => {
      state.r0 = null
      for (let i = 0; i < count; i++) {
        freeRegister()
      }
    }]
  }

  // const hasLocalOrParam = (name: string, s: IState): boolean => {
  //   return s.locals.get(name) || s.params.get(name)
  // }

  // const hasVars = (name: string, s: any): boolean => {
  //   if (hasLocalOrParam(name, s)) { return true }
  //   for (const scope of [...state.scopes]) {
  //     if (scope.locals.get(name) || scope.params.get(name)) {
  //       return true
  //     }
  //   }
  //   return !!s.globals.get(name)
  // }

  // const getCurrentScope = (): IScope => {
  //   return state.currentScope!
  // }

  // const allocateClosure = (root: IScope, scope: IScope, reg: string): void => {
  //   if (!scope.closureTable) {
  //     scope.closureTable = new Map()
  //   }
  //   if (!scope.closureTable.get(reg)) {
  //     if (root.closureCounter === void 0) {
  //       throw new Error("Root scope closure counter cannot be 0.")
  //     } else {
  //       scope.closureTable.set(reg, `@c${root.closureCounter++}`)
  //     }
  //   }
  // }

  // const touchRegister = (
  //   reg: string,
  //   currentScope: IScope,
  //   scopes: IScope[],
  //   blockChain: Map<string, VariableType>[]): void => {
  //   /** 这个变量当前 scope 有了就不管了 */
  //   const currentBlock = blockChain[blockChain.length - 1]
  //   // if (currentBlock)
  //   if (currentScope.locals.get(reg) || currentScope.params.get(reg)) { return }
  //   let i = 0
  //   for (const scope of [...scopes].reverse()) {
  //     if (scope.locals.get(reg)) {
  //       scope.locals.set(reg, VariableType.CLOSURE)
  //       allocateClosure(scopes[0], scope, reg)
  //       return
  //     }
  //     if (scope.params.get(reg)) {
  //       scope.params.set(reg, VariableType.CLOSURE)
  //       allocateClosure(scopes[0], scope, reg)
  //       return
  //     }
  //     i++
  //   }
  // }

  // const getRegisterName = (reg: string, currentScope: IScope, scopes: IScope[], isVar: boolean = false): string => {
  //   const isClosure = (v: VariableType): boolean => v === VariableType.CLOSURE
  //   const regType = currentScope.locals.get(reg) || currentScope.params.get(reg)
  //   if (regType) {
  //     if (regType === VariableType.CLOSURE) {
  //       return currentScope.closureTable?.get(reg)
  //     } else {
  //       return reg
  //     }
  //   }
  //   for (const scope of [...scopes, currentScope].reverse()) {
  //     if (
  //       isClosure(scope.locals.get(reg)) ||
  //       isClosure(scope.params.get(reg))
  //     ) {
  //       if (!scope.closureTable?.get(reg)) {
  //         throw new Error(`Cannot found clouse variable ${reg} on closure table`)
  //       }
  //       return scope.closureTable.get(reg)
  //     }
  //   }
  //   return reg
  // }

  const cg = (ops: any[], prior?: number): any => {
    /** 各种动态生成 */
    // if (typeof ops[0] === 'function') {
    //   ops = ops[0]()
    // }

    let operator = ops[0]
    if (!operator || operator ==='undefined') {
      throw new Error('Operator cannot be ' + operator)
    }
    const operants = ops.slice(1)
    // console.log(ops, '------------>', operants)
    if (operator === 'MOV' && ops[1] === 'undefined') {
      throw new Error('First operant of MOV cannot be undefined' )
    }
    // if (ops[0] === 'MOV') {
    //   state.codes.push(createMovCode(ops[1], ops[2], getCurrentScope()))
    // } else {
    // const currentScope = getCurrentScope()
    // const scopes = state.scopes
    const blockChain = state.blockChain
    // const currentBlock = blockChain[blockChain.length - 1]
    // console.log(operants, '--->')
    operants.forEach((o: any): void => {
      if (typeof o === 'string') {
        // if (o === 'i') {
        //   console.log(operator, o)
        // }
        blockChain.accessName(o)
        // touchRegister(o, currentScope, scopes, blockChain)
      }
    })
    /** 这里需要提前一些指令，例如变量声明、全局变量、有名函数声明 */
    let priority
    if (prior === void 0) {
      // if ('VAR' === operator) {
      //   priority = 1
      // } else if ('GLOBAL' === operator) {
      //   priority = 2
      if ('ALLOC' === operator) {
        priority = 3
      // } else if ('FUNC' === operator && blockChain.hasName(operants[0])) {
      //   priority = 4
      } else {
        priority = 100
      }
    } else {
      priority = prior
    }
    const currentBlock = blockChain.getCurrentBlock()
    return state.codes.push((): string[] => {
      // console.log(ops, operants)
      // console.log(operator, operants)

      // TOFIX: 是否要清除 block?还是要再考虑一下
      // if (['BLOCK', 'END_BLOCK', 'CLR_BLOCK'].includes(operator) && currentBlock.variables.size === 0) {
      //   return []
      // }

      if (typeof operator === 'function') {
        operator = operator()
      }
      const processedOps = operants.map((o): string => {
        if (typeof o === 'function') {
          o = o()
        }
        // if (o === 'momentProperties') {
        //   console.log(blockChain)
        // }
        return blockChain.getName(o)
        // return getRegisterName(o, currentScope, scopes, operator === 'VAR')
      })
      const ret: any[] = []
      const pushCode = (): void => {
        const c = [operator, ...processedOps].join(' ')
        ret.push(c)
      }
      if (
        ['VAR', 'BVAR'].includes(operator) &&
        blockChain.getNameType(operants[0]) === VariableType.CLOSURE
      ) {
        operator = 'CLS'
        pushCode()
        // ret.push(`ALLOC ${processedOps[0]}`)
      } else {
        pushCode()
      }
      return ret
    }, priority)
    // }
  }

  /** 生成 label */
  const lg = (label: string): string => {
    return cg([`LABEL ${label}:`])
  }

  const callIdentifier = (id: string, numArgs: number, s: IState, isExpression: boolean): void => {
    // if (s.functionTable[id]) {
    //   cg('CALL', id, numArgs, isExpression)
    // } else
    s.blockChain.accessName(id)
    // touchRegister(id, getCurrentScope(), state.scopes, s.blockChain)
    if (s.blockChain.hasName(id)) {
      cg([`CALL_REG`, id, numArgs, isExpression])
    } else {
      cg([`CALL_CTX`, `'${id}'`, numArgs, isExpression])
    }
  }

  /**
   * 所有的操作都是先获取到临时寄存器，操作完以后再写回目标寄存器
   * 有四种种目标操作
   * 1. Identifier: 局部变量、context、闭包变量
   * 2. Member
   */
  const setValueToNode = (node: any, reg: string, s: IState, c: any): any => {
    if (node.type === 'MemberExpression') {
      // s.r0 = newReg()
      s.r0 = null
      const objReg = s.r1 = newRegister()
      const keyReg = s.r2 = newRegister()
      c(node, s)
      cg([`SET_KEY`, objReg, keyReg, reg])
      freeRegister()
      freeRegister()
    } else if (node.type === 'Identifier') {
      if (s.blockChain.hasName(node.name)) {
        cg([`MOV`, `${ node.name }`, `${ reg }`])
      } else {
        cg([`SET_CTX`, `"${node.name}"`, `${ reg }`])
      }
    } else {
      throw new Error('Unprocessed assignment')
    }
  }

  const getValueOfNode = (node: any, reg: string, s: IState, c: any): any => {
    if (node.type === 'Identifier') {
      if (reg) {
        if (s.blockChain.hasName(node.name)) {
          cg([`MOV`, `${ reg }`, `${ node.name }`])
        } else {
          if (node.name === 'arguments') {
            cg([`MOV_ARGS`, `${ reg }`])
          } else {
            cg([`MOV_CTX`, `${ reg }`, `"${node.name}"`])
          }
        }
      }
    } else {
      s.r0 = reg
      c(node, s)
    }
  }

  const declareVariable = (s: IState, name: string, kind: 'let' | 'var' | 'const' = 'var'): void => {
    // if (state.isGlobal) {
    //   cg(`GLOBAL`, name)
    //   s.globals.set(name, VariableType.VARIABLE)
    /* } else */
    // if (state.isGlobal) {
    //   cg(`GLOBAL`, name)
    //   s.blockChain.newGlobal(name, VariableType.VARIABLE)
    // } else
    if ((kind === 'let' || kind === 'const') && s.blockChain.chain.length > 1) {
      cg(['VAR', `${name}`])
      s.blockChain.newName(name, kind)
    } else {
      cg([`VAR`, `${name}`], 1)
      s.blockChain.newName(name, kind)
    }
  }

  /** Label 操作 */
  const loopLabels: BlockLabel[] = []
  const pushLoopLabels = (label: BlockLabel): any => loopLabels.push(label)
  const popLoopLabels = (): BlockLabel | undefined => loopLabels.pop()
  const getCurrentLoopLabel = (): BlockLabel => loopLabels[loopLabels.length - 1]

  const blockEndLabels: Map<string, BlockLabel> = new Map()

  const newBlockChain = (): (() => void) & { blockIndexName: string } => {
    // throw new Error('shoud not called ...')
    const oldBlockChain = state.blockChain
    // state.blockChain = [...oldBlockChain, new Map<string, any>()]
    state.blockChain = oldBlockChain.newBlock()
    const blockName = state.blockChain.newBlockName()
    cg(['BLOCK', blockName])
    const ret = (): void => {
      // const currentBlock = state.blockChain[state.blockChain.length - 1]
      cg(['END_BLOCK', blockName])
      state.blockChain = oldBlockChain
      // for (const [name] of currentBlock.entries()) {
      //   cg('FREEBV', name)
      // }
    }
    ret.blockIndexName = blockName
    return ret
  }

  /**
   * 表达式结果处理原则：所有没有向下一层传递 s.r0 的都要处理 s.r0
   */
  walk.recursive(ast, state, {
    Identifier: (node: et.Identifier, s: any, c: any): void => {
      if (s.r0) {
        getValueOfNode(node, s.r0, s, c)
      }
    },

    VariableDeclaration: (node: et.VariableDeclaration, s: any, c: any): void => {
      // console.log("VARIABLE...", node)
      s.varKind = node.kind
      node.declarations.forEach((n: any): void => c(n, s))
      delete s.varKind
    },

    /** 要处理 (global, local) * (function, other) 的情况 */
    VariableDeclarator: (node: et.VariableDeclarator, s: any, c: any): void => {
      // console.log(node)
      const [newReg, freeReg] = newRegisterController()
      let reg
      // let funcName = ''
      if (node.id.type === 'Identifier') {
        // if (isInitFunction) {
        //   reg = node.id.name // newReg()
        //   if (state.isGlobal) {
        //     funcName = node.id.name
        //   } else {
        //     s.locals[node.id.name] = VariableType.VARIABLE
        //     cg(`VAR`, `${node.id.name}`)
        //     funcName = newFunctionName()
        //   }
        // } else {
        declareVariable(s, node.id.name, s.varKind)
        reg = node.id.name
        // }
      } else {
        throw new Error("Unprocessed node.id.type " + node.id.type + " " + node.id)
      }
      if (node.init) {
        if (node.init?.type === 'Identifier') {
          // if (!state.isGlobal) {
          cg([`MOV`, reg, node.init.name])
          // }
        } else {
          s.r0 = reg
          // s.funcName = funcName
          c(node.init, s)
        }
      }
      freeReg()
      delete s.funcName
    },

    FunctionDeclaration(node: et.FunctionDeclaration, s: any, c: any): any {
      if (s.r0 && !state.isGlobal) {
        parseFunc(node, s)
      } else {
        s.r0 = node.id?.name
        declareVariable(s, s.r0)
        parseFunc(node, s, 4)
      }
      s.r0 = null
    },

    CallExpression(node: et.CallExpression, s: any, c: any): any {
      const retReg = s.r0
      const isNewExpression = !!s.isNewExpression
      delete s.isNewExpression
      const args = [...node.arguments]
      args.reverse()
      for (const arg of args) {
        const reg = s.r0 = newRegister()
        // if (arg.type === 'Identifier') {
        getValueOfNode(arg, reg, s, c)
        // } else {
        //   c(arg, s)
        //   freeRegister()
        // }
        freeRegister()
        cg([`PUSH`, reg])
      }

      if (node.callee.type === "MemberExpression") {
        s.r0 = null
        const objReg = s.r1 = newRegister()
        const keyReg = s.r2 = newRegister()
        c(node.callee, s)
        cg([`CALL_VAR`, objReg, keyReg, node.arguments.length, isNewExpression])
        freeRegister()
        freeRegister()
      } else if (node.callee.type === "Identifier") {
        callIdentifier(node.callee.name, node.arguments.length, s, isNewExpression)
      } else {
        const ret = s.r0 = newRegister()
        c(node.callee, s)
        freeRegister()
        /** 这里不能用 callIdentifier */
        cg([`CALL_REG`, ret, node.arguments.length, isNewExpression])
      }
      if (retReg) {
        cg([`MOV`, retReg, `$RET`])
      }
      s.r0 = null
    },

    Literal: (node: et.Literal, s: any): void => {
      const unescape = (ss: string): string => ss.replace(/\\/g, '\\\\').replace(/"/g, '\\"')

      if ((node as any).regex) {
        const { pattern, flags } = (node as any).regex
        cg(['NEW_REG', s.r0, `"${unescape(pattern)}"`, `"${flags}"`])
        return
      }

      let val
      if (node.value === true) {
        val = true
      } else if (node.value === false) {
        val = false
      } else {
        val = node.value
        if (typeof val === 'string') {
          val = `"${unescape(val)}"`
        }
      }
      if (s.r0) {
        cg([`MOV`, s.r0, `${val}`])
      }
    },

    ArrowFunctionExpression(node: et.ArrowFunctionExpression, s: any, c: any): any {
      parseFunc(node, s)
    },

    FunctionExpression(node: et.FunctionExpression, s: any, c: any): any {
      parseFunc(node, s)
    },

    BlockStatement(node: et.BlockStatement, s: any, c: any): void {
      const restoreBlockChain = newBlockChain()
      node.body.forEach((n: any): void => c(n, s))
      restoreBlockChain()
    },

    MemberExpression(node: et.MemberExpression, s: any, c: any): void {
      const [newReg, freeReg] = newRegisterController()
      const valReg = s.r0
      const objReg = s.r1 || newReg()
      const keyReg = s.r2 || newReg()

      if (node.object.type === 'MemberExpression') {
        s.r0 = objReg
        s.r1 = newRegister()
        c(node.object, s)
        freeRegister()
      } else if (node.object.type === 'Identifier') {
        getValueOfNode(node.object, objReg, s, c)
      } else {
        s.r0 = objReg
        c(node.object, s)
      }

      if (node.property.type === 'MemberExpression') {
        s.r0 = keyReg
        s.r2 = newRegister()
        c(node.property, s)
        freeRegister()
      } else if (node.property.type === 'Identifier') {
        // a.b.c.d
        if (node.computed) {
          cg([`MOV`, keyReg, node.property.name])
        } else {
          cg([`MOV`, keyReg, `"${node.property.name}"`])
        }
      } else {
        s.r0 = keyReg
        c(node.property, s)
      }

      if (valReg) {
        cg([`MOV_PROP`, valReg, objReg, keyReg])
      }
      s.r0 = null
      s.r1 = null
      s.r2 = null
      freeReg()
    },

    AssignmentExpression(node: et.AssignmentExpression, s: any, c: any): any {
      const retReg = s.r0
      const left = node.left
      const right = node.right
      const [newReg, freeReg] = newRegisterController()
      let rightReg = newReg()
      getValueOfNode(right, rightReg, s, c)
      if (node.operator !== '=') {
        const o = node.operator.replace(/\=$/, '')
        const cmd = codeMap[o]
        if (!cmd) { throw new Error(`Operation ${o} is not implemented.`)}
        const leftReg = newReg()
        getValueOfNode(left, leftReg, s, c)
        cg([`${cmd}`, leftReg, rightReg])
        rightReg = leftReg
      }
      setValueToNode(left, rightReg, s, c)
      if (retReg) {
        cg([`MOV`, retReg, rightReg])
      }
      freeReg()
    },

    BinaryExpression(node: et.BinaryExpression, s: any, c: any): void {
      const [newReg, freeReg] = newRegisterController()

      const leftReg = s.r0 || newReg()
      const rightReg = newReg()

      getValueOfNode(node.left, leftReg, s, c)
      getValueOfNode(node.right, rightReg, s, c)

      // if (node.operator === '') {

      // }

      const op = codeMap[node.operator]
      if (!op) {
        throw new Error(`${ node.operator } is not implemented.`)
      }
      cg([op, leftReg, rightReg])
      freeReg()
    },

    UnaryExpression(node: et.UnaryExpression, s: any, c: any): void {
      const op = node.operator
      const codesMap = {
        '+': 'PLUS',
        '-': 'MINUS',
        '~': 'NOT',
        '!': 'NEG',
        'void': 'VOID',
        'typeof': 'TYPE_OF',
      }
      const [newReg, freeReg] = newRegisterController()
      const cmd = codesMap[node.operator]

      if (op !== 'delete') {
        const reg = s.r0
        getValueOfNode(node.argument, reg, s, c)
        cg([`${cmd}`, `${reg}`])
      } else {
        s.r0 = null
        const objReg = s.r1 = newReg()
        const keyReg = s.r2 = newReg()
        c(node.argument, s)
        cg([`DEL`, `${objReg}`, `${keyReg}`])
        s.r1 = null
        s.r2 = null
      }

      freeReg()
    },

    IfStatement(node: any, s: any, c: any): void {
      // const restoreBlockChain = newBlockChain()
      const [newReg, freeReg] = newRegisterController()
      const retReg = s.r0
      const endLabel = newLabelName()

      while (node && (node.type === 'IfStatement' || node.type === 'ConditionalExpression')) {
        const testReg = newReg()
        const nextLabel = newLabelName()

        s.r0 = testReg
        c(node.test, s)

        cg([`JF`, testReg, nextLabel])
        getValueOfNode(node.consequent, retReg, s, c)
        cg([`JMP`, endLabel])

        cg([`LABEL`, `${ nextLabel }:`])
        node = node.alternate
        // if (node.alternate) {
        //   getValueOfNode(node.alternate, retReg, s, c)
        // }
      }

      if (node) {
        getValueOfNode(node, retReg, s, c)
      }

      cg([`LABEL`, `${ endLabel }:`])
      freeReg()
      // restoreBlockChain()
    },

    ConditionalExpression(node: et.ConditionalExpression, s: any, c: any): void {
      this.IfStatement(node, s, c)
    },

    LogicalExpression(node: et.LogicalExpression, s: any, c: any): void {
      const [newReg, freeReg] = newRegisterController()
      const retReg = s.r0
      const endLabel = newLabelName()
      const leftReg = s.r0 = newReg()
      getValueOfNode(node.left, leftReg, s, c)
      const op = node.operator
      if (retReg) {
        cg([`MOV`, `${retReg}`, `${leftReg}`])
      }
      if (op === '&&') {
        cg([`JF`, `${leftReg}`, `${endLabel}`])
      } else {
        cg([`JIF`, `${leftReg}`, `${endLabel}`])
      }
      const rightReg = s.r0 = newReg()
      getValueOfNode(node.right, rightReg, s, c)
      if (retReg) {
        cg([op === '&&' ? `LG_AND` : `LG_OR`, `${retReg}`, `${rightReg}`])
      }
      cg(['LABEL', `${endLabel}:`])
      freeReg()
    },

    ForStatement(node: et.ForStatement, s: any, c: any): any {
      const restoreBlockChainInit = newBlockChain()
      const [newReg, freeReg] = newRegisterController()
      const startLabel = newLabelName()
      let endLabel = newLabelName()
      const updateLabel = newLabelName()

      let labels: BlockLabel
      if (s.jsLabel) {
        if (!blockEndLabels.has(s.jsLabel)) {
          throw new Error('If has `jsLabel`, label information should be set')
        }
        labels = blockEndLabels.get(s.jsLabel)!
        labels.startLabel = startLabel
        if (!labels.endLabel) {
          throw new Error('Endlabel is not set in label information')
        }
        endLabel = labels.endLabel
        delete s.jsLabel
      } else {
        labels = { startLabel, endLabel }
      }

      if (node.update) {
        labels.updateLabel = updateLabel
      }
      labels.blockNameStart = labels.blockNameBody = restoreBlockChainInit.blockIndexName
      pushLoopLabels(labels)
      // init
      if (node.init) {
        // console.log('--- INTI -->', node.init)
        c(node.init, s)
      }

      // if do while
      const isDoWhileLoop = node.type as string === 'DoWhileStatement'
      const bodyLabel = newLabelName()
      if (isDoWhileLoop) {
        cg([`JMP`, bodyLabel])
      }

      cg([`LABEL`, `${ startLabel }:`])
      // test
      if (node.test) {
        const testReg = s.r0 = newReg()
        c(node.test, s)
        cg([`JF`, `${ testReg }`, `${ endLabel }`])
      }
      // body
      s.forEndLabel = endLabel
      s.r0 = null
      cg([`LABEL`, `${ bodyLabel }:`])
      const restoreBlockChainBody = newBlockChain()
      // console.log('for body', node.body)
      labels.blockNameBody = restoreBlockChainBody.blockIndexName
      c(node.body, s)
      restoreBlockChainBody()
      // update
      if (node.update) {
        cg(['LABEL', `${ updateLabel }:`])
        s.r0 = null
        c(node.update, s)
      }
      cg([`JMP`, `${ startLabel }`])
      // end
      cg([`LABEL`, `${ endLabel }:`])
      restoreBlockChainInit()
      popLoopLabels()
      freeReg()
    },

    ForInStatement(node: et.ForInStatement, s: any, c: any): any {
      const restoreBlockChain = newBlockChain()
      const left = node.left
      const right = node.right
      const [newReg, freeReg] = newRegisterController()
      let leftReg
      if (left.type === 'Identifier') {
        leftReg = left.name
      } else if (left.type === 'VariableDeclaration') {
        const varDecorator = left.declarations[0]
        leftReg = (varDecorator.id as et.Identifier).name
        declareVariable(s, leftReg, left.kind)
      } else {
        throw new Error('Cannot process for in statement left type ' + left.type)
      }
      const rightReg = newReg()
      const startLabel = newLabelName()
      const endLabel = newLabelName()
      getValueOfNode(right, rightReg, s, c)
      const labels: BlockLabel = {
        startLabel,
        endLabel,
        updateLabel: startLabel,
        isForIn: true,
        blockNameStart: restoreBlockChain.blockIndexName,
      }
      pushLoopLabels(labels)
      cg(['FORIN', leftReg, rightReg, startLabel, endLabel])
      lg(startLabel)
      const restoreBlockChainBody = newBlockChain()
      labels.blockNameBody = restoreBlockChainBody.blockIndexName
      c(node.body, s)
      restoreBlockChainBody()
      cg(['FORIN_END'])
      lg(endLabel)
      restoreBlockChain()
      freeReg()
      popLoopLabels()
    },

    WhileStatement(node: et.WhileStatement, s: any, c: any): any {
      this.ForStatement(node, s, c)
    },

    DoWhileStatement(node: et.DoWhileStatement, s: any, c: any): any {
      this.ForStatement(node, s, c)
    },

    BreakStatement(node: et.BreakStatement, s: any, c: any): any {
      if (node.label) {
        const { name } = node.label
        if (!blockEndLabels.has(name)) {
          throw new Error(`Label ${name} does not exist.`)
        }
        const lb = blockEndLabels.get(name)!
        cg(['CLR_BLOCK', lb.blockNameStart])
        cg(['JMP', lb.endLabel])
        return
      }

      // console.log(loopLabels)
      const labels = getCurrentLoopLabel()
      // console.log(node)
      if (!labels) {
        throw new Error("Not available labels, cannot use `break` here.")
      }
      if (labels.isForIn) {
        cg(['BREAK_FORIN'])
        return
      }
      const endLabel = labels.endLabel
      // cg(`JMP ${endLabel} (break)`)
      cg(['CLR_BLOCK', labels.blockNameStart])
      cg([`JMP`, `${endLabel}`])
    },

    ContinueStatement(node: et.ContinueStatement, s: any, c: any): any {
      if (node.label) {
        const { name } = node.label
        if (!blockEndLabels.has(name)) {
          throw new Error(`Label ${name} does not exist.`)
        }
        const blockLabel = blockEndLabels.get(name)!
        // continue label; 语法，如果有 update ，回到 update， 否则回到头
        cg(['CLR_BLOCK', blockLabel.blockNameBody])
        cg(['JMP', blockLabel.updateLabel || blockLabel.startLabel])
        return
      }

      const labels = getCurrentLoopLabel()
      if (!labels) {
        throw new Error("Not available labels, cannot use `continue` here.")
      }
      if (labels.isForIn) {
        cg(['CLR_BLOCK', labels.blockNameBody])
        cg(['CONT_FORIN'])
        return
      }
      const { startLabel, updateLabel } = labels
      // cg(`JMP ${endLabel} (break)`)
      cg(['CLR_BLOCK', labels.blockNameBody])
      cg([`JMP`, `${updateLabel || startLabel}`])
    },

    UpdateExpression(node: et.UpdateExpression, s: any, c: any): any {
      const op = node.operator
      const [newReg, freeReg] = newRegisterController()
      const retReg = s.r0
      const reg = newReg()
      getValueOfNode(node.argument, reg, s, c)
      if (retReg && !node.prefix) {
        cg([`MOV ${retReg} ${reg}`])
      }
      if (op === '++') {
        cg([`ADD`, `${reg}`, `1`])
      } else if (op === '--') {
        cg([`SUB`, `${reg}`, `1`])
      }
      if (retReg && node.prefix) {
        cg([`MOV ${retReg} ${reg}`])
      }
      setValueToNode(node.argument, reg, s, c)
      freeReg()
    },

    ObjectExpression(node: et.ObjectExpression, s: any, c: any): any {
      const [newReg, freeReg] = newRegisterController()
      const reg = s.r0 || newReg()
      cg([`NEW_OBJ`, `${reg}`])
      for (const prop of node.properties) {
        s.r0 = reg
        c(prop, s)
      }
      freeReg()
    },

    ArrayExpression(node: et.ArrayExpression, s: any, c: any): any {
      const [newReg, freeReg] = newRegisterController()
      const reg = s.r0 || newReg()
      cg([`NEW_ARR`, `${reg}`])
      node.elements.forEach((el: any, i: number): void => {
        if (!el) {
          return
        }
        const valReg = newRegister()
        getValueOfNode(el, valReg, s, c)
        cg([`SET_KEY`, `${reg}`, `${i}`, `${valReg}`])
        freeRegister()
      })
      freeReg()
    },

    Property(node: et.Property, s: any, c: any): any {
      const objReg = s.r0
      const [newReg, freeReg] = newRegisterController()
      const valReg = newReg()
      let key
      if (node.key.type === "Identifier") {
        key = `'${node.key.name}'`
      } else if (node.key.type === "Literal") {
        key = node.key.raw
      }
      getValueOfNode(node.value, valReg, s, c)
      cg([`SET_KEY`, `${objReg}`, key, `${valReg}`])
      // cg(`SET_KEY`, `${objReg}`, `"${key}"`, `${valReg}`)
      freeReg()
    },

    ReturnStatement(node: et.ReturnStatement, s: any, c: any): any {
      const reg = s.r0 = newRegister()
      if (node.argument) {
        c(node.argument, s)
        cg([`MOV`, `$RET`, `${reg}`])
      }
      cg(['RET'])
      freeRegister()
    },

    SequenceExpression(node: et.SequenceExpression, s: any, c: any): any {
      const r0 = s.r0
      delete s.r0
      node.expressions.forEach((n, i): void => {
        if (i === node.expressions.length - 1) {
          s.r0 = r0
        }
        c(n, s)
      })
    },

    ThisExpression(node: et.ThisExpression, s: any, c: any): any {
      if (!s.r0) {
        throw new Error('Access `this` without register r0')
      }
      cg([`MOV_THIS`, `${s.r0}`])
    },

    NewExpression(node: et.NewExpression, s: any, c: any): any {
      s.isNewExpression = true
      this.CallExpression(node, s, c)
    },

    LabeledStatement(node: et.LabeledStatement, s: any, c: any): any {
      const restoreBlockChain = newBlockChain()
      const labelNode = node.label
      const labelName = labelNode.name
      const endLabel = newLabelName()
      blockEndLabels.set(labelName, { endLabel, blockNameStart: restoreBlockChain.blockIndexName })
      if (
        node.body.type === 'ForStatement' ||
        node.body.type === 'ForInStatement' ||
        node.body.type === 'WhileStatement' ||
        node.body.type === 'DoWhileStatement'
      ) {
        s.jsLabel = labelName
      }
      c(node.body, s)
      blockEndLabels.delete(labelName)
      cg([`LABEL ${endLabel}:`])
      restoreBlockChain()
    },

    SwitchStatement(node: et.SwitchStatement, s: any, c: any): any {
      // const restoreBlockChain = newBlockChain()
      const [newReg, freeReg] = newRegisterController()
      const discriminantReg = newReg()
      getValueOfNode(node.discriminant, discriminantReg, s, c)
      const switchEndLabel = newLabelName()
      const label: BlockLabel = { endLabel: switchEndLabel }
      pushLoopLabels(label)
      node.cases.forEach((cs: et.SwitchCase): void => {
        const startLabel = newLabelName()
        const endLabel = newLabelName()
        if (cs.test) {
          const testReg = newReg()
          getValueOfNode(cs.test, testReg, s, c)
          cg([`JE`, `${discriminantReg}`, `${testReg}`, `${startLabel}`])
          cg([`JMP`, `${endLabel}`])
        }
        cg([`LABEL ${startLabel}:`])
        cs.consequent.forEach((n: any): void => {
          c(n, s)
        })
        cg([`LABEL ${endLabel}:`])
      })
      cg([`LABEL ${switchEndLabel}:`])
      popLoopLabels()
      freeReg()
      // restoreBlockChain()
    },

    TryStatement(node: et.TryStatement, s: any, c: any): any {
      // const restoreBlockChain = newBlockChain()
      const catchLabel: string = newLabelName()
      const finalLabel: string = newLabelName()

      const endLabel = node.handler ? catchLabel : finalLabel
      cg(['TRY', endLabel, finalLabel])
      c(node.block, s)
      cg(['TRY_END'])

      if (node.handler) {
        lg(catchLabel)
        const restoreBlockChain = newBlockChain()
        const handler = node.handler
        if (handler.param) {
          if (handler.param.type !== 'Identifier') {
            throw new Error('cannot process error type ' + handler.param.type)
          }
          const errName = handler.param.name
          declareVariable(s, errName, 'let')
          cg(['GET_ERR', errName])
        }
        c(handler, s)
        restoreBlockChain()
      }

      lg(finalLabel)
      if (node.finalizer) {
        const finalizer = node.finalizer
        c(finalizer, s)
      }
      // restoreBlockChain()
    },

    ThrowStatement(node: et.ThrowStatement, s: any, c: any): any {
      const reg = newRegister()
      getValueOfNode(node.argument, reg, s, c)
      cg(['THROW', reg])
      freeRegister()
    },
  })

  state.maxRegister = maxRegister
}

const getFunctionDecleration = (func: IFunction): string => {
  const name = func.name
  const params = func.body.params.map((p: any): string => '.' + p.name).join(', ')
  return `func ${name}(${params}) {`
}

export const generateAssemblyFromJs = (jsCode: string): string => {
  const ret = codegen.parse(jsCode)
  let allCodes: any[] = []

  const processFunctionAst = (funcBody: et.Node): void => {
    /** () => a + b，无显式 return 的返回表达式 */
    if (funcBody.type !== 'BlockStatement') {
      // console.log(funcBody, '.....?')
      state.r0 = '$RET'
    }
    parseToCode(funcBody)
    for (let i = 0; i < state.maxRegister; i++) {
      state.codes.push(`REG %r${i}`, 1)
    }
    state.codes.push('}')
    allCodes = [...allCodes, ...state.codes]
    state.codes.clear()
  }

  state = createNewState()
  const globals = getVariablesByFunctionAstBody(ret)
  state.blockChain = state.blockChain.newBlock(globals)
  state.codes.push('func @@main() {', 0)
  processFunctionAst(ret)

  while (state.functions.length > 0) {
    state.isGlobal = false
    state.maxRegister = 0
    const funcInfo = state.functions.shift()!
    const funcBlockChain = funcInfo.blockChain
    const params = funcInfo.body.params.reduce((o, param): any => {
      o.set((param as et.Identifier).name, VariableType.VARIABLE)
      return o
    }, new Map())
    const locals = getVariablesByFunctionAstBody(funcInfo.body.body)
    if (!funcBlockChain.currentFuncBlock) { throw new Error('Should has function block chain.') }
    const currentFuncBlock = funcBlockChain.currentFuncBlock
    currentFuncBlock.params = params
    currentFuncBlock.variables = locals
    state.codes.push(getFunctionDecleration(funcInfo), 0)
    state.codes.push((): string[] => {
      const paramClosureDeclarations = [...currentFuncBlock.params.keys()].reduce((o: any, param: string): any => {
        const paramType = funcBlockChain.getNameType(param)
        if (paramType === VariableType.CLOSURE) {
          // const closureName = currentFuncBlock.closures.get(param)
          // console.log(
          //   '===========+>', varType, param, funcBlockChain.chain[funcBlockChain.chain.length - 1], currentFuncBlock)
          // if (param === VariableType.CLOSURE) {
          const name = funcBlockChain.getName(param)
          o.push(`CLS ${name}`)
          o.push(`MOV ${name} .${param}`)
          // }
          // if (!closureName) { throw new Error(`Parameter ${param} is closure but not allow name`) }
          // o.push(`MOV ${closureName} ${param}`)
        }
        return o
      }, [])
      return paramClosureDeclarations.length > 0 ? paramClosureDeclarations : []
    })
    // state.scopes = funcInfo.scopes
    state.blockChain = funcBlockChain
    // console.log(funcAst?.name, funcAst?.scopes)
    processFunctionAst(funcInfo.body.body)
  }

  allCodes = allCodes.map((s: string | (() => string[])): string[] => {
    const f = (c: string): string => {
      if (c.trim() === '') { return ''}
      if (c.startsWith('func') || c.startsWith('LABEL') || c.startsWith('}')) {
        return c + '\n'
      }
      return `    ${c};\n`
    }
    if (typeof s === 'string') {
      return [f(s)]
    } else {
      return s().map(f)
    }
  }).reduce((cc: string[], c: string[]): string[] => [...cc, ...c], [])
  return allCodes.join("")
// tslint:disable-next-line: max-file-line-count
}
