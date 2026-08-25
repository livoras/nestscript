/**
 * 通过 acorn parser 解析 JS，然后将 JS 转化成 nestscript IR
 */

const acorn = require("acorn")
const walk = require("acorn-walk")
import * as et from "estree"
import { CategoriesPriorityQueue } from './utils'
import { BlockChain, IBlock, IFuncBlock } from './block-chain'

export const enum VariableType {
  NO_EXIST = -1,
  FUNCTION = 1,
  VARIABLE = 2,
  CLOSURE = 3,
  ARGUMENTS = 4,
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
  kind: 'normal' | 'arrow',
  strict: boolean,
  withDepth: number,
  usesArguments: boolean,
  blockChain: BlockChain,
  prepare: () => void,
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
  currentStrict: boolean,
  withDepth: number,

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

  startBlock?: IBlock,
  bodyBlock?: IBlock,
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
    return acorn.parse(code, { ecmaVersion: 2020 })
  }
}

const functionBodyUsesArguments = (body: et.Node): boolean => {
  let found = false
  walk.recursive(body, null, {
    Identifier(node: et.Identifier): void {
      if (node.name === 'arguments') {
        found = true
      }
    },
    FunctionDeclaration(): void {},
    FunctionExpression(): void {},
    // Arrows inherit the surrounding arguments binding, so their body counts
    // as a use by the nearest normal function.
    ArrowFunctionExpression(node: et.ArrowFunctionExpression, s: any, c: any): void {
      c(node.body, s)
    },
  })
  return found
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
          if (locals.get(node.id.name) !== VariableType.FUNCTION) {
            locals.set(node.id.name, VariableType.VARIABLE)
          }
        }
      } else {
        throw new Error("Unprocessed node.id.type " + node.id.type + " " + node.id)
      }
    },

    FunctionDeclaration(node: et.FunctionDeclaration, s: any, c: any): any {
      if (node.id) {
        locals.set(node.id.name, VariableType.FUNCTION)
      }
    },

    FunctionExpression(): any {
    },

    ArrowFunctionExpression(): any {
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
    currentStrict: false,
    withDepth: 0,
  }
}

