/**
 * 通过 acorn parser 解析 JS，然后将 JS 转化成 nestscript IR
 */

const acorn = require("acorn")
const walk = require("acorn-walk")
import * as et from "estree"

const enum GlobalsType {
  FUNCTION,
  VARIABLE,
}

interface IFunction {
  name: string,
  body: et.FunctionExpression | et.ArrowFunctionExpression | et.FunctionDeclaration,
}

interface IState {
  tmpVariableName: string,
  globals: any,
  locals: any,
  isGlobal: boolean,
  labelIndex: number,
  functionIndex: number,
  functionTable: any,
  functions: IFunction[],
  codes: string[],
  r0: string,
  r1: string,
  r2: string,
  maxRegister: number,
  currentFunctionName: string,

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
const state: IState = {
  tmpVariableName: '',
  isGlobal: true,
  globals: {},
  locals: {},
  labelIndex: 0,
  functionIndex: 0,
  functions: [],
  functionTable: {},
  codes: [],
  r0: '', // 寄存器的名字
  r1: '', // 寄存器的名字
  r2: '', //
  maxRegister: 0,
  currentFunctionName: '',
}
// tslint:disable-next-line: no-big-function
const parseToCode = (ast: any): void => {
  const newFunctionName = (): string => {
    state.currentFunctionName = `___f___${state.functionIndex++}`
    return state.currentFunctionName
  }

  const cg = (c: string): any => {
    const isJump = (cc: string): boolean => /^JMP/.test(cc)
    // 不要同时跳转两次
    if (isJump(c) && isJump(state.codes[state.codes.length - 1])) { return }
    state.codes.push(c)
  }

  const parseFunc = (node: et.FunctionExpression | et.ArrowFunctionExpression, name?: string): string => {
    const funcName = name || newFunctionName()
    state.globals[funcName] = GlobalsType.FUNCTION
    state.functions.push({ name: funcName, body: node })
    state.functionTable[funcName] = node
    return funcName
  }

  let registerCounter = 0
  let maxRegister = 0

  const newLabelName = (): string => `_l${state.labelIndex++}_`

  const newRegister = (): string => {
    const r = `_r${registerCounter++}_`
    maxRegister = Math.max(maxRegister, registerCounter)
    return r
  }
  const freeRegister = (): number => registerCounter--

  const newRegisterController = (): [any, any] => {
    let count = 0
    return [(): string => {
      count++
      return newRegister()
    }, (): void => {
      for (let i = 0; i < count; i++) {
        freeRegister()
      }
    }]
  }

  // const setIdentifierToRegister = (reg: string, id: string, s: any): void => {
  //   if (s.globals[id] || s.locals[id]) {
  //     s.codes.push(`MOV ${reg} ${id}`)
  //   } else {
  //     s.codes.push(`MOV_CTX ${reg} "${id}"`)
  //   }
  // }

  const callIdentifier = (id: string, numArgs: number, s: IState): void => {
    if (s.functionTable[id]) {
      cg(`CALL ${id} ${numArgs}`)
    } else {
      // const reg = newRegister()
      cg(`CALL_CTX "${id}" ${numArgs}`)
      // freeRegister()
    }
  }

  const hasVars = (name: string, s: any): boolean => {
    return s.globals[name] || s.locals[name]
  }

  const setValueToNode = (node: any, reg: string, s: any, c: any): any => {
    if (node.type === 'MemberExpression') {
      // s.r0 = newReg()
      s.r0 = null
      const objReg = s.r1 = newRegister()
      const keyReg = s.r2 = newRegister()
      c(node, s)
      cg(`SET_KEY ${objReg} ${keyReg} ${reg}`)
      freeRegister()
      freeRegister()
    } else if (node.type === 'Identifier') {
      // setIdentifierToRegister(node.name, reg, s)
      // s.codes.push(`MOV ${left.name} ${rightReg}`)
      if (hasVars(node.name, s)) {
        cg(`MOV ${node.name} ${reg}`)
      } else {
        cg(`SET_CTX "${node.name}" ${reg}`)
      }
    } else {
      throw new Error('Unprocessed assignment')
    }
  }

  const getValueOfNode = (node: any, reg: string, s: any, c: any): any => {
    if (node.type === 'Identifier') {
      if (hasVars(node.name, s)) {
        cg(`MOV ${reg} ${node.name}`)
      } else {
        cg(`MOV_CTX ${reg} "${node.name}"`)
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

    VariableDeclarator: (node: et.VariableDeclarator, s: any, c: any): void => {
      // console.log(node)
      let reg
      if (node.id.type === 'Identifier') {
        if (node.init?.type === 'FunctionExpression' || node.init?.type === 'ArrowFunctionExpression') {
          parseFunc(node.init, state.isGlobal ? node.id.name : '')
          // console.log("--->", funcName)
          return
        }
        if (state.isGlobal) {
          cg(`GLOBAL ${node.id.name}`)
          s.globals[node.id.name] = GlobalsType.VARIABLE
        } else {
          cg(`VAR ${node.id.name}`)
          s.locals[node.id.name] = GlobalsType.VARIABLE
        }
        reg = node.id.name
      } else {
        // TODO
      }
      s.r0 = reg
      c(node.init, s)
    },

    FunctionDeclaration(node: et.FunctionDeclaration, s: any, c: any): any {
      state.functions.push({ name: node.id!.name, body: node })
      state.functionTable[node.id!.name] = node
    },

    CallExpression(node: et.CallExpression, s: any, c: any): any {
      const retReg = s.r0
      const args = [...node.arguments]
      args.reverse()
      for (const arg of args) {
        let reg
        if (arg.type === 'Identifier') {
          reg = arg.name
        } else {
          reg = s.r0 = newRegister()
          c(arg, s)
          if (
            arg.type === 'FunctionExpression' ||
            arg.type === 'ArrowFunctionExpression'
          ) {
            // console.log("++++++++++++++++><", arg, s.currentFunctionName)
            cg(`CALLBACK ${reg} ${s.currentFunctionName}`)
          }
          freeRegister()
        }
        // console.log('---->>', reg, node.callee)
        cg(`PUSH ${reg}`)
      }

      if (node.callee.type === "MemberExpression") {
        s.r0 = null
        const objReg = s.r1 = newRegister()
        const keyReg = s.r2 = newRegister()
        c(node.callee, s)
        cg(`CALL_VAR ${objReg} ${keyReg} ${node.arguments.length}`)
        freeRegister()
        freeRegister()
      } else if (node.callee.type === "Identifier") {
        callIdentifier(node.callee.name, node.arguments.length, s)
        // s.codes.push(`CALL ${node.callee.name} ${node.arguments.length}`)
      }
      if (retReg) {
        cg(`MOV ${retReg} RET`)
      }
    },

    Literal: (node: et.Literal, s: any): void => {
      let val
      if (node.value === true) {
        val = 1
      } else if (node.value === false) {
        val = 0
      } else {
        val = node.raw
      }
      cg(`MOV ${s.r0} ${val}`)
    },

    ArrowFunctionExpression(node: et.ArrowFunctionExpression, s: any, c: any): any {
      parseFunc(node)
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
        // console.log(objReg, '---?', node.object.name)
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
          cg(`MOV ${keyReg} ${node.property.name}`)
        } else {
          cg(`MOV ${keyReg} "${node.property.name}"`)
        }
      } else {
        s.r0 = keyReg
        c(node.property, s)
      }

      if (valReg) {
        cg(`MOV_PROP ${valReg} ${objReg} ${keyReg}`)
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
      // if (right.type === 'Identifier') {
      //   rightReg = right.name
      // } else {
      //   s.r0 = rightReg = newReg()
      //   c(right, s)
      // }
      getValueOfNode(right, rightReg, s, c)
      setValueToNode(left, rightReg, s, c)
      // if (left.type === 'MemberExpression') {
      //   // s.r0 = newReg()
      //   s.r0 = null
      //   const objReg = s.r1 = newReg()
      //   const keyReg = s.r2 = newReg()
      //   c(left, s)
      //   s.codes.push(`SET_KEY ${objReg} ${keyReg} ${rightReg}`)
      // } else if (left.type === 'Identifier') {
      //   setIdentifierToRegister(left.name, rightReg, s)
      //   // s.codes.push(`MOV ${left.name} ${rightReg}`)
      // } else {
      //   throw new Error('Unprocessed assignment')
      // }
      freeReg()
    },

    BinaryExpression(node: et.BinaryExpression, s: any, c: any): void {
      const [newReg, freeReg] = newRegisterController()

      const leftReg = s.r0 || newReg()
      const rightReg = newReg()

      getValueOfNode(node.left, leftReg, s, c)
      getValueOfNode(node.right, rightReg, s, c)
      // if (node.left.type === 'Identifier') {
      //   leftReg = node.left.name
      // } else {
      //   s.r0 = leftReg
      //   c(node.left, s)
      // }

      // if (node.right.type === 'Identifier') {
      //   rightReg = node.right.name
      // } else {
      //   s.r0 = rightReg = newReg()
      //   c(node.right, s)
      // }

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
        throw new Error(`${op} is not implemented.`)
      }
      cg(`${op} ${leftReg} ${rightReg}`)
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

      cg(`JF ${testReg} ${nextLabel}`)
      c(node.consequent, s)
      cg(`JMP ${endLabel}`)

      cg(`LABEL ${nextLabel}:`)
      if (node.alternate) {
        c(node.alternate, s)
      }

      // console.log("THE FUCKING LABEL", endLabel)
      if (!hasEndLabel) {
        cg(`LABEL ${endLabel}:`)
        delete s.endLabel
      }

      freeReg()
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
      cg(`LABEL ${startLabel}:`)
      // test
      if (node.test) {
        const testReg = s.r0 = newReg()
        // console.log("---> test reg", testReg)
        c(node.test, s)
        cg(`JF ${testReg} ${endLabel}`)
      }
      // body
      s.forEndLabel = endLabel
      s.r0 = null
      c(node.body, s)
      // update
      if (node.update) {
        s.r0 = null
        c(node.update, s)
        cg(`JMP ${startLabel}`)
      }
      // end
      cg(`LABEL ${endLabel}:`)
      popLoopEndLabels()
      freeReg()
    },

    BreakStatement(node: et.BreakStatement, s: any, c: any): any {
      const endLabel = getCurrentLoopEndLabel()
      if (!endLabel) {
        throw new Error("Not end label, cannot use `break` here.")
      }
      // cg(`JMP ${endLabel} (break)`)
      cg(`JMP ${endLabel}`)
    },

    UpdateExpression(node: et.UpdateExpression, s: any, c: any): any {
      const op = node.operator
      const [newReg, freeReg] = newRegisterController()
      const reg = newReg()
      getValueOfNode(node.argument, reg, s, c)
      if (op === '++') {
        cg(`ADD ${reg} 1`)
      } else if (op === '--') {
        cg(`SUB ${reg} 1`)
      }
      setValueToNode(node.argument, reg, s, c)
      freeReg()
    },

    ObjectExpression(node: et.ObjectExpression, s: any, c: any): any {
      const [newReg, freeReg] = newRegisterController()
      const reg = s.r0 || newReg()
      cg(`NEW_OBJ ${reg}`)
      for (const prop of node.properties) {
        s.r0 = reg
        c(prop, s)
      }
      freeReg()
    },

    ArrayExpression(node: et.ArrayExpression, s: any, c: any): any {
      const [newReg, freeReg] = newRegisterController()
      const reg = s.r0 || newReg()
      cg(`NEW_ARR ${reg}`)
      node.elements.forEach((el: any, i: number): void => {
        const valReg = s.r0 = newRegister()
        c(el, s)
        cg(`SET_KEY ${reg} ${i} ${valReg}`)
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
      // getValueOfNode(node.key, keyReg, s, c)
      getValueOfNode(node.value, valReg, s, c)
      cg(`SET_KEY ${objReg} "${key}" ${valReg}`)
      freeReg()
    },

    // ExpressionStatement(node: et.ExpressionStatement, s: any, c: any): void {
    //   console.log('=-->', node.expression)
    // },
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
  parseToCode(ret)

  while (state.functions.length > 0) {
    state.isGlobal = false
    state.maxRegister = 0
    const funcAst = state.functions.shift()
    state.locals = funcAst!.body.params.reduce((o, param): any => {
      o[(param as et.Identifier).name] = GlobalsType.VARIABLE
      return o
    }, {})
    // console.log(funcAst?.body.body, '-->')
    state.codes.push(getFunctionDecleration(funcAst!))
    const codeLen = state.codes.length
    const registersCodes: string[] = []
    parseToCode(funcAst?.body.body)
    for (let i = 0; i < state.maxRegister; i++) {
      registersCodes.push(`VAR _r${i}_`)
    }
    state.codes.splice(codeLen, 0, ...registersCodes)
    state.codes.push('}')
    // state.codes.push('}')
  }
  state.codes = state.codes.map((s: string): string => {
    if (s.startsWith('func') || s.startsWith('LABEL') || s.startsWith('}')) { return s + '\n' }
    return `    ${s};\n`
  })
  return state.codes.join("")
}
