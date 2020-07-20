/**
 * 通过 acorn parser 解析 JS，然后将 JS 转化成 nestscript IR
 */

const acorn = require("acorn")
const walk = require("acorn-walk")
import * as et from "estree"

const enum VariableType {
  FUNCTION = 1,
  VARIABLE = 2,
  CLOSURE = 3,
}

interface IScope {
  params: any,
  locals: any,
  closureTable?: any,
  closureCounter?: number // 只有最外层的函数有
}

interface IFunction {
  name: string,
  body: et.FunctionExpression | et.ArrowFunctionExpression | et.FunctionDeclaration,
  scopes: IScope[], // 存储作用域链
  // params: { [x in string]: 1 }[],
}

interface IState {
  tmpVariableName: string,
  globals: any,
  locals: any,
  params: any,
  scopes: IScope[],
  isGlobal: boolean,
  labelIndex: number,
  functionIndex: number,
  functionTable: any,
  functions: IFunction[],
  codes: (string | (() => string[]))[],
  r0: string | null,
  r1: string | null,
  r2: string | null,
  maxRegister: number,
  currentFunctionName: string,
  funcName: string,
  currentScope?: IScope,

  // $obj: string,
  // $key: string,
  // $val: string,
}

class Codegen {
  public parse(code: string): et.Program {
    return acorn.parse(code)
  }
}

