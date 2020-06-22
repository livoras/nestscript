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
walk.recursive(ret, {}, {
  VariableDeclaration: (node: VariableDeclaration, state: any, c: any): void => {
    console.log('-->', node, state)
    // c(node, state)
  },

  FunctionDeclaration(node: FunctionDeclaration, state: any, c: any): any {
    console.log("OJBK", node, state)
    c(node.body, state)
  },


  Literal: (node: Literal): void => {
    // console.log('-->', node)
  },
})

