import * as ts from "typescript"
import { I, createVMFromFile, IOperatantType, IOperant, operantBytesSize } from './vm'
import { concatBuffer, stringToArrayBuffer } from './utils'
import fs = require('fs')

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
  MOV R0 a;
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
  numArgs: number,
  localSize: number,
  ip?: number,
  index?: number,
  bytecodes?: ArrayBuffer,
}


// tslint:disable-next-line: no-big-function
const parseCodeToProgram = (program: string): void => {
  const ins: any[] = []
  const funcsTable = {}
  const globalSymbols = {}
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
      console.log('fun', funcInfo.name, op, I[op])
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
        code.forEach((o: any, i: number): void => {
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
            stringTable.push(o.replace(/^[\'\"]|[\'\"]$/g, ''))
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
  fs.writeFileSync('bin', Buffer.from(stream))

  // test
  const vm = createVMFromFile("bin")
  vm.run()
}

/**
 * header
 * codes (op(1) operantType(1) value(??) oprantType value | ...)
 * functionTable (ip(1) | numArgs(2))
 * stringTable (len(4) str | len(4) str)
 */
// tslint:disable-next-line: no-big-function
const parseToStream = (funcsInfo: IFuncInfo[], strings: string[]): ArrayBuffer => {
  const stringTable = parseStringTableToBuffer(strings)

  let buffer = new ArrayBuffer(0)
  let mainFunctionIndex: number = 0
  // tslint:disable-next-line: no-big-function
  funcsInfo.forEach((funcInfo: IFuncInfo): void => {
    funcInfo.ip = buffer.byteLength

    if (funcInfo.name === 'main') {
      mainFunctionIndex = funcInfo.index!
    }

    funcInfo.bytecodes = new ArrayBuffer(0)
    const appendBuffer = (buf: ArrayBuffer): void => {
      buffer = concatBuffer(buffer, buf)
      funcInfo.bytecodes = concatBuffer(funcInfo.bytecodes!, buf)
    }
    funcInfo.codes.forEach((code: any[], i: number): void => {

      const cmd = code[0]
      const setBuf = new Uint8Array(1)
      console.log('fun code', funcInfo.name, cmd)
      setBuf[0] = cmd
      appendBuffer(setBuf.buffer)
      if (funcInfo.name === 'main' && i === 0) {
        console.log('first com', setBuf)
        console.log('start address', funcInfo.ip)
      }

      code.forEach((o: IOperant, j: number): void => {
        if (j === 0) { return }
        const operantBuf = new ArrayBuffer(operantBytesSize[o.type])
        const operantTypeBuf = new Uint8Array(1)
        operantTypeBuf[0] = o.type
        if (funcInfo.name === 'main' && i === 0 && o.type) {
          console.log('main first op type', operantTypeBuf)
        }
        appendBuffer(operantTypeBuf.buffer)
        switch (o.type) {
        case IOperatantType.REGISTER:
        case IOperatantType.ARG_COUNT:
        case IOperatantType.FUNCTION_INDEX:
        case IOperatantType.STRING:
          const v = new Uint16Array(operantBuf)
          v[0] = o.value
          appendBuffer(operantBuf)
          break
        case IOperatantType.NUMBER:
          const v2 = new Float64Array(operantBuf)
          v2[0] = o.value
          appendBuffer(operantBuf)
          break
        case IOperatantType.RETURN_VALUE:
          break
        default:
          throw new Error("Unknown operant " + o.type)
        }
      })
    })
  })
  console.log('codes length ->', buffer.byteLength)

  /**
   * Header:
   *
   * mainFunctionIndex: 1
   * funcionTableBasicIndex: 1
   * stringTableBasicIndex: 1
   * globalsSize: 2
   */
  const FUNC_SIZE = 1 + 2 + 2 // ip + numArgs + localSize
  const globalsSize = 0
  const funcionTableBasicIndex = 5 + buffer.byteLength
  const stringTableBasicIndex = funcionTableBasicIndex + FUNC_SIZE * funcsInfo.length
  const headerView = new Uint8Array(3)
  headerView[0] = mainFunctionIndex
  headerView[1] = funcionTableBasicIndex
  headerView[2] = stringTableBasicIndex
  const globalView = new Uint16Array(1)
  globalView[0] = globalsSize
  const headerBuf = concatBuffer(headerView.buffer, globalView.buffer)
  buffer = concatBuffer(headerBuf, buffer)

  /** Function Table */
  funcsInfo.forEach((funcInfo: IFuncInfo): void => {
    const ipBuf = new Uint8Array(1)
    const numArgsAndLocal = new Uint16Array(2)
    ipBuf[0] = funcInfo.ip!
    numArgsAndLocal[0] = funcInfo.numArgs
    numArgsAndLocal[1] = funcInfo.localSize
    console.log(numArgsAndLocal)
    const funcBuf = concatBuffer(ipBuf.buffer, numArgsAndLocal.buffer)
    buffer = concatBuffer(buffer, funcBuf)
  })

  /** append string buffer */
  buffer = concatBuffer(buffer, stringTable.buffer)

  return buffer
}

const parseStringTableToBuffer = (stringTable: string[]): {
  buffer: ArrayBuffer,
  indexes: { [x in number]: number },
} => {
  /** String Table */
  let strBuf = new ArrayBuffer(0)
  const indexes: any = {}
  stringTable.forEach((str: string, i: number): void => {
    indexes[i] = strBuf.byteLength
    const lenBuf = new Uint32Array(1)
    lenBuf[0] = str.length
    strBuf = concatBuffer(strBuf, lenBuf.buffer)
    strBuf = concatBuffer(strBuf, stringToArrayBuffer(str))
  })
  return {
    buffer: strBuf,
    indexes,
  }
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
    .map((s: string): string[] => s.split(/\s+/g))

  const vars = body.filter((stat: string[]): boolean => stat[0] === 'VAR')
  const codes = body.filter((stat: string[]): boolean => stat[0] !== 'VAR')
  const symbols: any = {}
  vars.forEach((v: string[], i: number): void => {
    symbols[v[1]] = i + 1
  })
  args.forEach((arg: string, i: number): void => {
    symbols[arg] = -3 - i
  })

  if (funcName === 'main') {
    codes.push(['EXIT'])
  } else if (codes[codes.length - 1][0] !== 'RET') {
    codes.push(['RET'])
  }
  console.log(funcName, codes)

  return {
    name: funcName,
    numArgs: args.length,
    symbols,
    codes,
    localSize: vars.length,
  }
}

parseCodeToProgram(testProgram)