const codegen = new Codegen()
let state: IState
const createNewState = (): IState => {
  return {
    tmpVariableName: '',
    isGlobal: true,
    globals: {},
    locals: {},
    params: {},
    scopes: [],
    labelIndex: 0,
    functionIndex: 0,
    functions: [],
    functionTable: {},
    funcName: '',
    codes: [],
    r0: '', // 寄存器的名字
    r1: '', // 寄存器的名字
    r2: '', //
    maxRegister: 0,
    currentFunctionName: '',
  }
}
// tslint:disable-next-line: no-big-function
const parseToCode = (ast: any): void => {
  const newFunctionName = (): string => {
    state.currentFunctionName = `___f___${state.functionIndex++}`
    return state.currentFunctionName
  }

  const parseFunc = (
    node: et.FunctionExpression | et.ArrowFunctionExpression | et.FunctionDeclaration,
    s: IState,
  ): string => {
    const funcName = s.funcName || newFunctionName()
    s.globals[funcName] = VariableType.FUNCTION
    s.functions.push({
      name: funcName,
      body: node,
      scopes: [...s.scopes, getCurrentScope() || {
        locals: s.locals, params: s.params, closureCounter: 0,
      }],
    })
    s.functionTable[funcName] = node
    if (s.r0 && !state.isGlobal) {
      cg(`FUNC`, `${s.r0}`, `${funcName}`)
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

  const hasLocalOrParam = (name: string, s: IState): boolean => {
    return s.locals[name] || s.params[name]
  }

  const hasVars = (name: string, s: any): boolean => {
    if (hasLocalOrParam(name, s)) { return true }
    for (const scope of [...state.scopes]) {
      if (scope.locals[name] || scope.params[name]) {
        return true
      }
    }
    return !!s.globals[name]
  }

  const getCurrentScope = (): IScope => {
    return state.currentScope!
  }

  const allocateClosure = (root: IScope, scope: IScope, reg: string): void => {
    if (!scope.closureTable) {
      scope.closureTable = {}
    }
    if (!scope.closureTable[reg]) {
      if (root.closureCounter === void 0) {
        throw new Error("Root scope closure counter cannot be 0.")
      } else {
        scope.closureTable[reg] = `@c${root.closureCounter++}`
      }
    }
  }

  const touchRegister = (reg: string, currentScope: IScope, scopes: IScope[]): void => {
    /** 这个变量当前 scope 有了就不管了 */
    if (currentScope.locals[reg] || currentScope.params[reg]) { return }
    for (const scope of [...scopes].reverse()) {
      if (scope.locals[reg]) {
        scope.locals[reg] = VariableType.CLOSURE
        allocateClosure(scopes[0], scope, reg)
        return
      }
      if (scope.params[reg]) {
        scope.params[reg] = VariableType.CLOSURE
        allocateClosure(scopes[0], scope, reg)
        return
      }
    }
  }

  const getRegisterName = (reg: string, currentScope: IScope, scopes: IScope[], isVar: boolean = false): string => {
    const isClosure = (v: VariableType): boolean => v === VariableType.CLOSURE
    for (const scope of [currentScope, ...scopes].reverse()) {
      if (
        isClosure(scope.locals[reg]) ||
        isClosure(scope.params[reg])
      ) {
        return scope.closureTable[reg]
      }
    }
    return reg
  }

  const cg = (...ops: any[]): any => {
    // const isJump = (cc: string | (() => string)): boolean => typeof cc === 'string' && /^JMP/.test(cc)
    // 不要同时跳转两次
    // const lastCode = state.codes[state.codes.length - 1]
    // if (isJump(c) && isJump(lastCode)) { return }
    const operator = ops[0]
    const operants = ops.slice(1)
    // if (ops[0] === 'MOV') {
    //   state.codes.push(createMovCode(ops[1], ops[2], getCurrentScope()))
    // } else {
    const currentScope = getCurrentScope()
    const scopes = state.scopes
    operants.forEach((o: string): void => touchRegister(o, currentScope, scopes))
    return state.codes.push((): string[] => {
      const processedOps = operants.map((o): string => getRegisterName(o, currentScope, scopes, operator === 'VAR'))
      const c = [operator, ...processedOps].join(' ')
      const ret = [c]
      if (operator === 'VAR' && processedOps[0].match(/^@c/)) {
        ret.push(`ALLOC ${processedOps[0]}`)
      }
      return ret
    })
    // }
  }

  const callIdentifier = (id: string, numArgs: number, s: IState): void => {
    if (s.functionTable[id]) {
      cg('CALL', id, numArgs)
    } else if (hasVars(id, s)) {
      cg('CALL_REG', id, numArgs)
    } else {
      // const reg = newRegister()
      cg('CALL_CTX', `"${id}"`, numArgs)
      // freeRegister()
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
      cg(`SET_KEY`, objReg, keyReg, reg)
      freeRegister()
      freeRegister()
    } else if (node.type === 'Identifier') {
      if (hasVars(node.name, s)) {
        cg(`MOV`, `${ node.name }`, `${ reg }`)
      } else {
        cg(`SET_CTX`, `"${node.name}"`, `${ reg }`)
      }
    } else {
      throw new Error('Unprocessed assignment')
    }
  }

  const getValueOfNode = (node: any, reg: string, s: IState, c: any): any => {
    if (node.type === 'Identifier') {
      if (hasVars(node.name, s)) {
        cg(`MOV`, `${ reg }`, `${ node.name }`)
      } else {
        cg(`MOV_CTX`, `${ reg }`, `"${node.name}"`)
      }
    } else {
      s.r0 = reg
      c(node, s)
    }
  }

  const loopEndLabels: string[] = []
  const pushLoopEndLabels = (label: string): any => loopEndLabels.push(label)
  const popLoopEndLabels = (): any => loopEndLabels.pop()
  const getCurrentLoopEndLabel = (): string => loopEndLabels[loopEndLabels.length - 1]

  walk.recursive(ast, state, {
    VariableDeclaration: (node: et.VariableDeclaration, s: any, c: any): void => {
      // console.log("VARIABLE...", node)
      node.declarations.forEach((n: any): void => c(n, state))
    },

    /** 要处理 (global, local) * (function, other) 的情况 */
    VariableDeclarator: (node: et.VariableDeclarator, s: any, c: any): void => {
      // console.log(node)
      const [newReg, freeReg] = newRegisterController()
      let reg
      let funcName = ''
      const isInitFunction = node.init?.type === 'FunctionExpression' || node.init?.type === 'ArrowFunctionExpression'
      if (node.id.type === 'Identifier') {
        if (isInitFunction) {
          reg = node.id.name // newReg()
          if (state.isGlobal) {
            funcName = node.id.name
          } else {
            s.locals[node.id.name] = VariableType.VARIABLE
            cg(`VAR`, `${node.id.name}`)
            funcName = newFunctionName()
          }
        } else {
          if (state.isGlobal) {
            cg(`GLOBAL`, node.id.name)
            s.globals[node.id.name] = VariableType.VARIABLE
          } else {
            cg(`VAR`, `${node.id.name}`)
            s.locals[node.id.name] = VariableType.VARIABLE
          }
          reg = node.id.name
        }
      } else {
        throw new Error("Unprocessed node.id.type " + node.id.type + " " + node.id)
      }
      if (node.init?.type === 'Identifier') {
        if (!state.isGlobal) {
          cg(`MOV`, reg, node.init.name)
        }
      } else {
        s.r0 = reg
        s.funcName = funcName
        c(node.init, s)
      }
      freeReg()
      delete s.funcName
    },

    FunctionDeclaration(node: et.FunctionDeclaration, s: any, c: any): any {
      s.funcName = node.id?.name
      parseFunc(node, s)
    },

    CallExpression(node: et.CallExpression, s: any, c: any): any {
      const retReg = s.r0
      const args = [...node.arguments]
      args.reverse()
      for (const arg of args) {
        const reg = s.r0 = newRegister()
        if (arg.type === 'Identifier') {
          getValueOfNode(arg, reg, s, c)
        } else {
          c(arg, s)
          freeRegister()
        }
        cg(`PUSH`, reg)
      }

      if (node.callee.type === "MemberExpression") {
        s.r0 = null
        const objReg = s.r1 = newRegister()
        const keyReg = s.r2 = newRegister()
        c(node.callee, s)
        cg(`CALL_VAR`, objReg, keyReg, node.arguments.length)
        freeRegister()
        freeRegister()
      } else if (node.callee.type === "Identifier") {
        callIdentifier(node.callee.name, node.arguments.length, s)
      } else {
        const ret = s.r0 = newRegister()
        c(node.callee, s)
        freeRegister()
        cg(`CALL_REG`, ret, node.arguments.length)
      }
      if (retReg) {
        cg(`MOV`, retReg, `$RET`)
      }
      s.r0 = null
    },

    Literal: (node: et.Literal, s: any): void => {
      let val
      if (node.value === true) {
        val = true
      } else if (node.value === false) {
        val = false
      } else {
        val = node.raw
      }
      if (s.r0) {
        cg(`MOV`, s.r0, val)
      }
    },

    ArrowFunctionExpression(node: et.ArrowFunctionExpression, s: any, c: any): any {
      parseFunc(node, s)
    },

    FunctionExpression(node: et.FunctionExpression, s: any, c: any): any {
      parseFunc(node, s)
    },

    BlockStatement(node: et.BlockStatement, s: any, c: any): void {
      node.body.forEach((n: any): void => c(n, s))
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
          cg(`MOV`, keyReg, node.property.name)
        } else {
          cg(`MOV`, keyReg, `"${node.property.name}"`)
        }
      } else {
        s.r0 = keyReg
        c(node.property, s)
      }

      if (valReg) {
        cg(`MOV_PROP`, valReg, objReg, keyReg)
      }
      s.r0 = null
      s.r1 = null
      s.r2 = null
      freeReg()
    },

    AssignmentExpression(node: et.AssignmentExpression, s: any, c: any): any {
      const left = node.left
      const right = node.right
      const [newReg, freeReg] = newRegisterController()
      const rightReg = newReg()
      getValueOfNode(right, rightReg, s, c)
      setValueToNode(left, rightReg, s, c)
      freeReg()
    },

    BinaryExpression(node: et.BinaryExpression, s: any, c: any): void {
      const [newReg, freeReg] = newRegisterController()

      const leftReg = s.r0 || newReg()
      const rightReg = newReg()

      getValueOfNode(node.left, leftReg, s, c)
      getValueOfNode(node.right, rightReg, s, c)

      const codeMap = {
        '<': 'LT',
        '>': 'GT',
        '===': 'EQ',
        '!==': 'NE',
        '==': 'EQ',
        '!=': 'NE',
        '<=': 'LE',
        '>=': 'GE',
        '+': 'ADD',
        '-': 'SUB',
        '*': 'MUL',
        '/': 'DIV',
        '%': 'MOD',
        '<<': 'SHL',
        '>>': 'SHR',
      }

      const op = codeMap[node.operator]
      if (!op) {
        throw new Error(`${ op } is not implemented.`)
      }
      cg(op, leftReg, rightReg)
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
      }
      const [newReg, freeReg] = newRegisterController()
      const cmd = codesMap[node.operator]

      if (op !== 'delete') {
        const reg = s.r0
        getValueOfNode(node.argument, reg, s, c)
        cg(`${cmd} ${reg}`)
      } else {
        s.r0 = null
        const objReg = s.r1 = newReg()
        const keyReg = s.r2 = newReg()
        c(node.argument, s)
        cg(`${cmd} ${objReg} ${keyReg}`)
        s.r1 = null
        s.r2 = null
      }

      freeReg()
    },

    IfStatement(node: et.IfStatement, s: any, c: any): void {
      const [newReg, freeReg] = newRegisterController()

      const testReg = newReg()
      const nextLabel = newLabelName()
      const hasEndLabel = !!s.endLabel
      const endLabel = s.endLabel || newLabelName()
      s.endLabel = endLabel

      s.r0 = testReg
      c(node.test, s)

      cg(`JF`, testReg, nextLabel)
      c(node.consequent, s)
      cg(`JMP`, endLabel)

      cg(`LABEL`, `${ nextLabel }:`)
      if (node.alternate) {
        c(node.alternate, s)
      }

      if (!hasEndLabel) {
        cg(`LABEL`, `${ endLabel }:`)
        delete s.endLabel
      }

      freeReg()
    },

    LogicalExpression(node: et.LogicalExpression, s: any, c: any): void {
      const retReg = s.r0
      const endLabel = newLabelName()
      const leftReg = s.r0 = newRegister()
      c(node.left, s)
      const op = node.operator
      cg(`MOV`, `${retReg}`, `${leftReg}`)
      if (op === '&&') {
        cg(`JF`, `${leftReg}`, `${endLabel}`)
      } else {
        cg(`JIF`, `${leftReg}`, `${endLabel}`)
      }
      const rightReg = s.r0 = newRegister()
      c(node.right, s)
      cg(op === '&&' ? `AND` : `OR`, `${retReg}`, `${rightReg}`)
      cg('LABEL', `${endLabel}:`)
    },

    ForStatement(node: et.ForStatement, s: any, c: any): any {
      const [newReg, freeReg] = newRegisterController()
      const startLabel = newLabelName()
      const endLabel = newLabelName()
      pushLoopEndLabels(endLabel)
      // init
      if (node.init) {
        c(node.init, s)
      }
      cg(`LABEL`, `${ startLabel }:`)
      // test
      if (node.test) {
        const testReg = s.r0 = newReg()
        c(node.test, s)
        cg(`JF`, `${ testReg }`, `${ endLabel }`)
      }
      // body
      s.forEndLabel = endLabel
      s.r0 = null
      c(node.body, s)
      // update
      if (node.update) {
        s.r0 = null
        c(node.update, s)
        cg(`JMP`, `${ startLabel }`)
      }
      // end
      cg(`LABEL`, `${ endLabel }:`)
      popLoopEndLabels()
      freeReg()
    },

    BreakStatement(node: et.BreakStatement, s: any, c: any): any {
      const endLabel = getCurrentLoopEndLabel()
      if (!endLabel) {
        throw new Error("Not end label, cannot use `break` here.")
      }
      // cg(`JMP ${endLabel} (break)`)
      cg(`JMP`, `${endLabel}`)
    },

    UpdateExpression(node: et.UpdateExpression, s: any, c: any): any {
      const op = node.operator
      const [newReg, freeReg] = newRegisterController()
      const reg = newReg()
      getValueOfNode(node.argument, reg, s, c)
      if (op === '++') {
        cg(`ADD`, `${reg}`, `1`)
      } else if (op === '--') {
        cg(`SUB`, `${reg}`, `1`)
      }
      setValueToNode(node.argument, reg, s, c)
      freeReg()
    },

    ObjectExpression(node: et.ObjectExpression, s: any, c: any): any {
      const [newReg, freeReg] = newRegisterController()
      const reg = s.r0 || newReg()
      cg(`NEW_OBJ`, `${reg}`)
      for (const prop of node.properties) {
        s.r0 = reg
        c(prop, s)
      }
      freeReg()
    },

    ArrayExpression(node: et.ArrayExpression, s: any, c: any): any {
      const [newReg, freeReg] = newRegisterController()
      const reg = s.r0 || newReg()
      cg(`NEW_ARR`, `${reg}`)
      node.elements.forEach((el: any, i: number): void => {
        const valReg = s.r0 = newRegister()
        c(el, s)
        cg(`SET_KEY`, `${reg}`, `${i}`, `${valReg}`)
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
        key = node.key.name
      } else if (node.key.type === "Literal") {
        key = node.key.value
      }
      getValueOfNode(node.value, valReg, s, c)
      cg(`SET_KEY`, `${objReg}`, `"${key}"`, `${valReg}`)
      freeReg()
    },

    ReturnStatement(node: et.ReturnStatement, s: any, c: any): any {
      const reg = s.r0 = newRegister()
      c(node.argument, s)
      cg(`MOV`, `$RET`, `${reg}`)
      freeRegister()
    },
  })

  state.maxRegister = maxRegister
}

