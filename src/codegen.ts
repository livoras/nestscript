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

interface BlockLabel {
  startLabel?: string,
  endLabel?: string,
  updateLabel?: string,
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

const codegen = new Codegen()
let state: IState
const createNewState = (): IState => {
  return {
    tmpVariableName: '',
    isGlobal: true,
    globals: {},
    locals: {},
    currentScope: {
      params: {},
      locals: {},
      closureTable: {},
      closureCounter: 0,
    },
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
    state.currentFunctionName = `@@f${state.functionIndex++}`
    return state.currentFunctionName
  }

  const parseFunc = (
    node: et.FunctionExpression | et.ArrowFunctionExpression | et.FunctionDeclaration,
    s: IState,
  ): string => {
    const funcName = newFunctionName()
    s.globals[funcName] = VariableType.FUNCTION
    s.functions.push({
      name: funcName,
      body: node,
      scopes: [...s.scopes, getCurrentScope() || {
        locals: s.locals, params: s.params, closureCounter: 0,
      }],
    })
    s.functionTable[funcName] = node
    if (s.r0) {
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
    if (reg === 'undefined') {
      console.log('===========>', currentScope)
      throw new Error('cannot get register name ' + reg)
    }
    for (const scope of [currentScope, ...scopes].reverse()) {
      if (
        isClosure(scope.locals[reg]) ||
        isClosure(scope.params[reg])
      ) {
        if (!scope.closureTable[reg]) {
          throw new Error(`Cannot found clouse variable ${reg} on closure table`)
        }
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

  const callIdentifier = (id: string, numArgs: number, s: IState, isExpression: boolean): void => {
    if (s.functionTable[id]) {
      cg('CALL', id, numArgs, isExpression)
    } else if (hasVars(id, s)) {
      cg('CALL_REG', id, numArgs, isExpression)
    } else {
      // const reg = newRegister()
      cg('CALL_CTX', `"${id}"`, numArgs, isExpression)
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
      if (reg) {
        if (hasVars(node.name, s)) {
          cg(`MOV`, `${ reg }`, `${ node.name }`)
        } else {
          cg(`MOV_CTX`, `${ reg }`, `"${node.name}"`)
        }
      }
    } else {
      s.r0 = reg
      c(node, s)
    }
  }

  const declareVariable = (s: IState, name: string): void => {
    if (state.isGlobal) {
      cg(`GLOBAL`, name)
      s.globals[name] = VariableType.VARIABLE
    } else {
      cg(`VAR`, `${name}`)
      s.locals[name] = VariableType.VARIABLE
    }
  }

  /** Label 操作 */
  const loopLabels: BlockLabel[] = []
  const pushLoopLabels = (label: BlockLabel): any => loopLabels.push(label)
  const popLoopLabels = (): BlockLabel | undefined => loopLabels.pop()
  const getCurrentLoopLabel = (): BlockLabel => loopLabels[loopLabels.length - 1]

  const blockEndLabels: Map<string, BlockLabel> = new Map()

  /**
   * 表达式结果处理原则：所有没有向下一层传递 s.r0 的都要处理 s.r0
   */
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
        declareVariable(s, node.id.name)
        reg = node.id.name
        // }
      } else {
        throw new Error("Unprocessed node.id.type " + node.id.type + " " + node.id)
      }
      if (node.init) {
        if (node.init?.type === 'Identifier') {
          // if (!state.isGlobal) {
          cg(`MOV`, reg, node.init.name)
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
      s.r0 = node.id?.name
      declareVariable(s, s.r0)
      parseFunc(node, s)
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
        cg(`PUSH`, reg)
      }

      if (node.callee.type === "MemberExpression") {
        s.r0 = null
        const objReg = s.r1 = newRegister()
        const keyReg = s.r2 = newRegister()
        c(node.callee, s)
        cg(`CALL_VAR`, objReg, keyReg, node.arguments.length, isNewExpression)
        freeRegister()
        freeRegister()
      } else if (node.callee.type === "Identifier") {
        callIdentifier(node.callee.name, node.arguments.length, s, isNewExpression)
      } else {
        const ret = s.r0 = newRegister()
        c(node.callee, s)
        freeRegister()
        cg(`CALL_REG`, ret, node.arguments.length, isNewExpression)
      }
      if (retReg) {
        cg(`MOV`, retReg, `$RET`)
      }
      s.r0 = null
    },

    Literal: (node: et.Literal, s: any): void => {
      if ((node as any).regex) {
        const { pattern, flags } = (node as any).regex
        cg('NEW_REG', s.r0, `"${pattern.replace(/"/g, '\\"')}"`, `"${flags}"`)
        return
      }

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
        cg(`${cmd} ${leftReg} ${rightReg}`)
        rightReg = leftReg
      }
      setValueToNode(left, rightReg, s, c)
      if (retReg) {
        cg(`MOV ${retReg} ${rightReg}`)
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
        'typeof': 'TYPE_OF',
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
        cg(`DEL ${objReg} ${keyReg}`)
        s.r1 = null
        s.r2 = null
      }

      freeReg()
    },

    IfStatement(node: et.IfStatement, s: any, c: any): void {
      const [newReg, freeReg] = newRegisterController()
      const retReg = s.r0

      const testReg = newReg()
      const nextLabel = newLabelName()
      const hasEndLabel = !!s.endLabel
      const endLabel = s.endLabel || newLabelName()
      s.endLabel = endLabel

      s.r0 = testReg
      c(node.test, s)

      cg(`JF`, testReg, nextLabel)
      getValueOfNode(node.consequent, retReg, s, c)
      cg(`JMP`, endLabel)

      cg(`LABEL`, `${ nextLabel }:`)
      if (node.alternate) {
        getValueOfNode(node.alternate, retReg, s, c)
      }

      if (!hasEndLabel) {
        cg(`LABEL`, `${ endLabel }:`)
        delete s.endLabel
      }

      freeReg()
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
      // console.log(node)
      if (retReg) {
        cg(`MOV`, `${retReg}`, `${leftReg}`)
      }
      if (op === '&&') {
        cg(`JF`, `${leftReg}`, `${endLabel}`)
      } else {
        cg(`JIF`, `${leftReg}`, `${endLabel}`)
      }
      const rightReg = s.r0 = newReg()
      getValueOfNode(node.right, rightReg, s, c)
      if (retReg) {
        cg(op === '&&' ? `LG_AND` : `LG_OR`, `${retReg}`, `${rightReg}`)
      }
      cg('LABEL', `${endLabel}:`)
      freeReg()
    },

    ForStatement(node: et.ForStatement, s: any, c: any): any {
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
        cg(`JMP`, bodyLabel)
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
      cg(`LABEL`, `${ bodyLabel }:`)
      c(node.body, s)
      // update
      if (node.update) {
        cg('LABEL', `${ updateLabel }:`)
        s.r0 = null
        c(node.update, s)
      }
      cg(`JMP`, `${ startLabel }`)
      // end
      cg(`LABEL`, `${ endLabel }:`)
      popLoopLabels()
      freeReg()
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
        cg('JMP', blockEndLabels.get(name)!.endLabel)
        return
      }

      // console.log(loopLabels)
      const labels = getCurrentLoopLabel()
      // console.log(node)
      if (!labels) {
        throw new Error("Not available labels, cannot use `break` here.")
      }
      const endLabel = labels.endLabel
      // cg(`JMP ${endLabel} (break)`)
      cg(`JMP`, `${endLabel}`)
    },

    ContinueStatement(node: et.ContinueStatement, s: any, c: any): any {
      if (node.label) {
        const { name } = node.label
        if (!blockEndLabels.has(name)) {
          throw new Error(`Label ${name} does not exist.`)
        }
        const blockLabel = blockEndLabels.get(name)!
        // continue label; 语法，如果有 update ，回到 update， 否则回到头
        cg('JMP', blockLabel.updateLabel || blockLabel.startLabel)
        return
      }

      const labels = getCurrentLoopLabel()
      if (!labels) {
        throw new Error("Not available labels, cannot use `continue` here.")
      }
      const { startLabel, updateLabel } = labels
      // cg(`JMP ${endLabel} (break)`)
      cg(`JMP`, `${updateLabel || startLabel}`)
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
        if (!el) {
          return
        }
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
        key = `'${node.key.name}'`
      } else if (node.key.type === "Literal") {
        key = node.key.raw
      }
      getValueOfNode(node.value, valReg, s, c)
      cg(`SET_KEY`, `${objReg}`, key, `${valReg}`)
      // cg(`SET_KEY`, `${objReg}`, `"${key}"`, `${valReg}`)
      freeReg()
    },

    ReturnStatement(node: et.ReturnStatement, s: any, c: any): any {
      const reg = s.r0 = newRegister()
      c(node.argument, s)
      cg(`MOV`, `$RET`, `${reg}`)
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
      cg(`MOV_THIS ${s.r0}`)
    },

    NewExpression(node: et.NewExpression, s: any, c: any): any {
      s.isNewExpression = true
      this.CallExpression(node, s, c)
    },

    LabeledStatement(node: et.LabeledStatement, s: any, c: any): any {
      const labelNode = node.label
      const labelName = labelNode.name
      const endLabel = newLabelName()
      blockEndLabels.set(labelName, { endLabel })
      if (
        node.body.type === 'ForStatement' ||
        node.body.type === 'WhileStatement' ||
        node.body.type === 'DoWhileStatement'
      ) {
        s.jsLabel = labelName
      }
      c(node.body, s)
      blockEndLabels.delete(labelName)
      cg(`LABEL ${endLabel}:`)
    },

    SwitchStatement(node: et.SwitchStatement, s: any, c: any): any {
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
          cg(`JE ${discriminantReg} ${testReg} ${startLabel}`)
          cg(`JMP ${endLabel}`)
        }
        cg(`LABEL ${startLabel}:`)
        cs.consequent.forEach((n: any): void => {
          c(n, s)
        })
        cg(`LABEL ${endLabel}:`)
      })
      cg(`LABEL ${switchEndLabel}:`)
      popLoopLabels()
      freeReg()
    },

    SwitchCase(node: et.SwitchCase, s: any, c: any): any {

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

  const processFunctionAst = (funcBody: et.Node): void => {
    const codeLen = state.codes.length
    const registersCodes: string[] = []
    /** () => a + b，无显式 return 的返回表达式 */
    if (funcBody.type !== 'BlockStatement') {
      state.r0 = '$RET'
    }
    parseToCode(funcBody)
    for (let i = 0; i < state.maxRegister; i++) {
      registersCodes.push(`VAR %r${i}`)
    }
    state.codes.splice(codeLen, 0, ...registersCodes)
    state.codes.push('}')
  }

  state = createNewState()
  state.codes.push('func @@main() {')
  processFunctionAst(ret)

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
    processFunctionAst(funcAst?.body.body!)
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
