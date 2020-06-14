import * as ts from "typescript"
import { I } from './vm'

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
 * - num args
 * PARAM1
 * PARAM2
 */

const testProgram = `
func bar(c, b) {
  VAR R0;
  MOV R0 b;
  SUB R0 c;
  MOV $RET R0;
  RET;
}

func foo(a, b) {
  VAR R0;
  MOV a R0;
  ADD R0 b;
  PUSH R0;
  PUSH 2;
  CALL bar 2;
}

func tow(s1, s2) {
  MOV $RET s1;
  ADD $RET s2;
  RET;
}

func main() {
  CALL foo 0;
  PUSH "HELLO";
  PUSH 'WORLD';
  CALL tow 2;
}

`

interface IFuncInfo {
  name: string,
  symbols: any,
  codes: string[][],
  ip?: number,
  index?: number,
  bytecodes?: ArrayBuffer,
}

const enum IOperatantType {
  REGISTER,
  NUMBER,
  FUNCTION_INDEX,
  STRING,
  ARG_COUNT,
  RETURN_VALUE,
}

interface IOperant {
  type: IOperatantType,
  value: any,
}

const parseCodeToProgram = (program: string): void => {
  const ins: any[] = []
  const funcsTable = {}
  const symbols = {}
  const stringTable: string[] = []
  const funcs = program
    .trim()
    .match(/func[\s\S]+?\}/g) || []

  // 1 pass
  const funcsInfo: any[] = []
  funcs.forEach((func: string): void => {
    if (!func) { return }
    const funcInfo = parseFunction(func)
    funcInfo.index = funcsInfo.length
    funcsInfo.push(funcInfo)
    funcsTable[funcInfo.name] = funcInfo
  })

  // 2 pass
  funcsInfo.forEach((funcInfo: IFuncInfo): void => {
    const symbols = funcInfo.symbols
    funcInfo.codes.forEach((code: any[]): void => {
      const op = code[0]
      code[0] = I[op]
      if (op === 'CALL') {
        code[1] = {
          type: IOperatantType.FUNCTION_INDEX,
          value: funcsTable[code[1]].index,
        }
        code[2] = {
          type: IOperatantType.ARG_COUNT,
          value: +code[2],
        }
      } else {
        code.forEach((o: any, i: number) => {
          if (i === 0) { return }

          /** 寄存器 */
          const regIndex = symbols[o]
          if (regIndex !== undefined) {
            code[i] = {
              type: IOperatantType.REGISTER,
              value: regIndex,
            }
            return
          }

          /** 返回类型 */
          if (o === '$RET') {
            code[i] = {
              type: IOperatantType.RETURN_VALUE,
            }
            return
          }

          /** 字符串 */
          if (o.match(/^\"[\s\S]+\"$/) || o.match(/^\'[\s\S]+\'$/)) {
            code[i] = {
              type: IOperatantType.STRING,
              value: stringTable.length,
            }
            stringTable.push(o)
            return
          }

          /** Number */
          code[i] = {
            type: IOperatantType.NUMBER,
            value: +o,
          }
        })
      }
    })
  })

  const stream = parseToStream(funcsInfo, stringTable)
  console.log(stream)
}

const parseToStream = (funcsInfo: IFuncInfo[], stringTable: string[]) => {
  const buffer = new ArrayBuffer(0)
  funcsInfo.forEach((funcInfo: IFuncInfo) => {
    console.log(funcInfo.codes)
  })
  console.log(funcsInfo, stringTable)
  return buffer
}


const parseFunction = (func: string): IFuncInfo => {
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
    .map((s: string) => s.split(/\s+/g))

  const vars = body.filter((stat: string[]) => stat[0] === 'VAR')
  const codes = body.filter((stat: string[]) => stat[0] !== 'VAR')
  const symbols: any = {}
  vars.forEach((v: string[], i: number): void => {
    symbols[v[1]] = i + 1
  })
  args.forEach((arg: string, i: number): void => {
    symbols[arg] = -3 - i
  })

  if (codes[codes.length - 1][0] !== 'RET') {
    codes.push(['RET'])
  }

  return {
    name: funcName,
    symbols,
    codes,
  }
}

const pg = parseCodeToProgram(testProgram)

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
