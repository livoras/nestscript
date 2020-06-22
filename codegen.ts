/**
 * 通过 acorn parser 解析 JS，然后将 JS 转化成 nestscript IR
 */

const acorn = require("acorn")
const walk = require("acorn-walk")
import {
  ForStatement,
  ForInStatement,
  ForOfStatement,

  Program,
  Literal,
  VariableDeclaration,
  VariableDeclarator,
  FunctionDeclaration,
  ArrowFunctionExpression,
} from "estree"

const testCode = `
const main = () => {
  console.log(fib(5))
  for (let i = 0; i < 20; i++) {
    if (i % 2 === 0) {
      console.log(fib(i))
    }
  }
}

function fib(n) {
  if (n < 3) { return 1 }
  let i = 1
  let j = 1
  n = n - 2
  while (n-- > 0) {
    let tmp = i
    let j = i + j
    let i = j
  }
  return j
}
`

class Codegen {
  public parse(code: string): Program {
    return acorn.parse(code)
  }
}

const codegen = new Codegen()
const ret = codegen.parse(testCode)
walk.recursive(ret, {
  labelIndex: 0,
}, {
  VariableDeclaration: (node: VariableDeclaration, state: any, c: any): void => {
    console.log("VARIABLE...", node)
    node.declarations.forEach((n: any): void => c(n, state))
  },

  VariableDeclarator: (node: VariableDeclarator, state: any, c: any): void => {
    c(node.init, state)
  },

  FunctionDeclaration(node: FunctionDeclaration, state: any, c: any): any {
    console.log("Function...", node)
    c(node.body, state)
  },

  Literal: (node: Literal): void => {
    // console.log('-->', node)
  },

  ArrowFunctionExpression(node: ArrowFunctionExpression, state: any, c: any): void {
    console.log("ARROW FUNCTION...", node)
    c(node.body, state)
  },
})

