import * as ts from "typescript"

export const exec = (source: string , that?: any, context?: any, callback?: (ret: any) => void): void => {
  const result = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } })
  console.log(result)
}

/**
 * 
 * MOV dest src 赋值给变量
 * 
 * ADD d s
 * SUB d s
 * DIV d s
 * MOD d s
 * EXP d power
 * NEG
 * INC
 * DEC
 * 
 * 
 * AND d s
 * OR ..
 * XOR ..
 * NOT d
 * SHL d count
 * SHR d count
 * 
 * JMP label
 * JE op1 op1 label
 * JNE op1 op1 label
 * JG op1 op2 label
 * JL op1 op2 label
 * JGE op1 op2 label
 * JLE op1 op2 label
 * PUSH src 
 * POP dest
 * CALL function numArgs
 * RET
 * 
 * PAUSE ms
 * EXIT code
 */

 /**
  * Func Add {
  *   PARAM Y
  *   PARAM X
  *   VAR SUM
  *   MOV SUM, X
  *   ADD SUM, Y
  *   MOV _RET_VAL, SUM
  * }
  * VAR
  * PUSH
  * POP
  * LABEL
  */

/**
 * 
 * 
 */

/** 函数调用的堆栈结构
 * X
 * Y
 * Z
 * ARRAY...
 * - old frame pointer
 * - return instruction pointer
 * PARAM1
 * PARAM2
 */

enum i {
 MOV, ADD, SUB, DIV, MOD,
 EXP, NEG, INC, DEC, AND,
 OR, XOR, NOT, SHL, SHR,
 JMP, JE, JNE, JG, JL,
 JGE, JLE, PUSH, POP, CALL,
 RET, AUSE, EXIT,
} 

/**
 *
 * @param commandSource
 * @param that
 */
const testProgram = `
func main() {
  MOV 1;
  MOV 5;
  ADD;
  MOV 3;
  CALL sub;
  RET;
}

func sub(a, b) {
  MOV a;
  MOV b;
  SUB;
  RET;
}
`

class Program {
  constructor(public globals: any, public instructions: any[]) {

  }
}

const parseCodeToProgram = (program: string): Program => {
  const ins: any[] = []
  const funcsTable = {}
  const symbols = {}
  const funcs = program
    .trim()
    .match(/func[\s\S]+?\}/g) || []
  console.log(funcs)

  funcs.forEach((func: string): void => {
    if (!func) { return }
    const [funcName, args, body] = parseFunction(func)
    funcsTable[funcName] = {
      ip: ins.length,
      args,
    }
    body.forEach((stat: string): void => {
      ins.push(...parseInstruction(stat))
    })
  })

  return new Program({ ...funcsTable }, ins)
}

const parseFunction = (func: string): [string, string[], string[]] => {
  const caps = func.match(/func\s+(\w[\w\d_]+)\s*?\(([\s\S]*)\)\s*?\{([\s\S]+?)\n\}/)
  const funcName = caps![1]
  const args = caps![2]
    .split(/\s*,\s*/g)
    .filter((s: string): boolean => !!s)
  const body = caps![3]
    .trim()
    .split(';')
    .map((s: string): string => s.trim())
    .filter((s: string): boolean => !!s)
  return [funcName, args, body]
}

const parseInstruction = (stat: string): any[] => {
  const ins: any[] = []
  const cmds = stat.split(/\s+/g)
  const cmd = cmds.shift()
  const cmdEnum = i[cmd as string]
  if (cmdEnum === undefined) {
    throw new Error('Unknow command ' + cmd)
  }
  ins.push(cmdEnum)
  ins.push(...cmds)
  return ins
}

const pg = parseCodeToProgram(testProgram)
console.log(pg)

// /**
//  * PUSH 1
//  * PUSH 2
//  * ADD
//  *
//  * CALL_WITH obj_name func_name var1 var2 var3
//  */
// export const execCommand = (commandSource: string, that?: any): void => {
//   const stack = []
//   const ip = 0
//   const sp = 0
//   while (ip < commandSource.)
// }