const hasUseStrictDirective = (body: et.Program | et.BlockStatement): boolean => {
  return body.body.some((statement: any): boolean => statement.directive === 'use strict')
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
    const retReg = s.r0
    const originalFunctionName = (node as any).id?.name
    const isFuntionExpression = node.type === 'FunctionExpression'
    if (originalFunctionName && !isFuntionExpression) {
      declareVariable(s, originalFunctionName, 'var', true)
    }
    const funcName = newFunctionName()
    // s.globals[funcName] = VariableType.FUNCTION
    s.blockChain.newGlobal(funcName, VariableType.FUNCTION)
    s.functions.push({
      name: funcName,
      body: node,
      kind: node.type === 'ArrowFunctionExpression' ? 'arrow' : 'normal',
      strict: s.currentStrict ||
        (node.body.type === 'BlockStatement' && hasUseStrictDirective(node.body)),
      withDepth: s.withDepth,
      usesArguments: functionBodyUsesArguments(node.body),
      blockChain: s.blockChain.newFuncBlock(),
      prepare(): void {
        const funcBlock = s.blockChain.getCurrentBlock() as IFuncBlock
        const isBlockHasSameName = funcBlock.variables.has(originalFunctionName) ||
          funcBlock.params.has(originalFunctionName)
        if (isFuntionExpression && originalFunctionName && !isBlockHasSameName) {
          declareVariable(s, originalFunctionName, 'var')
          cg([`FUNC`, `${originalFunctionName}`, `${funcName}`], { prior })
        }
      },
      // scopes: [...s.scopes, getCurrentScope() || {
      //   locals: s.locals, params: s.params, closureCounter: 0,
      // }],
    })
    s.functionTable[funcName] = node
    // console.log(s.r0, '....', s.functionTable)
    if (retReg) {
      cg([`FUNC`, `${retReg}`, `${funcName}`], { prior })
    }
    if (originalFunctionName && !isFuntionExpression) {
      cg([`FUNC`, `${originalFunctionName}`, `${funcName}`], { prior })
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

  const cg = (ops: any[], { prior, isForceBlock }: { prior?: number, isForceBlock?: boolean } = {}): any => {
    /** 各种动态生成 */
    // if (typeof ops[0] === 'function') {
    //   ops = ops[0]()
    // }

    let operator = ops[0]
    if (!operator || operator ==='undefined') {
      throw new Error('Operator cannot be ' + operator)
    }
    const operants = ops.slice(1)
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
        blockChain.accessName(o)
        // if (isMade && o === 't') {
          // console.log('--------------------------------------------------')
          // console.log(ops)
          // for (const c of blockChain.chain) {
          //   console.log(c)
          // }
        // }
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
      if (
        ['BLOCK', 'END_BLOCK', 'CLR_BLOCK'].includes(operator) &&
        currentBlock.variables.size === 0 &&
        !(currentBlock.isForceBlock || isForceBlock)
      ) {
        return []
      }

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
      if (s.withDepth > 0) {
        const fallbackKind = s.blockChain.getNameType(node.name) === VariableType.ARGUMENTS
          ? 2
          : (s.blockChain.hasName(node.name) ? 1 : 0)
        cg([
          `WITH_SET`, `"${node.name}"`, `${fallbackKind}`,
          fallbackKind === 1 ? node.name : 'undefined', reg,
        ])
      } else if (s.blockChain.getNameType(node.name) === VariableType.ARGUMENTS) {
        cg(['SET_ARGS', reg])
      } else if (s.blockChain.hasName(node.name)) {
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
        if (s.withDepth > 0) {
          const fallbackKind = s.blockChain.getNameType(node.name) === VariableType.ARGUMENTS
            ? 2
            : (s.blockChain.hasName(node.name) ? 1 : 0)
          cg([
            `WITH_GET`, `${reg}`, `"${node.name}"`, `${fallbackKind}`,
            fallbackKind === 1 ? node.name : 'undefined',
          ])
        } else if (s.blockChain.getNameType(node.name) === VariableType.ARGUMENTS) {
          cg([`MOV_ARGS`, `${ reg }`])
        } else if (s.blockChain.hasName(node.name)) {
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
      s.r1 = null
      s.r2 = null
      c(node, s)
      s.r0 = null
      s.r1 = null
      s.r2 = null
    }
  }

  const declareVariable = (
    s: IState, name: string,
    kind: 'let' | 'var' | 'const' = 'var',
    isForce: boolean = false,
  ): void => {
    if (kind === 'let' || kind === 'const') {
      if (!s.blockChain.hasOwnName(name)) {
        // Register the name before emitting the declaration so earlier reads
        // in the same block resolve to this lexical binding and observe TDZ.
        s.blockChain.newName(name, kind, isForce)
        cg(
          [kind === 'let' ? 'LET' : 'CONST', name],
          // Top-level function declarations are emitted with priority 4. The
          // captured lexical cell must exist (still uninitialized) before a
          // hoisted function closes over it.
          s.blockChain.chain.length === 1 ? { prior: 2 } : {},
        )
      }
      return
    }

    if (state.isGlobal && ['undefined', 'NaN', 'Infinity'].includes(name)) {
      // These names already denote immutable properties of the ES global
      // object. A var declaration does not create a shadow binding.
      return
    }

    if (state.isGlobal) {
      cg([`GLOBAL_BIND`, `${name}`, `"${name}"`], { prior: 1 })
    } else {
      const functionBlock = s.blockChain.currentFuncBlock
      cg([
        `VAR`,
        (): string => functionBlock?.variables.get(name) === VariableType.CLOSURE
          ? `@${name}`
          : name,
      ], { prior: 1 })
    }
    s.blockChain.newName(name, kind, isForce)
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

  const predeclareLexicalDeclarations = (nodes: readonly any[], s: IState): void => {
    nodes.forEach((node: any): void => {
      if (node.type !== 'VariableDeclaration' || node.kind === 'var') { return }
      node.declarations.forEach((declaration: et.VariableDeclarator): void => {
        if (declaration.id.type !== 'Identifier') {
          throw new Error('Unprocessed lexical declaration ' + declaration.id.type)
        }
        declareVariable(s, declaration.id.name, node.kind)
      })
    })
  }

  const evaluateDiscarded = (node: any, s: IState, c: any): void => {
    // Most compound visitors already evaluate their observable children when
    // no result is requested. Bare references are the important exception:
    // they still need GetValue for getters and ReferenceError behaviour.
    if (node.type === 'Identifier' || node.type === 'MemberExpression') {
      const result = newRegister()
      getValueOfNode(node, result, s, c)
      freeRegister()
    } else {
      const previousResult = s.r0
      s.r0 = null
      c(node, s)
      s.r0 = previousResult
    }
  }

  /**
   * 表达式结果处理原则：所有没有向下一层传递 s.r0 的都要处理 s.r0
   */
  walk.recursive(ast, state, {
    Program(node: et.Program, s: any, c: any): void {
      predeclareLexicalDeclarations(node.body, s)
      node.body.forEach((n: any): void => c(n, s))
    },

    ExpressionStatement(node: et.ExpressionStatement, s: any, c: any): void {
      // Even when an expression's value is discarded, evaluating it can be
      // observable: a property read can invoke a getter and an identifier read
      // can throw. Supplying a temporary destination keeps those semantics
      // instead of allowing leaf visitors to silently skip the expression.
      evaluateDiscarded(node.expression, s, c)
    },

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
      const isLexical = s.varKind === 'let' || s.varKind === 'const'
      if (isLexical) {
        const valueReg = newReg()
        if (node.init) {
          getValueOfNode(node.init, valueReg, s, c)
        } else {
          cg(['MOV', valueReg, 'undefined'])
        }
        cg(['INIT', reg, valueReg])
      } else if (
        node.init &&
        state.isGlobal &&
        (reg === 'undefined' || reg === 'NaN' || reg === 'Infinity')
      ) {
        const valueReg = newReg()
        getValueOfNode(node.init, valueReg, s, c)
        cg(['SET_CTX', `"${reg}"`, valueReg])
      } else if (
        node.init &&
        s.blockChain.getNameType(reg) === VariableType.ARGUMENTS
      ) {
        const valueReg = newReg()
        getValueOfNode(node.init, valueReg, s, c)
        setValueToNode(node.id, valueReg, s, c)
      } else if (node.init && s.varKind === 'var' && s.withDepth > 0) {
        const valueReg = newReg()
        getValueOfNode(node.init, valueReg, s, c)
        setValueToNode(node.id, valueReg, s, c)
      } else if (node.init) {
        if (node.init?.type === 'Identifier') {
          // if (!state.isGlobal) {
          getValueOfNode(node.init, reg, s, c)
          // cg([`MOV`, reg, node.init.name])
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
        // s.r0 = node.id?.name
        // declareVariable(s, s.r0)
        parseFunc(node, s, 4)
      }
      s.r0 = null
    },

    CallExpression(node: et.CallExpression, s: any, c: any): any {
      const retReg = s.r0
      const isNewExpression = !!s.isNewExpression
      delete s.isNewExpression

      // JavaScript evaluates the callee (and captures its Reference) before
      // evaluating any argument. Keep both the function value and its receiver
      // alive while arguments are evaluated so argument side effects cannot
      // change which function is called or what `this` is bound to.
      let calleeReg: string
      let thisReg: string | null = null
      if (node.callee.type === 'MemberExpression') {
        calleeReg = newRegister()
        const objReg = newRegister()
        const keyReg = newRegister()
        s.r0 = null
        s.r1 = objReg
        s.r2 = keyReg
        c(node.callee, s)
        cg(['MOV_PROP', calleeReg, objReg, keyReg])
        thisReg = objReg
        freeRegister()
      } else if (node.callee.type === 'Identifier' && s.withDepth > 0) {
        calleeReg = newRegister()
        thisReg = newRegister()
        const name = node.callee.name
        const fallbackKind = s.blockChain.getNameType(name) === VariableType.ARGUMENTS
          ? 2
          : (s.blockChain.hasName(name) ? 1 : 0)
        cg([
          'WITH_RESOLVE', calleeReg, thisReg, `"${name}"`, `${fallbackKind}`,
          fallbackKind === 1 ? name : 'undefined',
        ])
      } else {
        calleeReg = newRegister()
        getValueOfNode(node.callee, calleeReg, s, c)
      }

      const args = [...node.arguments]
      for (const arg of args) {
        const reg = s.r0 = newRegister()
        getValueOfNode(arg, reg, s, c)
        cg([`PUSH`, reg])
        freeRegister()
      }

      if (thisReg) {
        cg(['CALL_REF', calleeReg, thisReg, node.arguments.length, isNewExpression])
      } else {
        cg(['CALL_REG', calleeReg, node.arguments.length, isNewExpression])
      }
      if (retReg) {
        cg([`MOV`, retReg, `$RET`])
      }
      freeRegister()
      if (thisReg) {
        freeRegister()
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
      predeclareLexicalDeclarations(node.body, s)
      node.body.forEach((n: any): void => c(n, s))
      restoreBlockChain()
    },

    WithStatement(node: et.WithStatement, s: any, c: any): void {
      const objectReg = newRegister()
      const endLabel = newLabelName()
      getValueOfNode(node.object, objectReg, s, c)
      cg(['ENTER_WITH', objectReg, endLabel])
      s.withDepth++
      c(node.body, s)
      s.withDepth--
      cg(['EXIT_WITH'])
      lg(endLabel)
      freeRegister()
    },

    MemberExpression(node: et.MemberExpression, s: any, c: any): void {
      const [newReg, freeReg] = newRegisterController()
      const valReg = s.r0
      const objReg = s.r1 || newReg()
      const keyReg = s.r2 || newReg()

      if (node.object.type === 'MemberExpression') {
        s.r0 = objReg
        s.r1 = newRegister()
        s.r2 = null
        c(node.object, s)
        freeRegister()
      } else if (node.object.type === 'Identifier') {
        getValueOfNode(node.object, objReg, s, c)
      } else {
        // s.r0 = objReg
        // c(node.object, s)
        getValueOfNode(node.object, objReg, s, c)
      }

      if (node.property.type === 'MemberExpression') {
        s.r0 = keyReg
        s.r1 = null
        s.r2 = newRegister()
        c(node.property, s)
        freeRegister()
      } else if (node.property.type === 'Identifier') {
        // a.b.c.d
        if (node.computed) {
          getValueOfNode(node.property, keyReg, s, c)
        } else {
          cg([`MOV`, keyReg, `"${node.property.name}"`])
        }
      } else {
        getValueOfNode(node.property, keyReg, s, c)
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
      let rightReg: string
      const isLeftMembership = left.type === 'MemberExpression'
      let objReg: any // = newReg()
      let keyReg: any // = newReg()

      if (isLeftMembership) {
        objReg = newReg()
        keyReg = newReg()
        s.r1 = objReg
        s.r2 = keyReg
        c(left, s)
      }

      const getLeftReg = (reg: string): void => {
        if (isLeftMembership) {
          cg(["MOV_PROP", reg, objReg, keyReg])
        } else {
          getValueOfNode(left, reg, s, c)
        }
      }

      const setLeftReg = (reg: string): void => {
        if (isLeftMembership) {
          cg([`SET_KEY`, `${objReg}`, keyReg, `${reg}`])
        } else {
          setValueToNode(left, reg, s, c)
        }
      }

      if (node.operator !== '=') {
        const o = node.operator.replace(/\=$/, '')
        const cmd = codeMap[o]
        if (!cmd) { throw new Error(`Operation ${o} is not implemented.`)}
        const leftReg = newReg()
        // GetValue(left) happens before the right-hand expression. This is
        // observable when the RHS mutates the same binding or invokes getters.
        getLeftReg(leftReg)
        rightReg = newReg()
        getValueOfNode(right, rightReg, s, c)
        cg([`${cmd}`, leftReg, rightReg])
        rightReg = leftReg
      } else {
        rightReg = newReg()
        getValueOfNode(right, rightReg, s, c)
      }
      setLeftReg(rightReg)
      // setValueToNode(left, rightReg, s, c)
      if (retReg) {
        cg([`MOV`, retReg, rightReg])
      }
      freeReg()
    },

    BinaryExpression(node: et.BinaryExpression, s: any, c: any): void {
      const [newReg, freeReg] = newRegisterController()

      const leftReg = s.r0 || newReg()
      s.r0 = null
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
      const resultReg = s.r0

      if (
        op === 'typeof' &&
        node.argument.type === 'Identifier' &&
        s.withDepth > 0
      ) {
        const reg = s.r0 || newReg()
        const name = node.argument.name
        const fallbackKind = s.blockChain.getNameType(name) === VariableType.ARGUMENTS
          ? 2
          : (s.blockChain.hasName(name) ? 1 : 0)
        cg([
          'WITH_TYPEOF', reg, `"${name}"`, `${fallbackKind}`,
          fallbackKind === 1 ? name : 'undefined',
        ])
        freeReg()
        return
      }

      if (
        op === 'typeof' &&
        node.argument.type === 'Identifier' &&
        !s.blockChain.hasName(node.argument.name) &&
        node.argument.name !== 'arguments'
      ) {
        const reg = s.r0 || newReg()
        cg(['TYPEOF_CTX', reg, `"${node.argument.name}"`])
        freeReg()
        return
      }

      if (op !== 'delete') {
        const reg = s.r0 || newReg()
        if (!reg) {
          throw new Error('! regster should not be null')
        }
        getValueOfNode(node.argument, reg, s, c)
        cg([`${cmd}`, `${reg}`])
      } else {
        const retReg = resultReg || newReg()
        if (node.argument.type === 'MemberExpression') {
          s.r0 = null
          const objReg = s.r1 = newReg()
          const keyReg = s.r2 = newReg()
          c(node.argument, s)
          cg([`DELETE_REF`, `${retReg}`, `${objReg}`, `${keyReg}`])
          s.r1 = null
          s.r2 = null
        } else if (node.argument.type === 'Identifier') {
          if (s.withDepth > 0) {
            const name = node.argument.name
            const fallbackKind = s.blockChain.getNameType(name) === VariableType.ARGUMENTS
              ? 2
              : (s.blockChain.hasName(name) ? 1 : 0)
            cg([
              'WITH_DELETE', retReg, `"${name}"`, `${fallbackKind}`,
              fallbackKind === 1 ? name : 'undefined',
            ])
          } else if (s.blockChain.hasName(node.argument.name) || node.argument.name === 'arguments') {
            cg([`MOV`, `${retReg}`, 'false'])
          } else {
            cg([`DELETE_CTX`, `${retReg}`, `"${node.argument.name}"`])
          }
        } else {
          // Delete of a non-Reference still evaluates its operand for side
          // effects, then produces true.
          const valueReg = newReg()
          getValueOfNode(node.argument, valueReg, s, c)
          cg([`MOV`, `${retReg}`, 'true'])
        }
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
      if (node.init && node.init.type === 'VariableDeclaration') {
        predeclareLexicalDeclarations([node.init], s)
      }
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
      labels.startBlock = s.blockChain.getCurrentBlock()
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
      labels.bodyBlock = s.blockChain.getCurrentBlock()
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
      if (left.type === 'VariableDeclaration') {
        predeclareLexicalDeclarations([left], s)
      }
      let leftTarget: et.Identifier
      if (left.type === 'Identifier') {
        leftTarget = left
      } else if (left.type === 'VariableDeclaration') {
        const varDecorator = left.declarations[0]
        leftTarget = varDecorator.id as et.Identifier
        declareVariable(s, leftTarget.name, left.kind)
      } else {
        throw new Error('Cannot process for in statement left type ' + left.type)
      }
      const rightReg = newReg()
      const iteratorReg = newReg()
      const iterationValueReg = newReg()
      const startLabel = newLabelName()
      const endLabel = newLabelName()
      getValueOfNode(right, rightReg, s, c)
      const labels: BlockLabel = {
        startLabel,
        endLabel,
        updateLabel: startLabel,
        blockNameStart: restoreBlockChain.blockIndexName,
        startBlock: s.blockChain.getCurrentBlock(),
      }
      pushLoopLabels(labels)
      cg(['FORIN_INIT', iteratorReg, rightReg])
      lg(startLabel)
      cg(['FORIN_NEXT', iterationValueReg, iteratorReg, endLabel])
      setValueToNode(leftTarget, iterationValueReg, s, c)
      const restoreBlockChainBody = newBlockChain()
      labels.blockNameBody = restoreBlockChainBody.blockIndexName
      labels.bodyBlock = s.blockChain.getCurrentBlock()
      c(node.body, s)
      restoreBlockChainBody()
      cg(['JMP', startLabel])
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
        lb.startBlock!.isForceBlock = true
        cg(['CLR_BLOCK', lb.blockNameStart], { isForceBlock: true })
        cg(['ABRUPT_JUMP', lb.endLabel])
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
      if (labels.startBlock) { // for switch case
        labels.startBlock.isForceBlock = true
      }
      // Block index 0 is valid for the first compiled top-level block.
      if (labels.blockNameStart === void 0) {
        throw new Error('No start block name')
      }
      cg(['CLR_BLOCK', labels.blockNameStart], { isForceBlock: true })
      cg([`ABRUPT_JUMP`, `${endLabel}`])
    },

    ContinueStatement(node: et.ContinueStatement, s: any, c: any): any {
      if (node.label) {
        const { name } = node.label
        if (!blockEndLabels.has(name)) {
          throw new Error(`Label ${name} does not exist.`)
        }
        const blockLabel = blockEndLabels.get(name)!
        // continue label; 语法，如果有 update ，回到 update， 否则回到头
        blockLabel.bodyBlock!.isForceBlock = true
        cg(['CLR_BLOCK', blockLabel.blockNameBody], { isForceBlock: true })
        cg(['ABRUPT_JUMP', blockLabel.updateLabel || blockLabel.startLabel])
        return
      }

      const labels = getCurrentLoopLabel()
      if (!labels) {
        throw new Error("Not available labels, cannot use `continue` here.")
      }
      if (labels.isForIn) {
        labels.bodyBlock!.isForceBlock = true
        cg(['CLR_BLOCK', labels.blockNameBody], { isForceBlock: true })
        cg(['CONT_FORIN'])
        return
      }
      const { startLabel, updateLabel } = labels
      // cg(`JMP ${endLabel} (break)`)
      labels.bodyBlock!.isForceBlock = true
      cg(['CLR_BLOCK', labels.blockNameBody], { isForceBlock: true })
      cg([`ABRUPT_JUMP`, `${updateLabel || startLabel}`])
    },

    UpdateExpression(node: et.UpdateExpression, s: any, c: any): any {
      const op = node.operator
      const [newReg, freeReg] = newRegisterController()
      const retReg = s.r0
      const reg = newReg()
      getValueOfNode(node.argument, reg, s, c)
      // Both prefix and postfix update first apply ToNumber. In the postfix
      // form the saved result is that numeric value, not the original string
      // or object operand.
      cg([`PLUS`, `${reg}`])
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
        cg([`DEF_DATA`, `${reg}`, `${i}`, `${valReg}`])
        freeRegister()
      })
      // Elisions create no indexed properties but still contribute to the
      // array literal's length.
      cg([`SET_KEY`, `${reg}`, `'length'`, `${node.elements.length}`])
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
        const keyReg = newReg()
        getValueOfNode(node.key, keyReg, s, c)
        key = keyReg
      }
      getValueOfNode(node.value, valReg, s, c)
      if (node.kind === 'get' || node.kind === 'set') {
        cg([`DEF_PROP`, `${objReg}`, key, `${valReg}`, `'${node.kind}'`])
      } else {
        cg([`DEF_DATA`, `${objReg}`, key, `${valReg}`])
      }
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
      node.expressions.forEach((n, i): void => {
        if (i === node.expressions.length - 1 && r0) {
          getValueOfNode(n, r0, s, c)
        } else {
          evaluateDiscarded(n, s, c)
        }
      })
      s.r0 = r0
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
      blockEndLabels.set(labelName, {
        endLabel,
        blockNameStart: restoreBlockChain.blockIndexName,
        startBlock: s.blockChain.getCurrentBlock(),
      })
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
      const restoreBlockChain = newBlockChain()
      predeclareLexicalDeclarations(
        node.cases.reduce<any[]>((all, switchCase): any[] => [...all, ...switchCase.consequent], []),
        s,
      )
      const [newReg, freeReg] = newRegisterController()
      const discriminantReg = newReg()
      getValueOfNode(node.discriminant, discriminantReg, s, c)
      const switchEndLabel = newLabelName()
      const caseLabels = node.cases.map((): string => newLabelName())
      let defaultLabel: string | null = null
      const label: BlockLabel = {
        endLabel: switchEndLabel,
        blockNameStart: restoreBlockChain.blockIndexName,
        startBlock: s.blockChain.getCurrentBlock(),
      }
      pushLoopLabels(label)

      // Selection and execution are separate phases. In particular, a
      // `default` in the middle must not run until all later case tests have
      // also been checked.
      node.cases.forEach((cs: et.SwitchCase, i: number): void => {
        if (cs.test) {
          const testReg = newReg()
          getValueOfNode(cs.test, testReg, s, c)
          cg(['JE', discriminantReg, testReg, caseLabels[i]])
        } else {
          defaultLabel = caseLabels[i]
        }
      })
      cg(['JMP', defaultLabel || switchEndLabel])

      node.cases.forEach((cs: et.SwitchCase, i: number): void => {
        lg(caseLabels[i])
        cs.consequent.forEach((n: any): void => c(n, s))
      })

      lg(switchEndLabel)
      popLoopLabels()
      freeReg()
      restoreBlockChain()
    },

    TryStatement(node: et.TryStatement, s: any, c: any): any {
      const catchLabel: string = newLabelName()
      const finalLabel: string = newLabelName()
      const endLabel: string = newLabelName()
      const catchTarget = node.handler ? catchLabel : endLabel
      const finallyTarget = node.finalizer ? finalLabel : endLabel

      cg([
        'TRY',
        catchTarget,
        finallyTarget,
        endLabel,
        !!node.handler,
        !!node.finalizer,
      ])
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
          const errReg = newRegister()
          cg(['GET_ERR', errReg])
          cg(['INIT', errName, errReg])
          freeRegister()
        }
        c(handler.body, s)
        restoreBlockChain()
        cg(['TRY_END'])
      }

      if (node.finalizer) {
        lg(finalLabel)
        c(node.finalizer, s)
        cg(['FINALLY_END'])
      }
      lg(endLabel)
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
    for (const code of state.codes) {
      allCodes.push(code)
    }
    state.codes.clear()
  }

  state = createNewState()
  state.currentStrict = hasUseStrictDirective(ret)
  const globals = getVariablesByFunctionAstBody(ret)
  globals.delete('undefined')
  globals.delete('NaN')
  globals.delete('Infinity')
  state.blockChain = state.blockChain.newBlock(globals)
  state.codes.push('func @@main() {', 0)
  state.codes.push(`META ${state.currentStrict ? 2 : 0}`, 0)
  processFunctionAst(ret)

  let functionCursor = 0
  while (functionCursor < state.functions.length) {
    state.isGlobal = false
    state.maxRegister = 0
    const funcInfo = state.functions[functionCursor++]
    state.currentStrict = funcInfo.strict
    state.withDepth = funcInfo.withDepth
    const funcBlockChain = funcInfo.blockChain
    const params = funcInfo.body.params.reduce((o, param): any => {
      o.set((param as et.Identifier).name, VariableType.VARIABLE)
      return o
    }, new Map())
    const locals = getVariablesByFunctionAstBody(funcInfo.body.body)
    for (const name of params.keys()) {
      // A var declaration with the same name as a formal parameter reuses the
      // parameter binding. Function declarations are different: ES5 binding
      // instantiation replaces the parameter value with the function.
      if (locals.get(name) === VariableType.VARIABLE) {
        locals.delete(name)
      }
    }
    if (
      funcInfo.kind === 'normal' &&
      !params.has('arguments') &&
      locals.get('arguments') !== VariableType.FUNCTION
    ) {
      locals.set('arguments', VariableType.ARGUMENTS)
    }
    if (!funcBlockChain.currentFuncBlock) { throw new Error('Should has function block chain.') }
    const currentFuncBlock = funcBlockChain.currentFuncBlock
    currentFuncBlock.params = params
    currentFuncBlock.variables = locals
    state.codes.push(getFunctionDecleration(funcInfo), 0)
    const flags = (funcInfo.kind === 'arrow' ? 1 : 0) |
      (funcInfo.strict ? 2 : 0) |
      (funcInfo.usesArguments ? 4 : 0)
    state.codes.push(`META ${flags}`, 0)
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
    if (funcInfo.prepare) {
      funcInfo.prepare()
    }
    // console.log(funcAst?.name, funcAst?.scopes)
    processFunctionAst(funcInfo.body.body)
  }

  const output: string[] = []
  const appendFormatted = (code: string): void => {
    if (code.trim() === '') { return }
    if (code.startsWith('func') || code.startsWith('LABEL') || code.startsWith('}')) {
      output.push(code + '\n')
    } else {
      output.push(`    ${code};\n`)
    }
  }
  for (const code of allCodes as Array<string | (() => string[])>) {
    if (typeof code === 'string') {
      appendFormatted(code)
    } else {
      for (const generated of code()) {
        appendFormatted(generated)
      }
    }
  }
  return output.join("")
// tslint:disable-next-line: max-file-line-count
}