const getFunctionDecleration = (func: IFunction): string => {
  const name = func.name
  const params = func.body.params.map((p: any): string => p.name).join(', ')
  return `func ${name}(${params}) {`
}

export const generateAssemblyFromJs = (jsCode: string): string => {
  const ret = codegen.parse(jsCode)
  state = createNewState()
  parseToCode(ret)

  while (state.functions.length > 0) {
    state.isGlobal = false
    state.maxRegister = 0
    const funcAst = state.functions.shift()
    state.params = funcAst!.body.params.reduce((o, param): any => {
      o[(param as et.Identifier).name] = VariableType.VARIABLE
      return o
    }, {})
    state.locals = {}
    state.currentScope = { params: state.params, locals: state.locals }
    state.codes.push(getFunctionDecleration(funcAst!))
    state.scopes = funcAst!.scopes
    // console.log(funcAst?.name, funcAst?.scopes)
    const codeLen = state.codes.length
    const registersCodes: string[] = []
    parseToCode(funcAst?.body.body)
    for (let i = 0; i < state.maxRegister; i++) {
      registersCodes.push(`VAR %r${i}`)
    }
    state.codes.splice(codeLen, 0, ...registersCodes)
    state.codes.push('}')
  }
  state.codes = state.codes.map((s: string | (() => string[])): string[] => {
    const f = (c: string): string => {
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
  return state.codes.join("")
// tslint:disable-next-line: max-file-line-count
}
