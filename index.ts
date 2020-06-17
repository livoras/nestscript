import { I, IOperatantType, IOperant, operantBytesSize } from './vm'
import { concatBuffer, stringToArrayBuffer, arrayBufferToString } from './utils'
import fs = require('fs')
import { parseCode } from './parser'

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
interface IFuncInfo {
  name: string,
  symbols: any,
  codes: string[][],
  numArgs: number,
  localSize: number,
  globals: any,
  ip?: number,
  index?: number,
  bytecodes?: ArrayBuffer,
  labels?: any,
}


// tslint:disable-next-line: no-big-function
export const parseCodeToProgram = (program: string): Buffer => {
  const funcsTable = {}
  const globalSymbols = {}
  const stringTable: string[] = []
  const stringIndex: any = {}
  const funcs = program
    .trim()
    .match(/func[\s\S]+?\}/g) || []

  // 1 pass
  const funcsInfo: any[] = []
  let globalSize: number = 0
  funcs.forEach((func: string): void => {
    if (!func) { return }
    const funcInfo = parseFunction(func)
    funcInfo.index = funcsInfo.length
    funcsInfo.push(funcInfo)
    funcsTable[funcInfo.name] = funcInfo
    funcInfo.globals.forEach((g: string): void => {
      globalSymbols[g] = globalSize++
    })
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
        code.forEach((o: any, i: number): void => {
          if (i === 0) { return }

          if (
            ['JMP'].includes(op) ||
            (['JE', 'JNE', 'JG', 'JL', 'JGE', 'JLE'].includes(op) && i === 3)
          ) {
            code[i] = {
              type: IOperatantType.ADDRESS,
              value: funcInfo.labels[code[i]],
            }
            return
          }

          /** 寄存器 */
          let regIndex = symbols[o]
          if (regIndex !== undefined) {
            code[i] = {
              type: IOperatantType.REGISTER,
              value: regIndex,
            }
            return
          }

          /** 全局 */
          regIndex = globalSymbols[o]
          if (regIndex !== undefined) {
            code[i] = {
              type: IOperatantType.GLOBAL,
              value: regIndex + 1, // 留一位给 RET
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
            const str = o.replace(/^[\'\"]|[\'\"]$/g, '')
            const index = stringIndex[str]
            code[i] = {
              type: IOperatantType.STRING,
              value: index === undefined
                ? stringTable.length
                : index,
            }
            if (index === undefined) {
              stringIndex[str] = stringTable.length
              stringTable.push(str)
            }
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
    console.log('CODES => ', funcInfo.codes)
  })

  const stream = parseToStream(funcsInfo, stringTable, globalSize)
  return Buffer.from(stream)
}

/**
 * header
 * codes (op(1) operantType(1) value(??) oprantType value | ...)
 * functionTable (ip(1) | numArgs(2))
 * stringTable (len(4) str | len(4) str)
 */
// tslint:disable-next-line: no-big-function
const parseToStream = (funcsInfo: IFuncInfo[], strings: string[], globalsSize: number): ArrayBuffer => {
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
    const codeAdresses: number[] = []
    const labelBufferIndex: { codeIndex: number, bufferIndex: number }[] = []
    funcInfo.codes.forEach((code: any[], i: number): void => {
      codeAdresses.push(buffer.byteLength)

      const cmd = code[0]
      const setBuf = new Uint8Array(1)
      setBuf[0] = cmd
      appendBuffer(setBuf.buffer)
      console.log("===>", cmd)

      code.forEach((o: IOperant, j: number): void => {
        if (j === 0) { return }
        const operantBuf = new ArrayBuffer(operantBytesSize[o.type])
        const operantTypeBuf = new Uint8Array(1)
        operantTypeBuf[0] = o.type
        appendBuffer(operantTypeBuf.buffer)
        switch (o.type) {
        case IOperatantType.REGISTER:
        case IOperatantType.GLOBAL:
        case IOperatantType.ARG_COUNT:
        case IOperatantType.FUNCTION_INDEX:
        case IOperatantType.STRING: {
          const v = new Uint16Array(operantBuf)
          v[0] = o.value
          appendBuffer(operantBuf)
          break
        }
        case IOperatantType.ADDRESS: {
          labelBufferIndex.push({ codeIndex: o.value, bufferIndex: buffer.byteLength })
          appendBuffer(operantBuf)
          break
        }
        case IOperatantType.NUMBER: {
          const v = new Float64Array(operantBuf)
          v[0] = o.value
          appendBuffer(operantBuf)
          break
        }
        case IOperatantType.RETURN_VALUE:
          break
        default:
          throw new Error("Unknown operant " + o.type)
        }
      })
    })

    // Replace label
    labelBufferIndex.forEach((label): void => {
      const buf = new Uint32Array(1)
      const address = codeAdresses[label.codeIndex]
      buf[0] = address
      const buf2 = new Uint8Array(buf.buffer)
      const funBuf = new Uint8Array(buffer)
      buf2.forEach((b: number, i: number): void => {
        funBuf.set([b], label.bufferIndex + i)
      })
      // console.log('----REPLACE ~~~~~~', buf)
    })
    // console.log('LABAL s', codeAdresses, labelBufferIndex)
  })
  // console.log('codes length ->', buffer.byteLength)

  /**
   * Header:
   *
   * mainFunctionIndex: 4
   * funcionTableBasicIndex: 4
   * stringTableBasicIndex: 4
   * globalsSize: 4
   */
  const FUNC_SIZE = 4 + 2 + 2 // ip + numArgs + localSize
  const funcionTableBasicIndex = 4 * 4 + buffer.byteLength
  const stringTableBasicIndex = funcionTableBasicIndex + FUNC_SIZE * funcsInfo.length
  const headerView = new Uint32Array(4)
  headerView[0] = mainFunctionIndex
  headerView[1] = funcionTableBasicIndex
  headerView[2] = stringTableBasicIndex
  headerView[3] = globalsSize
  buffer = concatBuffer(headerView.buffer, buffer)
  // console.log('---> main', mainFunctionIndex, funcionTableBasicIndex, buffer.byteLength)

  /** Function Table */
  funcsInfo.forEach((funcInfo: IFuncInfo, i: number): void => {
    const ipBuf = new Uint32Array(1)
    const numArgsAndLocal = new Uint16Array(2)
    ipBuf[0] = funcInfo.ip!
    numArgsAndLocal[0] = funcInfo.numArgs
    numArgsAndLocal[1] = funcInfo.localSize
    const funcBuf = concatBuffer(ipBuf.buffer, numArgsAndLocal.buffer)
    buffer = concatBuffer(buffer, funcBuf)
    // console.log('FUNCTION -> ', funcInfo.ip, funcInfo.localSize)
  })
  // console.log('string table index ->', buffer.byteLength)

  /** append string buffer */
  // console.log(arrayBufferToString(stringTable.buffer), "???")
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
  const body = parseCode(caps![3])

  const vars = body.filter((stat: string[]): boolean => stat[0] === 'VAR')
  const globals = body
    .filter((stat: string[]): boolean => stat[0] === 'GLOBAL')
    .map((stat: string[]): string => stat[1])
  const codes = body.filter((stat: string[]): boolean => stat[0] !== 'VAR' && stat[0] !== 'GLOBAL')
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

  const labels: any = {}
  const codesWithoutLabel: string[][] = []
  codes.forEach((code: string[]): void => {
    if (code[0] === 'LABEL') {
      labels[code[1]] = codesWithoutLabel.length
    } else {
      codesWithoutLabel.push(code)
    }
  })
  console.log('===>', funcName, codesWithoutLabel, labels)

  return {
    name: funcName,
    numArgs: args.length,
    symbols,
    codes: codesWithoutLabel,
    localSize: vars.length,
    globals,
    labels,
  }
}
