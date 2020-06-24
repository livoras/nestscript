/**
 * 通过 acorn parser 解析 JS，然后将 JS 转化成 nestscript IR
 */

const acorn = require("acorn")
const walk = require("acorn-walk")
import * as et from "estree"
import { NONAME } from 'dns'
import { stat } from 'fs'

const testCode = `
var name = "Jerry"

const main = () => {
  window.console.log(fib(5))
  for (let i = 0; i < 20; i++) {
    if (i % 2 === 0) {
      console.log(fib(i))
    }
  }
  var c = []
  c['good'] = fib
  Object.keys(c).forEach((k) => {
    console.log(k)
  })
}

function fib(n, a, b, c) {
  if (n < 3) { return 1 }
  let i = 1
  let j = 1
  n = n - 2
  while (n-- > 0) {
    let tmp = i
    let j = i + j
    let i = j
    console.log(a, b, c)
  }
  return j
}
`

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
  functions: IFunction[],
  codes: string[],
}

class Codegen {
  public parse(code: string): et.Program {
    return acorn.parse(code)
  }
}

const codegen = new Codegen()
const ret = codegen.parse(testCode)
const state: IState = {
  tmpVariableName: '',
  isGlobal: true,
  globals: {},
  locals: {},
  labelIndex: 0,
  functionIndex: 0,
  functions: [],
  codes: [],
}
const parseToCode = (ast: any): void => {
  const newFunctionName = (): string => {
    return `__$Function$__${state.functionIndex++}`
  }

  const parseFunc = (node: et.FunctionExpression | et.ArrowFunctionExpression, name?: string): string => {
    const funcName = name || newFunctionName()
    state.globals[funcName] = GlobalsType.FUNCTION
    state.functions.push({ name: funcName, body: node })
    return funcName
  }

  walk.recursive(ast, state, {
    VariableDeclaration: (node: et.VariableDeclaration, s: any, c: any): void => {
      // console.log("VARIABLE...", node)
      node.declarations.forEach((n: any): void => c(n, state))
    },

    VariableDeclarator: (node: et.VariableDeclarator, s: any, c: any): void => {
      // console.log(node)
      if (node.id.type === 'Identifier') {
        if (node.init?.type === 'FunctionExpression' || node.init?.type === 'ArrowFunctionExpression') {
          const funcName = parseFunc(node.init, state.isGlobal ? node.id.name : '')
          console.log("--->", funcName)
          return
        }
        if (state.isGlobal) {
          state.globals[node.id.name] = GlobalsType.VARIABLE
        } else {
          state.locals[node.id.name] = GlobalsType.VARIABLE
        }
      }
      c(node.init, state)
    },

    FunctionDeclaration(node: et.FunctionDeclaration, s: any, c: any): any {
      state.functions.push({ name: node.id!.name, body: node })
    },

    Literal: (node: et.Literal): void => {
      // console.log('-->', node)
    },

    ArrowFunctionExpression(node: et.ArrowFunctionExpression, s: any, c: any): any {
      // console.log("ARROW FUNCTION...", node)
      // console.log(s.tmpVariableName, '++++')
      // c(node.body, state)
    },

    BlockStatement(node: et.BlockStatement, s: any, c: any): void {
      node.body.forEach((n: any): void => c(n, s))
    },

    MemberExpression(node: et.MemberExpression, s: any, c: any): void {
      console.log('THE MEMBER EXPRESSION -> ', node)
    },

    // ExpressionStatement(node: et.ExpressionStatement, s: any, c: any): void {
    //   console.log('=-->', node.expression)
    // },
  })
}

const getFunctionDecleration = (func: IFunction): string => {
  const name = func.name
  const params = func.body.params.map((p: any): string => p.name).join(', ')
  return `func ${name}(${params}) {`
}

parseToCode(ret)

while (state.functions.length > 0) {
  state.isGlobal = false
  const funcAst = state.functions.shift()
  state.codes.push(getFunctionDecleration(funcAst!))
  state.locals = {}
  console.log(funcAst?.body.body, '-->')
  parseToCode(funcAst?.body.body)
  state.codes.push('}')
}

console.log(state)
